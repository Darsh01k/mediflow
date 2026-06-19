import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkDailyUsage, incrementUsage } from "@/lib/usage";
import { generateSubtopics } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;

    const { topic, pageCount, academicLevel, tone, language } = await req.json();

    if (!topic || !pageCount || !academicLevel || !tone || !language) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const usage = await checkDailyUsage(userId);

    if (!usage.canGenerate) {
      return NextResponse.json(
        { error: "Daily generation limit reached. Please try again tomorrow." },
        { status: 429 }
      );
    }

    const subtopics = await generateSubtopics({
      topic,
      pageCount,
      academicLevel,
      tone,
      language,
    });

    await incrementUsage(userId);

    return NextResponse.json(subtopics);
  } catch (error) {
    console.error("Subtopics generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate subtopics" },
      { status: 500 }
    );
  }
}
