"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

interface ReferralInfo {
  referralCode: string;
  totalPoints: number;
  totalReferrals: number;
  totalPointsFromReferrals: number;
  referredBy: string | null;
  referralHistory: Array<{
    id: string;
    referred_id: string;
    points_awarded: number;
    created_at: string;
  }>;
}

export default function ReferralSystem() {
  const { user } = useUser();
  const [referralInfo, setReferralInfo] = useState<ReferralInfo | null>(null);
  const [referralInput, setReferralInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [applyingReferral, setApplyingReferral] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (user) {
      fetchReferralInfo();
    }
  }, [user]);

  const fetchReferralInfo = async () => {
    try {
      const response = await fetch('/api/referral/info');
      const data = await response.json();
      setReferralInfo(data);
    } catch (error) {
      console.error('Error fetching referral info:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyReferralCode = async () => {
    if (!referralInput.trim()) {
      setMessage({ type: 'error', text: 'Please enter a referral code' });
      return;
    }

    setApplyingReferral(true);
    setMessage(null);

    try {
      const response = await fetch('/api/referral/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referralCode: referralInput.trim().toUpperCase() })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message });
        setReferralInput('');
        fetchReferralInfo(); // Refresh referral info
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to apply referral code' });
    } finally {
      setApplyingReferral(false);
    }
  };

  const shareReferralCode = () => {
    const text = `Join Daily Geeta and get 7 days of free premium access! Use my referral code: ${referralInfo?.referralCode}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralInfo?.referralCode || '');
    setMessage({ type: 'success', text: 'Referral code copied!' });
    setTimeout(() => setMessage(null), 2000);
  };

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-lg animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-lg">
      <h3 className="text-xl font-bold text-orange-900 mb-4">Refer & Earn Divine Points</h3>
      
      {/* Your Referral Code */}
      <div className="bg-orange-50 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-orange-800">Your Referral Code:</span>
          <div className="flex gap-2">
            <button
              onClick={copyReferralCode}
              className="text-xs bg-orange-600 text-white px-3 py-1 rounded-full hover:bg-orange-700 transition-colors"
            >
              Copy
            </button>
            <button
              onClick={shareReferralCode}
              className="text-xs bg-green-600 text-white px-3 py-1 rounded-full hover:bg-green-700 transition-colors"
            >
              Share
            </button>
          </div>
        </div>
        <div className="text-2xl font-mono font-bold text-orange-900 text-center">
          {referralInfo?.referralCode}
        </div>
      </div>

      {/* Referral Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-blue-900">{referralInfo?.totalReferrals || 0}</div>
          <div className="text-xs text-blue-700">Friends Referred</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-purple-900">{referralInfo?.totalPointsFromReferrals || 0}</div>
          <div className="text-xs text-purple-700">Points from Referrals</div>
        </div>
      </div>

      {/* Apply Referral Code */}
      {referralInfo?.referredBy ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
          <div className="text-sm text-green-800">
            <span className="font-semibold">Referred by:</span> {referralInfo.referredBy}
          </div>
        </div>
      ) : (
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Have a referral code?
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={referralInput}
              onChange={(e) => setReferralInput(e.target.value)}
              placeholder="Enter referral code"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              maxLength={20}
            />
            <button
              onClick={applyReferralCode}
              disabled={applyingReferral}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-700 transition-colors disabled:opacity-50"
            >
              {applyingReferral ? 'Applying...' : 'Apply'}
            </button>
          </div>
        </div>
      )}

      {/* Message Display */}
      {message && (
        <div className={`p-3 rounded-lg text-sm ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Referral History */}
      {referralInfo?.referralHistory && referralInfo.referralHistory.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Recent Referrals</h4>
          <div className="space-y-2">
            {referralInfo.referralHistory.slice(0, 3).map((referral) => (
              <div key={referral.id} className="text-xs text-gray-600 flex justify-between">
                <span>Friend joined</span>
                <span className="font-semibold">+{referral.points_awarded} points</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
