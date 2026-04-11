import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { chapter_id, verse_number } = await req.json();

    // 1. Check if already saved
    const { data: existing, error: checkError } = await supabaseAdmin
      .from("favorites")
      .select("id")
      .match({ 
        user_id: userId, 
        chapter_id: chapter_id, 
        verse_number: verse_number 
      })
      .single();

    if (existing) {
      // 2. Unsave (Delete)
      const { error: deleteError } = await supabaseAdmin
        .from("favorites")
        .delete()
        .eq("id", existing.id);
      
      if (deleteError) throw deleteError;
      return NextResponse.json({ saved: false });
    } else {
      // 3. Save (Insert)
      const { error: insertError } = await supabaseAdmin
        .from("favorites")
        .insert([{ 
          user_id: userId, 
          chapter_id: chapter_id, 
          verse_number: verse_number
        }]);
      
      if (insertError) throw insertError;
      return NextResponse.json({ saved: true });
    }
  } catch (error: any) {
    console.error("Favorites Toggle Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
