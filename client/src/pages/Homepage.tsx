import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import ProductCard from "@/components/ProductCard";
import { useQuery } from "@tanstack/react-query";
import { Laptop, Shirt, Home, Dumbbell, Star } from "lucide-react";

export default function Homepage() {
  const { data: featuredProducts = [] } = useQuery({
    queryKey: ["/api/products", { limit: 8, sortBy: "rating", sortOrder: "desc" }],
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
  });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-secondary text-primary-foreground">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-4" data-testid="text-hero-title">
              Summer Sale
            </h1>
            <p className="text-xl mb-8 opacity-90" data-testid="text-hero-subtitle">
              Up to 70% off on electronics and gadgets
            </p>
            <Link href="/products">
              <Button 
                size="lg" 
                className="bg-background text-foreground hover:bg-background/90"
                data-testid="button-shop-now"
              >
                Shop Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8" data-testid="text-categories-title">
            Shop by Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer group" data-testid="card-category-electronics">
              <CardContent className="p-6 text-center">
                <Laptop className="h-12 w-12 mx-auto mb-4 text-primary group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold">Electronics</h3>
                <p className="text-sm text-muted-foreground">2,143 products</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer group" data-testid="card-category-fashion">
              <CardContent className="p-6 text-center">
                <Shirt className="h-12 w-12 mx-auto mb-4 text-primary group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold">Fashion</h3>
                <p className="text-sm text-muted-foreground">5,892 products</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer group" data-testid="card-category-home">
              <CardContent className="p-6 text-center">
                <Home className="h-12 w-12 mx-auto mb-4 text-primary group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold">Home & Garden</h3>
                <p className="text-sm text-muted-foreground">1,567 products</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer group" data-testid="card-category-sports">
              <CardContent className="p-6 text-center">
                <Dumbbell className="h-12 w-12 mx-auto mb-4 text-primary group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold">Sports</h3>
                <p className="text-sm text-muted-foreground">987 products</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold" data-testid="text-featured-title">
              Featured Products
            </h2>
            <Link href="/products">
              <Button variant="outline">View All</Button>
            </Link>
          </div>
          
          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.slice(0, 4).map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
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
          )}
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4" data-testid="text-newsletter-title">
                Stay Updated
              </h3>
              <p className="text-muted-foreground mb-6">
                Subscribe to our newsletter for the latest deals and new arrivals
              </p>
              <form className="flex gap-4 max-w-md mx-auto">
                <Input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="flex-1"
                  data-testid="input-newsletter-email"
                />
                <Button type="submit" data-testid="button-newsletter-subscribe">
                  Subscribe
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
