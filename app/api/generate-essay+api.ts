import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

export async function POST(request: Request) {
  try {
    const { subject, readingLevel } = await request.json();

    if (!subject || !readingLevel) {
      return Response.json({ error: 'Subject and reading level are required' }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey) {
      console.error("Gemini API key is not configured on the server.");
      // Do not expose detailed error messages about API keys to the client in production.
      return Response.json({ error: 'Internal server error. Please contact support if this issue persists.' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest", // Using flash for speed and cost-effectiveness
    });

    const generationConfig = {
      temperature: 0.8, // A bit more creative
      topK: 32,
      topP: 0.9,
      maxOutputTokens: 600, // Roughly 400-500 words
    };

    // Safety settings to reduce chances of harmful content
    const safetySettings = [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    ];
    
    const prompt = `
      You are an expert educator and concise writer. Generate a 250-400 word mini-essay
      on the topic of '${subject}' suitable for a '${readingLevel}' audience.
      The essay should be engaging, informative, and written as if it's a highlight or a key insight
      from a fascinating (but fictional, if necessary) book or article on the subject.
      Do not explicitly state "This essay is from..." or "In this essay...".
      The tone should be insightful yet accessible.
      Ensure the language, depth of concepts, and vocabulary are appropriate for the specified reading level.
      For example:
      - 'Curious Child (5-8 years)': Very simple language, short sentences, concrete examples.
      - 'Middle Schooler (11-13 years)': Simple vocabulary, clear explanations, relatable analogies.
      - 'High Schooler (14-17 years)': More complex sentences, introduction to specific terminology, slightly more abstract concepts.
      - 'University Student': Academic tone, use of domain-specific vocabulary, complex ideas and theories discussed.
      - 'Seasoned Expert': Nuanced, in-depth, assumes prior knowledge, uses precise terminology.
      
      The essay should spark curiosity and provide one or two key ideas or insights clearly.
      Format the essay with clear paragraphs. Do not include any titles or headings within the essay itself.
      Avoid any conversational filler like "Let's dive in" or "In conclusion".
      Focus on delivering the core information in an engaging, educational, and compact way.
    `;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig,
      safetySettings,
    });
    
    if (result.response.promptFeedback?.blockReason) {
        console.warn('Prompt was blocked:', result.response.promptFeedback.blockReason);
        console.warn('Safety Ratings:', result.response.promptFeedback.safetyRatings);
        return Response.json({ error: `Content generation blocked due to: ${result.response.promptFeedback.blockReason}. Please try a different topic or phrasing.` }, { status: 400 });
    }
    
    const text = result.response.text();
    return Response.json({ essay: text });

  } catch (error: any) {
    console.error('Error in /api/generate-essay: ', error);
    // Check if it's a Gemini API-specific error and customize message if needed
    let errorMessage = 'Failed to generate essay. Please try again later.';
    if (error.message) {
        // Avoid exposing raw internal error messages directly if they might contain sensitive info.
        // For common issues like quota, you might provide a more specific user-facing message.
         if (error.message.includes("quota")) {
            errorMessage = "Essay generation quota reached for now. Please try again later.";
         } else if (error.message.includes("API key not valid")) {
             errorMessage = "Server configuration error. Please contact support.";
         }
    }
    return Response.json({ error: errorMessage }, { status: 500 });
  }
} 