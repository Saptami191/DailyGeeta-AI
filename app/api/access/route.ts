import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ hasAccess: false }, { status: 200 });
    }

    const { data } = await supabase
      .from("profiles")
      .select("is_premium, trial_started_at")
      .eq("clerk_id", userId)
      .single();

    if (!data) {
      return NextResponse.json({ hasAccess: false }, { status: 200 });
    }

    // 1. Check if Premium
    if (data.is_premium) {
      return NextResponse.json({ hasAccess: true, type: "premium" }, { status: 200 });
    }

    // 2. Check if Trial is active (within 7 days)
    const trialStart = new Date(data.trial_started_at);
    const now = new Date();
    const diffInDays = (now.getTime() - trialStart.getTime()) / (1000 * 3600 * 24);

    const hasTrialAccess = diffInDays <= 7;
    const daysRemaining = Math.max(0, Math.ceil(7 - diffInDays));

    return NextResponse.json({ 
      hasAccess: hasTrialAccess, 
      type: hasTrialAccess ? "trial" : "expired",
      daysRemaining 
    }, { status: 200 });

  } catch (error) {
    console.error("Access check error:", error);
    return NextResponse.json({ hasAccess: false }, { status: 500 });
  }
}
