import {
    ClipboardList,
    AlertTriangle,
    Flag,
    CheckCircle2,
    ShieldCheck,
} from "lucide-react";

import { getCurrentUser } from "../../utils/auth";

export default function SupervisorDashboardOverview() {
    const user = getCurrentUser();

    const cards = [
        {
            title: "Active Tickets",
            value: 24,
            description: "Currently active",
            badge: "Active",
            icon: ClipboardList,
            iconBg: "bg-blue-100",
            iconColor: "text-blue-600",
            badgeBg: "bg-blue-50",
            badgeColor: "text-blue-600",
            badgeBorder: "border-blue-200",
            hoverBorder: "hover:border-blue-200",
        },
        {
            title: "SLA Breached",
            value: 5,
            description: "Require attention",
            badge: "Attention",
            icon: AlertTriangle,
            iconBg: "bg-red-100",
            iconColor: "text-red-600",
            badgeBg: "bg-red-50",
            badgeColor: "text-red-600",
            badgeBorder: "border-red-200",
            hoverBorder: "hover:border-red-200",
        },
        {
            title: "Escalated Tickets",
            value: 8,
            description: "Need Supervisor review",
            badge: "Review",
            icon: Flag,
            iconBg: "bg-orange-100",
            iconColor: "text-orange-600",
            badgeBg: "bg-orange-50",
            badgeColor: "text-orange-600",
            badgeBorder: "border-orange-200",
            hoverBorder: "hover:border-orange-200",
        },
        {
            title: "Resolved Today",
            value: 17,
            description: "Resolved by IT Support",
            badge: "Resolved",
            icon: CheckCircle2,
            iconBg: "bg-green-100",
            iconColor: "text-green-600",
            badgeBg: "bg-green-50",
            badgeColor: "text-green-600",
            badgeBorder: "border-green-200",
            hoverBorder: "hover:border-green-200",
        },
    ];

    return (
        <div className="w-full overflow-hidden rounded-xl border border-gray-300 bg-white">
            {/* Welcome Header */}
            <div className="relative overflow-hidden bg-gradient-to-r from-[#4C4CF9] to-[#6366F1] px-4 py-4 text-white sm:px-6 sm:py-5">
                {/* Background Decorations */}
                <div className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/10 sm:h-40 sm:w-40" />

                <div className="absolute -bottom-14 right-12 h-28 w-28 rounded-full bg-white/10 sm:right-24 sm:h-32 sm:w-32" />

                <div className="relative flex items-center justify-between gap-3">
                    {/* Welcome Content */}
                    <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/20 bg-white/15 sm:h-12 sm:w-12 sm:rounded-xl">
                            <ShieldCheck
                                size={20}
                                className="sm:h-6 sm:w-6"
                            />
                        </div>

                        <div className="min-w-0">
                            <h1 className="truncate text-base font-semibold sm:text-xl">
                                Welcome back,{" "}
                                {user?.first_name ||
                                    user?.username ||
                                    "User"}
                                !
                            </h1>

                            <p className="mt-0.5 truncate text-xs text-indigo-100 sm:mt-1 sm:text-sm">
                                Monitor ticket activity, SLA performance, and
                                IT Support workload.
                            </p>
                        </div>
                    </div>

                    {/* Role Badge */}
                    <div className="hidden shrink-0 items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 py-2 sm:flex">
                        <ShieldCheck size={16} />

                        <span className="text-xs font-medium">
                            Supervisor Operations
                        </span>
                    </div>

                    {/* Mobile Role Icon */}
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/20 bg-white/10 sm:hidden">
                        <ShieldCheck size={16} />
                    </div>
                </div>
            </div>

            {/* Overview Cards */}
            <div className="p-2.5 sm:p-4">
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4">
                    {cards.map((card) => {
                        const Icon = card.icon;

                        return (
                            <div
                                key={card.title}
                                className={`
                                    min-w-0 rounded-lg border border-gray-200
                                    p-3 transition
                                    sm:rounded-xl sm:p-4
                                    sm:hover:shadow-md
                                    ${card.hoverBorder}
                                `}
                            >
                                {/* Icon + Badge */}
                                <div className="flex items-center justify-between gap-2">
                                    <div
                                        className={`
                                            flex h-8 w-8 shrink-0 items-center
                                            justify-center rounded-full
                                            sm:h-10 sm:w-10
                                            ${card.iconBg}
                                        `}
                                    >
                                        <Icon
                                            size={15}
                                            className={`${card.iconColor} sm:hidden`}
                                        />

                                        <Icon
                                            size={18}
                                            className={`${card.iconColor} hidden sm:block`}
                                        />
                                    </div>

                                    <span
                                        className={`
                                            whitespace-nowrap rounded-md border
                                            px-1.5 py-0.5 text-[9px] font-semibold
                                            sm:rounded-lg sm:px-2 sm:py-1
                                            sm:text-xs
                                            ${card.badgeBg}
                                            ${card.badgeColor}
                                            ${card.badgeBorder}
                                        `}
                                    >
                                        {card.badge}
                                    </span>
                                </div>

                                {/* Content */}
                                <p className="mt-2.5 truncate text-[11px] text-gray-500 sm:mt-5 sm:text-sm">
                                    {card.title}
                                </p>

                                <h2 className="mt-0.5 text-xl font-bold leading-tight text-gray-900 sm:mt-1 sm:text-2xl">
                                    {card.value}
                                </h2>

                                <p className="mt-1 hidden text-xs text-gray-400 sm:mt-2 sm:block">
                                    {card.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}