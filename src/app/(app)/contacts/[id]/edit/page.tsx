import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";
import { Card } from "@/types";
import { EditContactForm } from "./EditContactForm";

export default async function EditContactPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data } = await supabase
    .from("cards")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  const card = data as Card | null;

  if (!card) {
    return notFound();
  }

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col relative pb-32">
      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white border-b border-border sticky top-0 z-10">
        <Link
          href={`/contacts/${id}`}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-bold transition-colors"
        >
          <ArrowLeft className="w-5 h-5" /> Cancel
        </Link>
        <h1 className="font-extrabold text-[#0B1020] text-lg">Edit Contact</h1>
        <div className="w-20" /> {/* Spacer for centering */}
      </div>

      <EditContactForm card={card} />
    </div>
  );
}
