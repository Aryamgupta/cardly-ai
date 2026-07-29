"use client";

import { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import { Search, Star, MessageSquare, Bell, UserPlus } from "lucide-react";
import { toggleFavorite } from "@/app/actions/contacts";

type Contact = {
  id: string;
  full_name: string;
  company_name: string | null;
  designation: string | null;
  original_image_path: string | null;
  is_favorite: boolean;
  created_at: string;
  signedUrl: string | null;
};

type FilterType = "all" | "recent" | "company" | "favorite";

const AVATAR_COLORS = [
  "bg-violet-500", "bg-blue-500", "bg-emerald-500", "bg-amber-500",
  "bg-rose-500", "bg-cyan-500", "bg-fuchsia-500", "bg-orange-500",
];

function getInitials(name: string) {
  if (!name) return "?";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2);
}

function getAvatarColor(name: string) {
  const hash = (name || "").split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function timeAgo(dateStr: string) {
  const date = new Date(dateStr);
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  if (diff < 2592000) return `${Math.floor(diff / 604800)}w ago`;
  return `${Math.floor(diff / 2592000)}mo ago`;
}

function FavoriteButton({ contact }: { contact: Contact }) {
  const [isFav, setIsFav] = useState(contact.is_favorite);
  const [isPending, startTransition] = useTransition();

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next = !isFav;
    setIsFav(next); // optimistic update
    startTransition(async () => {
      try {
        await toggleFavorite(contact.id, next);
      } catch {
        setIsFav(isFav); // revert on error
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      className="p-1 rounded-full transition-colors hover:bg-slate-100"
      aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
    >
      <Star
        className={`w-4 h-4 transition-colors ${isFav ? "fill-amber-400 text-amber-400" : "text-slate-300 hover:text-amber-400"}`}
      />
    </button>
  );
}

const FILTERS: { key: FilterType; label: string }[] = [
  { key: "all", label: "All" },
  { key: "recent", label: "Recent" },
  { key: "company", label: "Company" },
  { key: "favorite", label: "Favorite" },
];

export function ContactsClient({ contacts }: { contacts: Contact[] }) {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const filtered = useMemo(() => {
    let list = [...contacts];

    // Apply text search
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (c) =>
          (c.full_name || "").toLowerCase().includes(q) ||
          (c.company_name || "").toLowerCase().includes(q) ||
          (c.designation || "").toLowerCase().includes(q)
      );
    }

    // Apply filter pill
    if (activeFilter === "recent") {
      list = list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (activeFilter === "company") {
      list = list.sort((a, b) => (a.company_name || "").localeCompare(b.company_name || ""));
    } else if (activeFilter === "favorite") {
      list = list.filter((c) => c.is_favorite);
    } else {
      // "all" = alphabetical
      list = list.sort((a, b) => (a.full_name || "").localeCompare(b.full_name || ""));
    }

    return list;
  }, [contacts, query, activeFilter]);

  return (
    <div className="flex flex-col min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xs">C</span>
          </div>
          <span className="font-bold text-lg text-foreground">Cardly AI</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/chat" className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
            <MessageSquare className="w-5 h-5" />
          </Link>
          <button
            type="button"
            onClick={() => setIsSearchOpen((v) => !v)}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Inline search bar */}
      <div
        className={`overflow-hidden transition-all duration-300 ${isSearchOpen ? "max-h-20 opacity-100 px-5 pb-3" : "max-h-0 opacity-0"}`}
      >
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            autoFocus={isSearchOpen}
            placeholder="Search name, company, or detail..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-slate-50 border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
        </div>
      </div>

      {/* Always-visible search bar (non-expanded version) */}
      {!isSearchOpen && (
        <div className="px-5 pb-3">
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="w-full flex items-center gap-2 bg-slate-50 border border-border rounded-xl px-4 py-2.5 text-sm text-muted-foreground hover:bg-slate-100 transition-colors"
          >
            <Search className="w-4 h-4" />
            Search name, company, or detail...
          </button>
        </div>
      )}

      {/* Filter Pills */}
      <div className="flex items-center gap-2 px-5 pb-4 overflow-x-auto scrollbar-none">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setActiveFilter(f.key)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
              activeFilter === f.key
                ? "bg-primary text-white shadow-sm shadow-primary/30"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Section header */}
      <div className="flex items-center justify-between px-5 mb-3">
        <h1 className="text-xl font-bold text-foreground">Contacts</h1>
        <span className="text-xs text-muted-foreground">
          Sorted by:{" "}
          <span className="text-primary font-semibold capitalize">{activeFilter === "all" ? "Alphabetical" : activeFilter}</span>
        </span>
      </div>

      {/* Contact list */}
      <div className="px-5 space-y-3 flex-1">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Search className="w-6 h-6 text-slate-400" />
            </div>
            <p className="font-semibold text-foreground mb-1">
              {query ? `No results for "${query}"` : "No contacts yet"}
            </p>
            <p className="text-sm text-muted-foreground">
              {query ? "Try a different search term." : "Scan a business card to get started."}
            </p>
          </div>
        ) : (
          filtered.map((contact) => (
            <Link
              key={contact.id}
              href={`/contacts/${contact.id}`}
              className="flex items-center gap-3 p-3.5 bg-white rounded-2xl border border-border shadow-sm hover:shadow-md hover:border-primary/20 transition-all"
            >
              {/* Avatar */}
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-base shrink-0 overflow-hidden ${!contact.signedUrl ? getAvatarColor(contact.full_name) : ""}`}
              >
                {contact.signedUrl ? (
                  <img src={contact.signedUrl} alt={contact.full_name} className="w-full h-full object-cover" />
                ) : (
                  getInitials(contact.full_name)
                )}
              </div>

              {/* Info */}
              <div className="flex-1 overflow-hidden min-w-0">
                <p className="font-bold text-sm text-foreground truncate">{contact.full_name}</p>
                <p className="text-xs font-medium text-slate-600 truncate">{contact.company_name || "No Company"}</p>
                <p className="text-xs text-muted-foreground truncate">{contact.designation || "No Title"}</p>
              </div>

              {/* Right: star + time */}
              <div className="flex flex-col items-end gap-1 shrink-0">
                <FavoriteButton contact={contact} />
                <span className="text-[10px] text-muted-foreground">{timeAgo(contact.created_at)}</span>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* FAB */}
      <Link
        href="/scan"
        className="fixed bottom-24 right-6 w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-lg shadow-primary/30 hover:scale-105 transition-transform z-40"
      >
        <UserPlus className="w-6 h-6" />
      </Link>
    </div>
  );
}
