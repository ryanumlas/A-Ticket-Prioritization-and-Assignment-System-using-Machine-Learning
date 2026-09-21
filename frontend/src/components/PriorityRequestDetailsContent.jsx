import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import api from "../api";
import {
    Ticket,
    ArrowUpDown,
    MessageSquareText,
    Check,
    X,
    ArrowRight,
    Info,
} from "lucide-react";

export default function PriorityRequestDetailsContent() {
    const { id } = useParams();

    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [reviewRemarks, setReviewRemarks] = useState("");
    const [approving, setApproving] = useState(false);

    useEffect(() => {
        const fetchPriorityRequest = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await api.get(
                    `/tickets/priority-change-requests/detail/${id}/`
                );

                setRequest(response.data);
            } catch (error) {
                setError(
                    error.response?.data?.error ||
                        "Failed to load priority request."
                );
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchPriorityRequest();
        }
    }, [id]);

    const handleApprove = async () => {
        if (approving || request.status !== "pending") {
            return;
        }

        try {
            setApproving(true);

            const response = await api.patch(
                `/tickets/priority-change-requests/approve/${id}/`,
                {
                    review_remarks: reviewRemarks.trim(),
                }
            );

            setRequest(response.data.request);
            setReviewRemarks("");

            toast.success("Priority request approved", {
                description:
                    response.data.message ||
                    "The ticket priority and SLA have been updated successfully.",
                duration: 6000,
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
            toast.error("Unable to approve request", {
                description:
                    error.response?.data?.error ||
                    "Something went wrong while approving the priority request.",
                duration: 6000,
                style: {
                    background: "#ffffff",
                    color: "#000000",
                    border: "1px solid #e5e7eb",
                    borderRadius: "10px",
                    padding: "16px",
                    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
                },
            });
        } finally {
            setApproving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <p className="text-sm text-gray-500">
                    Loading priority request...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <p className="text-sm text-red-600">
                    {error}
                </p>
            </div>
        );
    }

    if (!request) {
        return null;
    }

    const submittedByName = [
        request.submitted_by_first_name,
        request.submitted_by_last_name,
    ]
        .filter(Boolean)
        .join(" ");

    const requestedByName = [
        request.requested_by_first_name,
        request.requested_by_last_name,
    ]
        .filter(Boolean)
        .join(" ");

    const reviewedByName = [
        request.reviewed_by_first_name,
        request.reviewed_by_last_name,
    ]
        .filter(Boolean)
        .join(" ");

    const submittedBy = {
        name: submittedByName || "Unknown User",
        user_code: request.submitted_by_user_code,
        role: request.submitted_by_role,
        department: request.employee_department,
    };

    const requestedBy = {
        name: requestedByName || "Unknown User",
        user_code: request.requested_by_user_code,
        role: request.requested_by_role,
        department: request.it_department,
    };

    const reviewedBy = {
        name: reviewedByName || "-",
        user_code: request.reviewed_by_user_code,
        role: request.reviewed_by_role,
    };

    const isApproved = request.status === "approved";
    const isRejected = request.status === "rejected";
    const isReviewed = isApproved || isRejected;
    const isPending = request.status === "pending";

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-[1.05fr_0.95fr] items-start gap-4">
                {/* LEFT COLUMN */}
                <div className="space-y-4">
                    {/* TICKET INFORMATION */}
                    <div className="overflow-hidden rounded-xl border border-gray-300 bg-white">
                        <div className="flex items-start gap-3 border-b border-gray-200 px-5 py-4">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                                <Ticket
                                    size={18}
                                    className="text-gray-600"
                                />
                            </div>

                            <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-3">
                                    <h2 className="text-base font-semibold text-black">
                                        Ticket Information
                                    </h2>

                                    <span
                                        className={`shrink-0 rounded-md border px-2.5 py-1 text-xs font-medium ${getStatusStyle(
                                            request.status
                                        )}`}
                                    >
                                        {formatStatus(request.status)}
                                    </span>
                                </div>

                                <p className="mt-0.5 text-xs text-gray-500">
                                    Information submitted by the employee.
                                </p>
                            </div>
                        </div>

                        <div className="divide-y divide-gray-200">
                            <div className="grid grid-cols-2">
                                <InfoCell
                                    label="Ticket Code"
                                    value={request.ticket_code}
                                />

                                <InfoCell
                                    label="Affected Scope"
                                    value={request.affected_scope}
                                    bordered
                                />
                            </div>

                            <InfoCell
                                label="Subject"
                                value={request.subject}
                            />

                            <InfoCell
                                label="Description"
                                value={request.description}
                                multiline
                            />

                            <InfoCell
                                label="Business Impact"
                                value={request.business_impact}
                                multiline
                            />

                            <div className="px-5 py-4">
                                <div className="grid grid-cols-2 gap-6">
                                    <UserCard
                                        label="Ticket Submitted By"
                                        user={submittedBy}
                                    />

                                    <UserCard
                                        label="Priority Requested By"
                                        user={requestedBy}
                                    />
                                </div>

                                <div className="mt-5 grid grid-cols-2 gap-6 border-t border-gray-200 pt-4">
                                    <InfoRow
                                        label="Ticket Submitted At"
                                        value={formatDate(
                                            request.submitted_at
                                        )}
                                    />

                                    <InfoRow
                                        label="Priority Requested At"
                                        value={formatDate(
                                            request.requested_at
                                        )}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="space-y-4">
                    {/* PRIORITY CHANGE */}
                    <div className="overflow-hidden rounded-xl border border-gray-300 bg-white">
                        <div className="flex items-start gap-3 border-b border-gray-200 px-5 py-4">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                                <ArrowUpDown
                                    size={18}
                                    className="text-gray-600"
                                />
                            </div>

                            <div>
                                <h2 className="text-base font-semibold text-black">
                                    Priority Change
                                </h2>

                                <p className="mt-0.5 text-xs text-gray-500">
                                    Current ticket priority and the requested
                                    priority.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-5">
                            <PriorityBox
                                title="Current Priority"
                                priority={request.current_priority}
                            />

                            <ArrowRight
                                size={21}
                                className="shrink-0 text-gray-500"
                            />

                            <PriorityBox
                                title="Requested Priority"
                                priority={request.requested_priority}
                            />
                        </div>
                    </div>

                    {/* REASON FOR REQUEST */}
                    <div className="overflow-hidden rounded-xl border border-gray-300 bg-white">
                        <div className="flex items-start gap-3 border-b border-gray-200 px-5 py-4">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                                <MessageSquareText
                                    size={18}
                                    className="text-gray-600"
                                />
                            </div>

                            <div>
                                <h2 className="text-base font-semibold text-black">
                                    Reason for Request
                                </h2>

                                <p className="mt-0.5 text-xs text-gray-500">
                                    Reason provided by IT Support for the
                                    priority change.
                                </p>
                            </div>
                        </div>

                        <div className="p-5">
                            <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                                <p className="whitespace-pre-wrap break-words text-sm leading-6 text-black">
                                    {request.reason ||
                                        "No reason provided."}
                                </p>
                            </div>

                            <div className="my-4 border-t border-gray-200" />

                            <div className="flex items-center gap-3 pt-2">
                                <button
                                    type="button"
                                    disabled={
                                        approving ||
                                        !isPending
                                    }
                                    className="flex h-10 flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border border-red-400 bg-white px-4 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-gray-50 disabled:text-gray-400"
                                >
                                    <X size={17} />

                                    {isRejected
                                        ? "Rejected"
                                        : "Reject Request"}
                                </button>

                                <button
                                    type="button"
                                    onClick={handleApprove}
                                    disabled={
                                        approving ||
                                        !isPending
                                    }
                                    className="flex h-10 flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#4C4CF9] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#3f3fe0] disabled:cursor-not-allowed disabled:bg-gray-300"
                                >
                                    <Check size={17} />

                                    {approving
                                        ? "Approving..."
                                        : isApproved
                                        ? "Approved"
                                        : "Approve Request"}
                                </button>
                            </div>

                            {!isReviewed && (
                                <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-blue-200 bg-blue-50 px-3.5 py-3">
                                    <Info
                                        size={17}
                                        className="mt-0.5 shrink-0 text-blue-600"
                                    />

                                    <p className="text-xs leading-5 text-blue-700">
                                        Approving this request will update the
                                        ticket's priority and recalculate the
                                        SLA deadlines based on the new
                                        priority.
                                    </p>
                                </div>
                            )}

                            {isReviewed && (
                                <div
                                    className={`mt-4 flex items-center gap-3 rounded-lg border px-4 py-3 ${
                                        isApproved
                                            ? "border-green-200 bg-green-50"
                                            : "border-red-200 bg-red-50"
                                    }`}
                                >
                                    <div
                                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                                            isApproved
                                                ? "bg-green-100"
                                                : "bg-red-100"
                                        }`}
                                    >
                                        {isApproved ? (
                                            <Check
                                                size={16}
                                                className="text-green-600"
                                            />
                                        ) : (
                                            <X
                                                size={16}
                                                className="text-red-600"
                                            />
                                        )}
                                    </div>

                                    <div>
                                        <p
                                            className={`text-sm font-semibold ${
                                                isApproved
                                                    ? "text-green-800"
                                                    : "text-red-800"
                                            }`}
                                        >
                                            Review Completed
                                        </p>

                                        <p
                                            className={`mt-0.5 text-xs ${
                                                isApproved
                                                    ? "text-green-700"
                                                    : "text-red-700"
                                            }`}
                                        >
                                            This priority request has already
                                            been{" "}
                                            {isApproved
                                                ? "approved."
                                                : "rejected."}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* REVIEW REMARKS */}
            <div className="overflow-hidden rounded-xl border border-gray-300 bg-white">
                <div className="flex items-start gap-3 border-b border-gray-200 px-5 py-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                        <MessageSquareText
                            size={18}
                            className="text-gray-600"
                        />
                    </div>

                    <div>
                        <h2 className="text-base font-semibold text-black">
                            Review Remarks
                            {!isReviewed && (
                                <span className="font-normal text-gray-500">
                                    {" "}
                                    (Optional)
                                </span>
                            )}
                        </h2>

                        <p className="mt-0.5 text-xs text-gray-500">
                            {isReviewed
                                ? "Details of the Service Desk review."
                                : "Add any remarks regarding your decision."}
                        </p>
                    </div>
                </div>

                {isReviewed ? (
                    <div className="p-5">
                        <div className="grid grid-cols-2 gap-6">
                            {/* DECISION */}
                            <div>
                                <p className="text-xs font-medium uppercase text-gray-500">
                                    Decision
                                </p>

                                <div className="mt-2 flex items-center gap-2">
                                    <div
                                        className={`flex h-7 w-7 items-center justify-center rounded-full ${
                                            isApproved
                                                ? "bg-green-100"
                                                : "bg-red-100"
                                        }`}
                                    >
                                        {isApproved ? (
                                            <Check
                                                size={15}
                                                className="text-green-600"
                                            />
                                        ) : (
                                            <X
                                                size={15}
                                                className="text-red-600"
                                            />
                                        )}
                                    </div>

                                    <span
                                        className={`text-sm font-semibold ${
                                            isApproved
                                                ? "text-green-700"
                                                : "text-red-700"
                                        }`}
                                    >
                                        {isApproved
                                            ? "Approved"
                                            : "Rejected"}
                                    </span>
                                </div>
                            </div>

                            {/* REVIEWED BY */}
                            <div>
                                <p className="text-xs font-medium uppercase text-gray-500">
                                    Reviewed By
                                </p>

                                <div className="mt-2 flex items-center gap-3">
                                    <Avatar
                                        name={reviewedBy.name}
                                    />

                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold text-black">
                                            {reviewedBy.name || "-"}
                                        </p>

                                        <p className="mt-0.5 truncate text-xs text-gray-500">
                                            {reviewedBy.user_code || "-"}
                                            {" • "}
                                            {reviewedBy.role || "-"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* REVIEWED AT */}
                        <div className="mt-5 border-t border-gray-200 pt-4">
                            <InfoRow
                                label="Reviewed At"
                                value={formatDate(
                                    request.reviewed_at
                                )}
                            />
                        </div>

                        {/* REVIEW REMARKS */}
                        <div className="mt-5 border-t border-gray-200 pt-4">
                            <p className="text-xs font-medium uppercase text-gray-500">
                                Review Remarks
                            </p>

                            <div className="mt-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                                <p className="whitespace-pre-wrap break-words text-sm leading-6 text-black">
                                    {request.review_remarks || "-"}
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="p-5">
                        <textarea
                            rows={4}
                            maxLength={500}
                            value={reviewRemarks}
                            onChange={(e) =>
                                setReviewRemarks(e.target.value)
                            }
                            placeholder="Enter your remarks here..."
                            className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-black outline-none transition placeholder:text-gray-400 focus:border-[#4C4CF9] focus:ring-2 focus:ring-[#4C4CF9]/10"
                        />

                        <div className="mt-1 text-right text-xs text-gray-400">
                            {reviewRemarks.length}/500
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function InfoCell({
    label,
    value,
    bordered = false,
    multiline = false,
}) {
    return (
        <div
            className={`px-5 py-4 ${
                bordered ? "border-l border-gray-200" : ""
            }`}
        >
            <p className="text-xs font-medium uppercase text-gray-500">
                {label}
            </p>

            <p
                className={`mt-2 whitespace-pre-wrap break-words text-sm text-black ${
                    multiline ? "leading-6" : "font-medium"
                }`}
            >
                {value || "-"}
            </p>
        </div>
    );
}

function InfoRow({ label, value }) {
    return (
        <div className="min-w-0">
            <p className="text-xs font-medium uppercase text-gray-500">
                {label}
            </p>

            <p className="mt-2 text-sm font-medium text-black">
                {value || "-"}
            </p>
        </div>
    );
}

function UserCard({ label, user }) {
    return (
        <div className="min-w-0">
            <p className="text-xs font-medium uppercase text-gray-500">
                {label}
            </p>

            {!user?.name ? (
                <p className="mt-3 text-sm text-gray-400">
                    -
                </p>
            ) : (
                <div className="mt-3 flex items-center gap-3">
                    <Avatar name={user.name} />

                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-black">
                            {user.name}
                        </p>

                        <p className="mt-1 truncate text-xs text-gray-500">
                            {user.user_code || "-"}
                            {" • "}
                            {user.role || "-"}
                        </p>

                        {user.department && (
                            <p className="mt-0.5 truncate text-xs text-gray-500">
                                {user.department}
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function Avatar({ name }) {
    const initials = getInitials(name);

    return (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#4C4CF9]/10 text-xs font-semibold text-[#4C4CF9]">
            {initials}
        </div>
    );
}

function getInitials(name) {
    if (!name) {
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

function PriorityBox({
    title,
    priority,
}) {
    const labels = {
        P1: "Critical",
        P2: "High",
        P3: "Medium",
        P4: "Low",
        P5: "Very Low",
    };

    const styles = {
        P1: "border-red-300 bg-red-50 text-red-700",
        P2: "border-orange-300 bg-orange-50 text-orange-700",
        P3: "border-amber-300 bg-amber-50 text-amber-700",
        P4: "border-blue-300 bg-blue-50 text-blue-700",
        P5: "border-gray-300 bg-gray-50 text-gray-700",
    };

    const style =
        styles[priority] ||
        "border-gray-300 bg-gray-50 text-gray-700";

    return (
        <div
            className={`flex flex-1 flex-col items-center rounded-xl border px-4 py-5 ${style}`}
        >
            <p className="text-xs font-medium">
                {title}
            </p>

            <p className="mt-1 text-3xl font-semibold">
                {priority || "-"}
            </p>

            <p className="mt-1 text-sm font-medium">
                {labels[priority] || "Unknown"}
            </p>
        </div>
    );
}

function formatDate(value) {
    if (!value) {
        return "-";
    }

    return new Date(value).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

function formatStatus(status = "") {
    if (!status) {
        return "-";
    }

    return status
        .replaceAll("_", " ")
        .replace(/\b\w/g, (letter) =>
            letter.toUpperCase()
        );
}

function getStatusStyle(status = "") {
    switch (status.toLowerCase()) {
        case "pending":
            return "border-amber-300 bg-amber-50 text-amber-700";

        case "approved":
            return "border-green-300 bg-green-50 text-green-700";

        case "rejected":
            return "border-red-300 bg-red-50 text-red-700";

        default:
            return "border-gray-300 bg-gray-100 text-gray-700";
    }
}