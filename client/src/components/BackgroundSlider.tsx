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

  // Auto-slide functionality - change image every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % heroImages.length
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className={`relative overflow-hidden ${className}`}>
      {/* Background Images with fade in/out effect */}
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
      <div className="relative z-10 flex items-center justify-center h-full">
        <div className="w-full">
          {children}
        </div>
      </div>
    </section>
  );
}
