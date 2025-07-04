export interface LectureTopic {
  id: number;
  week: number;
  weekLabel?: string;
  title: string;
  concepts: string;
}

// Represents a single analyzed news event with all source info included.
export interface NewsEventAnalysis {
  event_summary: string;
  source_attribution: string; // The name of the news source, e.g., "CNN", "Reuters"
  source_title: string; // The title of the source article
  psychological_explanation: string;
}

// The overall result from the service, containing multiple events
export interface AnalysisResult {
  analyses: NewsEventAnalysis[];
}