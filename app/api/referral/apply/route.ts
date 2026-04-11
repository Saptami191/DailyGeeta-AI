import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { referralCode } = await request.json();

    if (!referralCode) {
      return NextResponse.json({ error: 'Referral code is required' }, { status: 400 });
    }

    // Check if user already has a referral code applied
    const { data: currentUserProfile, error: profileError } = await supabase
      .from('profiles')
      .select('referred_by_id')
      .eq('clerk_id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 });
    }

    if (currentUserProfile?.referred_by_id) {
      return NextResponse.json({ error: 'Referral code already applied' }, { status: 400 });
    }

    // Find the referrer by referral code
    const { data: referrerProfile, error: referrerError } = await supabase
      .from('profiles')
      .select('clerk_id, points')
      .eq('referral_code', referralCode)
      .single();

    if (referrerError || !referrerProfile) {
      return NextResponse.json({ error: 'Invalid referral code' }, { status: 404 });
    }

    // Prevent self-referral
    if (referrerProfile.clerk_id === userId) {
      return NextResponse.json({ error: 'Cannot use your own referral code' }, { status: 400 });
    }

    // Apply referral: award points to referrer and mark current user as referred
    const { error: updateError } = await supabase.rpc('award_referral_points', {
      referrer_id: referrerProfile.clerk_id,
      referred_id: userId
    });

    if (updateError) {
      console.error('Error applying referral:', updateError);
      return NextResponse.json({ error: 'Failed to apply referral' }, { status: 500 });
    }

    // Get updated user profile
    const { data: updatedProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('points, referred_by_id')
      .eq('clerk_id', userId)
      .single();

    return NextResponse.json({
      success: true,
      message: 'Referral code applied successfully!',
      pointsAwarded: 10,
      referrerId: referrerProfile.clerk_id,
      userProfile: updatedProfile
    });

  } catch (error) {
    console.error('Referral API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
