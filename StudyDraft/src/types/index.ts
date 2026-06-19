export interface SubtopicData {
  heading: string;
  description?: string;
}

export interface GeneratedSubtopics {
  title: string;
  introductionHeading: string;
  subtopics: SubtopicData[];
  conclusionHeading: string;
  suggestedReferences: string[];
}

export interface DetectedStructure {
  detectedTopic: string;
  titleStyle: string;
  headingStructure: string;
  sectionOrder: string[];
  paragraphStyle: string;
  formattingNotes: string;
  referenceStyle: string;
  suggestedReusableFormat: string;
}

export interface ReportFormData {
  topic: string;
  pageCount: number;
  language: "English" | "Hinglish" | "Hindi";
  academicLevel: "school" | "diploma" | "college" | "university";
  tone: "simple" | "formal" | "technical";
}

export interface ReportSectionData {
  id?: string;
  heading: string;
  content: string;
  order: number;
}

export interface ReportData {
  id: string;
  title: string;
  topic: string;
  content: string;
  reportType: string;
  language: string;
  tone: string;
  academicLevel: string;
  length: string;
  pageCount: number;
  status: string;
  createdAt: Date;
  sections?: ReportSectionData[];
}
