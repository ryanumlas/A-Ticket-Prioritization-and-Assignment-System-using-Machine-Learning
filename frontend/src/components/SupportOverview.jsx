import {
    UserRoundCheck,
    Clock3,
    TriangleAlert,
    CircleCheckBig,
} from "lucide-react";

export default function SupportOverview() {
    // Static for now
    const overview = {
        assigned_tickets: 4,
        in_progress: 2,
        sla_at_risk: 1,
        resolved_today: 3,
    };

    const cards = [
        {
            title: "Assigned Tickets",
            value: overview.assigned_tickets,
            description: "Currently assigned to you",
            badge: "Active",
            icon: UserRoundCheck,

            iconBg: "bg-blue-50",
            iconColor: "text-blue-500",

            badgeBg: "bg-blue-50",
            badgeColor: "text-blue-600",
            badgeBorder: "border-blue-200",
        },
        {
            title: "In Progress",
            value: overview.in_progress,
            description: "Currently being worked on",
            badge: "Working",
            icon: Clock3,

            iconBg: "bg-purple-50",
            iconColor: "text-purple-500",

            badgeBg: "bg-purple-50",
            badgeColor: "text-purple-600",
            badgeBorder: "border-purple-200",
        },
        {
            title: "SLA At Risk",
            value: overview.sla_at_risk,
            description: "Requires immediate attention",
            badge: "Attention",
            icon: TriangleAlert,

            iconBg: "bg-red-50",
            iconColor: "text-red-500",

            badgeBg: "bg-red-50",
            badgeColor: "text-red-600",
            badgeBorder: "border-red-200",
        },
        {
            title: "Resolved Today",
            value: overview.resolved_today,
            description: "Successfully resolved today",
            badge: "Resolved",
            icon: CircleCheckBig,

            iconBg: "bg-green-50",
            iconColor: "text-green-500",

            badgeBg: "bg-green-50",
            badgeColor: "text-green-600",
            badgeBorder: "border-green-200",
        },
    ];

    return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map((card) => {
                const Icon = card.icon;

                return (
                    <div
                        key={card.title}
                        className="rounded-xl border border-gray-200 bg-white p-4"
                    >
                        {/* ICON + BADGE */}
                        <div className="flex items-start justify-between">
                            <div
                                className={`flex h-8 w-8 items-center justify-center rounded-full ${card.iconBg}`}
                            >
                                <Icon
                                    size={16}
                                    strokeWidth={2}
                                    className={card.iconColor}
                                />
                            </div>

                            <span
                                className={`
                                    rounded-md border px-2 py-1
                                    text-[10px] font-semibold
                                    ${card.badgeBg}
                                    ${card.badgeColor}
                                    ${card.badgeBorder}
                                `}
                            >
                                {card.badge}
                            </span>
                        </div>

                        {/* CONTENT */}
                        <div className="mt-4">
                            <p className="text-xs font-medium text-gray-500">
                                {card.title}
                            </p>

                            <p className="mt-1 text-2xl font-bold leading-none text-black">
                                {card.value}
                            </p>

                            <p className="mt-2 text-[11px] text-gray-400">
                                {card.description}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}