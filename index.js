// IMPORTANT: PASTE YOUR API KEY HERE
// You can get a key from https://aistudio.google.com/app/apikey
const API_KEY = "AIzaSyCKZvr53Qn1i4bUZDYByW6WaIhwOom0HCw";

// --- DO NOT EDIT BELOW THIS LINE ---

import React, { useState, useEffect, useCallback } from 'https://esm.sh/react@19.0.0-rc-f994737d14-20240522';
import ReactDOM from 'https://esm.sh/react-dom@19.0.0-rc-f994737d14-20240522/client';
import { GoogleGenAI } from 'https://esm.sh/@google/genai@0.14.2';

// --- Start of Constants ---
const LECTURE_TOPICS = [
  { id: 1, week: 1, title: "Introduction to Social Psychology", concepts: "Pluralistic ignorance, bystander effect, diffusion of responsibility, scientific method in psychology, the person as a social creature." },
  { id: 2, week: 2, title: "Social Perception & First Impressions", concepts: "First impressions, physical attractiveness, spontaneous trait inferences, non-verbal cues (deception cues), attribution theory." },
  { id: 3, week: 3, title: "Emotion & Social Cognition", concepts: "Role of emotion in social interaction, causal attribution for events and emotions, cognitive heuristics (availability, representativeness, anchoring), perception of social power." },
  { id: 4, week: 4, title: "Attitudes and Persuasion", concepts: "Cognitive, affective, and behavioral components of attitudes, persuasion, Elaboration Likelihood Model (Central vs. Peripheral routes), inoculation strategy." },
  { id: 5, week: 5, title: "The Social Self", concepts: "Self-concept, self-esteem (trait vs. state), self-schemas, introspection, affective forecasting, social comparison, spotlight effect, cultural differences in self-concept." },
  { id: 6, week: 6, title: "Stereotypes, Prejudice & Intergroup Relations", concepts: "In-groups vs. out-groups, stereotypes, prejudice, discrimination, Social Identity Theory, out-group homogeneity effect, stereotype threat, minimal group paradigm." },
  { id: 7, week: 7, weekLabel: "7 & 8", title: "Group Influence & Processes", concepts: "Conformity (normative and informational influence), Asch's experiment, obedience, group polarization, groupthink, social facilitation, social loafing, deindividuation." },
];

