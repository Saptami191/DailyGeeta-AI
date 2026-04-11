import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get user profile with trial info
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('trial_started_at, is_premium, points, referral_code')
      .eq('clerk_id', userId)
      .single();

    // If profile doesn't exist, create it with trial
    if (error || !profile) {
      // Create profile for new user
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert([
          {
            clerk_id: userId,
            trial_started_at: new Date().toISOString(),
            points: 0
          }
        ])
        .select()
        .single();

      if (createError) {
        console.error('Error creating profile:', createError);
        return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 });
      }

      return NextResponse.json({
        isInTrial: true,
        trialStartedAt: newProfile.trial_started_at,
        trialExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        daysRemaining: 7,
        points: newProfile.points,
        referralCode: newProfile.referral_code
      });
    }

    // Check if user is in trial period
    const trialStarted = new Date(profile.trial_started_at);
    const trialExpires = new Date(trialStarted.getTime() + 7 * 24 * 60 * 60 * 1000);
    const now = new Date();
    const isInTrial = now < trialExpires;
    const daysRemaining = Math.max(0, Math.ceil((trialExpires.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)));

    return NextResponse.json({
      isInTrial,
      trialStartedAt: profile.trial_started_at,
      trialExpiresAt: trialExpires.toISOString(),
      daysRemaining,
      points: profile.points,
      referralCode: profile.referral_code
    });

  } catch (error) {
    console.error('Trial status API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
