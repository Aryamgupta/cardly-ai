import { Search, Bell, Sparkles, UserPlus } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";

function getInitials(name: string) {
  if (!name) return "?";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2);
}

export default async function ContactsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: contacts } = await supabase
    .from('cards')
    .select('*')
    .eq('user_id', user?.id)
    .eq('processing_status', 'confirmed')
    .order('full_name', { ascending: true });

  // Fetch signed URLs for all contacts
  const contactsWithSignedUrls = await Promise.all((contacts || []).map(async (contact) => {
    let signedUrl = null;
    if (contact.original_image_path) {
      const { data } = await supabase.storage.from('business-cards').createSignedUrl(contact.original_image_path, 3600);
      signedUrl = data?.signedUrl || null;
    }
    return { ...contact, signedUrl };
  }));

  const hasContacts = contactsWithSignedUrls.length > 0;

  return (
    <div className="p-6 pb-24 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Contacts</h1>
        <div className="flex items-center gap-4">
          <button className="text-foreground"><Bell className="w-5 h-5" /></button>
          <Link href="/search" className="text-foreground"><Search className="w-5 h-5" /></Link>
        </div>
      </div>

      {/* Search Bar - Links to full search page */}
      <Link href="/search" className="relative mb-4 block">
        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <div className="w-full bg-white border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-muted-foreground">
          Search name, company, or detail...
        </div>
      </Link>

      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-lg">My Network</h2>
        <span className="text-xs text-muted-foreground">Sorted by: <span className="text-primary font-medium">Alphabetical</span></span>
      </div>

      <div className="space-y-4">
        {hasContacts ? (
          contactsWithSignedUrls.map((contact) => (
            <Link key={contact.id} href={`/contacts/${contact.id}`} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg shrink-0 overflow-hidden">
                {contact.signedUrl ? (
                  <img 
                    src={contact.signedUrl} 
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
          ))
        ) : (
          <div className="p-8 text-center bg-white rounded-2xl border border-border shadow-sm">
             <p className="font-medium text-foreground mb-1">No confirmed contacts</p>
             <p className="text-sm text-muted-foreground">Scan and review business cards to build your network.</p>
          </div>
        )}
      </div>

      {/* FAB */}
      <Link href="/scan" className="fixed bottom-24 right-6 w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-lg shadow-primary/30 hover:scale-105 transition-transform z-40">
        <UserPlus className="w-6 h-6" />
      </Link>
    </div>
  );
}
