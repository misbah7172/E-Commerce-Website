import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import ProductCard from "@/components/ProductCard";
import { useQuery } from "@tanstack/react-query";
import { Laptop, Shirt, Home, Dumbbell, Star, ShoppingCart, ArrowRight } from "lucide-react";
import type { Product, Category } from "@shared/schema";
import { useEffect, useState } from "react";

export default function Homepage() {
  const [api, setApi] = useState<any>();
  const [current, setCurrent] = useState(0);

  // Auto-slide functionality
  useEffect(() => {
    if (!api) return;

    const intervalId = setInterval(() => {
      api.scrollNext();
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(intervalId);
  }, [api]);

  useEffect(() => {
    if (!api) return;

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const { data: featuredProducts = [] } = useQuery<Product[]>({
    queryKey: ["/api/products", { limit: 8, sortBy: "rating", sortOrder: "desc" }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('limit', '8');
      params.append('sortBy', 'rating');
      params.append('sortOrder', 'desc');
      
      const url = `/api/products?${params.toString()}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch featured products');
      }
      
      return response.json();
    },
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Get all products to count by category
  const { data: allProducts = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    queryFn: async () => {
      const response = await fetch('/api/products');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      return response.json();
    },
  });

  // Calculate product counts by category
  const getProductCountByCategory = (categoryName: string) => {
    const category = categories.find(cat => 
      cat.name?.toLowerCase() === categoryName.toLowerCase()
    );
    if (!category) return 0;
    
    return allProducts.filter(product => 
      product.categoryId === category.id
    ).length;
  };

  // Find category by name for navigation
  const getCategoryByName = (categoryName: string) => {
    return categories.find(cat => 
      cat.name?.toLowerCase() === categoryName.toLowerCase()
    );
  };

  return (
    <div className="min-h-screen">
      {/* Enhanced Hero Section with Product Slider */}
            {/* Enhanced Hero Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-32 bg-gradient-to-br from-blue-600 via-purple-600 to-teal-500 text-white relative overflow-hidden min-h-[500px] sm:min-h-[600px] lg:min-h-[700px] flex items-center">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Hero Content */}
            <div className="space-y-6 lg:space-y-8 text-center lg:text-left">
              <div className="space-y-3 lg:space-y-4">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight" data-testid="text-hero-title">
                  Discover Amazing Products
                </h1>
                <p className="text-lg sm:text-xl md:text-2xl text-white/90 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  Shop from thousands of premium products with unbeatable prices and quality guaranteed
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center justify-center lg:justify-start">
                <Link href="/products">
                  <Button size="lg" className="w-full sm:w-auto bg-white text-gray-900 hover:bg-gray-100 font-semibold text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4" data-testid="button-shop-now">
                    <ShoppingCart className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    Shop Now
                  </Button>
                </Link>
                <Link href="/products">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto border-white text-gray-900 hover:bg-white hover:text-gray-900 font-semibold text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4">
                    Learn More
                    <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 sm:gap-6 pt-6 sm:pt-8 border-t border-white/20">
                <div className="text-center">
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold">50K+</div>
                  <div className="text-xs sm:text-sm opacity-80">Happy Customers</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold">10K+</div>
                  <div className="text-xs sm:text-sm opacity-80">Products</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold">99%</div>
                  <div className="text-xs sm:text-sm opacity-80">Satisfaction</div>
                </div>
              </div>
            </div>

            {/* Product Slider */}
            <div className="relative">
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-white/20"></div>
              <div className="relative p-4 sm:p-6 lg:p-8">
                <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center">Featured Products</h3>
                {featuredProducts.length > 0 ? (
                  <Carousel 
                    setApi={setApi}
                    className="w-full"
                    opts={{
                      align: "start",
                      loop: true,
                    }}
                  >
                    <CarouselContent className="-ml-2 sm:-ml-4">
                      {featuredProducts.slice(0, 6).map((product: Product, index) => (
                        <CarouselItem key={product.id} className="pl-2 sm:pl-4 basis-full sm:basis-1/2">
                          <Card className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg hover:scale-105">
                            <CardContent className="p-0">
                              <div className="relative aspect-square overflow-hidden rounded-t-lg">
                                {product.images && product.images[0] ? (
                                  <img
                                    src={product.images[0]}
                                    alt={product.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                    <Laptop className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400" />
                                  </div>
                                )}
                                {product.originalPrice && parseFloat(product.originalPrice) > parseFloat(product.price) && (
                                  <div className="absolute top-2 sm:top-4 left-2 sm:left-4 bg-red-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">
                                    {Math.round(((parseFloat(product.originalPrice) - parseFloat(product.price)) / parseFloat(product.originalPrice)) * 100)}% OFF
                                  </div>
                                )}
                              </div>
                              <div className="p-3 sm:p-4 bg-white">
                                <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm sm:text-base">
                                  {product.name}
                                </h4>
                                <div className="flex items-center justify-between">
                                  <div className="flex flex-col">
                                    <span className="font-bold text-green-600 text-base sm:text-lg">
                                      ${product.price}
                                    </span>
                                    {product.originalPrice && parseFloat(product.originalPrice) > parseFloat(product.price) && (
                                      <span className="text-gray-400 line-through text-xs sm:text-sm">
                                        ${product.originalPrice}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center">
                                    <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 fill-current" />
                                    <span className="text-xs sm:text-sm text-gray-600 ml-1">
                                      {product.rating || "4.5"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="left-1 sm:left-2 bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 h-8 w-8 sm:h-10 sm:w-10" />
                    <CarouselNext className="right-1 sm:right-2 bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 h-8 w-8 sm:h-10 sm:w-10" />
                  </Carousel>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {[...Array(4)].map((_, i) => (
                      <Card key={i} className="animate-pulse">
                        <div className="aspect-square bg-white/20 rounded-t-lg"></div>
                        <CardContent className="p-3 sm:p-4 bg-white/10 backdrop-blur-sm">
                          <div className="h-3 sm:h-4 bg-white/20 rounded mb-2"></div>
                          <div className="h-2 sm:h-3 bg-white/20 rounded mb-2"></div>
                          <div className="h-4 sm:h-6 bg-white/20 rounded"></div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Slider Indicators */}
                {featuredProducts.length > 0 && (
                  <div className="flex justify-center mt-4 sm:mt-6 space-x-2">
                    {featuredProducts.slice(0, 6).map((_, index) => (
                      <button
                        key={index}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          index === current 
                            ? "bg-white w-6 sm:w-8" 
                            : "bg-white/40 hover:bg-white/60"
                        }`}
                        onClick={() => api?.scrollTo(index)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-10 sm:top-20 left-4 sm:left-10 w-16 sm:w-20 h-16 sm:h-20 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 sm:bottom-20 right-4 sm:right-10 w-20 sm:w-32 h-20 sm:h-32 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/4 w-3 sm:w-4 h-3 sm:h-4 bg-white/30 rounded-full"></div>
        <div className="absolute top-1/3 right-1/3 w-4 sm:w-6 h-4 sm:h-6 bg-white/20 rounded-full"></div>
      </section>

      {/* Enhanced Featured Categories */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4" data-testid="text-categories-title">
              Shop by Category
            </h2>
            <p className="text-base sm:text-lg text-gray-600">
              Explore our diverse range of product categories
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            <Link href={`/products?categoryId=${getCategoryByName('electronics')?.id || ''}`}>
              <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-lg hover:scale-105" data-testid="card-category-electronics">
                <CardContent className="p-4 sm:p-6 lg:p-8 text-center">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 mx-auto mb-3 sm:mb-4 lg:mb-6 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <Laptop className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-blue-600 group-hover:scale-110 transition-transform" />
                  </div>
                  <h3 className="font-bold text-sm sm:text-base lg:text-lg mb-1 sm:mb-2 text-gray-900">Electronics</h3>
                  <p className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-4">
                    {getProductCountByCategory('electronics')} products
                  </p>
                  <div className="w-6 sm:w-8 h-1 bg-gradient-to-r from-blue-500 to-blue-600 mx-auto rounded-full"></div>
                </CardContent>
              </Card>
            </Link>

            <Link href={`/products?categoryId=${getCategoryByName('fashion')?.id || ''}`}>
              <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-lg hover:scale-105" data-testid="card-category-fashion">
                <CardContent className="p-4 sm:p-6 lg:p-8 text-center">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 mx-auto mb-3 sm:mb-4 lg:mb-6 bg-pink-100 rounded-full flex items-center justify-center group-hover:bg-pink-200 transition-colors">
                    <Shirt className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-pink-600 group-hover:scale-110 transition-transform" />
                  </div>
                  <h3 className="font-bold text-sm sm:text-base lg:text-lg mb-1 sm:mb-2 text-gray-900">Fashion</h3>
                  <p className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-4">
                    {getProductCountByCategory('fashion')} products
                  </p>
                  <div className="w-6 sm:w-8 h-1 bg-gradient-to-r from-pink-500 to-pink-600 mx-auto rounded-full"></div>
                </CardContent>
              </Card>
            </Link>

            <Link href={`/products?categoryId=${getCategoryByName('home')?.id || ''}`}>
              <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-lg hover:scale-105" data-testid="card-category-home">
                <CardContent className="p-4 sm:p-6 lg:p-8 text-center">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 mx-auto mb-3 sm:mb-4 lg:mb-6 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
                    <Home className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-green-600 group-hover:scale-110 transition-transform" />
                  </div>
                  <h3 className="font-bold text-sm sm:text-base lg:text-lg mb-1 sm:mb-2 text-gray-900">Home & Garden</h3>
                  <p className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-4">
                    {getProductCountByCategory('home')} products
                  </p>
                  <div className="w-6 sm:w-8 h-1 bg-gradient-to-r from-green-500 to-green-600 mx-auto rounded-full"></div>
                </CardContent>
              </Card>
            </Link>

            <Link href={`/products?categoryId=${getCategoryByName('sports')?.id || ''}`}>
              <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-lg hover:scale-105" data-testid="card-category-sports">
                <CardContent className="p-4 sm:p-6 lg:p-8 text-center">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 mx-auto mb-3 sm:mb-4 lg:mb-6 bg-orange-100 rounded-full flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                    <Dumbbell className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-orange-600 group-hover:scale-110 transition-transform" />
                  </div>
                  <h3 className="font-bold text-sm sm:text-base lg:text-lg mb-1 sm:mb-2 text-gray-900">Sports</h3>
                  <p className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-4">
                    {getProductCountByCategory('sports')} products
                  </p>
                  <div className="w-6 sm:w-8 h-1 bg-gradient-to-r from-orange-500 to-orange-600 mx-auto rounded-full"></div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Enhanced Featured Products Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4" data-testid="text-featured-title">
              Top Rated Products
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Discover our most popular and highest-rated products loved by thousands of customers
            </p>
          </div>
          
          {featuredProducts.length > 0 ? (
            <div className="relative">
              <Carousel
                opts={{
                  align: "start",
                  loop: true,
                }}
                className="w-full"
              >
                <CarouselContent className="-ml-6">
                  {featuredProducts.map((product: Product) => (
                    <CarouselItem key={product.id} className="pl-6 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                      <div className="h-full">
                        <ProductCard product={product} />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-4 bg-white shadow-lg border border-gray-200 hover:bg-gray-50" />
                <CarouselNext className="right-4 bg-white shadow-lg border border-gray-200 hover:bg-gray-50" />
              </Carousel>
              
              <div className="text-center mt-8 sm:mt-10">
                <Link href="/products">
                  <Button size="lg" className="px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold">
                    View All Products
                    <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="aspect-square bg-gray-200 rounded-t-lg"></div>
                  <CardContent className="p-3 sm:p-4">
                    <div className="h-3 sm:h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-2 sm:h-3 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 sm:h-6 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Enhanced Newsletter Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Card className="max-w-4xl mx-auto bg-white/10 backdrop-blur-sm border border-white/20 shadow-2xl">
            <CardContent className="p-6 sm:p-8 lg:p-12 text-center">
              <div className="mb-6 sm:mb-8">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Star className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-300" />
                </div>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4" data-testid="text-newsletter-title">
                  Stay Updated
                </h3>
                <p className="text-base sm:text-lg lg:text-xl opacity-90 mb-6 sm:mb-8 max-w-2xl mx-auto">
                  Subscribe to our newsletter for the latest deals, new arrivals, and exclusive offers delivered straight to your inbox
                </p>
              </div>
              
              <form className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-md mx-auto mb-6 sm:mb-8">
                <Input 
                  type="email" 
                  placeholder="Enter your email address" 
                  className="flex-1 bg-white/20 border-white/30 text-white placeholder-white/70 backdrop-blur-sm focus:bg-white/30 text-sm sm:text-base"
                  data-testid="input-newsletter-email"
                />
                <Button 
                  type="submit" 
                  size="lg"
                  className="bg-white text-gray-900 hover:bg-gray-100 font-semibold px-6 sm:px-8 text-sm sm:text-base"
                  data-testid="button-newsletter-subscribe"
                >
                  Subscribe
                </Button>
              </form>
              
              <p className="text-xs sm:text-sm opacity-75">
                Join 50,000+ subscribers and never miss a deal! 
                <br />
                You can unsubscribe at any time.
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-4 sm:top-10 left-4 sm:left-10 w-16 sm:w-24 h-16 sm:h-24 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-4 sm:bottom-10 right-4 sm:right-10 w-20 sm:w-32 h-20 sm:h-32 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/4 w-4 sm:w-6 h-4 sm:h-6 bg-white/20 rounded-full"></div>
        <div className="absolute top-1/4 right-1/3 w-6 sm:w-8 h-6 sm:h-8 bg-white/10 rounded-full"></div>
      </section>
    </div>
  );
}
