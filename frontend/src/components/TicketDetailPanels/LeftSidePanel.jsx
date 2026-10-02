import {AnimatePresence,motion,} from "motion/react";
import {useEffect,useState } from "react";
import {CircleDot,CircleAlert,Users,CalendarDays,History,Ticket,Wrench,SquareUserRound,Tags,Stethoscope,Pencil,UserRound,} from "lucide-react";
import api from "/src/api";
import { statusColor } from "../../utils/statusColor";
import {priorityColor,priorityLabel,} from "../../utils/priority";
import {affectedScopeColor,affectedScopeLabel,} from "../../utils/affectedScopeColor";
import { formatDate } from "../../utils/formatDate";
import { getCurrentUser } from "../../utils/auth";
import SymptomCodeSheet from "../FlagReason/SymptomCodeSheet";

const panelVariants = {
    hidden: {
        opacity: 0,
        x: -10,
    },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.28,
            ease: "easeOut",
        },
    },
};

const sectionVariants = {
    hidden: {
        opacity: 0,
        y: 8,
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.24,
            ease: "easeOut",
        },
    },
};

const rowContainerVariants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.035,
        },
    },
};

const rowVariants = {
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

const iconVariants = {
    hidden: {
        opacity: 0,
        scale: 0.75,
    },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.2,
            ease: "easeOut",
        },
    },
};

const badgeVariants = {
    hidden: {
        opacity: 0,
        scale: 0.9,
    },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.2,
            ease: "easeOut",
        },
    },
};

const cardVariants = {
    hidden: {
        opacity: 0,
        y: 8,
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

const avatarVariants = {
    hidden: {
        opacity: 0,
        scale: 0.8,
    },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.25,
            ease: "easeOut",
        },
    },
};

/* Main component */

