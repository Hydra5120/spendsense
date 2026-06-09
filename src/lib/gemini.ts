import { GoogleGenerativeAI, GenerativeModel, type GenerationConfig } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const FALLBACK_MODELS = [
  "gemini-3.1-flash-lite",
  "gemma-4-31b-it",
  "gemma-4-26b-a4b-it",
];

function isRateLimitError(error: unknown): boolean {
  const message = String(error);
  return message.includes("429") || message.includes("RESOURCE_EXHAUSTED");
}

function getModels(config?: GenerationConfig): GenerativeModel[] {
  return FALLBACK_MODELS.map((model) =>
    genAI.getGenerativeModel({ model, generationConfig: config })
  );
}

async function generateContentWithFallback(
  models: GenerativeModel[],
  prompt: string,
) {
  for (let i = 0; i < models.length; i++) {
    try {
      return await models[i].generateContent(prompt);
    } catch (error) {
      if (isRateLimitError(error) && i < models.length - 1) continue;
      throw error;
    }
  }
  throw new Error("All models exhausted");
}

class FallbackModel {
  private models: GenerativeModel[];

  constructor(config?: GenerationConfig) {
    this.models = getModels(config);
  }

  async generateContent(prompt: string) {
    return generateContentWithFallback(this.models, prompt);
  }

  startChat(options?: Parameters<GenerativeModel["startChat"]>[0]) {
    return new FallbackChat(this.models, options);
  }
}

class FallbackChat {
  private models: GenerativeModel[];
  private chatOptions?: Parameters<GenerativeModel["startChat"]>[0];

  constructor(
    models: GenerativeModel[],
    options?: Parameters<GenerativeModel["startChat"]>[0],
  ) {
    this.models = models;
    this.chatOptions = options;
  }

  async sendMessageStream(message: string) {
    for (let i = 0; i < this.models.length; i++) {
      try {
        const chat = this.models[i].startChat(this.chatOptions);
        return await chat.sendMessageStream(message);
      } catch (error) {
        if (isRateLimitError(error) && i < this.models.length - 1) continue;
        throw error;
      }
    }
    throw new Error("All models exhausted");
  }
}

export const geminiModel = new FallbackModel();

export const geminiJsonModel = new FallbackModel({
  responseMimeType: "application/json",
});

export const geminiChatModel = new FallbackModel({
  temperature: 0.7,
  maxOutputTokens: 1024,
});
