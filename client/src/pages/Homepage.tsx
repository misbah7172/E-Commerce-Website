import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Users, Globe } from "lucide-react";
import CategorySlider from "@/components/CategorySlider";
import BackgroundSlider from "@/components/BackgroundSlider";

export default function Homepage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Background Slider */}
      <BackgroundSlider className="h-64 md:h-screen">
        <div className="container mx-auto px-4 h-full flex items-center justify-center">
          <div className="w-full max-w-4xl mx-auto space-y-3 md:space-y-8 text-center">
            {/* Main Headline - Updated Sep 5, 2025 */}
            <div className="space-y-2 md:space-y-6">
              <h1 className="text-2xl md:text-6xl lg:text-8xl font-bold text-white leading-tight tracking-tight drop-shadow-lg">
                FOR AMAZING
              </h1>
              <h2 className="text-lg md:text-4xl lg:text-6xl font-light text-gray-300 leading-relaxed drop-shadow-md">
                SHOPPING EXPERIENCE
              </h2>
            </div>

            {/* Subtitle */}
            <div className="max-w-2xl mx-auto">
              <p className="text-xs md:text-2xl lg:text-3xl text-gray-500 font-light leading-relaxed drop-shadow-sm text-center">
                ShopHub - Your premium e-commerce destination. Quality products, 
                unbeatable prices, and exceptional service.
              </p>
              <div className="flex justify-center">
                <Link href="/products">
                  <Button className="mt-3 md:mt-12 bg-transparent text-black hover:bg-gray-100 px-4 md:px-12 py-2 md:py-6 text-sm md:text-xl lg:text-2xl font-medium rounded-none shadow-xl">
                    VISIT OUR SHOP
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </BackgroundSlider>

      {/* Categories Slider Section */}
      <CategorySlider />

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
    </div>
  );
}

