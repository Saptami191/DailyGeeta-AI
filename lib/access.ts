import { supabase } from "./supabase";
import { auth } from "@clerk/nextjs/server";

export async function checkAccess() {
  const { userId } = await auth();
  if (!userId) return false;

  const { data } = await supabase
    .from("profiles")
    .select("is_premium, trial_started_at")
    .eq("clerk_id", userId)
    .single();

  if (!data) return false;

  // 1. Check if Premium
  if (data.is_premium) return true;

  // 2. Check if Trial is active (within 7 days)
  const trialStart = new Date(data.trial_started_at);
  const now = new Date();
  const diffInDays = (now.getTime() - trialStart.getTime()) / (1000 * 3600 * 24);

  return diffInDays <= 7;
}

// Client-side version for use in components
export async function checkAccessClient(userId: string) {
  if (!userId) return false;

  const { data } = await supabase
    .from("profiles")
    .select("is_premium, trial_started_at")
    .eq("clerk_id", userId)
    .single();

  if (!data) return false;

  // 1. Check if Premium
  if (data.is_premium) return true;

  // 2. Check if Trial is active (within 7 days)
  const trialStart = new Date(data.trial_started_at);
  const now = new Date();
  const diffInDays = (now.getTime() - trialStart.getTime()) / (1000 * 3600 * 24);

  return diffInDays <= 7;
}
