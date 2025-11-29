import { GoogleGenAI } from "@google/genai";

interface Env {
  API_KEY: string;
}

interface ExecutionContext {
  waitUntil(promise: Promise<any>): void;
  passThroughOnException(): void;
}

/**
 * Cloudflare Worker Template
 * 
 * In a production environment, you would deploy this worker to handle 
 * AI requests securely, preventing your API_KEY from being exposed 
 * in the client-side code.
 */
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // Handle CORS
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    try {
      const { prompt, model = "gemini-2.5-flash", systemInstruction } = await request.json() as any;
      
      if (!env.API_KEY) {
        throw new Error("API_KEY not configured in Worker environment");
      }

      const ai = new GoogleGenAI({ apiKey: env.API_KEY });
      
      const config: any = {};
      if (systemInstruction) {
        config.systemInstruction = systemInstruction;
      }

      const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: config
      });

      return new Response(JSON.stringify({ text: response.text }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });

    } catch (error: any) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }
  },
};