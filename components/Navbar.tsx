"use client";
import Link from "next/link";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full bg-[#fffcf5]/80 backdrop-blur-xl border-b border-orange-100 z-50">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 active:scale-95 transition-transform">
          <div className="w-10 h-10 bg-orange-600 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg shadow-orange-200">
            G
          </div>
          <span className="font-serif font-bold text-2xl text-zinc-900 tracking-tight">Daily Geeta</span>
        </Link>

        {/* Options / Actions */}
        <div className="flex items-center gap-6">
          <Show when="signed-in">
            <Link 
              href="/library/saved" 
              className="hidden md:flex items-center gap-2 px-5 py-2 text-zinc-600 rounded-full text-sm font-bold hover:bg-zinc-100 transition-all active:scale-95"
            >
              📔 My Collection
            </Link>
            <Link 
              href="/premium" 
              className="hidden md:flex items-center gap-2 px-5 py-2 bg-orange-50 text-orange-700 rounded-full text-sm font-bold border border-orange-200 hover:bg-orange-100 hover:shadow-sm transition-all active:scale-95"
            >
              <span className="text-lg leading-none">✨</span>
              Go Premium
            </Link>
          </Show>

          {/* Authentication Section */}
          <div className="flex items-center gap-4">
            <Show when="signed-out">
              <SignInButton mode="modal">
                <button className="px-6 py-2.5 bg-zinc-900 text-white rounded-full text-sm font-bold shadow-lg shadow-zinc-200 hover:bg-black transition-all active:scale-95">
                  Sign In
                </button>
              </SignInButton>
            </Show>
            
            <Show when="signed-in">
              <UserButton 
                appearance={{
                  elements: {
                    userButtonAvatarBox: "w-10 h-10 border-2 border-orange-100",
                    userButtonTrigger: "hover:scale-105 active:scale-95 transition-transform"
                  }
                }}
              />
            </Show>
          </div>
        </div>
      </div>
    </nav>
  );
}
