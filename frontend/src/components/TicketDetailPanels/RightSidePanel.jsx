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

import {
    AnimatePresence,
    motion,
} from "motion/react";

import { useEffect, useState } from "react";

import api from "/src/api";
import { formatDate } from "../../utils/formatDate";
import { getCurrentUser } from "../../utils/auth";
import { getHistoryColor } from "../../utils/historyColor";
import { getTicketPermissions } from "../../utils/getTicketPermission";
import CompleteEscalationModal from "../EscalatedTickets/CompleteEscalationModal";


export default function RightSidePanel({
    ticketDetails,
    onTicketUpdated,
    canEditStatus: canEditStatusOverride,
}) {
    const user = getCurrentUser();
    const permissions = getTicketPermissions(user);

    const {
        canEditStatus: roleCanEditStatus,
        canAcknowledgeEscalation,
        canCompleteEscalation,
    } = permissions;

    const canEditStatus =
        canEditStatusOverride ?? roleCanEditStatus;

    const userRole = String(
        typeof user?.role === "object"
            ? user?.role?.name ||
                  user?.role?.role_name ||
                  user?.role?.label ||
                  ""
            : user?.role ||
                  user?.role_name ||
                  user?.user_role ||
                  ""
    )
        .trim()
        .toLowerCase()
        .replace(/[_-]+/g, " ")
        .replace(/\s+/g, " ");

    const isITSupportSpecialist =
        userRole === "it support specialist";

    const currentTicketStatus = normalizeStatus(
        ticketDetails?.status
    );

    const isInProgress =
        currentTicketStatus === "in_progress";

    const escalation =
        ticketDetails?.escalation || null;

    const isEscalated = Boolean(
        ticketDetails?.is_escalated || escalation
    );

    const [status, setStatus] = useState(
        normalizeStatus(ticketDetails?.status)
    );

    const [
        showCompleteEscalation,
        setShowCompleteEscalation,
    ] = useState(false);

    const [history, setHistory] = useState([]);
    const [pendingStatus, setPendingStatus] =
        useState(null);
    const [showConfirm, setShowConfirm] =
        useState(false);
    const [remarks, setRemarks] = useState("");
    const [remarksError, setRemarksError] =
        useState("");
    const [isUpdating, setIsUpdating] =
        useState(false);
    const [isLoadingHistory, setIsLoadingHistory] =
        useState(false);
    const [isAcknowledging, setIsAcknowledging] =
        useState(false);
    const [activeTab, setActiveTab] =
        useState("history");

    const statusesWithRemarks = [
        "resolved",
        "reopened",
        "cancelled",
    ];

    const showRemarks =
        statusesWithRemarks.includes(
            pendingStatus
        );

    useEffect(() => {
        setStatus(
            normalizeStatus(
                ticketDetails?.status
            )
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

            const historyData =
                Array.isArray(response.data)
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

    const acknowledgementHistory =
        history.find(
            item =>
                item.event_type ===
                "ACKNOWLEDGED"
        );

    const completionHistory =
        history.find(
            item =>
                item.event_type ===
                "ESCALATION_COMPLETED"
        );

    const isAcknowledged =
        escalation?.status ===
            "ACKNOWLEDGED" ||
        escalation?.status ===
            "COMPLETED" ||
        Boolean(acknowledgementHistory);

    const isCompleted =
        escalation?.status ===
            "COMPLETED" ||
        Boolean(completionHistory);

    const handleStatusChange = newStatus => {
        if (
            !canEditStatus ||
            isITSupportSpecialist ||
            newStatus === status
        ) {
            return;
        }

        setPendingStatus(newStatus);
        setRemarks("");
        setRemarksError("");
        setShowConfirm(true);
    };

    const handleMarkAsResolved = () => {
        if (
            !isITSupportSpecialist ||
            !isInProgress ||
            isUpdating
        ) {
            return;
        }

        setPendingStatus("resolved");
        setRemarks("");
        setRemarksError("");
        setShowConfirm(true);
    };

    const cancelStatusChange = () => {
        setPendingStatus(null);
        setRemarks("");
        setRemarksError("");
        setShowConfirm(false);
    };

    const confirmStatusChange = async () => {
        const isAllowedSupportResolution =
            isITSupportSpecialist &&
            pendingStatus === "resolved" &&
            isInProgress;

        if (
            isITSupportSpecialist
                ? !isAllowedSupportResolution
                : !canEditStatus
        ) {
            return;
        }

        if (!pendingStatus) {
            return;
        }

        const trimmedRemarks =
            remarks.trim();

        if (
            showRemarks &&
            !trimmedRemarks
        ) {
            setRemarksError(
                "Remarks are required."
            );
            return;
        }

        if (
            showRemarks &&
            trimmedRemarks.length < 50
        ) {
            setRemarksError(
                "Remarks must be at least 50 characters."
            );
            return;
        }

        setRemarksError("");

        const newStatus = pendingStatus;

        try {
            setIsUpdating(true);

            await api.patch(
                `/tickets/update-status/${ticketDetails.id}/`,
                {
                    status: newStatus,
                    remarks: showRemarks
                        ? trimmedRemarks
                        : "",
                }
            );

            setStatus(newStatus);
            setShowConfirm(false);
            setPendingStatus(null);
            setRemarks("");
            setRemarksError("");

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

    const handleAcknowledgeEscalation =
        async () => {
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

    const handleOpenCompleteEscalation =
        () => {
            if (
                !isAcknowledged ||
                isCompleted
            ) {
                return;
            }

            setShowCompleteEscalation(true);
        };

    const handleCloseCompleteEscalation =
        () => {
            setShowCompleteEscalation(false);
        };

    const handleEscalationCompleted =
        async () => {
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

        if (
            item.event_type ===
            "RETURN_APPROVED"
        ) {
            return CircleCheck;
        }

        if (
            item.event_type ===
            "RETURN_REJECTED"
        ) {
            return XCircle;
        }

        if (
            item.event_type ===
            "REVIEW_COMPLETED"
        ) {
            return CircleCheck;
        }

        if (
            item.event_type ===
                "PRIORITY_REVIEW" ||
            item.event_type ===
                "PRIORITY_REVIEW_REQUESTED"
        ) {
            return AlertTriangle;
        }

        if (
            item.event_type ===
            "PRIORITY_CHANGED"
        ) {
            return AlertTriangle;
        }

        if (
            item.event_type ===
            "PRIORITY_REJECTED"
        ) {
            return XCircle;
        }

        if (
            item.event_type === "ESCALATED"
        ) {
            return AlertTriangle;
        }

        if (
            item.event_type ===
            "ACKNOWLEDGED"
        ) {
            return CheckCheck;
        }

        if (
            item.event_type ===
            "ESCALATION_COMPLETED"
        ) {
            return CircleCheck;
        }

        if (
            item.event_type ===
            "STATUS_CHANGED"
        ) {
            const newStatus =
                normalizeStatus(
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

        if (item.event_type === "CREATED") {
            return "Ticket Submitted";
        }

        if (item.event_type === "ASSIGNED") {
            return "Assigned";
        }

        if (
            item.event_type === "REASSIGNED"
        ) {
            return "Reassigned";
        }

        if (item.event_type === "RETURNED") {
            return "Returned to Service Desk";
        }

        if (
            item.event_type ===
            "RETURN_APPROVED"
        ) {
            return "Return Approved";
        }

        if (
            item.event_type ===
            "RETURN_REJECTED"
        ) {
            return "Return Rejected";
        }

        if (
            item.event_type ===
            "REVIEW_COMPLETED"
        ) {
            return "Review Completed";
        }

        if (
            item.event_type ===
                "PRIORITY_REVIEW" ||
            item.event_type ===
                "PRIORITY_REVIEW_REQUESTED"
        ) {
            return "Priority Review Requested";
        }

        if (
            item.event_type ===
            "PRIORITY_CHANGED"
        ) {
            return "Priority Changed";
        }

        if (
            item.event_type ===
            "PRIORITY_REJECTED"
        ) {
            return "Priority Request Rejected";
        }

        if (
            item.event_type === "ESCALATED"
        ) {
            return "Escalated";
        }

        if (
            item.event_type ===
            "ACKNOWLEDGED"
        ) {
            return "Escalation Acknowledged";
        }

        if (
            item.event_type ===
            "ESCALATION_COMPLETED"
        ) {
            return "Escalation Completed";
        }

        if (
            item.event_type ===
            "STATUS_CHANGED"
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
            <motion.div
                initial={{
                    opacity: 0,
                    x: 16,
                }}
                animate={{
                    opacity: 1,
                    x: 0,
                }}
                transition={{
                    duration: 0.28,
                    ease: "easeOut",
                }}
                className="box-border flex h-full w-[350px] min-w-[350px] max-w-[350px] shrink-0 basis-[350px] flex-col overflow-hidden border-gray-300 bg-white min-[1280px]:max-[1535px]:w-[280px] min-[1280px]:max-[1535px]:min-w-[280px] min-[1280px]:max-[1535px]:max-w-[280px] min-[1280px]:max-[1535px]:basis-[280px]"
            >
                <motion.div
                    initial={{
                        opacity: 0,
                        y: -5,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                    }}
                    transition={{
                        duration: 0.25,
                        delay: 0.05,
                    }}
                    className="box-border h-auto shrink-0 border-b border-gray-200 px-4 py-4 2xl:px-6 min-[1280px]:max-[1535px]:h-[70px] min-[1280px]:max-[1535px]:px-4 min-[1280px]:max-[1535px]:py-3 min-[1536px]:max-[1599px]:h-[88px] min-[1600px]:max-[1920px]:h-[88px]"
                >
                    <div className="flex min-w-0 items-center gap-2">
                        <History
                            size={20}
                            className="shrink-0 text-[#2563EB] min-[1280px]:max-[1535px]:size-[18px]"
                        />

                        <p className="truncate font-semibold text-black min-[1280px]:max-[1535px]:text-[13px]">
                            Status History
                        </p>
                    </div>

                    <p className="text-xs leading-5 text-gray-500 min-[1280px]:max-[1535px]:text-[11px] min-[1280px]:max-[1535px]:leading-4">
                        {canEditStatus
                            ? "Track and manage the progress of this ticket."
                            : "Track the progress of this ticket."}
                    </p>
                </motion.div>

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
                        duration: 0.25,
                        delay: 0.1,
                    }}
                    className="shrink-0 border-b border-gray-200 px-4 py-4 2xl:p-5 min-[1280px]:max-[1535px]:px-4 min-[1280px]:max-[1535px]:py-3"
                >
                    <p className="text-xs font-medium uppercase text-gray-500 min-[1280px]:max-[1535px]:text-[10px]">
                        Current Status
                    </p>

                    {isITSupportSpecialist ? (
                        <div className="mt-2 min-[1280px]:max-[1535px]:mt-1.5">
                            {isInProgress ? (
                                <motion.button
                                    type="button"
                                    disabled={isUpdating}
                                    onClick={handleMarkAsResolved}
                                    whileHover={
                                        !isUpdating
                                            ? { y: -1 }
                                            : undefined
                                    }
                                    whileTap={
                                        !isUpdating
                                            ? { scale: 0.98 }
                                            : undefined
                                    }
                                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60 min-[1280px]:max-[1535px]:py-2 min-[1280px]:max-[1535px]:text-[12px]"
                                >
                                    <CircleCheck
                                        size={16}
                                        className="shrink-0 min-[1280px]:max-[1535px]:size-[14px]"
                                    />

                                    Mark as Resolved
                                </motion.button>
                            ) : (
                                <div className="flex w-full items-center rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 min-[1280px]:max-[1535px]:px-2.5 min-[1280px]:max-[1535px]:py-2">
                                    <span className="text-sm font-medium text-black min-[1280px]:max-[1535px]:text-[12px]">
                                        {formatStatus(
                                            ticketDetails?.status
                                        ) || "-"}
                                    </span>
                                </div>
                            )}
                        </div>
                    ) : canEditStatus ? (
                        <div className="relative mt-2 min-[1280px]:max-[1535px]:mt-1.5">
                            <select
                                value={status}
                                disabled={isUpdating}
                                onChange={e =>
                                    handleStatusChange(
                                        e.target.value
                                    )
                                }
                                className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 pr-10 text-sm font-medium text-black outline-none transition-colors focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 min-[1280px]:max-[1535px]:px-2.5 min-[1280px]:max-[1535px]:py-2 min-[1280px]:max-[1535px]:pr-8 min-[1280px]:max-[1535px]:text-[12px]"
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
                            </select>

                            <ChevronDown
                                size={16}
                                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 min-[1280px]:max-[1535px]:right-2.5 min-[1280px]:max-[1535px]:size-[14px]"
                            />
                        </div>
                    ) : (
                        <div className="mt-2 min-[1280px]:max-[1535px]:mt-1.5">
                            <div className="flex w-full items-center rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 min-[1280px]:max-[1535px]:px-2.5 min-[1280px]:max-[1535px]:py-2">
                                <span className="text-sm font-medium text-black min-[1280px]:max-[1535px]:text-[12px]">
                                    {formatStatus(
                                        ticketDetails?.status
                                    ) || "-"}
                                </span>
                            </div>
                        </div>
                    )}

                    <p className="mt-2 text-xs text-gray-500 min-[1280px]:max-[1535px]:mt-1.5 min-[1280px]:max-[1535px]:text-[10px]">
                        {history.length > 0
                            ? `Last updated ${formatDate(
                                  history[0].created_at
                              )}`
                            : "No status history yet."}
                    </p>
                </motion.div>

                <AnimatePresence initial={false}>
                    {isEscalated && (
                        <motion.div
                            initial={{
                                opacity: 0,
                                height: 0,
                            }}
                            animate={{
                                opacity: 1,
                                height: "auto",
                            }}
                            exit={{
                                opacity: 0,
                                height: 0,
                            }}
                            transition={{
                                duration: 0.22,
                                ease: "easeOut",
                            }}
                            className="shrink-0 overflow-hidden border-b border-gray-200 px-4 py-3 2xl:px-5 min-[1280px]:max-[1535px]:px-4 min-[1280px]:max-[1535px]:py-2.5"
                        >
                            <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1">
                                <motion.button
                                    type="button"
                                    onClick={() =>
                                        setActiveTab(
                                            "escalation"
                                        )
                                    }
                                    whileTap={{
                                        scale: 0.98,
                                    }}
                                    className={`flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-2 text-xs font-medium transition 2xl:gap-2 2xl:px-3 min-[1280px]:max-[1535px]:gap-1 min-[1280px]:max-[1535px]:px-1.5 min-[1280px]:max-[1535px]:py-1.5 min-[1280px]:max-[1535px]:text-[10px] ${
                                        activeTab ===
                                        "escalation"
                                            ? "bg-[#4C4CF9] text-white shadow-sm"
                                            : "text-gray-500 hover:bg-white hover:text-black"
                                    }`}
                                >
                                    <AlertTriangle
                                        size={14}
                                        className="shrink-0 min-[1280px]:max-[1535px]:size-[12px]"
                                    />

                                    <span className="truncate">
                                        Escalation
                                    </span>
                                </motion.button>

                                <motion.button
                                    type="button"
                                    onClick={() =>
                                        setActiveTab(
                                            "history"
                                        )
                                    }
                                    whileTap={{
                                        scale: 0.98,
                                    }}
                                    className={`flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-2 text-xs font-medium transition 2xl:gap-2 2xl:px-3 min-[1280px]:max-[1535px]:gap-1 min-[1280px]:max-[1535px]:px-1.5 min-[1280px]:max-[1535px]:py-1.5 min-[1280px]:max-[1535px]:text-[10px] ${
                                        activeTab ===
                                        "history"
                                            ? "bg-[#4C4CF9] text-white shadow-sm"
                                            : "text-gray-500 hover:bg-white hover:text-black"
                                    }`}
                                >
                                    <History
                                        size={14}
                                        className="shrink-0 min-[1280px]:max-[1535px]:size-[12px]"
                                    />

                                    <span className="truncate">
                                        History
                                    </span>
                                </motion.button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence
                    mode="wait"
                    initial={false}
                >
                    {activeTab === "history" && (
                        <motion.div
                            key="history"
                            initial={{
                                opacity: 0,
                                x: -6,
                            }}
                            animate={{
                                opacity: 1,
                                x: 0,
                            }}
                            exit={{
                                opacity: 0,
                                x: 6,
                            }}
                            transition={{
                                duration: 0.2,
                            }}
                            className="min-h-0 min-w-0 flex-1 overflow-y-auto px-4 py-5 2xl:p-5 min-[1280px]:max-[1535px]:px-4 min-[1280px]:max-[1535px]:py-4 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-gray-300"
                        >
                            {isLoadingHistory ? (
                                <motion.p
                                    initial={{
                                        opacity: 0,
                                    }}
                                    animate={{
                                        opacity: 1,
                                    }}
                                    className="text-sm text-gray-500 min-[1280px]:max-[1535px]:text-[12px]"
                                >
                                    Loading ticket history...
                                </motion.p>
                            ) : history.length ===
                              0 ? (
                                <motion.p
                                    initial={{
                                        opacity: 0,
                                    }}
                                    animate={{
                                        opacity: 1,
                                    }}
                                    className="text-sm text-gray-500 min-[1280px]:max-[1535px]:text-[12px]"
                                >
                                    No ticket history available.
                                </motion.p>
                            ) : (
                                <div className="relative min-w-0">
                                    <div className="absolute bottom-4 left-[15px] top-4 w-px bg-gray-200 min-[1280px]:max-[1535px]:left-[13px]" />

                                    {history.map(
                                        (
                                            item,
                                            index
                                        ) => {
                                            const Icon =
                                                getHistoryIcon(
                                                    item
                                                );

                                            const colorClass =
                                                getHistoryColor(
                                                    item
                                                );

                                            const hideRemarks =
                                                item.event_type ===
                                                    "ESCALATED" ||
                                                item.event_type ===
                                                    "ESCALATION_COMPLETED";

                                            return (
                                                <TimelineItem
                                                    key={
                                                        item.id
                                                    }
                                                    icon={
                                                        Icon
                                                    }
                                                    title={getHistoryTitle(
                                                        item
                                                    )}
                                                    description={
                                                        item.message ||
                                                        "Ticket was updated."
                                                    }
                                                    remarks={
                                                        hideRemarks
                                                            ? null
                                                            : item.remarks
                                                    }
                                                    date={formatDate(
                                                        item.created_at
                                                    )}
                                                    colorClass={
                                                        colorClass
                                                    }
                                                    current={
                                                        item.id ===
                                                        latestHistoryId
                                                    }
                                                    index={
                                                        index
                                                    }
                                                />
                                            );
                                        }
                                    )}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {isEscalated &&
                        activeTab ===
                            "escalation" && (
                            <motion.div
                                key="escalation"
                                initial={{
                                    opacity: 0,
                                    x: 6,
                                }}
                                animate={{
                                    opacity: 1,
                                    x: 0,
                                }}
                                exit={{
                                    opacity: 0,
                                    x: -6,
                                }}
                                transition={{
                                    duration: 0.2,
                                }}
                                className="min-h-0 min-w-0 flex flex-1 flex-col overflow-hidden"
                            >
                                <EscalationContent
                                    escalation={
                                        escalation
                                    }
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
                            </motion.div>
                        )}
                </AnimatePresence>
            </motion.div>

            <CompleteEscalationModal
                open={
                    showCompleteEscalation
                }
                ticketId={
                    ticketDetails?.id
                }
                onClose={
                    handleCloseCompleteEscalation
                }
                onSuccess={
                    handleEscalationCompleted
                }
            />

            <AnimatePresence>
                {showConfirm &&
                    (isITSupportSpecialist
                        ? pendingStatus ===
                              "resolved" &&
                          isInProgress
                        : canEditStatus) && (
                        <motion.div
                            initial={{
                                opacity: 0,
                            }}
                            animate={{
                                opacity: 1,
                            }}
                            exit={{
                                opacity: 0,
                            }}
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4"
                        >
                            <motion.div
                                initial={{
                                    opacity: 0,
                                    scale: 0.96,
                                    y: 10,
                                }}
                                animate={{
                                    opacity: 1,
                                    scale: 1,
                                    y: 0,
                                }}
                                exit={{
                                    opacity: 0,
                                    scale: 0.96,
                                    y: 10,
                                }}
                                transition={{
                                    duration: 0.2,
                                    ease: "easeOut",
                                }}
                                className="w-full max-w-[430px] rounded-xl bg-white p-5 shadow-xl min-[1280px]:max-[1535px]:max-w-[400px] min-[1280px]:max-[1535px]:p-4"
                            >
                                <p className="text-base font-semibold text-black min-[1280px]:max-[1535px]:text-sm">
                                    {getModalTitle()}
                                </p>

                                <p className="mt-2 text-sm leading-6 text-gray-500 min-[1280px]:max-[1535px]:text-[13px] min-[1280px]:max-[1535px]:leading-5">
                                    Are you sure you want to change the ticket status from{" "}
                                    <span className="font-semibold text-black">
                                        {formatStatus(
                                            status
                                        )}
                                    </span>{" "}
                                    to{" "}
                                    <span className="font-semibold text-black">
                                        {formatStatus(
                                            pendingStatus
                                        )}
                                    </span>
                                    ?
                                </p>

                                <AnimatePresence
                                    initial={false}
                                >
                                    {showRemarks && (
                                        <motion.div
                                            initial={{
                                                opacity: 0,
                                                height: 0,
                                                y: -5,
                                            }}
                                            animate={{
                                                opacity: 1,
                                                height: "auto",
                                                y: 0,
                                            }}
                                            exit={{
                                                opacity: 0,
                                                height: 0,
                                                y: -5,
                                            }}
                                            transition={{
                                                duration: 0.2,
                                            }}
                                            className="mt-4 min-[1280px]:max-[1535px]:mt-3"
                                        >
                                            <label className="mb-1.5 block text-sm font-medium min-[1280px]:max-[1535px]:text-[13px]">
                                                {getRemarksLabel()}

                                                <span className="ml-1 font-normal text-red-500">
                                                    *
                                                </span>
                                            </label>

                                            <textarea
                                                value={
                                                    remarks
                                                }
                                                onChange={e => {
                                                    const value =
                                                        e
                                                            .target
                                                            .value;

                                                    setRemarks(
                                                        value
                                                    );

                                                    if (
                                                        remarksError &&
                                                        value.trim()
                                                            .length >=
                                                            50
                                                    ) {
                                                        setRemarksError(
                                                            ""
                                                        );
                                                    }
                                                }}
                                                disabled={
                                                    isUpdating
                                                }
                                                required
                                                minLength={
                                                    50
                                                }
                                                maxLength={
                                                    1000
                                                }
                                                rows={4}
                                                placeholder={getRemarksPlaceholder()}
                                                aria-invalid={Boolean(
                                                    remarksError
                                                )}
                                                className={`w-full resize-none rounded-lg border px-3 py-2.5 text-sm text-black outline-none transition-colors placeholder:text-gray-400 focus:ring-2 min-[1280px]:max-[1535px]:px-2.5 min-[1280px]:max-[1535px]:py-2 min-[1280px]:max-[1535px]:text-[13px] ${
                                                    remarksError
                                                        ? "border-red-400 focus:border-red-500 focus:ring-red-500/10"
                                                        : "border-gray-300 focus:border-[#2563EB] focus:ring-[#2563EB]/10"
                                                } disabled:bg-gray-100`}
                                            />

                                            {remarksError && (
                                                <p className="mt-1.5 text-xs font-medium text-red-500 min-[1280px]:max-[1535px]:text-[11px]">
                                                    {
                                                        remarksError
                                                    }
                                                </p>
                                            )}

                                            <div className="mt-1 flex justify-between text-xs text-gray-400 min-[1280px]:max-[1535px]:text-[11px]">
                                                <span>
                                                    Minimum 50 characters required.
                                                </span>

                                                <span>
                                                    {
                                                        remarks.length
                                                    }
                                                    /1000
                                                </span>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="mt-5 flex justify-end gap-2 min-[1280px]:max-[1535px]:mt-4">
                                    <motion.button
                                        type="button"
                                        disabled={
                                            isUpdating
                                        }
                                        onClick={
                                            cancelStatusChange
                                        }
                                        whileHover={
                                            !isUpdating
                                                ? {
                                                      y: -1,
                                                  }
                                                : undefined
                                        }
                                        whileTap={
                                            !isUpdating
                                                ? {
                                                      scale: 0.98,
                                                  }
                                                : undefined
                                        }
                                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 min-[1280px]:max-[1535px]:px-3 min-[1280px]:max-[1535px]:py-1.5 min-[1280px]:max-[1535px]:text-[13px]"
                                    >
                                        Cancel
                                    </motion.button>

                                    <motion.button
                                        type="button"
                                        disabled={
                                            isUpdating
                                        }
                                        onClick={
                                            confirmStatusChange
                                        }
                                        whileHover={
                                            !isUpdating
                                                ? {
                                                      y: -1,
                                                  }
                                                : undefined
                                        }
                                        whileTap={
                                            !isUpdating
                                                ? {
                                                      scale: 0.98,
                                                  }
                                                : undefined
                                        }
                                        className="rounded-lg bg-[#4C4CF9] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-50 min-[1280px]:max-[1535px]:px-3 min-[1280px]:max-[1535px]:py-1.5 min-[1280px]:max-[1535px]:text-[13px]"
                                    >
                                        {isUpdating
                                            ? "Updating..."
                                            : "Confirm"}
                                    </motion.button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
            </AnimatePresence>
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
            acknowledgementHistory
                ?.changed_by_first_name ||
                acknowledgementHistory
                    ?.created_by_first_name,
            acknowledgementHistory
                ?.changed_by_last_name ||
                acknowledgementHistory
                    ?.created_by_last_name
        );

    const acknowledgedAt =
        escalation?.acknowledged_at ||
        acknowledgementHistory?.created_at ||
        null;

    const completedByName =
        escalation?.resolved_by_name ||
        buildFullName(
            completionHistory
                ?.changed_by_first_name ||
                completionHistory
                    ?.created_by_first_name,
            completionHistory
                ?.changed_by_last_name ||
                completionHistory
                    ?.created_by_last_name
        );

    const completedAt =
        escalation?.resolved_at ||
        completionHistory?.created_at ||
        null;

    return (
        <div className="h-full min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-4 py-5 2xl:px-5 min-[1280px]:max-[1535px]:px-4 min-[1280px]:max-[1535px]:py-4 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-gray-300">
            <div className="space-y-4 min-[1280px]:max-[1535px]:space-y-3">
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
                        duration: 0.22,
                    }}
                    className="rounded-lg border border-orange-200 bg-orange-50 p-3.5 2xl:p-4 min-[1280px]:max-[1535px]:p-3"
                >
                    <div className="flex min-w-0 items-center gap-2">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-100 min-[1280px]:max-[1535px]:h-6 min-[1280px]:max-[1535px]:w-6">
                            <AlertTriangle
                                size={14}
                                strokeWidth={2}
                                className="text-orange-600 min-[1280px]:max-[1535px]:size-[13px]"
                            />
                        </div>

                        <p className="min-w-0 text-sm font-semibold text-orange-800 min-[1280px]:max-[1535px]:text-[12px]">
                            Escalated Ticket
                        </p>
                    </div>

                    <p className="mt-2 text-xs leading-5 text-orange-700 min-[1280px]:max-[1535px]:mt-1.5 min-[1280px]:max-[1535px]:text-[10px] min-[1280px]:max-[1535px]:leading-4">
                        This ticket has been escalated for Supervisor review and additional technical assistance.
                    </p>
                </motion.div>

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
                        duration: 0.22,
                        delay: 0.04,
                    }}
                    className="min-w-0 rounded-lg border border-gray-200 bg-white"
                >
                    <div className="border-b border-gray-100 px-3.5 py-3 2xl:px-4 min-[1280px]:max-[1535px]:px-3 min-[1280px]:max-[1535px]:py-2.5">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 min-[1280px]:max-[1535px]:text-[10px]">
                            Escalation Information
                        </p>
                    </div>

                    <div className="space-y-4 p-3.5 2xl:p-4 min-[1280px]:max-[1535px]:space-y-3 min-[1280px]:max-[1535px]:p-3">
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                                Reason
                            </p>

                            <div className="mt-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 min-[1280px]:max-[1535px]:mt-1 min-[1280px]:max-[1535px]:px-2.5 min-[1280px]:max-[1535px]:py-2">
                                <p className="whitespace-pre-wrap break-words text-sm leading-5 text-black min-[1280px]:max-[1535px]:text-[12px] min-[1280px]:max-[1535px]:leading-4">
                                    {escalation?.reason ||
                                        "Requires additional technical assistance and Supervisor review."}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 2xl:grid-cols-2 min-[1280px]:max-[1535px]:gap-3">
                            <div className="min-w-0">
                                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                                    Escalated By
                                </p>

                                <div className="mt-1.5 min-w-0 min-[1280px]:max-[1535px]:mt-1">
                                    <p className="break-words text-sm font-semibold text-gray-800 min-[1280px]:max-[1535px]:text-[12px]">
                                        {escalatedByName}
                                    </p>

                                    <p className="mt-0.5 break-words text-xs text-gray-500 min-[1280px]:max-[1535px]:text-[10px]">
                                        {escalatedByDepartment}
                                    </p>
                                </div>
                            </div>

                            <div className="min-w-0">
                                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                                    Escalated At
                                </p>

                                <p className="mt-1.5 text-xs leading-5 text-gray-700 min-[1280px]:max-[1535px]:mt-1 min-[1280px]:max-[1535px]:text-[10px] min-[1280px]:max-[1535px]:leading-4">
                                    {escalatedAt
                                        ? formatDate(
                                              escalatedAt
                                          )
                                        : "-"}
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

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
                        duration: 0.22,
                        delay: 0.08,
                    }}
                >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 min-[1280px]:max-[1535px]:text-[10px]">
                            Escalation Status
                        </p>

                        {!isAcknowledged &&
                            !isCompleted && (
                                <span className="shrink-0 rounded-full border border-orange-200 bg-orange-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-orange-600 min-[1280px]:max-[1535px]:px-1.5 min-[1280px]:max-[1535px]:py-0.5 min-[1280px]:max-[1535px]:text-[8px]">
                                    Pending
                                </span>
                            )}

                        {isAcknowledged &&
                            !isCompleted && (
                                <span className="shrink-0 rounded-full border border-green-200 bg-green-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-green-600 min-[1280px]:max-[1535px]:px-1.5 min-[1280px]:max-[1535px]:py-0.5 min-[1280px]:max-[1535px]:text-[8px]">
                                    Acknowledged
                                </span>
                            )}

                        {isCompleted && (
                            <span className="shrink-0 rounded-full border border-green-200 bg-green-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-green-600 min-[1280px]:max-[1535px]:px-1.5 min-[1280px]:max-[1535px]:py-0.5 min-[1280px]:max-[1535px]:text-[8px]">
                                Completed
                            </span>
                        )}
                    </div>

                    <div
                        className={`mt-2 rounded-lg border p-3.5 2xl:p-4 min-[1280px]:max-[1535px]:mt-1.5 min-[1280px]:max-[1535px]:p-3 ${
                            isAcknowledged ||
                            isCompleted
                                ? "border-green-200 bg-green-50"
                                : "border-orange-200 bg-orange-50"
                        }`}
                    >
                        <div className="flex min-w-0 items-center gap-2.5 min-[1280px]:max-[1535px]:gap-2">
                            <div
                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full min-[1280px]:max-[1535px]:h-7 min-[1280px]:max-[1535px]:w-7 ${
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
                                            ? "text-green-600 min-[1280px]:max-[1535px]:size-[14px]"
                                            : "text-orange-600 min-[1280px]:max-[1535px]:size-[14px]"
                                    }
                                />
                            </div>

                            <p
                                className={`min-w-0 text-sm font-semibold leading-5 min-[1280px]:max-[1535px]:text-[12px] ${
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
                            <div className="mt-3 pl-10 min-[1280px]:max-[1535px]:mt-2 min-[1280px]:max-[1535px]:pl-9">
                                <p className="text-[10px] font-semibold uppercase tracking-wide text-green-600">
                                    COMPLETED BY
                                </p>

                                <div className="mt-1.5 min-[1280px]:max-[1535px]:mt-1">
                                    <p className="break-words text-sm font-semibold text-black min-[1280px]:max-[1535px]:text-[10px]">
                                        {completedByName ||
                                            "IT Supervisor"}
                                    </p>

                                    {completedAt && (
                                        <p className="mt-0.5 text-[10px] text-gray-500">
                                            {formatDate(
                                                completedAt
                                            )}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ) : isAcknowledged ? (
                            <div className="mt-3 pl-10 min-[1280px]:max-[1535px]:mt-2 min-[1280px]:max-[1535px]:pl-9">
                                <p className="break-words text-sm text-green-700 min-[1280px]:max-[1535px]:text-[10px]">
                                    {acknowledgedByName
                                        ? `Acknowledged by ${acknowledgedByName}`
                                        : "Acknowledged by Supervisor"}
                                </p>

                                {acknowledgedAt && (
                                    <p className="mt-1 text-[10px] text-green-600">
                                        {formatDate(
                                            acknowledgedAt
                                        )}
                                    </p>
                                )}
                            </div>
                        ) : (
                            <p className="mt-3 pl-10 text-xs leading-5 text-orange-700 min-[1280px]:max-[1535px]:mt-2 min-[1280px]:max-[1535px]:pl-9 min-[1280px]:max-[1535px]:text-[10px] min-[1280px]:max-[1535px]:leading-4">
                                This escalation is waiting for Supervisor acknowledgement.
                            </p>
                        )}
                    </div>

                    {canAcknowledgeEscalation &&
                        !isAcknowledged &&
                        !isCompleted && (
                            <motion.button
                                type="button"
                                disabled={
                                    isAcknowledging
                                }
                                onClick={
                                    onAcknowledge
                                }
                                whileHover={
                                    !isAcknowledging
                                        ? {
                                              y: -1,
                                          }
                                        : undefined
                                }
                                whileTap={
                                    !isAcknowledging
                                        ? {
                                              scale: 0.98,
                                          }
                                        : undefined
                                }
                                className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-[#4C4CF9] px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-60 min-[1280px]:max-[1535px]:mt-2 min-[1280px]:max-[1535px]:px-3 min-[1280px]:max-[1535px]:py-2 min-[1280px]:max-[1535px]:text-[12px]"
                            >
                                <motion.span
                                    animate={
                                        isAcknowledging
                                            ? {
                                                  rotate: 360,
                                              }
                                            : {
                                                  rotate: 0,
                                              }
                                    }
                                    transition={
                                        isAcknowledging
                                            ? {
                                                  repeat: Infinity,
                                                  duration: 0.9,
                                                  ease: "linear",
                                              }
                                            : {
                                                  duration: 0.15,
                                              }
                                    }
                                >
                                    <CheckCheck
                                        size={17}
                                        className="min-[1280px]:max-[1535px]:size-[14px]"
                                    />
                                </motion.span>

                                {isAcknowledging
                                    ? "Acknowledging..."
                                    : "Acknowledge Escalation"}
                            </motion.button>
                        )}

                    {canCompleteEscalation &&
                        isAcknowledged &&
                        !isCompleted && (
                            <motion.button
                                type="button"
                                onClick={
                                    onCompleteEscalation
                                }
                                whileHover={{
                                    y: -1,
                                }}
                                whileTap={{
                                    scale: 0.98,
                                }}
                                className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-[#4C4CF9] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1D4ED8] min-[1280px]:max-[1535px]:mt-2 min-[1280px]:max-[1535px]:px-3 min-[1280px]:max-[1535px]:py-2 min-[1280px]:max-[1535px]:text-[12px]"
                            >
                                <CircleCheck
                                    size={17}
                                    className="min-[1280px]:max-[1535px]:size-[14px]"
                                />

                                Complete Escalation
                            </motion.button>
                        )}
                </motion.div>

                <AnimatePresence initial={false}>
                    {isCompleted && (
                        <motion.div
                            initial={{
                                opacity: 0,
                                height: 0,
                                y: 8,
                            }}
                            animate={{
                                opacity: 1,
                                height: "auto",
                                y: 0,
                            }}
                            exit={{
                                opacity: 0,
                                height: 0,
                                y: 8,
                            }}
                            transition={{
                                duration: 0.25,
                                ease: "easeOut",
                            }}
                        >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 min-[1280px]:max-[1535px]:text-[10px]">
                                    Escalation Resolution
                                </p>

                                <span className="shrink-0 rounded-full border border-green-200 bg-green-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-green-600 min-[1280px]:max-[1535px]:px-1.5 min-[1280px]:max-[1535px]:py-0.5 min-[1280px]:max-[1535px]:text-[8px]">
                                    Completed
                                </span>
                            </div>

                            <div className="mt-2 rounded-lg border border-green-200 bg-green-50 p-3.5 2xl:p-4 min-[1280px]:max-[1535px]:mt-1.5 min-[1280px]:max-[1535px]:p-3">
                                <div className="flex min-w-0 items-center gap-2.5 min-[1280px]:max-[1535px]:gap-2">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 min-[1280px]:max-[1535px]:h-7 min-[1280px]:max-[1535px]:w-7">
                                        <CircleCheck
                                            size={15}
                                            strokeWidth={2}
                                            className="text-green-600 min-[1280px]:max-[1535px]:size-[14px]"
                                        />
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-green-700 min-[1280px]:max-[1535px]:text-[12px]">
                                            Escalation Completed
                                        </p>

                                        <p className="mt-0.5 text-xs leading-5 text-green-700 min-[1280px]:max-[1535px]:text-[10px] min-[1280px]:max-[1535px]:leading-4">
                                            The IT Supervisor has completed this escalation.
                                        </p>
                                    </div>
                                </div>

                                <div className="my-4 border-t border-green-200 min-[1280px]:max-[1535px]:my-2.5" />

                                <div className="space-y-3 min-[1280px]:max-[1535px]:space-y-2.5">
                                    {escalation?.resolution_type_display && (
                                        <div>
                                            <p className="text-[10px] font-semibold uppercase tracking-wide text-green-600">
                                                Resolution Type
                                            </p>

                                            <div className="mt-1.5 rounded-md border border-green-200 bg-white px-3 py-2 min-[1280px]:max-[1535px]:mt-1 min-[1280px]:max-[1535px]:px-2.5 min-[1280px]:max-[1535px]:py-1.5">
                                                <p className="break-words text-sm font-medium text-black min-[1280px]:max-[1535px]:text-[10px]">
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

                                            <div className="mt-1.5 rounded-lg border border-green-200 bg-white px-3 py-2.5 min-[1280px]:max-[1535px]:mt-1 min-[1280px]:max-[1535px]:px-2.5 min-[1280px]:max-[1535px]:py-2">
                                                <p className="whitespace-pre-wrap break-words text-sm leading-5 text-black min-[1280px]:max-[1535px]:text-[12px] min-[1280px]:max-[1535px]:leading-4">
                                                    {escalation.resolution_remarks}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <p className="text-[10px] font-semibold uppercase tracking-wide text-green-600">
                                            Completed By
                                        </p>

                                        <div className="mt-1.5 min-[1280px]:max-[1535px]:mt-1">
                                            <p className="break-words text-sm font-semibold text-black min-[1280px]:max-[1535px]:text-[10px]">
                                                {completedByName ||
                                                    "IT Supervisor"}
                                            </p>

                                            {completedAt && (
                                                <p className="mt-0.5 text-[10px] text-gray-500">
                                                    {formatDate(
                                                        completedAt
                                                    )}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
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
    index = 0,
}) {
    return (
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
                duration: 0.22,
                delay: Math.min(index * 0.035, 0.2),
                ease: "easeOut",
            }}
            className="relative flex min-w-0 gap-3 pb-7 last:pb-0 min-[1280px]:max-[1535px]:gap-2.5 min-[1280px]:max-[1535px]:pb-5"
        >
            <div
                className={`relative z-10 flex h-[31px] w-[31px] shrink-0 items-center justify-center rounded-full border ${colorClass} ${
                    current
                        ? "ring-4 ring-gray-200"
                        : ""
                } min-[1280px]:max-[1535px]:h-7 min-[1280px]:max-[1535px]:w-7`}
            >
                <Icon
                    size={15}
                    strokeWidth={2.2}
                    className="min-[1280px]:max-[1535px]:size-[13px]"
                />
            </div>

            <div className="min-w-0 flex-1 pt-0.5">
                <div className="flex min-w-0 flex-wrap items-center gap-2 min-[1280px]:max-[1535px]:gap-1">
                    <p className="min-w-0 break-words text-sm font-semibold text-black min-[1280px]:max-[1535px]:text-[12px]">
                        {title}
                    </p>

                    <AnimatePresence>
                        {current && (
                            <motion.span
                                initial={{
                                    opacity: 0,
                                    scale: 0.85,
                                }}
                                animate={{
                                    opacity: 1,
                                    scale: 1,
                                }}
                                className="shrink-0 rounded-full bg-[#2563EB]/10 px-2 py-0.5 text-[10px] font-medium text-[#2563EB] min-[1280px]:max-[1535px]:px-1.5 min-[1280px]:max-[1535px]:text-[8px]"
                            >
                                Current
                            </motion.span>
                        )}
                    </AnimatePresence>
                </div>

                {description && (
                    <p className="mt-1 break-words text-xs leading-5 text-gray-500 min-[1280px]:max-[1535px]:mt-0.5 min-[1280px]:max-[1535px]:text-[10px] min-[1280px]:max-[1535px]:leading-4">
                        {description}
                    </p>
                )}

                {remarks?.trim() && (
                    <div className="mt-2 rounded-md border border-gray-200 bg-gray-50 px-2.5 py-2 min-[1280px]:max-[1535px]:mt-1.5 min-[1280px]:max-[1535px]:px-2 min-[1280px]:max-[1535px]:py-1.5">
                        <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400 min-[1280px]:max-[1535px]:text-[9px]">
                            Remarks
                        </p>

                        <p className="mt-1 whitespace-pre-wrap break-words text-xs leading-5 text-black min-[1280px]:max-[1535px]:mt-0.5 min-[1280px]:max-[1535px]:text-[10px] min-[1280px]:max-[1535px]:leading-4">
                            {remarks}
                        </p>
                    </div>
                )}

                <p className="mt-2 text-[10px] text-gray-400 min-[1280px]:max-[1535px]:mt-1.5 min-[1280px]:max-[1535px]:text-[9px]">
                    {date}
                </p>
            </div>
        </motion.div>
    );
}

function buildFullName(
    firstName,
    lastName
) {
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
        .replace(/\b\w/g, char =>
            char.toUpperCase()
        );
}