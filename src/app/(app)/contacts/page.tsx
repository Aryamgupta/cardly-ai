import { createClient } from "@/utils/supabase/server";
import { ContactsClient } from "@/components/contacts/ContactsClient";

export default async function ContactsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: contacts } = await supabase
    .from("cards")
    .select("id, full_name, company_name, designation, original_image_path, is_favorite, created_at")
    .eq("user_id", user?.id)
    .eq("processing_status", "confirmed")
    .order("full_name", { ascending: true });

  // Batch fetch all signed URLs in ONE Storage API call
  const pathsToSign = (contacts || [])
    .filter((c) => c.original_image_path)
    .map((c) => c.original_image_path as string);

  let signedUrlMap: Record<string, string> = {};
  if (pathsToSign.length > 0) {
    const { data: signedUrls } = await supabase.storage
      .from("business-cards")
      .createSignedUrls(pathsToSign, 3600);
    if (signedUrls) {
      signedUrls.forEach((item) => {
        if (item.signedUrl && item.path) {
          signedUrlMap[item.path] = item.signedUrl;
        }
      });
    }
  }

  const contactsWithUrls = (contacts || []).map((c) => ({
    ...c,
    signedUrl: c.original_image_path ? signedUrlMap[c.original_image_path] || null : null,
    is_favorite: c.is_favorite ?? false,
  }));

  return <ContactsClient contacts={contactsWithUrls} />;
}
