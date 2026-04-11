import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const MODELS = [
  "gemini-3-flash-preview",
  "gemini-3.1-flash-lite-preview",
  "gemini-2.5-flash"
];

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Fetch Profile & Usage Stats
    const { data: profile, error: profileErr } = await supabaseAdmin
      .from("profiles")
      .select("is_premium, free_chats_used")
      .eq("clerk_id", userId)
      .single();

    if (profileErr || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // 2. Usage Guard (3-Message Teaser)
    if (!profile.is_premium && profile.free_chats_used >= 3) {
      return NextResponse.json(
        { error: "PREMIUM_REQUIRED", message: "You have reached the limit of your free seeker's journey." }, 
        { status: 403 }
      );
    }

    const { message, verseContext } = await req.json();

    // 3. Divine Personality Prompt with Emotional Intelligence
    const systemPrompt = `
      You are a Divine Geeta Mentor. Your personality is compassionate, wise, and deeply peaceful.
      You help modern seekers find solutions to their life challenges through the eternal wisdom of the Bhagavad Gita.
      
      CONTEXT (Today's Verse): ${verseContext}
      
      GUIDELINES:
      - Use metaphors related to nature, souls, and light.
      - Don't just quote: explain the psychological and spiritual application to the user's specific problem.
      - Mirror the user's emotional state—if they are anxious, provide grounding and stillness; if they are seeking motivation, provide fire and purpose.
      - End your response with a short, reflective question centered around growth.
      - If the user's question is disrespectful or irrelevant to Gita, gently guide them back to the path of wisdom.
      
      User's Inquiry: "${message}"
    `;

    // 4. Call Gemini
    let aiResponse = "";
    for (const modelName of MODELS) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(systemPrompt);
        const response = await result.response;
        aiResponse = response.text();
        break; 
      } catch (err) {
        console.error(`${modelName} failed, trying next...`);
      }
    }

    if (!aiResponse) {
      return NextResponse.json({ error: "Spiritual channels crowded" }, { status: 503 });
    }

    // 5. Increment Usage if not Premium
    if (!profile.is_premium) {
      await supabaseAdmin
        .from("profiles")
        .update({ free_chats_used: (profile.free_chats_used || 0) + 1 })
        .eq("clerk_id", userId);
    }

    return NextResponse.json({ text: aiResponse });

  } catch (error: any) {
    console.error("Critical System Error:", error.message);
    return NextResponse.json({ error: "System Error" }, { status: 500 });
  }
}