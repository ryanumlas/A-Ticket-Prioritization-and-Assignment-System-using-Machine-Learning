import { useEffect, useState } from "react";
import {
    CircleCheck,
    X,
    Info,
    Loader2,
} from "lucide-react";
import { toast } from "sonner";
import api from "../../api";

export default function CompleteEscalationModal({
    open,
    ticketId,
    onClose,
    onSuccess,
}) {
    const [resolutionType, setResolutionType] = useState("");
    const [resolutionRemarks, setResolutionRemarks] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!open) {
            setResolutionType("");
            setResolutionRemarks("");
            setError("");
            setSubmitting(false);
        }
    }, [open]);

    if (!open) return null;

    const handleSubmit = async () => {
        if (!resolutionType) {
            setError("Please select a resolution type.");
            return;
        }

        if (!resolutionRemarks.trim()) {
            setError("Please provide resolution remarks.");
            return;
        }

        if (resolutionRemarks.trim().length > 1000) {
            setError(
                "Resolution remarks cannot exceed 1000 characters."
            );
            return;
        }

        if (!ticketId) {
            setError("Ticket information is unavailable.");
            return;
        }

        setError("");
        setSubmitting(true);

        try {
            const response = await api.post(
                `/tickets/complete-escalation/${ticketId}/`,
                {
                    resolution_type: resolutionType,
                    resolution_remarks:
                        resolutionRemarks.trim(),
                }
            );

            toast.success(
                "Ticket escalation completed successfully."
            );

            onClose();

            if (onSuccess) {
                onSuccess(response.data);
            }
        } catch (error) {
            const message =
                error.response?.data?.error ||
                "Failed to complete the ticket escalation.";

            setError(message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 px-4">
            <div className="w-full max-w-[500px] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
                {/* HEADER */}
                <div className="flex items-start justify-between border-b border-gray-200 px-5 py-4">
                    <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                            <CircleCheck
                                size={18}
                                className="text-blue-600"
                            />
                        </div>

                        <div>
                            <h2 className="text-base font-semibold text-black">
                                Complete Escalation
                            </h2>

                            <p className="mt-0.5 text-sm text-gray-500">
                                Record the outcome of this ticket escalation.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={submitting}
                        className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* BODY */}
                <div className="space-y-5 px-5 py-5">
                    {/* RESOLUTION TYPE */}
                    <div>
                        <label
                            htmlFor="resolution-type"
                            className="mb-2 block text-sm font-medium text-black"
                        >
                            Resolution Type
                            <span className="ml-1 text-red-500">
                                *
                            </span>
                        </label>

                        <select
                            id="resolution-type"
                            value={resolutionType}
                            disabled={submitting}
                            onChange={(e) => {
                                setResolutionType(e.target.value);
                                setError("");
                            }}
                            className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-black outline-none transition focus:border-[#4C4CF9] focus:ring-2 focus:ring-[#4C4CF9]/10 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500"
                        >
                            <option value="" disabled>
                                Select resolution type
                            </option>

                            <option value="GUIDANCE_PROVIDED">
                                Guidance Provided
                            </option>

                            <option value="ASSISTED">
                                Assisted
                            </option>

                            <option value="SUPERVISOR_RESOLVED">
                                Supervisor Resolved
                            </option>
                        </select>
                    </div>

                    {/* RESOLUTION REMARKS */}
                    <div>
                        <label
                            htmlFor="resolution-remarks"
                            className="mb-2 block text-sm font-medium text-black"
                        >
                            Resolution Remarks
                            <span className="ml-1 text-red-500">
                                *
                            </span>
                        </label>

                        <textarea
                            id="resolution-remarks"
                            rows={4}
                            maxLength={1000}
                            disabled={submitting}
                            value={resolutionRemarks}
                            onChange={(e) => {
                                setResolutionRemarks(
                                    e.target.value
                                );
                                setError("");
                            }}
                            placeholder="Describe how the escalation was handled and resolved..."
                            className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-black outline-none transition placeholder:text-gray-400 focus:border-[#4C4CF9] focus:ring-2 focus:ring-[#4C4CF9]/10 disabled:cursor-not-allowed disabled:bg-gray-50"
                        />

                        <div className="mt-1.5 flex justify-end">
                            <span className="text-xs text-gray-400">
                                {resolutionRemarks.length}/1000
                            </span>
                        </div>
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
                            Completing this escalation records how the
                            IT Supervisor handled the request. The
                            ticket status will remain unchanged.
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
                        className="flex h-9 cursor-pointer items-center gap-2 rounded-lg bg-[#4C4CF9] px-4 text-sm font-medium text-white transition-colors hover:bg-[#3a3ae0] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {submitting && (
                            <Loader2
                                size={15}
                                className="animate-spin"
                            />
                        )}

                        {submitting
                            ? "Completing..."
                            : "Complete Escalation"}
                    </button>
                </div>
            </div>
        </div>
    );
}