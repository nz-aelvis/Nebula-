
import { GoogleGenAI, Type } from "@google/genai";
import { Product, SalesStat, Order } from "../types.ts";

const getAI = () => {
    // NOTE: In a real Cloudflare Worker environment, this key would be a secret in the worker env.
    // Here we use the provided process.env.API_KEY for the frontend demo.
    const apiKey = process.env.API_KEY; 
    if (!apiKey) {
        console.warn("No API_KEY found in environment variables.");
        return null;
    }
    return new GoogleGenAI({ apiKey });
};

export const generateProductDescription = async (name: string, category: string, keywords: string): Promise<string> => {
    const ai = getAI();
    if (!ai) return "AI Service Unavailable";

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Write a compelling, SEO-friendly product description (max 50 words) for a product named "${name}" in the category "${category}". Keywords: ${keywords}.`,
        });
        return response.text || "No description generated.";
    } catch (error) {
        console.error("Gemini API Error:", error);
        return "Error generating description.";
    }
};

export const analyzeInventoryRisks = async (products: Product[]): Promise<string> => {
    const ai = getAI();
    if (!ai) return "AI Analysis Unavailable";

    const inventorySummary = products.map(p => `${p.name} (Stock: ${p.stock})`).join(", ");

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Analyze this inventory list and identify top 3 critical stock risks or reorder suggestions. Be concise. Inventory: ${inventorySummary}`,
        });
        return response.text || "No analysis available.";
    } catch (error) {
        console.error("Gemini Analysis Error", error);
        return "Could not analyze inventory risks.";
    }
};

export interface ForecastResult {
    advice: string;
    points: SalesStat[];
}

export const forecastSales = async (history: SalesStat[]): Promise<ForecastResult> => {
    const ai = getAI();
    // Default fallback if AI fails
    const fallback: ForecastResult = { 
        advice: "Forecasting unavailable offline.", 
        points: [] 
    };
    
    if (!ai) return fallback;

    const dataStr = JSON.stringify(history);

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Given this daily sales history: ${dataStr}. 
            1. Predict the next 3 days of sales amounts based on the trend.
            2. Provide a 1-sentence strategic tip.
            Return JSON.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        advice: { type: Type.STRING },
                        points: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    date: { type: Type.STRING },
                                    amount: { type: Type.NUMBER }
                                }
                            }
                        }
                    }
                }
            }
        });
        
        const json = JSON.parse(response.text || "{}");
        return {
            advice: json.advice || "Keep monitoring trends.",
            points: json.points || []
        };
    } catch (error) {
        console.error("Gemini Forecast Error", error);
        return fallback;
    }
};

export const suggestPrice = async (name: string, category: string, currentPrice: number): Promise<number> => {
    const ai = getAI();
    if (!ai) return currentPrice;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Suggest a competitive price for a "${name}" in "${category}". The current base price is ${currentPrice}. Return ONLY the number.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        suggestedPrice: { type: Type.NUMBER }
                    }
                }
            }
        });
        
        const json = JSON.parse(response.text || "{}");
        return json.suggestedPrice || currentPrice;
    } catch (error) {
        console.error("Pricing Error", error);
        return currentPrice;
    }
};

export const askERP = async (question: string, context: { products: Product[], orders: Order[] }): Promise<string> => {
    const ai = getAI();
    if (!ai) return "I'm currently offline.";

    // Simplify context to save tokens
    const productCtx = context.products.map(p => ({ n: p.name, s: p.stock, p: p.price, c: p.category }));
    const orderCtx = context.orders.map(o => ({ i: o.id, s: o.status, t: o.total, d: o.date }));

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `User Question: "${question}"`,
            config: {
                systemInstruction: `You are an intelligent ERP Assistant for Nebula Corp. 
                Here is the current system data:
                Products: ${JSON.stringify(productCtx)}
                Orders: ${JSON.stringify(orderCtx)}
                
                Answer the user's question accurately based on this data. 
                Keep answers concise, professional, and helpful. 
                If asked about revenue, calculate it from the orders.
                If asked about low stock, check products with stock < 10.`,
            }
        });
        return response.text || "I couldn't generate an answer.";
    } catch (error) {
        console.error("Chat Error", error);
        return "Sorry, I'm having trouble processing that request right now.";
    }
};

