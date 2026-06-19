import { z } from "zod";

export const reportFormSchema = z.object({
  topic: z.string().min(3, "Topic must be at least 3 characters"),
  pageCount: z.number().int().min(1, "Minimum 1 page").max(50, "Maximum 50 pages"),
  language: z.enum(["English", "Hinglish", "Hindi"]),
  academicLevel: z.enum(["school", "diploma", "college", "university"]),
  tone: z.enum(["simple", "formal", "technical"]),
});

export const subtopicSchema = z.object({
  heading: z.string().min(1),
  description: z.string().optional(),
});

export const subtopicsSchema = z.object({
  title: z.string(),
  introductionHeading: z.string(),
  subtopics: z.array(subtopicSchema),
  conclusionHeading: z.string(),
  suggestedReferences: z.array(z.string()),
});

export type ReportFormData = z.infer<typeof reportFormSchema>;
export type SubtopicData = z.infer<typeof subtopicSchema>;
export type SubtopicsData = z.infer<typeof subtopicsSchema>;
