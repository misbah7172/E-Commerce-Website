import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { Link } from "wouter";

export default function Wishlist() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: wishlistItems = [], isLoading } = useQuery({
    queryKey: ["/api/wishlist"],
    enabled: !!user,
  });

  const removeFromWishlistMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/wishlist/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
      toast({
        title: "Removed from wishlist",
        description: "Item has been removed from your wishlist.",
      });
    },
  });

  const addToCartMutation = useMutation({
    mutationFn: (productId: string) => apiRequest("POST", "/api/cart", {
      productId,
      quantity: 1,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to cart",
        description: "Item has been added to your cart.",
      });
    },
  });

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in</h1>
          <p className="text-muted-foreground">You need to sign in to view your wishlist.</p>
          <Link href="/login">
            <Button className="mt-4">Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-4">
          <div className="h-8 bg-muted rounded w-1/4 animate-pulse"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-square bg-muted"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-3 bg-muted rounded mb-2"></div>
                  <div className="h-6 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold flex items-center gap-2" data-testid="text-wishlist-title">
            <Heart className="h-6 w-6 text-red-500" />
            My Wishlist
          </h1>
          <p className="text-muted-foreground">
            {wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''} saved for later
          </p>
        </div>

        {wishlistItems.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Your wishlist is empty</h3>
              <p className="text-muted-foreground mb-4">
                Save your favorite items to your wishlist and check them out later.
              </p>
              <Link href="/products">
                <Button>Start Shopping</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((item: any) => (
              <Card key={item.id} className="group hover:shadow-lg transition-shadow" data-testid={`wishlist-item-${item.id}`}>
                <div className="relative overflow-hidden">
                  <Link href={`/products/${item.product.id}`}>
                    <div className="aspect-square bg-muted">
                      {item.product.images && item.product.images[0] ? (
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          No Image
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Remove Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 bg-background/80 hover:bg-background"
                    onClick={() => removeFromWishlistMutation.mutate(item.id)}
                    disabled={removeFromWishlistMutation.isPending}
                    data-testid={`button-remove-${item.id}`}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>

                  {/* Stock Status */}
                  {item.product.stock === 0 && (
                    <div className="absolute bottom-2 left-2">
                      <span className="bg-destructive text-destructive-foreground px-2 py-1 rounded text-xs font-medium">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>

                <CardContent className="p-4">
                  <Link href={`/products/${item.product.id}`}>
                    <h3 className="font-semibold text-sm mb-2 line-clamp-2 hover:text-primary transition-colors" data-testid={`text-product-name-${item.id}`}>
                      {item.product.name}
                    </h3>
                  </Link>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={`text-xs ${
                            i < Math.floor(Number(item.product.rating))
                              ? "text-yellow-400"
                              : "text-muted-foreground"
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">({item.product.reviewCount})</span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg font-bold text-foreground" data-testid={`text-price-${item.id}`}>
                      ${item.product.price}
                    </span>
                    {item.product.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        ${item.product.originalPrice}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => addToCartMutation.mutate(item.product.id)}
                      disabled={item.product.stock === 0 || addToCartMutation.isPending}
                      className="flex-1"
                      size="sm"
                      data-testid={`button-add-to-cart-${item.id}`}
                    >
                      {addToCartMutation.isPending ? (
                        "Adding..."
                      ) : item.product.stock === 0 ? (
                        "Out of Stock"
                      ) : (
                        <>
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Add to Cart
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Added Date */}
                  <p className="text-xs text-muted-foreground mt-2">
                    Added {new Date(item.addedAt).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
