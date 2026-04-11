"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

interface VerseRatingProps {
  verseId: string; // Format: "chapter-verse" (e.g., "2-47")
}

interface RatingData {
  userRating: number | null;
  averageRating: number;
  totalRatings: number;
  ratingDistribution: Array<{ stars: number; count: number }>;
}

export default function VerseRating({ verseId }: VerseRatingProps) {
  const { user } = useUser();
  const [ratingData, setRatingData] = useState<RatingData | null>(null);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchRatingData();
  }, [verseId]);

  const fetchRatingData = async () => {
    try {
      const response = await fetch(`/api/ratings?verseId=${verseId}`);
      const data = await response.json();
      setRatingData(data);
      setSelectedRating(data.userRating);
    } catch (error) {
      console.error('Error fetching rating data:', error);
    }
  };

  const submitRating = async (rating: number) => {
    if (!user) {
      setMessage({ type: 'error', text: 'Please sign in to rate verses' });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verseId, ratingValue: rating })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message });
        setSelectedRating(rating);
        fetchRatingData(); // Refresh rating data
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to submit rating' });
    } finally {
      setSubmitting(false);
    }
  };

  const StarIcon = ({ filled, size = 'w-6 h-6' }: { filled: boolean; size?: string }) => (
    <svg 
      className={`${size} ${filled ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      viewBox="0 0 24 24" 
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  );

  if (!ratingData) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-lg animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="w-6 h-6 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-lg">
      <h3 className="text-lg font-bold text-orange-900 mb-4">Rate This Verse</h3>
      
      {/* Rating Stars */}
      <div className="flex flex-col items-center mb-4">
        <div className="flex gap-1 mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => submitRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(null)}
              disabled={submitting || !user}
              className={`transition-all duration-200 ${
                !user ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-110'
              }`}
            >
              <StarIcon 
                filled={
                  (hoveredRating !== null && star <= hoveredRating) ||
                  (selectedRating !== null && star <= selectedRating)
                } 
                size="w-8 h-8"
              />
            </button>
          ))}
        </div>
        
        {/* Rating Text */}
        <div className="text-center">
          {selectedRating ? (
            <span className="text-sm text-gray-600">You rated this {selectedRating} stars</span>
          ) : user ? (
            <span className="text-sm text-gray-500">Click to rate</span>
          ) : (
            <span className="text-sm text-gray-500">Sign in to rate</span>
          )}
        </div>
      </div>

      {/* Community Rating */}
      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">Community Rating:</span>
          <div className="flex items-center gap-1">
            <StarIcon filled={true} size="w-4 h-4" />
            <span className="font-bold text-lg">{ratingData.averageRating}</span>
            <span className="text-sm text-gray-500">({ratingData.totalRatings} {ratingData.totalRatings === 1 ? 'rating' : 'ratings'})</span>
          </div>
        </div>

        {/* Rating Distribution */}
        {ratingData.totalRatings > 0 && (
          <div className="space-y-1">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = ratingData.ratingDistribution.find(r => r.stars === stars)?.count || 0;
              const percentage = ratingData.totalRatings > 0 ? (count / ratingData.totalRatings) * 100 : 0;
              
              return (
                <div key={stars} className="flex items-center gap-2 text-xs">
                  <span className="w-8 text-right">{stars} stars</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Message Display */}
      {message && (
        <div className={`mt-4 p-3 rounded-lg text-sm ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Points Info */}
      {user && (
        <div className="mt-4 text-center text-xs text-gray-500">
          Earn 1 divine point for rating verses
        </div>
      )}
    </div>
  );
}
