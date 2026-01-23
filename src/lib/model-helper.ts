import { createClient } from "@/lib/supabase/server";
import { DEFAULT_MODEL } from "@/lib/model-config";

export * from "@/lib/model-config";

export async function getActiveModelId(): Promise<string> {
  const supabase = await createClient();

  try {
    const { data } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", "ai_model_config")
      .single();

    if (data?.value?.modelId) {
      console.log(`[AI Config] Using configured model: ${data.value.modelId}`);
      return data.value.modelId;
    }
  } catch (error) {
    console.warn("[AI Config] Failed to fetch settings, using default.", error);
  }

  console.log(`[AI Config] Using default model: ${DEFAULT_MODEL}`);
  return DEFAULT_MODEL;
}
