import React, { useState } from 'react';
import { Link2, Copy, Clock, Users } from 'lucide-react';
import { createInviteLink } from '../lib/services/invites';
import { toast } from 'react-hot-toast';

interface InviteDialogProps {
  type: 'community' | 'creator';
  targetId: string;
  onClose: () => void;
}

export default function InviteDialog({ type, targetId, onClose }: InviteDialogProps) {
  const [inviteUrl, setInviteUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    expiresIn: 24, // hours
    maxUses: 1
  });

  const generateInvite = async () => {
    try {
      setLoading(true);
      const url = await createInviteLink({
        type,
        targetId,
        expiresIn: settings.expiresIn,
        maxUses: settings.maxUses
      });
      setInviteUrl(url);
    } catch (error) {
      console.error('Error generating invite:', error);
      toast.error('Failed to generate invite link');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteUrl);
    toast.success('Invite link copied to clipboard');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-surface border border-surface-light rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Link2 className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-medium text-white">
              Create Invite Link
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ×
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Expires After
            </label>
            <select
              value={settings.expiresIn}
              onChange={(e) => setSettings({ ...settings, expiresIn: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-surface-light border border-surface-light rounded-md text-white focus:outline-none focus:ring-primary focus:border-primary"
            >
              <option value={24}>24 hours</option>
              <option value={48}>48 hours</option>
              <option value={72}>72 hours</option>
              <option value={168}>7 days</option>
              <option value={0}>Never</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Maximum Uses
            </label>
            <select
              value={settings.maxUses}
              onChange={(e) => setSettings({ ...settings, maxUses: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-surface-light border border-surface-light rounded-md text-white focus:outline-none focus:ring-primary focus:border-primary"
            >
              <option value={1}>1 use</option>
              <option value={5}>5 uses</option>
              <option value={10}>10 uses</option>
              <option value={0}>Unlimited</option>
            </select>
          </div>
        </div>

        {!inviteUrl ? (
          <button
            onClick={generateInvite}
            disabled={loading}
            className="w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate Invite Link'}
          </button>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 p-3 bg-surface-light rounded-lg">
              <input
                type="text"
                value={inviteUrl}
                readOnly
                className="flex-1 bg-transparent border-none text-white focus:outline-none"
              />
              <button
                onClick={copyToClipboard}
                className="p-2 text-gray-400 hover:text-white"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-400">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {settings.expiresIn ? `Expires in ${settings.expiresIn}h` : 'Never expires'}
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                {settings.maxUses ? `${settings.maxUses} uses` : 'Unlimited uses'}
              </div>
            </div>

            <button
              onClick={generateInvite}
              className="w-full px-4 py-2 border border-primary text-primary rounded-md hover:bg-primary/10"
            >
              Generate New Link
            </button>
          </div>
        )}
      </div>
    </div>
  );
}