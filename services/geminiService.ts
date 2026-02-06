
import { GoogleGenAI, Type, Modality, GenerateContentResponse } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const consultHolisticDr = async (query: string) => {
  const ai = getAI();
  const prompt = `Act as an expert Holistic Physician and Functional Medicine specialist. 
  Analyze the following wellness query or symptoms: "${query}".
  
  Provide a comprehensive holistic wellness plan including:
  1. Potential Root Causes (from a functional medicine perspective).
  2. Natural Remedies & Medicines (Herbs, supplements, tinctures).
  3. Nutritional Guidance (Foods to embrace or avoid).
  4. Lifestyle & Somatic practices (Breathwork, specific yoga poses, circadian rhythm adjustments).
  
  IMPORTANT: You MUST use Google Search to find current clinical research on natural supplements and dosages.
  DISCLAIMER: Always start with a professional medical disclaimer stating this is for informational purposes only.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  return {
    text: response.text,
    sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  };
};

export const askGeminiChat = async (message: string, history: { role: 'user' | 'model', parts: { text: string }[] }[] = []) => {
  const ai = getAI();
  const chat = ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      thinkingConfig: { thinkingBudget: 32768 },
      systemInstruction: "You are an AI assistant for RTT (Rapid Transformational Therapy) practitioners. Provide expert advice on psychology, therapy techniques, and practice management. Use your deep reasoning capabilities for complex clinical questions.",
    }
  });
  
  const response = await chat.sendMessage({ message });
  return response.text;
};

export const researchTopic = async (topic: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Research the following topic in the context of psychological therapy and current events: ${topic}`,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  return {
    text: response.text,
    sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  };
};

export const analyzeVideoSession = async (videoBase64: string, mimeType: string, prompt: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: {
      parts: [
        { inlineData: { data: videoBase64, mimeType } },
        { text: prompt }
      ]
    },
    config: {
      thinkingConfig: { thinkingBudget: 32768 },
    }
  });
  return response.text;
};

export const generateReframes = async (limitingBeliefs: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `As an RTT (Rapid Transformational Therapy) expert, reframe the following limiting beliefs into powerful, commanding, and positive affirmations for a transformation script. 
    Focus on:
    1. Being present tense.
    2. Using emotional and vivid language.
    3. Addressing the root cause (not enough, not lovable, different).
    
    Limiting Beliefs: ${limitingBeliefs}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          reframes: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of 3-5 powerful positive reframes."
          }
        },
        required: ["reframes"]
      }
    }
  });

  try {
    return JSON.parse(response.text || '{"reframes": []}');
  } catch (e) {
    console.error("Failed to parse reframes", e);
    return { reframes: [] };
  }
};

export const generateHolisticReading = async (type: 'tarot' | 'astrology' | 'chakra' | 'body-code', context: string) => {
  const ai = getAI();
  const prompt = `Act as an expert Holistic RTT practitioner. Provide a deep, therapeutic reading for ${type} based on: ${context}.
  
  Specific rules:
  - If tarot: Provide exactly 3 cards representing Past, Present, and Future. Link each card's archetypal meaning to specific subconscious blocks or RTT regression themes.
  - If astrology: Identify current major planetary transits (e.g., Saturn Return, Mercury Retrograde, Pluto movements) and their impact on the client's emotional landscape.
  - If chakra: Analyze the 7 chakras. Identify which are overactive, underactive, or blocked and how this manifests as physical or emotional symptoms.
  - If body-code: Use The Body Code framework (Dr. Bradley Nelson style) to identify trapped emotions, toxicity, or structural imbalances that need release.
  
  Format the response as a JSON object with a title, a summary, and a list of components.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          type: { type: Type.STRING },
          summary: { type: Type.STRING },
          components: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING },
                name: { type: Type.STRING },
                meaning: { type: Type.STRING },
                suggestion: { type: Type.STRING }
              },
              required: ["label", "name", "meaning"]
            }
          }
        },
        required: ["title", "type", "summary", "components"]
      }
    }
  });

  try {
    return JSON.parse(response.text || '{}');
  } catch (e) {
    console.error("Failed to parse holistic reading", e);
    return null;
  }
};

export const generateFullScript = async (clientName: string, issue: string, reframes: string[]) => {
  const ai = getAI();
  const prompt = `Write a professional RTT (Rapid Transformational Therapy) style hypnosis script for ${clientName} addressing ${issue}. 
  Incorporate these specific reframes: ${reframes.join(", ")}.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      thinkingConfig: { thinkingBudget: 32768 },
      temperature: 0.8,
    }
  });

  return response.text;
};

export const textToSpeech = async (text: string, voiceName: 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr' = 'Kore') => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  return base64Audio;
};
