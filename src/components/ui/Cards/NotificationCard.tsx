import { NotificationItem } from "@/app/actions/notifications";
import { AlertCircle, Bell, Clock } from "lucide-react";
import Link from "next/link";
import { SetStateAction } from "react";

export const NotificationCard = ({ notif, onClick }: { notif: NotificationItem, onClick: (value: SetStateAction<boolean>) => void }) => {
    const isSystem = notif.isSystem;
    const Wrapper = isSystem ? "div" : Link;
    const wrapperProps = isSystem
        ? { className: "p-4 flex gap-3 hover:bg-slate-50 transition-colors cursor-default" }
        : { href: `/contacts/${notif.cardId}`, onClick: () => onClick(false), className: "p-4 flex gap-3 hover:bg-slate-50 transition-colors block cursor-pointer" };

    return (
        <Wrapper
            key={notif.id}
            {...(wrapperProps as any)}
        >
            <div
                className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isSystem
                    ? "bg-blue-100 text-blue-600"
                    : notif.isOverdue
                        ? "bg-red-100 text-red-600"
                        : "bg-amber-100 text-amber-600"
                    }`}
            >
                {isSystem ? (
                    <Bell className="w-4 h-4" />
                ) : notif.isOverdue ? (
                    <AlertCircle className="w-4 h-4" />
                ) : (
                    <Clock className="w-4 h-4" />
                )}
            </div>
            <div>
                <p className="text-sm font-bold text-slate-800 mb-0.5">
                    {notif.title}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-2">
                    {notif.message}
                </p>
            </div>
        </Wrapper>
    );
}
