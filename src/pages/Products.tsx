import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter } from 'lucide-react';
import { useProducts } from '../lib/hooks/useProducts';
import ProductCard from '../components/ProductCard';
import { auth } from '../lib/firebase';

export default function Products() {
  const { products, isLoading } = useProducts(auth.currentUser?.uid);
  const [search, setSearch] = React.useState('');
  const [filter, setFilter] = React.useState<'all' | 'course' | 'coaching'>('all');

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(search.toLowerCase()) ||
                         product.description.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || product.type === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Products</h1>
        <Link
          to="/products/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90"
        >
          <Plus className="h-4 w-4 mr-1" />
          Create Product
        </Link>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2 bg-surface border border-surface-light rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-primary"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>

        <div className="relative">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'course' | 'coaching')}
            className="appearance-none pl-10 pr-8 py-2 bg-surface border border-surface-light rounded-lg text-white focus:ring-2 focus:ring-primary focus:border-primary"
          >
            <option value="all">All Types</option>
            <option value="course">Courses</option>
            <option value="coaching">Coaching</option>
          </select>
          <Filter className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse bg-surface border border-surface-light rounded-lg p-6">
              <div className="h-4 bg-surface-light rounded w-1/4 mb-4"></div>
              <div className="h-6 bg-surface-light rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-surface-light rounded w-full mb-4"></div>
              <div className="h-10 bg-surface-light rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
          {filteredProducts.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-400">
              No products found matching your criteria
            </div>
          )}
        </div>
      )}
    </div>
  );
}