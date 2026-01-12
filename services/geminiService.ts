import { LectureTopic, AnalysisResult } from '../types';

export async function analyzeTopicInNews(topic: LectureTopic): Promise<AnalysisResult> {
  try {
    // Call the Netlify function instead of making direct API call
    const response = await fetch('/.netlify/functions/analyze-topic', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ topic }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
    
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Could not retrieve any valid analyses. The first error was: ${error.message}`);
    }
    throw error;
  }
}