export const generateMarketingEmail = async (customerName: string, totalSpend: number): Promise<string> => {
    const ai = getAI();
    if (!ai) return "Email service unavailable.";

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Write a short, professional marketing email to a customer named ${customerName} who has spent $${totalSpend} with us. 
            If spend > $200, offer VIP status. 
            If spend < $100, offer a 10% discount code WELCOME10.
            Keep it under 100 words. Format as plain text subject and body.`,
        });
        return response.text || "Could not generate email.";
    } catch (error) {
        console.error("Email Gen Error", error);
        return "Error generating email.";
    }
};

export const analyzeOrderRisk = async (order: Order): Promise<string> => {
    const ai = getAI();
    if (!ai) return "AI Risk Analysis Unavailable";

    const orderData = JSON.stringify({
        total: order.total,
        items: order.items.length,
        customer: order.customerName,
        status: order.status
    });

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Analyze this order for fraud risk or shipping complexity: ${orderData}. 
            Provide a Risk Level (Low/Medium/High) and a 1 sentence reason.`,
        });
        return response.text || "Analysis failed.";
    } catch (error) {
        return "Could not analyze order.";
    }
};

export const semanticProductSearch = async (query: string, products: Product[]): Promise<string[]> => {
    const ai = getAI();
    if (!ai) return [];

    const productMap = products.map(p => ({ id: p.id, name: p.name, desc: p.description, cat: p.category }));
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `User Search Query: "${query}"
            
            Available Products: ${JSON.stringify(productMap)}
            
            Return a JSON object with a property "matchedIds" containing an array of product IDs that best match the user's intent. 
            Example: "something to sit on" matches chairs. "typing" matches keyboards.
            If no strong matches, return empty array.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        matchedIds: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        }
                    }
                }
            }
        });

        const json = JSON.parse(response.text || "{}");
        return json.matchedIds || [];
    } catch (error) {
        console.error("Semantic Search Error", error);
        return [];
    }
};

// --- New Fiscal & Customs Services ---

export const estimateImportDuty = async (productName: string, category: string, value: number): Promise<{ hsCode: string, dutyRate: string, estimatedCost: string }> => {
    const ai = getAI();
    if (!ai) return { hsCode: "UNKNOWN", dutyRate: "0%", estimatedCost: "0" };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Act as an ASYCUDA customs expert. 
            Product: ${productName} (${category}). Value: $${value}.
            
            1. Predict the most likely Harmonized System (HS) Code.
            2. Estimate the import duty rate for East Africa/Global standard.
            3. Calculate estimated duty cost.
            
            Return JSON only.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        hsCode: { type: Type.STRING },
                        dutyRate: { type: Type.STRING },
                        estimatedCost: { type: Type.STRING }
                    }
                }
            }
        });
        return JSON.parse(response.text || "{}");
    } catch (error) {
        return { hsCode: "ERR", dutyRate: "Unknown", estimatedCost: "Error" };
    }
};

export const generateFiscalSignature = async (amount: number, date: string, invoiceId: string): Promise<string> => {
    // Simulates an OBR/EBMS fiscal device signature generation
    // In a real app, this would talk to a hardware fiscal device or a secure government API
    const ai = getAI();
    if (!ai) return "FISCAL-OFFLINE-SIG";

    try {
        // We use AI here just to simulate a complex hash generation for the demo
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Generate a fictitious 16-character alphanumeric fiscal signature for invoice ${invoiceId}, amount ${amount}, date ${date}. 
            Format: XXXX-XXXX-XXXX-XXXX.`,
        });
        return response.text?.trim() || "SIG-GEN-FAILED";
    } catch (e) {
        return `EBMS-${Date.now()}`;
    }
};
