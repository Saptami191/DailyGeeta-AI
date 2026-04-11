"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

interface TrialStatus {
  isInTrial: boolean;
  trialStartedAt: string;
  trialExpiresAt: string;
  daysRemaining: number;
  points: number;
  referralCode: string;
}

export default function TrialStatus() {
  const { user } = useUser();
  const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTrialStatus();
    }
  }, [user]);

  const fetchTrialStatus = async () => {
    try {
      const response = await fetch('/api/trial/status');
      const data = await response.json();
      setTrialStatus(data);
    } catch (error) {
      console.error('Error fetching trial status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-lg animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (!trialStatus) {
    return null;
  }

  const getTrialColor = () => {
    if (trialStatus.daysRemaining <= 1) return 'text-red-600 bg-red-50 border-red-200';
    if (trialStatus.daysRemaining <= 3) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  return (
    <div className={`border rounded-lg p-4 shadow-lg ${getTrialColor()}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <h3 className="font-semibold text-lg">
            {trialStatus.isInTrial ? 'Free Trial Active' : 'Premium Required'}
          </h3>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-2xl"> divine</span>
          <span className="font-bold text-xl">{trialStatus.points}</span>
        </div>
      </div>

      {trialStatus.isInTrial ? (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm opacity-75">Days remaining:</span>
            <span className="font-bold text-lg">{trialStatus.daysRemaining}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(trialStatus.daysRemaining / 7) * 100}%` }}
            ></div>
          </div>
          <div className="text-xs opacity-60 text-center">
            Trial expires: {new Date(trialStatus.trialExpiresAt).toLocaleDateString()}
          </div>
        </div>
      ) : (
        <div className="text-center py-2">
          <p className="text-sm mb-2">Your free trial has expired</p>
          <button 
            onClick={() => window.location.href = '/premium'}
            className="bg-orange-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-orange-700 transition-colors"
          >
            Upgrade to Premium (Rs. 99)
          </button>
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-current/20">
        <div className="flex items-center justify-between text-xs">
          <span className="opacity-75">Referral Code:</span>
          <span className="font-mono font-bold">{trialStatus.referralCode}</span>
        </div>
      </div>
    </div>
  );
}
