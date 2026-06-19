import { describe, it, expect } from "vitest";
import { reportFormSchema, subtopicsSchema } from "../src/lib/validations/report";

describe("Report Creation", () => {
  it("should validate report form - valid input", () => {
    const result = reportFormSchema.safeParse({
      topic: "Climate Change",
      length: "medium",
      language: "English",
      academicLevel: "college",
      tone: "formal",
    });
    expect(result.success).toBe(true);
  });

  it("should validate report form - short topic", () => {
    const result = reportFormSchema.safeParse({
      topic: "AB",
      length: "medium",
      language: "English",
      academicLevel: "college",
      tone: "formal",
    });
    expect(result.success).toBe(false);
  });

  it("should validate report form - invalid length", () => {
    const result = reportFormSchema.safeParse({
      topic: "Climate Change",
      length: "verylong",
      language: "English",
      academicLevel: "college",
      tone: "formal",
    });
    expect(result.success).toBe(false);
  });

  it("should validate subtopics schema - valid", () => {
    const result = subtopicsSchema.safeParse({
      title: "Test Report",
      introductionHeading: "1. Introduction",
      subtopics: [
        { heading: "2. Background", description: "Background info" },
        { heading: "3. Analysis" },
      ],
      conclusionHeading: "Conclusion",
      suggestedReferences: ["Ref 1", "Ref 2"],
    });
    expect(result.success).toBe(true);
  });

  it("should validate subtopics schema - missing title", () => {
    const result = subtopicsSchema.safeParse({
      introductionHeading: "1. Introduction",
      subtopics: [{ heading: "2. Background" }],
      conclusionHeading: "Conclusion",
      suggestedReferences: [],
    });
    expect(result.success).toBe(false);
  });

  it("should parse markdown sections correctly", () => {
    const markdown = `# Test Report\n\n## 1. Introduction\n\nIntro content.\n\n## 2. Main Body\n\nBody content.\n\n## Conclusion\n\nConclusion content.\n\n## References\n\nRef 1\n\nSuggested References: Please review and verify facts before submission.`;
    
    const sections = markdown.split(/^## /m).filter(Boolean);
    expect(sections.length).toBeGreaterThanOrEqual(4);
    
    const titleLine = sections[0]?.split('\n')[0];
    expect(titleLine?.trim()).toBe("# Test Report");
    
    const headingMatch = titleLine?.match(/^# (.+)/);
    expect(headingMatch?.[1]?.trim()).toBe("Test Report");
  });
});
