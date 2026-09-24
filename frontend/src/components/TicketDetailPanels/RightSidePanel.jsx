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
    ChevronDown,
    RotateCcw,
    AlertTriangle,
    ArrowLeftRight,
} from "lucide-react";

import { useEffect, useState } from "react";

import api from "/src/api";
import { formatDate } from "/src/utils/formatDate";
import { getCurrentUser } from "/src/utils/auth";

export default function RightSidePanel({ ticketDetails, onTicketUpdated }) {
    const user = getCurrentUser();
    const canEditStatus = user?.role === "IT Support Specialist";

    const [status, setStatus] = useState(normalizeStatus(ticketDetails?.status));
    const [history, setHistory] = useState([]);
    const [pendingStatus, setPendingStatus] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [remarks, setRemarks] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    const statusesWithRemarks = ["resolved", "reopened", "cancelled"];
    const showRemarks = statusesWithRemarks.includes(pendingStatus);

    useEffect(() => {
        setStatus(normalizeStatus(ticketDetails?.status));
    }, [ticketDetails?.status]);

    useEffect(() => {
        if (!ticketDetails?.id) return;
        fetchHistory();
    }, [ticketDetails?.id]);

    const fetchHistory = async () => {
        if (!ticketDetails?.id) return;

        try {
            setIsLoadingHistory(true);

            const response = await api.get(`/tickets/${ticketDetails.id}/history/`);
            const historyData = Array.isArray(response.data) ? response.data : response.data?.results || response.data?.history || [];

            setHistory(historyData);
        } catch (error) {
            console.error("Failed to fetch ticket history:", error.response?.data || error);
            setHistory([]);
        } finally {
            setIsLoadingHistory(false);
        }
    };

    const handleStatusChange = (newStatus) => {
        if (!canEditStatus) return;
        if (newStatus === status) return;

        setPendingStatus(newStatus);
        setRemarks("");
        setShowConfirm(true);
    };

    const cancelStatusChange = () => {
        setPendingStatus(null);
        setRemarks("");
        setShowConfirm(false);
    };

    const confirmStatusChange = async () => {
        if (!canEditStatus || !pendingStatus) return;

        const newStatus = pendingStatus;

        try {
            setIsUpdating(true);

            await api.patch(`/tickets/update-status/${ticketDetails.id}/`, {
                status: newStatus,
                remarks: showRemarks ? remarks.trim() : "",
            });

            setStatus(newStatus);
            setShowConfirm(false);
            setPendingStatus(null);
            setRemarks("");

            await onTicketUpdated?.();
            await fetchHistory();
        } catch (error) {
            console.error("Failed to update ticket status:", error.response?.data || error);
        } finally {
            setIsUpdating(false);
        }
    };

    const getHistoryIcon = (item) => {
        if (item.event_type === "CREATED") return CircleCheck;
        if (item.event_type === "ASSIGNED") return UserCheck;
        if (item.event_type === "REASSIGNED") return ArrowLeftRight;
        if (item.event_type === "RETURNED") return Undo2;
        if (item.event_type === "REVIEW_COMPLETED") return CircleCheck;

        if (
            item.event_type === "PRIORITY_REVIEW" ||
            item.event_type === "PRIORITY_CHANGED" ||
            item.event_type === "ESCALATED"
        ) {
            return AlertTriangle;
        }

        if (item.event_type === "STATUS_CHANGED") {
            const newStatus = normalizeStatus(item.new_value);

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
        if (item.title) return item.title;
        if (item.event_type === "CREATED") return "Ticket Submitted";
        if (item.event_type === "ASSIGNED") return "Assigned";
        if (item.event_type === "REASSIGNED") return "Reassigned";
        if (item.event_type === "RETURNED") return "Returned to Service Desk";
        if (item.event_type === "REVIEW_COMPLETED") return "Review Completed";
        if (item.event_type === "PRIORITY_REVIEW") return "Priority Review Requested";
        if (item.event_type === "PRIORITY_CHANGED") return "Priority Changed";
        if (item.event_type === "ESCALATED") return "Escalated";
        if (item.event_type === "STATUS_CHANGED") return formatStatus(item.new_value);

        return formatStatus(item.event_type);
    };

    const getModalTitle = () => {
        switch (pendingStatus) {
            case "resolved":
                return "Resolve Ticket";
            case "reopened":
                return "Reopen Ticket";
            case "cancelled":
                return "Cancel Ticket";
            default:
                return "Update Ticket Status";
        }
    };

    const getRemarksLabel = () => {
        switch (pendingStatus) {
            case "resolved":
                return "Resolution Remarks";
            case "reopened":
                return "Reopening Reason";
            case "cancelled":
                return "Cancellation Reason";
            default:
                return "Remarks";
        }
    };

    const getRemarksPlaceholder = () => {
        switch (pendingStatus) {
            case "resolved":
                return "Describe how the issue was resolved...";
            case "reopened":
                return "Explain why the ticket is being reopened...";
            case "cancelled":
                return "Explain why the ticket is being cancelled...";
            default:
                return "Add remarks...";
        }
    };

    const latestHistoryId = history.length > 0 ? history[0].id : null;

    return (
        <>
            <div className="flex h-full w-[350px] shrink-0 flex-col border-l border-gray-300 bg-white">
                <div className="shrink-0 border-b border-gray-200  px-6 py-4">
                    <div className="flex items-center gap-2">
                        <History size={20} className="text-[#2563EB]" />

                        <p className="font-semibold text-black">
                            Status History
                        </p>
                    </div>

                    <p className="mt-1 text-xs text-gray-500">
                        {canEditStatus
                            ? "Track and manage the progress of this ticket."
                            : "Track the progress of this ticket."}
                    </p>
                </div>

                <div className="shrink-0 border-b border-gray-200 p-5">
                    <p className="text-xs font-medium uppercase text-gray-500">
                        Current Status
                    </p>

                    {canEditStatus ? (
                        <div className="relative mt-2">
                            <select
                                value={status}
                                disabled={isUpdating}
                                onChange={(e) => handleStatusChange(e.target.value)}
                                className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 pr-10 text-sm font-medium text-black outline-none transition-colors focus:border-[#4C4CF9] focus:ring-2 focus:ring-[#4C4CF9]/10 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
                            >
                                <option value="open">Open</option>
                                <option value="under_review">Under Review</option>
                                <option value="in_progress">In Progress</option>
                                <option value="returned">Returned</option>
                                <option value="resolved">Resolved</option>
                                <option value="closed">Closed</option>
                                <option value="reopened">Reopened</option>
                                <option value="cancelled">Cancelled</option>
                            </select>

                            <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                    ) : (
                        <div className="mt-2">
                            <div className="flex w-full items-center rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5">
                                <span className="text-sm font-medium text-black">
                                    {formatStatus(ticketDetails?.status) || "-"}
                                </span>
                            </div>
                        </div>
                    )}

                    <p className="mt-2 text-xs text-gray-500">
                        {history.length > 0
                            ? `Last updated ${formatDate(history[0].created_at)}`
                            : "No status history yet."}
                    </p>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto p-5 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-gray-300">
                    {isLoadingHistory ? (
                        <p className="text-sm text-gray-500">
                            Loading ticket history...
                        </p>
                    ) : history.length === 0 ? (
                        <p className="text-sm text-gray-500">
                            No ticket history available.
                        </p>
                    ) : (
                        <div className="relative">
                            <div className="absolute bottom-5 left-[15px] top-5 w-px bg-[#4C4CF9]" />

                            {history.map((item) => {
                                const Icon = getHistoryIcon(item);

                                return (
                                    <TimelineItem
                                        key={item.id}
                                        icon={Icon}
                                        title={getHistoryTitle(item)}
                                        description={item.message || "Ticket was updated."}
                                        remarks={item.remarks}
                                        date={formatDate(item.created_at)}
                                        active
                                        current={item.id === latestHistoryId}
                                    />
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {canEditStatus && showConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
                    <div className="w-full max-w-[430px] rounded-xl bg-white p-5 shadow-xl">
                        <p className="text-base font-semibold text-black">
                            {getModalTitle()}
                        </p>

                        <p className="mt-2 text-sm leading-6 text-gray-500">
                            Are you sure you want to change the ticket status from{" "}
                            <span className="font-semibold text-black">
                                {formatStatus(status)}
                            </span>{" "}
                            to{" "}
                            <span className="font-semibold text-black">
                                {formatStatus(pendingStatus)}
                            </span>
                            ?
                        </p>

                        {showRemarks && (
                            <div className="mt-4">
                                <label className="mb-1.5 block text-sm font-medium">
                                    {getRemarksLabel()}

                                    <span className="ml-1 font-normal text-gray-400">
                                        (Optional)
                                    </span>
                                </label>

                                <textarea
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                    disabled={isUpdating}
                                    rows={4}
                                    maxLength={1000}
                                    placeholder={getRemarksPlaceholder()}
                                    className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-black outline-none transition-colors placeholder:text-gray-400 focus:border-[#4C4CF9] focus:ring-2 focus:ring-[#4C4CF9]/10 disabled:bg-gray-100"
                                />

                                <div className="mt-1 flex justify-between text-xs text-gray-400">
                                    <span>Add additional context if needed.</span>
                                    <span>{remarks.length}/1000</span>
                                </div>
                            </div>
                        )}

                        <div className="mt-5 flex justify-end gap-2">
                            <button
                                type="button"
                                disabled={isUpdating}
                                onClick={cancelStatusChange}
                                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                disabled={isUpdating}
                                onClick={confirmStatusChange}
                                className="rounded-lg bg-[#4C4CF9] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#3f3fe0] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isUpdating ? "Updating..." : "Confirm"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

function TimelineItem({ icon: Icon, title, description, remarks, date, active = false, current = false }) {
    return (
        <div className="relative flex gap-3 pb-7 last:pb-0">
            <div
                className={`relative z-10 flex h-[31px] w-[31px] shrink-0 items-center justify-center rounded-full border ${
                    active
                        ? "border-[#4C4CF9] bg-[#4C4CF9] text-white"
                        : "border-gray-200 bg-white text-gray-400"
                } ${current ? "ring-4 ring-[#4C4CF9]/15" : ""}`}
            >
                <Icon size={15} strokeWidth={2.2} />
            </div>

            <div className="min-w-0 flex-1 pt-0.5">
                <div className="flex items-center gap-2">
                    <p className={`text-sm font-semibold ${active ? "text-black" : "text-gray-400"}`}>
                        {title}
                    </p>

                    {current && (
                        <span className="rounded-full bg-[#4C4CF9]/10 px-2 py-0.5 text-[10px] font-medium text-[#4C4CF9]">
                            Current
                        </span>
                    )}
                </div>

                {description && (
                    <p className={`mt-1 text-xs leading-5 ${active ? "text-gray-500" : "text-gray-400"}`}>
                        {description}
                    </p>
                )}

                {remarks && remarks.trim() && (
                    <div className="mt-2 rounded-md border border-gray-200 bg-gray-50 px-2.5 py-2">
                        <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
                            Remarks
                        </p>

                        <p className="mt-1 whitespace-pre-wrap break-words text-xs leading-5 text-black">
                            {remarks}
                        </p>
                    </div>
                )}

                <div className="mt-2 text-[11px] text-gray-400">
                    {date}
                </div>
            </div>
        </div>
    );
}

function formatStatus(value) {
    if (!value) return "";
    return String(value).replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function normalizeStatus(value) {
    if (!value) return "";
    return String(value).trim().toLowerCase().replaceAll(" ", "_");
}