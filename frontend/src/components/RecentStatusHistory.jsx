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

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api";
import { formatDate } from "../utils/formatDate";
import { getHistoryColor } from "../utils/historyColor";

export default function RecentStatusHistory({ ticket }) {
    const navigate = useNavigate();

    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        const fetchHistory = async () => {
            if (!ticket?.id) {
                setHistory([]);
                setError("");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError("");

                const response = await api.get(
                    `/tickets/${ticket.id}/history/`
                );

                if (cancelled) {
                    return;
                }

                const historyData = Array.isArray(response.data)
                    ? response.data
                    : response.data?.results || [];

                setHistory(historyData);
            } catch (error) {
                if (cancelled) {
                    return;
                }

                console.error(
                    "Failed to fetch ticket status history:",
                    error
                );

                setHistory([]);
                setError(
                    "Unable to load the recent status history."
                );
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        fetchHistory();

        return () => {
            cancelled = true;
        };
    }, [ticket?.id]);

    const recentHistory = history.slice(0, 4);

    const latestHistoryId =
        recentHistory.length > 0
            ? recentHistory[0].id
            : null;

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

    const handleViewFullHistory = () => {
        if (!ticket?.id) {
            return;
        }

        navigate(`/ticket/${ticket.id}`);
    };

    return (
        <div className="flex h-full min-h-[320px] w-full flex-col rounded-xl border border-gray-300 bg-white">
            {/* Header */}
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
                    {ticket?.ticket_code
                        ? `Recent updates for ${ticket.ticket_code}.`
                        : "Track recent updates on your active support request."}
                </p>
            </div>

            {/* Content */}
            <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-gray-300">
                {loading ? (
                    <div className="flex h-full min-h-[220px] items-center justify-center">
                        <div className="flex flex-col items-center gap-3 text-center">
                            <Clock3
                                size={24}
                                className="animate-pulse text-gray-400"
                            />

                            <p className="text-sm text-gray-500">
                                Loading status history...
                            </p>
                        </div>
                    </div>
                ) : error ? (
                    <div className="flex h-full min-h-[220px] items-center justify-center">
                        <div className="max-w-sm text-center">
                            <AlertTriangle
                                size={24}
                                className="mx-auto text-red-500"
                            />

                            <p className="mt-3 text-sm font-medium text-gray-700">
                                {error}
                            </p>
                        </div>
                    </div>
                ) : !ticket ? (
                    <div className="flex h-full min-h-[220px] items-center justify-center">
                        <div className="max-w-sm text-center">
                            <History
                                size={24}
                                className="mx-auto text-gray-400"
                            />

                            <p className="mt-3 text-sm text-gray-500">
                                No active ticket status history
                                available.
                            </p>
                        </div>
                    </div>
                ) : recentHistory.length === 0 ? (
                    <div className="flex h-full min-h-[220px] items-center justify-center">
                        <div className="max-w-sm text-center">
                            <History
                                size={24}
                                className="mx-auto text-gray-400"
                            />

                            <p className="mt-3 text-sm text-gray-500">
                                No recent status history available.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="relative">
                        <div className="absolute bottom-5 left-[15px] top-5 w-px bg-gray-200" />

                        {recentHistory.map((item) => {
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
                                    title={getHistoryTitle(
                                        item
                                    )}
                                    description={
                                        item.message ||
                                        item.remarks ||
                                        "Ticket was updated."
                                    }
                                    date={formatDate(
                                        item.created_at
                                    )}
                                    colorClass={
                                        colorClass
                                    }
                                    current={current}
                                />
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="shrink-0 border-t border-gray-200 px-5 py-3.5 sm:px-6">
                <button
                    type="button"
                    onClick={handleViewFullHistory}
                    disabled={!ticket?.id}
                    className={`text-sm font-medium transition-colors ${
                        ticket?.id
                            ? "cursor-pointer text-[#2563EB] hover:text-[#1D4ED8]"
                            : "cursor-not-allowed text-gray-400"
                    }`}
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