"use client";

import { useState } from "react";

interface RemoveFavoriteButtonProps {
  chapter: number;
  verse: number;
}

export default function RemoveFavoriteButton({ chapter, verse }: RemoveFavoriteButtonProps) {
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemove = async () => {
    if (isRemoving) return;
    
    setIsRemoving(true);
    try {
      const res = await fetch("/api/favorites/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          chapter_id: chapter, 
          verse_number: verse 
        }),
      });
      
      if (res.ok) {
        window.location.reload(); // Refresh to update the list
      } else {
        alert("Failed to remove from collection.");
      }
    } catch (err) {
      console.error("Remove Error:", err);
      alert("Error removing verse.");
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <button 
      onClick={handleRemove}
      disabled={isRemoving}
      className={`flex items-center gap-2 px-4 py-2 text-zinc-400 hover:text-red-500 transition-colors text-sm font-medium ${isRemoving ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
      </svg>
      {isRemoving ? "Removing..." : "Remove"}
    </button>
  );
}
