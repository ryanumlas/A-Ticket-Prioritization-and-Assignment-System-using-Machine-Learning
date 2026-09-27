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
import { formatDate } from "../../utils/formatDate";
import { getCurrentUser } from "../../utils/auth";
import { getHistoryColor } from "../../utils/historyColor";
import { getTicketPermissions } from "../../utils/getTicketPermission";
import CompleteEscalationModal from "../EscalatedTickets/CompleteEscalationModal";

export default function RightSidePanel({ ticketDetails, onTicketUpdated }) {
    const user = getCurrentUser();
    const permissions = getTicketPermissions(user);

    const {
        canEditStatus,
        canAcknowledgeEscalation,
        canCompleteEscalation,
    } = permissions;

    const escalation = ticketDetails?.escalation || null;

    const isEscalated = Boolean(
        ticketDetails?.is_escalated || escalation
    );

    const [status, setStatus] = useState(
        normalizeStatus(ticketDetails?.status)
    );

    const [showCompleteEscalation, setShowCompleteEscalation] =
        useState(false);

    const [history, setHistory] = useState([]);
    const [pendingStatus, setPendingStatus] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [remarks, setRemarks] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [isAcknowledging, setIsAcknowledging] = useState(false);
    const [activeTab, setActiveTab] = useState("history");

    const statusesWithRemarks = [
        "resolved",
        "reopened",
        "cancelled",
    ];

    const showRemarks = statusesWithRemarks.includes(
        pendingStatus
    );

    useEffect(() => {
        setStatus(
            normalizeStatus(ticketDetails?.status)
        );
    }, [ticketDetails?.status]);

    useEffect(() => {
        if (!ticketDetails?.id) return;

        fetchHistory();
    }, [ticketDetails?.id]);

    useEffect(() => {
        if (!isEscalated) {
            setActiveTab("history");
        }
    }, [isEscalated]);

    const fetchHistory = async () => {
        if (!ticketDetails?.id) return;

        try {
            setIsLoadingHistory(true);

            const response = await api.get(
                `/tickets/${ticketDetails.id}/history/`
            );

            const historyData = Array.isArray(response.data)
                ? response.data
                : response.data?.results ||
                  response.data?.history ||
                  [];

            setHistory(historyData);
        } catch {
            setHistory([]);
        } finally {
            setIsLoadingHistory(false);
        }
    };

    const latestHistoryId =
        history.length > 0
            ? history[0].id
            : null;

    const acknowledgementHistory = history.find(
        item => item.event_type === "ACKNOWLEDGED"
    );

    const completionHistory = history.find(
        item => item.event_type === "ESCALATION_COMPLETED"
    );

    const isAcknowledged =
        escalation?.status === "ACKNOWLEDGED" ||
        escalation?.status === "COMPLETED" ||
        Boolean(acknowledgementHistory);

    const isCompleted =
        escalation?.status === "COMPLETED" ||
        Boolean(completionHistory);

    const handleStatusChange = newStatus => {
        if (
            !canEditStatus ||
            newStatus === status
        ) {
            return;
        }

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
        if (
            !canEditStatus ||
            !pendingStatus
        ) {
            return;
        }

        const newStatus = pendingStatus;

        try {
            setIsUpdating(true);

            await api.patch(
                `/tickets/update-status/${ticketDetails.id}/`,
                {
                    status: newStatus,
                    remarks: showRemarks
                        ? remarks.trim()
                        : "",
                }
            );

            setStatus(newStatus);
            setShowConfirm(false);
            setPendingStatus(null);
            setRemarks("");

            await onTicketUpdated?.();
            await fetchHistory();
        } catch {
            setStatus(
                normalizeStatus(
                    ticketDetails?.status
                )
            );
        } finally {
            setIsUpdating(false);
        }
    };

    const handleAcknowledgeEscalation = async () => {
        if (
            !canAcknowledgeEscalation ||
            !ticketDetails?.id ||
            isAcknowledging ||
            !isEscalated ||
            isAcknowledged ||
            isCompleted
        ) {
            return;
        }

        try {
            setIsAcknowledging(true);

            await api.post(
                `/tickets/acknowledge-escalation/${ticketDetails.id}/`
            );

            await onTicketUpdated?.();
            await fetchHistory();
        } catch {
            // Keep the current escalation state visible.
        } finally {
            setIsAcknowledging(false);
        }
    };

    const handleOpenCompleteEscalation = () => {
        if (
            !isAcknowledged ||
            isCompleted
        ) {
            return;
        }

        setShowCompleteEscalation(true);
    };

    const handleCloseCompleteEscalation = () => {
        setShowCompleteEscalation(false);
    };

    const handleEscalationCompleted = async () => {
        setShowCompleteEscalation(false);

        await onTicketUpdated?.();
        await fetchHistory();
    };

    const getHistoryIcon = item => {
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
            item.event_type === "PRIORITY_REVIEW_REQUESTED"
        ) {
            return AlertTriangle;
        }

        if (
            item.event_type === "PRIORITY_CHANGED"
        ) {
            return AlertTriangle;
        }

        if (
            item.event_type === "PRIORITY_REJECTED"
        ) {
            return XCircle;
        }

        if (
            item.event_type === "ESCALATED"
        ) {
            return AlertTriangle;
        }

        if (
            item.event_type === "ACKNOWLEDGED"
        ) {
            return CheckCheck;
        }

        if (
            item.event_type === "ESCALATION_COMPLETED"
        ) {
            return CircleCheck;
        }

        if (
            item.event_type === "STATUS_CHANGED"
        ) {
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

    const getHistoryTitle = item => {
        if (item.title) {
            return item.title;
        }

        if (
            item.event_type === "CREATED"
        ) {
            return "Ticket Submitted";
        }

        if (
            item.event_type === "ASSIGNED"
        ) {
            return "Assigned";
        }

        if (
            item.event_type === "REASSIGNED"
        ) {
            return "Reassigned";
        }

        if (
            item.event_type === "RETURNED"
        ) {
            return "Returned to Service Desk";
        }

        if (
            item.event_type === "RETURN_APPROVED"
        ) {
            return "Return Approved";
        }

        if (
            item.event_type === "RETURN_REJECTED"
        ) {
            return "Return Rejected";
        }

        if (
            item.event_type === "REVIEW_COMPLETED"
        ) {
            return "Review Completed";
        }

        if (
            item.event_type === "PRIORITY_REVIEW" ||
            item.event_type === "PRIORITY_REVIEW_REQUESTED"
        ) {
            return "Priority Review Requested";
        }

        if (
            item.event_type === "PRIORITY_CHANGED"
        ) {
            return "Priority Changed";
        }

        if (
            item.event_type === "PRIORITY_REJECTED"
        ) {
            return "Priority Request Rejected";
        }

        if (
            item.event_type === "ESCALATED"
        ) {
            return "Escalated";
        }

        if (
            item.event_type === "ACKNOWLEDGED"
        ) {
            return "Escalation Acknowledged";
        }

        if (
            item.event_type === "ESCALATION_COMPLETED"
        ) {
            return "Escalation Completed";
        }

        if (
            item.event_type === "STATUS_CHANGED"
        ) {
            return formatStatus(
                item.new_value
            );
        }

        return formatStatus(
            item.event_type
        );
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

    return (
        <>
            <div className="flex h-full w-[350px] shrink-0 flex-col border-l border-gray-300 bg-white">
                <div className="shrink-0 border-b border-gray-200 px-6 py-4">
                    <div className="flex items-center gap-2">
                        <History
                            size={20}
                            className="text-[#2563EB]"
                        />

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
                                onChange={e =>
                                    handleStatusChange(
                                        e.target.value
                                    )
                                }
                                className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 pr-10 text-sm font-medium text-black outline-none transition-colors focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
                            >
                                <option value="open">
                                    Open
                                </option>

                                <option value="in_progress">
                                    In Progress
                                </option>

                                <option value="resolved">
                                    Resolved
                                </option>

                                <option value="closed">
                                    Closed
                                </option>

                                <option value="reopened">
                                    Reopened
                                </option>

                                <option value="cancelled">
                                    Cancelled
                                </option>
                            </select>

                            <ChevronDown
                                size={16}
                                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />
                        </div>
                    ) : (
                        <div className="mt-2">
                            <div className="flex w-full items-center rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5">
                                <span className="text-sm font-medium text-black">
                                    {formatStatus(
                                        ticketDetails?.status
                                    ) || "-"}
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

                {isEscalated && (
                    <div className="shrink-0 border-b border-gray-200 px-5 py-3">
                        <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1">
                            <button
                                type="button"
                                onClick={() =>
                                    setActiveTab("escalation")
                                }
                                className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition ${
                                    activeTab === "escalation"
                                        ? "bg-[#4C4CF9] text-white shadow-sm"
                                        : "text-gray-500 hover:bg-white hover:text-black"
                                }`}
                            >
                                <AlertTriangle size={14} />
                                Escalation
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    setActiveTab("history")
                                }
                                className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition ${
                                    activeTab === "history"
                                        ? "bg-[#4C4CF9] text-white shadow-sm"
                                        : "text-gray-500 hover:bg-white hover:text-black"
                                }`}
                            >
                                <History size={14} />
                                History
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === "history" && (
                    <div className="min-h-0 flex-1 overflow-y-auto p-5 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-gray-300">
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
                                <div className="absolute bottom-5 left-[15px] top-5 w-px bg-gray-200" />

                                {history.map(item => {
                                    const Icon =
                                        getHistoryIcon(item);

                                    const colorClass =
                                        getHistoryColor(item);

                                    return (
                                        <TimelineItem
                                            key={item.id}
                                            icon={Icon}
                                            title={getHistoryTitle(item)}
                                            description={
                                                item.message ||
                                                "Ticket was updated."
                                            }
                                            remarks={item.remarks}
                                            date={formatDate(
                                                item.created_at
                                            )}
                                            colorClass={colorClass}
                                            current={
                                                item.id ===
                                                latestHistoryId
                                            }
                                        />
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {isEscalated &&
                    activeTab === "escalation" && (
                        <EscalationContent
                            escalation={escalation}
                            acknowledgementHistory={
                                acknowledgementHistory
                            }
                            completionHistory={
                                completionHistory
                            }
                            isAcknowledged={
                                isAcknowledged
                            }
                            isCompleted={
                                isCompleted
                            }
                            canAcknowledgeEscalation={
                                canAcknowledgeEscalation
                            }
                            canCompleteEscalation={
                                canCompleteEscalation
                            }
                            isAcknowledging={
                                isAcknowledging
                            }
                            onAcknowledge={
                                handleAcknowledgeEscalation
                            }
                            onCompleteEscalation={
                                handleOpenCompleteEscalation
                            }
                        />
                    )}
            </div>

            <CompleteEscalationModal
                open={showCompleteEscalation}
                ticketId={ticketDetails?.id}
                onClose={
                    handleCloseCompleteEscalation
                }
                onSuccess={
                    handleEscalationCompleted
                }
            />

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
                                {formatStatus(
                                    pendingStatus
                                )}
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
                                    onChange={e =>
                                        setRemarks(
                                            e.target.value
                                        )
                                    }
                                    disabled={isUpdating}
                                    rows={4}
                                    maxLength={1000}
                                    placeholder={getRemarksPlaceholder()}
                                    className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-black outline-none transition-colors placeholder:text-gray-400 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 disabled:bg-gray-100"
                                />

                                <div className="mt-1 flex justify-between text-xs text-gray-400">
                                    <span>
                                        Add additional context if needed.
                                    </span>

                                    <span>
                                        {remarks.length}/1000
                                    </span>
                                </div>
                            </div>
                        )}

                        <div className="mt-5 flex justify-end gap-2">
                            <button
                                type="button"
                                disabled={isUpdating}
                                onClick={
                                    cancelStatusChange
                                }
                                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                disabled={isUpdating}
                                onClick={
                                    confirmStatusChange
                                }
                                className="rounded-lg bg-[#4C4CF9] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isUpdating
                                    ? "Updating..."
                                    : "Confirm"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

function EscalationContent({
    escalation,
    acknowledgementHistory,
    completionHistory,
    isAcknowledged,
    isCompleted,
    canAcknowledgeEscalation,
    canCompleteEscalation,
    isAcknowledging,
    onAcknowledge,
    onCompleteEscalation,
}) {
    const escalatedByName =
        escalation?.escalated_by_name ||
        "Unknown User";

    const escalatedByDepartment =
        escalation?.escalated_by_department ||
        "IT Department";

    const escalatedAt =
        escalation?.escalated_at || null;

    const acknowledgedByName =
        escalation?.acknowledged_by_name ||
        buildFullName(
            acknowledgementHistory?.changed_by_first_name ||
                acknowledgementHistory?.created_by_first_name,
            acknowledgementHistory?.changed_by_last_name ||
                acknowledgementHistory?.created_by_last_name
        );

    const acknowledgedAt =
        escalation?.acknowledged_at ||
        acknowledgementHistory?.created_at ||
        null;

    const completedByName =
        escalation?.resolved_by_name ||
        buildFullName(
            completionHistory?.changed_by_first_name ||
                completionHistory?.created_by_first_name,
            completionHistory?.changed_by_last_name ||
                completionHistory?.created_by_last_name
        );

    const completedAt =
        escalation?.resolved_at ||
        completionHistory?.created_at ||
        null;

    return (
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-gray-300">
            <div className="space-y-4">

                {/* Escalation Summary */}
                <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
                    <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-100">
                            <AlertTriangle
                                size={14}
                                strokeWidth={2}
                                className="text-orange-600"
                            />
                        </div>

                        <p className="text-sm font-semibold text-orange-800">
                            Escalated Ticket
                        </p>
                    </div>

                    <p className="mt-2 text-xs leading-5 text-orange-700">
                        This ticket has been escalated for Supervisor review and additional technical assistance.
                    </p>
                </div>

                {/* Escalation Information */}
                <div className="rounded-lg border border-gray-200 bg-white">
                    <div className="border-b border-gray-100 px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                            Escalation Information
                        </p>
                    </div>

                    <div className="space-y-4 p-4">
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                                Reason
                            </p>

                            <div className="mt-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
                                <p className="whitespace-pre-wrap break-words text-xs leading-5 text-gray-700">
                                    {escalation?.reason ||
                                        "Requires additional technical assistance and Supervisor review."}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="min-w-0">
                                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                                    Escalated By
                                </p>

                                <div className="mt-1.5">
                                    <p className="truncate text-xs font-semibold text-gray-800">
                                        {escalatedByName}
                                    </p>

                                    <p className="mt-0.5 truncate text-[11px] text-gray-500">
                                        {escalatedByDepartment}
                                    </p>
                                </div>
                            </div>

                            <div className="min-w-0">
                                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                                    Escalated At
                                </p>

                                <p className="mt-1.5 text-xs text-gray-700">
                                    {escalatedAt
                                        ? formatDate(escalatedAt)
                                        : "-"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Escalation Status */}
                <div>
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                            Escalation Status
                        </p>

                        {!isAcknowledged &&
                            !isCompleted && (
                                <span className="rounded-full border border-orange-200 bg-orange-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-orange-600">
                                    Pending
                                </span>
                            )}

                        {isAcknowledged &&
                            !isCompleted && (
                                <span className="rounded-full border border-green-200 bg-green-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-green-600">
                                    Acknowledged
                                </span>
                            )}

                        {isCompleted && (
                            <span className="rounded-full border border-green-200 bg-green-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-green-600">
                                Completed
                            </span>
                        )}
                    </div>

                    <div
                        className={`mt-2 rounded-lg border p-4 ${
                            isAcknowledged ||
                            isCompleted
                                ? "border-green-200 bg-green-50"
                                : "border-orange-200 bg-orange-50"
                        }`}
                    >
                        <div className="flex items-center gap-2.5">
                            <div
                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                                    isAcknowledged ||
                                    isCompleted
                                        ? "bg-green-100"
                                        : "bg-orange-100"
                                }`}
                            >
                                <CheckCheck
                                    size={15}
                                    strokeWidth={2}
                                    className={
                                        isAcknowledged ||
                                        isCompleted
                                            ? "text-green-600"
                                            : "text-orange-600"
                                    }
                                />
                            </div>

                            <p
                                className={`text-sm font-semibold ${
                                    isAcknowledged ||
                                    isCompleted
                                        ? "text-green-700"
                                        : "text-orange-700"
                                }`}
                            >
                                {isCompleted
                                    ? "Escalation Completed"
                                    : isAcknowledged
                                    ? "Escalation Acknowledged"
                                    : "Pending Supervisor Acknowledgement"}
                            </p>
                        </div>

                        {isCompleted ? (
                            <div className="mt-3 pl-10">
                                <p className="text-[10px] font-semibold uppercase tracking-wide text-green-600">
                                    COMPLETED BY
                                </p>

                                <div className="mt-1.5">
                                    <p className="text-xs font-semibold text-black">
                                        {completedByName || "IT Supervisor"}
                                    </p>

                                    {completedAt && (
                                        <p className="mt-0.5 text-[11px] text-gray-500">
                                            {formatDate(completedAt)}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ) : isAcknowledged ? (
                            <div className="mt-3 pl-10">
                                <p className="text-xs text-green-700">
                                    {acknowledgedByName
                                        ? `Acknowledged by ${acknowledgedByName}`
                                        : "Acknowledged by Supervisor"}
                                </p>

                                {acknowledgedAt && (
                                    <p className="mt-1 text-[11px] text-green-600">
                                        {formatDate(acknowledgedAt)}
                                    </p>
                                )}
                            </div>
                        ) : (
                            <p className="mt-3 pl-10 text-xs leading-5 text-orange-700">
                                This escalation is waiting for Supervisor acknowledgement.
                            </p>
                        )}
                    </div>

                    {canAcknowledgeEscalation &&
                        !isAcknowledged &&
                        !isCompleted && (
                            <button
                                type="button"
                                disabled={isAcknowledging}
                                onClick={onAcknowledge}
                                className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-[#4C4CF9] px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <CheckCheck size={17} />

                                {isAcknowledging
                                    ? "Acknowledging..."
                                    : "Acknowledge Escalation"}
                            </button>
                        )}

                    {canCompleteEscalation &&
                        isAcknowledged &&
                        !isCompleted && (
                            <button
                                type="button"
                                onClick={onCompleteEscalation}
                                className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-[#4C4CF9] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1D4ED8]"
                            >
                                <CircleCheck size={17} />

                                Complete Escalation
                            </button>
                        )}
                </div>

                {/* Escalation Resolution */}
                {isCompleted && (
                    <div>
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                Escalation Resolution
                            </p>

                            <span className="rounded-full border border-green-200 bg-green-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-green-600">
                                Completed
                            </span>
                        </div>

                        <div className="mt-2 rounded-lg border border-green-200 bg-green-50 p-4">
                            {/* Header */}
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100">
                                    <CircleCheck
                                        size={15}
                                        strokeWidth={2}
                                        className="text-green-600"
                                    />
                                </div>

                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-green-700">
                                        Escalation Completed
                                    </p>

                                    <p className="mt-0.5 text-xs text-green-700">
                                        The IT Supervisor has completed this escalation.
                                    </p>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="my-4 border-t border-green-200" />

                            {/* Resolution Details */}
                            <div className="space-y-3">

                                {escalation?.resolution_type_display && (
                                    <div>
                                        <p className="text-[10px] font-semibold uppercase tracking-wide text-green-600">
                                            Resolution Type
                                        </p>

                                        <div className="mt-1.5 rounded-md border border-green-200 bg-white px-3 py-2">
                                            <p className="text-xs font-medium text-black">
                                                {escalation.resolution_type_display}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {escalation?.resolution_remarks && (
                                    <div>
                                        <p className="text-[10px] font-semibold uppercase tracking-wide text-green-600">
                                            Resolution Remarks
                                        </p>

                                        <div className="mt-1.5 rounded-lg border border-green-200 bg-white px-3 py-2.5">
                                            <p className="whitespace-pre-wrap break-words text-xs leading-5 text-gray-700">
                                                {escalation.resolution_remarks}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-wide text-green-600">
                                        Completed By
                                    </p>

                                    <div className="mt-1.5">
                                        <p className="text-xs font-semibold text-black">
                                            {completedByName ||
                                                "IT Supervisor"}
                                        </p>

                                        {completedAt && (
                                            <p className="mt-0.5 text-[11px] text-gray-500">
                                                {formatDate(completedAt)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function TimelineItem({
    icon: Icon,
    title,
    description,
    remarks,
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
                <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-black">
                        {title}
                    </p>

                    {current && (
                        <span className="rounded-full bg-[#2563EB]/10 px-2 py-0.5 text-[10px] font-medium text-[#2563EB]">
                            Current
                        </span>
                    )}
                </div>

                {description && (
                    <p className="mt-1 text-xs leading-5 text-gray-500">
                        {description}
                    </p>
                )}

                {remarks?.trim() && (
                    <div className="mt-2 rounded-md border border-gray-200 bg-gray-50 px-2.5 py-2">
                        <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
                            Remarks
                        </p>

                        <p className="mt-1 whitespace-pre-wrap break-words text-xs leading-5 text-black">
                            {remarks}
                        </p>
                    </div>
                )}

                <p className="mt-2 text-[10px] text-gray-400">
                    {date}
                </p>
            </div>
        </div>
    );
}

function buildFullName(firstName, lastName) {
    return [firstName, lastName]
        .filter(Boolean)
        .join(" ")
        .trim();
}

function normalizeStatus(value) {
    if (!value) return "open";

    return String(value)
        .toLowerCase()
        .replace(/\s+/g, "_");
}

function formatStatus(value) {
    if (!value) return "-";

    return String(value)
        .replace(/_/g, " ")
        .replace(
            /\b\w/g,
            char => char.toUpperCase()
        );
}