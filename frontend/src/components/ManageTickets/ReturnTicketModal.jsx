import { useState } from "react";
import {
    Undo2,
    X,
    Info,
    Loader2,
} from "lucide-react";
import { toast } from "sonner";
import api from '/src/api'

export default function ReturnTicketModal({
    open,
    onClose,
    ticketId,
}) {
    const [reason, setReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!open) return null;

    const handleClose = () => {
        if (isSubmitting) return;

        setReason("");
        onClose();
    };

    const trimmedReason = reason.trim();

    const isReasonValid =
        trimmedReason.length >= 15 &&
        trimmedReason.length <= 500;

    const handleSubmit = async () => {
        if (!isReasonValid || !ticketId) {
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await api.post(
                `/tickets/return-ticket/${ticketId}/`,
                {
                    reason: trimmedReason,
                }
            );

            toast.success(
                response.data?.message ||
                    "Ticket return request submitted successfully."
            );

            setReason("");
            onClose();
        } catch (error) {
            const message =
                error.response?.data?.error ||
                error.response?.data?.detail ||
                "Failed to submit the return request.";

            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 px-4">

            <div className="w-full max-w-[500px] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">

                {/* HEADER */}
                <div className="flex items-start justify-between border-b border-gray-200 px-5 py-4">

                    <div className="flex items-start gap-3">

                        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                            <Undo2
                                size={18}
                                className="text-gray-500"
                            />
                        </div>

                        <div>
                            <h2 className="text-base font-semibold text-black">
                                Return to Service Desk
                            </h2>

                            <p className="mt-0.5 text-sm text-gray-500">
                                Return this ticket for review and reclassification.
                            </p>
                        </div>

                    </div>

                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={isSubmitting}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <X size={18} />
                    </button>

                </div>

                {/* BODY */}
                <div className="space-y-5 px-5 py-5">

                    <div>
                        <label
                            htmlFor="return-details"
                            className="mb-2 block text-sm font-medium text-black"
                        >
                            Additional Details
                            <span className="ml-1 text-red-500">*</span>
                        </label>

                        <textarea
                            id="return-details"
                            rows={4}
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            disabled={isSubmitting}
                            maxLength={500}
                            placeholder="Explain why this ticket should be returned to the Service Desk..."
                            className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-black outline-none transition placeholder:text-gray-400 focus:border-[#4C4CF9] focus:ring-2 focus:ring-[#4C4CF9]/10 disabled:cursor-not-allowed disabled:bg-gray-50"
                        />

                        <div className="mt-1.5 flex items-center justify-between">
                            <span
                                className={`text-xs ${
                                    trimmedReason.length > 0 &&
                                    trimmedReason.length < 15
                                        ? "text-amber-600"
                                        : "text-gray-400"
                                }`}
                            >
                                {trimmedReason.length === 0
                                    ? "At least 15 characters required."
                                    : trimmedReason.length < 15
                                        ? `${15 - trimmedReason.length} more characters required.`
                                        : "Additional details provided."}
                            </span>

                            <span className="text-xs text-gray-400">
                                {reason.length}/500
                            </span>
                        </div>
                    </div>

                    {/* INFO */}
                    <div className="flex items-start gap-2.5 rounded-lg border border-blue-200 bg-blue-50 px-3.5 py-3">

                        <Info
                            size={17}
                            className="mt-0.5 shrink-0 text-blue-600"
                        />

                        <p className="text-xs leading-5 text-blue-700">
                            Returning this ticket sends it back to the IT Service
                            Desk for review. The Service Desk can correct the
                            classification and route the ticket to the appropriate
                            IT department.
                        </p>

                    </div>

                </div>

                {/* FOOTER */}
                <div className="flex items-center justify-end gap-2 border-t border-gray-200 bg-gray-50/50 px-5 py-4">

                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={isSubmitting}
                        className="h-9 rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium transition-colors hover:bg-gray-50 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSubmitting || !isReasonValid}
                        className="flex h-9 items-center gap-2 rounded-lg bg-[#4C4CF9] px-4 text-sm font-medium text-white transition-colors hover:bg-[#3a3ae0] cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2
                                    size={15}
                                    className="animate-spin"
                                />
                                Returning...
                            </>
                        ) : (
                            "Return Ticket"
                        )}
                    </button>

                </div>

            </div>
        </div>
    );
}