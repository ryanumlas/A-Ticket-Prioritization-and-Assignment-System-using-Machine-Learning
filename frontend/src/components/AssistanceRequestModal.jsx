import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
    X,
    MessageSquareText,
    Users,
    ChevronDown,
} from "lucide-react";
import { getCurrentUser } from "../utils/auth";

const REQUESTS_COLLAPSED_LIMIT = 3;

function formatDate(value) {
    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

function getInitials(name) {
    if (!name) {
        return "?";
    }

    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("");
}

function StatusBadge({ status }) {
    const normalizedStatus = String(status || "")
        .trim()
        .toLowerCase();

    const statusStyles = {
        pending:
            "border-amber-300 bg-amber-50 text-amber-700",
        accepted:
            "border-green-300 bg-green-50 text-green-700",
        ongoing:
            "border-green-300 bg-green-50 text-green-700",
        completed:
            "border-gray-300 bg-gray-100 text-gray-700",
        cancelled:
            "border-red-300 bg-red-50 text-red-700",
        rejected:
            "border-red-300 bg-red-50 text-red-700",
    };

    const label = normalizedStatus
        ? normalizedStatus.charAt(0).toUpperCase() +
          normalizedStatus.slice(1)
        : "—";

    return (
        <span
            className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold ${
                statusStyles[normalizedStatus] ||
                "border-gray-300 bg-gray-100 text-gray-700"
            }`}
        >
            {label}
        </span>
    );
}

function DetailField({
    label,
    value,
    className = "",
}) {
    return (
        <div className={`min-w-0 ${className}`}>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                {label}
            </p>

            <p className="mt-1 break-words text-sm font-medium leading-5 text-black">
                {value || "—"}
            </p>
        </div>
    );
}

function Avatar({ name }) {
    return (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#4C4CF9]/10 text-xs font-semibold text-[#4C4CF9]">
            {getInitials(name)}
        </div>
    );
}

export default function AssistanceRequestModal({
    open,
    onClose,
    ticketDetails,
    currentAssisting = [],

    assistanceRequests = [],
    assistanceRequest = null,

    myAssistance = null,

    canEdit = false,
    canAccept = false,
    canAcceptRequestId = null,

    onAccept,
    onCancel,
    onComplete,

    isCompleting = false,
    isCancelling = false,
    acceptingAssistance = false,

    actionError = "",
}) {
    const user = getCurrentUser();

    const [assistanceNote, setAssistanceNote] =
        useState("");

    const [noteError, setNoteError] =
        useState("");

    const [requestsExpanded, setRequestsExpanded] =
        useState(false);

    const requests = Array.isArray(
        assistanceRequests
    )
        ? assistanceRequests
        : assistanceRequest
            ? [assistanceRequest]
            : [];

    const assistingParticipants = Array.isArray(
        ticketDetails?.current_assisting
    )
        ? ticketDetails.current_assisting
        : Array.isArray(currentAssisting)
            ? currentAssisting
            : [];

    const ongoingAssistants =
        assistingParticipants.filter(
            (person) =>
                String(person?.status || "")
                    .trim()
                    .toLowerCase() === "ongoing"
        );

    useEffect(() => {
        if (!open) {
            setRequestsExpanded(false);
            return;
        }

        setAssistanceNote(
            myAssistance?.assisted_note || ""
        );

        setNoteError("");
        setRequestsExpanded(false);
    }, [
        open,
        myAssistance?.assisted_note,
        myAssistance?.id,
    ]);

    const myAssistanceStatus = String(
        myAssistance?.status || ""
    )
        .trim()
        .toLowerCase();

    const isMyAssistanceOngoing =
        canEdit &&
        myAssistanceStatus === "ongoing";

    const hasOngoingAssistance =
        ongoingAssistants.length > 0 ||
        isMyAssistanceOngoing;

    const shouldCollapseRequests =
        requests.length > REQUESTS_COLLAPSED_LIMIT;

    const visibleRequests =
        shouldCollapseRequests && !requestsExpanded
            ? requests.slice(
                0,
                REQUESTS_COLLAPSED_LIMIT
            )
            : requests;

    const hiddenRequestCount =
        Math.max(
            requests.length -
                REQUESTS_COLLAPSED_LIMIT,
            0
        );

    const handleComplete = () => {
        const note = assistanceNote.trim();

        if (!note) {
            setNoteError(
                "Please enter what you assisted with."
            );
            return;
        }

        setNoteError("");

        onComplete?.(note);
    };

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
                    onMouseDown={(event) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            onClose?.();
                        }
                    }}
                >
                    <motion.div
                        initial={{
                            opacity: 0,
                            y: 12,
                            scale: 0.98,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                            scale: 1,
                        }}
                        exit={{
                            opacity: 0,
                            y: 8,
                            scale: 0.98,
                        }}
                        transition={{
                            duration: 0.22,
                            ease: "easeOut",
                        }}
                        className="
                            w-full 
                            max-w-4xl 
                            lg:max-w-5xl 
                            xl:max-w-6xl 
                            max-h-[90vh] 
                            overflow-hidden 
                            rounded-xl 
                            border 
                            border-gray-200 
                            bg-white 
                            shadow-xl 
                        "
                        onMouseDown={(event) =>
                            event.stopPropagation()
                        }
                    >
                        {/* Header */}
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
                                duration: 0.2,
                                delay: 0.05,
                            }}
                            className="flex items-start justify-between gap-4 border-b border-gray-200 px-5 py-4"
                        >
                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#4C4CF9]/10">
                                        <Users
                                            size={18}
                                            className="text-[#4C4CF9]"
                                        />
                                    </div>

                                    <div className="min-w-0">
                                        <h2 className="text-base font-semibold text-black">
                                            Assistance Details
                                        </h2>

                                        <p className="mt-0.5 text-xs text-gray-500">
                                            View assistance requests and IT Support activity for this ticket.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <motion.button
                                type="button"
                                onClick={onClose}
                                whileHover={{
                                    scale: 1.04,
                                }}
                                whileTap={{
                                    scale: 0.96,
                                }}
                                className="
                                    flex 
                                    h-9 
                                    w-9 
                                    shrink-0 
                                    cursor-pointer 
                                    items-center 
                                    justify-center 
                                    rounded-lg 
                                    text-gray-500 
                                    transition-colors 
                                    hover:bg-gray-100 
                                    hover:text-black 
                                    focus:outline-none 
                                    focus:ring-2 
                                    focus:ring-[#4C4CF9]/20 
                                "
                                aria-label="Close"
                            >
                                <X size={18} />
                            </motion.button>
                        </motion.div>

                        {/* Scrollable Content */}
                        <div
                            className="
                                max-h-[calc(90vh-145px)] 
                                overflow-y-auto 
                                px-5 
                                py-5 
                                [scrollbar-width:thin] 
                                [&::-webkit-scrollbar]:w-1 
                                [&::-webkit-scrollbar-track]:bg-transparent 
                                [&::-webkit-scrollbar-thumb]:rounded-full 
                                [&::-webkit-scrollbar-thumb]:bg-gray-300 
                                hover:[&::-webkit-scrollbar-thumb]:bg-gray-400 
                            "
                        >
                            {/* Summary */}
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
                                    duration: 0.2,
                                    delay: 0.08,
                                }}
                                className="mb-5 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3"
                            >
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Assistance
                                        </span>

                                        <span className="text-sm font-semibold text-black">
                                            {requests.length}
                                        </span>
                                    </div>

                                    <AnimatePresence>
                                        {hasOngoingAssistance && (
                                            <motion.div
                                                initial={{
                                                    opacity: 0,
                                                    scale: 0.9,
                                                }}
                                                animate={{
                                                    opacity: 1,
                                                    scale: 1,
                                                }}
                                                exit={{
                                                    opacity: 0,
                                                    scale: 0.9,
                                                }}
                                            >
                                                <StatusBadge status="ongoing" />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <p className="mt-2 text-sm font-medium text-black">
                                    {hasOngoingAssistance
                                        ? "Assistance is currently ongoing on this ticket."
                                        : requests.length > 0
                                            ? "Assistance requests have been created for this ticket."
                                            : "No assistance requests have been created for this ticket."}
                                </p>
                            </motion.div>

                            {/* Assistance Requests */}
                            <motion.section
                                initial={{
                                    opacity: 0,
                                    y: 8,
                                }}
                                animate={{
                                    opacity: 1,
                                    y: 0,
                                }}
                                transition={{
                                    duration: 0.2,
                                    delay: 0.12,
                                }}
                                className="rounded-lg border border-gray-200 bg-white"
                            >
                                <div className="flex items-start gap-3 border-b border-gray-200 px-4 py-4">
                                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center">
                                        <Users
                                            size={18}
                                            className="text-[#4C4CF9]"
                                        />
                                    </div>

                                    <div className="min-w-0">
                                        <h3 className="text-sm font-semibold text-black">
                                            Assistance Requests
                                        </h3>

                                        <p className="mt-0.5 text-xs text-gray-500">
                                            Each selected IT Support department has its own assistance request.
                                        </p>
                                    </div>
                                </div>

                                <div className="p-4">
                                    {requests.length > 0 ? (
                                        <>
                                            <div className="space-y-3">
                                                <AnimatePresence
                                                    initial={false}
                                                >
                                                    {visibleRequests.map(
                                                        (
                                                            request,
                                                            index
                                                        ) => {
                                                            const requestStatus =
                                                                String(
                                                                    request?.status ||
                                                                        ""
                                                                )
                                                                    .trim()
                                                                    .toLowerCase();

                                                            const isPending =
                                                                requestStatus ===
                                                                "pending";

                                                            const isCancelled =
                                                                requestStatus ===
                                                                "cancelled";

                                                            const isPrimaryTechnician =
                                                                user?.role ===
                                                                    "IT Support Specialist" &&
                                                                Number(
                                                                    ticketDetails?.assigned_to?.id
                                                                ) ===
                                                                    Number(
                                                                        user?.user_id
                                                                    );

                                                            const isMyRequest =
                                                                Number(
                                                                    request?.requested_by
                                                                ) ===
                                                                    Number(
                                                                        user?.user_id
                                                                    );

                                                            const canCancelRequest =
                                                                isPrimaryTechnician &&
                                                                isMyRequest &&
                                                                isPending;

                                                            const canAcceptThisRequest =
                                                                canAccept &&
                                                                canAcceptRequestId !==
                                                                    null &&
                                                                Number(
                                                                    canAcceptRequestId
                                                                ) ===
                                                                    Number(
                                                                        request?.id
                                                                    ) &&
                                                                isPending;

                                                            return (
                                                                <motion.div
                                                                    key={
                                                                        request?.id
                                                                    }
                                                                    initial={{
                                                                        opacity: 0,
                                                                        y: 8,
                                                                    }}
                                                                    animate={{
                                                                        opacity: 1,
                                                                        y: 0,
                                                                    }}
                                                                    exit={{
                                                                        opacity: 0,
                                                                        y: -5,
                                                                    }}
                                                                    transition={{
                                                                        duration: 0.2,
                                                                        delay:
                                                                            index *
                                                                            0.04,
                                                                        ease: "easeOut",
                                                                    }}
                                                                    layout
                                                                    className="
                                                                        rounded-lg 
                                                                        border 
                                                                        border-gray-200 
                                                                        bg-gray-50 
                                                                        px-4 
                                                                        py-4 
                                                                    "
                                                                >
                                                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                                                                        <div className="min-w-0 flex-1">
                                                                            <div className="flex min-w-0 flex-wrap items-center gap-2">
                                                                                <p className="break-words text-sm font-semibold text-black">
                                                                                    {request?.requested_department_name ||
                                                                                        "IT Support"}
                                                                                </p>

                                                                                <StatusBadge
                                                                                    status={
                                                                                        requestStatus
                                                                                    }
                                                                                />
                                                                            </div>

                                                                            <div className="mt-2">
                                                                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                                                    Requested By
                                                                                </p>

                                                                                <p className="mt-1 break-words text-sm font-semibold text-black">
                                                                                    {request?.requested_by_name ||
                                                                                        "—"}
                                                                                </p>

                                                                                <p className="mt-0.5 break-words text-xs text-gray-500">
                                                                                    {request?.requested_by_department ||
                                                                                        "—"}
                                                                                </p>
                                                                            </div>
                                                                        </div>

                                                                        <div className="flex shrink-0 flex-wrap gap-2">
                                                                            {canCancelRequest && (
                                                                                <motion.button
                                                                                    type="button"
                                                                                    onClick={() =>
                                                                                        onCancel?.(
                                                                                            request.id
                                                                                        )
                                                                                    }
                                                                                    disabled={
                                                                                        isCancelling
                                                                                    }
                                                                                    whileHover={{
                                                                                        scale: 1.02,
                                                                                    }}
                                                                                    whileTap={{
                                                                                        scale: 0.98,
                                                                                    }}
                                                                                    className="
                                                                                        inline-flex 
                                                                                        h-9 
                                                                                        items-center 
                                                                                        justify-center 
                                                                                        rounded-lg 
                                                                                        border 
                                                                                        border-red-300 
                                                                                        bg-red-50 
                                                                                        px-3 
                                                                                        text-xs 
                                                                                        font-semibold 
                                                                                        text-red-700 
                                                                                        transition-colors 
                                                                                        hover:bg-red-100 
                                                                                        disabled:cursor-not-allowed 
                                                                                        disabled:opacity-60 
                                                                                    "
                                                                                >
                                                                                    {isCancelling
                                                                                        ? "Cancelling..."
                                                                                        : "Cancel Request"}
                                                                                </motion.button>
                                                                            )}

                                                                            {canAcceptThisRequest && (
                                                                                <motion.button
                                                                                    type="button"
                                                                                    onClick={() =>
                                                                                        onAccept?.(
                                                                                            request.id
                                                                                        )
                                                                                    }
                                                                                    disabled={
                                                                                        acceptingAssistance
                                                                                    }
                                                                                    whileHover={{
                                                                                        scale: 1.02,
                                                                                    }}
                                                                                    whileTap={{
                                                                                        scale: 0.98,
                                                                                    }}
                                                                                    className="
                                                                                        inline-flex 
                                                                                        h-9 
                                                                                        items-center 
                                                                                        justify-center 
                                                                                        rounded-lg 
                                                                                        bg-[#4C4CF9] 
                                                                                        px-3 
                                                                                        text-xs 
                                                                                        font-semibold 
                                                                                        text-white 
                                                                                        transition-colors 
                                                                                        hover:bg-[#3D3DE0] 
                                                                                        disabled:cursor-not-allowed 
                                                                                        disabled:opacity-60 
                                                                                    "
                                                                                >
                                                                                    {acceptingAssistance
                                                                                        ? "Accepting..."
                                                                                        : "Accept Assistance"}
                                                                                </motion.button>
                                                                            )}
                                                                        </div>
                                                                    </div>

                                                                    <div className="mt-4 border-t border-gray-200 pt-3">
                                                                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                                            Reason for Assistance
                                                                        </p>

                                                                        <div className="mt-2 rounded-lg border border-gray-200 bg-white px-3 py-3">
                                                                            <p className="whitespace-pre-wrap break-words text-sm leading-6 text-black">
                                                                                {request?.reason ||
                                                                                    "No assistance details provided."}
                                                                            </p>
                                                                        </div>
                                                                    </div>

                                                                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                                                        <DetailField
                                                                            label="Requested At"
                                                                            value={formatDate(
                                                                                request?.requested_at
                                                                            )}
                                                                        />

                                                                        {request?.accepted_by_name &&
                                                                            request?.accepted_by_name !==
                                                                                "-" && (
                                                                                <DetailField
                                                                                    label="Accepted By"
                                                                                    value={
                                                                                        request.accepted_by_name
                                                                                    }
                                                                                />
                                                                            )}

                                                                        {request?.accepted_at && (
                                                                            <DetailField
                                                                                label="Accepted At"
                                                                                value={formatDate(
                                                                                    request.accepted_at
                                                                                )}
                                                                            />
                                                                        )}
                                                                    </div>

                                                                    {isCancelled && (
                                                                        <motion.div
                                                                            initial={{
                                                                                opacity: 0,
                                                                                height: 0,
                                                                            }}
                                                                            animate={{
                                                                                opacity: 1,
                                                                                height: "auto",
                                                                            }}
                                                                            className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5"
                                                                        >
                                                                            <p className="text-xs font-medium text-red-700">
                                                                                This assistance request was cancelled.
                                                                            </p>
                                                                        </motion.div>
                                                                    )}
                                                                </motion.div>
                                                            );
                                                        }
                                                    )}
                                                </AnimatePresence>
                                            </div>

                                            {shouldCollapseRequests && (
                                                <motion.div
                                                    initial={{
                                                        opacity: 0,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                    }}
                                                    className="mt-4 flex justify-center border-t border-gray-200 pt-4"
                                                >
                                                    <motion.button
                                                        type="button"
                                                        onClick={() =>
                                                            setRequestsExpanded(
                                                                (current) =>
                                                                    !current
                                                            )
                                                        }
                                                        whileHover={{
                                                            scale: 1.01,
                                                        }}
                                                        whileTap={{
                                                            scale: 0.98,
                                                        }}
                                                        className="
                                                            inline-flex 
                                                            items-center 
                                                            gap-2 
                                                            rounded-lg 
                                                            border 
                                                            border-gray-300 
                                                            bg-white 
                                                            px-4 
                                                            py-2 
                                                            text-sm 
                                                            font-medium 
                                                            text-gray-700 
                                                            transition-colors 
                                                            hover:bg-gray-50 
                                                            hover:text-black 
                                                            focus:outline-none 
                                                            focus:ring-2 
                                                            focus:ring-[#4C4CF9]/20 
                                                        "
                                                    >
                                                        <span>
                                                            {requestsExpanded
                                                                ? "Show fewer requests"
                                                                : `Show all ${requests.length} requests`}
                                                        </span>

                                                        <motion.div
                                                            animate={{
                                                                rotate:
                                                                    requestsExpanded
                                                                        ? 180
                                                                        : 0,
                                                            }}
                                                            transition={{
                                                                duration: 0.2,
                                                            }}
                                                        >
                                                            <ChevronDown
                                                                size={16}
                                                            />
                                                        </motion.div>
                                                    </motion.button>

                                                    <AnimatePresence
                                                        initial={false}
                                                    >
                                                        {!requestsExpanded && (
                                                            <motion.span
                                                                initial={{
                                                                    opacity: 0,
                                                                    x: -4,
                                                                }}
                                                                animate={{
                                                                    opacity: 1,
                                                                    x: 0,
                                                                }}
                                                                exit={{
                                                                    opacity: 0,
                                                                    x: -4,
                                                                }}
                                                                className="ml-3 self-center text-xs text-gray-400"
                                                            >
                                                                +
                                                                {
                                                                    hiddenRequestCount
                                                                }{" "}
                                                                more
                                                            </motion.span>
                                                        )}
                                                    </AnimatePresence>
                                                </motion.div>
                                            )}
                                        </>
                                    ) : (
                                        <motion.div
                                            initial={{
                                                opacity: 0,
                                                y: 5,
                                            }}
                                            animate={{
                                                opacity: 1,
                                                y: 0,
                                            }}
                                            className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center"
                                        >
                                            <Users
                                                size={18}
                                                className="mx-auto text-gray-400"
                                            />

                                            <p className="mt-2 text-sm font-medium text-black">
                                                No assistance requests
                                            </p>

                                            <p className="mt-1 text-xs text-gray-500">
                                                No assistance has been requested for this ticket.
                                            </p>
                                        </motion.div>
                                    )}
                                </div>
                            </motion.section>

                            {/* Currently Assisting */}
                            <motion.section
                                initial={{
                                    opacity: 0,
                                    y: 8,
                                }}
                                animate={{
                                    opacity: 1,
                                    y: 0,
                                }}
                                transition={{
                                    duration: 0.2,
                                    delay: 0.16,
                                }}
                                className="mt-5 rounded-lg border border-gray-200 bg-white"
                            >
                                <div className="flex items-start gap-3 border-b border-gray-200 px-4 py-4">
                                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center">
                                        <Users
                                            size={18}
                                            className="text-[#4C4CF9]"
                                        />
                                    </div>

                                    <div className="min-w-0">
                                        <h3 className="text-sm font-semibold text-black">
                                            Currently Assisting
                                        </h3>

                                        <p className="mt-0.5 text-xs text-gray-500">
                                            All IT Support activity recorded for this ticket.
                                        </p>
                                    </div>
                                </div>

                                <div className="p-4">
                                    {assistingParticipants.length > 0 ? (
                                        <div className="space-y-3">
                                            <AnimatePresence
                                                initial={false}
                                            >
                                                {assistingParticipants.map(
                                                    (
                                                        person,
                                                        index
                                                    ) => {
                                                        const personName =
                                                            person?.name ||
                                                            person?.assisted_by_name ||
                                                            "Unknown IT Support";

                                                        const departmentName =
                                                            person?.department ||
                                                            person?.assisted_by_department ||
                                                            "IT Support";

                                                        return (
                                                            <motion.div
                                                                key={
                                                                    person?.id ||
                                                                    person?.assisted_by ||
                                                                    index
                                                                }
                                                                initial={{
                                                                    opacity: 0,
                                                                    y: 8,
                                                                }}
                                                                animate={{
                                                                    opacity: 1,
                                                                    y: 0,
                                                                }}
                                                                exit={{
                                                                    opacity: 0,
                                                                    y: -5,
                                                                }}
                                                                transition={{
                                                                    duration: 0.2,
                                                                    delay:
                                                                        index *
                                                                        0.04,
                                                                    ease: "easeOut",
                                                                }}
                                                                layout
                                                                className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3"
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <Avatar
                                                                        name={
                                                                            personName
                                                                        }
                                                                    />

                                                                    <div className="min-w-0 flex-1">
                                                                        <p className="break-words text-sm font-semibold text-black">
                                                                            {
                                                                                personName
                                                                            }
                                                                        </p>

                                                                        <div className="mt-0.5 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5">
                                                                            <span className="text-xs text-gray-500">
                                                                                {
                                                                                    departmentName
                                                                                }
                                                                            </span>

                                                                            {person?.created_at && (
                                                                                <>
                                                                                    <span className="text-xs text-gray-300">
                                                                                        •
                                                                                    </span>

                                                                                    <span className="break-words text-xs text-gray-500">
                                                                                        Assisting since{" "}
                                                                                        {formatDate(
                                                                                            person.created_at
                                                                                        )}
                                                                                    </span>
                                                                                </>
                                                                            )}
                                                                        </div>
                                                                    </div>

                                                                    <StatusBadge
                                                                        status={
                                                                            person?.status
                                                                        }
                                                                    />
                                                                </div>

                                                                {person?.assisted_note && (
                                                                    <motion.div
                                                                        initial={{
                                                                            opacity: 0,
                                                                        }}
                                                                        animate={{
                                                                            opacity: 1,
                                                                        }}
                                                                        className="mt-3 rounded-lg border border-gray-200 bg-white px-3 py-3"
                                                                    >
                                                                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                                            Assistance Remarks
                                                                        </p>

                                                                        <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-5 text-black">
                                                                            {
                                                                                person.assisted_note
                                                                            }
                                                                        </p>
                                                                    </motion.div>
                                                                )}

                                                                {String(
                                                                    person?.status ||
                                                                        ""
                                                                )
                                                                    .trim()
                                                                    .toLowerCase() ===
                                                                    "completed" &&
                                                                    person?.completed_at && (
                                                                        <motion.div
                                                                            initial={{
                                                                                opacity: 0,
                                                                            }}
                                                                            animate={{
                                                                                opacity: 1,
                                                                            }}
                                                                            className="mt-3"
                                                                        >
                                                                            <p className="text-xs text-gray-500">
                                                                                Completed{" "}
                                                                                {formatDate(
                                                                                    person.completed_at
                                                                                )}
                                                                            </p>
                                                                        </motion.div>
                                                                    )}
                                                            </motion.div>
                                                        );
                                                    }
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    ) : (
                                        <motion.div
                                            initial={{
                                                opacity: 0,
                                                y: 5,
                                            }}
                                            animate={{
                                                opacity: 1,
                                                y: 0,
                                            }}
                                            className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center"
                                        >
                                            <Users
                                                size={18}
                                                className="mx-auto text-gray-400"
                                            />

                                            <p className="mt-2 text-sm font-medium text-black">
                                                No IT Support assistance recorded
                                            </p>

                                            <p className="mt-1 text-xs text-gray-500">
                                                No assistance has been recorded for this ticket.
                                            </p>
                                        </motion.div>
                                    )}
                                </div>
                            </motion.section>

                            {/* Your Assistance */}
                            <AnimatePresence>
                                {isMyAssistanceOngoing && (
                                    <motion.section
                                        initial={{
                                            opacity: 0,
                                            y: 10,
                                            height: 0,
                                        }}
                                        animate={{
                                            opacity: 1,
                                            y: 0,
                                            height: "auto",
                                        }}
                                        exit={{
                                            opacity: 0,
                                            y: 10,
                                            height: 0,
                                        }}
                                        transition={{
                                            duration: 0.22,
                                            ease: "easeOut",
                                        }}
                                        className="mt-5 rounded-lg border border-gray-200 bg-white"
                                    >
                                        <div className="flex items-start gap-3 border-b border-gray-200 px-4 py-4">
                                            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center">
                                                <MessageSquareText
                                                    size={18}
                                                    className="text-[#4C4CF9]"
                                                />
                                            </div>

                                            <div className="min-w-0">
                                                <h3 className="text-sm font-semibold text-black">
                                                    Your Assistance
                                                </h3>

                                                <p className="mt-0.5 text-xs text-gray-500">
                                                    Record what you assisted with before completing your assistance.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="p-4">
                                            <div className="flex items-center justify-between gap-3">
                                                <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    Assistance Remarks
                                                </label>

                                                <span className="text-xs text-gray-400">
                                                    {
                                                        assistanceNote.length
                                                    }
                                                    /300
                                                </span>
                                            </div>

                                            <textarea
                                                value={
                                                    assistanceNote
                                                }
                                                onChange={(
                                                    event
                                                ) => {
                                                    setAssistanceNote(
                                                        event
                                                            .target
                                                            .value
                                                    );

                                                    if (
                                                        noteError
                                                    ) {
                                                        setNoteError(
                                                            ""
                                                        );
                                                    }
                                                }}
                                                rows={5}
                                                maxLength={300}
                                                placeholder="Describe what you assisted with..."
                                                className="
                                                    mt-2 
                                                    w-full 
                                                    resize-none 
                                                    rounded-lg 
                                                    border 
                                                    border-gray-300 
                                                    bg-white 
                                                    px-3 
                                                    py-3 
                                                    text-sm 
                                                    leading-5 
                                                    text-black 
                                                    outline-none 
                                                    placeholder:text-gray-400 
                                                    focus:border-[#2563EB] 
                                                    focus:ring-2 
                                                    focus:ring-blue-100 
                                                "
                                            />

                                            <AnimatePresence>
                                                {noteError && (
                                                    <motion.p
                                                        initial={{
                                                            opacity: 0,
                                                            y: -4,
                                                        }}
                                                        animate={{
                                                            opacity: 1,
                                                            y: 0,
                                                        }}
                                                        exit={{
                                                            opacity: 0,
                                                            y: -4,
                                                        }}
                                                        className="mt-2 text-xs font-medium text-red-600"
                                                    >
                                                        {
                                                            noteError
                                                        }
                                                    </motion.p>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </motion.section>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Footer */}
                        <motion.div
                            initial={{
                                opacity: 0,
                                y: 5,
                            }}
                            animate={{
                                opacity: 1,
                                y: 0,
                            }}
                            transition={{
                                duration: 0.2,
                                delay: 0.18,
                            }}
                            className="flex flex-col-reverse gap-2 border-t border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-end"
                        >
                            <AnimatePresence>
                                {actionError && (
                                    <motion.p
                                        initial={{
                                            opacity: 0,
                                            x: -5,
                                        }}
                                        animate={{
                                            opacity: 1,
                                            x: 0,
                                        }}
                                        exit={{
                                            opacity: 0,
                                            x: -5,
                                        }}
                                        className="mr-auto text-sm font-medium text-red-600"
                                    >
                                        {actionError}
                                    </motion.p>
                                )}
                            </AnimatePresence>

                            <motion.button
                                type="button"
                                onClick={onClose}
                                whileHover={{
                                    scale: 1.01,
                                }}
                                whileTap={{
                                    scale: 0.98,
                                }}
                                className="
                                    inline-flex 
                                    h-10 
                                    items-center 
                                    justify-center 
                                    rounded-lg 
                                    border 
                                    border-gray-300 
                                    bg-white 
                                    px-4 
                                    text-sm 
                                    font-medium 
                                    text-black 
                                    transition-colors 
                                    hover:bg-gray-50 
                                    focus:outline-none 
                                    focus:ring-2 
                                    focus:ring-gray-200 
                                "
                            >
                                Close
                            </motion.button>

                            <AnimatePresence>
                                {isMyAssistanceOngoing && (
                                    <motion.button
                                        type="button"
                                        onClick={
                                            handleComplete
                                        }
                                        disabled={
                                            isCompleting
                                        }
                                        initial={{
                                            opacity: 0,
                                            scale: 0.97,
                                        }}
                                        animate={{
                                            opacity: 1,
                                            scale: 1,
                                        }}
                                        exit={{
                                            opacity: 0,
                                            scale: 0.97,
                                        }}
                                        whileHover={{
                                            scale: 1.01,
                                        }}
                                        whileTap={{
                                            scale: 0.98,
                                        }}
                                        className="
                                            inline-flex 
                                            h-10 
                                            items-center 
                                            justify-center 
                                            rounded-lg 
                                            bg-[#4C4CF9] 
                                            px-4 
                                            text-sm 
                                            font-medium 
                                            text-white 
                                            transition-colors 
                                            hover:bg-[#3D3DE0] 
                                            focus:outline-none 
                                            focus:ring-2 
                                            focus:ring-[#4C4CF9]/30 
                                            disabled:cursor-not-allowed 
                                            disabled:opacity-60 
                                        "
                                    >
                                        {isCompleting
                                            ? "Completing..."
                                            : "Done Assisting"}
                                    </motion.button>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}