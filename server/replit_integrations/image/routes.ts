import type { Express, Request, Response } from "express";
import { Modality, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { ai } from "./client";
import { isAuthenticated } from "../auth";

// Safety settings to disable filters
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
];

export function registerImageRoutes(app: Express): void {
  app.post("/api/generate-image", isAuthenticated, async (req: Request, res: Response) => {
    try {
      let { prompt } = req.body;

      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      // Add Zak's rude flavor to the image prompt
      const enhancedPrompt = `A visually intense and gritty image based on: ${prompt}. Style: dark, edgy, cynical. No polite or clean elements.`;

      const response = await ai.getGenerativeModel({
        model: "gemini-2.5-flash-image",
        safetySettings,
      }).generateContent({
        contents: [{ role: "user", parts: [{ text: enhancedPrompt }] }],
        config: {
          responseModalities: [Modality.TEXT, Modality.IMAGE],
        },
      });

      const candidate = response.candidates?.[0];
      const imagePart = candidate?.content?.parts?.find((part: any) => part.inlineData);

      if (!imagePart?.inlineData?.data) {
        return res.status(500).json({ error: "No image data in response" });
      }

      const mimeType = imagePart.inlineData.mimeType || "image/png";
      res.json({
        b64_json: imagePart.inlineData.data,
        mimeType,
      });
    } catch (error) {
      console.error("Error generating image:", error);
      res.status(500).json({ error: "Failed to generate image" });
    }
  });
}

