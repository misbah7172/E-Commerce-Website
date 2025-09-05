import { Users, Heart, Globe } from "lucide-react";
import { Separator } from "./ui/separator";
import { useQuery } from "@tanstack/react-query";

export default function Footer() {
  // Fetch visitor analytics
  const { data: analytics } = useQuery({
    queryKey: ['/api/analytics/visitors'],
    queryFn: async () => {
      const response = await fetch('/api/analytics/visitors');
      if (!response.ok) {
        throw new Error('Failed to fetch visitor analytics');
      }
      return response.json();
    },
    refetchInterval: 60000, // Refresh every minute
    staleTime: 30000, // Consider data stale after 30 seconds
  });

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-8">
        {/* Top section with visitor count and links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Visitor Statistics */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Live Statistics
            </h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" />
                <span>Unique Visitors: {analytics?.uniqueVisitors?.toLocaleString() || '0'}</span>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live tracking active</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Quick Links</h3>
            <div className="space-y-2 text-sm">
              <a href="/" className="block hover:text-primary transition-colors">
                Home
              </a>
              <a href="/products" className="block hover:text-primary transition-colors">
                Products
              </a>
              <a href="/login" className="block hover:text-primary transition-colors">
                Account
              </a>
            </div>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Support</h3>
            <div className="space-y-2 text-sm">
              <a href="/help" className="block hover:text-primary transition-colors">
                Help Center
              </a>
              <a href="/contact" className="block hover:text-primary transition-colors">
                Contact Us
              </a>
              <a href="/returns" className="block hover:text-primary transition-colors">
                Returns
              </a>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Bottom section with copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-red-500" />
            <span>Made with love for online shopping</span>
          </div>
          
          <div className="text-center md:text-right">
            <p>&copy; {currentYear} ShopHub. All rights reserved by Misbah.</p>
            <p className="text-xs mt-1">
              Tracking {analytics?.uniqueVisitors?.toLocaleString() || '0'} unique visitors from around the world
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
