import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "./AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import { Search, ShoppingCart, User, Heart, Menu } from "lucide-react";
import type { CartItem, Product, WishlistItem } from "@shared/schema";

interface HeaderProps {
  onCartClick?: () => void;
}

export default function Header({ onCartClick }: HeaderProps) {
  const [location, navigate] = useLocation();
  const { user, logout, isAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: cartItems = [] } = useQuery<(CartItem & { product: Product })[]>({
    queryKey: ["/api/cart"],
    enabled: !!user,
  });

  const { data: wishlistItems = [] } = useQuery<(WishlistItem & { product: Product })[]>({
    queryKey: ["/api/wishlist"],
    enabled: !!user,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const cartItemCount = cartItems.reduce((total: number, item) => total + item.quantity, 0);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <ShoppingCart className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">ShopHub</span>
            </Link>

            {/* Search Bar - Desktop */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg mx-8">
              <div className="relative w-full">
                <Input
                  type="text"
                  placeholder="Search products, brands, categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              </div>
            </form>

            {/* Navigation Actions */}
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  {/* Cart */}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="relative" 
                    data-testid="button-cart"
                    onClick={onCartClick}
                  >
                    <ShoppingCart className="h-5 w-5" />
                    {cartItemCount > 0 && (
                      <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                        {cartItemCount}
                      </Badge>
                    )}
                  </Button>

                  {/* Wishlist */}
                  <Link href="/wishlist">
                    <Button variant="ghost" size="sm" className="relative">
                      <Heart className="h-5 w-5" />
                      {wishlistItems.length > 0 && (
                        <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                          {wishlistItems.length}
                        </Badge>
                      )}
                    </Button>
                  </Link>

                  {/* User Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                        <User className="h-5 w-5" />
                        <span className="hidden sm:inline">{user.displayName || user.email}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href="/profile">My Profile</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/orders">My Orders</Link>
                      </DropdownMenuItem>
                      {isAdmin && (
                        <DropdownMenuItem asChild>
                          <Link href="/admin">Admin Panel</Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={logout}>
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <Link href="/login">
                  <Button>Sign In</Button>
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden pb-4">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              </div>
            </form>
          </div>
        </div>
      </header>

      {/* Category Navigation */}
      <nav className="border-b border-border bg-muted">
        <div className="container mx-auto px-4">
          <div className="flex items-center space-x-8 py-3 overflow-x-auto">
            <Link href="/products?category=electronics" className="whitespace-nowrap text-sm font-medium text-foreground hover:text-primary transition-colors">
              Electronics
            </Link>
            <Link href="/products?category=fashion" className="whitespace-nowrap text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Fashion
            </Link>
            <Link href="/products?category=home" className="whitespace-nowrap text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Home & Garden
            </Link>
            <Link href="/products?category=sports" className="whitespace-nowrap text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Sports
            </Link>
            <Link href="/products?category=books" className="whitespace-nowrap text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Books
            </Link>
            <Link href="/products?category=beauty" className="whitespace-nowrap text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Beauty
            </Link>
            <Link href="/products?category=automotive" className="whitespace-nowrap text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Automotive
            </Link>
          </div>
        </div>
      </nav>
    </>
  );
}
