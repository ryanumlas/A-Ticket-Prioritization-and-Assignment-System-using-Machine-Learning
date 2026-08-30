import { useState } from "react";
import {
    CircleAlert,
    ClipboardCheck,
    Ticket,
    Sparkles,
    RotateCcw,
    Search,
    Contact,
    Pencil,
    MessageSquareText
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import api from "/src/api";
import SymptomCodeSheet from "./SymptomCodeSheet";

export default function UnclearDescriptionReview({ flag }) {
    const navigate = useNavigate();

    const [sheetOpen, setSheetOpen] = useState(false);
    const [selectedSymptom, setSelectedSymptom] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleManualClassify = async () => {
        if (!selectedSymptom) return;

        try {
            setSubmitting(true);

            const response = await api.post(
                `/tickets/flagged/${flag.id}/manual-classify/`,
                {
                    symptom_code: selectedSymptom,
                }
            );

            navigate("/dashboard");

            toast.success("Ticket manually classified", {
                description: `${response.data.ticket.ticket_code} was classified as ${response.data.ticket.symptom_code}.`,
                duration: 4000,

                style: {
                    background: "#ffffff",
                    color: "#000000",
                    border: "1px solid #e5e7eb",
                    borderRadius: "10px",
                    padding: "16px",
                    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
                },
            });

        } catch (error) {
            console.error(
                "Manual classification failed:",
                error
            );

            toast.error("Unable to classify ticket", {
                description:
                    error.response?.data?.message ||
                    "Something went wrong while manually classifying the ticket.",

                duration: 4000,

                style: {
                    background: "#ffffff",
                    color: "#000000",
                    border: "1px solid #e5e7eb",
                    borderRadius: "10px",
                    padding: "16px",
                    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
                },
            });

        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-5">

            {/* TOP SECTION */}
            <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[1.35fr_1fr]">

                {/* TICKET INFORMATION */}
                <div className="max-h-[720px] overflow-y-auto rounded-md border border-gray-300 bg-white ticket-detail-scroll">

                    <div className="flex items-center gap-3 border-b border-gray-300 px-6 py-4">
                        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-gray-100">
                            <Ticket
                                size={19}
                                className="text-black"
                            />
                        </div>

                        <div>
                            <h2 className="font-semibold text-black">
                                Ticket Information
                            </h2>

                            <p className="mt-0.5 text-xs text-gray-500">
                                Information submitted by the employee.
                            </p>
                        </div>
                    </div>

                    {/* Ticket Code + Scope */}
                    <div className="grid grid-cols-1 border-b border-gray-300 sm:grid-cols-2">

                        <div className="border-b border-gray-300 px-6 py-4 sm:border-b-0 sm:border-r">
                            <p className="text-xs font-semibold uppercase text-gray-500">
                                Ticket Code
                            </p>

                            <p className="mt-2 text-sm font-medium text-black">
                                {flag.ticket_code || "-"}
                            </p>
                        </div>

                        <div className="px-6 py-4">
                            <p className="text-xs font-semibold uppercase text-gray-500">
                                Affected Scope
                            </p>

                            <p className="mt-2 text-sm font-medium text-black">
                                {flag.affected_scope || "-"}
                            </p>
                        </div>

                    </div>

                    {/* Subject */}
                    <div className="border-b border-gray-300 px-6 py-4">
                        <p className="text-xs font-semibold uppercase text-gray-500">
                            Subject
                        </p>

                        <p className="mt-2 text-sm font-medium text-black">
                            {flag.subject || "-"}
                        </p>
                    </div>

                    {/* Description */}
                    <div className="border-b border-gray-300 px-6 py-4">
                        <p className="text-xs font-semibold uppercase text-gray-500">
                            Description
                        </p>

                        <p className="mt-2 min-w-0 [overflow-wrap:anywhere] text-sm leading-6 text-black">
                            {flag.description || "-"}
                        </p>
                    </div>

                    {/* Business Impact */}
                    <div className="border-b border-gray-300 px-6 py-4">
                        <p className="text-xs font-semibold uppercase text-gray-500">
                            Business Impact
                        </p>

                        <p className="mt-2 min-w-0 [overflow-wrap:anywhere] text-sm leading-6 text-black">
                            {flag.business_impact || "-"}
                        </p>
                    </div>

                    {/* REQUESTER INFORMATION */}
                    <div className="px-6 py-5">

                        <div className="mb-5 flex items-center gap-2">
                            <Contact
                                size={18}
                                className="text-black"
                            />

                            <h3 className="font-semibold text-black">
                                Requester Information
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 gap-x-10 gap-y-4 sm:grid-cols-2">

                            {/* Name */}
                            <div className="flex items-center">
                                <p className="w-32 shrink-0 text-xs font-semibold uppercase text-gray-500">
                                    Name
                                </p>

                                <p className="text-sm font-medium text-black">
                                    {flag.first_name} {flag.last_name}
                                </p>
                            </div>

                            {/* Employee ID */}
                            <div className="flex items-center">
                                <p className="w-32 shrink-0 text-xs font-semibold uppercase text-gray-500">
                                    Employee ID
                                </p>

                                <p className="text-sm font-medium text-black">
                                    {flag.user_code || "-"}
                                </p>
                            </div>

                            {/* Department */}
                            <div className="flex items-center">
                                <p className="w-32 shrink-0 text-xs font-semibold uppercase text-gray-500">
                                    Department
                                </p>

                                <p className="text-sm font-medium text-black">
                                    {flag.employee_department || "-"}
                                </p>
                            </div>

                            {/* Office Location */}
                            <div className="flex items-center">
                                <p className="w-32 shrink-0 text-xs font-semibold uppercase text-gray-500">
                                    Office Location
                                </p>

                                <p className="text-sm font-medium text-black">
                                    {flag.office_location || "-"}
                                </p>
                            </div>

                            {/* Workstation */}
                            <div className="flex items-center">
                                <p className="w-32 shrink-0 text-xs font-semibold uppercase text-gray-500">
                                    Workstation
                                </p>

                                <p className="text-sm font-medium text-black">
                                    {flag.workstation || "-"}
                                </p>
                            </div>

                        </div>
                    </div>

                </div>

                {/* REVIEW / ACTIONS */}
                <div className="overflow-hidden rounded-md border border-gray-300 bg-white">

                    <div className="flex items-start gap-3 border-b border-gray-300 px-6 py-4">

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-gray-100">
                            <ClipboardCheck
                                size={19}
                                className="text-black"
                            />
                        </div>

                        <div>
                            <h2 className="font-semibold text-black">
                                Review Description
                            </h2>

                            <p className="mt-0.5 text-xs text-gray-500">
                                Determine whether the ticket contains enough
                                information for classification.
                            </p>
                        </div>

                    </div>

                    <div className="p-6">

                        {/* REVIEW REASON */}
                        <div className="rounded-md border border-gray-300 bg-gray-50 px-4 py-3">

                            <p className="text-xs font-semibold uppercase text-gray-500">
                                Review Reason
                            </p>

                            <div className="mt-2 flex items-center gap-2">

                                <CircleAlert
                                    size={17}
                                    className="shrink-0 text-red-600"
                                />

                                <p className="text-sm font-semibold text-black">
                                    {flag.reason || "Unclear Description"}
                                </p>

                            </div>

                        </div>

                        {/* MANUAL CLASSIFICATION */}
                        <div className="mt-6">

                            <p className="mb-2 text-xs font-semibold uppercase text-gray-500">
                                Manual Classification
                            </p>

                            <button
                                type="button"
                                onClick={() => setSheetOpen(true)}
                                className="flex w-full cursor-pointer items-center justify-between rounded-md border border-gray-300 bg-white px-4 py-3 text-left text-sm text-black transition hover:bg-gray-50"
                            >
                                <span>
                                    {selectedSymptom ||
                                        "Search and select symptom code"}
                                </span>

                                <Search
                                    size={17}
                                    className="text-gray-500"
                                />
                            </button>

                        </div>

                        {/* ACTIONS */}
                        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">

                            {/* MANUALLY CLASSIFY */}
                            <button
                                type="button"
                                onClick={handleManualClassify}
                                disabled={
                                    !selectedSymptom ||
                                    submitting
                                }
                                className={`flex items-center justify-center gap-2 rounded-md border px-4 py-3 text-sm font-semibold transition ${
                                    selectedSymptom && !submitting
                                        ? "cursor-pointer border-[#4C4CF9] bg-[#4C4CF9] text-white hover:bg-[#4242e8]"
                                        : "cursor-not-allowed border-gray-300 bg-gray-100 text-gray-400"
                                }`}
                            >
                                <Pencil size={16} />

                                {submitting
                                    ? "Classifying..."
                                    : "Manually Classify"}
                            </button>

                            {/* RETURN */}
                            <button
                                type="button"
                                disabled={submitting}
                                className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
                            >
                                <MessageSquareText size={16} />
                                Request Clarification
                            </button>

                        </div>

                        <p className="mt-4 text-xs leading-5 text-gray-500">
                            Manually classify the ticket if the submitted
                            information is sufficient. Otherwise, return it to
                            the employee for clarification.
                        </p>

                    </div>
                </div>

            </div>

            {/* TICKET ANALYSIS */}
            <div className="overflow-hidden rounded-md border border-gray-300 bg-white">

                <div className="flex items-start gap-3 border-b border-gray-300 px-6 py-4">

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-gray-100">
                        <Sparkles
                            size={19}
                            className="text-black"
                        />
                    </div>

                    <div>
                        <h2 className="font-semibold text-black">
                            Ticket Analysis
                        </h2>

                        <p className="mt-0.5 text-xs text-gray-500">
                            System-generated summary of the submitted ticket.
                        </p>
                    </div>

                </div>

                <div className="grid grid-cols-1 gap-4 p-6 lg:grid-cols-2">

                    {/* SUMMARY */}
                    <div className="rounded-md border border-gray-300 p-5">

                        <p className="text-xs font-semibold uppercase text-gray-500">
                            Summary
                        </p>

                        <p className="mt-3 text-sm leading-6 text-black">
                            {flag.summary || "No summary available."}
                        </p>

                    </div>

                    {/* CLEANED DESCRIPTION */}
                    <div className="rounded-md border border-gray-300 p-5">

                        <p className="text-xs font-semibold uppercase text-gray-500">
                            Cleaned Description
                        </p>

                        <p className="mt-3 text-sm leading-6 text-black">
                            {flag.cleaned_text ||
                                "No cleaned description available."}
                        </p>

                    </div>

                </div>

                {/* NOTICE */}
                <div className="mx-6 mb-6 flex items-center gap-3 rounded-md border border-gray-300 bg-gray-50 px-4 py-3">

                    <CircleAlert
                        size={18}
                        className="shrink-0 text-red-600"
                    />

                    <p className="text-xs leading-5 text-black">
                        This ticket was flagged because the submitted
                        description may not contain enough information for
                        reliable classification.
                    </p>

                </div>

            </div>

            {/* SYMPTOM CODE SHEET */}
            <SymptomCodeSheet
                open={sheetOpen}
                onClose={() => setSheetOpen(false)}
                onSelect={setSelectedSymptom}
            />

        </div>
    );
}