import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package, 
  TrendingUp, 
  AlertTriangle,
  Search,
  Download,
  Plus,
  Eye,
  Edit,
  Trash2,
  Save,
  X
} from "lucide-react";
import { Link, useLocation } from "wouter";
import type { Product, Category } from "@shared/schema";

export default function Admin() {
  const { user, isAdmin } = useAuth();
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form state for new product
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    originalPrice: "",
    sku: "",
    categoryId: "",
    stock: "",
    images: [""],
    features: [""],
    specifications: {},
  });

  const { data: stats } = useQuery<{
    totalRevenue: number;
    totalOrders: number;
    totalUsers: number;
    totalProducts: number;
    lowStockProducts: number;
  }>({
    queryKey: ["/api/admin/stats"],
    enabled: !!user && isAdmin,
  });

  const { data: orders = [], isLoading: ordersLoading, error: ordersError } = useQuery<any[]>({
    queryKey: ["/api/orders"],
    enabled: !!user && isAdmin,
  });

  const { data: products = [], isLoading: productsLoading, error: productsError } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    enabled: !!user && isAdmin,
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    enabled: !!user && isAdmin,
  });

  const { data: allUsers = [], isLoading: usersLoading, error: usersError } = useQuery<any[]>({
    queryKey: ["/api/admin/users"],
    enabled: !!user && isAdmin,
  });

  // Mutations
  const addProductMutation = useMutation({
    mutationFn: (productData: any) => apiRequest("POST", "/api/products", productData),
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Product added successfully",
      });
      setIsAddProductOpen(false);
      setNewProduct({
        name: "",
        description: "",
        price: "",
        originalPrice: "",
        sku: "",
        categoryId: "",
        stock: "",
        images: [""],
        features: [""],
        specifications: {},
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add product",
        variant: "destructive",
      });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      apiRequest("PUT", `/api/products/${id}`, data),
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Product updated successfully",
      });
      setIsEditProductOpen(false);
      setEditingProduct(null);
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update product",
        variant: "destructive",
      });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/products/${id}`),
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Product deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete product",
        variant: "destructive",
      });
    },
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => 
      apiRequest("PUT", `/api/orders/${id}/status`, { status }),
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Order status updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update order status",
        variant: "destructive",
      });
    },
  });

  const updateUserRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) => 
      apiRequest("PUT", `/api/admin/users/${id}/role`, { role }),
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "User role updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user role",
        variant: "destructive",
      });
    },
  });

  // Event handlers
  const handleAddProduct = () => {
    const productData = {
      ...newProduct,
      price: parseFloat(newProduct.price),
      originalPrice: parseFloat(newProduct.originalPrice || newProduct.price),
      stock: parseInt(newProduct.stock),
      images: newProduct.images.filter(img => img.trim() !== ""),
      features: newProduct.features.filter(feature => feature.trim() !== ""),
    };
    addProductMutation.mutate(productData);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsEditProductOpen(true);
  };

  const handleUpdateProduct = () => {
    if (!editingProduct) return;
    updateProductMutation.mutate({
      id: editingProduct.id,
      data: editingProduct,
    });
  };

  // Export data mutation
  const exportDataMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("User not authenticated");
      const token = await user.getIdToken();
      const response = await fetch("/api/admin/export", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "x-firebase-uid": user.uid,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to export data");
      }
      return await response.json();
    },
    onSuccess: (data) => {
      // Create and download the file
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `shophub-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Success!",
        description: "Data exported successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to export data",
        variant: "destructive",
      });
    },
  });

  const handleDeleteProduct = (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      deleteProductMutation.mutate(id);
    }
  };

  const handleExportData = () => {
    exportDataMutation.mutate();
  };

  if (!user) {
    navigate("/login");
    return null;
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to access the admin panel.</p>
          <Link href="/">
            <Button className="mt-4">Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const recentOrders = (orders as any[]).slice(0, 5);
  const lowStockProducts = (products as Product[]).filter((product: Product) => product.stock <= 5);

  // Debug logging
  console.log("Admin Debug:", { 
    user: !!user, 
    isAdmin, 
    productsLoading, 
    productsError, 
    productsLength: products?.length,
    products: products?.slice(0, 3) // Show first 3 products for debugging
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold" data-testid="text-admin-title">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your e-commerce platform</p>
          </div>
          <div className="flex items-center gap-4">
            <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-product">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Product</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Product Name</Label>
                      <Input
                        id="name"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                        placeholder="Enter product name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="sku">SKU</Label>
                      <Input
                        id="sku"
                        value={newProduct.sku}
                        onChange={(e) => setNewProduct({...newProduct, sku: e.target.value})}
                        placeholder="Enter SKU"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                      placeholder="Enter product description"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="price">Price</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="originalPrice">Original Price</Label>
                      <Input
                        id="originalPrice"
                        type="number"
                        step="0.01"
                        value={newProduct.originalPrice}
                        onChange={(e) => setNewProduct({...newProduct, originalPrice: e.target.value})}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="stock">Stock</Label>
                      <Input
                        id="stock"
                        type="number"
                        value={newProduct.stock}
                        onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select 
                      value={newProduct.categoryId} 
                      onValueChange={(value) => setNewProduct({...newProduct, categoryId: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="image">Product Image URL</Label>
                    <Input
                      id="image"
                      value={newProduct.images[0]}
                      onChange={(e) => setNewProduct({...newProduct, images: [e.target.value]})}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div>
                    <Label htmlFor="features">Features (one per line)</Label>
                    <Textarea
                      id="features"
                      value={newProduct.features.join('\n')}
                      onChange={(e) => setNewProduct({...newProduct, features: e.target.value.split('\n')})}
                      placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsAddProductOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleAddProduct}
                      disabled={addProductMutation.isPending}
                    >
                      {addProductMutation.isPending ? "Adding..." : "Add Product"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button variant="outline" onClick={handleExportData} data-testid="button-export-data">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold" data-testid="text-total-revenue">
                    ${stats?.totalRevenue?.toLocaleString() || "0"}
                  </p>
                  <p className="text-sm text-green-600">+12.5% from last month</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold" data-testid="text-total-orders">
                    {stats?.totalOrders?.toLocaleString() || "0"}
                  </p>
                  <p className="text-sm text-green-600">+8.1% from last month</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <ShoppingCart className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                  <p className="text-2xl font-bold" data-testid="text-active-users">
                    {stats?.totalUsers?.toLocaleString() || "0"}
                  </p>
                  <p className="text-sm text-green-600">+15.3% from last month</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Products</p>
                  <p className="text-2xl font-bold" data-testid="text-total-products">
                    {stats?.totalProducts?.toLocaleString() || "0"}
                  </p>
                  <p className="text-sm text-red-600">
                    {stats?.lowStockProducts || 0} low stock alerts
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Package className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
            <TabsTrigger value="orders" data-testid="tab-orders">Orders</TabsTrigger>
            <TabsTrigger value="products" data-testid="tab-products">Products</TabsTrigger>
            <TabsTrigger value="users" data-testid="tab-users">Users</TabsTrigger>
            <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Recent Orders */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Recent Orders
                    <Button variant="outline" size="sm">View All</Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentOrders.map((order: any) => (
                      <div key={order.id} className="flex items-center justify-between py-3 border-b border-border last:border-b-0" data-testid={`recent-order-${order.id}`}>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <ShoppingCart className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">#{order.orderNumber}</p>
                            <p className="text-muted-foreground text-xs">
                              {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-sm">${order.total}</p>
                          <Badge className={`text-xs ${
                            order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Low Stock Alerts */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    Low Stock Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {lowStockProducts.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No low stock items</p>
                  ) : (
                    <div className="space-y-4">
                      {lowStockProducts.slice(0, 5).map((product: any) => (
                        <div key={product.id} className="flex items-center justify-between p-3 border border-orange-200 bg-orange-50 rounded" data-testid={`low-stock-${product.id}`}>
                          <div className="flex items-center space-x-3">
                            <img
                              src={product.images?.[0] || "/placeholder.jpg"}
                              alt={product.name}
                              className="w-10 h-10 object-cover rounded"
                            />
                            <div>
                              <p className="font-medium text-sm">{product.name}</p>
                              <p className="text-orange-600 text-xs">Only {product.stock} left</p>
                            </div>
                          </div>
                          <Button size="sm" variant="outline">
                            Restock
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Order Management
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search orders..."
                        className="pl-10 w-64"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        data-testid="input-search-orders"
                      />
                    </div>
                    <Select>
                      <SelectTrigger className="w-40" data-testid="select-order-filter">
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-medium">Order ID</th>
                        <th className="text-left py-3 px-4 font-medium">Customer</th>
                        <th className="text-left py-3 px-4 font-medium">Items</th>
                        <th className="text-left py-3 px-4 font-medium">Total</th>
                        <th className="text-left py-3 px-4 font-medium">Status</th>
                        <th className="text-left py-3 px-4 font-medium">Date</th>
                        <th className="text-left py-3 px-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(orders as any[]).slice(0, 10).map((order: any) => (
                        <tr key={order.id} className="border-b border-border hover:bg-muted/50" data-testid={`order-row-${order.id}`}>
                          <td className="py-3 px-4">
                            <span className="font-medium">#{order.orderNumber}</span>
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium text-sm">
                                {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}
                              </p>
                              <p className="text-muted-foreground text-xs">{order.userId}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-sm">{order.items?.length || 0} items</p>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-medium">${order.total}</span>
                          </td>
                          <td className="py-3 px-4">
                            <Select 
                              defaultValue={order.status}
                              onValueChange={(status) => updateOrderStatusMutation.mutate({ id: order.id, status })}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="confirmed">Confirmed</SelectItem>
                                <SelectItem value="processing">Processing</SelectItem>
                                <SelectItem value="shipped">Shipped</SelectItem>
                                <SelectItem value="delivered">Delivered</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-muted-foreground">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => window.open(`/orders/${order.id}`, '_blank')}
                                data-testid={`button-view-order-${order.id}`}
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                data-testid={`button-edit-order-${order.id}`}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Product Management
                  <div className="flex items-center gap-4">
                    <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
                      <DialogTrigger asChild>
                        <Button data-testid="button-add-new-product">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Product
                        </Button>
                      </DialogTrigger>
                    </Dialog>
                    <Button variant="outline" onClick={handleExportData} data-testid="button-import-products">
                      <Download className="h-4 w-4 mr-2" />
                      Export Products
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {productsLoading ? (
                  <div className="text-center py-8">
                    <p>Loading products...</p>
                  </div>
                ) : productsError ? (
                  <div className="text-center py-8 text-red-500">
                    <p>Error loading products: {productsError.message}</p>
                  </div>
                ) : products.length === 0 ? (
                  <div className="text-center py-8">
                    <p>No products found</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(products as Product[]).slice(0, 12).map((product: Product) => (
                    <Card key={product.id} className="overflow-hidden" data-testid={`product-card-${product.id}`}>
                      <div className="aspect-video bg-muted">
                        {product.images && product.images[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            No Image
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-sm line-clamp-2" data-testid={`text-product-name-${product.id}`}>
                            {product.name}
                          </h4>
                          <Badge className="bg-green-100 text-green-800">
                            Active
                          </Badge>
                        </div>
                        <p className="text-muted-foreground text-xs mb-2">SKU: {product.sku}</p>
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-bold" data-testid={`text-product-price-${product.id}`}>
                            ${product.price}
                          </span>
                          <span className={`text-sm ${product.stock <= 5 ? "text-red-600" : "text-muted-foreground"}`}>
                            Stock: {product.stock}
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1" 
                            onClick={() => handleEditProduct(product)}
                            data-testid={`button-edit-product-${product.id}`}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => window.open(`/products/${product.id}`, '_blank')}
                            data-testid={`button-view-product-${product.id}`}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-destructive hover:bg-destructive hover:text-destructive-foreground" 
                            onClick={() => handleDeleteProduct(product.id)}
                            data-testid={`button-delete-product-${product.id}`}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Edit Product Dialog */}
            <Dialog open={isEditProductOpen} onOpenChange={setIsEditProductOpen}>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Product</DialogTitle>
                </DialogHeader>
                {editingProduct && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="edit-name">Product Name</Label>
                        <Input
                          id="edit-name"
                          value={editingProduct.name}
                          onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-sku">SKU</Label>
                        <Input
                          id="edit-sku"
                          value={editingProduct.sku}
                          onChange={(e) => setEditingProduct({...editingProduct, sku: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="edit-description">Description</Label>
                      <Textarea
                        id="edit-description"
                        value={editingProduct.description}
                        onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="edit-price">Price</Label>
                        <Input
                          id="edit-price"
                          type="number"
                          step="0.01"
                          value={editingProduct.price}
                          onChange={(e) => setEditingProduct({...editingProduct, price: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-originalPrice">Original Price</Label>
                        <Input
                          id="edit-originalPrice"
                          type="number"
                          step="0.01"
                          value={editingProduct.originalPrice || ""}
                          onChange={(e) => setEditingProduct({...editingProduct, originalPrice: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-stock">Stock</Label>
                        <Input
                          id="edit-stock"
                          type="number"
                          value={editingProduct.stock}
                          onChange={(e) => setEditingProduct({...editingProduct, stock: parseInt(e.target.value)})}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setIsEditProductOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleUpdateProduct}
                        disabled={updateProductMutation.isPending}
                      >
                        {updateProductMutation.isPending ? "Updating..." : "Update Product"}
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="text-center py-8">
                    <p>Loading users...</p>
                  </div>
                ) : usersError ? (
                  <div className="text-center py-8 text-red-500">
                    <p>Error loading users: {usersError.message}</p>
                  </div>
                ) : allUsers.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Users Found</h3>
                    <p className="text-muted-foreground">No users have registered yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium">User</th>
                          <th className="text-left py-3 px-4 font-medium">Email</th>
                          <th className="text-left py-3 px-4 font-medium">Role</th>
                          <th className="text-left py-3 px-4 font-medium">Joined</th>
                          <th className="text-left py-3 px-4 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allUsers.map((userItem: any) => (
                          <tr key={userItem.id} className="border-b hover:bg-muted/50">
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                                  {userItem.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-medium">{userItem.name}</p>
                                  <p className="text-sm text-muted-foreground">ID: {userItem.id.slice(0, 8)}...</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-sm">{userItem.email}</span>
                            </td>
                            <td className="py-3 px-4">
                              <Select 
                                defaultValue={userItem.role}
                                onValueChange={(role) => updateUserRoleMutation.mutate({ id: userItem.id, role })}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="customer">Customer</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-sm text-muted-foreground">
                                {new Date(userItem.createdAt).toLocaleDateString()}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => window.open(`/profile/${userItem.id}`, '_blank')}
                                  data-testid={`button-view-user-${userItem.id}`}
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                                <Badge 
                                  variant={userItem.role === 'admin' ? 'default' : 'secondary'}
                                  className="ml-2"
                                >
                                  {userItem.role}
                                </Badge>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Analytics & Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Analytics Dashboard</h3>
                  <p className="text-muted-foreground">Advanced analytics and reporting features coming soon.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
