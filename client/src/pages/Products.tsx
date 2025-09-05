import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Grid, List, Filter } from "lucide-react";
import type { Product, Category } from "@shared/schema";

export default function Products() {
  const [location] = useLocation();
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  
  const [filters, setFilters] = useState({
    search: urlParams.get('search') || '',
    categoryId: urlParams.get('categoryId') || '',
    minPrice: 0,
    maxPrice: 1000,
    sortBy: 'name' as 'name' | 'price' | 'rating' | 'created',
    sortOrder: 'asc' as 'asc' | 'desc',
  });
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.categoryId) params.append('categoryId', filters.categoryId);
      if (filters.minPrice > 0) params.append('minPrice', filters.minPrice.toString());
      if (filters.maxPrice < 1000) params.append('maxPrice', filters.maxPrice.toString());
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
      
      const url = `/api/products${params.toString() ? '?' + params.toString() : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      return response.json();
    },
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1] || '');
    setFilters(prev => ({
      ...prev,
      search: params.get('search') || '',
      categoryId: params.get('categoryId') || '',
    }));
  }, [location]);

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handlePriceRangeChange = (values: number[]) => {
    setFilters(prev => ({
      ...prev,
      minPrice: values[0],
      maxPrice: values[1]
    }));
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Filters Sidebar */}
        <div className={`w-full lg:w-64 ${showFilters ? 'block' : 'hidden'} lg:block`}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-base sm:text-lg">
                Filters
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="lg:hidden"
                  onClick={() => setShowFilters(false)}
                >
                  ×
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              {/* Categories */}
              <div>
                <h4 className="font-medium mb-3 text-sm sm:text-base">Categories</h4>
                <div className="space-y-2">
                  {categories.map((category: Category) => (
                    <div key={category.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={category.id}
                        checked={filters.categoryId === category.id}
                        onCheckedChange={(checked) => 
                          handleFilterChange('categoryId', checked ? category.id : '')
                        }
                        data-testid={`checkbox-category-${category.id}`}
                      />
                      <label htmlFor={category.id} className="text-sm">
                        {category.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h4 className="font-medium mb-3">Price Range</h4>
                <div className="space-y-3">
                  <Slider
                    value={[filters.minPrice, filters.maxPrice]}
                    onValueChange={handlePriceRangeChange}
                    max={1000}
                    step={10}
                    className="w-full"
                    data-testid="slider-price-range"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>${filters.minPrice}</span>
                    <span>${filters.maxPrice}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <Button
                variant="outline"
                size="sm"
                className="lg:hidden w-fit"
                onClick={() => setShowFilters(true)}
                data-testid="button-show-filters"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <span className="text-muted-foreground text-sm sm:text-base" data-testid="text-product-count">
                {products.length} products found
              </span>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              {/* Sort */}
              <Select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onValueChange={(value) => {
                  const [sortBy, sortOrder] = value.split('-');
                  setFilters(prev => ({
                    ...prev,
                    sortBy: sortBy as any,
                    sortOrder: sortOrder as any
                  }));
                }}
              >
                <SelectTrigger className="w-full sm:w-40" data-testid="select-sort">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name-asc">Name A-Z</SelectItem>
                  <SelectItem value="name-desc">Name Z-A</SelectItem>
                  <SelectItem value="price-asc">Price Low-High</SelectItem>
                  <SelectItem value="price-desc">Price High-Low</SelectItem>
                  <SelectItem value="rating-desc">Highest Rated</SelectItem>
                  <SelectItem value="created-desc">Newest</SelectItem>
                </SelectContent>
              </Select>

              {/* View Mode */}
              <div className="flex border border-border rounded-lg w-fit">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  data-testid="button-grid-view"
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  data-testid="button-list-view"
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>          {/* Products Grid/List */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="aspect-square bg-muted"></div>
                  <CardContent className="p-3 sm:p-4">
                    <div className="h-3 sm:h-4 bg-muted rounded mb-2"></div>
                    <div className="h-2 sm:h-3 bg-muted rounded mb-2"></div>
                    <div className="h-4 sm:h-6 bg-muted rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-base sm:text-lg font-semibold mb-2">No products found</h3>
              <p className="text-muted-foreground text-sm sm:text-base">Try adjusting your filters or search terms.</p>
            </div>
          ) : (
            <div className={
              viewMode === 'grid' 
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
                : "space-y-4"
            }>
              {products.map((product: Product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
