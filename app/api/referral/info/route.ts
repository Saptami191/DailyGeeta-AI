import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's referral info and stats
    const { data: profile, error } = await supabase
      .from('profiles')
      .select(`
        referral_code,
        points,
        referred_by_id,
        referrals_log!referrals_log_referrer_id_fkey (
          id,
          referred_id,
          points_awarded,
          created_at
        )
      `)
      .eq('clerk_id', userId)
      .single();

    // If profile doesn't exist, create it
    if (error || !profile) {
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          clerk_id: userId,
          trial_started_at: new Date().toISOString(),
          points: 0,
          referral_code: Math.random().toString(36).substring(2, 10).toUpperCase()
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating profile:', createError);
        return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 });
      }

      return NextResponse.json({
        referralCode: newProfile.referral_code,
        totalPoints: 0,
        totalReferrals: 0,
        totalPointsFromReferrals: 0,
        referredBy: null,
        referralHistory: []
      });
    }

    if (error) {
      console.error('Error fetching referral info:', error);
      return NextResponse.json({ error: 'Failed to fetch referral info' }, { status: 500 });
    }

    // Count total referrals
    const totalReferrals = profile?.referrals_log?.length || 0;
    const totalPointsFromReferrals = profile?.referrals_log?.reduce((sum: number, log: any) => sum + log.points_awarded, 0) || 0;

    // Get referrer info if user was referred
    let referrerInfo = null;
    if (profile?.referred_by_id) {
      const { data: referrer } = await supabase
        .from('profiles')
        .select('referral_code')
        .eq('clerk_id', profile.referred_by_id)
        .single();
      
      referrerInfo = referrer;
    }

    return NextResponse.json({
      referralCode: profile?.referral_code,
      totalPoints: profile?.points || 0,
      totalReferrals,
      totalPointsFromReferrals,
      referredBy: referrerInfo?.referral_code,
      referralHistory: profile?.referrals_log || []
    });

  } catch (error) {
    console.error('Referral info API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
