import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's points and activity history
    const { data: profile, error } = await supabase
      .from('profiles')
      .select(`
        points,
        referrals_log!referrals_log_referrer_id_fkey (
          id,
          referred_id,
          points_awarded,
          created_at
        )
      `)
      .eq('clerk_id', userId)
      .single();

    if (error) {
      console.error('Error fetching points:', error);
      return NextResponse.json({ error: 'Failed to fetch points' }, { status: 500 });
    }

    // Get user's rating history
    const { data: ratingHistory, error: ratingError } = await supabase
      .from('ratings')
      .select('verse_id, rating_value, created_at, updated_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (ratingError) {
      console.error('Error fetching rating history:', ratingError);
      return NextResponse.json({ error: 'Failed to fetch rating history' }, { status: 500 });
    }

    // Calculate points breakdown
    const pointsFromReferrals = profile?.referrals_log?.reduce((sum: number, log: any) => sum + log.points_awarded, 0) || 0;
    const pointsFromRatings = (ratingHistory?.length || 0) * 1; // 1 point per rating
    const totalPoints = profile?.points || 0;
    const pointsFromOther = totalPoints - pointsFromReferrals - pointsFromRatings;

    return NextResponse.json({
      totalPoints,
      breakdown: {
        fromReferrals: pointsFromReferrals,
        fromRatings: pointsFromRatings,
        fromOther: Math.max(0, pointsFromOther)
      },
      referralHistory: profile?.referrals_log || [],
      ratingHistory: ratingHistory || []
    });

  } catch (error) {
    console.error('Points API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, amount } = await request.json();

    if (!action || !amount) {
      return NextResponse.json({ error: 'Action and amount are required' }, { status: 400 });
    }

    // Award points for specific actions
    let pointsAwarded = 0;
    let reason = '';

    switch (action) {
      case 'daily_login':
        pointsAwarded = 5;
        reason = 'Daily login bonus';
        break;
      case 'share_verse':
        pointsAwarded = 2;
        reason = 'Shared a verse';
        break;
      case 'complete_reading':
        pointsAwarded = 3;
        reason = 'Completed verse reading';
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Update user points
    const { data: newPoints, error: updateError } = await supabase
      .rpc('increment_points', { user_id: userId, increment: pointsAwarded });

    if (updateError) {
      console.error('Error awarding points:', updateError);
      return NextResponse.json({ error: 'Failed to award points' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      pointsAwarded,
      reason,
      newTotal: newPoints
    });


  } catch (error) {
    console.error('Points POST API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
