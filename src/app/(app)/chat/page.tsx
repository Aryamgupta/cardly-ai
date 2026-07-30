"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Sparkles, Loader2, Send, Building2 } from "lucide-react";
import Link from "next/link";
import { getAvatar } from "@/utils/common/common";
import SearchCard from "@/components/ui/SearchCard";

export interface ContactMatch {
  id: string;
  full_name: string;
  company_name?: string;
  designation?: string;
  ai_industry?: string;
  ai_summary?: string;
  image_url?: string;
  similarity: number;
}

export default function ChatPage() {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<ContactMatch[] | null>(null);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on load
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setError("");
    setQuery(searchQuery);

    try {
      const res = await fetch("/api/ai-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Use a high threshold — only genuinely relevant contacts
        body: JSON.stringify({ query: searchQuery, threshold: 0.55, limit: 8 })
      });

      if (!res.ok) {
        throw new Error("Search failed");
      }

      const data = await res.json();
      console.log(data);
      setResults(data.results);
    } catch (err) {
      console.error(err);
      setError("Sorry, something went wrong while searching.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch(query);
    }
  };

  const exampleQueries = [
    "Who do I know in fintech?",
    "Show me founders from Bangalore",
    "Contacts who work in AI or Machine Learning",
    "Investors I met recently",
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20">
      {/* Header & Search Bar */}
      <div className="bg-white px-6 pt-12 pb-6 border-b border-border shadow-sm relative overflow-hidden transition-all duration-300 ease-in-out">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Sparkles className="w-32 h-32 text-primary" />
        </div>

        <h1 className="text-2xl font-bold text-foreground relative z-10 flex items-center gap-2">
          Ask Cardly <Sparkles className="w-5 h-5 text-primary animate-pulse" />
        </h1>

        {!results && (
          <p className="text-muted-foreground mt-2 relative z-10 text-sm">
            Describe who you're looking for, and Cardly's AI will find them in your network.
          </p>
        )}

        <div className="mt-6 relative z-10 flex gap-2">
          <div className="relative flex-1">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <Search className={`w-5 h-5 ${isSearching ? 'text-primary animate-pulse' : 'text-muted-foreground/50'}`} />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="E.g. Who do I know in marketing?"
              className="w-full h-14 pl-12 pr-4 bg-slate-100/80 rounded-2xl border-transparent focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
              disabled={isSearching}
            />
          </div>
          <button
            onClick={() => handleSearch(query)}
            disabled={!query.trim() || isSearching}
            className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center disabled:opacity-50 disabled:bg-slate-200 disabled:text-slate-400 transition-all hover:bg-primary/90 hover:scale-105 active:scale-95 shadow-lg shadow-primary/25"
          >
            {isSearching ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 overflow-y-auto">

        {/* Empty State / Examples */}
        {!results && !isSearching && !error && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-sm font-semibold text-muted-foreground px-1">Try asking:</h3>
            <div className="flex flex-wrap gap-2">
              {exampleQueries.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuery(q);
                    handleSearch(q);
                  }}
                  className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors text-left shadow-sm"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-sm text-center animate-in fade-in">
            {error}
          </div>
        )}

        {/* Loading State Skeleton */}
        {isSearching && !results && (
          <div className="space-y-4">
            <div className="h-4 w-32 bg-slate-200 rounded animate-pulse mb-6" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-16 h-16 bg-slate-200 rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-3 py-1">
                    <div className="h-5 bg-slate-200 rounded w-3/4" />
                    <div className="h-4 bg-slate-200 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results State */}
        {results && !isSearching && (
          <div className="space-y-4 animate-in fade-in duration-500">
            <h3 className="text-sm font-semibold text-slate-700 px-1">
              {results.length > 0
                ? `Found ${results.length} relevant contact${results.length === 1 ? '' : 's'}`
                : 'No close matches found'}
            </h3>

            {results.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-slate-100 shadow-sm">
                <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">No strong matches</h3>
                <p className="text-sm text-muted-foreground">
                  No contacts closely matched your query. Try different keywords or add more contacts.
                </p>
                <button
                  onClick={() => { setResults(null); setQuery(""); inputRef.current?.focus(); }}
                  className="mt-6 px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-sm font-medium transition-colors"
                >
                  Clear Search
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {results.map((contact, idx) => {
                  return <SearchCard contact={contact} idx={idx} />
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
