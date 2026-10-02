
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
    CircleAlert,
    ClipboardCheck,
    Ticket,
    Sparkles,
    Search,
    Pencil,
    MessageSquareText,
    X,
    Check,
    LoaderCircle,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import api from "/src/api";
import SymptomCodeSheet from "./SymptomCodeSheet";
import { affectedScopeLabel, affectedScopeColor } from "../../utils/affectedScopeColor";

const toastStyle = {
    background: "#ffffff",
    color: "#000000",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    padding: "16px",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
};

const pageTransition = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.35, ease: "easeOut" },
};

const sectionTransition = {
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3, ease: "easeOut" },
};

export default function UnclearDescriptionReview({ flag }) {
    const navigate = useNavigate();

    const [sheetOpen, setSheetOpen] = useState(false);
    const [selectedSymptom, setSelectedSymptom] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [requestingClarification, setRequestingClarification] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [remarks, setRemarks] = useState("");

    const openConfirmModal = () => {
        if (!selectedSymptom || submitting) return;
        setRemarks("");
        setShowConfirm(true);
    };

    const closeConfirmModal = () => {
        if (submitting) return;
        setShowConfirm(false);
        setRemarks("");
    };

    // MANUAL CLASSIFICATION
    // This endpoint expects the ReviewFlags ID, not the Ticket ID.
    const handleManualClassify = async () => {
        if (!selectedSymptom || submitting || requestingClarification) return;

        const trimmedRemarks = remarks.trim();

        if (trimmedRemarks.length < 40) {
            toast.error("Review remarks are too short", {
                description: "Please provide at least 40 characters explaining the review.",
                duration: 4000,
                style: toastStyle,
            });
            return;
        }

        const flagId = flag.id;

        if (!flagId) {
            toast.error("Unable to classify ticket", {
                description: "The review flag ID could not be found in the review data.",
                duration: 4000,
                style: toastStyle,
            });
            return;
        }

        try {
            setSubmitting(true);

            const response = await api.post(
                `/tickets/flagged/${flagId}/manual-classify/`,
                {
                    symptom_code: selectedSymptom,
                    remarks: trimmedRemarks,
                }
            );

            setShowConfirm(false);
            setRemarks("");

            toast.success("Ticket manually classified", {
                description: `${response.data.ticket.ticket_code} was classified as ${response.data.ticket.symptom_code}.`,
                duration: 4000,
                style: toastStyle,
            });

            navigate("/dashboard");
        } catch (error) {
            toast.error("Unable to classify ticket", {
                description:
                    error.response?.data?.message ||
                    "Something went wrong while manually classifying the ticket.",
                duration: 4000,
                style: toastStyle,
            });
        } finally {
            setSubmitting(false);
        }
    };

    // REQUEST CLARIFICATION
    // This endpoint expects the actual Ticket ID.
    const handleRequestClarification = async () => {
        if (requestingClarification || submitting) return;

        const ticketId = flag.ticket_id;

        if (!ticketId) {
            toast.error("Unable to request clarification", {
                description: "The ticket ID could not be found in the review data. Please refresh the review list and try again.",
                duration: 4000,
                style: toastStyle,
            });
            return;
        }

        try {
            setRequestingClarification(true);

            const response = await api.post(
                `/tickets/flagged/${ticketId}/request-clarification/`
            );

            toast.success("Clarification requested", {
                description:
                    response.data.message ||
                    `The employee has been notified to provide more details for ticket ${flag.ticket_code || ""}.`,
                duration: 4000,
                style: toastStyle,
            });

            navigate("/dashboard");
        } catch (error) {
            toast.error("Unable to request clarification", {
                description:
                    error.response?.data?.message ||
                    error.response?.data?.detail ||
                    "Something went wrong while requesting clarification.",
                duration: 4000,
                style: toastStyle,
            });
        } finally {
            setRequestingClarification(false);
        }
    };

    const submittedByName =
        `${flag.first_name || ""} ${flag.last_name || ""}`.trim();

    const isBusy = submitting || requestingClarification;

    const scopeKey = String(flag.affected_scope || "").trim().toLowerCase();
    const scopeLabel =
        affectedScopeLabel[scopeKey] ||
        (scopeKey
            ? scopeKey.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase())
            : "-");
    const scopeColor =
        affectedScopeColor[scopeKey] ||
        "bg-gray-100 text-gray-700 border border-gray-300";

    return (
        <>
            <motion.div
                {...pageTransition}
                className="space-y-5 motion-reduce:transform-none"
            >
                <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[1.35fr_1fr] min-[1280px]:max-[1365px]:gap-3 min-[1366px]:max-[1537px]:gap-4">
                    {/* TICKET INFORMATION */}
                    <motion.div
                        {...sectionTransition}
                        transition={{ ...sectionTransition.transition, delay: 0.04 }}
                        className="max-h-[720px] overflow-y-auto rounded-md border border-gray-300 bg-white [&::-webkit-scrollbar]:w-px [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-gray-300"
                    >
                        <div className="flex items-center gap-3 border-b border-gray-300 px-6 py-4 min-[1280px]:max-[1365px]:gap-2.5 min-[1280px]:max-[1365px]:px-4 min-[1280px]:max-[1365px]:py-3 min-[1366px]:max-[1537px]:gap-2.5 min-[1366px]:max-[1537px]:px-5 min-[1366px]:max-[1537px]:py-3.5">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-gray-100 min-[1280px]:max-[1365px]:h-8 min-[1280px]:max-[1365px]:w-8 min-[1366px]:max-[1537px]:h-8 min-[1366px]:max-[1537px]:w-8">
                                <Ticket size={19} className="text-black min-[1280px]:max-[1365px]:size-[16px] min-[1366px]:max-[1537px]:size-[17px]" />
                            </div>

                            <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-3">
                                    <h2 className="font-semibold text-black min-[1280px]:max-[1537px]:text-sm">
                                        Ticket Information
                                    </h2>

                                    <span className={`shrink-0 rounded-md border px-2.5 py-1 text-xs font-medium min-[1280px]:max-[1365px]:px-2 min-[1280px]:max-[1365px]:py-0.5 min-[1280px]:max-[1365px]:text-[10px] min-[1366px]:max-[1537px]:px-2 min-[1366px]:max-[1537px]:py-0.5 min-[1366px]:max-[1537px]:text-[11px] ${getStatusStyle(flag.status)}`}>
                                        {formatStatus(flag.status)}
                                    </span>
                                </div>

                                <p className="mt-0.5 text-xs text-gray-500 min-[1280px]:max-[1365px]:text-[10px] min-[1366px]:max-[1537px]:text-[11px]">
                                    Information submitted by the employee.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 border-b border-gray-300 sm:grid-cols-2">
                            <div className="border-b border-gray-300 px-6 py-4 sm:border-b-0 sm:border-r min-[1280px]:max-[1365px]:px-4 min-[1280px]:max-[1365px]:py-3 min-[1366px]:max-[1537px]:px-5 min-[1366px]:max-[1537px]:py-3.5">
                                <p className="text-xs font-semibold uppercase text-gray-500 min-[1280px]:max-[1365px]:text-[10px] min-[1366px]:max-[1537px]:text-[11px]">
                                    Ticket Code
                                </p>
                                <p className="mt-2 text-sm font-medium text-black min-[1280px]:max-[1365px]:mt-1.5 min-[1280px]:max-[1365px]:text-xs min-[1366px]:max-[1537px]:mt-1.5 min-[1366px]:max-[1537px]:text-xs">
                                    {flag.ticket_code || "-"}
                                </p>
                            </div>

                            <div className="px-6 py-4 min-[1280px]:max-[1365px]:px-4 min-[1280px]:max-[1365px]:py-3 min-[1366px]:max-[1537px]:px-5 min-[1366px]:max-[1537px]:py-3.5">
                                <p className="text-xs font-semibold uppercase text-gray-500 min-[1280px]:max-[1365px]:text-[10px] min-[1366px]:max-[1537px]:text-[11px]">
                                    Affected Scope
                                </p>

                                <div className="mt-2 min-[1280px]:max-[1365px]:mt-1.5">
                                    <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ${scopeColor} min-[1280px]:max-[1537px]:px-2 min-[1280px]:max-[1537px]:py-0.5 min-[1280px]:max-[1537px]:text-[11px]`}>
                                        {scopeLabel}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <InfoField label="Subject" value={flag.subject} />
                        <InfoField label="Description" value={flag.description} multiline />
                        <InfoField label="Business Impact" value={flag.business_impact} multiline />

                        <div className="px-6 py-5 min-[1280px]:max-[1365px]:px-4 min-[1280px]:max-[1365px]:py-4 min-[1366px]:max-[1537px]:px-5 min-[1366px]:max-[1537px]:py-4">
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 min-[1280px]:max-[1537px]:gap-4">
                                <div className="min-w-0">
                                    <p className="text-xs font-medium uppercase text-gray-500 min-[1280px]:max-[1365px]:text-[10px] min-[1366px]:max-[1537px]:text-[11px]">
                                        Ticket Submitted By
                                    </p>

                                    <div className="mt-3 flex items-center gap-3 min-[1280px]:max-[1365px]:mt-2 min-[1280px]:max-[1365px]:gap-2 min-[1366px]:max-[1537px]:mt-2.5 min-[1366px]:max-[1537px]:gap-2.5">
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#4C4CF9]/10 text-xs font-semibold text-[#4C4CF9] min-[1280px]:max-[1365px]:h-8 min-[1280px]:max-[1365px]:w-8 min-[1280px]:max-[1365px]:text-[10px] min-[1366px]:max-[1537px]:h-8 min-[1366px]:max-[1537px]:w-8 min-[1366px]:max-[1537px]:text-[11px]">
                                            {getInitials(submittedByName)}
                                        </div>

                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold text-black min-[1280px]:max-[1537px]:text-xs">
                                                {submittedByName || "-"}
                                            </p>
                                            <p className="mt-1 truncate text-xs text-gray-500 min-[1280px]:max-[1365px]:mt-0.5 min-[1280px]:max-[1365px]:text-[10px] min-[1366px]:max-[1537px]:mt-0.5 min-[1366px]:max-[1537px]:text-[11px]">
                                                {flag.user_code || "-"}{flag.role ? ` • ${flag.role}` : ""}
                                            </p>
                                            <p className="mt-0.5 truncate text-xs text-gray-500 min-[1280px]:max-[1365px]:text-[10px] min-[1366px]:max-[1537px]:text-[11px]">
                                                {flag.employee_department || "-"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="min-w-0">
                                    <p className="text-xs font-medium uppercase text-gray-500 min-[1280px]:max-[1365px]:text-[10px] min-[1366px]:max-[1537px]:text-[11px]">
                                        Ticket Submitted At
                                    </p>
                                    <p className="mt-3 text-sm font-medium text-black min-[1280px]:max-[1365px]:mt-2 min-[1280px]:max-[1365px]:text-xs min-[1366px]:max-[1537px]:mt-2.5 min-[1366px]:max-[1537px]:text-xs">
                                        {flag.created_at ? formatDate(flag.created_at) : flag.submitted_at ? formatDate(flag.submitted_at) : "-"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* REVIEW DESCRIPTION */}
                    <motion.div
                        {...sectionTransition}
                        transition={{ ...sectionTransition.transition, delay: 0.1 }}
                        className="overflow-hidden rounded-md border border-gray-300 bg-white"
                    >
                        <div className="flex items-start gap-3 border-b border-gray-300 px-6 py-4 min-[1280px]:max-[1365px]:gap-2.5 min-[1280px]:max-[1365px]:px-4 min-[1280px]:max-[1365px]:py-3 min-[1366px]:max-[1537px]:gap-2.5 min-[1366px]:max-[1537px]:px-5 min-[1366px]:max-[1537px]:py-3.5">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-gray-100 min-[1280px]:max-[1365px]:h-8 min-[1280px]:max-[1365px]:w-8 min-[1366px]:max-[1537px]:h-8 min-[1366px]:max-[1537px]:w-8">
                                <ClipboardCheck size={19} className="text-black min-[1280px]:max-[1365px]:size-[16px] min-[1366px]:max-[1537px]:size-[17px]" />
                            </div>
                            <div className="min-w-0">
                                <h2 className="font-semibold text-black min-[1280px]:max-[1537px]:text-sm">
                                    Review Description
                                </h2>
                                <p className="mt-0.5 text-xs text-gray-500 min-[1280px]:max-[1365px]:text-[10px] min-[1366px]:max-[1537px]:text-[11px]">
                                    Determine whether the ticket contains enough information for classification.
                                </p>
                            </div>
                        </div>

                        <div className="p-6 min-[1280px]:max-[1365px]:p-4 min-[1366px]:max-[1537px]:p-5">
                            <div className="rounded-md border border-gray-300 bg-gray-50 px-4 py-3 min-[1280px]:max-[1365px]:px-3 min-[1280px]:max-[1365px]:py-2.5 min-[1366px]:max-[1537px]:px-3.5 min-[1366px]:max-[1537px]:py-2.5">
                                <p className="text-xs font-semibold uppercase text-gray-500 min-[1280px]:max-[1365px]:text-[10px] min-[1366px]:max-[1537px]:text-[11px]">
                                    Review Reason
                                </p>
                                <div className="mt-2 flex items-center gap-2">
                                    <CircleAlert size={17} className="shrink-0 text-red-600 min-[1280px]:max-[1365px]:size-[15px] min-[1366px]:max-[1537px]:size-[16px]" />
                                    <p className="text-sm font-semibold text-black min-[1280px]:max-[1537px]:text-xs">
                                        {flag.reason || "Unclear Description"}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 min-[1280px]:max-[1365px]:mt-4 min-[1366px]:max-[1537px]:mt-5">
                                <label className="text-xs font-medium uppercase text-gray-500 min-[1280px]:max-[1365px]:text-[10px] min-[1366px]:max-[1537px]:text-[11px]">
                                    Select Correct Symptom Code
                                </label>

                                <button
                                    type="button"
                                    onClick={() => setSheetOpen(true)}
                                    disabled={isBusy}
                                    className="mt-2 flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-3 text-left transition hover:bg-gray-50 focus:border-[#4C4CF9] focus:ring-2 focus:ring-[#4C4CF9]/10 disabled:cursor-not-allowed disabled:opacity-60 min-[1280px]:max-[1365px]:px-3 min-[1280px]:max-[1365px]:py-2.5 min-[1366px]:max-[1537px]:px-3.5 min-[1366px]:max-[1537px]:py-2.5"
                                >
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium text-black min-[1280px]:max-[1537px]:text-xs">
                                            {selectedSymptom || "Select symptom code"}
                                        </p>
                                        {!selectedSymptom && (
                                            <p className="mt-0.5 text-xs text-gray-500 min-[1280px]:max-[1365px]:text-[10px] min-[1366px]:max-[1537px]:text-[11px]">
                                                Search and select the correct classification
                                            </p>
                                        )}
                                    </div>
                                    <Search size={17} className="ml-3 shrink-0 text-gray-400 min-[1280px]:max-[1365px]:size-[15px] min-[1366px]:max-[1537px]:size-[16px]" />
                                </button>
                            </div>

                            <AnimatePresence initial={false}>
                                {selectedSymptom && (
                                    <motion.div
                                        key="selected-classification"
                                        initial={{ opacity: 0, height: 0, y: -6 }}
                                        animate={{ opacity: 1, height: "auto", y: 0 }}
                                        exit={{ opacity: 0, height: 0, y: -6 }}
                                        transition={{ duration: 0.22 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="mt-4 rounded-lg border border-[#4C4CF9]/30 bg-[#4C4CF9]/5 px-4 py-3.5 min-[1280px]:max-[1365px]:mt-3 min-[1280px]:max-[1365px]:px-3 min-[1280px]:max-[1365px]:py-3 min-[1366px]:max-[1537px]:mt-3 min-[1366px]:max-[1537px]:px-3.5 min-[1366px]:max-[1537px]:py-3">
                                            <p className="text-xs font-semibold uppercase text-gray-500 min-[1280px]:max-[1365px]:text-[10px] min-[1366px]:max-[1537px]:text-[11px]">
                                                Selected Classification
                                            </p>
                                            <div className="mt-2 flex items-center justify-between gap-3">
                                                <div className="flex min-w-0 items-center gap-2">
                                                    <Pencil size={15} className="text-[#4C4CF9] min-[1280px]:max-[1365px]:size-[14px]" />
                                                    <p className="truncate text-sm font-semibold text-black min-[1280px]:max-[1537px]:text-xs">
                                                        {selectedSymptom}
                                                    </p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setSheetOpen(true)}
                                                    disabled={isBusy}
                                                    className="shrink-0 text-xs font-medium text-[#4C4CF9] hover:underline disabled:opacity-50 min-[1280px]:max-[1365px]:text-[10px] min-[1366px]:max-[1537px]:text-[11px]"
                                                >
                                                    Change
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* ACTION BUTTONS */}
                            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 min-[1280px]:max-[1365px]:mt-4 min-[1280px]:max-[1365px]:gap-2 min-[1366px]:max-[1537px]:mt-4 min-[1366px]:max-[1537px]:gap-2.5">
                                <motion.button
                                    type="button"
                                    whileHover={selectedSymptom && !isBusy ? { y: -1 } : undefined}
                                    whileTap={selectedSymptom && !isBusy ? { scale: 0.98 } : undefined}
                                    onClick={openConfirmModal}
                                    disabled={!selectedSymptom || isBusy}
                                    className={`flex h-10 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium transition min-[1280px]:max-[1365px]:h-9 min-[1280px]:max-[1365px]:gap-1.5 min-[1280px]:max-[1365px]:px-2.5 min-[1280px]:max-[1365px]:text-[11px] min-[1366px]:max-[1537px]:h-9 min-[1366px]:max-[1537px]:px-3 min-[1366px]:max-[1537px]:text-xs ${selectedSymptom && !isBusy ? "cursor-pointer border-[#4C4CF9] bg-[#4C4CF9] text-white hover:bg-[#4242e8]" : "cursor-not-allowed border-gray-300 bg-gray-100 text-gray-400"}`}
                                >
                                    {submitting ? (
                                        <LoaderCircle size={16} className="animate-spin" />
                                    ) : (
                                        <Check size={16} strokeWidth={2.2} className="min-[1280px]:max-[1365px]:size-[14px] min-[1366px]:max-[1537px]:size-[15px]" />
                                    )}
                                    {submitting ? "Classifying..." : "Manually Classify"}
                                </motion.button>

                                <motion.button
                                    type="button"
                                    whileHover={!isBusy ? { y: -1 } : undefined}
                                    whileTap={!isBusy ? { scale: 0.98 } : undefined}
                                    onClick={handleRequestClarification}
                                    disabled={isBusy}
                                    className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-black transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 min-[1280px]:max-[1365px]:h-9 min-[1280px]:max-[1365px]:gap-1.5 min-[1280px]:max-[1365px]:px-2.5 min-[1280px]:max-[1365px]:text-[11px] min-[1366px]:max-[1537px]:h-9 min-[1366px]:max-[1537px]:gap-1.5 min-[1366px]:max-[1537px]:px-3 min-[1366px]:max-[1537px]:text-xs"
                                >
                                    {requestingClarification ? (
                                        <LoaderCircle size={16} className="animate-spin" />
                                    ) : (
                                        <MessageSquareText size={16} className="min-[1280px]:max-[1365px]:size-[14px] min-[1366px]:max-[1537px]:size-[15px]" />
                                    )}
                                    {requestingClarification ? "Requesting..." : "Request Clarification"}
                                </motion.button>
                            </div>

                            <p className="mt-4 text-xs leading-5 text-gray-500 min-[1280px]:max-[1365px]:mt-3 min-[1280px]:max-[1365px]:text-[10px] min-[1280px]:max-[1365px]:leading-4 min-[1366px]:max-[1537px]:text-[11px] min-[1366px]:max-[1537px]:leading-4">
                                Manually classify the ticket if the submitted information is sufficient. Otherwise, return it to the employee for clarification.
                            </p>
                        </div>
                    </motion.div>
                </div>

                {/* TICKET ANALYSIS */}
                <motion.div
                    {...sectionTransition}
                    transition={{ ...sectionTransition.transition, delay: 0.16 }}
                    className="overflow-hidden rounded-md border border-gray-300 bg-white"
                >
                    <div className="flex items-start gap-3 border-b border-gray-300 px-6 py-4 min-[1280px]:max-[1365px]:gap-2.5 min-[1280px]:max-[1365px]:px-4 min-[1280px]:max-[1365px]:py-3 min-[1366px]:max-[1537px]:gap-2.5 min-[1366px]:max-[1537px]:px-5 min-[1366px]:max-[1537px]:py-3.5">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-gray-100 min-[1280px]:max-[1365px]:h-8 min-[1280px]:max-[1365px]:w-8 min-[1366px]:max-[1537px]:h-8 min-[1366px]:max-[1537px]:w-8">
                            <Sparkles size={19} className="text-black min-[1280px]:max-[1365px]:size-[16px] min-[1366px]:max-[1537px]:size-[17px]" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="font-semibold text-black min-[1280px]:max-[1537px]:text-sm">
                                Ticket Analysis
                            </h2>
                            <p className="mt-0.5 text-xs text-gray-500 min-[1280px]:max-[1365px]:text-[10px] min-[1366px]:max-[1537px]:text-[11px]">
                                System-generated summary of the submitted ticket.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 p-6 lg:grid-cols-2 min-[1280px]:max-[1365px]:gap-3 min-[1280px]:max-[1365px]:p-4 min-[1366px]:max-[1537px]:gap-3 min-[1366px]:max-[1537px]:p-5">
                        <AnalysisField label="Summary" value={flag.summary} fallback="No summary available." />
                        <AnalysisField label="Cleaned Description" value={flag.cleaned_text} fallback="No cleaned description available." />
                    </div>

                    <div className="mx-6 mb-6 flex items-center gap-3 rounded-md border border-gray-300 bg-gray-50 px-4 py-3 min-[1280px]:max-[1365px]:mx-4 min-[1280px]:max-[1365px]:mb-4 min-[1280px]:max-[1365px]:gap-2 min-[1280px]:max-[1365px]:px-3 min-[1280px]:max-[1365px]:py-2.5 min-[1366px]:max-[1537px]:mx-5 min-[1366px]:max-[1537px]:mb-5 min-[1366px]:max-[1537px]:gap-2.5 min-[1366px]:max-[1537px]:px-3.5 min-[1366px]:max-[1537px]:py-2.5">
                        <CircleAlert size={18} className="shrink-0 text-red-600 min-[1280px]:max-[1365px]:size-[15px] min-[1366px]:max-[1537px]:size-[16px]" />
                        <p className="text-xs leading-5 text-black min-[1280px]:max-[1365px]:text-[10px] min-[1280px]:max-[1365px]:leading-4 min-[1366px]:max-[1537px]:text-[11px] min-[1366px]:max-[1537px]:leading-4">
                            This ticket was flagged because the submitted description may not contain enough information for reliable classification.
                        </p>
                    </div>
                </motion.div>

                <SymptomCodeSheet
                    open={sheetOpen}
                    onClose={() => setSheetOpen(false)}
                    onSelect={(symptom) => setSelectedSymptom(symptom.code)}
                />
            </motion.div>

            {/* MANUAL CLASSIFICATION CONFIRMATION MODAL */}
            <AnimatePresence>
                {showConfirm && (
                    <motion.div
                        key="manual-classification-modal"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4"
                        onMouseDown={(event) => {
                            if (event.target === event.currentTarget) closeConfirmModal();
                        }}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 16, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.98 }}
                            transition={{ duration: 0.22, ease: "easeOut" }}
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="manual-classification-title"
                            className="w-full max-w-[440px] rounded-xl bg-white shadow-xl min-[1280px]:max-[1537px]:max-w-[400px]"
                        >
                            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 min-[1280px]:max-[1365px]:px-4 min-[1280px]:max-[1365px]:py-3 min-[1366px]:max-[1537px]:px-4 min-[1366px]:max-[1537px]:py-3.5">
                                <div className="min-w-0">
                                    <h3 id="manual-classification-title" className="font-semibold text-black min-[1280px]:max-[1537px]:text-sm">
                                        Confirm Manual Classification
                                    </h3>
                                    <p className="mt-1 text-xs text-gray-500 min-[1280px]:max-[1365px]:text-[10px] min-[1366px]:max-[1537px]:text-[11px]">
                                        Review the classification before confirming.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={closeConfirmModal}
                                    disabled={submitting}
                                    aria-label="Close confirmation"
                                    className="rounded-md p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-black disabled:cursor-not-allowed"
                                >
                                    <X size={18} className="min-[1280px]:max-[1537px]:size-[16px]" />
                                </button>
                            </div>

                            <div className="p-5 min-[1280px]:max-[1365px]:p-4 min-[1366px]:max-[1537px]:p-4">
                                <p className="text-sm leading-6 text-gray-600 min-[1280px]:max-[1537px]:text-xs min-[1280px]:max-[1537px]:leading-5">
                                    Are you sure you want to manually classify this ticket using the following symptom code?
                                </p>

                                <div className="mt-4 rounded-md border border-gray-200 bg-gray-50 px-4 py-3 min-[1280px]:max-[1365px]:mt-3 min-[1280px]:max-[1365px]:px-3 min-[1280px]:max-[1365px]:py-2.5 min-[1366px]:max-[1537px]:mt-3 min-[1366px]:max-[1537px]:px-3.5 min-[1366px]:max-[1537px]:py-2.5">
                                    <p className="text-xs font-semibold uppercase text-gray-500 min-[1280px]:max-[1365px]:text-[10px] min-[1366px]:max-[1537px]:text-[11px]">
                                        Selected Symptom Code
                                    </p>
                                    <p className="mt-1 text-sm font-semibold text-black min-[1280px]:max-[1537px]:text-xs">
                                        {selectedSymptom || "-"}
                                    </p>
                                </div>

                                <div className="mt-5 min-[1280px]:max-[1537px]:mt-4">
                                    <label className="mb-2 block text-sm font-medium text-gray-700 min-[1280px]:max-[1537px]:text-xs">
                                        Review Remarks <span className="ml-1 font-normal text-red-500">*</span>
                                    </label>

                                    <textarea
                                        value={remarks}
                                        onChange={(event) => setRemarks(event.target.value)}
                                        disabled={submitting}
                                        rows={4}
                                        minLength={40}
                                        maxLength={1000}
                                        placeholder="Enter review remarks..."
                                        className="w-full resize-none rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm text-black outline-none placeholder:text-gray-400 focus:border-[#4C4CF9] focus:ring-2 focus:ring-[#4C4CF9]/10 disabled:bg-gray-100 min-[1280px]:max-[1537px]:px-2.5 min-[1280px]:max-[1537px]:py-2 min-[1280px]:max-[1537px]:text-xs"
                                    />

                                    {remarks.trim().length < 40 && (
                                        <p className="mt-1 text-xs text-red-500 min-[1280px]:max-[1537px]:text-[10px]">
                                            Review remarks must be at least 40 characters.
                                        </p>
                                    )}

                                    <div className="mt-1 flex items-center justify-between text-xs text-gray-400 min-[1280px]:max-[1537px]:text-[10px]">
                                        <span>Minimum 40 characters</span>
                                        <span>{remarks.trim().length}/1000</span>
                                    </div>
                                </div>

                                <div className="mt-5 flex justify-end gap-2 min-[1280px]:max-[1537px]:mt-4">
                                    <button
                                        type="button"
                                        onClick={closeConfirmModal}
                                        disabled={submitting}
                                        className="rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 min-[1280px]:max-[1537px]:px-3 min-[1280px]:max-[1537px]:py-2 min-[1280px]:max-[1537px]:text-xs"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleManualClassify}
                                        disabled={submitting || remarks.trim().length < 40}
                                        className="flex items-center gap-2 rounded-md bg-[#4C4CF9] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4242e8] disabled:cursor-not-allowed disabled:opacity-50 min-[1280px]:max-[1537px]:px-3 min-[1280px]:max-[1537px]:py-2 min-[1280px]:max-[1537px]:text-xs"
                                    >
                                        {submitting ? (
                                            <LoaderCircle size={15} className="animate-spin" />
                                        ) : (
                                            <Check size={16} strokeWidth={2.2} className="min-[1280px]:max-[1537px]:size-[14px]" />
                                        )}
                                        {submitting ? "Classifying..." : "Confirm"}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

function InfoField({ label, value, multiline = false }) {
    return (
        <div className="border-b border-gray-300 px-6 py-4 min-[1280px]:max-[1365px]:px-4 min-[1280px]:max-[1365px]:py-3 min-[1366px]:max-[1537px]:px-5 min-[1366px]:max-[1537px]:py-3.5">
            <p className="text-xs font-semibold uppercase text-gray-500 min-[1280px]:max-[1365px]:text-[10px] min-[1366px]:max-[1537px]:text-[11px]">
                {label}
            </p>
            <p className={`mt-2 min-w-0 [overflow-wrap:anywhere] text-sm text-black min-[1280px]:max-[1365px]:mt-1.5 min-[1280px]:max-[1365px]:text-xs min-[1366px]:max-[1537px]:mt-1.5 min-[1366px]:max-[1537px]:text-xs ${multiline ? "leading-6 min-[1280px]:max-[1537px]:leading-5" : "font-medium"}`}>
                {value || "-"}
            </p>
        </div>
    );
}

function AnalysisField({ label, value, fallback }) {
    return (
        <div className="rounded-md border border-gray-300 p-5 min-[1280px]:max-[1365px]:p-3 min-[1366px]:max-[1537px]:p-4">
            <p className="text-xs font-semibold uppercase text-gray-500 min-[1280px]:max-[1365px]:text-[10px] min-[1366px]:max-[1537px]:text-[11px]">
                {label}
            </p>
            <p className="mt-3 text-sm leading-6 text-black min-[1280px]:max-[1365px]:mt-2 min-[1280px]:max-[1365px]:text-xs min-[1280px]:max-[1365px]:leading-5 min-[1366px]:max-[1537px]:mt-2.5 min-[1366px]:max-[1537px]:text-xs min-[1366px]:max-[1537px]:leading-5">
                {value || fallback}
            </p>
        </div>
    );
}

function getInitials(name) {
    if (!name) return "?";

    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("");
}

function formatDate(value) {
    if (!value) return "-";

    return new Date(value).toLocaleString([], {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

function formatStatus(status = "") {
    if (!status) return "-";

    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}

function getStatusStyle(status = "") {
    switch (status.toLowerCase()) {
        case "pending":
            return "border-amber-300 bg-amber-50 text-amber-700";
        case "approved":
        case "resolved":
            return "border-green-300 bg-green-50 text-green-700";
        case "rejected":
            return "border-red-300 bg-red-50 text-red-700";
        default:
            return "border-gray-300 bg-gray-100 text-gray-700";
    }
}