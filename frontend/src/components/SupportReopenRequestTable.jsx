
import { useState } from "react";
import { Check, X, Clock } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { formatDate } from "../utils/formatDate";
import { priorityLabel, priorityColor } from "../utils/priority";

export default function SupportReopenRequestTable({
    requestList = [],
    loading = false,
    onReviewComplete,
}) {
    const navigate = useNavigate();
    const [reviewingId, setReviewingId] = useState(null);
    const [remarks, setRemarks] = useState({});
    const [rejectingId, setRejectingId] = useState(null);

    const getRemark = (requestId) => remarks[requestId] ?? "";

    const getSubject = (request) =>
        request.subject || request.ticket_title || request.title || "Untitled ticket";

    const getPriority = (request) => {
        const rawPriority =
            request.priority_code ||
            request.priority_level ||
            request.priority ||
            request.predicted_priority;

        if (!rawPriority) return null;

        const value =
            typeof rawPriority === "object"
                ? rawPriority.code ||
                  rawPriority.priority_level ||
                  rawPriority.level ||
                  rawPriority.name
                : rawPriority;

        if (!value) return null;

        const match = String(value).toUpperCase().match(/\bP[1-5]\b/);
        return match ? match[0] : null;
    };

    const getRequestStatus = (request) => {
        const status = String(
            request.request_status ||
                request.reopen_request_status ||
                request.status ||
                "pending"
        ).toLowerCase();

        const styles = {
            pending: "border border-amber-200 bg-amber-100 text-amber-800",
            approved: "border border-green-200 bg-green-100 text-green-800",
            rejected: "border border-red-200 bg-red-100 text-red-800",
        };

        return {
            label: status
                .replaceAll("_", " ")
                .replace(/\b\w/g, (char) => char.toUpperCase()),
            className:
                styles[status] ||
                "border border-gray-200 bg-gray-100 text-gray-700",
        };
    };

    const openTicket = (ticketId) => {
        if (ticketId) navigate(`/ticket/${ticketId}`);
    };

    const handleRowKeyDown = (event, ticketId) => {
        if (event.target !== event.currentTarget) return;

        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openTicket(ticketId);
        }
    };

    const handleReview = async (request, decision) => {
        const requestId = request.id;
        const reviewRemarks = getRemark(requestId).trim();

        if (decision === "rejected" && !reviewRemarks) {
            toast.error("Please provide a reason for rejecting this request.");
            setRejectingId(requestId);
            return;
        }

        const confirmed = window.confirm(
            decision === "approved"
                ? `Approve the reopen request for ${request.ticket_code || "this ticket"} and assign it to yourself?`
                : `Reject the reopen request for ${request.ticket_code || "this ticket"}?`
        );

        if (!confirmed) return;

        setReviewingId(requestId);

        try {
            await api.post(`/tickets/reopen-requests/${requestId}/review/`, {
                decision,
                review_remarks: reviewRemarks,
            });

            toast.success(
                decision === "approved"
                    ? "Request approved. The ticket has been assigned to you."
                    : "Reopen request rejected."
            );

            setRejectingId(null);
            setRemarks((current) => {
                const updated = { ...current };
                delete updated[requestId];
                return updated;
            });

            onReviewComplete?.();
        } catch (error) {
            console.error("Error reviewing reopen request:", error);

            const data = error.response?.data;
            const message =
                data?.detail ||
                data?.error ||
                data?.review_remarks?.[0] ||
                data?.decision?.[0] ||
                "Unable to review this request.";

            toast.error(
                typeof message === "string"
                    ? message
                    : "Unable to review this request."
            );
        } finally {
            setReviewingId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[300px] items-center justify-center rounded-lg border border-gray-200 bg-white">
                <div className="flex flex-col items-center gap-3 text-gray-500">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
                    <p className="text-sm">Loading reopen requests...</p>
                </div>
            </div>
        );
    }

    if (requestList.length === 0) {
        return (
            <div className="flex min-h-[300px] flex-col items-center justify-center rounded-lg border border-gray-200 bg-white px-5 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                    <Clock size={22} className="text-gray-400" />
                </div>
                <h3 className="text-base font-semibold text-gray-700">
                    No reopen requests found
                </h3>
                <p className="mt-1 max-w-sm text-sm text-gray-500">
                    Pending employee requests will appear here when they are submitted.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            {/* Desktop Table */}
            <div className="hidden overflow-x-auto overflow-y-auto md:block md:h-[637px] min-[1280px]:max-[1365px]:h-[450px] min-[1366px]:max-[1537px]:h-[500px] min-[1538px]:max-[1919px]:h-[580px]">
                <table className="w-full min-w-[1200px] border-collapse text-left text-sm text-black">
                    <thead className="sticky top-0 z-10 bg-gray-50 text-black">
                        <tr>
                            <th className="whitespace-nowrap border-b border-gray-200 px-4 py-3 text-sm font-semibold">Ticket ID</th>
                            <th className="whitespace-nowrap border-b border-gray-200 px-4 py-3 text-sm font-semibold">Requester</th>
                            <th className="border-b border-gray-200 px-4 py-3 text-sm font-semibold">Reason</th>
                            <th className="border-b border-gray-200 px-4 py-3 text-sm font-semibold">Current Assignee</th>
                            <th className="whitespace-nowrap border-b border-gray-200 px-4 py-3 text-sm font-semibold">Requested At</th>
                            <th className="whitespace-nowrap border-b border-gray-200 px-4 py-3 text-sm font-semibold">Status</th>
                            <th className="whitespace-nowrap border-b border-gray-200 px-4 py-3 text-center text-sm font-semibold">Actions</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200">
                        {requestList.map((request) => {
                            const canApprove = request.can_approve !== false;
                            const isReviewing = reviewingId === request.id;
                            const isRejecting = rejectingId === request.id;
                            const requestStatus = getRequestStatus(request);
                            const priority = getPriority(request);

                            return (
                                <tr
                                    key={request.id}
                                    role="link"
                                    tabIndex={0}
                                    onClick={() => openTicket(request.ticket_id)}
                                    onKeyDown={(event) => handleRowKeyDown(event, request.ticket_id)}
                                    className="cursor-pointer transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
                                    title="Open ticket details"
                                >
                                    <td className="w-[210px] px-4 py-4 align-top">
                                        <p className="font-semibold text-black hover:underline">
                                            {request.ticket_code || `Ticket #${request.ticket_id}`}
                                        </p>
                                        <p className="mt-1 max-w-[230px] truncate text-sm text-black">
                                            {getSubject(request)}
                                        </p>
                                        {priority && (
                                            <span className={`mt-2 inline-flex rounded-md px-2 py-1 text-xs font-medium ${priorityColor[priority] || "border border-gray-300 bg-gray-100 text-gray-700"}`}>
                                                {priorityLabel[priority] || priority}
                                            </span>
                                        )}
                                    </td>

                                    <td className="w-[180px] px-4 py-4 align-top">
                                        <p className="break-words font-medium text-black">
                                            {request.requested_by || "Unknown"}
                                        </p>
                                        <p className="mt-1 break-words text-xs text-gray-500">
                                            {request.employee_department || request.requester_department || "—"}
                                        </p>
                                    </td>

                                    <td className="w-[320px] min-w-[280px] max-w-[360px] px-4 py-4 align-top">
                                        <p
                                            className="line-clamp-2 break-words text-sm leading-5 text-black"
                                            title={request.reason || "No reason provided"}
                                        >
                                            {request.reason || "No reason provided"}
                                        </p>
                                    </td>

                                    <td className="w-[170px] px-4 py-4 align-top text-sm text-black">
                                        {request.current_assignee || "Unassigned"}
                                    </td>

                                    <td className="w-[210px] whitespace-nowrap px-4 py-4 align-top text-sm text-black">
                                        {formatDate(request.requested_at)}
                                    </td>

                                    <td className="w-[170px] px-4 py-4 align-top">
                                        <span className={`inline-flex rounded-md px-2 py-1 text-xs font-medium ${requestStatus.className}`}>
                                            {requestStatus.label}
                                        </span>
                                    </td>

                                    <td
                                        className="w-[200px] px-4 py-4 align-top"
                                        onClick={(event) => event.stopPropagation()}
                                        onKeyDown={(event) => event.stopPropagation()}
                                    >
                                        {isRejecting && (
                                            <div className="mb-2">
                                                <label className="mb-1 block text-sm font-medium text-black">
                                                    Rejection remarks (required)
                                                </label>
                                                <textarea
                                                    rows={3}
                                                    value={getRemark(request.id)}
                                                    onChange={(event) =>
                                                        setRemarks((current) => ({
                                                            ...current,
                                                            [request.id]: event.target.value,
                                                        }))
                                                    }
                                                    placeholder="Explain why this request is rejected..."
                                                    className="w-full resize-y rounded-md border border-gray-300 px-2 py-2 text-sm text-black outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                                />
                                            </div>
                                        )}

                                        {!canApprove && (
                                            <p className="mb-2 text-xs text-amber-700">
                                                You are not eligible to approve this request.
                                            </p>
                                        )}

                                        <div className="flex flex-wrap items-center justify-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleReview(request, "approved")}
                                                disabled={isReviewing || !canApprove}
                                                className="inline-flex items-center justify-center gap-1 rounded-md bg-green-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <Check size={14} />
                                                {isReviewing ? "Processing..." : "Approve"}
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => setRejectingId(isRejecting ? null : request.id)}
                                                disabled={isReviewing}
                                                className="inline-flex items-center justify-center gap-1 rounded-md bg-red-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <X size={14} />
                                                Reject
                                            </button>

                                            {isRejecting && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleReview(request, "rejected")}
                                                    disabled={isReviewing}
                                                    className="w-full rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                                                >
                                                    {isReviewing ? "Submitting..." : "Confirm Rejection"}
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards */}
            <div className="space-y-3 p-3 md:hidden">
                {requestList.map((request) => {
                    const canApprove = request.can_approve !== false;
                    const isReviewing = reviewingId === request.id;
                    const isRejecting = rejectingId === request.id;
                    const requestStatus = getRequestStatus(request);
                    const priority = getPriority(request);

                    return (
                        <div
                            key={request.id}
                            role="link"
                            tabIndex={0}
                            onClick={() => openTicket(request.ticket_id)}
                            onKeyDown={(event) => handleRowKeyDown(event, request.ticket_id)}
                            className="cursor-pointer rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                            title="Open ticket details"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0 flex-1">
                                    <p className="break-words font-semibold text-black hover:underline">
                                        {request.ticket_code || `Ticket #${request.ticket_id}`}
                                    </p>
                                    <p className="mt-1 break-words text-sm text-black">
                                        {getSubject(request)}
                                    </p>
                                    {priority && (
                                        <span className={`mt-2 inline-flex rounded-md px-2 py-1 text-xs font-medium ${priorityColor[priority] || "border border-gray-300 bg-gray-100 text-gray-700"}`}>
                                            {priorityLabel[priority] || priority}
                                        </span>
                                    )}
                                </div>
                                <span className={`shrink-0 rounded-md px-2 py-1 text-xs font-medium ${requestStatus.className}`}>
                                    {requestStatus.label}
                                </span>
                            </div>

                            <div className="mt-3 space-y-3 text-sm text-black">
                                <div>
                                    <p className="font-medium">{request.requested_by || "Unknown"}</p>
                                    <p className="mt-1 text-xs text-gray-500">
                                        {request.employee_department || request.requester_department || "—"}
                                    </p>
                                </div>

                                <p>
                                    <span className="font-medium">Current assignee: </span>
                                    {request.current_assignee || "Unassigned"}
                                </p>

                                <p>
                                    <span className="font-medium">Requested: </span>
                                    {formatDate(request.requested_at)}
                                </p>

                                <div className="rounded-md bg-gray-50 p-3">
                                    <p className="mb-1 text-sm font-semibold text-black">Reason</p>
                                    <p
                                        className="line-clamp-2 break-words text-sm leading-5 text-black"
                                        title={request.reason || "No reason provided"}
                                    >
                                        {request.reason || "No reason provided"}
                                    </p>
                                </div>
                            </div>

                            <div
                                className="mt-4"
                                onClick={(event) => event.stopPropagation()}
                                onKeyDown={(event) => event.stopPropagation()}
                            >
                                {isRejecting && (
                                    <div className="mb-3">
                                        <label className="mb-1 block text-sm font-medium text-black">
                                            Rejection remarks (required)
                                        </label>
                                        <textarea
                                            rows={3}
                                            value={getRemark(request.id)}
                                            onChange={(event) =>
                                                setRemarks((current) => ({
                                                    ...current,
                                                    [request.id]: event.target.value,
                                                }))
                                            }
                                            placeholder="Explain why this request is rejected..."
                                            className="w-full resize-y rounded-md border border-gray-300 px-3 py-2 text-sm text-black outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                        />
                                    </div>
                                )}

                                {!canApprove && (
                                    <p className="mb-3 text-xs text-amber-700">
                                        You are not eligible to approve this request.
                                    </p>
                                )}

                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => handleReview(request, "approved")}
                                        disabled={isReviewing || !canApprove}
                                        className="inline-flex items-center justify-center gap-1 rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <Check size={15} />
                                        {isReviewing ? "Processing..." : "Approve"}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setRejectingId(isRejecting ? null : request.id)}
                                        disabled={isReviewing}
                                        className="inline-flex items-center justify-center gap-1 rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <X size={15} />
                                        Reject
                                    </button>

                                    {isRejecting && (
                                        <button
                                            type="button"
                                            onClick={() => handleReview(request, "rejected")}
                                            disabled={isReviewing}
                                            className="col-span-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
                                        >
                                            {isReviewing ? "Submitting..." : "Confirm Rejection"}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}