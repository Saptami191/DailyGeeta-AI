import { checkAccess } from "@/lib/access";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function ChapterPage({ 
  params 
}: { 
  params: Promise<{ chapterId: string }> 
}) {
  const { chapterId } = await params;

  // 1. Security Check
  const hasAccess = await checkAccess();
  if (!hasAccess) {
    redirect("/?reason=trial_expired");
  }

  try {
    // 2. Fetch from RapidAPI v2
    const response = await fetch(`https://bhagavad-gita3.p.rapidapi.com/v2/chapters/${chapterId}/verses/`, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': process.env.RAPID_GITA_KEY as string,
        'x-rapidapi-host': 'bhagavad-gita3.p.rapidapi.com'
      },
      next: { revalidate: 3600 }
    });

    if (!response.ok) throw new Error("API call failed");

    const verses = await response.json();

    return (
      <div className="min-h-screen bg-[#fffcf5] pb-20 relative overflow-hidden">
        {/* Divine Background Image with Glowing Effect */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60 brightness-[1.15] saturate-[1.3] transition-all duration-1000"
          style={{ backgroundImage: 'url("/divine-bg.png")' }}
        />
        
        {/* Extra Glowing Overlays */}
        <div className="absolute top-0 left-1/4 w-[50%] h-[50%] bg-orange-200/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[60%] h-[60%] bg-yellow-100/30 rounded-full blur-[150px] animate-pulse [animation-duration:8s]" />
        
        {/* Overlay to ensure text readability */}
        <div className="absolute inset-0 bg-[#fffcf5]/20 backdrop-blur-[1px]" />

        <div className="max-w-4xl mx-auto px-6 pt-12 relative z-10">
          <Link href="/library" className="text-orange-600 font-bold mb-8 inline-block hover:underline">
            ← Back to Library
          </Link>
          
          <div className="mb-12">
            <h1 className="text-4xl font-serif font-bold text-zinc-900 mb-2">
              Chapter {chapterId}
            </h1>
            <p className="text-orange-500 font-medium">{verses.length} Sacred Verses Found</p>
          </div>

          <div className="grid gap-8">
            {verses.map((v: any) => (
              <div key={v.id} className="p-8 bg-white rounded-[2.5rem] border border-orange-100 shadow-sm hover:shadow-md transition-all">
                <div className="flex justify-between items-center mb-6">
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold uppercase">
                    Verse {v.verse_number}
                  </span>
                  <Link href={`/verse/${chapterId}/${v.verse_number}`} className="text-sm text-orange-600 font-bold">
                    Deep Insight →
                  </Link>
                </div>
                
                <p className="text-2xl md:text-3xl font-serif text-zinc-800 mb-6 leading-relaxed text-center font-bold">
                  {v.text}
                </p>
                
                <div className="border-t border-orange-50 pt-6 space-y-4">
                  <p className="text-zinc-500 italic text-sm leading-relaxed">{v.transliteration}</p>
                  
                  {/* Mapping the first English translation available */}
                  <p className="text-zinc-700 leading-relaxed font-serif text-lg">
                    {v.translations?.find((t: any) => t.language === 'english')?.description || "Translation coming soon..."}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Fetch error:", error);
    return (
      <div className="min-h-screen bg-[#fffcf5] flex items-center justify-center p-6 text-center">
        <div className="bg-white p-10 rounded-3xl shadow-xl border border-orange-100 max-w-md">
          <h2 className="text-2xl font-bold text-orange-900 mb-4">Sacred Connection Interrupted</h2>
          <p className="text-zinc-600 mb-8">RapidAPI is currently unable to provide the verses. Please verify your API key in .env.local.</p>
          <Link href="/library" className="bg-orange-600 text-white px-8 py-3 rounded-full font-bold shadow-lg">
            Return to Library
          </Link>
        </div>
      </div>
    );
  }
}