export default function LeftSidePanel({
    ticketDetails,
    onTicketUpdated,
}) {
    const user = getCurrentUser();
    const priority = ticketDetails.priority;

    const [
        showPriorityEditor,
        setShowPriorityEditor,
    ] = useState(false);

    const [
        selectedPriority,
        setSelectedPriority,
    ] = useState(priority);

    const [
        isUpdatingPriority,
        setIsUpdatingPriority,
    ] = useState(false);

    const [
        priorityError,
        setPriorityError,
    ] = useState("");
    const [
        showSymptomCodeEditor,
        setShowSymptomCodeEditor,
    ] = useState(false);

    const [
        isUpdatingSymptomCode,
        setIsUpdatingSymptomCode,
    ] = useState(false);

    const [
        symptomCodeError,
        setSymptomCodeError,
    ] = useState("");
    const affectedScope = String(
        ticketDetails?.affected_scope || ""
    )
        .trim()
        .toLowerCase();

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

    const canViewClassification =
        userRole === "it service desk" ||
        userRole === "it support specialist" ||
        userRole === "it supervisor";

    const canEditTicket =
        userRole === "it support specialist" ||
        userRole === "it supervisor";

    const canManuallyEditPriority =
        canEditTicket &&
        ["P4", "P5"].includes(
            String(priority || "").toUpperCase()
        );

    const requesterName =
        `${ticketDetails.first_name || ""} ${
            ticketDetails.last_name || ""
        }`.trim() || "Unknown User";

    const assignedName =
        ticketDetails.assigned_to?.full_name ||
        "Unassigned";

    const assignedRole =
        ticketDetails.assigned_to?.role ||
        "IT Support Specialist";

    useEffect(() => {
        setSelectedPriority(
            String(ticketDetails?.priority || "")
                .toUpperCase()
        );

        setShowPriorityEditor(false);
        setPriorityError("");

        setShowSymptomCodeEditor(false);
        setSymptomCodeError("");
    }, [
        ticketDetails?.id,
        ticketDetails?.priority,
    ]);

    const openPriorityEditor = () => {
        if (!canManuallyEditPriority) {
            return;
        }

        setSelectedPriority(
            String(priority || "").toUpperCase()
        );

        setPriorityError("");
        setShowPriorityEditor(true);
    };

    const closePriorityEditor = () => {
        if (isUpdatingPriority) {
            return;
        }

        setSelectedPriority(
            String(priority || "").toUpperCase()
        );

        setPriorityError("");
        setShowPriorityEditor(false);
    };

    const handlePriorityUpdate = async () => {
        if (
            !canManuallyEditPriority ||
            isUpdatingPriority
        ) {
            return;
        }

        if (
            !["P4", "P5"].includes(
                selectedPriority
            )
        ) {
            setPriorityError(
                "Select either P4 or P5."
            );
            return;
        }

        if (
            selectedPriority ===
            String(priority || "").toUpperCase()
        ) {
            setPriorityError(
                "Select a different priority."
            );
            return;
        }

        try {
            setIsUpdatingPriority(true);
            setPriorityError("");

            await api.patch(
                `/tickets/${ticketDetails.id}/priority/`,
                {
                    priority: selectedPriority,
                }
            );

            setShowPriorityEditor(false);

            if (onTicketUpdated) {
                await onTicketUpdated();
            }
        } catch (error) {
            const message =
                error?.response?.data?.error ||
                error?.response?.data?.detail ||
                "Unable to update priority.";

            setPriorityError(message);
        } finally {
            setIsUpdatingPriority(false);
        }
    };
    const openSymptomCodeEditor = () => {
        if (!canEditTicket) {
            return;
        }

        setSymptomCodeError("");
        setShowSymptomCodeEditor(true);
    };

    const closeSymptomCodeEditor = () => {
        if (isUpdatingSymptomCode) {
            return;
        }

        setSymptomCodeError("");
        setShowSymptomCodeEditor(false);
    };

    const handleSymptomCodeUpdate = async (
        symptom
    ) => {
        if (
            !canEditTicket ||
            isUpdatingSymptomCode
        ) {
            return;
        }

        if (!symptom?.id) {
            setSymptomCodeError(
                "Invalid symptom code selected."
            );
            return;
        }

        if (
            String(symptom.code || "")
                .trim()
                .toLowerCase() ===
            String(ticketDetails.symptom_code || "")
                .trim()
                .toLowerCase()
        ) {
            setSymptomCodeError(
                "This ticket already uses that symptom code."
            );
            return;
        }

        try {
            setIsUpdatingSymptomCode(true);
            setSymptomCodeError("");

            await api.patch(
                `/tickets/${ticketDetails.id}/symptom-code/`,
                {
                    symptom_code_id: symptom.id,
                }
            );

            setShowSymptomCodeEditor(false);

            if (onTicketUpdated) {
                await onTicketUpdated();
            }
        } catch (error) {
            const message =
                error?.response?.data?.error ||
                error?.response?.data?.detail ||
                "Unable to update symptom code.";

            setSymptomCodeError(message);

            // Keep the sheet open so the user can
            // see the backend error and try again.
            setShowSymptomCodeEditor(true);
        } finally {
            setIsUpdatingSymptomCode(false);
        }
    };

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={
                    ticketDetails?.id ||
                    ticketDetails?.ticket_code
                }
                variants={panelVariants}
                initial="hidden"
                animate="visible"
                exit={{
                    opacity: 0,
                    x: -8,
                    transition: {
                        duration: 0.15,
                    },
                }}
                className="flex h-full w-full min-w-0 shrink-0 flex-col overflow-hidden border-gray-300 sm:w-[320px] sm:min-w-[320px] lg:w-[320px] lg:min-w-[320px] min-[1280px]:max-[1535px]:w-[320px] min-[1280px]:max-[1535px]:min-w-[320px] 2xl:w-[450px] 2xl:min-w-[450px]"
            >
                {/* Header */}

                <motion.div
                    variants={sectionVariants}
                    className="box-border h-auto shrink-0 border-b border-gray-200 px-4 py-4 sm:px-5 min-[1280px]:max-[1535px]:px-4 min-[1280px]:max-[1535px]:py-3.5 min-[1536px]:max-[1599px]:h-[88px] 2xl:px-6 2xl:py-4 min-[1537px]:max-[1920px]:h-[88px]"
                >
                    <div className="flex min-w-0 items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-2">
                            <motion.div
                                variants={
                                    iconVariants
                                }
                                className="shrink-0"
                            >
                                <Ticket
                                    size={20}
                                    className="text-[#2563EB] min-[1280px]:max-[1535px]:size-[18px]"
                                />
                            </motion.div>

                            <p className="truncate font-semibold tracking-wide text-black min-[1280px]:max-[1535px]:text-[13px]">
                                Ticket Information
                            </p>
                        </div>

                        <motion.p
                            initial={{
                                opacity: 0,
                                x: 5,
                            }}
                            animate={{
                                opacity: 1,
                                x: 0,
                            }}
                            transition={{
                                duration: 0.2,
                                delay: 0.08,
                            }}
                            className="shrink-0 text-xs font-medium text-gray-500"
                        >
                            #
                            {
                                ticketDetails.ticket_code
                            }
                        </motion.p>
                    </div>

                    <p className="mt-1 text-xs text-gray-500 min-[1280px]:max-[1535px]:text-[11px]">
                        View the details and
                        information about the ticket.
                    </p>
                </motion.div>

                {/* Scrollable content */}

                <div className="min-h-0 flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-gray-300">
                    {/* Ticket description */}

                    <motion.div
                        variants={
                            rowContainerVariants
                        }
                        initial="hidden"
                        animate="visible"
                        className="p-4 sm:p-5 min-[1280px]:max-[1535px]:p-4"
                    >
                        <motion.div
                            variants={rowVariants}
                        >
                            <p className="mb-1 text-xs font-medium uppercase text-gray-500">
                                Subject
                            </p>

                            <p className="break-words text-sm font-semibold leading-5 text-black min-[1280px]:max-[1535px]:text-[13px]">
                                {
                                    ticketDetails.subject
                                }
                            </p>
                        </motion.div>

                        <motion.div
                            variants={rowVariants}
                            className="mt-4 min-[1280px]:max-[1535px]:mt-3"
                        >
                            <p className="mb-1 text-xs font-medium uppercase text-gray-500">
                                Description
                            </p>

                            <p className="whitespace-pre-wrap break-words text-sm leading-6 text-black min-[1280px]:max-[1535px]:text-[13px] min-[1280px]:max-[1535px]:leading-5">
                                {
                                    ticketDetails.description
                                }
                            </p>
                        </motion.div>

                        {ticketDetails.business_impact && (
                            <motion.div
                                variants={
                                    rowVariants
                                }
                                className="mt-4 min-[1280px]:max-[1535px]:mt-3"
                            >
                                <p className="mb-1 text-xs font-medium uppercase text-gray-500">
                                    Business Impact
                                </p>

                                <p className="whitespace-pre-wrap break-words text-sm leading-6 text-black min-[1280px]:max-[1535px]:text-[13px] min-[1280px]:max-[1535px]:leading-5">
                                    {
                                        ticketDetails.business_impact
                                    }
                                </p>
                            </motion.div>
                        )}
                    </motion.div>

                    {/* Ticket details */}

                    <motion.div
                        variants={
                            rowContainerVariants
                        }
                        initial="hidden"
                        animate="visible"
                        className="px-4 pb-5 sm:px-5 min-[1280px]:max-[1535px]:px-4 min-[1280px]:max-[1535px]:pb-4"
                    >
                        <div className="space-y-3 min-[1280px]:max-[1535px]:space-y-3.5">
                            {/* Status */}

                            <DetailRow
                                icon={CircleDot}
                                label="Status"
                            >
                                <div className="flex min-w-0 flex-wrap items-center gap-2">
                                    <motion.span
                                        variants={
                                            badgeVariants
                                        }
                                        className={`inline-flex whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium ${
                                            statusColor[
                                                ticketDetails
                                                    .status
                                            ] ||
                                            "border border-gray-300 bg-gray-100 text-gray-700"
                                        }`}
                                    >
                                        {ticketDetails.status ||
                                            "-"}
                                    </motion.span>

                                    {ticketDetails.is_escalated && (
                                        <motion.span
                                            variants={
                                                badgeVariants
                                            }
                                            className="inline-flex whitespace-nowrap rounded-md border border-orange-200 bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-600"
                                        >
                                            Escalated
                                        </motion.span>
                                    )}
                                </div>
                            </DetailRow>

                            {/* Priority */}

                            <DetailRow
                                icon={CircleAlert}
                                label="Priority"
                            >
                                <div className="relative min-w-0">
                                    <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
                                        <motion.span
                                            key={
                                                priority
                                            }
                                            variants={
                                                badgeVariants
                                            }
                                            initial="hidden"
                                            animate="visible"
                                            className={`inline-flex whitespace-nowrap rounded-md border px-2.5 py-1 text-xs font-semibold ${
                                                priorityColor[
                                                    priority
                                                ] ||
                                                "border border-gray-300 bg-gray-100 text-gray-600"
                                            }`}
                                        >
                                            {priorityLabel[
                                                priority
                                            ] ||
                                                priority ||
                                                "-"}
                                        </motion.span>

                                        {canManuallyEditPriority && (
                                            <EditButton
                                                label="Edit priority"
                                                onClick={
                                                    openPriorityEditor
                                                }
                                            />
                                        )}
                                    </div>

                                    <AnimatePresence>
                                        {showPriorityEditor && (
                                            <motion.div
                                                initial={{
                                                    opacity: 0,
                                                    y: -8,
                                                    scale: 0.96,
                                                }}
                                                animate={{
                                                    opacity: 1,
                                                    y: 0,
                                                    scale: 1,
                                                }}
                                                exit={{
                                                    opacity: 0,
                                                    y: -6,
                                                    scale: 0.97,
                                                }}
                                                transition={{
                                                    duration: 0.18,
                                                    ease: "easeOut",
                                                }}
                                                className="absolute right-0 top-full z-40 mt-2 w-[250px] origin-top-right rounded-xl border border-gray-200 bg-white p-3 shadow-xl"
                                            >
                                                <div>
                                                    <p className="text-sm font-semibold text-black">
                                                        Change
                                                        Priority
                                                    </p>

                                                    <p className="mt-0.5 text-xs leading-4 text-gray-500">
                                                        Select
                                                        P4 or
                                                        P5 for
                                                        this
                                                        ticket.
                                                    </p>
                                                </div>

                                                <div className="mt-3 space-y-2">
                                                    {[
                                                        "P4",
                                                        "P5",
                                                    ].map(
                                                        (
                                                            option
                                                        ) => {
                                                            const isSelected =
                                                                selectedPriority ===
                                                                option;

                                                            const isCurrent =
                                                                String(
                                                                    priority ||
                                                                        ""
                                                                ).toUpperCase() ===
                                                                option;

                                                            return (
                                                                <motion.button
                                                                    key={
                                                                        option
                                                                    }
                                                                    type="button"
                                                                    disabled={
                                                                        isUpdatingPriority
                                                                    }
                                                                    onClick={() => {
                                                                        setSelectedPriority(
                                                                            option
                                                                        );
                                                                        setPriorityError(
                                                                            ""
                                                                        );
                                                                    }}
                                                                    whileHover={
                                                                        !isUpdatingPriority
                                                                            ? {
                                                                                  y: -1,
                                                                              }
                                                                            : undefined
                                                                    }
                                                                    whileTap={
                                                                        !isUpdatingPriority
                                                                            ? {
                                                                                  scale: 0.98,
                                                                              }
                                                                            : undefined
                                                                    }
                                                                    className={`flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left transition-colors ${
                                                                        isSelected
                                                                            ? "border-[#4C4CF9] bg-[#4C4CF9]/5"
                                                                            : "border-gray-200 bg-white hover:bg-gray-50"
                                                                    } disabled:cursor-not-allowed disabled:opacity-60`}
                                                                >
                                                                    <div className="min-w-0">
                                                                        <div className="flex items-center gap-2">
                                                                            <p className="text-sm font-semibold text-black">
                                                                                {
                                                                                    option
                                                                                }
                                                                            </p>

                                                                            {isCurrent && (
                                                                                <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[9px] font-medium text-gray-500">
                                                                                    Current
                                                                                </span>
                                                                            )}
                                                                        </div>

                                                                        <p className="mt-0.5 truncate text-[11px] text-gray-500">
                                                                            {priorityLabel[
                                                                                option
                                                                            ] ||
                                                                                option}
                                                                        </p>
                                                                    </div>

                                                                    <span
                                                                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                                                                            isSelected
                                                                                ? "border-[#4C4CF9]"
                                                                                : "border-gray-300"
                                                                        }`}
                                                                    >
                                                                        <AnimatePresence>
                                                                            {isSelected && (
                                                                                <motion.span
                                                                                    initial={{
                                                                                        scale: 0,
                                                                                    }}
                                                                                    animate={{
                                                                                        scale: 1,
                                                                                    }}
                                                                                    exit={{
                                                                                        scale: 0,
                                                                                    }}
                                                                                    transition={{
                                                                                        duration: 0.12,
                                                                                    }}
                                                                                    className="h-2 w-2 rounded-full bg-[#4C4CF9]"
                                                                                />
                                                                            )}
                                                                        </AnimatePresence>
                                                                    </span>
                                                                </motion.button>
                                                            );
                                                        }
                                                    )}
                                                </div>

                                                <AnimatePresence>
                                                    {priorityError && (
                                                        <motion.div
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
                                                                y: -2,
                                                            }}
                                                            transition={{
                                                                duration: 0.15,
                                                            }}
                                                            className="mt-2 rounded-md border border-red-100 bg-red-50 px-2.5 py-2"
                                                        >
                                                            <p className="text-xs leading-4 text-red-600">
                                                                {
                                                                    priorityError
                                                                }
                                                            </p>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>

                                                <div className="mt-3 flex items-center justify-end gap-2 border-t border-gray-100 pt-3">
                                                    <motion.button
                                                        type="button"
                                                        disabled={
                                                            isUpdatingPriority
                                                        }
                                                        onClick={
                                                            closePriorityEditor
                                                        }
                                                        whileTap={
                                                            !isUpdatingPriority
                                                                ? {
                                                                      scale: 0.97,
                                                                  }
                                                                : undefined
                                                        }
                                                        className="rounded-md px-3 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-100 hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
                                                    >
                                                        Cancel
                                                    </motion.button>

                                                    <motion.button
                                                        type="button"
                                                        disabled={
                                                            isUpdatingPriority ||
                                                            selectedPriority ===
                                                                String(
                                                                    priority ||
                                                                        ""
                                                                ).toUpperCase()
                                                        }
                                                        onClick={
                                                            handlePriorityUpdate
                                                        }
                                                        whileHover={
                                                            !isUpdatingPriority &&
                                                            selectedPriority !==
                                                                String(
                                                                    priority ||
                                                                        ""
                                                                ).toUpperCase()
                                                                ? {
                                                                      y: -1,
                                                                  }
                                                                : undefined
                                                        }
                                                        whileTap={
                                                            !isUpdatingPriority &&
                                                            selectedPriority !==
                                                                String(
                                                                    priority ||
                                                                        ""
                                                                ).toUpperCase()
                                                                ? {
                                                                      scale: 0.97,
                                                                  }
                                                                : undefined
                                                        }
                                                        className="min-w-[62px] rounded-md bg-[#4C4CF9] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#3f3fe5] disabled:cursor-not-allowed disabled:opacity-50"
                                                    >
                                                        {isUpdatingPriority
                                                            ? "Saving..."
                                                            : "Save"}
                                                    </motion.button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </DetailRow>

                            {/* Classification */}

                            {canViewClassification && (
                                <>
                                    <DetailRow
                                        icon={
                                            Stethoscope
                                        }
                                        label="Symptom Code"
                                    >
                                        <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
                                            <span className="min-w-0 break-words text-sm font-medium text-black min-[1280px]:max-[1535px]:text-[13px]">
                                                {ticketDetails.symptom_code ||
                                                    "-"}
                                            </span>

                                            {canEditTicket && (
                                                <EditButton
                                                    label="Edit symptom code"
                                                    onClick={openSymptomCodeEditor}
                                                />
                                            )}
                                        </div>
                                    </DetailRow>

                                    <DetailRow
                                        icon={Tags}
                                        label="Category"
                                    >
                                        <span className="break-words text-sm font-medium text-black min-[1280px]:max-[1535px]:text-[13px]">
                                            {ticketDetails.category ||
                                                "-"}
                                        </span>
                                    </DetailRow>
                                </>
                            )}

                            {/* Affected scope */}

                            <DetailRow
                                icon={Users}
                                label="Affected Scope"
                            >
                                <motion.span
                                    variants={
                                        badgeVariants
                                    }
                                    className={`inline-flex whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-semibold ${
                                        affectedScopeColor[
                                            affectedScope
                                        ] ||
                                        "border border-gray-300 bg-gray-100 text-gray-700"
                                    }`}
                                >
                                    {affectedScopeLabel[
                                        affectedScope
                                    ] ||
                                        affectedScope ||
                                        "-"}
                                </motion.span>
                            </DetailRow>

                            {/* Last updated */}

                            <DetailRow
                                icon={History}
                                label="Last Updated"
                            >
                                <span className="block whitespace-nowrap text-sm font-medium text-black min-[1280px]:max-[1535px]:text-[13px]">
                                    {formatDate(
                                        ticketDetails.updated_at
                                    )}
                                </span>
                            </DetailRow>

                            {/* Submitted at */}

                            <DetailRow
                                icon={CalendarDays}
                                label="Submitted at"
                            >
                                <span className="block whitespace-nowrap text-sm font-medium text-black min-[1280px]:max-[1535px]:text-[13px]">
                                    {formatDate(
                                        ticketDetails.created_at
                                    )}
                                </span>
                            </DetailRow>

                            {/* Assigned to */}

                            <DetailRow
                                icon={UserRound}
                                label="Assigned to"
                            >
                                {ticketDetails.assigned_to ? (
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-black min-[1280px]:max-[1535px]:text-[13px]">
                                            {
                                                assignedName
                                            }
                                        </p>

                                        <p className="break-words text-xs leading-4 text-gray-500">
                                            {
                                                assignedRole
                                            }
                                        </p>
                                    </div>
                                ) : (
                                    <span className="whitespace-nowrap text-sm font-medium text-gray-500 min-[1280px]:max-[1535px]:text-[13px]">
                                        Unassigned
                                    </span>
                                )}
                            </DetailRow>

                            {/* SLA deadline */}

                            <DetailRow
                                icon={Wrench}
                                label="SLA Deadline"
                            >
                                <span className="block whitespace-nowrap text-sm font-medium text-black min-[1280px]:max-[1535px]:text-[13px]">
                                    {formatDate(
                                        ticketDetails.resolution_deadline
                                    )}
                                </span>
                            </DetailRow>

                            {/* SLA status */}

                            <DetailRow
                                icon={CircleAlert}
                                label="SLA Status"
                            >
                                <SLAStatusBadge
                                    status={
                                        ticketDetails.resolution_sla_status
                                    }
                                />
                            </DetailRow>
                        </div>
                    </motion.div>

                    {/* Requester information */}

                    <motion.div
                        variants={sectionVariants}
                        initial="hidden"
                        animate="visible"
                        className="border-t border-gray-200 p-4 sm:p-5 min-[1280px]:max-[1535px]:p-4"
                    >
                        <div className="mb-4 flex items-center gap-2 min-[1280px]:max-[1535px]:mb-3">
                            <motion.div
                                initial={{
                                    opacity: 0,
                                    rotate: -8,
                                    scale: 0.8,
                                }}
                                animate={{
                                    opacity: 1,
                                    rotate: 0,
                                    scale: 1,
                                }}
                                transition={{
                                    duration: 0.25,
                                    ease: "easeOut",
                                }}
                            >
                                <SquareUserRound
                                    size={20}
                                    className="shrink-0 text-[#2563EB] min-[1280px]:max-[1535px]:size-[18px]"
                                />
                            </motion.div>

                            <p className="font-semibold text-black min-[1280px]:max-[1535px]:text-[13px]">
                                Requester
                                Information
                            </p>
                        </div>

                        <motion.div
                            variants={cardVariants}
                            className="rounded-lg border border-gray-200 bg-white p-4 min-[1280px]:max-[1535px]:p-3"
                        >
                            <div className="flex flex-col gap-4 sm:grid sm:grid-cols-[minmax(0,1fr)_100px] sm:items-start min-[1280px]:max-[1535px]:gap-3 2xl:grid-cols-[minmax(0,1fr)_140px] 2xl:gap-4">
                                <div className="flex min-w-0 items-center gap-3">
                                    <RequesterAvatar
                                        name={
                                            requesterName
                                        }
                                    />

                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold text-black min-[1280px]:max-[1535px]:text-[13px]">
                                            {
                                                requesterName
                                            }
                                        </p>

                                        <p className="mt-0.5 text-xs text-gray-500">
                                            Employee
                                        </p>
                                    </div>
                                </div>

                                <div className="min-w-0">
                                    <p className="mb-1 text-xs text-gray-500">
                                        Employee ID
                                    </p>

                                    <p className="break-words text-sm font-medium text-black min-[1280px]:max-[1535px]:text-[13px]">
                                        {ticketDetails.user_code ||
                                            "-"}
                                    </p>
                                </div>
                            </div>

                            <div className="my-4 border-t border-gray-200 min-[1280px]:max-[1535px]:my-3" />

                            <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2 min-[1280px]:max-[1535px]:gap-x-4 min-[1280px]:max-[1535px]:gap-y-3">
                                <RequesterField
                                    label="Department"
                                    value={
                                        ticketDetails.employee_department
                                    }
                                />

                                <RequesterField
                                    label="Office Location"
                                    value={
                                        ticketDetails.office_location
                                    }
                                />

                                <RequesterField
                                    label="Workstation"
                                    value={
                                        ticketDetails.workstation
                                    }
                                />
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
                        </motion.div>

            <SymptomCodeSheet
                open={showSymptomCodeEditor}
                onClose={closeSymptomCodeEditor}
                onSelect={handleSymptomCodeUpdate}
                onlyCategory={
                    ticketDetails.category
                }
            />

            <AnimatePresence>
                {symptomCodeError &&
                    showSymptomCodeEditor && (
                        <motion.div
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
                                y: 8,
                            }}
                            className="fixed bottom-5 right-5 z-[60] max-w-sm rounded-lg border border-red-200 bg-red-50 px-4 py-3 shadow-lg"
                        >
                            <p className="text-sm font-medium text-red-700">
                                {
                                    symptomCodeError
                                }
                            </p>
                        </motion.div>
                    )}
            </AnimatePresence>
        </AnimatePresence>
    );
}

function DetailRow({
    icon: Icon,
    label,
    children,
}) {
    return (
        <motion.div
            variants={rowVariants}
            className="grid grid-cols-[120px_minmax(0,1fr)] items-start gap-2 sm:grid-cols-[135px_minmax(0,1fr)] sm:gap-3 lg:grid-cols-[145px_minmax(0,1fr)] xl:grid-cols-[130px_minmax(0,1fr)] xl:gap-0 2xl:grid-cols-[180px_minmax(0,1fr)] 2xl:gap-3"
        >
            <div className="flex min-w-0 items-center gap-2 sm:gap-2 xl:gap-1.5">
                <motion.div
                    variants={iconVariants}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#4C4CF9] min-[1280px]:max-[1535px]:h-6 min-[1280px]:max-[1535px]:w-6"
                >
                    <Icon
                        size={17}
                        className="text-white min-[1280px]:max-[1535px]:size-[15px]"
                    />
                </motion.div>

                <span className="truncate text-sm text-gray-500 min-[1280px]:max-[1535px]:text-[12px]">
                    {label}
                </span>
            </div>

            <div className="min-w-0 break-words">
                {children}
            </div>
        </motion.div>
    );
}

function SLAStatusBadge({ status }) {
    const normalizedStatus = String(
        status || ""
    ).toUpperCase();

    const statusStyles = {
        SAFE:
            "border border-green-200 bg-green-50 text-green-700",
        WARNING:
            "border border-yellow-200 bg-yellow-50 text-yellow-700",
        CRITICAL:
            "border border-orange-200 bg-orange-50 text-orange-700",
        BREACHED:
            "border border-red-200 bg-red-50 text-red-700",
        MET:
            "border border-blue-200 bg-blue-50 text-blue-700",
    };

    const statusLabels = {
        SAFE: "Safe",
        WARNING: "Warning",
        CRITICAL: "Critical",
        BREACHED: "Breached",
        MET: "Met",
    };

    if (!normalizedStatus) {
        return (
            <span className="text-sm font-medium text-gray-500 min-[1280px]:max-[1535px]:text-[13px]">
                -
            </span>
        );
    }

    return (
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
                duration: 0.2,
                ease: "easeOut",
            }}
            className={`inline-flex whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-semibold ${
                statusStyles[normalizedStatus] ||
                "border border-gray-300 bg-gray-100 text-gray-700"
            }`}
        >
            {statusLabels[normalizedStatus] ||
                normalizedStatus}
        </motion.span>
    );
}

function RequesterAvatar({ name }) {
    const initials = getInitials(name);

    return (
        <motion.div
            variants={avatarVariants}
            whileHover={{
                scale: 1.05,
            }}
            transition={{
                duration: 0.18,
            }}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#4C4CF9]/10 text-sm font-semibold text-[#4C4CF9] min-[1280px]:max-[1535px]:h-10 min-[1280px]:max-[1535px]:w-10 min-[1280px]:max-[1535px]:text-xs"
        >
            {initials}
        </motion.div>
    );
}

function RequesterField({
    label,
    value,
}) {
    return (
        <motion.div
            variants={rowVariants}
            className="min-w-0"
        >
            <p className="mb-1 text-xs text-gray-500">
                {label}
            </p>

            <p className="break-words text-sm font-medium text-black min-[1280px]:max-[1535px]:text-[13px]">
                {value || "-"}
            </p>
        </motion.div>
    );
}

/* Edit button */

function EditButton({
    label,
    onClick,
}) {
    return (
        <motion.button
            type="button"
            onClick={onClick}
            aria-label={label}
            title={label}
            whileHover={{
                scale: 1.04,
            }}
            whileTap={{
                scale: 0.94,
            }}
            transition={{
                duration: 0.12,
            }}
            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md border border-gray-300 bg-white text-gray-600 transition-colors hover:border-gray-400 hover:bg-gray-50 hover:text-black min-[1280px]:max-[1535px]:h-7 min-[1280px]:max-[1535px]:w-7"
        >
            <Pencil
                size={15}
                className="min-[1280px]:max-[1535px]:size-[14px]"
            />
        </motion.button>
    );
}

/* Initials */

function getInitials(name) {
    if (
        !name ||
        name === "Unassigned"
    ) {
        return "?";
    }

    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) =>
            part.charAt(0).toUpperCase()
        )
        .join("");
}