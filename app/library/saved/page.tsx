import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { checkAccess } from "@/lib/access";

export default async function SavedCollectionPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/");
  }

  const hasAccess = await checkAccess();
  if (!hasAccess) {
    redirect("/?reason=trial_expired");
  }

  // 1. Fetch Favorites from Supabase
  const { data: favorites, error } = await supabaseAdmin
    .from("favorites")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching favorites:", error);
  }

  // 2. Fetch Verse Details for each favorite (parallel)
  // Note: In a production app, you might want to store verse text in Supabase to avoid excessive API calls
  const savedVerses = await Promise.all(
    (favorites || []).map(async (fav) => {
      try {
        const response = await fetch(
          `https://bhagavad-gita3.p.rapidapi.com/v2/chapters/${fav.chapter}/verses/${fav.verse}/`,

          {
            headers: {
              "x-rapidapi-key": process.env.RAPID_GITA_KEY as string,
              "x-rapidapi-host": "bhagavad-gita3.p.rapidapi.com",
            },
            next: { revalidate: 86400 }, // Cache for 24 hours
          }
        );
        if (!response.ok) return null;
        const data = await response.json();
        return { ...data, saved_at: fav.created_at, favorite_id: fav.id };
      } catch (err) {
        return null;
      }
    })
  );

  const validVerses = savedVerses.filter((v) => v !== null);

  return (
    <div className="min-h-screen bg-[#fffcf5] relative overflow-hidden pb-20">
      {/* Divine Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60 brightness-[1.1] saturate-[1.2] transition-all duration-1000"
        style={{ backgroundImage: 'url("/divine-bg.png")' }}
      />
      <div className="absolute inset-0 bg-[#fffcf5]/20 backdrop-blur-[1px]" />

      <main className="relative z-10 max-w-4xl mx-auto px-6 pt-24">
        {/* Navigation */}
        <div className="mb-8">
          <Link href="/library" className="text-orange-600 font-bold inline-flex items-center gap-2 hover:underline">
            ← Back to Library
          </Link>
        </div>

        {/* Header */}
        <div className="mb-12 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-zinc-900 mb-4">
            Your Sacred <span className="text-orange-600 italic">Collection</span>
          </h1>
          <p className="text-zinc-600 text-lg">
            Verses that have touched your soul and guided your path.
          </p>
        </div>

        {/* Saved Verses Grid */}
        {validVerses.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-[2.5rem] p-16 text-center border border-orange-100 shadow-xl">
            <div className="text-6xl mb-6">📔</div>
            <h3 className="text-2xl font-bold text-zinc-900 mb-4">Your collection is empty</h3>
            <p className="text-zinc-500 mb-8 max-w-sm mx-auto">
              Start exploring the Geeta and save verses that resonate with your heart.
            </p>
            <Link 
              href="/library"
              className="px-8 py-4 bg-orange-600 text-white rounded-full font-bold shadow-lg shadow-orange-100 hover:bg-orange-700 transition-all font-serif"
            >
              Begin Your Journey
            </Link>
          </div>
        ) : (
          <div className="grid gap-12">
            {validVerses.map((verse: any) => (
              <div 
                key={verse.favorite_id} 
                className="group bg-white rounded-[3rem] p-8 md:p-12 border border-orange-100 shadow-sm hover:shadow-xl transition-all duration-500 relative"
              >
                {/* Verse Identifier */}
                <div className="flex justify-between items-center mb-10">
                  <span className="px-5 py-2 bg-orange-50 text-orange-700 rounded-full text-xs font-bold uppercase tracking-[0.2em] border border-orange-100">
                    Chapter {verse.chapter_number} • Verse {verse.verse_number}
                  </span>
                  <div className="text-zinc-400 text-xs font-medium">
                    Saved on {new Date(verse.saved_at).toLocaleDateString()}
                  </div>
                </div>

                {/* Sanskrit Text */}
                <p className="text-2xl md:text-3xl font-serif text-zinc-800 mb-10 leading-[1.8] text-center font-bold tracking-wide">
                  {verse.text}
                </p>

                {/* English Meanings */}
                <div className="space-y-8 border-t border-orange-50 pt-10">
                  <div>
                    <h4 className="text-[10px] font-bold text-orange-400 uppercase tracking-widest mb-3">Translation</h4>
                    <p className="text-zinc-700 leading-relaxed font-serif text-lg md:text-xl">
                      {verse.translations?.find((t: any) => t.language === 'english')?.description || "Wisdom unfolding..."}
                    </p>
                  </div>

                  {/* Reflection Card (Teaser for Journaling Feature) */}
                  <div className="bg-orange-50/50 p-6 rounded-[2rem] border border-orange-100/50 italic">
                    <p className="text-zinc-500 text-sm leading-relaxed">
                      "I saved this verse because..." (Personal notes coming soon)
                    </p>
                  </div>
                </div>

                {/* Action Footer */}
                <div className="mt-10 pt-6 border-t border-orange-50 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <Link 
                      href={`/verse/${verse.chapter_number}/${verse.verse_number}`}
                      className="flex items-center gap-2 px-6 py-2.5 bg-zinc-900 text-white rounded-full text-sm font-bold shadow-lg hover:bg-black transition-all active:scale-95"
                    >
                      🧘 Reflect
                    </Link>
                    <Link 
                      href={`/verse/${verse.chapter_number}/${verse.verse_number}`}
                      className="text-orange-600 font-bold text-sm hover:underline"
                    >
                      View Full Insight →
                    </Link>
                  </div>
                  
                  <button 
                    onClick={async () => {
                      const res = await fetch("/api/favorites/toggle", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ 
                          chapter_id: verse.chapter_number, 
                          verse_number: verse.verse_number 
                        }),
                      });
                      if (res.ok) {
                        window.location.reload(); // Simple approach to update after removal
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-zinc-400 hover:text-red-500 transition-colors text-sm font-medium"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
