"use client";
import { useState } from "react";
import { useAuth, SignInButton } from "@clerk/nextjs";

export default function GitaChat({ verseText }: { verseText: string }) {
  const { isSignedIn } = useAuth();
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const askMentor = async () => {
    if (!input.trim()) return;
    setIsTyping(true);
    setResponse("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, verseContext: verseText }),
      });
      
      const data = await res.json();
      
      if (res.status === 403) {
        setResponse("PREMIUM_REQUIRED");
        return;
      }

      if (data.text) {
        setResponse(data.text);
      } else {
        setResponse("The spiritual channels are a bit quiet. Please try again.");
      }
    } catch (err) {
      setResponse("The Mentor is deep in reflection. Please try again soon.");
    } finally {
      setIsTyping(false);
      setInput("");
    }
  };

  if (!isSignedIn) {
    return (
      <div className="mt-16 w-full max-w-3xl mx-auto">
        <div className="bg-white/40 backdrop-blur-2xl rounded-[2.5rem] p-12 border border-white shadow-[0_20px_50px_rgba(234,88,12,0.05)] text-center relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-400 to-transparent opacity-30" />
          <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-6">🧘</div>
          <h3 className="font-serif text-2xl font-bold text-zinc-900 mb-4">Connect with the Mentor</h3>
          <p className="text-zinc-500 max-w-md mx-auto mb-8 font-medium italic">
            "Sign in to unlock personalized guidance and seek peace from today's wisdom."
          </p>
          <SignInButton mode="modal">
            <button className="px-10 py-4 bg-zinc-900 text-white rounded-2xl font-bold shadow-xl shadow-zinc-200 hover:bg-black transition-all active:scale-95">
              Sign In to Ask
            </button>
          </SignInButton>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-16 w-full max-w-3xl mx-auto">
      <div className="bg-white/40 backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-12 border border-white shadow-[0_20px_50px_rgba(234,88,12,0.05)] text-center relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-400 to-transparent opacity-50" />
        
        <h3 className="font-serif text-2xl font-bold text-zinc-900 mb-2">Seek Divine Guidance</h3>
        <p className="text-zinc-500 text-sm mb-8 font-medium italic">"Ask about the challenges of your heart and soul..."</p>
        
        {response && (
          <div className="mb-8 relative overflow-hidden rounded-3xl border border-orange-100 shadow-sm animate-in fade-in zoom-in duration-500 text-left">
            {response === "PREMIUM_REQUIRED" ? (
              <div className="relative p-8 bg-white/60">
                {/* Blurred Content Teaser */}
                <div className="absolute -top-3 left-6 px-3 py-1 bg-orange-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-full z-10">Mentor</div>
                <div className="blur-[5px] select-none opacity-40">
                  <p className="text-zinc-800 italic leading-relaxed font-serif text-lg">
                    This is a profound realization. The Geeta teaches us that the soul is eternal, and the challenges you face today are but ripples on the surface of a deep ocean. To navigate these waters, one must first find the center of...
                  </p>
                </div>
                
                {/* Paywall Overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-orange-50/10 backdrop-blur-[1px] p-6 text-center z-20">
                  <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-xl mb-4 border border-orange-100">🔒</div>
                  <h3 className="font-serif text-xl font-bold text-orange-900 mb-2">Unlock Full Wisdom</h3>
                  <p className="text-sm text-zinc-600 mb-6 max-w-xs mx-auto">You've reached your free limit. Upgrade to continue your journey with the Mentor.</p>
                  <a 
                    href="/premium" 
                    className="bg-orange-600 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-orange-100 hover:bg-orange-700 hover:scale-105 transition-all"
                  >
                    Reveal Full Insight
                  </a>
                </div>
              </div>
            ) : (
              <div className="p-6 bg-white/60 relative">
                <div className="absolute -top-3 left-6 px-3 py-1 bg-orange-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-full">Mentor</div>
                <p className="text-zinc-700 italic leading-relaxed font-serif text-lg">
                  "{response}"
                </p>
              </div>
            )}
          </div>
        )}

        <div className="relative group/input">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && askMentor()}
            placeholder="Ask about stress, purpose, or peace..."
            className="w-full pl-8 pr-20 py-5 rounded-2xl bg-white border border-orange-100 shadow-inner text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all font-medium"
          />
          <button 
            onClick={askMentor}
            disabled={isTyping}
            className="absolute right-3 top-3 bottom-3 px-6 bg-zinc-900 text-white rounded-xl font-bold hover:bg-black transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center gap-2"
          >
            {isTyping ? (
              <div className="flex gap-1">
                <span className="w-1 h-1 bg-white rounded-full animate-bounce" />
                <span className="w-1 h-1 bg-white rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1 h-1 bg-white rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            ) : (
              "Ask"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}