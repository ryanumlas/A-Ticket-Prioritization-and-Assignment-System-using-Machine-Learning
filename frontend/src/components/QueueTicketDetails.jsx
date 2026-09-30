import {
    CircleUserRound,
    Tag,
    ShieldCheck,
    Users,
    Building2,
    UserRoundCheck,
    Clock3,
    CircleDot,
    MessageSquareText,
} from "lucide-react";

import { motion } from "motion/react";
import { useEffect, useState } from "react";

import api from "../api";
import { statusColor } from "../utils/statusColor";
import { priorityColor, priorityLabel } from "../utils/priority";

const sectionVariants = {
    hidden: {
        opacity: 0,
        y: 10,
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.25,
            ease: "easeOut",
        },
    },
};

const itemVariants = {
    hidden: {
        opacity: 0,
        y: 6,
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.2,
            ease: "easeOut",
        },
    },
};

function DetailItem({ label, value }) {
    return (
        <motion.div
            variants={itemVariants}
        >
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                {label}
            </p>

            <p className="break-words text-sm font-medium text-gray-900">
                {value || "—"}
            </p>
        </motion.div>
    );
}

function InfoRow({ icon: Icon, label, value }) {
    return (
        <motion.div
            variants={itemVariants}
            className="flex items-start gap-3"
        >
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#4C4CF9]">
                <Icon
                    size={15}
                    className="text-white"
                />
            </div>

            <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {label}
                </p>

                <p className="mt-0.5 break-words text-sm font-medium text-gray-900">
                    {value || "—"}
                </p>
            </div>
        </motion.div>
    );
}

function StatusBadge({ value }) {
    if (!value) {
        return (
            <motion.span
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                className="inline-flex rounded-md border border-gray-300 bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600"
            >
                —
            </motion.span>
        );
    }

    return (
        <motion.span
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className={`inline-flex w-fit rounded-md px-2.5 py-1 text-xs font-medium ${
                statusColor[value] ||
                "border border-gray-300 bg-gray-100 text-gray-700"
            }`}
        >
            {String(value)
                .replace(/_/g, " ")
                .replace(/\b\w/g, (char) =>
                    char.toUpperCase()
                )}
        </motion.span>
    );
}

function PriorityBadge({ value }) {
    if (!value) {
        return (
            <motion.span
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                className="inline-flex rounded-md border border-gray-300 bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600"
            >
                —
            </motion.span>
        );
    }

    return (
        <motion.span
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className={`inline-flex w-fit rounded-md px-2.5 py-1 text-xs font-medium ${
                priorityColor[value] ||
                "border border-gray-300 bg-gray-100 text-gray-700"
            }`}
        >
            {priorityLabel[value] || value}
        </motion.span>
    );
}

function getSlaStatus(value) {
    if (!value) {
        return "SAFE";
    }

    const normalized = String(value)
        .trim()
        .toUpperCase();

    if (normalized === "MET") {
        return "MET";
    }

    if (
        normalized === "BREACHED" ||
        normalized === "BREACH" ||
        normalized === "OVERDUE"
    ) {
        return "BREACHED";
    }

    if (
        normalized === "WARNING" ||
        normalized === "AT RISK" ||
        normalized === "RISK"
    ) {
        return "WARNING";
    }

    return "SAFE";
}

function SlaStatusBadge({ value }) {
    const status = getSlaStatus(value);

    const statusStyles = {
        SAFE: "border-green-300 bg-green-100 text-green-700",
        MET: "border-blue-300 bg-blue-100 text-blue-700",
        WARNING:
            "border-yellow-300 bg-yellow-100 text-yellow-700",
        BREACHED:
            "border-red-300 bg-red-100 text-red-700",
    };

    return (
        <motion.span
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className={`inline-flex w-fit items-center rounded-md border px-2.5 py-1 text-xs font-semibold ${
                statusStyles[status]
            }`}
        >
            {status}
        </motion.span>
    );
}

function SectionHeader({
    icon: Icon,
    title,
    description,
}) {
    return (
        <motion.div
            variants={itemVariants}
            className="flex items-start gap-3 border-b border-gray-200 px-4 py-4 sm:px-5"
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                    duration: 0.2,
                    ease: "easeOut",
                }}
                className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center"
            >
                <Icon
                    size={19}
                    className="text-[#4C4CF9]"
                />
            </motion.div>

            <div className="min-w-0 flex-1">
                <h2 className="break-words text-base font-semibold text-gray-900">
                    {title}
                </h2>

                {description && (
                    <p className="mt-0.5 break-words text-xs text-gray-500">
                        {description}
                    </p>
                )}
            </div>
        </motion.div>
    );
}

