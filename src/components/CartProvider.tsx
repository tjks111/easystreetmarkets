'use client';

import { ReactNode } from 'react';
import { CartProvider as USCCartProvider } from 'use-shopping-cart';

export default function CartProvider({ children }: { children: ReactNode }) {
  const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';

  return (
    <USCCartProvider
      mode="payment"
      cartMode="client-only"
      stripe={stripeKey}
      successUrl={`${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/success`}
      cancelUrl={`${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/`}
      currency="USD"
      allowedCountries={['US', 'GB', 'CA', 'AU']}
      billingAddressCollection={true}
      shouldPersist={true}
    >
      {children}
    </USCCartProvider>
  );
}
