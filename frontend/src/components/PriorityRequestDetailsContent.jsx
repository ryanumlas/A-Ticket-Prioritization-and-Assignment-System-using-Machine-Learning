import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import api from "../api";
import {
    Ticket,
    ArrowUpDown,
    UserRound,
    MessageSquareText,
    Check,
    X,
    ArrowRight,
    Info,
    Clock3,
} from "lucide-react";

export default function PriorityRequestDetailsContent() {
    const { id } = useParams();

    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [remarks, setRemarks] = useState("");
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

        fetchPriorityRequest();
    }, [id]);

    const handleApprove = async () => {
        if (approving) return;

        try {
            setApproving(true);

            const response = await api.patch(
                `/tickets/priority-change-requests/approve/${id}/`,
                {
                    review_remarks: remarks,
                }
            );

            setRequest(response.data.request);
            setRemarks("");

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
                    borderRadius: "8px",
                    padding: "16px 18px",
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

    const requesterName =
        request.requested_by_first_name &&
        request.requested_by_last_name
            ? `${request.requested_by_first_name} ${request.requested_by_last_name}`
            : "Unknown User";

    const reviewerName =
        request.reviewed_by_first_name &&
        request.reviewed_by_last_name
            ? `${request.reviewed_by_first_name} ${request.reviewed_by_last_name}`
            : "Unknown User";

    const isPending = request.status === "pending";

    const formatDate = (date) => {
        if (!date) return "-";

        const formattedDate = new Date(date);

        const datePart = formattedDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });

        const timePart = formattedDate.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });

        return `${datePart} • ${timePart}`;
    };

    const formatStatus = (status) => {
        return status
            ?.replaceAll("_", " ")
            .replace(/\b\w/g, (letter) => letter.toUpperCase());
    };

    return (
        <div className="space-y-4">

            <div className="grid grid-cols-[1.1fr_0.9fr] items-start gap-4">

                {/* Left column */}
                <div className="space-y-4">

                    {/* Ticket Information */}
                    <div className="overflow-hidden rounded-xl border border-gray-300 bg-white">

                        <div className="flex items-start gap-3 border-b border-gray-200 px-5 py-4">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                                <Ticket
                                    size={18}
                                    className="text-gray-600"
                                />
                            </div>

                            <div>
                                <h2 className="text-base font-semibold text-black">
                                    Ticket Information
                                </h2>

                                <p className="mt-0.5 text-xs text-gray-500">
                                    Information submitted for the ticket.
                                </p>
                            </div>
                        </div>

                        <div className="divide-y divide-gray-200">

                            <div className="grid grid-cols-2 divide-x divide-gray-200">

                                <div className="px-5 py-4">
                                    <p className="text-xs font-medium uppercase text-gray-500">
                                        Ticket Code
                                    </p>

                                    <p className="mt-2 text-sm font-medium text-black">
                                        {request.ticket_code || "-"}
                                    </p>
                                </div>

                                <div className="px-5 py-4">
                                    <p className="text-xs font-medium uppercase text-gray-500">
                                        Affected Scope
                                    </p>

                                    <p className="mt-2 text-sm font-medium text-black">
                                        {request.affected_scope || "-"}
                                    </p>
                                </div>

                            </div>

                            <div className="px-5 py-4">
                                <p className="text-xs font-medium uppercase text-gray-500">
                                    Subject
                                </p>

                                <p className="mt-2 text-sm font-medium text-black">
                                    {request.subject || "-"}
                                </p>
                            </div>

                            <div className="px-5 py-4">
                                <p className="text-xs font-medium uppercase text-gray-500">
                                    Description
                                </p>

                                <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-black">
                                    {request.description ||
                                        "No description provided."}
                                </p>
                            </div>

                            <div className="px-5 py-4">
                                <p className="text-xs font-medium uppercase text-gray-500">
                                    Business Impact
                                </p>

                                <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-black">
                                    {request.business_impact ||
                                        "No business impact provided."}
                                </p>
                            </div>

                        </div>

                    </div>

                    {/* Requester Information */}
                    <div className="overflow-hidden rounded-xl border border-gray-300 bg-white">

                        <div className="flex items-start gap-3 border-b border-gray-200 px-5 py-4">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                                <UserRound
                                    size={18}
                                    className="text-gray-600"
                                />
                            </div>

                            <div>
                                <h2 className="text-base font-semibold text-black">
                                    Requester Information
                                </h2>

                                <p className="mt-0.5 text-xs text-gray-500">
                                    Details of the IT Support staff who submitted the request.
                                </p>
                            </div>
                        </div>

                        <div className="px-5 py-5">
                            <div className="grid grid-cols-2 gap-x-10 gap-y-5">

                                <InfoRow
                                    label="Name"
                                    value={requesterName}
                                />

                                <InfoRow
                                    label="User ID"
                                    value={
                                        request.requested_by_user_code ||
                                        "-"
                                    }
                                />

                                <InfoRow
                                    label="IT Department"
                                    value={
                                        request.it_department ||
                                        "No Department"
                                    }
                                />

                                <InfoRow
                                    label="Office Location"
                                    value={
                                        request.office_location ||
                                        "No Office Location"
                                    }
                                />

                            </div>
                        </div>

                    </div>

                </div>

                {/* Right column */}
                <div className="space-y-4">

                    {/* Priority Change */}
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
                                    Current ticket priority and the requested priority.
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

                    {/* Reason for Request */}
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
                                    Reason provided by IT Support for the priority change.
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
                                                : request.status === "approved"
                                                ? "Approved"
                                                : "Approve Request"}
                                        </button>

                                        <button
                                            type="button"
                                            disabled={
                                                approving ||
                                                !isPending
                                            }
                                            className="flex h-10 flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border border-red-400 bg-white px-4 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-gray-50 disabled:text-gray-400"
                                        >
                                            <X size={17} />

                                            {request.status === "rejected"
                                                ? "Rejected"
                                                : "Reject Request"}
                                        </button>
                                    </div>

                                    <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-blue-200 bg-blue-50 px-3.5 py-3">
                                        <Info
                                            size={17}
                                            className="mt-0.5 shrink-0 text-blue-600"
                                        />

                                        <p className="text-xs leading-5 text-blue-700">
                                            Approving this request will update the
                                            ticket's priority and recalculate the SLA
                                            deadlines based on the new priority.
                                        </p>
                                    </div>


                        </div>

                    </div>

                </div>

            </div>

            {/* Review Information / Remarks */}
            {isPending ? (
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
                                <span className="ml-1 font-normal text-gray-500">
                                    (Optional)
                                </span>
                            </h2>

                            <p className="mt-0.5 text-xs text-gray-500">
                                Add any remarks regarding your decision.
                            </p>
                        </div>
                    </div>

                    <div className="p-5">

                        <textarea
                            id="review-remarks"
                            rows={4}
                            maxLength={500}
                            value={remarks}
                            onChange={(e) =>
                                setRemarks(e.target.value)
                            }
                            placeholder="Enter your remarks here..."
                            className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-black outline-none transition placeholder:text-gray-400 focus:border-[#4C4CF9] focus:ring-2 focus:ring-[#4C4CF9]/10"
                        />

                        <div className="mt-1 text-right text-xs text-gray-400">
                            {remarks.length}/500
                        </div>

                    </div>

                </div>
            ) : (
                <div className="overflow-hidden rounded-xl border border-gray-300 bg-white">

                    <div className="flex items-start gap-3 border-b border-gray-200 px-5 py-4">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                            <Check
                                size={18}
                                className="text-gray-600"
                            />
                        </div>

                        <div>
                            <h2 className="text-base font-semibold text-black">
                                Review Information
                            </h2>

                            <p className="mt-0.5 text-xs text-gray-500">
                                Details of the Service Desk review.
                            </p>
                        </div>
                    </div>

                    <div className="p-5">

                        <div className="grid grid-cols-2 gap-x-10 gap-y-5">

                            <InfoRow
                                label="Reviewed By"
                                value={reviewerName}
                            />

                            <InfoRow
                                label="User ID"
                                value={
                                    request.reviewed_by_user_code ||
                                    "-"
                                }
                            />

                            <InfoRow
                                label="Reviewed At"
                                value={formatDate(request.reviewed_at)}
                            />

                            <InfoRow
                                label="Decision"
                                value={formatStatus(request.status)}
                            />

                        </div>

                        <div className="my-5 border-t border-gray-200" />

                        <div>
                            <p className="text-xs font-medium uppercase text-gray-500">
                                Review Remarks
                            </p>

                            <div className="mt-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                                <p className="whitespace-pre-wrap break-words text-sm leading-6 text-black">
                                    {request.review_remarks ||
                                        "No remarks provided."}
                                </p>
                            </div>
                        </div>

                    </div>

                </div>
            )}

        </div>
    );
}

function InfoRow({
    label,
    value,
}) {
    return (
        <div className="grid grid-cols-[115px_1fr] items-center gap-3">
            <span className="text-xs font-medium uppercase text-gray-500">
                {label}
            </span>

            <span className="text-sm font-medium text-black">
                {value}
            </span>
        </div>
    );
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