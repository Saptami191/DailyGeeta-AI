"use client";

import { useState, useEffect } from "react";
import { getDailyVerse } from "../lib/getDailyVerse";
import GitaChat from "../components/GitaChat";
import TrialStatus from "../components/TrialStatus";
import ReferralSystem from "../components/ReferralSystem";
import VerseRating from "../components/VerseRating";
import EmailShare from "../components/EmailShare";
import { useUser } from "@clerk/nextjs"; // Added Clerk
import { supabase } from "../lib/supabase"; // Added Supabase
import Link from "next/link";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://daily-geeta-ai.vercel.app";

export default function Home() {
  const { user } = useUser(); // Get logged-in user details
  const [verse, setVerse] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"meaning" | "words">("meaning");
  const [trialStatus, setTrialStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setVerse(getDailyVerse());
    if (user) {
      fetchTrialStatus();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchTrialStatus = async () => {
    try {
      const response = await fetch('/api/trial/status');
      const data = await response.json();
      setTrialStatus(data);
    } catch (error) {
      console.error('Error fetching trial status:', error);
    } finally {
      setLoading(false);
    }
  };

  const canAccessPremium = () => {
    if (!user) return false;
    if (!trialStatus) return false;
    return trialStatus.isInTrial;
  };

  const [isSaved, setIsSaved] = useState(false);

  // --- FUNCTION: Save to Favorites ---
  const handleSaveFavorite = async () => {
    if (!user) return alert("Please sign in to save verses!");
    
    try {
      const res = await fetch("/api/favorites/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          chapter_id: verse.chapter_number, 
          verse_number: verse.verse_number 
        }),
      });
      const data = await res.json();
      
      if (data.error) throw new Error(data.error);
      
      setIsSaved(data.saved);
      alert(data.saved ? "Verse saved to your collection! 🙏" : "Verse removed from your collection.");
    } catch (error: any) {
      alert("Error: " + error.message);
    }
  };

  // --- FUNCTION: Handle Razorpay Payment ---
  const handlePayment = async () => {
    if (!user) return alert("Please sign in to upgrade.");

    // Check if user is still in trial
    if (trialStatus && trialStatus.isInTrial) {
      const confirmUpgrade = confirm(`You still have ${trialStatus.daysRemaining} days left in your free trial. Are you sure you want to upgrade now?`);
      if (!confirmUpgrade) return;
    }

    // 1. Create Order on your backend
    const res = await fetch("/api/razorpay", { method: "POST" });
    const order = await res.json();

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: "INR",
      name: "Daily Geeta Premium",
      description: "Unlock All Verses & AI Mentor",
      order_id: order.id,
      handler: async function (response: any) {
        // 2. Sync Payment to Supabase
        const verifyRes = await fetch("/api/razorpay/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          }),
        });

        if (verifyRes.ok) {
          alert("Jai Shri Krishna! Your Premium access is now active.");
          window.location.reload(); // Refresh to update UI
        } else {
          alert("Payment verification failed. Please contact support.");
        }
      },
      prefill: { email: user.primaryEmailAddress?.emailAddress },
      notes: {
        user_id: user.id // <--- THIS IS THE MAGIC BRIDGE
      },
      theme: { color: "#ea580c" },
    };


    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  };

  if (!verse) {
    return (
      <div className="min-h-screen bg-[#fffcf5] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin" />
          <p className="text-orange-900/60 font-serif animate-pulse">Seeking Wisdom...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fffcf5] relative overflow-hidden">
      {/* Divine Background Image with Glowing Effect */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-70 brightness-[1.15] saturate-[1.3] transition-all duration-1000"
        style={{ backgroundImage: 'url("/divine-bg.png")' }}
      />
      
      {/* Extra Glowing Overlays */}
      <div className="absolute top-0 left-1/4 w-[50%] h-[50%] bg-orange-200/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-[60%] h-[60%] bg-yellow-100/30 rounded-full blur-[150px] animate-pulse [animation-duration:8s]" />
      
      {/* Overlay to ensure text readability */}
      <div className="absolute inset-0 bg-[#fffcf5]/20 backdrop-blur-[1px]" />
      
      <main className="relative z-10 max-w-4xl mx-auto px-6 pt-24 pb-20">
        {/* Trial Status for logged-in users */}
        {user && <TrialStatus />}

        {/* Main Verse Content */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl mb-6">
          {/* Sanskrit Shloka */}
          <div className="relative mb-8">
            <div className="absolute -top-10 -left-6 text-6xl text-orange-100 font-serif select-none">"</div>
            <h2 className="text-2xl md:text-4xl font-serif leading-[1.6] text-zinc-800 font-bold whitespace-pre-line text-center">
              {verse.text}
            </h2>
            <div className="absolute -bottom-10 -right-6 text-6xl text-orange-100 font-serif select-none">"</div>
          </div>

          {/* English Letters / Transliteration */}
          <div className="mt-4 mb-8 text-center px-4">
            <p className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-1">English Pronunciation</p>
            <p className="text-md text-zinc-500 italic font-medium">
              {verse.transliteration || "Loading transliteration..."}
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="w-full max-w-2xl bg-orange-50/50 p-1 rounded-2xl flex mb-8">
            <button
              onClick={() => setActiveTab("meaning")}
              className={`flex-1 py-3 px-6 rounded-xl text-sm font-bold transition-all ${
                activeTab === "meaning"
                  ? "bg-white text-orange-700 shadow-md"
                  : "text-zinc-500 hover:text-orange-600"
              }`}
            >
              Detailed Meaning
            </button>
            <button
              onClick={() => setActiveTab("words")}
              className={`flex-1 py-3 px-6 rounded-xl text-sm font-bold transition-all ${
                activeTab === "words"
                  ? "bg-white text-orange-700 shadow-md"
                  : "text-zinc-500 hover:text-orange-600"
              }`}
            >
              Word Meanings
            </button>
          </div>

            {/* Content Area */}
          <div className="w-full max-w-2xl min-h-[160px]">
            {activeTab === "meaning" ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div>
                  <p className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-2">English Translation</p>
                  <p className="text-lg md:text-xl text-zinc-700 leading-relaxed font-serif">
                    {verse.translation}
                  </p>
                </div>
                <div className="pt-6 border-t border-orange-100">
                  <p className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-2">Hindi Translation</p>
                  <p className="text-lg md:text-xl text-zinc-700 leading-relaxed font-serif">
                    {verse.hindi_translation}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white/50 border border-orange-100 p-6 rounded-2xl animate-in fade-in slide-in-from-bottom-2 duration-500">
                <p className="text-zinc-600 leading-relaxed text-sm md:text-base whitespace-pre-line">
                  {typeof verse.word_meanings === 'string' 
                    ? verse.word_meanings 
                    : "Detailed word-by-word analysis coming soon."}
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => {
                const text = `*Daily Geeta Insight*%0A%0AChapter ${verse.chapter_number}, Verse ${verse.verse_number}%0A%0A"${verse.text}"%0A%0ARead more at: ${siteUrl}`;
                window.open(`https://wa.me/?text=${text}`, '_blank');
              }}
              className="group flex items-center gap-3 bg-green-600 text-white px-8 py-4 rounded-full font-bold shadow-lg hover:bg-green-700 hover:scale-105 active:scale-95 transition-all w-full sm:w-auto justify-center"
            >
              Share on WhatsApp
            </button>
            
            <button 
              onClick={handleSaveFavorite}
              className={`flex items-center gap-3 px-8 py-4 rounded-full font-bold shadow-lg hover:scale-105 active:scale-95 transition-all w-full sm:w-auto justify-center ${
                isSaved ? "bg-orange-600 text-white" : "bg-zinc-900 text-white hover:bg-black"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
              {isSaved ? "Saved" : "Save to Favorites"}
            </button>

            {/* Library/Upgrade Button - Dynamic based on trial status */}
            {trialStatus?.isInTrial ? (
              <Link 
                href="/library"
                className="flex items-center gap-3 bg-purple-600 text-white px-8 py-4 rounded-full font-bold shadow-lg hover:bg-purple-700 hover:scale-105 active:scale-95 transition-all w-full sm:w-auto justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                </svg>
                Browse All 700 Verses {trialStatus.daysRemaining > 0 && `(${trialStatus.daysRemaining} days trial left)`}
              </Link>
            ) : (
              <button 
                onClick={handlePayment}
                className="flex items-center gap-3 bg-orange-600 text-white px-8 py-4 rounded-full font-bold shadow-lg hover:bg-orange-700 hover:scale-105 active:scale-95 transition-all w-full sm:w-auto justify-center"
              >
                Unlock Full Library (Trial Expired)
              </button>
            )}
          </div>
        </div>

        {/* New SaaS Features Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Verse Rating */}
          <VerseRating verseId={`${verse.chapter_number}-${verse.verse_number}`} />
          
          {/* Email Sharing */}
          <EmailShare 
            verseText={verse.text}
            chapterNumber={verse.chapter_number}
            verseNumber={verse.verse_number}
            translation={verse.translation}
          />
        </div>

        {/* Referral System for logged-in users */}
        {user && <ReferralSystem />}

        {/* AI Chat - Only show if user can access premium features */}
        {canAccessPremium() && <GitaChat verseText={verse.text} />}
      </main>
    </div>
  );
}