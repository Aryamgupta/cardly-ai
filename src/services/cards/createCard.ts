import { createClient } from "@/utils/supabase/client";

const supabase = createClient();
export async function createCard(userId: string, imagePath: string, eventName?: string) {
  const { data, error } = await supabase
    .from('cards')
    .insert([
      { 
        user_id: userId, 
        original_image_path: imagePath,
        processing_status: 'uploaded',
        ...(eventName ? { event_name: eventName } : {})
      }
    ])
    .select()
    .single();

  if (error) {
    console.error("Error creating card record:", error);
    return null;
  }

  return data;
}
