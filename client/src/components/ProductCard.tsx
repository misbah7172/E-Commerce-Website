import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "./AuthProvider";
import { Heart, ShoppingCart, Star } from "lucide-react";
import type { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Reset image index when product changes
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [product.id]);

  // Image slider effect - auto-slide every 2 seconds
  useEffect(() => {
    if (!product.images || product.images.length === 0) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => {
        // If only one image, keep cycling it (0 -> 0)
        if (product.images!.length === 1) return 0;
        // For multiple images, cycle through them
        return (prevIndex + 1) % product.images!.length;
      });
    }, 2000); // 2 second interval

    return () => clearInterval(interval);
  }, [product.images]);

  const addToCartMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/cart", {
      productId: product.id,
      quantity: 1,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add item to cart.",
        variant: "destructive",
      });
    },
  });

  const toggleWishlistMutation = useMutation({
    mutationFn: () => {
      if (isInWishlist) {
        return apiRequest("DELETE", `/api/wishlist/${product.id}`);
      } else {
        return apiRequest("POST", "/api/wishlist", {
          productId: product.id,
        });
      }
    },
    onSuccess: () => {
      setIsInWishlist(!isInWishlist);
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
      toast({
        title: isInWishlist ? "Removed from wishlist" : "Added to wishlist",
        description: `${product.name} has been ${isInWishlist ? "removed from" : "added to"} your wishlist.`,
      });
    },
  });

  const handleAddToCart = () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to sign in to add items to cart.",
        variant: "destructive",
      });
      return;
    }
    addToCartMutation.mutate();
  };

  const handleToggleWishlist = () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to sign in to manage your wishlist.",
        variant: "destructive",
      });
      return;
    }
    toggleWishlistMutation.mutate();
  };

  const discountPercentage = product.originalPrice 
    ? Math.round(((Number(product.originalPrice) - Number(product.price)) / Number(product.originalPrice)) * 100)
    : 0;

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-300 overflow-hidden h-full flex flex-col" data-testid={`card-product-${product.id}`}>
      <div className="relative overflow-hidden">
        <Link href={`/products/${product.id}`}>
          <div className="aspect-square bg-muted relative overflow-hidden">
            {product.images && product.images.length > 0 ? (
              <div className="relative w-full h-full">
                {/* Current Image */}
                <img
                  key={`${product.id}-${currentImageIndex}`}
                  src={product.images[currentImageIndex] || product.images[0]}
                  alt={`${product.name} - Image ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 product-image-slide"
                />
                
                {/* Image indicators for multiple images */}
                {product.images.length > 1 && (
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                    {product.images.map((_, index) => (
                      <div
                        key={index}
                        className={`w-1.5 h-1.5 rounded-full transition-colors duration-200 ${
                          index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                No Image
              </div>
            )}
          </div>
        </Link>
        
        {/* Wishlist Button */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 bg-background/80 hover:bg-background h-8 w-8 p-0 rounded-full"
          onClick={handleToggleWishlist}
          data-testid={`button-wishlist-${product.id}`}
        >
          <Heart className={`h-4 w-4 ${isInWishlist ? "fill-red-500 text-red-500" : ""}`} />
        </Button>

        {/* Discount Badge */}
        {discountPercentage > 0 && (
          <Badge className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-xs px-2 py-1">
            -{discountPercentage}%
          </Badge>
        )}

        {/* Stock Status */}
        {product.stock === 0 && (
          <Badge className="absolute bottom-2 left-2 bg-muted text-muted-foreground text-xs px-2 py-1">
            Out of Stock
          </Badge>
        )}
      </div>

      <CardContent className="p-3 sm:p-4 flex-1 flex flex-col">
        <Link href={`/products/${product.id}`}>
          <h3 className="font-semibold text-sm sm:text-base mb-2 line-clamp-2 hover:text-primary transition-colors" data-testid={`text-product-name-${product.id}`}>
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2 flex-1">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${
                  i < Math.floor(Number(product.rating))
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-base sm:text-lg font-bold text-foreground" data-testid={`text-price-${product.id}`}>
            ${product.price}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              ${product.originalPrice}
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <Button
          onClick={handleAddToCart}
          disabled={product.stock === 0 || addToCartMutation.isPending}
          className="w-full mt-auto"
          size="sm"
          data-testid={`button-add-to-cart-${product.id}`}
        >
          {addToCartMutation.isPending ? (
            "Adding..."
          ) : product.stock === 0 ? (
            "Out of Stock"
          ) : (
            <>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add to Cart
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