// --- Start of Icons ---
const SpinnerIcon = ({ className }) => React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: `animate-spin ${className}` }, React.createElement('path', { d: "M21 12a9 9 0 1 1-6.219-8.56" }));
const ErrorIcon = ({ className }) => React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className, width: "24", height: "24", viewBox: "0 0 24 24", strokeWidth: "2", stroke: "currentColor", fill: "none", strokeLinecap: "round", strokeLinejoin: "round" }, React.createElement('path', { stroke: "none", d: "M0 0h24v24H0z", fill: "none" }), React.createElement('path', { d: "M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" }), React.createElement('path', { d: "M12 9v4" }), React.createElement('path', { d: "M12 16v.01" }));
const PointerIcon = ({ className }) => React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className, width: "24", height: "24", viewBox: "0 0 24 24", strokeWidth: "2", stroke: "currentColor", fill: "none", strokeLinecap: "round", strokeLinejoin: "round" }, React.createElement('path', { stroke: "none", d: "M0 0h24v24H0z", fill: "none" }), React.createElement('path', { d: "M8 13v-8.5a1.5 1.5 0 0 1 3 0v7.5" }), React.createElement('path', { d: "M11 11.5v-2a1.5 1.5 0 0 1 3 0v2.5" }), React.createElement('path', { d: "M14 10.5a1.5 1.5 0 0 1 3 0v1.5" }), React.createElement('path', { d: "M17 11.5a1.5 1.5 0 0 1 3 0v4.5a6 6 0 0 1 -6 6h-2h.208a6 6 0 0 1 -5.012 -2.7l-.196 -.3c-.312 -.479 -1.407 -2.388 -3.286 -5.728a1.5 1.5 0 0 1 .536 -2.022a1.867 1.867 0 0 1 2.28 .28l1.47 1.47" }));
const RefreshIcon = ({ className }) => React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className, width: "24", height: "24", viewBox: "0 0 24 24", strokeWidth: "2", stroke: "currentColor", fill: "none", strokeLinecap: "round", strokeLinejoin: "round" }, React.createElement('path', { stroke: "none", d: "M0 0h24v24H0z", fill: "none" }), React.createElement('path', { d: "M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4" }), React.createElement('path', { d: "M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4" }));
const NewspaperIcon = ({ className }) => React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className, width: "24", height: "24", viewBox: "0 0 24 24", strokeWidth: "2", stroke: "currentColor", fill: "none", strokeLinecap: "round", strokeLinejoin: "round" }, React.createElement('path', { stroke: "none", d: "M0 0h24v24H0z", fill: "none" }), React.createElement('path', { d: "M16 6h3a1 1 0 0 1 1 1v11a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-11a1 1 0 0 1 1 -1h3" }), React.createElement('path', { d: "M16 3l-4 4l-4 -4" }), React.createElement('line', { x1: "12", y1: "12", x2: "12", y2: "16" }), React.createElement('line', { x1: "16", y1: "12", x2: "16", y2: "16" }), React.createElement('line', { x1: "8", y1: "12", x2: "8", y2: "16" }));
const LightbulbIcon = ({ className }) => React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className, width: "24", height: "24", viewBox: "0 0 24 24", strokeWidth: "2", stroke: "currentColor", fill: "none", strokeLinecap: "round", strokeLinejoin: "round" }, React.createElement('path', { stroke: "none", d: "M0 0h24v24H0z", fill: "none" }), React.createElement('path', { d: "M9 16a5 5 0 1 1 6 0a3.5 3.5 0 0 0 -1 3a2 2 0 0 1 -4 0a3.5 3.5 0 0 0 -1 -3" }), React.createElement('path', { d: "M9.7 17l4.6 0" }));
const ExternalLinkIcon = ({ className }) => React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className, width: "24", height: "24", viewBox: "0 0 24 24", strokeWidth: "2", stroke: "currentColor", fill: "none", strokeLinecap: "round", strokeLinejoin: "round" }, React.createElement('path', { stroke: "none", d: "M0 0h24v24H0z", fill: "none" }), React.createElement('path', { d: "M12 6h-6a2 2 0 0 0 -2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-6" }), React.createElement('path', { d: "M11 13l9 -9" }), React.createElement('path', { d: "M15 4h5v5" }));
const SparklesIcon = ({ className }) => React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className, viewBox: "0 0 24 24", fill: "currentColor" }, React.createElement('path', { d: "M12,2A3,3,0,0,0,9,5A3,3,0,0,0,12,8A3,3,0,0,0,15,5A3,3,0,0,0,12,2M5,9A3,3,0,0,0,2,12A3,3,0,0,0,5,15A3,3,0,0,0,8,12A3,3,0,0,0,5,9M19,9A3,3,0,0,0,16,12A3,3,0,0,0,19,15A3,3,0,0,0,22,12A3,3,0,0,0,19,9M12,16A3,3,0,0,0,9,19A3,3,0,0,0,12,22A3,3,0,0,0,15,19A3,3,0,0,0,12,16Z" }));
const ApprenticeAvatarIcon = ({ className }) => React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className, viewBox: "0 0 24 24", fill: "currentColor" }, React.createElement('path', { d: "M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" }), React.createElement('path', { d: "M12 5c-1.654 0-3 1.346-3 3s1.346 3 3 3 3-1.346 3-3-1.346-3-3-3zm0 4c-.551 0-1-.449-1-1s.449-1 1-1 1 .449 1 1-.449 1-1 1z" }), React.createElement('path', { d: "M12 13c-2.481 0-4.5 2.019-4.5 4.5V18h9v-.5c0-2.481-2.019-4.5-4.5-4.5zm0 3c.827 0 1.5.673 1.5 1.5V18h-3v-.5c0-.827.673-1.5 1.5-1.5z" }), React.createElement('circle', { cx: "16.5", cy: "12.5", r: "1.5" }), React.createElement('circle', { cx: "7.5", cy: "12.5", r: "1.5" }));

// --- Start of Gemini Service ---
let ai;
try {
    ai = new GoogleGenAI({ apiKey: API_KEY });
} catch (e) {
    console.error("Failed to initialize GoogleGenAI. Make sure API_KEY is set.", e);
}


