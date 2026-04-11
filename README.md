# 🕉️ Daily Geeta: Your AI-Powered Spiritual Mentor

**Daily Geeta** is a modern, premium spiritual platform designed to bring the eternal wisdom of the Bhagavad Gita into your daily life. Combining ancient sacred texts with cutting-edge AI, it provides personalized guidance, usage-aware mentoring, and a secure premium experience.

---

## ✨ Key Features

### 🧘 Divine AI Mentor
Connect with our **Geeta AI Mentor** powered by Google Gemini 3.
- **Contextual Wisdom**: The Mentor understands the specific verse you are reading.
- **Emotional Intelligence**: It reflects your emotional state—providing grounding when you're anxious and fire when you need purpose.
- **Freemium Teaser**: Experience the wisdom for free (3 soul-chats) before upgrading to unlimited access with a beautiful "Blurred Insight" preview.

### 📚 Complete Sacred Library
- **700 Verses**: Access all 18 chapters of the Bhagavad Gita.
- **Dual-Source Logic**: Robust fetching from RapidAPI v2 ensures the sacred text is always available.
- **Rich Media**: Transliteration, word-by-word analysis, and multiple translation mappings.

### 📔 Sacred Collection
- **Save Your Favorites**: Build your personal spiritual journal.
- **Reflect & Return**: One-click integration with the AI Mentor to dive deeper into your saved verses.

### 💳 Premium Experience
- **Razorpay Integration**: Seamless and secure payment flow with instant activation.
- **7-Day Trial**: Experience the full premium journey for free before you commit.
- **Growth Engine**: Refer friends to earn Divine Points and extend your experience.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (Turbopack)
- **Authentication**: [Clerk](https://clerk.dev/)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL + RLS)
- **Payments**: [Razorpay](https://razorpay.com/)
- **AI**: [Google Generative AI](https://ai.google.dev/) (Gemini 3 Flash/Lite)
- **Styling**: Tailwind CSS 4.0 (Custom "Divine Glow" theme)

---

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/Saptami191/daily-geeta.git
cd daily-geeta
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

GEMINI_API_KEY=AIzaSy...
RAPID_GITA_KEY=...

NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

NEXT_PUBLIC_RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
```

### 3. Initialize Database
Run the following SQL in your Supabase Editor:
- [Usage Tracking SQL](file:///C:/Users/LENOVO/.gemini/antigravity/brain/e6503944-a503-4434-a827-d4c37e1c947e/project_status_summary.md)
- [Sacred Collection SQL](file:///C:/Users/LENOVO/.gemini/antigravity/brain/e6503944-a503-4434-a827-d4c37e1c947e/project_status_summary.md)

### 4. Run Locally
```bash
npm run dev
```

---

## 🌿 Software Development Life Cycle (SDLC)

We follow a **Feature-Based Branching** workflow. Please see our [GitHub Workflow Guide](file:///C:/Users/LENOVO/.gemini/antigravity/brain/e6503944-a503-4434-a827-d4c37e1c947e/github_workflow.md) for detailed instructions on branching strategies and commit conventions.

---

## 🕉️ Mission
Our mission is to make the Bhagavad Gita's wisdom accessible, personalized, and relevant for the modern soul. Join us in this journey of self-discovery and peace.

**Jai Shri Krishna!** 🙏
