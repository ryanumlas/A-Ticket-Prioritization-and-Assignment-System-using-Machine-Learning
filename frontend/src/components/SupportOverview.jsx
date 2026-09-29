import {
    UserRoundCheck,
    Inbox,
    Clock3,
    TriangleAlert,
    Wrench,
    ShieldCheck,
} from "lucide-react";
import api from "../api";
import { useEffect, useState } from "react";
import { getCurrentUser } from "../utils/auth";

export default function SupportOverview() {
    const user = getCurrentUser();
    const [overviewData, setOverviewData] = useState(null);

    useEffect(() => {
        const fetchOverviewData = async () => {
            try {
                const response = await api.get(
                    "/tickets/support-specialist/overview/"
                );

                setOverviewData(response.data);
            } catch {
                setOverviewData(null);
            }
        };

        fetchOverviewData();
    }, []);

    const cards = [
        {
            title: "Assigned Tickets",
            value: overviewData?.assigned_tickets ?? 0,
            description: "Currently assigned to you",
            badge: "Active",
            icon: UserRoundCheck,
            iconBg: "bg-blue-100",
            iconColor: "text-blue-600",
            badgeBg: "bg-blue-50",
            badgeColor: "text-blue-600",
            badgeBorder: "border-blue-200",
            hoverBorder: "hover:border-blue-200",
        },
        {
            title: "Open Tickets",
            value: overviewData?.open_tickets ?? 0,
            description: "Open tickets in your department",
            badge: "Open",
            icon: Inbox,
            iconBg: "bg-amber-100",
            iconColor: "text-amber-600",
            badgeBg: "bg-amber-50",
            badgeColor: "text-amber-600",
            badgeBorder: "border-amber-200",
            hoverBorder: "hover:border-amber-200",
        },
        {
            title: "In Progress",
            value: overviewData?.in_progress ?? 0,
            description: "In progress in your department",
            badge: "Working",
            icon: Clock3,
            iconBg: "bg-purple-100",
            iconColor: "text-purple-600",
            badgeBg: "bg-purple-50",
            badgeColor: "text-purple-600",
            badgeBorder: "border-purple-200",
            hoverBorder: "hover:border-purple-200",
        },
        {
            title: "SLA At Risk",
            value: overviewData?.sla_at_risk ?? 0,
            description: "Requires immediate attention",
            badge: "Attention",
            icon: TriangleAlert,
            iconBg: "bg-red-100",
            iconColor: "text-red-600",
            badgeBg: "bg-red-50",
            badgeColor: "text-red-600",
            badgeBorder: "border-red-200",
            hoverBorder: "hover:border-red-200",
        },
    ];

    return (
        <div className="w-full overflow-hidden rounded-xl border border-gray-300 bg-white">
            {/* Welcome Header */}
            <div className="relative overflow-hidden bg-gradient-to-r from-[#4C4CF9] to-[#6366F1] px-3 py-3 text-white sm:px-6 sm:py-5 min-[1280px]:max-[1365px]:px-5 min-[1280px]:max-[1365px]:py-4 min-[1366px]:max-[1537px]:px-5 min-[1366px]:max-[1537px]:py-4.5">
                {/* Background decorations */}
                <div className="absolute -right-8 -top-10 h-24 w-24 rounded-full bg-white/10 sm:h-40 sm:w-40 min-[1280px]:max-[1365px]:h-32 min-[1280px]:max-[1365px]:w-32 min-[1366px]:max-[1537px]:h-36 min-[1366px]:max-[1537px]:w-36" />

                <div className="absolute -bottom-10 right-12 h-20 w-20 rounded-full bg-white/10 sm:-bottom-16 sm:right-24 sm:h-32 sm:w-32 min-[1280px]:max-[1365px]:h-28 min-[1280px]:max-[1365px]:w-28 min-[1366px]:max-[1537px]:h-30 min-[1366px]:max-[1537px]:w-30" />

                <div className="relative flex items-center justify-between gap-2 sm:gap-4">
                    {/* Welcome Content */}
                    <div className="flex min-w-0 items-center gap-2.5 sm:gap-4 min-[1280px]:max-[1365px]:gap-3 min-[1366px]:max-[1537px]:gap-3.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/20 bg-white/15 sm:h-12 sm:w-12 sm:rounded-xl min-[1280px]:max-[1365px]:h-10 min-[1280px]:max-[1365px]:w-10 min-[1366px]:max-[1537px]:h-11 min-[1366px]:max-[1537px]:w-11">
                            <Wrench size={18} className="sm:size-6 min-[1280px]:max-[1365px]:size-5 min-[1366px]:max-[1537px]:size-5" />
                        </div>

                        <div className="min-w-0">
                            <h1 className="truncate text-[15px] font-semibold leading-tight sm:text-xl min-[1280px]:max-[1365px]:text-lg min-[1366px]:max-[1537px]:text-lg">
                                Welcome back,{" "}
                                {user?.first_name ||
                                    user?.username ||
                                    "User"}
                                !
                            </h1>

                            <p className="mt-0.5 truncate text-[10px] leading-tight text-indigo-100 sm:mt-1 sm:text-sm min-[1280px]:max-[1365px]:text-[11px] min-[1366px]:max-[1537px]:text-xs">
                                Manage assigned tickets, department workload,
                                and SLA priorities.
                            </p>
                        </div>
                    </div>

                    {/* Role Badge */}
                    <div className="hidden shrink-0 items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 py-2 sm:flex min-[1280px]:max-[1365px]:gap-1.5 min-[1280px]:max-[1365px]:px-2.5 min-[1280px]:max-[1365px]:py-1.5 min-[1280px]:max-[1365px]:text-[11px] min-[1366px]:max-[1537px]:gap-1.5 min-[1366px]:max-[1537px]:px-2.5 min-[1366px]:max-[1537px]:py-1.5 min-[1366px]:max-[1537px]:text-xs">
                        <ShieldCheck size={16} className="min-[1280px]:max-[1365px]:size-3.5 min-[1366px]:max-[1537px]:size-3.5" />

                        <span className="text-xs font-medium">
                            IT Support Operations
                        </span>
                    </div>

                    {/* Mobile Role Icon */}
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/20 bg-white/10 sm:hidden">
                        <ShieldCheck size={14} />
                    </div>
                </div>
            </div>

            {/* Overview Cards */}
            <div className="p-3 sm:p-4 min-[1280px]:max-[1365px]:p-3 min-[1366px]:max-[1537px]:p-3.5">
                <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-4 min-[1280px]:max-[1365px]:gap-3 min-[1366px]:max-[1537px]:gap-4">
                    {cards.map((card) => {
                        const Icon = card.icon;

                        return (
                            <div
                                key={card.title}
                                className={`min-w-0 rounded-xl border border-gray-200 p-3 transition hover:shadow-md sm:p-4 ${card.hoverBorder} min-[1280px]:max-[1365px]:rounded-lg min-[1280px]:max-[1365px]:p-3 min-[1366px]:max-[1537px]:p-3.5`}
                            >
                                {/* Icon + Badge */}
                                <div className="flex items-center justify-between gap-2">
                                    <div
                                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full sm:h-10 sm:w-10 ${card.iconBg} min-[1280px]:max-[1365px]:h-9 min-[1280px]:max-[1365px]:w-9 min-[1366px]:max-[1537px]:h-9 min-[1366px]:max-[1537px]:w-9`}
                                    >
                                        <Icon
                                            size={16}
                                            className={`${card.iconColor} sm:hidden`}
                                        />

                                        <Icon
                                            size={18}
                                            className={`${card.iconColor} hidden sm:block`}
                                        />
                                    </div>

                                    <span
                                        className={`whitespace-nowrap rounded-md border px-1.5 py-0.5 text-[9px] font-semibold sm:rounded-lg sm:px-2 sm:py-1 sm:text-xs ${card.badgeBg} ${card.badgeColor} ${card.badgeBorder} min-[1280px]:max-[1365px]:px-1.5 min-[1280px]:max-[1365px]:py-0.5 min-[1280px]:max-[1365px]:text-[10px] min-[1366px]:max-[1537px]:px-1.5 min-[1366px]:max-[1537px]:py-0.5 min-[1366px]:max-[1537px]:text-[11px]`}
                                    >
                                        {card.badge}
                                    </span>
                                </div>

                                {/* Content */}
                                <p className="mt-3 truncate text-xs text-gray-500 sm:mt-5 sm:text-sm min-[1280px]:max-[1365px]:mt-4 min-[1280px]:max-[1365px]:text-[11px] min-[1366px]:max-[1537px]:mt-4 min-[1366px]:max-[1537px]:text-xs">
                                    {card.title}
                                </p>

                                <h2 className="mt-0.5 text-xl font-bold leading-tight text-gray-900 sm:mt-1 sm:text-2xl min-[1280px]:max-[1365px]:text-xl min-[1366px]:max-[1537px]:text-xl">
                                    {card.value}
                                </h2>

                                <p className="mt-1.5 hidden text-xs text-gray-400 sm:mt-2 sm:block min-[1280px]:max-[1365px]:text-[10px] min-[1366px]:max-[1537px]:text-[11px]">
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