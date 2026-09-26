import { useState } from "react";
import api from '/src/api'
import {
    ArrowUpDown,
    X,
    Info,
} from "lucide-react";

export default function RequestPriorityModal({
    open,
    onClose,
    ticketId,
    currentPriority = "P4",
    onRequestSubmitted,
}) {
    const [requestedPriority, setRequestedPriority] = useState("");
    const [reason, setReason] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    if (!open) return null;

    const priorityLabel = {
        P1: "Critical",
        P2: "High",
        P3: "Medium",
        P4: "Low",
        P5: "Very Low",
    };

    const priorityStyle = {
        P1: "border-red-200 bg-red-50 text-red-600",
        P2: "border-orange-200 bg-orange-50 text-orange-600",
        P3: "border-amber-200 bg-amber-50 text-amber-600",
        P4: "border-blue-200 bg-blue-50 text-blue-600",
        P5: "border-gray-300 bg-gray-100 text-gray-600",
    };

    const handleSubmit = async () => {
        if (!requestedPriority) {
            setError("Please select a requested priority.");
            return;
        }

        if (!reason.trim()) {
            setError("Please provide a reason for the priority change.");
            return;
        }

        try {
            setSubmitting(true);
            setError("");

            const response = await api.post(
                `/tickets/priority-change-request/${ticketId}/`,
                {
                    requested_priority: requestedPriority,
                    reason: reason.trim(),
                }
            );
            setRequestedPriority("");
            setReason("");

            if (onRequestSubmitted) {
                await onRequestSubmitted();
            }

            onClose();
        }
        catch (error) {
            setError(
                error.response?.data?.error ||
                error.response?.data?.requested_priority?.[0] ||
                error.response?.data?.reason?.[0] ||
                "Failed to submit priority change request."
            );
        }
        finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 px-4">

            {/* MODAL */}
            <div className="w-full max-w-[500px] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">

                {/* HEADER */}
                <div className="flex items-start justify-between border-b border-gray-200 px-5 py-4">

                    <div className="flex items-start gap-3">

                        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50">
                            <ArrowUpDown
                                size={18}
                                className="text-amber-500"
                            />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-black">
                                Request Priority Change
                            </h2>

                            <p className="mt-0.5 text-sm text-gray-500">
                                Submit a priority adjustment for Service Desk review.
                            </p>
                        </div>

                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={submitting}
                        className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                    >
                        <X size={18} />
                    </button>

                </div>

                {/* BODY */}
                <div className="space-y-5 px-5 py-5">

                    {/* CURRENT PRIORITY */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-black">
                            Current Priority
                        </label>

                        <div className="flex h-11 items-center rounded-lg border border-gray-200 bg-gray-50 px-3">

                            <span
                                className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-semibold ${
                                    priorityStyle[currentPriority] ||
                                    priorityStyle.P5
                                }`}
                            >
                                {priorityLabel[currentPriority]
                                    ? `${priorityLabel[currentPriority]} (${currentPriority})`
                                    : currentPriority}
                            </span>

                        </div>
                    </div>

                    {/* REQUESTED PRIORITY */}
                    <div>
                        <label
                            htmlFor="requested-priority"
                            className="mb-2 block text-sm font-medium text-black"
                        >
                            Requested Priority
                            <span className="ml-1 text-red-500">*</span>
                        </label>

                        <select
                            id="requested-priority"
                            value={requestedPriority}
                            onChange={(e) => {
                                setRequestedPriority(e.target.value);
                                setError("");
                            }}
                            disabled={submitting}
                            className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-black outline-none transition focus:border-[#4C4CF9] focus:ring-2 focus:ring-[#4C4CF9]/10"
                        >
                            <option value="" disabled>
                                Select requested priority
                            </option>

                            <option
                                value="P1"
                                disabled={currentPriority === "P1"}
                            >
                                Critical (P1)
                            </option>

                            <option
                                value="P2"
                                disabled={currentPriority === "P2"}
                            >
                                High (P2)
                            </option>

                            <option
                                value="P3"
                                disabled={currentPriority === "P3"}
                            >
                                Medium (P3)
                            </option>

                        </select>
                    </div>

                    {/* REASON */}
                    <div>
                        <label
                            htmlFor="priority-reason"
                            className="mb-2 block text-sm font-medium text-black"
                        >
                            Reason for Request
                            <span className="ml-1 text-red-500">*</span>
                        </label>

                        <textarea
                            id="priority-reason"
                            rows={4}
                            value={reason}
                            onChange={(e) => {
                                setReason(e.target.value);
                                setError("");
                            }}
                            disabled={submitting}
                            placeholder="Explain why the ticket priority should be changed..."
                            className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-black outline-none transition placeholder:text-gray-400 focus:border-[#4C4CF9] focus:ring-2 focus:ring-[#4C4CF9]/10"
                        />
                    </div>

                    {/* ERROR */}
                    {error && (
                        <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5">
                            <p className="text-xs text-red-600">
                                {error}
                            </p>
                        </div>
                    )}

                    {/* INFORMATION */}
                    <div className="flex items-start gap-2.5 rounded-lg border border-blue-200 bg-blue-50 px-3.5 py-3">

                        <Info
                            size={17}
                            className="mt-0.5 shrink-0 text-blue-600"
                        />

                        <p className="text-xs leading-5 text-blue-700">
                            This request will be sent to the IT Service Desk for
                            review. The current priority will remain unchanged
                            until the request is approved.
                        </p>

                    </div>

                </div>

                {/* FOOTER */}
                <div className="flex items-center justify-end gap-2 border-t border-gray-200 bg-gray-50/50 px-5 py-4">

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={submitting}
                        className="h-9 cursor-pointer rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="h-9 cursor-pointer rounded-lg bg-[#4C4CF9] px-4 text-sm font-medium text-white transition-colors hover:bg-[#3a3ae0] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {submitting
                            ? "Submitting..."
                            : "Submit Request"}
                    </button>

                </div>

            </div>
        </div>
    );
}