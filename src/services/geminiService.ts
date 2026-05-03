import { GoogleGenAI, Type } from "@google/genai";

let genAI: GoogleGenAI | null = null;

function getAI() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    genAI = new GoogleGenAI({ apiKey });
  }
  return genAI;
}

export interface LyricsResult {
  title: string;
  artist: string;
  lyrics: string;
  album?: string;
  year?: string;
  fontSize?: number;
}

export async function processLyrics(
  title: string, 
  artist: string, 
  lyricsText?: string, 
  imageInlineData?: { mimeType: string, data: string },
  album?: string,
  year?: string
): Promise<LyricsResult | null> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not defined in the environment.");
    }

    const prompt = `You are a lyrics sheet expert. Extract and format the song lyrics VERBATIM.
    
    Metadata: Title: "${title}", Artist: "${artist}"${album ? `, Album: "${album}"` : ''}${year ? `, Year: "${year}"` : ''}.
    Input Text: "${lyricsText || "Extract from image"}"

    Rules:
    1. OCR accuracy is priority if an image is provided.
    2. Maintain verbatim lyrics and stanza breaks.
    3. Return Title, Artist, Album, and Year in JSON.
    4. CRITICAL: If metadata fields (Title, Artist, Album, Year) are provided in the prompt, use those EXACT values in your response. Do not correct, "fix", or change them.
    5. DO NOT generate an Album title or Release Year if they are not provided in the Metadata section above. If they are missing, leave them empty in the JSON.
    
    Note: If Title or Artist are missing/incomplete, use your internal knowledge to fill them. But NEVER guess the Album or Year.`;

    const parts: any[] = [{ text: prompt }];
    if (imageInlineData) {
      parts.push({ inlineData: imageInlineData });
    }

    const ai = getAI();
    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: "user", parts }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            artist: { type: Type.STRING },
            lyrics: { type: Type.STRING },
            album: { type: Type.STRING },
            year: { type: Type.STRING },
          },
          required: ["title", "artist", "lyrics"],
        },
      },
    });

    const text = result.text;
    if (!text) return null;
    
    const parsed = JSON.parse(text) as LyricsResult;

    // Guaranteed adherence: Use user input if provided, otherwise use AI suggestions for Title/Artist
    // For Album and Year, strictly use user input or keep empty.
    return {
      ...parsed,
      title: title.trim() || parsed.title,
      artist: artist.trim() || parsed.artist,
      album: album?.trim() || "",
      year: year?.trim() || "",
    };
  } catch (error: any) {
    console.error("Gemini processing error:", error);
    return null;
  }
}
