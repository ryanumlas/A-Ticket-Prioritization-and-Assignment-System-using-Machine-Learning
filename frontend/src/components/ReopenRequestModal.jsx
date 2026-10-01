
import { useState } from "react";
import {
    X,
    RotateCcw,
    Clock3,
    UserRound,
    Building2,
    CalendarDays,
    FileText,
    CheckCircle2,
    XCircle,
} from "lucide-react";
import { formatDate } from "../utils/formatDate";

export default function ReopenRequestModal({
    open,
    isOpen,
    onClose,
    request,
    canReview = false,
    onApprove,
    onReject,
    reviewing = false,
}) {
    const [reviewRemarks, setReviewRemarks] = useState("");

    const visible = open ?? isOpen;

    if (!visible || !request) return null;

    const requesterName =
        request.requester_name ||
        request.employee_name ||
        request.requester?.full_name ||
        request.requester?.username ||
        "Unknown requester";

    const department =
        request.employee_department ||
        request.requester_department ||
        request.requester?.department_name ||
        request.requester?.department?.name ||
        "—";

    const ticketId =
        request.ticket_number ||
        request.ticket_code ||
        request.ticket?.ticket_number ||
        request.ticket?.ticket_code ||
        (request.ticket_id ? `Ticket #${request.ticket_id}` : "—");

    const ticketTitle =
        request.ticket_title ||
        request.ticket?.title ||
        request.subject ||
        request.title ||
        "Untitled ticket";

    const reason =
        request.reason ||
        request.reopen_reason ||
        "No reason provided.";

    const status = String(
        request.request_status ||
        request.reopen_request_status ||
        request.status ||
        "pending"
    ).toLowerCase();

    const isPending = status === "pending";
    const isApproved = status === "approved";
    const isRejected = status === "rejected";

    const statusStyles = {
        pending: "border-amber-200 bg-amber-50 text-amber-700",
        approved: "border-green-200 bg-green-50 text-green-700",
        rejected: "border-red-200 bg-red-50 text-red-700",
    };

    const statusLabel =
        status.charAt(0).toUpperCase() + status.slice(1);

    const handleClose = () => {
        setReviewRemarks("");
        onClose?.();
    };

    const handleReject = () => {
        onReject?.(request, reviewRemarks.trim());
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onMouseDown={(event) => {
                if (
                    event.target === event.currentTarget &&
                    !reviewing
                ) {
                    handleClose();
                }
            }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="reopen-request-title"
                className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-xl"
            >
                {/* Header */}
                <div className="flex items-start justify-between border-b border-gray-200 px-5 py-4">
                    <div className="flex min-w-0 items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#4C4CF9]/10 text-[#4C4CF9]">
                            <RotateCcw size={20} />
                        </div>

                        <div className="min-w-0">
                            <h2
                                id="reopen-request-title"
                                className="text-base font-semibold text-gray-900"
                            >
                                Reopen Request Details
                            </h2>

                            <p className="mt-1 text-sm leading-5 text-gray-500">
                                Review the request and its current status.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={reviewing}
                        aria-label="Close modal"
                        className="ml-3 rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="space-y-5 px-5 py-5">
                    {/* Status */}
                    <div className="flex items-center justify-between gap-3">
                        <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                            Request Status
                        </span>

                        <span
                            className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium ${
                                statusStyles[status] ||
                                "border-gray-200 bg-gray-50 text-gray-600"
                            }`}
                        >
                            {isPending && <Clock3 size={13} />}
                            {isApproved && <CheckCircle2 size={13} />}
                            {isRejected && <XCircle size={13} />}
                            {statusLabel}
                        </span>
                    </div>

                    {/* Ticket */}
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                            Ticket Information
                        </p>

                        <p className="mt-2 text-sm font-semibold text-[#4C4CF9]">
                            {ticketId}
                        </p>

                        <p className="mt-1 break-words text-sm font-medium leading-5 text-black">
                            {ticketTitle}
                        </p>
                    </div>

                    {/* Requester */}
                    <div>
                        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-500">
                            Requester Information
                        </p>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="flex min-w-0 items-start gap-2.5">
                                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#4C4CF9]/10 text-[#4C4CF9]">
                                    <UserRound size={16} />
                                </div>

                                <div className="min-w-0">
                                    <p className="text-xs text-gray-500">
                                        Requested By
                                    </p>
                                    <p className="mt-1 break-words text-sm font-medium text-black">
                                        {requesterName}
                                    </p>
                                </div>
                            </div>

                            <div className="flex min-w-0 items-start gap-2.5">
                                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#4C4CF9]/10 text-[#4C4CF9]">
                                    <Building2 size={16} />
                                </div>

                                <div className="min-w-0">
                                    <p className="text-xs text-gray-500">
                                        Department
                                    </p>
                                    <p className="mt-1 break-words text-sm font-medium text-black">
                                        {department}
                                    </p>
                                </div>
                            </div>

                            <div className="flex min-w-0 items-start gap-2.5 sm:col-span-2">
                                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#4C4CF9]/10 text-[#4C4CF9]">
                                    <CalendarDays size={16} />
                                </div>

                                <div className="min-w-0">
                                    <p className="text-xs text-gray-500">
                                        Requested At
                                    </p>
                                    <p className="mt-1 text-sm font-medium text-black">
                                        {formatDate(
                                            request.requested_at ||
                                            request.created_at
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Reason */}
                    <div>
                        <div className="mb-2 flex items-center gap-2">
                            <FileText size={15} className="text-gray-500" />
                            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                Reason for Reopening
                            </p>
                        </div>

                        <div className="min-h-[90px] rounded-lg border border-gray-200 bg-white px-3 py-3">
                            <p className="whitespace-pre-wrap break-words text-sm leading-6 text-black">
                                {reason}
                            </p>
                        </div>
                    </div>

                    {/* Final decision */}
                    {!isPending && (
                        <div
                            className={`rounded-lg border px-3.5 py-3 ${
                                isApproved
                                    ? "border-green-200 bg-green-50"
                                    : "border-red-200 bg-red-50"
                            }`}
                        >
                            <div className="flex items-start gap-2.5">
                                {isApproved ? (
                                    <CheckCircle2
                                        size={18}
                                        className="mt-0.5 shrink-0 text-green-600"
                                    />
                                ) : (
                                    <XCircle
                                        size={18}
                                        className="mt-0.5 shrink-0 text-red-600"
                                    />
                                )}

                                <div>
                                    <p
                                        className={`text-sm font-semibold ${
                                            isApproved
                                                ? "text-green-800"
                                                : "text-red-800"
                                        }`}
                                    >
                                        Request {statusLabel}
                                    </p>

                                    <p
                                        className={`mt-1 text-xs leading-5 ${
                                            isApproved
                                                ? "text-green-700"
                                                : "text-red-700"
                                        }`}
                                    >
                                        {isApproved
                                            ? "This reopen request has been approved."
                                            : "This reopen request has been rejected."}
                                    </p>
                                </div>
                            </div>

                            {request.review_remarks && (
                                <div className="mt-3 border-t border-current/10 pt-3">
                                    <p className="text-xs font-semibold uppercase tracking-wide">
                                        {isRejected
                                            ? "Reason for Rejection"
                                            : "Review Remarks"}
                                    </p>

                                    <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-5">
                                        {request.review_remarks}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Rejection remarks: reviewer only */}
                    {canReview && isPending && (
                        <div>
                            <label
                                htmlFor="reopen-review-remarks"
                                className="mb-2 block text-sm font-medium text-gray-900"
                            >
                                Review Remarks
                                <span className="ml-1 font-normal text-gray-400">
                                    (Required when rejecting)
                                </span>
                            </label>

                            <textarea
                                id="reopen-review-remarks"
                                value={reviewRemarks}
                                onChange={(event) =>
                                    setReviewRemarks(event.target.value)
                                }
                                disabled={reviewing}
                                rows={3}
                                maxLength={1000}
                                placeholder="Enter the reason for your decision..."
                                className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#4C4CF9] focus:ring-2 focus:ring-[#4C4CF9]/20 disabled:bg-gray-50"
                            />

                            <p className="mt-1.5 text-right text-xs text-gray-400">
                                {reviewRemarks.length}/1000 characters
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex flex-col-reverse justify-end gap-2 border-t border-gray-200 bg-gray-50/50 px-5 py-4 sm:flex-row">
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={reviewing}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                    >
                        Close
                    </button>

                    {canReview && isPending && (
                        <>
                            <button
                                type="button"
                                onClick={handleReject}
                                disabled={
                                    reviewing ||
                                    reviewRemarks.trim().length < 3
                                }
                                className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {reviewing ? "Processing..." : "Reject Request"}
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    onApprove?.(request, reviewRemarks.trim())
                                }
                                disabled={reviewing}
                                className="rounded-lg bg-[#4C4CF9] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#3D3DE5] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {reviewing ? "Processing..." : "Approve Request"}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}