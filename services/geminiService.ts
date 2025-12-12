import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ParsedReceiptData } from "../types";

// Note: In a real production app, you should not expose the API KEY in client-side code directly 
// without proxying or strict restrictions. For this demo, we use process.env.API_KEY.
// The user must provide their own key if not injected.

const getAiClient = () => {
    const apiKey = process.env.API_KEY || ''; // Ensure this is set in your environment or allow user input (not requested here)
    if (!apiKey) {
        throw new Error("Missing Google API Key");
    }
    return new GoogleGenAI({ apiKey });
};

export const parseReceiptImage = async (base64Image: string): Promise<ParsedReceiptData> => {
    try {
        const ai = getAiClient();
        
        // Remove data URL prefix if present for the raw data payload
        const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');

        const responseSchema: Schema = {
            type: Type.OBJECT,
            properties: {
                vendor: { type: Type.STRING, description: "Name of the vendor or merchant" },
                date: { type: Type.STRING, description: "Transaction date in YYYY-MM-DD format" },
                amount: { type: Type.NUMBER, description: "Total amount including tax" },
                vat_amount: { type: Type.NUMBER, description: "Total VAT amount if present, else 0" },
                category: { 
                    type: Type.STRING, 
                    enum: ["fuel", "materials", "tools", "food", "hotel", "travel", "training", "miscellaneous"],
                    description: "Expense category"
                },
                error: { type: Type.STRING, description: "Set to 'bad_image' if unreadable", nullable: true }
            },
            required: ["vendor", "date", "amount", "category"],
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    {
                        inlineData: {
                            mimeType: 'image/jpeg', // Assuming converted to jpeg or generic handling
                            data: cleanBase64
                        }
                    },
                    {
                        text: `You are a receipt parser. Extract: vendor name, transaction date, total amount, VAT amount (if present), and category (choose one: fuel, materials, tools, food, hotel, travel, training, miscellaneous). Output JSON with keys: vendor, date, amount, vat_amount, category. If the image is unreadable or too low quality, return { "error": "bad_image" }.`
                    }
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.1, // Low temperature for factual extraction
            }
        });

        const text = response.text;
        if (!text) throw new Error("No response from AI");

        const parsed = JSON.parse(text) as ParsedReceiptData;
        return parsed;

    } catch (error) {
        console.error("Gemini Parse Error:", error);
        return {
            vendor: '',
            date: new Date().toISOString().split('T')[0],
            amount: 0,
            category: 'miscellaneous',
            error: 'Failed to process receipt'
        };
    }
};
