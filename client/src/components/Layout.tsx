import { ReactNode, useState } from "react";
import { useVisitorTracking } from "@/hooks/useVisitorTracking";
import Header from "./Header";
import CartDrawer from "./CartDrawer";
import Footer from "./Footer";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [cartOpen, setCartOpen] = useState(false);
  
  // Initialize visitor tracking inside the QueryClientProvider context
  useVisitorTracking();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header onCartClick={() => setCartOpen(true)} />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
    </div>
  );
}
