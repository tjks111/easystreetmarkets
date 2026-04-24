'use client';

import { useState } from 'react';
import type { Product } from '@/lib/types';
import PodProductModal from './PodProductModal';

interface PodCardInteractiveProps {
  product: Product;
  children: React.ReactNode;
  className?: string;
}

export default function PodCardInteractive({ product, children, className }: PodCardInteractiveProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsModalOpen(true);
        }}
        className={className}
        aria-label={`View options for ${product.name}`}
      >
        {children}
      </button>

      {isModalOpen && (
        <PodProductModal 
          product={product} 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </>
  );
}