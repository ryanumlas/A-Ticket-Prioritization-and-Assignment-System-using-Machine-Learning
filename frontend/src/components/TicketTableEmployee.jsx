import {
    MessageCircle,
    ChevronRight,
} from "lucide-react";
import { motion } from "motion/react";
import { formatDate } from "../utils/formatDate";
import { useNavigate } from "react-router-dom";
import { statusColor } from "../utils/statusColor";
import { priorityColor, priorityLabel } from "../utils/priority";

export default function TicketTableEmployee({
    loading = false,
    ticketList = [],
    maxRows = 15,
    dashboard = false,
}) {
    const navigate = useNavigate();

    const displayedTickets = dashboard
        ? ticketList.slice(0, maxRows)
        : ticketList;

    const getAssignedTo = (ticket) => {
        const assignedTo = ticket.assigned_to;

        if (!assignedTo) {
            return {
                name: "Not yet assigned",
                role: "",
            };
        }

        if (typeof assignedTo === "string") {
            return {
                name: assignedTo,
                role: "",
            };
        }

        const name =
            assignedTo.name ||
            `${assignedTo.first_name || ""} ${assignedTo.last_name || ""}`.trim() ||
            assignedTo.username ||
            "Not yet assigned";

        const role =
            assignedTo.role?.name ||
            assignedTo.role?.role_name ||
            assignedTo.role_name ||
            assignedTo.role ||
            "";

        return {
            name,
            role,
        };
    };

    const getInitials = (name) => {
        if (!name || name === "Not yet assigned") {
            return "NA";
        }

        return name
            .split(" ")
            .filter(Boolean)
            .map((part) => part[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();
    };

    const getStatusLabel = (status) => ({
        open: "Request Received",
        under_review: "Being Reviewed",
        returned: "Needs Attention",
        in_progress: "IT Is Working On It",
        resolved: "Issue Resolved",
        closed: "Completed",
        reopened: "Reopened",
        cancelled: "Cancelled",
    }[status] || status || "Unknown");

    const getStatusDescription = (status) => ({
        open: "Your request has been received and is waiting to be reviewed.",
        under_review:
            "Our IT team is reviewing your request before assigning it.",
        returned:
            "Your request needs additional information or attention.",
        in_progress:
            "Our IT team is currently working on your issue.",
        resolved:
            "Your issue has been marked as resolved. If the problem continues, you can request help again.",
        closed:
            "This ticket has been completed and is now closed.",
        reopened:
            "Your issue has been reopened and is being handled again.",
        cancelled:
            "This ticket has been cancelled.",
    }[status] || "Open this ticket to view more details about your request.");

    const cardVariants = {
        hidden: {
            opacity: 0,
            y: 12,
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.35,
                ease: "easeOut",
            },
        },
    };

    const contentVariants = {
        hidden: {
            opacity: 0,
        },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.3,
                delay: 0.08,
            },
        },
    };

    if (loading) {
        return (
            <div className="flex min-h-[240px] items-center justify-center bg-white">
                <p className="text-sm text-gray-500">
                    Loading tickets...
                </p>
            </div>
        );
    }

    return (
        <div
            className={
                dashboard
                    ? "h-[380px] overflow-y-auto bg-white px-5 py-4"
                    : "max-h-[637px] overflow-y-auto bg-white px-5 py-4 min-[1280px]:max-[1365px]:max-h-[450px] min-[1366px]:max-[1537px]:max-h-[500px] min-[1538px]:max-[1919px]:max-h-[580px] [&::-webkit-scrollbar]:w-px [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full"
            }
        >
            {displayedTickets.length > 0 ? (
                <div className="space-y-3.5">
                    {displayedTickets.map((ticket, index) => {
                        const unreadCount =
                            Number(ticket.unread_comment_count) || 0;

                        const hasUnread = unreadCount > 0;

                        const status = ticket.status || "";

                        const statusLabel =
                            getStatusLabel(status);

                        const statusDescription =
                            getStatusDescription(status);

                        const assignedTo =
                            getAssignedTo(ticket);

                        const initials =
                            getInitials(assignedTo.name);

                        const lastUpdated =
                            ticket.updated_at ||
                            ticket.created_at;

                        return (
                            <motion.div
                                key={ticket.id}
                                variants={cardVariants}
                                initial="hidden"
                                animate="visible"
                                transition={{
                                    delay: Math.min(index * 0.05, 0.3),
                                }}
                                whileHover={{
                                    y: -1,
                                    transition: {
                                        duration: 0.18,
                                    },
                                }}
                                onClick={() =>
                                    navigate(
                                        `/ticket/${ticket.id}`
                                    )
                                }
                                className={`
                                    group cursor-pointer rounded-xl border border-gray-200 bg-gray-50 px-6 py-5 shadow-sm transition-colors duration-200 hover:border-gray-300 hover:bg-white hover:shadow-md

                                    min-[1280px]:max-[1365px]:px-4
                                    min-[1280px]:max-[1365px]:py-3.5

                                    min-[1366px]:max-[1537px]:px-5
                                    min-[1366px]:max-[1537px]:py-4

                                    ${
                                        hasUnread
                                            ? "border-[#2563EB]/30 bg-[#2563EB]/[0.035]"
                                            : ""
                                    }
                                `}
                            >
                                {/* TOP SECTION */}
                                <div className="flex items-start justify-between gap-5">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex min-w-0 items-center gap-2.5">
                                            <motion.h3
                                                variants={contentVariants}
                                                initial="hidden"
                                                animate="visible"
                                                className={`
                                                    min-w-0 truncate text-base text-gray-900

                                                    min-[1280px]:max-[1365px]:text-[12px]
                                                    min-[1366px]:max-[1537px]:text-[13px]
                                                    min-[1538px]:text-base

                                                    ${
                                                        hasUnread
                                                            ? "font-semibold"
                                                            : "font-medium"
                                                    }
                                                `}
                                            >
                                                {ticket.subject ||
                                                    "Untitled ticket"}
                                            </motion.h3>

                                            {hasUnread && (
                                                <motion.div
                                                    className="relative shrink-0"
                                                    initial={{
                                                        opacity: 0,
                                                        scale: 0.7,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        scale: 1,
                                                    }}
                                                    transition={{
                                                        duration: 0.25,
                                                        delay: 0.15,
                                                    }}
                                                >
                                                    <MessageCircle
                                                        size={19}
                                                        className="text-[#2563EB]"
                                                    />

                                                    <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-semibold leading-none text-white">
                                                        {unreadCount >
                                                        99
                                                            ? "99+"
                                                            : unreadCount}
                                                    </span>
                                                </motion.div>
                                            )}
                                        </div>

                                        <motion.p
                                            variants={contentVariants}
                                            initial="hidden"
                                            animate="visible"
                                            className="
                                                mt-1 text-xs text-gray-500

                                                min-[1280px]:max-[1365px]:text-[9px]
                                                min-[1366px]:max-[1537px]:text-[10px]
                                            "
                                        >
                                            {ticket.ticket_code ||
                                                "-"}
                                        </motion.p>
                                    </div>

                                    {/* STATUS */}
                                    <motion.span
                                        initial={{
                                            opacity: 0,
                                            scale: 0.92,
                                        }}
                                        animate={{
                                            opacity: 1,
                                            scale: 1,
                                        }}
                                        transition={{
                                            duration: 0.25,
                                            delay: 0.1,
                                        }}
                                        className={`
                                            inline-flex shrink-0 items-center rounded-md border px-3 py-1.5 text-xs font-semibold leading-none

                                            min-[1280px]:max-[1365px]:px-2
                                            min-[1280px]:max-[1365px]:py-1
                                            min-[1280px]:max-[1365px]:text-[9px]

                                            min-[1366px]:max-[1537px]:px-2.5
                                            min-[1366px]:max-[1537px]:py-1.5
                                            min-[1366px]:max-[1537px]:text-[10px]

                                            ${
                                                statusColor[status] ||
                                                "border-gray-300 bg-gray-100 text-gray-700"
                                            }
                                        `}
                                    >
                                        {statusLabel}
                                    </motion.span>
                                </div>

                                {/* STATUS DESCRIPTION */}
                                <motion.p
                                    variants={contentVariants}
                                    initial="hidden"
                                    animate="visible"
                                    className="
                                        mt-3 max-w-[90%] text-sm leading-relaxed text-gray-600

                                        min-[1280px]:max-[1365px]:mt-2
                                        min-[1280px]:max-[1365px]:text-[10px]

                                        min-[1366px]:max-[1537px]:mt-2.5
                                        min-[1366px]:max-[1537px]:text-[11px]
                                    "
                                >
                                    {statusDescription}
                                </motion.p>

                                {/* BOTTOM METADATA */}
                                <motion.div
                                    variants={contentVariants}
                                    initial="hidden"
                                    animate="visible"
                                    className="
                                        mt-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-gray-200 pt-3

                                        min-[1280px]:max-[1365px]:mt-3
                                        min-[1280px]:max-[1365px]:gap-x-4
                                        min-[1280px]:max-[1365px]:pt-2

                                        min-[1366px]:max-[1537px]:mt-3.5
                                        min-[1366px]:max-[1537px]:gap-x-5
                                        min-[1366px]:max-[1537px]:pt-2.5
                                    "
                                >
                                    {/* ASSIGNED TO */}
                                    <div className="flex min-w-0 items-center gap-2">
                                        {/* BLUE INITIALS AVATAR */}
                                        <motion.div
                                            initial={{
                                                opacity: 0,
                                                scale: 0.7,
                                            }}
                                            animate={{
                                                opacity: 1,
                                                scale: 1,
                                            }}
                                            transition={{
                                                type: "spring",
                                                stiffness: 300,
                                                damping: 18,
                                                delay: 0.12,
                                            }}
                                            whileHover={{
                                                scale: 1.08,
                                                transition: {
                                                    duration: 0.15,
                                                },
                                            }}
                                            className="
                                                flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#2563EB] text-[11px] font-semibold text-white

                                                min-[1280px]:max-[1365px]:h-7
                                                min-[1280px]:max-[1365px]:w-7
                                                min-[1280px]:max-[1365px]:text-[9px]

                                                min-[1366px]:max-[1537px]:h-7
                                                min-[1366px]:max-[1537px]:w-7
                                                min-[1366px]:max-[1537px]:text-[10px]
                                            "
                                        >
                                            {initials}
                                        </motion.div>

                                        <div className="min-w-0">
                                            <p
                                                className="
                                                    text-[10px] text-gray-400

                                                    min-[1280px]:max-[1365px]:text-[8px]
                                                    min-[1366px]:max-[1537px]:text-[9px]
                                                "
                                            >
                                                Assigned to
                                            </p>

                                            <p
                                                className="
                                                    truncate text-sm font-medium text-gray-800

                                                    min-[1280px]:max-[1365px]:text-[10px]
                                                    min-[1366px]:max-[1537px]:text-[11px]
                                                "
                                                title={assignedTo.name}
                                            >
                                                {assignedTo.name}
                                            </p>
                                        </div>
                                    </div>

                                    {/* PRIORITY */}
                                    <div className="flex items-center gap-2">
                                        <span
                                            className="
                                                text-[10px] text-gray-400

                                                min-[1280px]:max-[1365px]:text-[8px]
                                                min-[1366px]:max-[1537px]:text-[9px]
                                            "
                                        >
                                            Priority
                                        </span>

                                        <motion.span
                                            initial={{
                                                opacity: 0,
                                                scale: 0.9,
                                            }}
                                            animate={{
                                                opacity: 1,
                                                scale: 1,
                                            }}
                                            transition={{
                                                duration: 0.25,
                                                delay: 0.15,
                                            }}
                                            className={`
                                                inline-flex rounded-md border px-2 py-1 text-xs font-semibold

                                                min-[1280px]:max-[1365px]:px-1.5
                                                min-[1280px]:max-[1365px]:py-0.5
                                                min-[1280px]:max-[1365px]:text-[9px]

                                                min-[1366px]:max-[1537px]:px-1.5
                                                min-[1366px]:max-[1537px]:py-0.5
                                                min-[1366px]:max-[1537px]:text-[10px]

                                                ${priorityColor[ticket.priority] || ""}
                                            `}
                                        >
                                            {priorityLabel[
                                                ticket.priority
                                            ] ||
                                                ticket.priority ||
                                                "-"}
                                        </motion.span>
                                    </div>

                                    {/* LAST UPDATED */}
                                    <div className="flex items-center gap-1.5">
                                        <span
                                            className="
                                                text-[10px] text-gray-400

                                                min-[1280px]:max-[1365px]:text-[8px]
                                                min-[1366px]:max-[1537px]:text-[9px]
                                            "
                                        >
                                            Updated
                                        </span>

                                        <span
                                            className="
                                                text-xs font-medium text-gray-600

                                                min-[1280px]:max-[1365px]:text-[9px]
                                                min-[1366px]:max-[1537px]:text-[10px]
                                            "
                                        >
                                            {lastUpdated
                                                ? formatDate(
                                                      lastUpdated
                                                  )
                                                : "-"}
                                        </span>
                                    </div>

                                    {/* VIEW TICKET */}
                                    <motion.div
                                        className="
                                            ml-auto flex shrink-0 items-center gap-1 text-sm font-medium text-[#2563EB] transition-colors group-hover:text-[#1D4ED8]

                                            min-[1280px]:max-[1365px]:text-[10px]
                                            min-[1366px]:max-[1537px]:text-[11px]
                                        "
                                    >
                                        <span>
                                            View Ticket
                                        </span>

                                        <motion.div
                                            whileHover={{
                                                x: 3,
                                            }}
                                            transition={{
                                                duration: 0.15,
                                            }}
                                        >
                                            <ChevronRight
                                                size={17}
                                                className="
                                                    min-[1280px]:max-[1365px]:h-3.5
                                                    min-[1280px]:max-[1365px]:w-3.5

                                                    min-[1366px]:max-[1537px]:h-4
                                                    min-[1366px]:max-[1537px]:w-4
                                                "
                                            />
                                        </motion.div>
                                    </motion.div>
                                </motion.div>
                            </motion.div>
                        );
                    })}
                </div>
            ) : (
                <motion.div
                    initial={{
                        opacity: 0,
                        y: 8,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                    }}
                    transition={{
                        duration: 0.3,
                    }}
                    className="flex min-h-[240px] items-center justify-center"
                >
                    <div className="text-center">
                        <p className="font-medium text-gray-900">
                            No tickets found
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                            There are currently no tickets to
                            display.
                        </p>
                    </div>
                </motion.div>
            )}
        </div>
    );
}