import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { verseId, ratingValue } = await request.json();

    if (!verseId || !ratingValue) {
      return NextResponse.json({ error: 'Verse ID and rating value are required' }, { status: 400 });
    }

    if (ratingValue < 1 || ratingValue > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    // Check if user has already rated this verse
    const { data: existingRating, error: checkError } = await supabase
      .from('ratings')
      .select('id')
      .eq('user_id', userId)
      .eq('verse_id', verseId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing rating:', checkError);
      return NextResponse.json({ error: 'Failed to check existing rating' }, { status: 500 });
    }

    let result;
    
    if (existingRating) {
      // Update existing rating
      const { data: updatedRating, error: updateError } = await supabase
        .from('ratings')
        .update({ 
          rating_value: ratingValue,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingRating.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating rating:', updateError);
        return NextResponse.json({ error: 'Failed to update rating' }, { status: 500 });
      }

      result = updatedRating;
    } else {
      // Insert new rating
      const { data: newRating, error: insertError } = await supabase
        .from('ratings')
        .insert([
          {
            user_id: userId,
            verse_id: verseId,
            rating_value: ratingValue
          }
        ])
        .select()
        .single();

      if (insertError) {
        console.error('Error inserting rating:', insertError);
        return NextResponse.json({ error: 'Failed to submit rating' }, { status: 500 });
      }

      result = newRating;
    }

    // Award points for rating (1 point per rating)
    const { error: pointsError } = await supabase
      .rpc('increment_points', { user_id: userId, increment: 1 });


    if (pointsError) {
      console.error('Error awarding points for rating:', pointsError);
      // Don't fail the request, just log the error
    }

    return NextResponse.json({
      success: true,
      rating: result,
      message: existingRating ? 'Rating updated successfully!' : 'Rating submitted successfully!',
      pointsAwarded: 1
    });

  } catch (error) {
    console.error('Rating API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const verseId = searchParams.get('verseId');

    if (!verseId) {
      return NextResponse.json({ error: 'Verse ID is required' }, { status: 400 });
    }

    // Get user's rating for this verse
    const { data: userRating, error: userRatingError } = await supabase
      .from('ratings')
      .select('rating_value')
      .eq('user_id', userId)
      .eq('verse_id', verseId)
      .single();

    // Get overall rating stats for this verse
    const { data: ratingStats, error: statsError } = await supabase
      .from('ratings')
      .select('rating_value')
      .eq('verse_id', verseId);

    if (statsError) {
      console.error('Error fetching rating stats:', statsError);
      return NextResponse.json({ error: 'Failed to fetch rating stats' }, { status: 500 });
    }

    const totalRatings = ratingStats?.length || 0;
    const averageRating = totalRatings > 0 
      ? ratingStats.reduce((sum: number, rating: any) => sum + rating.rating_value, 0) / totalRatings 
      : 0;

    // Calculate rating distribution
    const ratingDistribution = [1, 2, 3, 4, 5].map(stars => ({
      stars,
      count: ratingStats?.filter((r: any) => r.rating_value === stars).length || 0
    }));

    return NextResponse.json({
      userRating: userRating?.rating_value || null,
      averageRating: parseFloat(averageRating.toFixed(1)),
      totalRatings,
      ratingDistribution
    });

  } catch (error) {
    console.error('Rating GET API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
