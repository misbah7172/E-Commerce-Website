import { useState, useEffect } from "react";

// Hero background images - using the category images we have
const heroImages = [
  "/images/categories/Fashion.jpg",
  "/images/categories/gadgets.jpg", 
  "/images/categories/beauty.jpg",
  "/images/categories/sports.jpg",
  "/images/categories/automotive.jpg",
  "/images/categories/books.jpg",
];

interface BackgroundSliderProps {
  children: React.ReactNode;
  className?: string;
}

export default function BackgroundSlider({ children, className = "" }: BackgroundSliderProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Auto-slide functionality - change image every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % heroImages.length
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className={`relative overflow-hidden ${className}`}>
      {/* Background Images */}
      <div className="absolute inset-0">
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentImageIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={image}
              alt={`Hero background ${index + 1}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to gradient if image fails
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.parentElement!.classList.add('bg-gradient-to-br', 'from-gray-100', 'to-gray-300');
              }}
            />
          </div>
        ))}
        
        {/* Overlay for text readability - reduced opacity */}
        <div className="absolute inset-0 bg-white/40" />
      </div>

      {/* Content overlay */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImageIndex(index)}
            className={`w-4 h-4 rounded-full transition-all duration-300 border-2 border-white shadow-lg ${
              index === currentImageIndex 
                ? "bg-black border-white" 
                : "bg-white/50 hover:bg-white/80"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
