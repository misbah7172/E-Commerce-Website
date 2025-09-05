import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProductSchema, insertCategorySchema, insertUserSchema, insertOrderSchema, insertOrderItemSchema, insertAddressSchema, insertCartItemSchema, insertWishlistItemSchema, insertReviewSchema, User } from "@shared/schema";
import { z } from "zod";
import { randomBytes } from "crypto";
import Stripe from "stripe";
import { Client, Environment, LogLevel, OAuthAuthorizationController, OrdersController } from "@paypal/paypal-server-sdk";

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize Stripe
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2023-10-16",
  });

  // Initialize PayPal
  const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET } = process.env;
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    throw new Error("Missing PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET");
  }
  
  const paypalClient = new Client({
    clientCredentialsAuthCredentials: {
      oAuthClientId: PAYPAL_CLIENT_ID,
      oAuthClientSecret: PAYPAL_CLIENT_SECRET,
    },
    timeout: 0,
    environment: process.env.NODE_ENV === "production" ? Environment.Production : Environment.Sandbox,
    logging: {
      logLevel: LogLevel.Info,
      logRequest: { logBody: true },
      logResponse: { logHeaders: true },
    },
  });
  
  const ordersController = new OrdersController(paypalClient);
  const oAuthAuthorizationController = new OAuthAuthorizationController(paypalClient);
  // Middleware to verify Firebase token and get user
  const verifyUser = async (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    try {
      // In production, verify Firebase token here
      const firebaseUid = req.headers['x-firebase-uid']; // For development
      if (!firebaseUid) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      const user = await storage.getUserByFirebaseUid(firebaseUid as string);
      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };

  const requireAdmin = (req: any, res: any, next: any) => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  };

  // Visitor tracking middleware - runs on every request
  app.use(async (req, res, next) => {
    try {
      // Skip tracking for API calls, static assets, and health checks
      if (req.path.startsWith('/api') || 
          req.path.includes('.') || 
          req.path === '/health') {
        return next();
      }

      const clientIp = req.ip || 
                      req.connection.remoteAddress || 
                      req.socket.remoteAddress || 
                      (req.connection as any)?.socket?.remoteAddress ||
                      req.headers['x-forwarded-for'] ||
                      req.headers['x-real-ip'] || 
                      'unknown';
      
      const userAgent = req.headers['user-agent'];
      
      // Track visitor in background (don't wait for completion)
      storage.trackVisitor(String(clientIp), userAgent).catch(console.error);
    } catch (error) {
      console.error('Error in visitor tracking middleware:', error);
    }
    next();
  });

  // Health check endpoint for Render
  app.get("/api/health", async (req, res) => {
    try {
      res.status(200).json({ 
        status: "ok", 
        timestamp: new Date().toISOString(),
        version: "1.0.0",
        message: "Homepage redesign deployed - Sep 5, 2025"
      });
    } catch (error: any) {
      res.status(500).json({ status: "error", error: error.message });
    }
  });

  // Visitor analytics API endpoints
  app.get("/api/analytics/visitors", async (req, res) => {
    try {
      const uniqueCount = await storage.getUniqueVisitorCount();
      const totalCount = await storage.getTotalVisitorCount();
      
      res.json({
        uniqueVisitors: uniqueCount,
        totalVisits: totalCount
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/auth/me", verifyUser, async (req, res) => {
    res.json(req.user);
  });

  // User profile update routes
  app.put("/api/users/:uid/profile-image", verifyUser, async (req, res) => {
    try {
      const { uid } = req.params;
      const { profileImage } = req.body;

      // Verify user can only update their own profile
      if (req.user?.firebaseUid !== uid) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const updatedUser = await storage.updateUserProfileImage(uid, profileImage);
      res.json(updatedUser);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.put("/api/users/:uid", verifyUser, async (req, res) => {
    try {
      const { uid } = req.params;
      const userData = req.body;

      // Verify user can only update their own profile
      if (req.user?.firebaseUid !== uid) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const updatedUser = await storage.updateUserProfile(uid, userData);
      res.json(updatedUser);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Products routes
  app.get("/api/products", async (req, res) => {
    try {
      const {
        categoryId,
        search,
        minPrice,
        maxPrice,
        sortBy,
        sortOrder,
        limit = 20,
        offset = 0
      } = req.query;

      const filters = {
        categoryId: categoryId as string,
        search: search as string,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        sortBy: sortBy as 'name' | 'price' | 'rating' | 'created',
        sortOrder: sortOrder as 'asc' | 'desc',
        limit: Number(limit),
        offset: Number(offset)
      };

      const products = await storage.getProducts(filters);
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.json(product);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/products", verifyUser, requireAdmin, async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.put("/api/products/:id", verifyUser, requireAdmin, async (req, res) => {
    try {
      const product = await storage.updateProduct(req.params.id, req.body);
      res.json(product);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/products/:id", verifyUser, requireAdmin, async (req, res) => {
    try {
      await storage.deleteProduct(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Categories routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/categories", verifyUser, requireAdmin, async (req, res) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Cart routes
  app.get("/api/cart", verifyUser, async (req, res) => {
    try {
      const cartItems = await storage.getCartItems(req.user.id);
      res.json(cartItems);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/cart", verifyUser, async (req, res) => {
    try {
      const cartItemData = insertCartItemSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      const cartItem = await storage.addToCart(cartItemData);
      res.status(201).json(cartItem);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.put("/api/cart/:id", verifyUser, async (req, res) => {
    try {
      const { quantity } = req.body;
      const cartItem = await storage.updateCartItem(req.params.id, quantity);
      res.json(cartItem);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/cart/:id", verifyUser, async (req, res) => {
    try {
      await storage.removeFromCart(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/cart", verifyUser, async (req, res) => {
    try {
      await storage.clearCart(req.user.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Wishlist routes
  app.get("/api/wishlist", verifyUser, async (req, res) => {
    try {
      const wishlistItems = await storage.getWishlistItems(req.user.id);
      res.json(wishlistItems);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/wishlist", verifyUser, async (req, res) => {
    try {
      const wishlistItemData = insertWishlistItemSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      const wishlistItem = await storage.addToWishlist(wishlistItemData);
      res.status(201).json(wishlistItem);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/wishlist/:id", verifyUser, async (req, res) => {
    try {
      await storage.removeFromWishlist(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/wishlist/check/:productId", verifyUser, async (req, res) => {
    try {
      const isInWishlist = await storage.isInWishlist(req.user.id, req.params.productId);
      res.json({ isInWishlist });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Orders routes
  app.get("/api/orders", verifyUser, async (req, res) => {
    try {
      const { status, limit, offset } = req.query;
      const userId = req.user.role === 'admin' ? undefined : req.user.id;
      
      const orders = await storage.getOrders(userId, {
        status: status as string,
        limit: limit ? Number(limit) : undefined,
        offset: offset ? Number(offset) : undefined
      });
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/orders/:id", verifyUser, async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      // Check if user owns the order or is admin
      if (req.user.role !== 'admin' && order.userId !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      res.json(order);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/orders", verifyUser, async (req, res) => {
    try {
      // Generate order number
      const orderNumber = `ORD-${new Date().getFullYear()}-${randomBytes(4).toString('hex').toUpperCase()}`;
      
      const orderData = insertOrderSchema.parse({
        ...req.body,
        userId: req.user.id,
        orderNumber
      });

      const order = await storage.createOrder(orderData);

      // Add order items
      if (req.body.items && Array.isArray(req.body.items)) {
        const orderItems = req.body.items.map((item: any) => ({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          variantId: item.variantId
        }));
        
        await storage.addOrderItems(order.id, orderItems);

        // Update product stock
        for (const item of req.body.items) {
          await storage.updateProductStock(item.productId, item.quantity);
        }

        // Clear cart
        await storage.clearCart(req.user.id);
      }

      res.status(201).json(order);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.put("/api/orders/:id/status", verifyUser, requireAdmin, async (req, res) => {
    try {
      const { status } = req.body;
      const order = await storage.updateOrderStatus(req.params.id, status);
      res.json(order);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Addresses routes
  app.get("/api/addresses", verifyUser, async (req, res) => {
    try {
      const addresses = await storage.getAddresses(req.user.id);
      res.json(addresses);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/addresses", verifyUser, async (req, res) => {
    try {
      const addressData = insertAddressSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      const address = await storage.createAddress(addressData);
      res.status(201).json(address);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.put("/api/addresses/:id", verifyUser, async (req, res) => {
    try {
      const address = await storage.updateAddress(req.params.id, req.body);
      res.json(address);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/addresses/:id", verifyUser, async (req, res) => {
    try {
      await storage.deleteAddress(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Reviews routes
  app.get("/api/products/:productId/reviews", async (req, res) => {
    try {
      const reviews = await storage.getProductReviews(req.params.productId);
      res.json(reviews);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/reviews", verifyUser, async (req, res) => {
    try {
      const reviewData = insertReviewSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Admin analytics
  app.get("/api/admin/stats", verifyUser, requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin export data
  app.get("/api/admin/export", verifyUser, requireAdmin, async (req, res) => {
    try {
      const exportData = await storage.exportAllData();
      res.json(exportData);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin get all users
  app.get("/api/admin/users", verifyUser, requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin update user role
  app.put("/api/admin/users/:id/role", verifyUser, requireAdmin, async (req, res) => {
    try {
      const { role } = req.body;
      if (!['customer', 'admin'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role. Must be "customer" or "admin"' });
      }
      const user = await storage.updateUserRole(req.params.id, role);
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Stripe payment routes
  app.post("/api/create-payment-intent", verifyUser, async (req, res) => {
    try {
      const { amount } = req.body;
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
      });
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  // PayPal routes
  app.get("/paypal/setup", async (req, res) => {
    try {
      const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64");
      const { result } = await oAuthAuthorizationController.requestToken(
        { authorization: `Basic ${auth}` },
        { intent: "sdk_init", response_type: "client_token" }
      );
      res.json({ clientToken: result.accessToken });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to get PayPal client token: " + error.message });
    }
  });

  app.post("/paypal/order", async (req, res) => {
    try {
      const { amount, currency, intent } = req.body;
      if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        return res.status(400).json({ error: "Invalid amount. Amount must be a positive number." });
      }
      if (!currency) {
        return res.status(400).json({ error: "Invalid currency. Currency is required." });
      }
      if (!intent) {
        return res.status(400).json({ error: "Invalid intent. Intent is required." });
      }

      const collect = {
        body: {
          intent: intent,
          purchaseUnits: [{
            amount: {
              currencyCode: currency,
              value: amount,
            },
          }],
        },
        prefer: "return=minimal",
      };

      const { body, ...httpResponse } = await ordersController.createOrder(collect);
      const jsonResponse = JSON.parse(String(body));
      const httpStatusCode = httpResponse.statusCode;
      res.status(httpStatusCode).json(jsonResponse);
    } catch (error: any) {
      console.error("Failed to create order:", error);
      res.status(500).json({ error: "Failed to create order." });
    }
  });

  app.post("/paypal/order/:orderID/capture", async (req, res) => {
    try {
      const { orderID } = req.params;
      const collect = {
        id: orderID,
        prefer: "return=minimal",
      };

      const { body, ...httpResponse } = await ordersController.captureOrder(collect);
      const jsonResponse = JSON.parse(String(body));
      const httpStatusCode = httpResponse.statusCode;
      res.status(httpStatusCode).json(jsonResponse);
    } catch (error: any) {
      console.error("Failed to capture order:", error);
      res.status(500).json({ error: "Failed to capture order." });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
