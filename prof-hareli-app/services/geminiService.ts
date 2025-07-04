
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { LectureTopic, AnalysisResult, NewsEventAnalysis } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// This prompt now includes a structured failure case for the AI to use.
function buildSingleEventPrompt(topic: LectureTopic): string {

  return `
You are an expert social psychology assistant. Your task is to find ONE recent world news event (from the last 12 months) that can be clearly explained by principles from the following social psychology topic.

**Mandatory Requirement: You MUST use the provided search tool to find this event. Your final output is ONLY valid if it is grounded in a source from the search tool. If grounding fails, you MUST use the Failure Case JSON.**

Focus on a current event involving politics, social movements, international relations, or major societal trends. Do not use academic research papers or articles about psychology itself as the news event.

**Topic:** ${topic.title}
**Key Concepts:** ${topic.concepts}

**CRITICAL FORMATTING AND CONTENT INSTRUCTIONS:**

**1. Response Format:**
   - Your response MUST be a single, valid JSON object.
   - The object must have the following keys: "event_summary", "source_attribution", "source_title", "psychological_explanation".
   - Your final output must be ONLY the JSON object, with no other text, comments, or markdown formatting (like \`\`\`json) outside of it.

**2. Forbidden Phrases:**
    - Your response MUST NOT contain vague phrases like "Recent reports indicate...", "Sources say...", "An article described...", or similar.

**3. Content for each field:**
   - **source_attribution**: MUST contain ONLY the name of the primary news organization (e.g., "CNN", "Reuters", "The Associated Press").
   - **source_title**: The full title of the news article.
   - **event_summary**: A concise, one-paragraph summary of the specific news event. It should describe WHAT happened.
   - **psychological_explanation**: Your analysis of the event. Explain HOW the event is an example of the concepts from the provided topic.

**4. Failure Case:**
   - If you absolutely cannot find a suitable event that meets all criteria, you MUST return the following JSON object and nothing else:
   {
     "event_summary": "NOT_FOUND",
     "source_attribution": "NOT_FOUND",
     "source_title": "NOT_FOUND",
     "psychological_explanation": "NOT_FOUND"
   }
`;
}

// A helper to safely parse JSON that might be wrapped in markdown
function parseJsonFromText(text: string): NewsEventAnalysis {
  let jsonStr = text.trim();
  const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
  const match = jsonStr.match(fenceRegex);
  if (match && match[2]) {
    jsonStr = match[2].trim();
  }

  try {
    const parsed = JSON.parse(jsonStr);
    if ('event_summary' in parsed && 'source_attribution' in parsed && 'source_title' in parsed && 'psychological_explanation' in parsed) {
      return parsed;
    }
    throw new Error("Parsed JSON does not match the expected structure.");
  } catch (e) {
    console.error("Failed to parse JSON response:", e);
    throw new Error("The AI model returned a response that was not valid JSON. Please try again.");
  }
}

// Gets a single, complete analysis. This is now more resilient.
const getSingleAnalysis = async (topic: LectureTopic): Promise<NewsEventAnalysis> => {
  const prompt = buildSingleEventPrompt(topic);

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-04-17",
    contents: prompt,
    config: {
      systemInstruction: "You are a helpful assistant that ONLY responds with valid JSON objects based on the user's request. Do not add any conversational text or markdown.",
      tools: [{ googleSearch: {} }],
      temperature: 0.8,
    },
  });

  // 1. Parse the JSON from the model's text response first. This is our primary data.
  const analysisData = parseJsonFromText(response.text);

  // 2. Handle the structured failure case from the AI.
  if (analysisData.event_summary === "NOT_FOUND") {
    throw new Error("The AI model could not find a unique, suitable news event for this topic.");
  }
  
  // 3. Check if the AI returned valid data in the body. This is a critical check.
  if (!analysisData.source_title || analysisData.source_title.trim() === "" || analysisData.source_title === "NOT_FOUND") {
      throw new Error("The AI model failed to cite a specific news article title in its response.");
  }

  // 4. As an ENHANCEMENT, try to get the more reliable title from grounding metadata.
  const groundedSourceTitle = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.[0]?.web.title;
  
  // If we have a grounded title, use it because it's more reliable. Otherwise, trust the title from the AI's response body.
  if (groundedSourceTitle && groundedSourceTitle.trim() !== "") {
    analysisData.source_title = groundedSourceTitle;
  }
  
  return analysisData;
};


export const analyzeTopicInNews = async (topic: LectureTopic): Promise<AnalysisResult> => {
  const analysisPromises = [
    getSingleAnalysis(topic),
    getSingleAnalysis(topic),
    getSingleAnalysis(topic)
  ];

  const results = await Promise.allSettled(analysisPromises);

  const successfulAnalyses: NewsEventAnalysis[] = [];
  const errors: string[] = [];

  results.forEach(result => {
    if (result.status === 'fulfilled') {
      successfulAnalyses.push(result.value);
    } else {
      console.error("A single analysis request failed:", result.reason);
      if (result.reason instanceof Error) {
        errors.push(result.reason.message);
      } else {
        errors.push(String(result.reason));
      }
    }
  });
  
  // Filter out duplicates based on title to ensure variety
  const uniqueAnalyses = successfulAnalyses.filter((analysis, index, self) =>
    index === self.findIndex((t) => (
      t.source_title === analysis.source_title
    ))
  );

  // If we have no successful results at all, throw an error.
  if (uniqueAnalyses.length === 0) {
    const firstErrorMessage = errors[0] || "The AI model failed to generate any valid responses.";
    throw new Error(`Could not retrieve any valid analyses. The first error was: ${firstErrorMessage}`);
  }

  // Otherwise, return what we have, up to 3.
  return { analyses: uniqueAnalyses.slice(0, 3) };
};
