import React from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import { useSubscription } from '../lib/hooks/useSubscription';
import { format } from 'date-fns';

interface SubscriptionStatusProps {
  productId: string;
}

export default function SubscriptionStatus({ productId }: SubscriptionStatusProps) {
  const { subscription, isLoading, cancelSubscription } = useSubscription(productId);

  if (isLoading) {
    return (
      <div className="animate-pulse bg-surface border border-surface-light rounded-lg p-4">
        <div className="h-4 bg-surface-light rounded w-1/4 mb-2"></div>
        <div className="h-4 bg-surface-light rounded w-1/2"></div>
      </div>
    );
  }

  if (!subscription) {
    return null;
  }

  const endDate = subscription.current_period_end?.toDate();

  return (
    <div className="bg-surface border border-surface-light rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Clock className="h-5 w-5 text-primary" />
          <div>
            <h3 className="text-white font-medium">Subscription Status</h3>
            <p className="text-sm text-gray-400">
              {subscription.status === 'active' ? (
                subscription.cancel_at_period_end ? (
                  <>
                    Cancels on {format(endDate, 'PP')}
                    <button
                      className="ml-2 text-primary hover:text-primary/90"
                      onClick={() => {/* Handle reactivation */}}
                    >
                      Reactivate
                    </button>
                  </>
                ) : (
                  <>
                    Active until {format(endDate, 'PP')}
                    <button
                      className="ml-2 text-red-400 hover:text-red-500"
                      onClick={() => cancelSubscription(subscription.id)}
                    >
                      Cancel
                    </button>
                  </>
                )
              ) : (
                <span className="text-red-400">
                  <AlertCircle className="inline h-4 w-4 mr-1" />
                  {subscription.status === 'past_due' ? 'Payment overdue' : 'Canceled'}
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}