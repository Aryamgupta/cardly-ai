"use client";

import { Search, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { Card } from "@/types";

function getInitials(name: string) {
  if (!name) return "?";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2);
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchCards() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('cards')
        .select('*')
        .eq('user_id', user.id)
        .order('full_name', { ascending: true });
        
      if (data) {
        setCards(data);
      }
      setLoading(false);
    }
    fetchCards();
  }, []);

  const filteredCards = cards.filter(card => {
    if (!query) return false; // only show results if there's a query
    const searchString = `${card.full_name || ''} ${card.company_name || ''} ${card.designation || ''}`.toLowerCase();
    return searchString.includes(query.toLowerCase());
  });

  return (
    <div className="p-6 min-h-screen bg-slate-50 pb-24">
      <h1 className="text-2xl font-bold mb-6">Search</h1>
      <div className="relative mb-8">
        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input 
          type="text" 
          placeholder="Search name, company, or detail..." 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-white border border-border rounded-xl pl-10 pr-4 py-4 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
      
      {!query && (
        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
           <Search className="w-12 h-12 mb-4 opacity-20" />
           <p>Find anyone by name, role, or company.</p>
        </div>
      )}

      {loading && query && (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {!loading && query && filteredCards.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
           <p>No results found for &quot;{query}&quot;</p>
        </div>
      )}

      {!loading && query && filteredCards.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-bold mb-2">Results ({filteredCards.length})</h2>
          {filteredCards.map((card) => (
            <Link key={card.id} href={card.processing_status === 'confirmed' ? `/contacts/${card.id}` : `/review/${card.id}`} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg overflow-hidden shrink-0">
                {card.original_image_path ? (
                  <img 
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/business-cards/${card.original_image_path}`} 
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  getInitials(card.full_name)
                )}
              </div>
              <div className="flex-1 overflow-hidden">
                <h3 className="font-bold truncate">{card.full_name || 'Processing...'}</h3>
                <p className="text-xs text-foreground font-medium truncate">{card.company_name || 'No Company'}</p>
                <p className="text-xs text-muted-foreground truncate">{card.designation || 'No Title'}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
