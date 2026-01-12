import { Handler } from '@netlify/functions';
import { GoogleGenerativeAI } from '@google/genai';

const handler: Handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const apiKey = process.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('VITE_GEMINI_API_KEY is not configured');
    }

    // Parse the request body
    const body = JSON.parse(event.body || '{}');
    const { topic } = body;

    if (!topic) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Topic is required' })
      };
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash-latest"
    });

    const prompt = `You are an expert in social psychology and a teaching assistant for Prof. Hareli's class.

Find 3 recent news events (from the past month) that demonstrate the following lecture topic:

**Week ${topic.week}: ${topic.title}**
Key concepts: ${topic.concepts}

For each event, provide:
1. A brief summary of what happened (2-3 sentences)
2. The name of the news source (e.g., "CNN", "BBC", "Reuters")
3. The title of the article
4. The URL to the article (if available)
5. An explanation of how this event illustrates the psychological concepts from the lecture (3-4 sentences)

Return your response as a JSON array with this exact structure:
{
  "analyses": [
    {
      "event_summary": "Brief description of the event",
      "source_attribution": "News Source Name",
      "source_title": "Article Title",
      "source_uri": "https://...",
      "psychological_explanation": "How this relates to the lecture concepts"
    }
  ]
}

Make sure the psychological explanations are clear and educational, connecting specific concepts from the lecture to the news event.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    // Try to parse the JSON response
    const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    let parsedResult;
    try {
      parsedResult = JSON.parse(cleanedText);
    } catch (parseError) {
      // If JSON parsing fails, try to extract JSON from the text
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not parse the response as JSON');
      }
    }
    
    // Validate the structure
    if (!parsedResult.analyses || !Array.isArray(parsedResult.analyses)) {
      throw new Error('Invalid response structure: missing analyses array');
    }
    
    // Validate each analysis
    const validAnalyses = parsedResult.analyses.filter((analysis: any) => {
      return analysis.event_summary && 
             analysis.source_attribution && 
             analysis.source_title && 
             analysis.psychological_explanation;
    });
    
    if (validAnalyses.length === 0) {
      throw new Error('Could not retrieve any valid analyses');
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ analyses: validAnalyses })
    };

  } catch (error) {
    console.error('Gemini API Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      })
    };
  }
};

export { handler };
