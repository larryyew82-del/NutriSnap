import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { FoodAnalysis, HealthRiskAssessment, NutritionalInfo, GroundingSource } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeFoodImage = async (base64Image: string, mimeType: string, correctedFoodName?: string): Promise<FoodAnalysis> => {
  const jsonStructure = `{
  "foodName": "string",
  "estimatedWeight": "number (grams)",
  "calories": "number",
  "protein": "number (grams)",
  "carbohydrates": {
    "total": "number (grams)",
    "sugar": "number (grams)"
  },
  "fat": {
    "total": "number (grams)",
    "saturated": "number (grams)"
  },
  "sodium": "number (milligrams)",
  "cholesterol": "number (milligrams)"
}`;

  const basePrompt = `You are a nutritional expert. Ground your response using Google Search for accuracy. Respond ONLY with a valid JSON object. Do not include any other text or markdown formatting. The JSON object must have the following structure:\n${jsonStructure}`;

  const analysisInstruction = correctedFoodName
    ? `The user has specified that the food in the image is "${correctedFoodName}". This name might be in a local language; do your best to identify it. Please analyze the image based on this identification. Estimate the portion size's weight in grams and provide a detailed nutritional analysis for "${correctedFoodName}". The "foodName" in your response should be "${correctedFoodName}".`
    : `Analyze the food in this image. Identify the food item(s), estimate its weight in grams, and provide a detailed nutritional analysis for that portion size.`;
    
  const prompt = `${analysisInstruction}\n${basePrompt}`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { 
            text: prompt
          },
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
        ],
      },
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("Received an empty response from the AI.");
    }
    let jsonText = text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.slice(7, -3);
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.slice(3, -3);
    }

    const nutritionalInfo = JSON.parse(jsonText) as NutritionalInfo;
    
    // Fix: Filter and map grounding chunks to match the GroundingSource type.
    // The API may return grounding chunks where `web.uri` or `web.title` is missing,
    // but our internal `GroundingSource` type requires them. This ensures type safety.
    const sources: GroundingSource[] = (response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [])
      .filter(chunk => chunk.web?.uri && chunk.web?.title)
      .map(chunk => ({
        web: {
          uri: chunk.web!.uri!,
          title: chunk.web!.title!,
        },
      }));

    return { nutritionalInfo, sources };
  } catch (error) {
    console.error("Error analyzing food image:", error);
    throw new Error("Failed to analyze food image. Please try again with a clearer image.");
  }
};


const healthRiskSchema = {
    type: Type.OBJECT,
    properties: {
        diabetes: {
            type: Type.OBJECT,
            properties: {
                score: { type: Type.NUMBER, description: "Risk score from 1 (low) to 10 (high) for diabetes." },
                reasoning: { type: Type.STRING, description: "Brief explanation for the diabetes risk score." }
            },
            required: ['score', 'reasoning']
        },
        hypertension: {
            type: Type.OBJECT,
            properties: {
                score: { type: Type.NUMBER, description: "Risk score from 1 (low) to 10 (high) for hypertension." },
                reasoning: { type: Type.STRING, description: "Brief explanation for the hypertension risk score." }
            },
            required: ['score', 'reasoning']
        },
        cholesterol: {
            type: Type.OBJECT,
            properties: {
                score: { type: Type.NUMBER, description: "Risk score from 1 (low) to 10 (high) for high cholesterol." },
                reasoning: { type: Type.STRING, description: "Brief explanation for the high cholesterol risk score." }
            },
            required: ['score', 'reasoning']
        }
    },
    required: ['diabetes', 'hypertension', 'cholesterol']
};

export const assessHealthRisk = async (nutritionalInfo: NutritionalInfo): Promise<HealthRiskAssessment> => {
  try {
    const prompt = `You are an AI health assistant specializing in dietary risk assessment. Based on the following nutritional information, evaluate the potential risk for an individual with a predisposition to diabetes, hypertension, and high cholesterol. Provide a risk score from 1 (very low risk) to 10 (very high risk) for each condition, along with a brief, clear explanation for your assessment. Respond ONLY with a JSON object that conforms to the provided schema. Do not include any other text or markdown formatting.

Nutritional Information:
${JSON.stringify(nutritionalInfo, null, 2)}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: healthRiskSchema,
        thinkingConfig: {
            thinkingBudget: 32768,
        }
      },
    });
    
    const text = response.text;
    if (!text) {
        throw new Error("Received an empty risk assessment response from the AI.");
    }
    return JSON.parse(text) as HealthRiskAssessment;
  } catch (error) {
    console.error("Error assessing health risk:", error);
    throw new Error("Failed to assess health risks. The nutritional data might be incomplete.");
  }
};

export const getChat = () => {
    return ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: 'You are a friendly and knowledgeable nutrition and health chatbot. Answer questions clearly and concisely. If you are unsure, say you do not know.'
        }
    });
}

export const getDailyHealthTip = async (): Promise<string> => {
  try {
    const prompt = "You are a health and wellness coach. Provide a single, short, actionable health or nutrition tip for the day. Keep it under 20 words. For example: 'Stay hydrated! Drink a glass of water before each meal.' or 'Take a 10-minute walk after lunch to aid digestion.'";

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    const text = response.text;
    if (!text) {
        throw new Error("Received an empty health tip from the AI.");
    }
    return text.trim();
  } catch (error) {
    console.error("Error getting daily health tip:", error);
    return "Remember to eat a balanced meal with plenty of vegetables!"; // Fallback tip
  }
};