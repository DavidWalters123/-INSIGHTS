import React from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { User, Star, Users, BookOpen } from 'lucide-react';
import { useProducts } from '../lib/hooks/useProducts';
import ProductCard from '../components/ProductCard';
import CreatorStats from '../components/CreatorStats';
import type { User as UserType } from '../types';
import { toast } from 'react-hot-toast';

export default function CreatorStorefront() {
  const { id } = useParams();
  const [creator, setCreator] = React.useState<UserType | null>(null);
  const { products, isLoading } = useProducts(id);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    loadCreator();
  }, [id]);

  const loadCreator = async () => {
    if (!id) return;

    try {
      const docRef = doc(db, 'users', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setCreator({ id: docSnap.id, ...docSnap.data() } as UserType);
      } else {
        toast.error('Creator not found');
      }
    } catch (error) {
      console.error('Error loading creator:', error);
      toast.error('Failed to load creator profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="h-48 bg-surface-light rounded-lg"></div>
        <div className="h-8 bg-surface-light rounded w-1/4"></div>
        <div className="grid grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-surface-light rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="text-center py-12 text-gray-400">
        Creator not found
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Banner & Profile */}
      <div className="bg-surface border border-surface-light rounded-lg overflow-hidden">
        <div className="h-48 gradient-banner" />
        <div className="px-6 py-5">
          <div className="flex flex-col md:flex-row md:items-start md:space-x-6">
            <div className="-mt-20 mb-6 md:mb-0">
              {creator.avatar_url ? (
                <img
                  src={creator.avatar_url}
                  alt={creator.full_name}
                  className="h-32 w-32 rounded-full border-4 border-surface bg-surface object-cover"
                />
              ) : (
                <div className="h-32 w-32 rounded-full border-4 border-surface bg-surface flex items-center justify-center">
                  <User className="h-12 w-12 text-primary" />
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-white">
                    {creator.full_name}
                  </h1>
                  {creator.bio && (
                    <p className="mt-2 text-gray-300">{creator.bio}</p>
                  )}
                </div>
                {creator.metrics?.avg_course_rating && (
                  <div className="flex items-center space-x-1 px-3 py-1 bg-primary/10 rounded-full">
                    <Star className="h-4 w-4 text-primary" />
                    <span className="text-primary font-medium">
                      {creator.metrics.avg_course_rating.toFixed(1)} Rating
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-surface-light rounded-lg p-4">
                  <p className="text-sm text-gray-400">Total Students</p>
                  <p className="text-2xl font-bold text-white">
                    {creator.metrics?.total_students?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="bg-surface-light rounded-lg p-4">
                  <p className="text-sm text-gray-400">Courses</p>
                  <p className="text-2xl font-bold text-white">
                    {creator.metrics?.total_courses || 0}
                  </p>
                </div>
                <div className="bg-surface-light rounded-lg p-4">
                  <p className="text-sm text-gray-400">Completion Rate</p>
                  <p className="text-2xl font-bold text-white">
                    {creator.metrics?.completion_rate || 0}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white">Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
          {products.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-400">
              No products available yet
            </div>
          )}
        </div>
      </div>

      {/* Creator Stats */}
      <CreatorStats creator={creator} />
    </div>
  );
}