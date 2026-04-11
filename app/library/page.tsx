import { checkAccess } from "@/lib/access";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function LibraryPage() {
  const hasAccess = await checkAccess();

  // If trial over and not premium, send them to payment page
  if (!hasAccess) {
    redirect("/?reason=trial_expired");
  }

  const chapters = [
    { id: 1, name: "Arjuna Visada Yoga", verses: 47, title: "Arjuna's Dilemma", description: "The crisis and moral conflict" },
    { id: 2, name: "Sankhya Yoga", verses: 72, title: "Sankhya Yoga", description: "Knowledge of the eternal reality" },
    { id: 3, name: "Karma Yoga", verses: 43, title: "Karma Yoga", description: "The path of selfless action" },
    { id: 4, name: "Jnana Yoga", verses: 42, title: "Jnana Yoga", description: "The path of knowledge" },
    { id: 5, name: "Karma Sanyasa", verses: 29, title: "Karma Sanyasa", description: "Action and renunciation" },
    { id: 6, name: "Dhyana Yoga", verses: 47, title: "Dhyana Yoga", description: "The path of meditation" },
    { id: 7, name: "Jnana-Vijnana", verses: 30, title: "Jnana-Vijnana", description: "Knowledge and realization" },
    { id: 8, name: "Akshara Brahma", verses: 28, title: "Akshara Brahma", description: "The imperishable absolute" },
    { id: 9, name: "Raja Vidya", verses: 34, title: "Raja Vidya", description: "The royal secret knowledge" },
    { id: 10, name: "Vibhuti Yoga", verses: 42, title: "Vibhuti Yoga", description: "Divine manifestations" },
    { id: 11, name: "Visvarupa Darshana", verses: 55, title: "Visvarupa Darshana", description: "The universal form" },
    { id: 12, name: "Bhakti Yoga", verses: 20, title: "Bhakti Yoga", description: "The path of devotion" },
    { id: 13, name: "Kshetra Kshetrajna", verses: 35, title: "Kshetra Kshetrajna", description: "The field and its knower" },
    { id: 14, name: "Guna Traya Vibhaga", verses: 27, title: "Guna Traya Vibhaga", description: "The three modes of nature" },
    { id: 15, name: "Purushottama Yoga", verses: 20, title: "Purushottama Yoga", description: "The supreme person" },
    { id: 16, name: "Daivasura Sampad", verses: 24, title: "Daivasura Sampad", description: "Divine and demoniac qualities" },
    { id: 17, name: "Sraddha Traya Vibhaga", verses: 28, title: "Sraddha Traya Vibhaga", description: "The three kinds of faith" },
    { id: 18, name: "Moksha Sanyasa", verses: 78, title: "Moksha Sanyasa", description: "Liberation and renunciation" }
  ];

  return (
    <div className="min-h-screen bg-[#fffcf5] relative overflow-hidden">
      {/* Divine Background Image with Glowing Effect */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60 brightness-[1.1] saturate-[1.2] transition-all duration-1000"
        style={{ backgroundImage: 'url("/divine-bg.png")' }}
      />
      
      {/* Extra Glowing Overlays */}
      <div className="absolute top-0 right-1/4 w-[40%] h-[40%] bg-orange-200/20 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-0 left-1/4 w-[50%] h-[50%] bg-yellow-100/20 rounded-full blur-[130px] animate-pulse [animation-duration:7s]" />
      
      <div className="absolute inset-0 bg-[#fffcf5]/20 backdrop-blur-[0.5px]" />
      
      <main className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-orange-900 mb-4">
            Bhagavad Gita: Complete Library
          </h1>
          <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
            Explore all 18 chapters and 700 verses of eternal wisdom. Your access unlocks complete sacred text.
          </p>
        </div>

        {/* Chapters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {chapters.map((chapter) => (
            <Link 
              key={chapter.id} 
              href={`/library/chapter/${chapter.id}`}
              className="block"
            >
              <div className="bg-white/80 backdrop-blur-sm border border-orange-100 rounded-2xl p-6 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer group">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-600 font-bold text-lg">{chapter.id}</span>
                  </div>
                  <svg className="w-5 h-5 text-orange-400 group-hover:text-orange-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-zinc-800 mb-2 group-hover:text-orange-700 transition-colors">
                  Chapter {chapter.id}
                </h3>
                <h4 className="font-semibold text-orange-900 mb-2">{chapter.title}</h4>
                <p className="text-sm text-zinc-600 mb-3">{chapter.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-500 bg-zinc-100 px-2 py-1 rounded-full">
                    {chapter.verses} Verses
                  </span>
                  <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full font-medium">
                    {chapter.name}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Footer Info */}
        <div className="mt-16 text-center">
          <div className="bg-orange-50 rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-orange-900 mb-4">Complete Spiritual Wisdom</h3>
            <p className="text-zinc-600 mb-6">
              Access the full 700 verses of Bhagavad Gita, each containing timeless wisdom for modern life.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-orange-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-orange-700 font-bold text-sm">700</span>
                </div>
                <div>
                  <h4 className="font-semibold text-zinc-800">Sacred Verses</h4>
                  <p className="text-sm text-zinc-600">Complete wisdom</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-orange-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-orange-700 font-bold text-sm">18</span>
                </div>
                <div>
                  <h4 className="font-semibold text-zinc-800">Chapters</h4>
                  <p className="text-sm text-zinc-600">Complete journey</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-orange-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-orange-700 font-bold text-sm">AI</span>
                </div>
                <div>
                  <h4 className="font-semibold text-zinc-800">Spiritual Mentor</h4>
                  <p className="text-sm text-zinc-600">Personalized guidance</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
