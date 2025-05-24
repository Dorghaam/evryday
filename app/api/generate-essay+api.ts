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
      temperature: 1.5, // Maximum creativity and randomness
      topK: 100, // Even more diverse token selection
      topP: 0.98, // Maximum randomness in sampling
      maxOutputTokens: 2000, // Increased to accommodate intro line, title, and essay body
    };

    // Safety settings to reduce chances of harmful content
    const safetySettings = [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    ];
    
    // Add multiple layers of randomness to ensure maximum variety
    const randomElements = [
      'philosophical', 'scientific', 'historical', 'psychological', 'sociological', 'cultural', 'artistic', 'technological', 'economic', 'political'
    ];
    const randomPerspectives = [
      'contrarian', 'traditional', 'modern', 'futuristic', 'cross-cultural', 'interdisciplinary', 'practical', 'theoretical', 'revolutionary', 'evolutionary'
    ];
    const randomCultures = [
      'Eastern', 'Western', 'Indigenous', 'Nordic', 'Mediterranean', 'African', 'Latin American', 'Asian', 'Middle Eastern', 'Polynesian'
    ];
    const randomTimePeriods = [
      'ancient', 'medieval', 'renaissance', 'industrial', 'modern', 'postmodern', 'contemporary', 'futuristic', 'prehistoric', 'colonial'
    ];
    const randomDisciplines = [
      'neuroscience', 'anthropology', 'physics', 'biology', 'linguistics', 'mathematics', 'astronomy', 'geology', 'chemistry', 'ecology'
    ];
    const randomConcepts = [
      'emergence', 'paradox', 'duality', 'synthesis', 'transformation', 'resonance', 'equilibrium', 'chaos', 'symmetry', 'adaptation'
    ];
    
    const randomApproach = randomElements[Math.floor(Math.random() * randomElements.length)];
    const randomPerspective = randomPerspectives[Math.floor(Math.random() * randomPerspectives.length)];
    const randomCulture = randomCultures[Math.floor(Math.random() * randomCultures.length)];
    const randomTimePeriod = randomTimePeriods[Math.floor(Math.random() * randomTimePeriods.length)];
    const randomDiscipline = randomDisciplines[Math.floor(Math.random() * randomDisciplines.length)];
    const randomConcept = randomConcepts[Math.floor(Math.random() * randomConcepts.length)];
    const timestamp = Date.now();
    const randomSeed = Math.floor(Math.random() * 1000000);
    
    const prompt = `
      You are an expert educator and concise writer. Your response MUST strictly follow this format:
      1. Start directly with a compelling essay title, bolded with Markdown, that includes a book and author reference inspired by the topic '${subject}'. Format: "**Title: Insight from \\"Book Title by Author Name\\"**\\n\\n"
      2. Then, write the body of the mini-essay (250-400 words) on '${subject}' for a '${readingLevel}' audience. The essay should be a key insight from the referenced book, engaging, and informative. Use clear paragraphs separated by single newlines. Do NOT repeat the book reference or introductory phrases within the essay body itself. Maintain an insightful yet accessible tone. Ensure language and concepts fit the reading level:
        - 'Curious Child (5-8 years)': Very simple language, short sentences, concrete examples.
        - 'Middle Schooler (11-13 years)': Simple vocabulary, clear explanations, relatable analogies.
        - 'High Schooler (14-17 years)': More complex sentences, introduction to specific terminology, slightly more abstract concepts.
        - 'University Student': Academic tone, use of domain-specific vocabulary, complex ideas and theories discussed.
        - 'Seasoned Expert': Nuanced, in-depth, assumes prior knowledge, uses precise terminology.
      
      MAXIMUM DIVERSITY REQUIREMENTS - MUST BE COMPLETELY DIFFERENT EVERY TIME:
      - Take a ${randomApproach} approach with a ${randomPerspective} perspective
      - Incorporate ${randomCulture} cultural insights from a ${randomTimePeriod} context
      - Cross-reference with ${randomDiscipline} and explore the concept of ${randomConcept}
      - Reference a COMPLETELY DIFFERENT and UNIQUE book/author combination - NEVER repeat any previous books
      - Explore a DIFFERENT angle of '${subject}' - find an unexpected, unusual, or lesser-known aspect
      - Use a DIFFERENT ideological framework, theory, or school of thought each time
      - Present ORIGINAL insights that challenge conventional thinking
      - Avoid ANY mainstream, obvious, or typical interpretations
      - Session: ${timestamp}-${randomSeed} (uniqueness enforcer)
      
      ANTI-REPETITION MANDATE: Imagine you've already written 100 essays on this topic - now write something completely different that explores an entirely new dimension, uses different vocabulary, references different sources, and presents fresh perspectives. MAXIMUM ORIGINALITY REQUIRED.
      
      Avoid conversational fillers. The entire output must be a single string starting directly with the bolded title. ENSURE RADICAL DIVERSITY AND COMPLETE UNIQUENESS.
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