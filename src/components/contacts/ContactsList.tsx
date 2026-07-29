import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { UserPlus } from "lucide-react";

function getInitials(name: string) {
  if (!name) return "?";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2);
}

export async function ContactsList() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: contacts } = await supabase
    .from('cards')
    .select('id, full_name, company_name, designation, original_image_path')
    .eq('user_id', user?.id)
    .eq('processing_status', 'confirmed')
    .order('full_name', { ascending: true });

  if (!contacts || contacts.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-border shadow-sm">
        <p className="font-medium text-foreground mb-1">No confirmed contacts</p>
        <p className="text-sm text-muted-foreground">Scan and review business cards to build your network.</p>
      </div>
    );
  }

  // OPTIMIZED: Batch fetch all signed URLs in a single Storage API call
  // instead of N individual calls in a loop
  const pathsToSign = contacts
    .filter((c) => c.original_image_path)
    .map((c) => c.original_image_path as string);

  let signedUrlMap: Record<string, string> = {};
  if (pathsToSign.length > 0) {
    const { data: signedUrls } = await supabase.storage
      .from('business-cards')
      .createSignedUrls(pathsToSign, 3600);

    if (signedUrls) {
      signedUrls.forEach((item) => {
        if (item.signedUrl && item.path) {
          signedUrlMap[item.path] = item.signedUrl;
        }
      });
    }
  }

  return (
    <>
      <div className="space-y-4">
        {contacts.map((contact) => {
          const signedUrl = contact.original_image_path
            ? signedUrlMap[contact.original_image_path] || null
            : null;
          return (
            <Link
              key={contact.id}
              href={`/contacts/${contact.id}`}
              className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg shrink-0 overflow-hidden">
                {signedUrl ? (
                  <img
                    src={signedUrl}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  getInitials(contact.full_name)
                )}
              </div>
              <div className="flex-1 overflow-hidden">
                <h3 className="font-bold truncate">{contact.full_name}</h3>
                <p className="text-xs text-foreground font-medium truncate">{contact.company_name || 'No Company'}</p>
                <p className="text-xs text-muted-foreground truncate">{contact.designation || 'No Title'}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* FAB */}
      <Link
        href="/scan"
        className="fixed bottom-24 right-6 w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-lg shadow-primary/30 hover:scale-105 transition-transform z-40"
      >
        <UserPlus className="w-6 h-6" />
      </Link>
    </>
  );
}

export function ContactsListSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-border shadow-sm h-[82px]">
          <div className="w-12 h-12 rounded-full bg-slate-200 shrink-0"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 bg-slate-300 rounded"></div>
            <div className="h-3 w-24 bg-slate-200 rounded"></div>
            <div className="h-3 w-20 bg-slate-100 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
