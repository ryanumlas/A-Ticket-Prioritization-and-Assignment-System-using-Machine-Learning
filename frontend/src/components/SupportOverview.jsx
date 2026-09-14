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
                const response = await api.get("/tickets/support-specialist/overview/");
                setOverviewData(response.data);
            } catch (error) {
                console.error(error);
            };
        };
        fetchOverviewData();
    }, []);


    const cards = [
        {
            title: "Assigned Tickets",
            value: overviewData?.assigned_tickets,
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
            value: overviewData?.open_tickets,
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
            value: overviewData?.in_progress,
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
            value: overviewData? ncy..sla_at_risk,
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

            {/* WELCOME HEADER */}
            <div className="relative overflow-hidden bg-gradient-to-r from-[#4C4CF9] to-[#6366F1] px-6 py-5 text-white">

                {/* Background decorations */}
                <div className="absolute -right-8 -top-10 h-40 w-40 rounded-full bg-white/10" />
                <div className="absolute -bottom-16 right-24 h-32 w-32 rounded-full bg-white/10" />

                <div className="relative flex items-center justify-between">

                    <div className="flex items-center gap-4">

                        {/* ROLE ICON */}
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/20 bg-white/15">
                            <Wrench size={24} />
                        </div>

                        <div>
                            <h1 className="text-xl font-semibold">
                                Welcome back,{" "}
                                {user?.first_name ||
                                    user?.username ||
                                    "User"}!
                            </h1>

                            <p className="mt-1 text-sm text-indigo-100">
                                Manage assigned tickets, department workload,
                                and SLA priorities.
                            </p>
                        </div>
                    </div>

                    {/* ROLE BADGE */}
                    <div className="hidden items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 py-2 md:flex">
                        <ShieldCheck size={16} />

                        <span className="text-xs font-medium">
                            IT Support Operations
                        </span>
                    </div>

                </div>
            </div>

            {/* OVERVIEW CARDS */}
            <div className="p-4">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

                    {cards.map((card) => {
                        const Icon = card.icon;

                        return (
                            <div
                                key={card.title}
                                className={`
                                    rounded-xl border border-gray-200 p-4
                                    transition hover:shadow-md
                                    ${card.hoverBorder}
                                `}
                            >
                                {/* ICON + BADGE */}
                                <div className="flex items-center justify-between">

                                    <div
                                        className={`
                                            flex h-10 w-10 items-center
                                            justify-center rounded-full
                                            ${card.iconBg}
                                        `}
                                    >
                                        <Icon
                                            size={18}
                                            className={card.iconColor}
                                        />
                                    </div>

                                    <span
                                        className={`
                                            rounded-lg border px-2 py-1
                                            text-xs font-semibold
                                            ${card.badgeBg}
                                            ${card.badgeColor}
                                            ${card.badgeBorder}
                                        `}
                                    >
                                        {card.badge}
                                    </span>

                                </div>

                                {/* CONTENT */}
                                <p className="mt-5 text-sm text-gray-500">
                                    {card.title}
                                </p>

                                <h2 className="mt-1 text-2xl font-bold text-gray-900">
                                    {card.value}
                                </h2>

                                <p className="mt-2 text-xs text-gray-400">
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