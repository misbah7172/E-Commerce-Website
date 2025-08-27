import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/AuthProvider";
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
  Trash2
} from "lucide-react";
import { Link, useLocation } from "wouter";

export default function Admin() {
  const { user, isAdmin } = useAuth();
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: stats } = useQuery({
    queryKey: ["/api/admin/stats"],
    enabled: !!user && isAdmin,
  });

  const { data: orders = [] } = useQuery({
    queryKey: ["/api/orders"],
    enabled: !!user && isAdmin,
  });

  const { data: products = [] } = useQuery({
    queryKey: ["/api/products", { limit: 50 }],
    enabled: !!user && isAdmin,
  });

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

  const recentOrders = orders.slice(0, 5);
  const lowStockProducts = products.filter((product: any) => product.stock <= 5);

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
            <Button data-testid="button-add-product">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
            <Button variant="outline" data-testid="button-export-data">
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
                      {orders.slice(0, 10).map((order: any) => (
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
                            <Select defaultValue={order.status}>
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
                              <Button size="sm" variant="outline" data-testid={`button-view-order-${order.id}`}>
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="outline" data-testid={`button-edit-order-${order.id}`}>
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
                    <Button data-testid="button-add-new-product">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Product
                    </Button>
                    <Button variant="outline" data-testid="button-import-products">
                      <Download className="h-4 w-4 mr-2" />
                      Import CSV
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.slice(0, 12).map((product: any) => (
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
                          <Badge className={product.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                            {product.isActive ? "Active" : "Inactive"}
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
                          <Button size="sm" variant="outline" className="flex-1" data-testid={`button-edit-product-${product.id}`}>
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button size="sm" variant="outline" data-testid={`button-view-product-${product.id}`}>
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" className="text-destructive" data-testid={`button-delete-product-${product.id}`}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">User Management</h3>
                  <p className="text-muted-foreground">User management features coming soon.</p>
                </div>
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
