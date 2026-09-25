import {
    History,
    CircleCheck,
    UserCheck,
    Clock3,
    Circle,
    XCircle,
    Eye,
    Undo2,
    CheckCheck,
    RotateCcw,
    AlertTriangle,
    ArrowLeftRight,
} from "lucide-react";

import { formatDate } from "../utils/formatDate";
import { getHistoryColor } from "../utils/historyColor";

export default function RecentStatusHistory() {
    const history = [
        {
            id: 4,
            event_type: "STATUS_CHANGED",
            new_value: "in_progress",
            title: "In Progress",
            message: "Your ticket is currently being worked on.",
            created_at: "2026-09-24T14:32:00",
        },
        {
            id: 3,
            event_type: "ASSIGNED",
            title: "Assigned",
            message: "Your ticket was assigned to Adrian Santos.",
            created_at: "2026-09-24T14:18:00",
        },
        {
            id: 2,
            event_type: "STATUS_CHANGED",
            new_value: "open",
            title: "Open",
            message: "Your ticket is waiting to be processed.",
            created_at: "2026-09-24T13:45:00",
        },
        {
            id: 1,
            event_type: "CREATED",
            title: "Ticket Submitted",
            message:
                "Your support ticket was successfully submitted.",
            created_at: "2026-09-24T13:20:00",
        },
    ];

    const latestHistoryId =
        history.length > 0 ? history[0].id : null;

    const getHistoryIcon = (item) => {
        if (item.event_type === "CREATED") {
            return CircleCheck;
        }

        if (item.event_type === "ASSIGNED") {
            return UserCheck;
        }

        if (item.event_type === "REASSIGNED") {
            return ArrowLeftRight;
        }

        if (item.event_type === "RETURNED") {
            return Undo2;
        }

        if (item.event_type === "RETURN_APPROVED") {
            return CircleCheck;
        }

        if (item.event_type === "RETURN_REJECTED") {
            return XCircle;
        }

        if (item.event_type === "REVIEW_COMPLETED") {
            return CircleCheck;
        }

        if (
            item.event_type === "PRIORITY_REVIEW" ||
            item.event_type === "PRIORITY_CHANGED"
        ) {
            return AlertTriangle;
        }

        if (item.event_type === "PRIORITY_REJECTED") {
            return XCircle;
        }

        if (item.event_type === "ESCALATED") {
            return AlertTriangle;
        }

        if (item.event_type === "STATUS_CHANGED") {
            const newStatus = normalizeStatus(
                item.new_value
            );

            switch (newStatus) {
                case "open":
                    return Circle;

                case "under_review":
                    return Eye;

                case "in_progress":
                    return Clock3;

                case "returned":
                    return Undo2;

                case "resolved":
                    return CircleCheck;

                case "closed":
                    return CheckCheck;

                case "reopened":
                    return RotateCcw;

                case "cancelled":
                    return XCircle;

                default:
                    return Clock3;
            }
        }

        return Clock3;
    };

    const getHistoryTitle = (item) => {
        if (item.title) {
            return item.title;
        }

        if (item.event_type === "CREATED") {
            return "Ticket Submitted";
        }

        if (item.event_type === "ASSIGNED") {
            return "Assigned";
        }

        if (item.event_type === "REASSIGNED") {
            return "Reassigned";
        }

        if (item.event_type === "RETURNED") {
            return "Returned to Service Desk";
        }

        if (item.event_type === "RETURN_APPROVED") {
            return "Return Approved";
        }

        if (item.event_type === "RETURN_REJECTED") {
            return "Return Rejected";
        }

        if (item.event_type === "REVIEW_COMPLETED") {
            return "Review Completed";
        }

        if (item.event_type === "PRIORITY_REVIEW") {
            return "Priority Review Requested";
        }

        if (item.event_type === "PRIORITY_CHANGED") {
            return "Priority Changed";
        }

        if (item.event_type === "PRIORITY_REJECTED") {
            return "Priority Request Rejected";
        }

        if (item.event_type === "ESCALATED") {
            return "Escalated";
        }

        if (item.event_type === "STATUS_CHANGED") {
            return formatStatus(item.new_value);
        }

        return formatStatus(item.event_type);
    };

    return (
        <div className="flex h-full min-h-[320px] w-full flex-col rounded-xl border border-gray-300 bg-white">
            <div className="shrink-0 border-b border-gray-200 px-5 py-4 sm:px-6">
                <div className="flex items-center gap-2">
                    <History
                        size={20}
                        className="text-[#2563EB]"
                    />

                    <p className="font-semibold text-black">
                        Recent Status History
                    </p>
                </div>

                <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                    Track recent updates on your support requests.
                </p>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-gray-300">
                {history.length === 0 ? (
                    <div className="flex h-full min-h-[220px] items-center justify-center">
                        <p className="text-sm text-gray-500">
                            No recent status history available.
                        </p>
                    </div>
                ) : (
                    <div className="relative">
                        <div className="absolute bottom-5 left-[15px] top-5 w-px bg-gray-200" />

                        {history.map((item) => {
                            const Icon =
                                getHistoryIcon(item);

                            const colorClass =
                                getHistoryColor(item);

                            const current =
                                item.id === latestHistoryId;

                            return (
                                <TimelineItem
                                    key={item.id}
                                    icon={Icon}
                                    title={getHistoryTitle(item)}
                                    description={
                                        item.message ||
                                        "Ticket was updated."
                                    }
                                    date={formatDate(
                                        item.created_at
                                    )}
                                    colorClass={colorClass}
                                    current={current}
                                />
                            );
                        })}
                    </div>
                )}
            </div>

            <div className="shrink-0 border-t border-gray-200 px-5 py-3.5 sm:px-6">
                <button
                    type="button"
                    className="text-sm font-medium text-[#2563EB] transition-colors hover:text-[#1D4ED8]"
                >
                    View Full Status History
                </button>
            </div>
        </div>
    );
}

function TimelineItem({
    icon: Icon,
    title,
    description,
    date,
    colorClass,
    current = false,
}) {
    return (
        <div className="relative flex gap-3 pb-7 last:pb-0">
            <div
                className={`relative z-10 flex h-[31px] w-[31px] shrink-0 items-center justify-center rounded-full border ${colorClass} ${
                    current
                        ? "ring-4 ring-gray-200"
                        : ""
                }`}
            >
                <Icon
                    size={15}
                    strokeWidth={2.2}
                />
            </div>

            <div className="min-w-0 flex-1 pt-0.5">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                        <p className="truncate text-sm font-semibold text-black">
                            {title}
                        </p>

                        {current && (
                            <span className="shrink-0 rounded-full bg-[#2563EB]/10 px-2 py-0.5 text-[10px] font-medium text-[#2563EB]">
                                Current
                            </span>
                        )}
                    </div>

                    <span className="shrink-0 text-[11px] text-gray-400">
                        {date}
                    </span>
                </div>

                {description && (
                    <p className="mt-1 text-xs leading-5 text-gray-500">
                        {description}
                    </p>
                )}
            </div>
        </div>
    );
}

function formatStatus(value) {
    if (!value) return "";

    return String(value)
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(/\b\w/g, (letter) =>
            letter.toUpperCase()
        );
}

function normalizeStatus(value) {
    if (!value) return "";

    return String(value)
        .trim()
        .toLowerCase()
        .replaceAll(" ", "_");
}