function formatDate(value) {
    if (!value) return "—";

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

export default function QueueTicketDetails({
    ticketDetails,
    onAssignToMe,
    onTicketUpdated,
    user,
}) {
    const [history, setHistory] = useState([]);

    const ticketStatus = String(
        ticketDetails?.status || ""
    )
        .trim()
        .toLowerCase()
        .replace(/_/g, " ");

    const isTicketClosed = [
        "resolved",
        "closed",
        "cancelled",
    ].includes(ticketStatus);

    const canAssignToMe =
        user?.role === "IT Support Specialist" &&
        ticketDetails?.status === "Open" &&
        !ticketDetails?.assigned_to &&
        !isTicketClosed;

    useEffect(() => {
        if (!ticketDetails?.id) {
            setHistory([]);
            return;
        }

        const fetchHistory = async () => {
            try {
                const response = await api.get(
                    `/tickets/${ticketDetails.id}/history/`
                );

                const historyData = Array.isArray(
                    response.data
                )
                    ? response.data
                    : response.data?.results ||
                      response.data?.history ||
                      [];

                setHistory(historyData);
            } catch {
                setHistory([]);
            }
        };

        fetchHistory();
    }, [ticketDetails?.id]);

    const resolutionHistory = history.find(
        (item) =>
            item.event_type === "RESOLVED" ||
            (item.event_type === "STATUS_CHANGED" &&
                String(
                    item.new_value || ""
                ).toUpperCase() === "RESOLVED")
    );

    const resolutionRemarks =
        resolutionHistory?.remarks?.trim() || "";

    return (
        <>
            <motion.div
                initial="hidden"
                animate="visible"
                className="
                    w-full
                    min-w-0
                    overflow-y-auto

                    [&::-webkit-scrollbar]:w-1
                    [&::-webkit-scrollbar-track]:bg-transparent
                    [&::-webkit-scrollbar-thumb]:bg-transparent
                    hover:[&::-webkit-scrollbar-thumb]:bg-gray-300
                "
            >
                <motion.div
                    variants={sectionVariants}
                    className="mb-4 rounded-xl border border-gray-200 bg-white px-4 py-4 sm:px-5 lg:px-6"
                >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0 flex-1">
                            <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                                <span className="shrink-0 text-sm font-semibold text-[#4C4CF9]">
                                    {ticketDetails?.ticket_code ||
                                        "—"}
                                </span>

                                <span className="shrink-0 text-sm text-gray-400">
                                    /
                                </span>

                                <span className="text-sm font-medium text-gray-500">
                                    Ticket Queue
                                </span>
                            </div>

                            <h1
                                className="
                                    mt-1
                                    break-words
                                    text-lg
                                    font-semibold
                                    leading-snug
                                    text-gray-900
                                    sm:text-xl
                                "
                            >
                                {ticketDetails?.subject ||
                                    "Untitled Ticket"}
                            </h1>
                        </div>

                        <div className="flex w-full shrink-0 flex-wrap items-center gap-2 sm:w-auto sm:pt-0.5">
                            <StatusBadge
                                value={
                                    ticketDetails?.status
                                }
                            />

                            {canAssignToMe && (
                                <motion.button
                                    type="button"
                                    onClick={onAssignToMe}
                                    whileHover={{
                                        scale: 1.02,
                                    }}
                                    whileTap={{
                                        scale: 0.98,
                                    }}
                                    transition={{
                                        duration: 0.15,
                                    }}
                                    className="
                                        inline-flex
                                        h-9
                                        shrink-0
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
                                    "
                                >
                                    Assign to Me
                                </motion.button>
                            )}
                        </div>
                    </div>
                </motion.div>

                {resolutionRemarks && (
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
                            delay: 0.05,
                            ease: "easeOut",
                        }}
                        className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-4 sm:px-5 lg:px-6"
                    >
                        <div className="flex min-w-0 items-start gap-3">
                            <motion.div
                                initial={{
                                    opacity: 0,
                                    scale: 0.9,
                                }}
                                animate={{
                                    opacity: 1,
                                    scale: 1,
                                }}
                                transition={{
                                    duration: 0.2,
                                    delay: 0.1,
                                }}
                                className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-green-100"
                            >
                                <MessageSquareText
                                    size={17}
                                    className="text-green-600"
                                />
                            </motion.div>

                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold uppercase tracking-wide text-green-600">
                                    Resolution Remarks
                                </p>

                                <div className="mt-2 rounded-lg border border-green-200 bg-white px-3 py-2.5">
                                    <p className="whitespace-pre-wrap break-words text-sm leading-5 text-black">
                                        {
                                            resolutionRemarks
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                <div className="w-full">
                    <div className="grid w-full grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.85fr)]">
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            transition={{
                                delayChildren: 0.08,
                                staggerChildren: 0.06,
                            }}
                            className="min-w-0 space-y-5"
                        >
                            <motion.section
                                variants={sectionVariants}
                                className="rounded-xl border border-gray-200 bg-white"
                            >
                                <SectionHeader
                                    icon={Tag}
                                    title="Ticket Overview"
                                    description="General information about this ticket"
                                />

                                <motion.div
                                    variants={itemVariants}
                                    className="space-y-5 p-4 sm:p-5"
                                >
                                    <div>
                                        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Description
                                        </p>

                                        <p className="whitespace-pre-wrap break-words text-sm leading-6 text-black">
                                            {
                                                ticketDetails?.description ||
                                                "No description provided."
                                            }
                                        </p>
                                    </div>

                                    <div>
                                        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Business Impact
                                        </p>

                                        <p className="whitespace-pre-wrap break-words text-sm leading-6 text-black">
                                            {
                                                ticketDetails?.business_impact ||
                                                "No business impact provided."
                                            }
                                        </p>
                                    </div>

                                    <motion.div
                                        variants={itemVariants}
                                        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
                                    >
                                        <DetailItem
                                            label="Affected Scope"
                                            value={
                                                ticketDetails?.affected_scope
                                            }
                                        />

                                        <motion.div
                                            variants={itemVariants}
                                        >
                                            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Priority
                                            </p>

                                            <PriorityBadge
                                                value={
                                                    ticketDetails?.priority
                                                }
                                            />
                                        </motion.div>

                                        <DetailItem
                                            label="Created At"
                                            value={formatDate(
                                                ticketDetails?.created_at
                                            )}
                                        />

                                        <DetailItem
                                            label="Last Updated"
                                            value={formatDate(
                                                ticketDetails?.updated_at
                                            )}
                                        />
                                    </motion.div>
                                </motion.div>
                            </motion.section>

                            <motion.section
                                variants={sectionVariants}
                                className="rounded-xl border border-gray-200 bg-white"
                            >
                                <SectionHeader
                                    icon={
                                        CircleUserRound
                                    }
                                    title="Requester Information"
                                    description="Information about the employee who submitted the ticket"
                                />

                                <motion.div
                                    variants={itemVariants}
                                    className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-3"
                                >
                                    <InfoRow
                                        icon={
                                            CircleUserRound
                                        }
                                        label="Name"
                                        value={`${ticketDetails?.first_name || ""} ${
                                            ticketDetails?.last_name || ""
                                        }`.trim()}
                                    />

                                    <InfoRow
                                        icon={
                                            UserRoundCheck
                                        }
                                        label="Employee ID"
                                        value={
                                            ticketDetails?.user_code
                                        }
                                    />

                                    <InfoRow
                                        icon={
                                            Building2
                                        }
                                        label="Department"
                                        value={
                                            ticketDetails?.employee_department
                                        }
                                    />

                                    <InfoRow
                                        icon={
                                            Building2
                                        }
                                        label="Office Location"
                                        value={
                                            ticketDetails?.office_location
                                        }
                                    />

                                    <InfoRow
                                        icon={Clock3}
                                        label="Workstation"
                                        value={
                                            ticketDetails?.workstation
                                        }
                                    />
                                </motion.div>
                            </motion.section>

                            <motion.section
                                variants={sectionVariants}
                                className="rounded-xl border border-gray-200 bg-white"
                            >
                                <SectionHeader
                                    icon={Users}
                                    title="Assignment"
                                    description="Current ticket assignment"
                                />

                                <motion.div
                                    variants={itemVariants}
                                    className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-3"
                                >
                                    <InfoRow
                                        icon={
                                            CircleUserRound
                                        }
                                        label="Assigned To"
                                        value={
                                            ticketDetails
                                                ?.assigned_to
                                                ?.full_name ||
                                            "Unassigned"
                                        }
                                    />

                                    <InfoRow
                                        icon={
                                            Building2
                                        }
                                        label="IT Department"
                                        value={
                                            ticketDetails?.it_department
                                        }
                                    />

                                    <InfoRow
                                        icon={Users}
                                        label="Required Specialization"
                                        value={
                                            ticketDetails?.required_specialization
                                        }
                                    />
                                </motion.div>
                            </motion.section>
                        </motion.div>

                        <motion.div
                            initial="hidden"
                            animate="visible"
                            transition={{
                                delayChildren: 0.16,
                                staggerChildren: 0.06,
                            }}
                            className="min-w-0 space-y-5"
                        >
                            <motion.section
                                variants={sectionVariants}
                                className="rounded-xl border border-gray-200 bg-white"
                            >
                                <SectionHeader
                                    icon={ShieldCheck}
                                    title="Classification"
                                    description="Ticket classification information"
                                />

                                <motion.div
                                    variants={itemVariants}
                                    className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 xl:grid-cols-1 sm:p-5"
                                >
                                    <InfoRow
                                        icon={Tag}
                                        label="Category"
                                        value={
                                            ticketDetails?.category
                                        }
                                    />

                                    <InfoRow
                                        icon={
                                            CircleDot
                                        }
                                        label="Symptom Code"
                                        value={
                                            ticketDetails?.symptom_code
                                        }
                                    />

                                    <motion.div
                                        variants={itemVariants}
                                        className="flex items-start gap-3"
                                    >
                                        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#4C4CF9]">
                                            <ShieldCheck
                                                size={15}
                                                className="text-white"
                                            />
                                        </div>

                                        <div className="min-w-0">
                                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Priority
                                            </p>

                                            <div className="mt-1">
                                                <PriorityBadge
                                                    value={
                                                        ticketDetails?.priority
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </motion.div>

                                    <InfoRow
                                        icon={Users}
                                        label="Required Specialization"
                                        value={
                                            ticketDetails?.required_specialization
                                        }
                                    />

                                    <InfoRow
                                        icon={
                                            CircleDot
                                        }
                                        label="Classification Source"
                                        value={
                                            ticketDetails?.classification_source
                                        }
                                    />
                                </motion.div>
                            </motion.section>

                            <motion.section
                                variants={sectionVariants}
                                className="rounded-xl border border-gray-200 bg-white"
                            >
                                <SectionHeader
                                    icon={Clock3}
                                    title="SLA Information"
                                    description="Service level response and resolution deadlines"
                                />

                                <motion.div
                                    variants={itemVariants}
                                    className="p-4 sm:p-5"
                                >
                                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                        <motion.div
                                            variants={itemVariants}
                                            className="min-w-0"
                                        >
                                            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Expected Response
                                            </p>

                                            <p className="break-words text-sm font-medium text-gray-900">
                                                {formatDate(
                                                    ticketDetails?.response_deadline
                                                )}
                                            </p>
                                        </motion.div>

                                        <motion.div
                                            variants={itemVariants}
                                            className="min-w-0"
                                        >
                                            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Expected Resolution
                                            </p>

                                            <p className="break-words text-sm font-medium text-gray-900">
                                                {formatDate(
                                                    ticketDetails?.resolution_deadline
                                                )}
                                            </p>
                                        </motion.div>

                                        <motion.div
                                            variants={itemVariants}
                                            className="min-w-0"
                                        >
                                            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Response SLA Status
                                            </p>

                                            <SlaStatusBadge
                                                value={
                                                    ticketDetails?.response_sla_status
                                                }
                                            />
                                        </motion.div>

                                        <motion.div
                                            variants={itemVariants}
                                            className="min-w-0"
                                        >
                                            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Resolution SLA Status
                                            </p>

                                            <SlaStatusBadge
                                                value={
                                                    ticketDetails?.resolution_sla_status
                                                }
                                            />
                                        </motion.div>
                                    </div>
                                </motion.div>
                            </motion.section>
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </>
    );
}