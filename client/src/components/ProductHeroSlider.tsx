import { useState, useEffect } from "react";

// Hero images for products page
const productHeroImages = [
  "/images/categories/Fashion.jpg",
  "/images/categories/beauty.jpg",
  "/images/categories/gadgets.jpg",
  "/images/categories/sports.jpg",
];

interface ProductHeroSliderProps {
  title?: string;
  subtitle?: string;
  breadcrumb?: string;
}

export default function ProductHeroSlider({ 
  title = "Products", 
  subtitle = "Discover our amazing collection",
  breadcrumb = "HOME / SHOP / PRODUCTS"
}: ProductHeroSliderProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Auto-slide functionality - change image every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % productHeroImages.length
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative h-64 md:h-80 lg:h-96 overflow-hidden">
      {/* Background Images */}
      <div className="absolute inset-0">
        {productHeroImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentImageIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={image}
              alt={`Product hero ${index + 1}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to gradient if image fails
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.parentElement!.classList.add('bg-gradient-to-br', 'from-green-400', 'to-blue-500');
              }}
            />
          </div>
        ))}
        
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Content overlay */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl">
            {/* Breadcrumb */}
            <p className="text-white/80 text-sm font-medium mb-4 tracking-wider">
              {breadcrumb}
            </p>
            
            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-lg">
              {title}
            </h1>
            
            {/* Subtitle */}
            <p className="text-lg md:text-xl text-white/90 drop-shadow-md">
              {subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
        {productHeroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImageIndex(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 border border-white/50 ${
              index === currentImageIndex 
                ? "bg-white" 
                : "bg-white/30 hover:bg-white/60"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
