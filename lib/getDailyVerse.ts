import verses from '../data/verses.json';

export function getDailyVerse() {
  const today = new Date();
  // Unique number for every day (0-365)
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
  
  // Use modulo to cycle through all verses in your JSON
  const index = dayOfYear % verses.length;
  return verses[index];
}