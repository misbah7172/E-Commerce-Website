import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Star, Users, Globe } from "lucide-react";
import type { Product, Category } from "@shared/schema";
import { useState } from "react";

export default function Homepage() {
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);

  // Get all products to find highest rated by category
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

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Get highest rated product from each category
  const getTopProductsByCategory = () => {
    const topProducts: Product[] = [];
    
    categories.forEach(category => {
      const categoryProducts = allProducts.filter(product => 
        product.categoryId === category.id
      );
      
      if (categoryProducts.length > 0) {
        // Sort by rating (descending) and get the highest rated
        const topProduct = categoryProducts.sort((a, b) => {
          const ratingA = parseFloat(a.rating || '0');
          const ratingB = parseFloat(b.rating || '0');
          return ratingB - ratingA;
        })[0];
        
        topProducts.push(topProduct);
      }
    });
    
    return topProducts;
  };

  const topCategoryProducts = getTopProductsByCategory();
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Melula Style */}
      <section className="bg-white py-20 lg:py-32">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Main Headline - Updated Sep 5, 2025 */}
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 leading-tight tracking-tight">
                FOR AMAZING
              </h1>
              <h2 className="text-3xl lg:text-5xl font-light text-gray-600 leading-relaxed">
                SHOPPING EXPERIENCE
              </h2>
            </div>

            {/* Subtitle */}
            <div className="max-w-2xl mx-auto">
              <p className="text-xl lg:text-2xl text-gray-600 font-light leading-relaxed">
                ShopHub - Your premium e-commerce destination. Quality products, 
                unbeatable prices, and exceptional service. (Updated Sep 5, 2025)
              </p>
              <Link href="/products">
                <Button className="mt-8 bg-black text-white hover:bg-gray-800 px-8 py-4 text-lg font-medium rounded-none">
                  VISIT OUR SHOP
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Product Grid Section - Top Rated by Category */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">
              CATEGORY CHAMPIONS
            </h2>
            <p className="text-lg text-gray-600">
              Highest rated products from each category
            </p>
          </div>
          
          {topCategoryProducts.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
              {topCategoryProducts.map((product) => {
                const category = categories.find(cat => cat.id === product.categoryId);
                
                return (
                  <div 
                    key={product.id} 
                    className="group relative"
                    onMouseEnter={() => setHoveredProduct(product.id)}
                    onMouseLeave={() => setHoveredProduct(null)}
                  >
                    <Link href={`/products/${product.id}`}>
                      <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group-hover:scale-105 relative">
                        {/* Category Badge */}
                        <div className="absolute top-3 left-3 z-10">
                          <span className="bg-black text-white text-xs font-medium px-2 py-1 rounded-full">
                            {category?.name || 'Category'}
                          </span>
                        </div>
                        
                        {/* Rating Badge */}
                        <div className="absolute top-3 right-3 z-10">
                          <div className="bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                            <Star className="h-3 w-3 fill-current" />
                            {product.rating || '5.0'}
                          </div>
                        </div>

                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-64 lg:h-80 object-cover"
                          />
                        ) : (
                          <div className="w-full h-64 lg:h-80 bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-400">No Image</span>
                          </div>
                        )}

                        {/* Hover Tooltip */}
                        {hoveredProduct === product.id && (
                          <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 transition-all duration-300">
                            <div className="text-white text-center space-y-2">
                              <h3 className="font-bold text-lg line-clamp-2">{product.name}</h3>
                              <p className="text-sm opacity-90 line-clamp-3">{product.description}</p>
                              <div className="flex items-center justify-center gap-4 pt-2">
                                <span className="text-xl font-bold text-green-400">${product.price}</span>
                                <div className="flex items-center gap-1">
                                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                  <span className="text-sm">{product.rating || '5.0'}</span>
                                </div>
                              </div>
                              <p className="text-xs opacity-75">Click to view details</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Brand Story Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <h2 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
              ShopHub Premium Store
            </h2>
            <p className="text-xl lg:text-2xl text-gray-600 font-light leading-relaxed max-w-3xl mx-auto">
              A modern e-commerce platform offering quality products with exceptional service. 
              Designed for convenience, built for quality.
            </p>
            <Link href="/products">
              <Button variant="outline" className="border-black text-black hover:bg-black hover:text-white px-8 py-4 text-lg font-medium rounded-none">
                Read our story
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">
              EXPLORE CATEGORIES
            </h2>
          </div>
          
          {categories.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {categories.slice(0, 6).map((category) => (
                <Link key={category.id} href={`/products?categoryId=${category.id}`}>
                  <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer bg-white border-0 rounded-lg overflow-hidden">
                    <CardContent className="p-0">
                      {category.image ? (
                        <img
                          src={category.image}
                          alt={category.name}
                          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <span className="text-2xl font-bold text-gray-400">{category.name}</span>
                        </div>
                      )}
                      <div className="p-6 text-center">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{category.name}</h3>
                        <p className="text-gray-600">{category.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-12">
            They talk about us
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="space-y-4">
              <div className="flex justify-center">
                <Star className="h-12 w-12 text-yellow-400 fill-current" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Premium Quality</h3>
              <p className="text-gray-600">Hand-picked products with guaranteed quality and satisfaction.</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-center">
                <Users className="h-12 w-12 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Happy Customers</h3>
              <p className="text-gray-600">Thousands of satisfied customers worldwide trust our service.</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-center">
                <Globe className="h-12 w-12 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Global Shipping</h3>
              <p className="text-gray-600">Fast and reliable shipping to customers around the world.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl lg:text-4xl font-bold">Subscribe</h2>
            <p className="text-lg text-gray-300">
              Sign up with your email address to receive news and updates.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 text-gray-900 rounded-none border-0 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <Button className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-3 rounded-none font-medium">
                SIGN UP
              </Button>
            </div>
            
            <p className="text-sm text-gray-400">We respect your privacy.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

