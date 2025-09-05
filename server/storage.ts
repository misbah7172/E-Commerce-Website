import { 
  users, products, categories, addresses, cartItems, wishlistItems, 
  orders, orderItems, reviews, coupons, productVariants, visitors, siteAnalytics,
  type User, type InsertUser, type Product, type InsertProduct,
  type Category, type InsertCategory, type Address, type InsertAddress,
  type CartItem, type InsertCartItem, type WishlistItem, type InsertWishlistItem,
  type Order, type InsertOrder, type OrderItem, type InsertOrderItem,
  type Review, type InsertReview, type Coupon, type InsertCoupon,
  type Visitor, type InsertVisitor, type SiteAnalytics, type InsertSiteAnalytics
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, like, gte, lte, inArray, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUserRole(id: string, role: 'customer' | 'admin'): Promise<User>;
  updateUserProfile(firebaseUid: string, userData: Partial<InsertUser>): Promise<User>;
  updateUserProfileImage(firebaseUid: string, profileImage: string): Promise<User>;

  // Products
  getProducts(filters?: {
    categoryId?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: 'name' | 'price' | 'rating' | 'created';
    sortOrder?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
  }): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  getProductBysku(sku: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: string): Promise<void>;
  updateProductStock(id: string, quantity: number): Promise<void>;

  // Categories
  getCategories(): Promise<Category[]>;
  getCategory(id: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category>;
  deleteCategory(id: string): Promise<void>;

  // Cart
  getCartItems(userId: string): Promise<(CartItem & { product: Product })[]>;
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: string, quantity: number): Promise<CartItem>;
  removeFromCart(id: string): Promise<void>;
  clearCart(userId: string): Promise<void>;

  // Wishlist
  getWishlistItems(userId: string): Promise<(WishlistItem & { product: Product })[]>;
  addToWishlist(wishlistItem: InsertWishlistItem): Promise<WishlistItem>;
  removeFromWishlist(id: string): Promise<void>;
  isInWishlist(userId: string, productId: string): Promise<boolean>;

  // Orders
  getOrders(userId?: string, filters?: {
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<(Order & { items: (OrderItem & { product: Product })[] })[]>;
  getOrder(id: string): Promise<(Order & { items: (OrderItem & { product: Product })[] }) | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: string, status: Order['status']): Promise<Order>;
  addOrderItems(orderId: string, items: InsertOrderItem[]): Promise<OrderItem[]>;

  // Addresses
  getAddresses(userId: string): Promise<Address[]>;
  getAddress(id: string): Promise<Address | undefined>;
  createAddress(address: InsertAddress): Promise<Address>;
  updateAddress(id: string, address: Partial<InsertAddress>): Promise<Address>;
  deleteAddress(id: string): Promise<void>;

  // Reviews
  getProductReviews(productId: string): Promise<(Review & { user: Pick<User, 'name'> })[]>;
  createReview(review: InsertReview): Promise<Review>;
  updateReview(id: string, review: Partial<InsertReview>): Promise<Review>;
  deleteReview(id: string): Promise<void>;

  // Coupons
  getCoupon(code: string): Promise<Coupon | undefined>;
  validateCoupon(code: string, orderAmount: number): Promise<boolean>;
  useCoupon(id: string): Promise<void>;

  // Analytics
  getDashboardStats(): Promise<{
    totalRevenue: number;
    totalOrders: number;
    totalUsers: number;
    totalProducts: number;
    lowStockProducts: number;
  }>;
  exportAllData(): Promise<{
    users: User[];
    products: Product[];
    categories: Category[];
    orders: (Order & { items: OrderItem[] })[];
    reviews: Review[];
  }>;

  // Visitor tracking
  trackVisitor(ipAddress: string, userAgent?: string): Promise<Visitor>;
  getUniqueVisitorCount(): Promise<number>;
  getTotalVisitorCount(): Promise<number>;
  getSiteAnalytics(metric: string): Promise<SiteAnalytics | undefined>;
  updateSiteAnalytics(metric: string, value: number): Promise<SiteAnalytics>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.firebaseUid, firebaseUid));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async updateUser(id: string, user: Partial<InsertUser>): Promise<User> {
    const [updatedUser] = await db.update(users).set(user).where(eq(users.id, id)).returning();
    return updatedUser;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async updateUserRole(id: string, role: 'customer' | 'admin'): Promise<User> {
    const [updatedUser] = await db.update(users).set({ role }).where(eq(users.id, id)).returning();
    return updatedUser;
  }

  async updateUserProfile(firebaseUid: string, userData: Partial<InsertUser>): Promise<User> {
    const [updatedUser] = await db.update(users)
      .set(userData)
      .where(eq(users.firebaseUid, firebaseUid))
      .returning();
    return updatedUser;
  }

  async updateUserProfileImage(firebaseUid: string, profileImage: string): Promise<User> {
    const [updatedUser] = await db.update(users)
      .set({ profileImage })
      .where(eq(users.firebaseUid, firebaseUid))
      .returning();
    return updatedUser;
  }

  // Products
  async getProducts(filters?: {
    categoryId?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: 'name' | 'price' | 'rating' | 'created';
    sortOrder?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
  }): Promise<Product[]> {
    const conditions: any[] = [eq(products.isActive, true)];
    
    if (filters?.categoryId) {
      conditions.push(eq(products.categoryId, filters.categoryId));
    }
    
    if (filters?.search) {
      conditions.push(like(products.name, `%${filters.search}%`));
    }
    
    if (filters?.minPrice) {
      conditions.push(gte(products.price, filters.minPrice.toString()));
    }
    
    if (filters?.maxPrice) {
      conditions.push(lte(products.price, filters.maxPrice.toString()));
    }
    
    let query = db.select().from(products).where(and(...conditions));
    
    // Sorting
    if (filters?.sortBy) {
      const sortColumn = {
        name: products.name,
        price: products.price,
        rating: products.rating,
        created: products.createdAt
      }[filters.sortBy];
      
      query = query.orderBy(filters?.sortOrder === 'desc' ? desc(sortColumn) : asc(sortColumn));
    }
    
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    
    if (filters?.offset) {
      query = query.offset(filters.offset);
    }
    
    return await query;
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async getProductBysku(sku: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.sku, sku));
    return product || undefined;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product> {
    const [updatedProduct] = await db.update(products).set(product).where(eq(products.id, id)).returning();
    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<void> {
    await db.update(products).set({ isActive: false }).where(eq(products.id, id));
  }

  async updateProductStock(id: string, quantity: number): Promise<void> {
    await db.update(products).set({ 
      stock: sql`${products.stock} - ${quantity}` 
    }).where(eq(products.id, id));
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return db.select().from(categories).orderBy(asc(categories.name));
  }

  async getCategory(id: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category || undefined;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  async updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category> {
    const [updatedCategory] = await db.update(categories).set(category).where(eq(categories.id, id)).returning();
    return updatedCategory;
  }

  async deleteCategory(id: string): Promise<void> {
    await db.delete(categories).where(eq(categories.id, id));
  }

  // Cart
  async getCartItems(userId: string): Promise<(CartItem & { product: Product })[]> {
    return db.select({
      id: cartItems.id,
      userId: cartItems.userId,
      productId: cartItems.productId,
      quantity: cartItems.quantity,
      variantId: cartItems.variantId,
      addedAt: cartItems.addedAt,
      product: products
    })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.userId, userId))
    .orderBy(desc(cartItems.addedAt));
  }

  async addToCart(cartItem: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const [existingItem] = await db.select()
      .from(cartItems)
      .where(and(
        eq(cartItems.userId, cartItem.userId),
        eq(cartItems.productId, cartItem.productId),
        cartItem.variantId ? eq(cartItems.variantId, cartItem.variantId) : sql`variant_id IS NULL`
      ));

    if (existingItem) {
      // Update quantity
      const [updatedItem] = await db.update(cartItems)
        .set({ quantity: existingItem.quantity + cartItem.quantity })
        .where(eq(cartItems.id, existingItem.id))
        .returning();
      return updatedItem;
    } else {
      // Add new item
      const [newItem] = await db.insert(cartItems).values(cartItem).returning();
      return newItem;
    }
  }

  async updateCartItem(id: string, quantity: number): Promise<CartItem> {
    const [updatedItem] = await db.update(cartItems).set({ quantity }).where(eq(cartItems.id, id)).returning();
    return updatedItem;
  }

  async removeFromCart(id: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.id, id));
  }

  async clearCart(userId: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.userId, userId));
  }

  // Wishlist
  async getWishlistItems(userId: string): Promise<(WishlistItem & { product: Product })[]> {
    return db.select({
      id: wishlistItems.id,
      userId: wishlistItems.userId,
      productId: wishlistItems.productId,
      addedAt: wishlistItems.addedAt,
      product: products
    })
    .from(wishlistItems)
    .innerJoin(products, eq(wishlistItems.productId, products.id))
    .where(eq(wishlistItems.userId, userId))
    .orderBy(desc(wishlistItems.addedAt));
  }

  async addToWishlist(wishlistItem: InsertWishlistItem): Promise<WishlistItem> {
    const [newItem] = await db.insert(wishlistItems).values(wishlistItem).returning();
    return newItem;
  }

  async removeFromWishlist(id: string): Promise<void> {
    await db.delete(wishlistItems).where(eq(wishlistItems.id, id));
  }

  async isInWishlist(userId: string, productId: string): Promise<boolean> {
    const [item] = await db.select()
      .from(wishlistItems)
      .where(and(eq(wishlistItems.userId, userId), eq(wishlistItems.productId, productId)));
    return !!item;
  }

  // Orders
  async getOrders(userId?: string, filters?: {
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<(Order & { items: (OrderItem & { product: Product })[] })[]> {
    const conditions: any[] = [];
    
    if (userId) {
      conditions.push(eq(orders.userId, userId));
    }
    
    if (filters?.status) {
      conditions.push(eq(orders.status, filters.status as Order['status']));
    }
    
    let query = conditions.length > 0 
      ? db.select().from(orders).where(and(...conditions))
      : db.select().from(orders);
    
    query = query.orderBy(desc(orders.createdAt));
    
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    
    if (filters?.offset) {
      query = query.offset(filters.offset);
    }
    
    const ordersResult = await query;
    
    // Fetch order items for each order
    const ordersWithItems = await Promise.all(
      ordersResult.map(async (order) => {
        const items = await db.select({
          id: orderItems.id,
          orderId: orderItems.orderId,
          productId: orderItems.productId,
          quantity: orderItems.quantity,
          price: orderItems.price,
          variantId: orderItems.variantId,
          product: products
        })
        .from(orderItems)
        .innerJoin(products, eq(orderItems.productId, products.id))
        .where(eq(orderItems.orderId, order.id));
        
        return { ...order, items };
      })
    );
    
    return ordersWithItems;
  }

  async getOrder(id: string): Promise<(Order & { items: (OrderItem & { product: Product })[] }) | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    
    if (!order) return undefined;
    
    const items = await db.select({
      id: orderItems.id,
      orderId: orderItems.orderId,
      productId: orderItems.productId,
      quantity: orderItems.quantity,
      price: orderItems.price,
      variantId: orderItems.variantId,
      product: products
    })
    .from(orderItems)
    .innerJoin(products, eq(orderItems.productId, products.id))
    .where(eq(orderItems.orderId, order.id));
    
    return { ...order, items };
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    return newOrder;
  }

  async updateOrderStatus(id: string, status: Order['status']): Promise<Order> {
    const [updatedOrder] = await db.update(orders).set({ status }).where(eq(orders.id, id)).returning();
    return updatedOrder;
  }

  async addOrderItems(orderId: string, items: InsertOrderItem[]): Promise<OrderItem[]> {
    const orderItemsWithOrderId = items.map(item => ({ ...item, orderId }));
    return db.insert(orderItems).values(orderItemsWithOrderId).returning();
  }

  // Addresses
  async getAddresses(userId: string): Promise<Address[]> {
    return db.select().from(addresses).where(eq(addresses.userId, userId)).orderBy(desc(addresses.isDefault));
  }

  async getAddress(id: string): Promise<Address | undefined> {
    const [address] = await db.select().from(addresses).where(eq(addresses.id, id));
    return address || undefined;
  }

  async createAddress(address: InsertAddress): Promise<Address> {
    const [newAddress] = await db.insert(addresses).values(address).returning();
    return newAddress;
  }

  async updateAddress(id: string, address: Partial<InsertAddress>): Promise<Address> {
    const [updatedAddress] = await db.update(addresses).set(address).where(eq(addresses.id, id)).returning();
    return updatedAddress;
  }

  async deleteAddress(id: string): Promise<void> {
    await db.delete(addresses).where(eq(addresses.id, id));
  }

  // Reviews
  async getProductReviews(productId: string): Promise<(Review & { user: Pick<User, 'name'> })[]> {
    return db.select({
      id: reviews.id,
      productId: reviews.productId,
      userId: reviews.userId,
      orderId: reviews.orderId,
      rating: reviews.rating,
      title: reviews.title,
      comment: reviews.comment,
      images: reviews.images,
      isVerified: reviews.isVerified,
      createdAt: reviews.createdAt,
      user: {
        name: users.name
      }
    })
    .from(reviews)
    .innerJoin(users, eq(reviews.userId, users.id))
    .where(eq(reviews.productId, productId))
    .orderBy(desc(reviews.createdAt));
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    
    // Update product rating and review count
    const allReviews = await db.select().from(reviews).where(eq(reviews.productId, review.productId));
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    
    await db.update(products)
      .set({ 
        rating: avgRating.toFixed(2),
        reviewCount: allReviews.length 
      })
      .where(eq(products.id, review.productId));
    
    return newReview;
  }

  async updateReview(id: string, review: Partial<InsertReview>): Promise<Review> {
    const [updatedReview] = await db.update(reviews).set(review).where(eq(reviews.id, id)).returning();
    return updatedReview;
  }

  async deleteReview(id: string): Promise<void> {
    await db.delete(reviews).where(eq(reviews.id, id));
  }

  // Coupons
  async getCoupon(code: string): Promise<Coupon | undefined> {
    const [coupon] = await db.select().from(coupons).where(eq(coupons.code, code));
    return coupon || undefined;
  }

  async validateCoupon(code: string, orderAmount: number): Promise<boolean> {
    const [coupon] = await db.select().from(coupons).where(
      and(
        eq(coupons.code, code),
        eq(coupons.isActive, true),
        gte(sql`NOW()`, coupons.validFrom),
        lte(sql`NOW()`, coupons.validUntil),
        gte(sql`${orderAmount}`, coupons.minimumAmount)
      )
    );
    
    if (!coupon) return false;
    
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return false;
    }
    
    return true;
  }

  async useCoupon(id: string): Promise<void> {
    await db.update(coupons)
      .set({ usageCount: sql`${coupons.usageCount} + 1` })
      .where(eq(coupons.id, id));
  }

  // Analytics
  async getDashboardStats(): Promise<{
    totalRevenue: number;
    totalOrders: number;
    totalUsers: number;
    totalProducts: number;
    lowStockProducts: number;
  }> {
    const [revenueResult] = await db.select({
      total: sql<number>`COALESCE(SUM(${orders.total}), 0)`
    }).from(orders).where(eq(orders.paymentStatus, 'paid'));
    
    const [ordersResult] = await db.select({
      count: sql<number>`COUNT(*)`
    }).from(orders);
    
    const [usersResult] = await db.select({
      count: sql<number>`COUNT(*)`
    }).from(users);
    
    const [productsResult] = await db.select({
      count: sql<number>`COUNT(*)`
    }).from(products).where(eq(products.isActive, true));
    
    const [lowStockResult] = await db.select({
      count: sql<number>`COUNT(*)`
    }).from(products).where(
      and(
        eq(products.isActive, true),
        lte(products.stock, 5)
      )
    );
    
    return {
      totalRevenue: Number(revenueResult.total) || 0,
      totalOrders: Number(ordersResult.count) || 0,
      totalUsers: Number(usersResult.count) || 0,
      totalProducts: Number(productsResult.count) || 0,
      lowStockProducts: Number(lowStockResult.count) || 0,
    };
  }

  async exportAllData(): Promise<{
    users: User[];
    products: Product[];
    categories: Category[];
    orders: (Order & { items: OrderItem[] })[];
    reviews: Review[];
  }> {
    // Get all data from database
    const allUsers = await db.select().from(users);
    const allProducts = await db.select().from(products);
    const allCategories = await db.select().from(categories);
    const allReviews = await db.select().from(reviews);
    
    // Get orders with their items
    const allOrders = await db.select().from(orders);
    const allOrderItems = await db.select().from(orderItems);
    
    // Combine orders with their items
    const ordersWithItems = allOrders.map(order => ({
      ...order,
      items: allOrderItems.filter(item => item.orderId === order.id)
    }));

    return {
      users: allUsers,
      products: allProducts,
      categories: allCategories,
      orders: ordersWithItems,
      reviews: allReviews,
    };
  }

  // Visitor tracking methods
  async trackVisitor(ipAddress: string, userAgent?: string): Promise<Visitor> {
    try {
      // Check if visitor already exists
      const existingVisitor = await db.select()
        .from(visitors)
        .where(eq(visitors.ipAddress, ipAddress))
        .limit(1);

      if (existingVisitor.length > 0) {
        // Update existing visitor
        const [updatedVisitor] = await db.update(visitors)
          .set({ 
            lastVisit: new Date(),
            visitCount: sql`${visitors.visitCount} + 1`,
            userAgent: userAgent || existingVisitor[0].userAgent
          })
          .where(eq(visitors.ipAddress, ipAddress))
          .returning();
        return updatedVisitor;
      } else {
        // Create new visitor
        const [newVisitor] = await db.insert(visitors)
          .values({
            ipAddress,
            userAgent,
            firstVisit: new Date(),
            lastVisit: new Date(),
            visitCount: 1
          })
          .returning();
        
        // Update unique visitor count in analytics
        await this.updateSiteAnalytics('unique_visitors', await this.getUniqueVisitorCount());
        
        return newVisitor;
      }
    } catch (error) {
      console.error('Error tracking visitor:', error);
      throw error;
    }
  }

  async getUniqueVisitorCount(): Promise<number> {
    try {
      const result = await db.select({ count: sql`count(*)` }).from(visitors);
      return Number(result[0]?.count || 0);
    } catch (error) {
      console.error('Error getting unique visitor count:', error);
      return 0;
    }
  }

  async getTotalVisitorCount(): Promise<number> {
    try {
      const result = await db.select({ 
        totalVisits: sql`sum(${visitors.visitCount})` 
      }).from(visitors);
      return Number(result[0]?.totalVisits || 0);
    } catch (error) {
      console.error('Error getting total visitor count:', error);
      return 0;
    }
  }

  async getSiteAnalytics(metric: string): Promise<SiteAnalytics | undefined> {
    try {
      const result = await db.select()
        .from(siteAnalytics)
        .where(eq(siteAnalytics.metric, metric))
        .limit(1);
      return result[0];
    } catch (error) {
      console.error('Error getting site analytics:', error);
      return undefined;
    }
  }

  async updateSiteAnalytics(metric: string, value: number): Promise<SiteAnalytics> {
    try {
      const existing = await this.getSiteAnalytics(metric);
      
      if (existing) {
        const [updated] = await db.update(siteAnalytics)
          .set({ value, updatedAt: new Date() })
          .where(eq(siteAnalytics.metric, metric))
          .returning();
        return updated;
      } else {
        const [created] = await db.insert(siteAnalytics)
          .values({ metric, value, date: new Date(), updatedAt: new Date() })
          .returning();
        return created;
      }
    } catch (error) {
      console.error('Error updating site analytics:', error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();
