import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Star, ShoppingCart, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Product } from "@shared/schema";

interface ProductCardWithSliderProps {
  product: Product;
  viewMode?: 'grid' | 'list';
}

export default function ProductCardWithSlider({ product, viewMode = 'grid' }: ProductCardWithSliderProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Get product images, only use actual product images if available
  const getProductImages = () => {
    if (product.images && product.images.length > 1) {
      // Only return actual product images if there are multiple
      return product.images;
    } else if (product.images && product.images.length === 1) {
      // If only one image, just return that one (no sliding)
      return product.images;
    } else {
      // If no images, return single fallback
      return ['/images/categories/gadgets.jpg'];
    }
  };
  
  const productImages = getProductImages();
  const shouldSlide = productImages.length > 1;

  // Auto-slide functionality for product images every 3 seconds
  useEffect(() => {
    if (!shouldSlide) return; // Don't slide if only one image

    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % productImages.length
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [productImages.length, shouldSlide]);

  // Calculate discount percentage
  const originalPrice = typeof product.originalPrice === 'number' ? product.originalPrice : parseFloat(product.price?.toString() || '0');
  const currentPrice = parseFloat(product.price?.toString() || '0');
  const discountPercentage = originalPrice > currentPrice 
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : 0;

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Image Section */}
          <div className="relative w-full md:w-48 h-48 overflow-hidden">
            {discountPercentage > 0 && (
              <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded z-10">
                -{discountPercentage}%
              </div>
            )}
            
            {/* Image rendering - conditional sliding */}
            {shouldSlide ? (
              /* Sliding images container for multiple images */
              <div className="relative w-full h-full overflow-hidden bg-gray-100">
                {productImages.map((image, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 w-full h-full transition-transform duration-500 ease-in-out ${
                      index === currentImageIndex ? 'translate-x-0' : 
                      index < currentImageIndex ? '-translate-x-full' : 'translate-x-full'
                    }`}
                  >
                    <img
                      src={image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/images/categories/gadgets.jpg';
                      }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              /* Single image - no sliding */
              <img
                src={productImages[0]}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/images/categories/gadgets.jpg';
                }}
              />
            )}
            
            {/* Image indicators for multiple images */}
            {shouldSlide && (
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                {productImages.map((_, index) => (
                  <div
                    key={index}
                    className={`w-1.5 h-1.5 rounded-full ${
                      index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="flex-1 p-4">
            <Link href={`/products/${product.id}`}>
              <h3 className="font-semibold text-lg text-gray-900 mb-2 hover:text-blue-600 transition-colors line-clamp-2">
                {product.name}
              </h3>
            </Link>
            
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
            
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(parseFloat(product.rating || '0'))
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">({product.rating || '0'})</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-gray-900">${currentPrice}</span>
                {discountPercentage > 0 && (
                  <span className="text-sm text-gray-500 line-through">${originalPrice}</span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" className="p-2">
                  <Heart className="h-4 w-4" />
                </Button>
                <Button size="sm" className="px-4">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div 
      className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Section */}
      <div className="relative aspect-square overflow-hidden">
        {discountPercentage > 0 && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded z-10">
            -{discountPercentage}%
          </div>
        )}
        
        {/* Image rendering - conditional sliding */}
        {shouldSlide ? (
          /* Sliding images container for multiple images */
          <div className="relative w-full h-full overflow-hidden bg-gray-100">
            {productImages.map((image, index) => (
              <div
                key={index}
                className={`absolute inset-0 w-full h-full transition-all duration-500 ease-in-out group-hover:scale-105 ${
                  index === currentImageIndex ? 'translate-x-0 opacity-100' : 
                  index < currentImageIndex ? '-translate-x-full opacity-0' : 'translate-x-full opacity-0'
                }`}
              >
                <img
                  src={image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/images/categories/gadgets.jpg';
                  }}
                />
              </div>
            ))}
          </div>
        ) : (
          /* Single image - no sliding */
          <img
            src={productImages[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/images/categories/gadgets.jpg';
            }}
          />
        )}
        
        {/* Image indicators for multiple images */}
        {shouldSlide && (
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-1">
            {productImages.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
        
        {/* Hover Actions */}
        <div className={`absolute inset-0 bg-black/20 flex items-center justify-center transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" className="rounded-full p-2">
              <Heart className="h-4 w-4" />
            </Button>
            <Button size="sm" className="rounded-full px-4">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add to Cart
            </Button>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4">
        <Link href={`/products/${product.id}`}>
          <h3 className="font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>
        
        <div className="flex items-center gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-3 w-3 ${
                i < Math.floor(parseFloat(product.rating || '0'))
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              }`}
            />
          ))}
          <span className="text-xs text-gray-500 ml-1">({product.rating || '0'})</span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-gray-900">${currentPrice}</span>
          {discountPercentage > 0 && (
            <span className="text-sm text-gray-500 line-through">${originalPrice}</span>
          )}
        </div>
      </div>
    </div>
  );
}
