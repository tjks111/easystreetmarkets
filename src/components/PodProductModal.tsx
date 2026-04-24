'use client';

import { useEffect, useState } from 'react';
import { useShoppingCart } from 'use-shopping-cart';
import { createPortal } from 'react-dom';
import type { Product } from '@/lib/types';
import { formatPrice } from '@/lib/utils';

interface PodProductModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

const SIZES = ['S', 'M', 'L', 'XL', '2XL'];
// Default colors if product has no variants
const DEFAULT_COLORS = ['Black', 'White', 'Navy'];

export default function PodProductModal({ product, isOpen, onClose }: PodProductModalProps) {
  const { addItem } = useShoppingCart();
  
  const [mounted, setMounted] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>('L');
  
  // Extract colors from variants or use defaults
  const availableColors = product.variants && product.variants.length > 0 
    ? product.variants.map(v => v.color) 
    : DEFAULT_COLORS;
    
  const [selectedColor, setSelectedColor] = useState<string>(availableColors[0] || 'Black');
  
  // Determine the current image to show based on selected color
  const currentVariant = product.variants?.find(v => v.color === selectedColor);
  const displayImage = currentVariant?.image_url || product.image_url;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!mounted || !isOpen) return null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stripe_price_id && product.price_min) {
      addItem({
        id: product.stripe_price_id,
        name: `${product.name} - ${selectedSize} / ${selectedColor}`,
        price: Math.round(product.price_min * 100),
        currency: 'USD',
        image: displayImage || undefined,
        sku: product.printful_variant_id,
        product_data: {
          size: selectedSize,
          color: selectedColor
        }
      });
      onClose(); // Optional: close modal after adding, or show a success message
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    // If they clicked the container itself (not the modal content inside it), close the modal
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const modalContent = (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-12"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity pointer-events-none"
        aria-hidden="true"
      />
      
      {/* Modal Dialog */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col md:flex-row transform transition-all animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/80 hover:bg-gray-100 rounded-full text-gray-500 hover:text-gray-700 transition-colors shadow-sm"
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {/* Image Section */}
        <div className="w-full md:w-1/2 bg-sand/30 flex items-center justify-center p-8 relative min-h-[300px]">
          {displayImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img 
              src={displayImage} 
              alt={product.name} 
              className="w-full h-auto object-contain max-h-[60vh] drop-shadow-md transition-opacity duration-300"
            />
          ) : (
            <div className="text-6xl">👕</div>
          )}
        </div>

        {/* Details Section */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col">
          <div className="mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-forest/70">
              {product.category.replace('-', ' ')}
            </span>
          </div>
          
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            {product.name}
          </h2>
          
          <div className="text-xl font-semibold text-forest mb-6">
            {formatPrice(product.price_min, product.price_max)}
          </div>
          
          {product.description && (
            <p className="text-gray-600 mb-8 leading-relaxed">
              {product.description}
            </p>
          )}

          {/* Color Selector */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-gray-900">Color</span>
              <span className="text-sm text-gray-500">{selectedColor}</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {availableColors.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`relative w-10 h-10 rounded-full border-2 focus:outline-none transition-all ${
                    selectedColor === color 
                      ? 'border-forest ring-2 ring-forest/20 ring-offset-2 scale-110 shadow-md' 
                      : 'border-gray-200 hover:border-gray-300 hover:scale-105'
                  }`}
                  style={{ 
                    backgroundColor: color.toLowerCase() === 'navy' ? '#1a2a40' 
                                   : color.toLowerCase() === 'white' ? '#f8f9fa' 
                                   : color.toLowerCase() === 'black' ? '#111827'
                                   : color.toLowerCase() 
                  }}
                  title={color}
                  aria-label={`Select ${color}`}
                >
                  {selectedColor === color && color.toLowerCase() === 'white' && (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-800">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  {selectedColor === color && color.toLowerCase() !== 'white' && (
                    <div className="absolute inset-0 flex items-center justify-center text-white">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Size Selector */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-gray-900">Size</span>
              <a href="#" className="text-sm text-forest hover:underline">Size Guide</a>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`flex-1 min-w-[3rem] py-3 rounded-lg text-sm font-medium transition-all ${
                    selectedSize === size
                      ? 'bg-forest text-white shadow-md'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Add to Cart CTA */}
          <div className="mt-auto">
            <button
              onClick={handleAddToCart}
              className="w-full py-4 bg-forest hover:bg-forest/90 text-white rounded-xl font-bold text-lg shadow-lg shadow-forest/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              Add to Cart - {formatPrice(product.price_min, product.price_max)}
            </button>
            <p className="text-center text-xs text-gray-500 mt-4 flex items-center justify-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              Secure checkout via Stripe
            </p>
          </div>
          
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}