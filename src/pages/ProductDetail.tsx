import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Package, Clock, Users, DollarSign, Calendar, Video, BookOpen } from 'lucide-react';
import { createCheckoutSession } from '../lib/services/stripe';
import { toast } from 'react-hot-toast';
import type { Product } from '../types';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = React.useState<Product | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    if (!id) return;

    try {
      const docRef = doc(db, 'products', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setProduct({ id: docSnap.id, ...docSnap.data() } as Product);
      } else {
        toast.error('Product not found');
        navigate('/products');
      }
    } catch (error) {
      console.error('Error loading product:', error);
      toast.error('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!product) return;

    try {
      await createCheckoutSession(product.id, product.stripe_price_id);
    } catch (error) {
      console.error('Error initiating purchase:', error);
      toast.error('Failed to initiate purchase');
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="h-8 bg-surface-light rounded w-1/4"></div>
        <div className="h-64 bg-surface-light rounded"></div>
        <div className="h-4 bg-surface-light rounded w-3/4"></div>
        <div className="h-4 bg-surface-light rounded w-1/2"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12 text-gray-400">
        Product not found
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-surface border border-surface-light rounded-lg overflow-hidden">
        {product.thumbnail_url ? (
          <img
            src={product.thumbnail_url}
            alt={product.title}
            className="w-full h-64 object-cover"
          />
        ) : (
          <div className="w-full h-64 bg-gradient-to-r from-primary/20 to-primary/10 flex items-center justify-center">
            <Package className="h-16 w-16 text-primary" />
          </div>
        )}

        <div className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <span className="px-2 py-1 text-xs font-medium text-primary bg-primary/10 rounded-full">
              {product.type}
            </span>
            <span className="px-2 py-1 text-xs font-medium text-gray-400 bg-surface-light rounded-full">
              {product.category}
            </span>
          </div>

          <h1 className="text-3xl font-bold text-white mb-4">{product.title}</h1>
          
          <p className="text-gray-300 mb-6">{product.description}</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-surface-light rounded-lg p-4">
              <DollarSign className="h-5 w-5 text-primary mb-2" />
              <p className="text-sm text-gray-400">Price</p>
              <p className="text-xl font-bold text-white">
                ${product.price}
              </p>
            </div>

            <div className="bg-surface-light rounded-lg p-4">
              <Clock className="h-5 w-5 text-green-500 mb-2" />
              <p className="text-sm text-gray-400">Delivery</p>
              <p className="text-xl font-bold text-white">
                {product.delivery_method === 'live' ? 'Live Session' : 'On Demand'}
              </p>
            </div>

            <div className="bg-surface-light rounded-lg p-4">
              <Users className="h-5 w-5 text-blue-500 mb-2" />
              <p className="text-sm text-gray-400">Enrolled</p>
              <p className="text-xl font-bold text-white">
                {product.enrolled_count || 0}
              </p>
            </div>

            <div className="bg-surface-light rounded-lg p-4">
              <Calendar className="h-5 w-5 text-purple-500 mb-2" />
              <p className="text-sm text-gray-400">Duration</p>
              <p className="text-xl font-bold text-white">
                {product.duration || '--'} mins
              </p>
            </div>
          </div>

          {product.type === 'course' && (
            <div className="border-t border-surface-light pt-6 mb-6">
              <h2 className="text-xl font-semibold text-white mb-4">What You'll Learn</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {product.learning_objectives?.map((objective, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <BookOpen className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">{objective}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {product.type === 'coaching' && (
            <div className="border-t border-surface-light pt-6 mb-6">
              <h2 className="text-xl font-semibold text-white mb-4">Session Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Video className="h-5 w-5 text-primary" />
                  <span className="text-gray-300">1-on-1 Video Call</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <span className="text-gray-300">{product.duration} Minutes</span>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handlePurchase}
            className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Purchase Now
          </button>
        </div>
      </div>
    </div>
  );
}