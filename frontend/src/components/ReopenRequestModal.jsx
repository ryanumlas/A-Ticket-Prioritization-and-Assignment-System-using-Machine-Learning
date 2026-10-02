import { useEffect, useState } from "react";
import { RotateCcw, X, CheckCircle2, XCircle, Clock, Info } from "lucide-react";

const formatDate = (value) => {
    if (!value) return "Not available";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Not available";
    }

    return date.toLocaleString();
};

const statusConfig = {
    pending: {
        label: "Pending Review",
        className: "border-amber-200 bg-amber-50 text-amber-700",
        icon: Clock,
    },
    approved: {
        label: "Approved",
        className: "border-green-200 bg-green-50 text-green-700",
        icon: CheckCircle2,
    },
    rejected: {
        label: "Rejected",
        className: "border-red-200 bg-red-50 text-red-700",
        icon: XCircle,
    },
};

export default function ReopenRequestModal({
    open,
    onClose,
    reopenRequest,
    isSupport = false,
    onReview,
    reviewing = false,
}) {
    const [decision, setDecision] = useState("approved");
    const [reviewRemarks, setReviewRemarks] = useState("");

    useEffect(() => {
        if (open) {
            setDecision("approved");
            setReviewRemarks("");
        }
    }, [open, reopenRequest?.id]);

    if (!open || !reopenRequest) {
        return null;
    }

    const status = String(reopenRequest.status || "pending").toLowerCase();
    const config = statusConfig[status] || statusConfig.pending;
    const StatusIcon = config.icon;
    const canReview = isSupport && status === "pending";

    const handleSubmitReview = () => {
        const remarks = reviewRemarks.trim();

        if (decision === "rejected" && !remarks) {
            return;
        }

        onReview?.(reopenRequest.id, decision, remarks);
    };

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !reviewing) {
                    onClose();
                }
            }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="reopen-details-title"
                className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-xl"
            >
                <div className="flex items-start justify-between border-b border-gray-200 px-5 py-4">
                    <div className="flex min-w-0 items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#4C4CF9]/10 text-[#4C4CF9]">
                            <RotateCcw size={20} />
                        </div>
                        <div className="min-w-0">
                            <h2 id="reopen-details-title" className="text-base font-semibold text-gray-900">
                                Reopen Request Details
                            </h2>
                            <p className="mt-1 text-sm leading-5 text-gray-500">
                                View the employee's request and its review status.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={reviewing}
                        className="ml-3 rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label="Close modal"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-5 px-5 py-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className="text-sm font-medium text-gray-700">
                            Request Status
                        </span>
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${config.className}`}>
                            <StatusIcon size={14} />
                            {config.label}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                            <p className="text-xs font-medium text-gray-500">
                                Requested By
                            </p>
                            <p className="mt-1 break-words text-sm font-semibold text-gray-900">
                                {reopenRequest.requested_by_name || "Employee"}
                            </p>
                        </div>

                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                            <p className="text-xs font-medium text-gray-500">
                                Requested At
                            </p>
                            <p className="mt-1 text-sm font-semibold text-gray-900">
                                {formatDate(reopenRequest.requested_at)}
                            </p>
                        </div>
                    </div>

                    <div>
                        <p className="mb-2 text-sm font-semibold text-gray-900">
                            Reason for Reopening
                        </p>
                        <div className="whitespace-pre-wrap break-words rounded-lg border border-gray-200 bg-white px-3.5 py-3 text-sm leading-6 text-gray-700">
                            {reopenRequest.reason || "No reason provided."}
                        </div>
                    </div>

                    {!canReview && status !== "pending" && (
                        <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
                            <h3 className="text-sm font-semibold text-gray-900">
                                Review Details
                            </h3>

                            <div>
                                <p className="text-xs font-medium text-gray-500">
                                    Reviewed By
                                </p>
                                <p className="mt-1 text-sm text-gray-800">
                                    {reopenRequest.reviewed_by_name || "Not available"}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-medium text-gray-500">
                                    Reviewed At
                                </p>
                                <p className="mt-1 text-sm text-gray-800">
                                    {formatDate(reopenRequest.reviewed_at)}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-medium text-gray-500">
                                    Review Remarks
                                </p>
                                <div className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-gray-800">
                                    {reopenRequest.review_remarks || "No review remarks provided."}
                                </div>
                            </div>
                        </div>
                    )}

                    {status === "pending" && !isSupport && (
                        <div className="flex items-start gap-2.5 rounded-lg border border-blue-200 bg-blue-50 px-3.5 py-3">
                            <Info size={17} className="mt-0.5 shrink-0 text-blue-600" />
                            <p className="text-sm leading-5 text-blue-700">
                                Your reopen request is waiting for IT Support to review it.
                            </p>
                        </div>
                    )}

                    {canReview && (
                        <div className="space-y-4 border-t border-gray-200 pt-4">
                            <h3 className="text-sm font-semibold text-gray-900">
                                Review Request
                            </h3>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setDecision("approved")}
                                    disabled={reviewing}
                                    className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                                        decision === "approved"
                                            ? "border-green-300 bg-green-50 text-green-700 ring-2 ring-green-100"
                                            : "border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
                                    }`}
                                >
                                    <CheckCircle2 size={16} />
                                    Approve
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setDecision("rejected")}
                                    disabled={reviewing}
                                    className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                                        decision === "rejected"
                                            ? "border-red-300 bg-red-50 text-red-700 ring-2 ring-red-100"
                                            : "border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
                                    }`}
                                >
                                    <XCircle size={16} />
                                    Reject
                                </button>
                            </div>

                            <div>
                                <label htmlFor="reopen-review-remarks" className="mb-2 block text-sm font-medium text-gray-900">
                                    Review Remarks {decision === "rejected" && <span className="text-red-500">*</span>}
                                </label>
                                <textarea
                                    id="reopen-review-remarks"
                                    value={reviewRemarks}
                                    onChange={(event) => setReviewRemarks(event.target.value)}
                                    disabled={reviewing}
                                    maxLength={1000}
                                    rows={4}
                                    placeholder={
                                        decision === "rejected"
                                            ? "Explain why this reopen request is being rejected..."
                                            : "Add optional remarks about this decision..."
                                    }
                                    className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#4C4CF9] focus:ring-2 focus:ring-[#4C4CF9]/20 disabled:bg-gray-50"
                                />
                                <p className="mt-1 text-right text-xs text-gray-400">
                                    {reviewRemarks.length}/1000 characters
                                </p>
                            </div>

                            {decision === "approved" && (
                                <div className="flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 px-3.5 py-3">
                                    <Info size={16} className="mt-0.5 shrink-0 text-green-600" />
                                    <p className="text-xs leading-5 text-green-700">
                                        Approving this request will reopen the ticket according to the backend review workflow.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-2 border-t border-gray-200 bg-gray-50/50 px-5 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={reviewing}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Close
                    </button>

                    {canReview && (
                        <button
                            type="button"
                            onClick={handleSubmitReview}
                            disabled={
                                reviewing ||
                                (decision === "rejected" && !reviewRemarks.trim())
                            }
                            className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                                decision === "approved"
                                    ? "bg-green-600 hover:bg-green-700 focus:ring-green-500/30"
                                    : "bg-red-600 hover:bg-red-700 focus:ring-red-500/30"
                            }`}
                        >
                            {reviewing
                                ? "Submitting..."
                                : decision === "approved"
                                    ? "Approve Request"
                                    : "Reject Request"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}