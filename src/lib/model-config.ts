export interface AIModel {
  id: string;
  name: string;
  description: string;
  inputCost: number; // per 1M tokens
  outputCost: number; // per 1M tokens
  multimodal: boolean; // Has vision/PDF support?
  preview: boolean;
  bestFor: string;
}

export const AVAILABLE_MODELS: AIModel[] = [
  {
    id: "gemini-3-pro-preview",
    name: "Gemini 3 Pro Preview",
    description:
      "Deepest reasoning & native multimodal understanding. The 'Vibe-Coding' King.",
    inputCost: 2.0,
    outputCost: 12.0,
    multimodal: true,
    preview: true,
    bestFor: "Complex OCR & Reasoning",
  },
  {
    id: "gemini-3-flash-preview",
    name: "Gemini 3 Flash Preview",
    description: "Built for speed and high-volume production tasks.",
    inputCost: 0.5,
    outputCost: 3.0,
    multimodal: true,
    preview: true,
    bestFor: "Production Chat & Speed",
  },
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    description: "Balanced hybrid reasoning model with 1M token context.",
    inputCost: 0.3,
    outputCost: 2.5,
    multimodal: true,
    preview: false,
    bestFor: "High Volume / Low Cost",
  },
];

export const DEFAULT_MODEL = "gemini-3-flash-preview";
