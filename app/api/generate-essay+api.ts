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
      maxOutputTokens: 4000, // Significantly increased for longer, more comprehensive essays
    };

    // Safety settings to reduce chances of harmful content
    const safetySettings = [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    ];
    
    // Enhanced variety elements for maximum diversity
    const randomElements = [
      'philosophical', 'scientific', 'historical', 'psychological', 'sociological', 'cultural', 'artistic', 'technological', 'economic', 'political', 'anthropological', 'ecological', 'mathematical', 'linguistic', 'neurological'
    ];
    const randomPerspectives = [
      'contrarian', 'traditional', 'modern', 'futuristic', 'cross-cultural', 'interdisciplinary', 'practical', 'theoretical', 'revolutionary', 'evolutionary', 'minimalist', 'maximalist', 'holistic', 'reductionist', 'phenomenological'
    ];
    const randomCultures = [
      'Eastern', 'Western', 'Indigenous', 'Nordic', 'Mediterranean', 'African', 'Latin American', 'Asian', 'Middle Eastern', 'Polynesian', 'Celtic', 'Slavic', 'Germanic', 'Semitic', 'Austronesian'
    ];
    const randomTimePeriods = [
      'ancient', 'medieval', 'renaissance', 'industrial', 'modern', 'postmodern', 'contemporary', 'futuristic', 'prehistoric', 'colonial', 'enlightenment', 'romantic', 'victorian', 'atomic age', 'information age'
    ];
    const randomDisciplines = [
      'neuroscience', 'anthropology', 'physics', 'biology', 'linguistics', 'mathematics', 'astronomy', 'geology', 'chemistry', 'ecology', 'quantum mechanics', 'behavioral economics', 'cognitive science', 'systems theory', 'complexity science'
    ];
    const randomConcepts = [
      'emergence', 'paradox', 'duality', 'synthesis', 'transformation', 'resonance', 'equilibrium', 'chaos', 'symmetry', 'adaptation', 'recursion', 'fractals', 'networks', 'feedback loops', 'phase transitions'
    ];
    const writingStyles = [
      'narrative storytelling', 'socratic questioning', 'comparative analysis', 'case study exploration', 'thought experiment', 'historical journey', 'metaphorical explanation', 'dialectical argument', 'scientific investigation', 'philosophical meditation', 'journalistic inquiry', 'poetic reflection', 'dramatic exposition', 'analytical deconstruction', 'synthetic reconstruction'
    ];
    const engagementTechniques = [
      'provocative questions', 'surprising contradictions', 'vivid analogies', 'concrete examples', 'personal anecdotes', 'historical parallels', 'scientific experiments', 'thought puzzles', 'paradoxical situations', 'counterintuitive insights', 'mind-bending connections', 'emotional resonance', 'intellectual challenges', 'practical applications', 'future implications'
    ];
    const structuralApproaches = [
      'chronological progression', 'problem-solution format', 'cause-effect analysis', 'compare-contrast structure', 'thesis-antithesis-synthesis', 'layered complexity building', 'multiple perspectives weaving', 'zoom in-zoom out technique', 'spiral deepening', 'fragmented mosaic', 'detective investigation', 'journey discovery', 'debate format', 'Q&A exploration', 'myth-reality revelation'
    ];
    
    const randomApproach = randomElements[Math.floor(Math.random() * randomElements.length)];
    const randomPerspective = randomPerspectives[Math.floor(Math.random() * randomPerspectives.length)];
    const randomCulture = randomCultures[Math.floor(Math.random() * randomCultures.length)];
    const randomTimePeriod = randomTimePeriods[Math.floor(Math.random() * randomTimePeriods.length)];
    const randomDiscipline = randomDisciplines[Math.floor(Math.random() * randomDisciplines.length)];
    const randomConcept = randomConcepts[Math.floor(Math.random() * randomConcepts.length)];
    const randomWritingStyle = writingStyles[Math.floor(Math.random() * writingStyles.length)];
    const randomEngagement = engagementTechniques[Math.floor(Math.random() * engagementTechniques.length)];
    const randomStructure = structuralApproaches[Math.floor(Math.random() * structuralApproaches.length)];
    const timestamp = Date.now();
    const randomSeed = Math.floor(Math.random() * 1000000);
    
    const prompt = `
      You are a masterful educator and captivating writer. Your response MUST strictly follow this format:
      1. Start directly with a compelling essay title, bolded with Markdown, that includes a book and author reference inspired by the topic '${subject}'. Format: "**Title: Insight from \\"Book Title by Author Name\\"**\\n\\n"
      2. Then, write a comprehensive, engaging essay (800-1200+ words) on '${subject}' for a '${readingLevel}' audience. The essay should be a deep exploration inspired by the referenced book, designed to hook readers and keep them learning throughout.

      ESSAY LENGTH & DEPTH REQUIREMENTS:
      - MINIMUM 800 words, OPTIMAL 1000-1200+ words
      - Create a substantial, immersive reading experience
      - Develop ideas thoroughly with multiple supporting examples
      - Include rich details, explanations, and explorations
      - Build complexity gradually to maintain engagement
      
      WRITING STYLE & ENGAGEMENT MANDATE:
      - Use ${randomWritingStyle} as your primary writing approach
      - Employ ${randomEngagement} to captivate and maintain interest
      - Structure using ${randomStructure} for compelling flow
      - Hook readers from the first sentence and maintain momentum
      - Include surprising revelations, fascinating details, and thought-provoking insights
      - Use varied sentence structures: short punchy statements, flowing complex sentences, rhythmic patterns
      - Incorporate sensory details, vivid imagery, and concrete examples
      - Ask rhetorical questions to engage reader thinking
      - Build suspense and curiosity throughout
      - Include "aha moments" and mind-expanding connections
      
      READING LEVEL ADAPTATION:
        - 'Curious Child (5-8 years)': Simple language with exciting discoveries, fun facts, colorful descriptions, story-like flow
        - 'Middle Schooler (11-13 years)': Clear explanations with amazing examples, relatable situations, building complexity
        - 'High Schooler (14-17 years)': Sophisticated ideas made accessible, real-world applications, challenging concepts
        - 'University Student': Academic depth with engaging presentation, complex theories, critical analysis
        - 'Seasoned Expert': Nuanced exploration, cutting-edge insights, intellectual sophistication, professional depth
      
      MAXIMUM DIVERSITY & UNIQUENESS REQUIREMENTS:
      - Take a ${randomApproach} approach with a ${randomPerspective} perspective
      - Incorporate ${randomCulture} cultural insights from a ${randomTimePeriod} context
      - Cross-reference with ${randomDiscipline} and explore the concept of ${randomConcept}
      - Reference a COMPLETELY DIFFERENT and UNIQUE book/author combination - NEVER repeat previous books
      - Explore a DIFFERENT angle of '${subject}' - find unexpected, unusual, or lesser-known aspects
      - Use a DIFFERENT ideological framework, theory, or school of thought each time
      - Present ORIGINAL insights that challenge conventional thinking
      - Avoid ANY mainstream, obvious, or typical interpretations
      - Session: ${timestamp}-${randomSeed} (uniqueness enforcer)
      
      CAPTIVATING CONTENT REQUIREMENTS:
      - Start with a hook that immediately grabs attention
      - Include surprising facts, counterintuitive insights, or fascinating contradictions
      - Weave in stories, examples, or case studies that illustrate key points
      - Build tension and resolution throughout the narrative
      - Connect abstract concepts to concrete, relatable experiences
      - Include moments of wonder, discovery, and intellectual excitement
      - End with thought-provoking implications or questions for further exploration
      - Make every paragraph contribute to building understanding and maintaining interest
      
      ANTI-REPETITION MANDATE: You have written thousands of essays - this one must be completely unique. Use different vocabulary, explore different angles, reference different sources, present fresh perspectives, employ different rhetorical devices. RADICAL ORIGINALITY AND CAPTIVATING ENGAGEMENT REQUIRED.
      
      Create an essay that readers will want to finish, learn from, and remember. Make it an intellectual adventure that educates while entertaining.
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