function buildSingleEventPrompt(topic) {
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

function parseJsonFromText(text) {
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

const getSingleAnalysis = async (topic) => {
  if (!ai) {
    throw new Error("Gemini AI client is not initialized. Please ensure your API key is configured correctly.");
  }
  const prompt = buildSingleEventPrompt(topic);
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-04-17",
    contents: prompt,
    config: {
      systemInstruction: "You are a helpful assistant that ONLY responds with valid JSON objects based on the user's request. Do not add any conversational text or markdown.",
      tools: [{ googleSearch: {} }],
      temperature: 0.8,
    },
  });
  const analysisData = parseJsonFromText(response.text);
  if (analysisData.event_summary === "NOT_FOUND") {
    throw new Error("The AI model could not find a unique, suitable news event for this topic.");
  }

  const groundedSourceTitle = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.[0]?.web?.title;
  if (groundedSourceTitle && groundedSourceTitle.trim() !== "") {
    analysisData.source_title = groundedSourceTitle;
  }
  
  if (!analysisData.source_title || analysisData.source_title.trim() === "" || analysisData.source_title === "NOT_FOUND") {
      throw new Error("The AI model failed to cite a specific news article title in its response.");
  }
  return analysisData;
};

const analyzeTopicInNews = async (topic) => {
  const analysisPromises = [
    getSingleAnalysis(topic),
    getSingleAnalysis(topic),
    getSingleAnalysis(topic)
  ];
  const results = await Promise.allSettled(analysisPromises);
  const successfulAnalyses = [];
  const errors = [];
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
  const uniqueAnalyses = successfulAnalyses.filter((analysis, index, self) =>
    index === self.findIndex((t) => (
      t.source_title === analysis.source_title && t.source_title !== "NOT_FOUND"
    ))
  );
  if (uniqueAnalyses.length === 0) {
    const firstErrorMessage = errors[0] || "The AI model failed to generate any valid responses.";
    throw new Error(`Could not retrieve any valid analyses. The first error was: ${firstErrorMessage}`);
  }
  return { analyses: uniqueAnalyses.slice(0, 3) };
};

// --- Start of Components ---

const Introduction = () => {
  return React.createElement('div', { className: "mb-8 p-6 sm:p-8 bg-gradient-to-br from-purple-100 via-pink-100 to-orange-100 rounded-2xl shadow-lg border border-white/50" },
    React.createElement('div', { className: "flex flex-col md:flex-row md:items-center md:space-x-6" },
      React.createElement('div', null,
        React.createElement('h2', { className: "text-3xl font-bold text-slate-800 mb-2" }, "Welcome to Your Real World Apprentice!"),
        React.createElement('p', { className: "text-slate-600 mb-6 max-w-3xl" }, "This tool is designed to bring your social psychology studies to life by linking the concepts from Prof. Shlomo Hareli's lectures to real-world events and current issues.")
      )
    ),
    React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-slate-700" },
      React.createElement('div', { className: "bg-white/60 p-4 rounded-xl backdrop-blur-sm" },
        React.createElement('div', { className: "flex items-center mb-2" }, React.createElement(PointerIcon, { className: "h-6 w-6 text-purple-500 mr-3" }), React.createElement('h4', { className: "font-bold" }, "How to Use")),
        React.createElement('p', { className: "text-sm" }, "Simply click on a lecture topic from the list on the left to get started.")
      ),
      React.createElement('div', { className: "bg-white/60 p-4 rounded-xl backdrop-blur-sm" },
        React.createElement('div', { className: "flex items-center mb-2" }, React.createElement(RefreshIcon, { className: "h-6 w-6 text-pink-500 mr-3" }), React.createElement('h4', { className: "font-bold" }, "Always Fresh")),
        React.createElement('p', { className: "text-sm" }, "The news is always changing, so you'll get new, relevant examples each time you select a topic.")
      ),
      React.createElement('div', { className: "bg-white/60 p-4 rounded-xl backdrop-blur-sm" },
        React.createElement('div', { className: "flex items-center mb-2" }, React.createElement(NewspaperIcon, { className: "h-6 w-6 text-orange-500 mr-3" }), React.createElement('h4', { className: "font-bold" }, "Verified Sources")),
        React.createElement('p', { className: "text-sm" }, "Events are sourced from major global news outlets like Reuters, CNN, BBC, and more.")
      ),
      React.createElement('div', { className: "bg-white/60 p-4 rounded-xl backdrop-blur-sm" },
        React.createElement('div', { className: "flex items-center mb-2" }, React.createElement(LightbulbIcon, { className: "h-6 w-6 text-yellow-500 mr-3" }), React.createElement('h4', { className: "font-bold" }, "Enrich Your Learning")),
        React.createElement('p', { className: "text-sm" }, "Bridge the gap between academic theory and real life to make concepts tangible and memorable.")
      )
    )
  );
};

