"use client";

import { useEffect } from 'react';
import { useShoppingCart } from 'use-shopping-cart';
import Link from 'next/link';

export default function SuccessPage() {
  const { clearCart } = useShoppingCart();

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-cream text-forest">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm text-center">
        <div className="w-16 h-16 bg-forest/10 text-forest rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold mb-4">Order Confirmed!</h1>
        <p className="text-lg text-forest/80 mb-8">
          Thank you for your purchase. We're processing your order and will email you with shipping details soon.
        </p>
        <Link 
          href="/"
          className="inline-block w-full bg-forest text-cream py-4 rounded-lg font-bold text-lg hover:bg-forest/90 transition-colors"
        >
          Return to Shop
        </Link>
      </div>
    </main>
  );
}
