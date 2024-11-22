import React from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, Users, DollarSign } from 'lucide-react';
import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
  showActions?: boolean;
}

export default function ProductCard({ product, showActions = true }: ProductCardProps) {
  return (
    <div className="bg-surface border border-surface-light rounded-lg overflow-hidden hover:border-primary/50 transition-colors">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Package className="h-5 w-5 text-primary" />
            <span className="px-2 py-1 text-xs font-medium text-primary bg-primary/10 rounded-full">
              {product.type}
            </span>
          </div>
          <div className="text-lg font-bold text-white">
            ${product.price}
          </div>
        </div>

        <h3 className="text-xl font-semibold text-white mb-2">
          {product.title}
        </h3>

        <p className="text-gray-400 mb-4 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            {product.delivery_method === 'live' ? 'Live Session' : 'On Demand'}
          </div>
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            {product.enrolled_count || 0} enrolled
          </div>
        </div>

        {showActions && (
          <div className="mt-6 flex space-x-3">
            <Link
              to={`/products/${product.id}`}
              className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-surface-light text-sm font-medium rounded-md text-white hover:bg-surface-light"
            >
              Learn More
            </Link>
            <button
              onClick={() => {/* Handle purchase */}}
              className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90"
            >
              <DollarSign className="h-4 w-4 mr-1" />
              Purchase
            </button>
          </div>
        )}
      </div>
    </div>
  );
}