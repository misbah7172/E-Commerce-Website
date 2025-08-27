import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, CreditCard, Truck, Shield } from "lucide-react";

export default function Checkout() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);

  const [shippingInfo, setShippingInfo] = useState({
    firstName: "",
    lastName: "",
    email: user?.email || "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "US",
  });

  const [paymentMethod, setPaymentMethod] = useState("card");
  const [shippingMethod, setShippingMethod] = useState("standard");

  const { data: cartItems = [], isLoading } = useQuery({
    queryKey: ["/api/cart"],
    enabled: !!user,
  });

  const { data: addresses = [] } = useQuery({
    queryKey: ["/api/addresses"],
    enabled: !!user,
  });

  const createOrderMutation = useMutation({
    mutationFn: (orderData: any) => apiRequest("POST", "/api/orders", orderData),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Order placed successfully!",
        description: `Order #${response.orderNumber} has been created.`,
      });
      navigate("/orders");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to place order. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (!user) {
    navigate("/login");
    return null;
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="h-64 bg-muted rounded"></div>
              <div className="h-48 bg-muted rounded"></div>
            </div>
            <div className="h-96 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
          <p className="text-muted-foreground mb-8">Add some products to your cart before checkout.</p>
          <Button onClick={() => navigate("/products")}>
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  const subtotal = cartItems.reduce(
    (total: number, item: any) => total + Number(item.product.price) * item.quantity,
    0
  );

  const shippingCost = shippingMethod === "express" ? 9.99 : shippingMethod === "overnight" ? 24.99 : 0;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shippingCost + tax;

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handlePlaceOrder = async () => {
    const orderData = {
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      shipping: shippingCost.toFixed(2),
      total: total.toFixed(2),
      shippingAddress: shippingInfo,
      paymentMethod,
      paymentStatus: "pending",
      items: cartItems.map((item: any) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.product.price,
        variantId: item.variantId,
      })),
    };

    createOrderMutation.mutate(orderData);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => navigate("/cart")} data-testid="button-back">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cart
          </Button>
          <h1 className="text-2xl font-bold" data-testid="text-checkout-title">Checkout</h1>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>
                1
              </div>
              <span className={`ml-2 ${step >= 1 ? "text-primary" : "text-muted-foreground"}`}>
                Shipping
              </span>
            </div>
            <div className="flex-1 h-px bg-border"></div>
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>
                2
              </div>
              <span className={`ml-2 ${step >= 2 ? "text-primary" : "text-muted-foreground"}`}>
                Payment
              </span>
            </div>
            <div className="flex-1 h-px bg-border"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-muted text-muted-foreground rounded-full flex items-center justify-center text-sm font-medium">
                3
              </div>
              <span className="ml-2 text-muted-foreground">Review</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {step === 1 && (
              <>
                {/* Shipping Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Truck className="h-5 w-5" />
                      Shipping Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleShippingSubmit} className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            value={shippingInfo.firstName}
                            onChange={(e) => setShippingInfo(prev => ({ ...prev, firstName: e.target.value }))}
                            required
                            data-testid="input-first-name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            value={shippingInfo.lastName}
                            onChange={(e) => setShippingInfo(prev => ({ ...prev, lastName: e.target.value }))}
                            required
                            data-testid="input-last-name"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={shippingInfo.email}
                          onChange={(e) => setShippingInfo(prev => ({ ...prev, email: e.target.value }))}
                          required
                          data-testid="input-email"
                        />
                      </div>

                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={shippingInfo.phone}
                          onChange={(e) => setShippingInfo(prev => ({ ...prev, phone: e.target.value }))}
                          required
                          data-testid="input-phone"
                        />
                      </div>

                      <div>
                        <Label htmlFor="street">Address</Label>
                        <Input
                          id="street"
                          value={shippingInfo.street}
                          onChange={(e) => setShippingInfo(prev => ({ ...prev, street: e.target.value }))}
                          placeholder="123 Main Street"
                          required
                          data-testid="input-address"
                        />
                      </div>

                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            value={shippingInfo.city}
                            onChange={(e) => setShippingInfo(prev => ({ ...prev, city: e.target.value }))}
                            required
                            data-testid="input-city"
                          />
                        </div>
                        <div>
                          <Label htmlFor="state">State</Label>
                          <Input
                            id="state"
                            value={shippingInfo.state}
                            onChange={(e) => setShippingInfo(prev => ({ ...prev, state: e.target.value }))}
                            required
                            data-testid="input-state"
                          />
                        </div>
                        <div>
                          <Label htmlFor="zipCode">ZIP Code</Label>
                          <Input
                            id="zipCode"
                            value={shippingInfo.zipCode}
                            onChange={(e) => setShippingInfo(prev => ({ ...prev, zipCode: e.target.value }))}
                            required
                            data-testid="input-zip"
                          />
                        </div>
                      </div>

                      <Button type="submit" className="w-full" data-testid="button-continue-payment">
                        Continue to Payment
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Shipping Options */}
                <Card>
                  <CardHeader>
                    <CardTitle>Shipping Options</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup value={shippingMethod} onValueChange={setShippingMethod}>
                      <div className="flex items-center justify-between border border-border rounded-lg p-4">
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="standard" id="standard" />
                          <Label htmlFor="standard" className="flex-1">
                            <div className="font-medium">Standard Shipping</div>
                            <div className="text-sm text-muted-foreground">5-7 business days</div>
                          </Label>
                        </div>
                        <span className="font-medium">Free</span>
                      </div>

                      <div className="flex items-center justify-between border border-border rounded-lg p-4">
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="express" id="express" />
                          <Label htmlFor="express" className="flex-1">
                            <div className="font-medium">Express Shipping</div>
                            <div className="text-sm text-muted-foreground">2-3 business days</div>
                          </Label>
                        </div>
                        <span className="font-medium">$9.99</span>
                      </div>

                      <div className="flex items-center justify-between border border-border rounded-lg p-4">
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="overnight" id="overnight" />
                          <Label htmlFor="overnight" className="flex-1">
                            <div className="font-medium">Overnight Shipping</div>
                            <div className="text-sm text-muted-foreground">Next business day</div>
                          </Label>
                        </div>
                        <span className="font-medium">$24.99</span>
                      </div>
                    </RadioGroup>
                  </CardContent>
                </Card>
              </>
            )}

            {step === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="flex items-center justify-between border border-border rounded-lg p-4">
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="card" id="card" />
                        <Label htmlFor="card" className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          Credit/Debit Card
                        </Label>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border border-border rounded-lg p-4">
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="paypal" id="paypal" />
                        <Label htmlFor="paypal" className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          PayPal
                        </Label>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border border-border rounded-lg p-4">
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="cod" id="cod" />
                        <Label htmlFor="cod" className="flex items-center gap-2">
                          <Truck className="h-4 w-4" />
                          Cash on Delivery
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>

                  {paymentMethod === "card" && (
                    <div className="space-y-4 pt-4 border-t border-border">
                      <div>
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input
                          id="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          data-testid="input-card-number"
                        />
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiry">Expiry Date</Label>
                          <Input
                            id="expiry"
                            placeholder="MM/YY"
                            data-testid="input-card-expiry"
                          />
                        </div>
                        <div>
                          <Label htmlFor="cvv">CVV</Label>
                          <Input
                            id="cvv"
                            placeholder="123"
                            data-testid="input-card-cvv"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                      Back to Shipping
                    </Button>
                    <Button 
                      onClick={handlePlaceOrder} 
                      disabled={createOrderMutation.isPending}
                      className="flex-1"
                      data-testid="button-place-order"
                    >
                      {createOrderMutation.isPending ? "Placing Order..." : "Place Order"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items */}
                <div className="space-y-3">
                  {cartItems.map((item: any) => (
                    <div key={item.id} className="flex items-center space-x-3" data-testid={`order-item-${item.id}`}>
                      <img
                        src={item.product.images?.[0] || "/placeholder.jpg"}
                        alt={item.product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{item.product.name}</h4>
                        <p className="text-muted-foreground text-xs">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-medium text-sm">
                        ${(Number(item.product.price) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span data-testid="text-subtotal">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping:</span>
                    <span data-testid="text-shipping">
                      {shippingCost === 0 ? "Free" : `$${shippingCost.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax:</span>
                    <span data-testid="text-tax">${tax.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>Total:</span>
                    <span data-testid="text-total">${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Security Notice */}
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Secure Checkout</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Your payment information is encrypted and secure.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
