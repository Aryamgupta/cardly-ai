import { ContactMatch } from "@/app/(app)/chat/page";
import { getAvatar } from "@/utils/common/common";
import { Building2 } from "lucide-react";
import Link from "next/link";

export default function SearchCard({ contact, idx }: { contact: ContactMatch, idx: number }) {
    const pct = Math.round(contact.similarity * 100);
    const badgeClass =
        pct >= 70 ? "bg-emerald-100 text-emerald-700" :
            pct >= 60 ? "bg-blue-100 text-blue-700" :
                "bg-amber-100 text-amber-700";

    return <Link
        key={contact.id}
        href={`/contacts/${contact.id}`}
        className="block bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:border-primary/30 hover:shadow-md transition-all group"
        style={{ animationDelay: `${idx * 50}ms` }}
    >
        <div className="flex gap-4">
            {/* Image Thumbnail */}
            <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 relative border border-slate-200/50">
                {contact.image_url ? (
                    <img
                        src={getAvatar(contact.full_name)}
                        alt={contact.full_name}
                        className="object-cover"
                        sizes="64px"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-slate-400" />
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="flex justify-between items-start mb-0.5">
                    <h3 className="font-semibold text-foreground truncate pr-2 group-hover:text-primary transition-colors">
                        {contact.full_name}
                    </h3>
                    <div className={`flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeClass}`}>
                        {pct}% Match
                    </div>
                </div>

                <p className="text-sm text-slate-600 truncate mb-1">
                    {contact.designation && <span className="font-medium text-slate-700">{contact.designation}</span>}
                    {contact.designation && contact.company_name && " @ "}
                    {contact.company_name}
                </p>

                {contact.ai_industry && (
                    <div className="flex mt-1">
                        <span className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
                            {contact.ai_industry}
                        </span>
                    </div>
                )}
            </div>
        </div>
    </Link>
}