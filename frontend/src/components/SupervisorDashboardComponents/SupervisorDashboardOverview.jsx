import { useCallback, useEffect, useState } from "react";

import {
    ClipboardList,
    AlertTriangle,
    Flag,
    CheckCircle2,
    ShieldCheck,
} from "lucide-react";

import { motion } from "motion/react";
import { toast } from "sonner";

import api from "../../api";
import { getCurrentUser } from "../../utils/auth";

export default function SupervisorDashboardOverview() {
    const user = getCurrentUser();

    const [overview, setOverview] = useState({
        active_tickets: 0,
        sla_breached: 0,
        escalated_tickets: 0,
        resolved_today: 0,
    });

    const [loading, setLoading] = useState(true);

    const fetchOverview = useCallback(async () => {
        try {
            setLoading(true);

            const response = await api.get(
                "/tickets/supervisor/dashboard/overview/"
            );

            setOverview({
                active_tickets:
                    response.data?.active_tickets ?? 0,

                sla_breached:
                    response.data?.sla_breached ?? 0,

                escalated_tickets:
                    response.data?.escalated_tickets ?? 0,

                resolved_today:
                    response.data?.resolved_today ?? 0,
            });
        } catch (error) {
            console.error(
                "Failed to load supervisor dashboard overview:",
                error
            );

            toast.error(
                "Failed to load dashboard overview."
            );

            setOverview({
                active_tickets: 0,
                sla_breached: 0,
                escalated_tickets: 0,
                resolved_today: 0,
            });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOverview();
    }, [fetchOverview]);

    const cards = [
        {
            title: "Active Tickets",
            value: overview.active_tickets,
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
            value: overview.sla_breached,
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
            value: overview.escalated_tickets,
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
            value: overview.resolved_today,
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
        <motion.div
            initial={{
                opacity: 0,
                y: 10,
            }}
            animate={{
                opacity: 1,
                y: 0,
            }}
            transition={{
                duration: 0.35,
                ease: "easeOut",
            }}
            className="
                w-full overflow-hidden
                rounded-xl
                border border-gray-300
                bg-white
            "
        >
            {/* WELCOME HEADER */}
            <div
                className="
                    relative overflow-hidden
                    bg-gradient-to-r
                    from-[#4C4CF9]
                    to-[#6366F1]
                    px-4 py-4
                    text-white
                    sm:px-6 sm:py-5
                "
            >
                {/* BACKGROUND DECORATIONS */}
                <motion.div
                    initial={{
                        opacity: 0,
                        scale: 0.8,
                    }}
                    animate={{
                        opacity: 1,
                        scale: 1,
                    }}
                    transition={{
                        duration: 0.7,
                    }}
                    className="
                        absolute
                        -right-8 -top-10
                        h-32 w-32
                        rounded-full
                        bg-white/10
                        sm:h-40 sm:w-40
                    "
                />

                <motion.div
                    initial={{
                        opacity: 0,
                        scale: 0.8,
                    }}
                    animate={{
                        opacity: 1,
                        scale: 1,
                    }}
                    transition={{
                        duration: 0.7,
                        delay: 0.1,
                    }}
                    className="
                        absolute
                        -bottom-14 right-12
                        h-28 w-28
                        rounded-full
                        bg-white/10
                        sm:right-24
                        sm:h-32 sm:w-32
                    "
                />

                <div
                    className="
                        relative
                        flex items-center
                        justify-between
                        gap-3
                    "
                >
                    {/* WELCOME CONTENT */}
                    <div
                        className="
                            flex min-w-0
                            items-center
                            gap-3
                            sm:gap-4
                        "
                    >
                        <motion.div
                            initial={{
                                opacity: 0,
                                scale: 0.85,
                            }}
                            animate={{
                                opacity: 1,
                                scale: 1,
                            }}
                            transition={{
                                duration: 0.35,
                                delay: 0.08,
                            }}
                            className="
                                flex h-10 w-10
                                shrink-0
                                items-center
                                justify-center
                                rounded-lg
                                border border-white/20
                                bg-white/15
                                sm:h-12 sm:w-12
                                sm:rounded-xl
                            "
                        >
                            <ShieldCheck
                                size={20}
                                className="sm:h-6 sm:w-6"
                            />
                        </motion.div>

                        <motion.div
                            initial={{
                                opacity: 0,
                                x: -8,
                            }}
                            animate={{
                                opacity: 1,
                                x: 0,
                            }}
                            transition={{
                                duration: 0.35,
                                delay: 0.1,
                            }}
                            className="min-w-0"
                        >
                            <h1
                                className="
                                    truncate
                                    text-base
                                    font-semibold
                                    sm:text-xl
                                "
                            >
                                Welcome back,{" "}
                                {user?.first_name ||
                                    user?.username ||
                                    "User"}
                                !
                            </h1>

                            <p
                                className="
                                    mt-0.5 truncate
                                    text-xs
                                    text-indigo-100
                                    sm:mt-1
                                    sm:text-sm
                                "
                            >
                                Monitor ticket activity, SLA performance,
                                and IT Support workload.
                            </p>
                        </motion.div>
                    </div>

                    {/* DESKTOP ROLE BADGE */}
                    <motion.div
                        initial={{
                            opacity: 0,
                            x: 8,
                        }}
                        animate={{
                            opacity: 1,
                            x: 0,
                        }}
                        transition={{
                            duration: 0.35,
                            delay: 0.15,
                        }}
                        className="
                            hidden shrink-0
                            items-center gap-2
                            rounded-lg
                            border border-white/20
                            bg-white/10
                            px-3 py-2
                            sm:flex
                        "
                    >
                        <ShieldCheck size={16} />

                        <span className="text-xs font-medium">
                            Supervisor Operations
                        </span>
                    </motion.div>

                    {/* MOBILE ROLE ICON */}
                    <div
                        className="
                            flex h-8 w-8
                            shrink-0
                            items-center
                            justify-center
                            rounded-lg
                            border border-white/20
                            bg-white/10
                            sm:hidden
                        "
                    >
                        <ShieldCheck size={16} />
                    </div>
                </div>
            </div>

            {/* OVERVIEW CARDS */}
            <div className="p-2.5 sm:p-4">
                <div
                    className="
                        grid grid-cols-2
                        gap-2.5
                        sm:grid-cols-2
                        sm:gap-5
                        xl:grid-cols-4
                    "
                >
                    {cards.map((card, index) => {
                        const Icon = card.icon;

                        return (
                            <motion.div
                                key={card.title}
                                initial={{
                                    opacity: 0,
                                    y: 14,
                                    scale: 0.98,
                                }}
                                animate={{
                                    opacity: 1,
                                    y: 0,
                                    scale: 1,
                                }}
                                transition={{
                                    duration: 0.35,
                                    delay:
                                        0.12 +
                                        index * 0.07,
                                    ease: "easeOut",
                                }}
                                whileHover={{
                                    y: -3,
                                }}
                                className={`
                                    min-w-0
                                    rounded-lg
                                    border border-gray-200
                                    p-3
                                    transition-colors
                                    sm:rounded-xl
                                    sm:p-4
                                    ${card.hoverBorder}
                                `}
                            >
                                {/* ICON + BADGE */}
                                <div
                                    className="
                                        flex items-center
                                        justify-between
                                        gap-2
                                    "
                                >
                                    <motion.div
                                        whileHover={{
                                            scale: 1.07,
                                        }}
                                        className={`
                                            flex h-8 w-8
                                            shrink-0
                                            items-center
                                            justify-center
                                            rounded-full
                                            sm:h-10 sm:w-10
                                            ${card.iconBg}
                                        `}
                                    >
                                        <Icon
                                            size={15}
                                            className={`
                                                ${card.iconColor}
                                                sm:hidden
                                            `}
                                        />

                                        <Icon
                                            size={18}
                                            className={`
                                                ${card.iconColor}
                                                hidden sm:block
                                            `}
                                        />
                                    </motion.div>

                                    <span
                                        className={`
                                            whitespace-nowrap
                                            rounded-md
                                            border
                                            px-1.5 py-0.5
                                            text-[9px]
                                            font-semibold
                                            sm:rounded-lg
                                            sm:px-2 sm:py-1
                                            sm:text-xs
                                            ${card.badgeBg}
                                            ${card.badgeColor}
                                            ${card.badgeBorder}
                                        `}
                                    >
                                        {card.badge}
                                    </span>
                                </div>

                                {/* CONTENT */}
                                <p
                                    className="
                                        mt-2.5 truncate
                                        text-[11px]
                                        text-gray-500
                                        sm:mt-5
                                        sm:text-sm
                                    "
                                >
                                    {card.title}
                                </p>

                                <motion.h2
                                    key={
                                        loading
                                            ? `${card.title}-loading`
                                            : `${card.title}-${card.value}`
                                    }
                                    initial={{
                                        opacity: 0,
                                        y: 4,
                                    }}
                                    animate={{
                                        opacity: 1,
                                        y: 0,
                                    }}
                                    transition={{
                                        duration: 0.25,
                                    }}
                                    className="
                                        mt-0.5
                                        text-xl
                                        font-bold
                                        leading-tight
                                        text-gray-900
                                        sm:mt-1
                                        sm:text-2xl
                                    "
                                >
                                    {loading
                                        ? "—"
                                        : card.value}
                                </motion.h2>

                                <p
                                    className="
                                        mt-1 hidden
                                        text-xs
                                        text-gray-400
                                        sm:mt-2
                                        sm:block
                                    "
                                >
                                    {card.description}
                                </p>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );
}