const LectureTopicList = ({ topics, selectedTopic, onSelectTopic, isLoading }) => {
  return React.createElement('nav', { className: "space-y-1", "aria-label": "Lecture Topics" },
    topics.map((topic) => {
      const isSelected = selectedTopic?.id === topic.id;
      return React.createElement('button',
        {
          key: topic.id,
          onClick: () => onSelectTopic(topic),
          disabled: isLoading,
          className: `w-full text-left flex items-start rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200 ease-in-out transform hover:scale-105 ${
            isSelected
              ? 'bg-orange-500 text-white shadow-lg'
              : 'text-slate-600 hover:bg-orange-100/80 hover:shadow-md'
          } ${isLoading ? 'cursor-not-allowed opacity-50' : ''}`
        },
        React.createElement('span', { className: `font-bold text-xs flex-shrink-0 flex items-center justify-center mr-3 ${isSelected ? 'text-orange-100' : 'text-orange-400'}` }, `Wk ${topic.weekLabel || topic.week}`),
        React.createElement('span', { className: "flex-grow" }, topic.title)
      );
    })
  );
};

const AnalysisDisplay = ({ selectedTopic, result, isLoading, error }) => {
  if (isLoading) {
    return React.createElement('div', { className: "flex flex-col items-center justify-center min-h-[50vh] bg-white/50 rounded-lg shadow-md p-8 text-center backdrop-blur-sm" },
      React.createElement(SpinnerIcon, { className: "h-12 w-12 text-orange-500" }),
      React.createElement('h3', { className: "mt-4 text-xl font-semibold text-slate-800" }, "Analyzing Recent Events..."),
      React.createElement('p', { className: "mt-1 text-slate-500" }, `Connecting Prof. Shlomo Hareli's lecture on "${selectedTopic?.title}" to current events...`)
    );
  }

  if (error) {
    return React.createElement('div', { className: "flex flex-col items-center justify-center min-h-[50vh] bg-red-50 rounded-lg shadow-md p-8 text-center" },
      React.createElement(ErrorIcon, { className: "h-12 w-12 text-red-500" }),
      React.createElement('h3', { className: "mt-4 text-xl font-semibold text-red-800" }, "Analysis Failed"),
      React.createElement('p', { className: "mt-1 text-red-600 max-w-lg" }, error)
    );
  }
  
  if (result && result.analyses.length > 0) {
    return React.createElement('div', { className: "space-y-8 animate-fade-in" },
      React.createElement('div', { className: "bg-white rounded-xl shadow-lg p-6 sm:p-8" },
        React.createElement('h2', { className: "text-3xl font-bold text-slate-900" }, "Analysis for: ", React.createElement('span', { className: "text-orange-600" }, selectedTopic?.title))
      ),
      result.analyses.map((analysis, index) => {
        const searchUrl = `https://www.google.com/search?tbm=nws&q=${encodeURIComponent(analysis.source_title || '')}`;
        return React.createElement('div', { key: index, className: "bg-white rounded-xl shadow-lg overflow-hidden" },
          React.createElement('div', { className: "p-6 sm:p-8" },
            React.createElement('span', { className: "inline-block bg-purple-100 text-purple-800 text-sm font-semibold px-4 py-1 rounded-full mb-5" }, `Event ${index + 1}`),
            React.createElement('div', { className: "mb-6" },
              React.createElement('h3', { className: "text-lg font-semibold text-slate-800 mb-2" }, "Source Information"),
              React.createElement('div', { className: "bg-slate-50 p-4 rounded-lg border border-slate-200" },
                React.createElement('p', { className: "text-sm text-slate-600" }, React.createElement('span', { className: "font-semibold text-slate-900" }, "Source: "), analysis.source_attribution),
                React.createElement('p', { className: "mt-2 text-sm text-slate-600" }, React.createElement('span', { className: "font-semibold text-slate-900" }, "Article Title: "), analysis.source_title),
                React.createElement('a', { href: searchUrl, target: "_blank", rel: "noopener noreferrer", className: "inline-flex items-center mt-4 text-sm font-semibold text-purple-600 hover:text-purple-800 transition-colors" },
                  "Find this article on Google News",
                  React.createElement(ExternalLinkIcon, { className: "h-4 w-4 ml-1.5" })
                )
              )
            ),
            React.createElement('div', { className: "mb-6" },
              React.createElement('h3', { className: "text-lg font-semibold text-slate-800 mb-2" }, "Event Summary"),
              React.createElement('p', { className: "text-slate-600 leading-relaxed" }, analysis.event_summary)
            ),
            React.createElement('div', null,
              React.createElement('h3', { className: "text-lg font-semibold text-slate-800 mb-2" }, "Psychological Explanation"),
              React.createElement('p', { className: "text-slate-600 leading-relaxed" }, analysis.psychological_explanation)
            )
          )
        );
      })
    );
  }

  return React.createElement('div', { className: "flex flex-col items-center justify-center min-h-[50vh] bg-white/50 rounded-lg shadow-md p-8 text-center backdrop-blur-sm" },
    React.createElement(ApprenticeAvatarIcon, { className: "h-24 w-24 text-purple-400" }),
    React.createElement('h3', { className: "mt-4 text-2xl font-bold text-slate-800" }, "Real World Apprentice"),
    React.createElement('p', { className: "mt-2 text-slate-500 max-w-md" }, "Please select a lecture topic from the list to begin the analysis. The AI will find and explain three relevant world news events.")
  );
};

