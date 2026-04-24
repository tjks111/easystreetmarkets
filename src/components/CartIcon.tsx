'use client';

import { useShoppingCart } from 'use-shopping-cart';
import { useState, useEffect } from 'react';

export default function CartIcon() {
  const { cartCount, handleCartClick } = useShoppingCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="relative p-2 text-foreground hover:text-forest transition-colors">
        🛒
      </button>
    );
  }

  return (
    <button 
      onClick={handleCartClick}
      className="relative p-2 text-foreground hover:text-forest transition-colors flex items-center"
    >
      <span className="text-xl">🛒</span>
      {cartCount && cartCount > 0 ? (
        <span className="absolute -top-1 -right-1 bg-forest text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">
          {cartCount}
        </span>
      ) : null}
    </button>
  );
}