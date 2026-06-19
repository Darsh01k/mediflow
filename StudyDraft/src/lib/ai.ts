import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  GENERATE_SUBTOPICS_PROMPT,
} from "@/prompts/generateSubtopics";
import { GENERATE_REPORT_PROMPT } from "@/prompts/generateReport";
import { ANALYZE_REFERENCE_PROMPT } from "@/prompts/analyzeReference";
import { SAME_TOPIC_REWRITE_PROMPT } from "@/prompts/sameTopicRewrite";
import { DIFFERENT_TOPIC_SAME_FORMAT_PROMPT } from "@/prompts/differentTopicSameFormat";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "";

function getModel() {
  if (GEMINI_API_KEY) {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }
  return null;
}

async function callAI(prompt: string, systemPrompt?: string): Promise<string> {
  const geminiModel = getModel();

  if (geminiModel) {
    const fullPrompt = systemPrompt
      ? `${systemPrompt}\n\n${prompt}`
      : prompt;
    const result = await geminiModel.generateContent(fullPrompt);
    return result.response.text();
  }

  if (OPENROUTER_API_KEY) {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/gpt-4o-mini",
          messages: [
            ...(systemPrompt
              ? [{ role: "system", content: systemPrompt }]
              : []),
            { role: "user", content: prompt },
          ],
        }),
      }
    );
    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter API error:", response.status, errorText);
      throw new Error(`OpenRouter API error: ${response.status}`);
    }
    const data = await response.json();
    return data.choices?.[0]?.message?.content || "";
  }

  throw new Error("No AI API key configured. Set GEMINI_API_KEY or OPENROUTER_API_KEY.");
}

function getDefaultSubtopics(topic: string) {
  return {
    title: topic,
    introductionHeading: "1. Introduction",
    subtopics: [
      { heading: "2. Background and Context", description: "Overview of the topic background" },
      { heading: "3. Main Analysis", description: "Core analysis and discussion" },
      { heading: "4. Key Findings", description: "Summary of important findings" },
    ],
    conclusionHeading: "5. Conclusion",
    suggestedReferences: ["Reference 1", "Reference 2"],
  };
}

function cleanJsonResponse(text: string): string {
  let cleaned = text.trim();
  if (!cleaned) throw new Error("Empty response from AI");

  // Remove markdown code blocks
  cleaned = cleaned.replace(/```[\w]*\n?/g, "").trim();

  // Try to extract JSON object from surrounding text
  const jsonStart = cleaned.indexOf("{");
  const jsonEnd = cleaned.lastIndexOf("}");
  if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
    cleaned = cleaned.slice(jsonStart, jsonEnd + 1);
  }

  return cleaned;
}

export async function generateSubtopics(params: {
  topic: string;
  academicLevel: string;
  pageCount: number;
  tone: string;
  language: string;
}) {
  const prompt = `Topic: ${params.topic}
Academic Level: ${params.academicLevel}
Page Count: ${params.pageCount}
Tone: ${params.tone}
Language: ${params.language}

Generate a report outline in JSON format for a ${params.pageCount}-page report.`;

  try {
    const response = await callAI(prompt, GENERATE_SUBTOPICS_PROMPT);
    const cleaned = cleanJsonResponse(response);
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("AI subtopics generation failed, using defaults:", e);
    return getDefaultSubtopics(params.topic);
  }
}

export async function generateReport(params: {
  topic: string;
  verifiedSubtopics: { heading: string; description?: string }[];
  academicLevel: string;
  pageCount: number;
  tone: string;
  language: string;
  introductionHeading: string;
  conclusionHeading: string;
  suggestedReferences: string[];
}) {
  const targetWords = params.pageCount * 500;
  const prompt = `Topic: ${params.topic}
Academic Level: ${params.academicLevel}
Page Count: ${params.pageCount}
Target Word Count: ${targetWords}
Tone: ${params.tone}
Language: ${params.language}
Introduction Heading: ${params.introductionHeading}
Conclusion Heading: ${params.conclusionHeading}

Verified Subtopics:
${params.verifiedSubtopics.map((s, i) => `${i + 1}. ${s.heading}${s.description ? ` - ${s.description}` : ""}`).join("\n")}

Suggested References:
${params.suggestedReferences.join("\n")}

Generate the complete academic report in markdown format. The report should be approximately ${targetWords} words total to fill ${params.pageCount} pages. Distribute content evenly across all subtopics.`;

  return await callAI(prompt, GENERATE_REPORT_PROMPT);
}

export async function analyzeReferenceReport(text: string) {
  const prompt = `Extracted document text:\n\n${text.slice(0, 20000)}`;
  const response = await callAI(prompt, ANALYZE_REFERENCE_PROMPT);
  const cleaned = cleanJsonResponse(response);
  try {
    return JSON.parse(cleaned);
  } catch {
    return {
      detectedTopic: "Unknown Topic",
      titleStyle: "Standard Academic Title",
      headingStructure: "Numbered sections",
      sectionOrder: ["Introduction", "Body", "Conclusion"],
      paragraphStyle: "Formal academic paragraphs",
      formattingNotes: "Standard academic formatting",
      referenceStyle: "APA",
      suggestedReusableFormat: "Standard academic report format",
    };
  }
}

export async function sameTopicRewrite(params: {
  referenceText: string;
  detectedStructure: string;
  academicLevel: string;
  pageCount: number;
  tone: string;
  language: string;
}) {
  const targetWords = params.pageCount * 500;
  const prompt = `Reference Text: ${params.referenceText.slice(0, 15000)}
Detected Structure: ${params.detectedStructure}
Academic Level: ${params.academicLevel}
Page Count: ${params.pageCount}
Target Word Count: ${targetWords}
Tone: ${params.tone}
Language: ${params.language}

Generate a new report on the same topic with completely different writing. The report should be approximately ${targetWords} words total to fill ${params.pageCount} pages.`;

  return await callAI(prompt, SAME_TOPIC_REWRITE_PROMPT);
}

export async function differentTopicSameFormat(params: {
  newTopic: string;
  referenceStructure: string;
  academicLevel: string;
  pageCount: number;
  tone: string;
  language: string;
}) {
  const targetWords = params.pageCount * 500;
  const prompt = `New Topic: ${params.newTopic}
Reference Structure: ${params.referenceStructure}
Academic Level: ${params.academicLevel}
Page Count: ${params.pageCount}
Target Word Count: ${targetWords}
Tone: ${params.tone}
Language: ${params.language}

Generate a new report on the new topic following the reference format. The report should be approximately ${targetWords} words total to fill ${params.pageCount} pages.`;

  return await callAI(prompt, DIFFERENT_TOPIC_SAME_FORMAT_PROMPT);
}
