import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/components/AuthProvider";
import { Package, Truck, CheckCircle, Clock, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function Orders() {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["/api/orders", { status: statusFilter === "all" ? undefined : statusFilter }],
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in</h1>
          <p className="text-muted-foreground">You need to sign in to view your orders.</p>
          <Link href="/login">
            <Button className="mt-4">Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "processing":
        return <Package className="h-4 w-4" />;
      case "shipped":
        return <Truck className="h-4 w-4" />;
      case "delivered":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getOrderProgress = (status: string) => {
    const statuses = ["pending", "confirmed", "processing", "shipped", "delivered"];
    const currentIndex = statuses.indexOf(status);
    return ((currentIndex + 1) / statuses.length) * 100;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-4">
          <div className="h-8 bg-muted rounded w-1/4 animate-pulse"></div>
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded w-1/3"></div>
                  <div className="h-4 bg-muted rounded w-1/4"></div>
                  <div className="h-20 bg-muted rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-orders-title">My Orders</h1>
            <p className="text-muted-foreground">Track and manage your orders</p>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40" data-testid="select-order-status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No orders found</h3>
              <p className="text-muted-foreground mb-4">
                {statusFilter === "all" 
                  ? "You haven't placed any orders yet."
                  : `No orders with status "${statusFilter}" found.`
                }
              </p>
              <Link href="/products">
                <Button>Start Shopping</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order: any) => (
              <Card key={order.id} className="overflow-hidden" data-testid={`order-card-${order.id}`}>
                <CardHeader className="bg-muted/50">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg" data-testid={`text-order-number-${order.id}`}>
                        Order #{order.orderNumber}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Placed on {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className={`${getStatusColor(order.status)} mb-2`} data-testid={`badge-status-${order.id}`}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1 capitalize">{order.status}</span>
                      </Badge>
                      <p className="font-bold text-lg" data-testid={`text-order-total-${order.id}`}>
                        ${order.total}
                      </p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  {/* Order Progress */}
                  <div className="mb-6">
                    <div className="flex justify-between text-sm text-muted-foreground mb-2">
                      <span>Order Progress</span>
                      <span>{Math.round(getOrderProgress(order.status))}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${getOrderProgress(order.status)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="mb-6">
                    <h4 className="font-medium mb-3">Items ({order.items?.length || 0})</h4>
                    <div className="space-y-3">
                      {order.items?.slice(0, 3).map((item: any) => (
                        <div key={item.id} className="flex items-center space-x-3" data-testid={`order-item-${item.id}`}>
                          <img
                            src={item.product.images?.[0] || "/placeholder.jpg"}
                            alt={item.product.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{item.product.name}</p>
                            <p className="text-muted-foreground text-xs">
                              Qty: {item.quantity} × ${item.price}
                            </p>
                          </div>
                          <span className="font-medium text-sm">
                            ${(Number(item.price) * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      )) || []}
                      
                      {order.items && order.items.length > 3 && (
                        <p className="text-sm text-muted-foreground">
                          +{order.items.length - 3} more items
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Order Timeline */}
                  {(order.status === "shipped" || order.status === "delivered") && (
                    <div className="mb-6">
                      <h4 className="font-medium mb-3">Shipping Timeline</h4>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                          <span>Order confirmed</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                          <span>Processing completed</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                          <span>Shipped</span>
                        </div>
                        {order.status === "delivered" && (
                          <div className="flex items-center text-sm">
                            <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                            <span>Delivered</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3">
                    <Button variant="outline" size="sm" data-testid={`button-view-details-${order.id}`}>
                      View Details
                    </Button>
                    
                    {order.status === "shipped" && (
                      <Button variant="outline" size="sm" data-testid={`button-track-shipment-${order.id}`}>
                        <Truck className="h-4 w-4 mr-2" />
                        Track Shipment
                      </Button>
                    )}
                    
                    {order.receiptUrl && (
                      <Button variant="outline" size="sm" data-testid={`button-download-receipt-${order.id}`}>
                        Download Receipt
                      </Button>
                    )}
                    
                    {order.status === "delivered" && (
                      <Button variant="outline" size="sm" data-testid={`button-reorder-${order.id}`}>
                        Reorder
                      </Button>
                    )}
                    
                    {(order.status === "pending" || order.status === "confirmed") && (
                      <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                        Cancel Order
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
