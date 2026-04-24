'use client';

import { useShoppingCart } from 'use-shopping-cart';
import { formatPrice } from '@/lib/utils';
import { useState } from 'react';

export default function CartDrawer() {
  const { cartDetails, cartCount, totalPrice, shouldDisplayCart, handleCloseCart, removeItem } = useShoppingCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  if (!shouldDisplayCart) return null;

  const items = Object.values(cartDetails ?? {});

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartDetails }),
      });
      
      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm transition-opacity"
        onClick={handleCloseCart}
      />
      
      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-cream shadow-2xl z-[70] flex flex-col transform transition-transform duration-300">
        <div className="p-6 border-b border-forest/10 flex items-center justify-between">
          <h2 className="text-xl font-bold text-forest">Your Cart</h2>
          <button 
            onClick={handleCloseCart}
            className="p-2 hover:bg-forest/10 rounded-full transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {cartCount === 0 ? (
            <div className="text-center text-foreground/60 py-12">
              <span className="text-4xl block mb-4">🛒</span>
              Your cart is empty.
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-4">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded bg-white" />
                ) : (
                  <div className="w-20 h-20 bg-white rounded border border-forest/10 flex items-center justify-center text-2xl">
                    🌿
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-medium text-sm line-clamp-2">{item.name}</h3>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-forest font-semibold">{formatPrice(item.price / 100, item.price / 100)}</span>
                    <span className="text-sm text-foreground/60">Qty: {item.quantity}</span>
                  </div>
                  <button 
                    onClick={() => removeItem(item.id)}
                    className="text-xs text-red-500 hover:text-red-700 mt-2"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {cartCount !== undefined && cartCount > 0 && (
          <div className="p-6 border-t border-forest/10 bg-white">
            <div className="flex justify-between items-center mb-6 text-lg font-bold">
              <span>Total</span>
              <span className="text-forest">{formatPrice((totalPrice || 0) / 100, (totalPrice || 0) / 100)}</span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={isCheckingOut}
              className="w-full bg-forest text-cream py-4 rounded-lg font-bold text-lg hover:bg-forest/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCheckingOut ? 'Processing...' : 'Checkout'}
            </button>
          </div>
        )}
      </div>
    </>
  );
}