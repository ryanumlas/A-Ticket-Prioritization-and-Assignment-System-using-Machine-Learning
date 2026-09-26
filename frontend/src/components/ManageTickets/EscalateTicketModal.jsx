import { useState } from "react";
import { X, AlertTriangle, Info } from "lucide-react";
import api from "/src/api";
import { toast } from "sonner";

export default function EscalateTicketModal({
    open,
    onClose,
    ticketId,
    onEscalationSubmitted,
}) {
    const [reason, setReason] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    if (!open) return null;

    const handleSubmit = async () => {
        const trimmedReason = reason.trim();

        if (!trimmedReason) {
            setError("Please provide a reason for escalating this ticket.");
            return;
        }

        if (!ticketId) {
            setError("Unable to identify the ticket.");
            return;
        }

        try {
            setSubmitting(true);
            setError("");

            const response = await api.post(
                `/tickets/escalate/${ticketId}/`,
                {
                    reason: trimmedReason,
                }
            );

            setReason("");

            toast.success(
                response.data?.message ||
                    "Ticket has been escalated successfully."
            );

            if (onEscalationSubmitted) {
                await onEscalationSubmitted(response.data);
            }

            onClose();
        } catch (error) {
            setError(
                error.response?.data?.error ||
                    error.response?.data?.reason?.[0] ||
                    "Failed to escalate the ticket."
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        if (submitting) return;

        setReason("");
        setError("");
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 px-4">
            <div className="w-full max-w-[500px] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">

                {/* HEADER */}
                <div className="flex items-start justify-between border-b border-gray-200 px-5 py-4">
                    <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-50">
                            <AlertTriangle
                                size={18}
                                className="text-orange-500"
                            />
                        </div>

                        <div>
                            <h2 className="text-base font-semibold text-black">
                                Escalate Ticket
                            </h2>

                            <p className="mt-0.5 text-sm text-gray-500">
                                Submit this ticket for Supervisor review.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={submitting}
                        className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* BODY */}
                <div className="space-y-5 px-5 py-5">

                    <div>
                        <label
                            htmlFor="escalation-reason"
                            className="mb-2 block text-sm font-medium text-black"
                        >
                            Reason for Escalation
                            <span className="ml-1 text-red-500">*</span>
                        </label>

                        <textarea
                            id="escalation-reason"
                            rows={5}
                            maxLength={500}
                            value={reason}
                            onChange={(e) => {
                                setReason(e.target.value);
                                setError("");
                            }}
                            disabled={submitting}
                            placeholder="Explain why this ticket requires Supervisor review..."
                            className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-black outline-none transition placeholder:text-gray-400 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500"
                        />

                        <div className="mt-1.5 flex items-center justify-between">
                            <p className="text-xs text-gray-500">
                                Include relevant troubleshooting already performed.
                            </p>

                            <span className="text-xs text-gray-400">
                                {reason.length}/500
                            </span>
                        </div>
                    </div>

                    {error && (
                        <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5">
                            <p className="text-xs text-red-600">
                                {error}
                            </p>
                        </div>
                    )}

                    <div className="flex items-start gap-2.5 rounded-lg border border-blue-200 bg-blue-50 px-3.5 py-3">
                        <Info
                            size={17}
                            className="mt-0.5 shrink-0 text-blue-600"
                        />

                        <p className="text-xs leading-5 text-blue-700">
                            This ticket will be sent to the Supervisor for
                            review. The current ticket status and priority will
                            remain unchanged until further action is taken.
                        </p>
                    </div>
                </div>

                {/* FOOTER */}
                <div className="flex items-center justify-end gap-2 border-t border-gray-200 bg-gray-50/50 px-5 py-4">
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={submitting}
                        className="h-9 cursor-pointer rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="h-9 cursor-pointer rounded-lg bg-[#2563EB] px-4 text-sm font-medium text-white transition-colors hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {submitting ? "Escalating..." : "Escalate Ticket"}
                    </button>
                </div>

            </div>
        </div>
    );
}