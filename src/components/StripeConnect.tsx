import React from 'react';
import { CreditCard, ExternalLink } from 'lucide-react';
import { createStripeAccount, getStripeAccountStatus } from '../lib/services/stripe';
import { toast } from 'react-hot-toast';

interface StripeConnectProps {
  userId: string;
}

export default function StripeConnect({ userId }: StripeConnectProps) {
  const [status, setStatus] = React.useState<'loading' | 'connected' | 'not_connected' | 'error'>(
    'loading'
  );

  React.useEffect(() => {
    checkStatus();
  }, [userId]);

  const checkStatus = async () => {
    const accountStatus = await getStripeAccountStatus(userId);
    setStatus(accountStatus);
  };

  const handleConnect = async () => {
    try {
      await createStripeAccount();
    } catch (error) {
      console.error('Error connecting Stripe:', error);
      toast.error('Failed to connect Stripe account');
    }
  };

  if (status === 'loading') {
    return (
      <div className="animate-pulse bg-surface border border-surface-light rounded-lg p-6">
        <div className="h-6 w-1/3 bg-surface-light rounded mb-4"></div>
        <div className="h-4 w-2/3 bg-surface-light rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-surface-light rounded-lg p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <CreditCard className="h-6 w-6 text-primary" />
          <div>
            <h3 className="text-lg font-medium text-white">
              {status === 'connected' ? 'Stripe Connected' : 'Connect Stripe'}
            </h3>
            <p className="text-sm text-gray-400">
              {status === 'connected'
                ? 'Your Stripe account is connected and ready to receive payments'
                : 'Connect your Stripe account to start receiving payments'}
            </p>
          </div>
        </div>

        {status !== 'connected' && (
          <button
            onClick={handleConnect}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Connect Stripe
          </button>
        )}
      </div>
    </div>
  );
}