import { supabase } from "./supabase";

export async function checkPremiumStatus(clerkId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("is_premium")
    .eq("clerk_id", clerkId)
    .single();

  if (error || !data) return false;
  return data.is_premium;
}