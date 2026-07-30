import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { data: cards, error } = await supabase
      .from("cards")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching cards for export:", error);
      return new NextResponse("Failed to fetch data", { status: 500 });
    }

    if (!cards || cards.length === 0) {
      return new NextResponse("No data to export", { status: 404 });
    }

    // CSV Headers
    const headers = [
      "Full Name",
      "Designation",
      "Company",
      "Industry",
      "Emails",
      "Phones",
      "Website",
      "Tags",
      "Notes",
      "Created At"
    ];

    // CSV Rows
    const rows = cards.map(card => {
      // Safe parsing for arrays/JSON
      const emails = Array.isArray(card.emails) ? card.emails.join("; ") : "";
      const phones = Array.isArray(card.phones) ? card.phones.join("; ") : "";
      const tags = Array.isArray(card.tags) ? card.tags.join("; ") : "";

      // Escape quotes for CSV
      const escape = (val: any) => {
        if (val === null || val === undefined) return "";
        const str = String(val);
        return `"${str.replace(/"/g, '""')}"`;
      };

      return [
        escape(card.full_name),
        escape(card.designation),
        escape(card.company_name),
        escape(card.industry),
        escape(emails),
        escape(phones),
        escape(card.website),
        escape(tags),
        escape(card.notes),
        escape(new Date(card.created_at).toLocaleString())
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="cardly_contacts.csv"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
