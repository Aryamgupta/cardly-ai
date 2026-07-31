import { FolloUpType } from "@/types";
import Link from "next/link";
import { Avatar } from "../Common/Avatar";

export const FolloUpCard = ({ card }: { card: FolloUpType }) => {
    const date = card.follow_up_date ? new Date(card.follow_up_date) : new Date();
    const isOverdue = date < new Date() && date.toDateString() !== new Date().toDateString();

    return (
        <Link href={`/contacts/${card.id}`} key={card.id} className="flex items-center gap-4 p-4 hover:bg-amber-50 transition-colors cursor-pointer">
            <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center relative overflow-hidden flex-shrink-0 border border-amber-200">
                <Avatar fullname={card.full_name} />
            </div>
            <div className="flex-1 overflow-hidden">
                <h3 className="font-bold text-base truncate text-slate-800">{card.full_name}</h3>
                <p className="text-sm text-muted-foreground truncate">
                    {card.designation || card.company_name}
                </p>
            </div>
            <div className="flex flex-col items-end">
                <span className={`text-xs font-bold px-2 py-1 rounded-md ${isOverdue ? 'bg-red-100 text-red-700' : 'bg-white border border-amber-200 text-amber-700'}`}>
                    {date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
                {isOverdue && <span className="text-[9px] text-red-500 font-bold uppercase mt-1">Overdue</span>}
            </div>
        </Link>)
}