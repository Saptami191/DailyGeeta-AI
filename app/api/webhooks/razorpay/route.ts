import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase'; 

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Verify the payment was successful
    if (body.event === 'payment.captured') {
      // 'user_id' must be passed in the 'notes' field during checkout
      const userId = body.payload.payment.entity.notes.user_id;

      // Update Supabase: Set to Premium and add 100 credits
      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_premium: true, 
          plan_type: 'premium', 
          credits: 100 
        })
        .eq('clerk_id', userId);


      if (error) throw error;
      console.log(`✅ Success: User ${userId} is now Pro.`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    console.error('❌ Webhook Error:', err);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}
