import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Lock, CheckCircle } from 'lucide-react';
import { createCheckoutSession } from '../lib/services/stripe';
import { toast } from 'react-hot-toast';
import type { Product } from '../types';

interface PurchaseFlowProps {
  product: Product;
  onClose: () => void;
}

export default function PurchaseFlow({ product, onClose }: PurchaseFlowProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    try {
      setLoading(true);
      await createCheckoutSession(product.id, product.stripe_price_id);
      setStep(2);
    } catch (error) {
      console.error('Error processing purchase:', error);
      toast.error('Failed to process purchase');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-surface border border-surface-light rounded-lg p-6 max-w-md w-full mx-4">
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="text-center mb-6">
                <CreditCard className="h-12 w-12 text-primary mx-auto mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">
                  Complete Your Purchase
                </h2>
                <p className="text-gray-400">
                  You're about to purchase {product.title}
                </p>
              </div>

              <div className="bg-surface-light rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400">Price</span>
                  <span className="text-white font-medium">
                    ${product.price}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Type</span>
                  <span className="text-white font-medium">
                    {product.type}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center text-sm text-gray-400 mb-6">
                <Lock className="h-4 w-4 mr-1" />
                Secure payment via Stripe
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-surface-light text-white rounded-md hover:bg-surface-light"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePurchase}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Purchase Now'}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">
                Redirecting to Checkout
              </h2>
              <p className="text-gray-400 mb-6">
                You'll be redirected to Stripe's secure checkout page...
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}