const App = () => {
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSelectTopic = useCallback((topic) => {
    if (isLoading) return;
    setSelectedTopic(topic);
    setAnalysisResult(null);
    setError(null);
  }, [isLoading]);
  
  useEffect(() => {
    if (!selectedTopic) return;
    const getAnalysis = async () => {
      setIsLoading(true);
      setError(null);
      if (!API_KEY || API_KEY === "YOUR_API_KEY_HERE") {
          setError("API Key is not configured. Please add your API key to the top of index.js.");
          setIsLoading(false);
          return;
      }
      try {
        const result = await analyzeTopicInNews(selectedTopic);
        setAnalysisResult(result);
      } catch (e) {
        if (e instanceof Error) {
          setError(`Failed to get analysis. ${e.message}. Please ensure your API key is configured correctly.`);
        } else {
          setError("An unknown error occurred.");
        }
      } finally {
        setIsLoading(false);
      }
    };
    getAnalysis();
  }, [selectedTopic]);

  return React.createElement('div', { className: "min-h-screen bg-purple-50 text-slate-800" },
    React.createElement('header', { className: "bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 shadow-lg sticky top-0 z-20" },
      React.createElement('div', { className: "container mx-auto px-4 sm:px-6 lg:px-8" },
        React.createElement('div', { className: "flex items-center justify-between h-20" },
          React.createElement('div', { className: "flex items-center space-x-4" },
            React.createElement(ApprenticeAvatarIcon, { className: "h-12 w-12 text-white" }),
            React.createElement('div', null,
              React.createElement('h1', { className: "text-2xl font-bold text-white tracking-tight" }, "Prof. Hareli's"),
              React.createElement('p', { className: "text-sm text-purple-100 font-light" }, "Real World Apprentice")
            )
          ),
          React.createElement('a', { href: "https://gemini.google.com", target: "_blank", rel: "noopener noreferrer", className: "flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors" },
            React.createElement(SparklesIcon, { className: "h-5 w-5 text-yellow-300" }),
            React.createElement('span', { className: "font-semibold text-sm text-white" }, "Powered by Gemini")
          )
        )
      )
    ),
    React.createElement('main', { className: "container mx-auto p-4 sm:p-6 lg:p-8" },
      React.createElement(Introduction, null),
      React.createElement('div', { className: "lg:grid lg:grid-cols-12 lg:gap-12" },
        React.createElement('div', { className: "lg:col-span-4 xl:col-span-3 mb-8 lg:mb-0" },
          React.createElement('div', { className: "sticky top-28" },
            React.createElement('h2', { className: "text-xl font-bold text-slate-900 mb-4 px-3" }, "Lecture Topics"),
            React.createElement(LectureTopicList, {
              topics: LECTURE_TOPICS,
              selectedTopic: selectedTopic,
              onSelectTopic: handleSelectTopic,
              isLoading: isLoading
            })
          )
        ),
        React.createElement('div', { className: "lg:col-span-8 xl:col-span-9" },
          React.createElement(AnalysisDisplay, {
            selectedTopic: selectedTopic,
            result: analysisResult,
            isLoading: isLoading,
            error: error
          })
        )
      )
    )
  );
};


// --- Start of Entry Point ---
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}
const root = ReactDOM.createRoot(rootElement);
root.render(
  React.createElement(React.StrictMode, null, 
    React.createElement(App, null)
  )
);
