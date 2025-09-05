import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import type { Category } from "@shared/schema";
import type { UseEmblaCarouselType } from "embla-carousel-react";

type CarouselApi = UseEmblaCarouselType[1];

// Category images mapping
const categoryImages = {
  "automotive": "/images/categories/automotive.jpg",
  "beauty": "/images/categories/beauty.jpg", 
  "books": "/images/categories/books.jpg",
  "cloths": "/images/categories/cloths.jpg",
  "fashion": "/images/categories/Fashion.jpg",
  "gadgets": "/images/categories/gadgets.jpg",
  "medicine": "/images/categories/medicine.jpg",
  "sports": "/images/categories/sports.jpg",
};

interface CategorySliderProps {
  className?: string;
}

export default function CategorySlider({ className = "" }: CategorySliderProps) {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [api, setApi] = useState<CarouselApi>();

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Auto-slide functionality
  useEffect(() => {
    if (!api) return;

    const interval = setInterval(() => {
      api.scrollNext();
    }, 2000); // Auto-slide every 2 seconds

    return () => clearInterval(interval);
  }, [api]);

  // Function to get category image
  const getCategoryImage = (categoryName: string) => {
    const normalizedName = categoryName.toLowerCase();
    
    // Direct match
    if (categoryImages[normalizedName as keyof typeof categoryImages]) {
      return categoryImages[normalizedName as keyof typeof categoryImages];
    }
    
    // Partial match for similar names
    const matchingKey = Object.keys(categoryImages).find(key => 
      normalizedName.includes(key) || key.includes(normalizedName)
    );
    
    if (matchingKey) {
      return categoryImages[matchingKey as keyof typeof categoryImages];
    }
    
    // Default fallback
    return "/images/categories/gadgets.jpg";
  };

  if (!categories.length) {
    return null;
  }

  return (
    <section className={`py-16 bg-gray-50 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">
            EXPLORE CATEGORIES
          </h2>
          <p className="text-lg text-gray-600">
            Discover our premium collection across all categories
          </p>
        </div>

        <Carousel
          setApi={setApi}
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full max-w-7xl mx-auto"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {categories.map((category) => (
              <CarouselItem
                key={category.id}
                className="pl-2 md:pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
              >
                <Link href={`/products?categoryId=${category.id}`}>
                  <div
                    className="group relative overflow-hidden rounded-xl bg-white shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer h-80"
                    onMouseEnter={() => setHoveredCategory(category.id)}
                    onMouseLeave={() => setHoveredCategory(null)}
                  >
                    {/* Category Image */}
                    <div className="relative w-full h-full overflow-hidden">
                      <img
                        src={getCategoryImage(category.name)}
                        alt={category.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => {
                          // Fallback to a gradient background if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.parentElement!.classList.add('bg-gradient-to-br', 'from-gray-200', 'to-gray-400');
                        }}
                      />
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-opacity duration-300" />
                      
                      {/* Category Name - Always Visible */}
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <h3 className="text-white text-xl font-bold mb-2 transform transition-transform duration-300">
                          {category.name}
                        </h3>
                        
                        {/* Hover Content */}
                        <div
                          className={`transform transition-all duration-300 ${
                            hoveredCategory === category.id
                              ? "translate-y-0 opacity-100"
                              : "translate-y-4 opacity-0"
                          }`}
                        >
                          <p className="text-white/90 text-sm mb-3 line-clamp-2">
                            {category.description || "Discover amazing products in this category"}
                          </p>
                          <div className="inline-flex items-center text-white text-sm font-medium">
                            Shop Now
                            <svg
                              className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>
                      
                      {/* Hover Border Effect */}
                      <div
                        className={`absolute inset-0 border-4 border-white transition-opacity duration-300 ${
                          hoveredCategory === category.id ? "opacity-100" : "opacity-0"
                        }`}
                      />
                    </div>
                  </div>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
          
          {/* Navigation Arrows */}
          <CarouselPrevious className="absolute -left-12 top-1/2 -translate-y-1/2 bg-white border-2 border-gray-300 hover:bg-gray-50 h-12 w-12" />
          <CarouselNext className="absolute -right-12 top-1/2 -translate-y-1/2 bg-white border-2 border-gray-300 hover:bg-gray-50 h-12 w-12" />
        </Carousel>
        
        {/* View All Categories Button */}
        <div className="text-center mt-12">
          <Link href="/products">
            <button className="bg-black text-white hover:bg-gray-800 px-8 py-4 text-lg font-medium rounded-none transition-colors duration-300">
              VIEW ALL PRODUCTS
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
