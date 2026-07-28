import { createClient } from "@/utils/supabase/client";

const supabase = createClient();
export async function uploadCardImage(userId: string, cardId: string, file: File): Promise<string | null> {
  const fileExt = file.name.split('.').pop();
  const filePath = `${userId}/${cardId}/original.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('business-cards')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    console.error("Error uploading image:", error);
    return null;
  }

  return data.path;
}
