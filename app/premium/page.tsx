"use client";

import { useUser } from "@clerk/nextjs";

export default function Premium() {
  const { user } = useUser();
  const features = [
    { 
      title: "AI Gita Mentor", 
      desc: "Connect with a personal AI companion that helps you apply the Geeta's wisdom to your specific life challenges.",
      icon: "🧘"
    },
    { 
      title: "Daily WhatsApp Insights", 
      desc: "Receive deep spiritual reflections and shlokas directly on your phone every morning.",
      icon: "📱"
    },
    { 
      title: "Ad-Free Sanctuary", 
      desc: "Immerse yourself in a completely distraction-free environment designed for deep contemplation.",
      icon: "✨"
    },
    { 
      title: "Personal Wisdom Vault", 
      desc: "Curate your own collection of shlokas and notes for a personalized spiritual journey.",
      icon: "📔"
    }
  ];

  const makePayment = async () => {
    if (!user) {
      alert("Please sign in to continue.");
      return;
    }

    try {
      // 1. Get the Order ID from your backend
      const res = await fetch("/api/razorpay", { method: "POST" });
      const order = await res.json();

      if (order.error) {
        alert("Failed to initiate payment. Please try again.");
        return;
      }

      // 2. Configure the Razorpay Modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
        amount: order.amount,
        currency: order.currency,
        name: "Daily Geeta Premium",
        description: "Unlock AI Mentor & Ad-Free Experience",
        order_id: order.id,
        handler: async function (response: any) {
          try {
            // This runs if payment is successful
            const verifyRes = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              alert("Congratulations! Your spiritual journey is now premium.");
              window.location.href = "/library"; // Redirect back to library
            } else {
              alert("Verification failed: " + verifyData.error);
            }
          } catch (err) {
            console.error("Verification Error:", err);
            alert("Something went wrong during verification.");
          }
        },
        prefill: {
          name: user.fullName || "Seeker", 
          email: user.primaryEmailAddress?.emailAddress || "",
        },
        notes: {
          user_id: user.id // <--- THIS IS THE MAGIC BRIDGE
        },
        theme: { color: "#ea580c" }, // Orange to match your UI
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment Error:", err);
      alert("An unexpected error occurred. Check the console for details.");
    }
  };


  return (
    <main className="min-h-screen bg-[#fffcf5] relative overflow-hidden pt-32 pb-20 px-6">
      {/* Divine Background Image - 50% Opacity */}
      <div 
        className="fixed inset-0 z-0 opacity-50 pointer-events-none"
        style={{
          backgroundImage: 'url("/divine-bg.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Decorative background elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-orange-100/40 rounded-full blur-[120px] z-0" />
      
      <div className="max-w-5xl mx-auto relative z-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-100 text-orange-700 text-xs font-bold uppercase tracking-widest mb-8 border border-orange-200">
          Elevate Your Experience
        </div>
        
        <h1 className="text-4xl md:text-6xl font-serif font-bold text-zinc-900 mb-6 tracking-tight">
          Unlock the Full <span className="text-orange-600 italic">Essence</span>
        </h1>
        <p className="text-zinc-500 text-lg md:text-xl max-w-2xl mx-auto mb-16 leading-relaxed">
          Deepen your spiritual connection with advanced tools designed for the modern seeker.
        </p>

        <div className="grid md:grid-cols-2 gap-8 mb-20 text-left">
          {features.map((f) => (
            <div key={f.title} className="group p-8 rounded-[2.5rem] bg-white border border-orange-100 shadow-[0_10px_30px_rgba(234,88,12,0.05)] hover:shadow-[0_20px_40px_rgba(234,88,12,0.1)] transition-all hover:-translate-y-1">
              <div className="text-4xl mb-6 bg-orange-50 w-16 h-16 rounded-2xl flex items-center justify-center border border-orange-100 group-hover:bg-orange-600 transition-colors group-hover:border-orange-600">
                <span className="group-hover:scale-110 transition-transform">{f.icon}</span>
              </div>
              <h3 className="text-xl font-bold text-zinc-900 mb-3">{f.title}</h3>
              <p className="text-zinc-500 leading-relaxed font-medium">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="max-w-md mx-auto bg-white p-8 rounded-[3rem] shadow-[0_30px_60px_rgba(0,0,0,0.08)] border border-orange-50 relative">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-600 text-white text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-1.5 rounded-full shadow-lg">
            Limited Time Offer
          </div>
          <div className="flex flex-col items-center mb-8">
            <span className="text-zinc-400 font-bold mb-2">Premium Membership</span>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-serif font-bold">₹99</span>
              <span className="text-zinc-500 font-medium">/ month</span>
            </div>
          </div>
          
          <ul className="space-y-4 mb-8 text-left max-w-[200px] mx-auto">
            <li className="flex items-center gap-3 text-zinc-600 font-medium text-sm">
              <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
              Full AI Integration
            </li>
            <li className="flex items-center gap-3 text-zinc-600 font-medium text-sm">
              <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
              Exclusive Content
            </li>
            <li className="flex items-center gap-3 text-zinc-600 font-medium text-sm">
              <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
              Ad-Free Experience
            </li>
          </ul>

          <button 
            onClick={makePayment}
            className="w-full py-5 bg-orange-600 text-white rounded-[1.5rem] font-bold text-lg shadow-[0_10px_20px_rgba(234,88,12,0.3)] hover:bg-orange-700 hover:shadow-[0_15px_30px_rgba(234,88,12,0.4)] transition-all active:scale-95"
          >
            Begin Your Journey
          </button>
          <p className="mt-6 text-zinc-400 text-xs font-medium">Cancel anytime. No hidden fees.</p>
        </div>
      </div>
    </main>
  );
}
