import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { validateInvite, useInvite } from '../lib/services/invites';
import { Link2, Loader } from 'lucide-react';
import { auth } from '../lib/firebase';
import { toast } from 'react-hot-toast';

export default function InvitePage() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [invite, setInvite] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (code) {
      validateInviteCode();
    }
  }, [code]);

  const validateInviteCode = async () => {
    try {
      setLoading(true);
      setError(null);
      const inviteData = await validateInvite(code!);
      setInvite(inviteData);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvite = async () => {
    if (!auth.currentUser) {
      // Save the invite code to localStorage to use after login
      localStorage.setItem('pendingInvite', code!);
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      await useInvite(code!);
      
      // Redirect based on invite type
      if (invite.type === 'community') {
        navigate(`/communities/${invite.targetId}`);
      } else {
        navigate(`/creators/${invite.targetId}`);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Link2 className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Invalid Invite</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-surface border border-surface-light rounded-lg p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <Link2 className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">
            You&apos;ve Been Invited!
          </h1>
          <p className="text-gray-400 mb-6">
            {invite.type === 'community'
              ? "You've been invited to join a community"
              : "You've been invited to collaborate"}
          </p>

          <button
            onClick={handleAcceptInvite}
            disabled={loading}
            className="w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 mb-4"
          >
            {loading ? 'Processing...' : 'Accept Invite'}
          </button>

          <button
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-white"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}