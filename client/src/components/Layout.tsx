import { ReactNode, useState } from "react";
import Header from "./Header";
import CartDrawer from "./CartDrawer";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header onCartClick={() => setCartOpen(true)} />
      <main>{children}</main>
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
    </div>
  );
}
