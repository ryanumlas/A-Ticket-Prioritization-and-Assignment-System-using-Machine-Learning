import { useState } from "react";
import {
    Ticket,
    ArrowRight,
    Check,
    X,
    Info,
    MessageSquareText,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import SymptomCodeSheet from "./FlagReason/SymptomCodeSheet";
import api from "../api";

export default function TicketReturnedDetailContent({ request }) {
    const navigate = useNavigate();

    const [symptomSheetOpen, setSymptomSheetOpen] = useState(false);
    const [selectedSymptomCode, setSelectedSymptomCode] = useState(null);
    const [reviewRemarks, setReviewRemarks] = useState("");
    const [approving, setApproving] = useState(false);

    const isApproved = request.status === "approved";
    const isRejected = request.status === "rejected";
    const isReviewed = isApproved || isRejected;

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
        name: submittedByName,
        user_code: request.submitted_by_user_code,
        role: request.submitted_by_role,
        department: request.employee_department,
    };

    const requestedBy = {
        name: requestedByName,
        user_code: request.requested_by_user_code,
        role: request.requested_by_role,
        department: request.it_department,
    };

    const reviewedBy = {
        name: reviewedByName,
        user_code: request.reviewed_by_user_code,
        role: request.reviewed_by_role,
    };

    const handleApprove = async () => {
        if (!selectedSymptomCode || approving) {
            return;
        }

        try {
            setApproving(true);

            const response = await api.post(
                `/tickets/return-ticket/${request.id}/approve/`,
                {
                    symptom_code_id: selectedSymptomCode.id,
                    review_remarks: reviewRemarks.trim(),
                }
            );

            toast.success(
                response.data?.message ||
                    "Return request approved successfully."
            );

            navigate("/returned-tickets");
        } catch (err) {
            toast.error(
                err.response?.data?.error ||
                    "Failed to approve return request."
            );
        } finally {
            setApproving(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-[1.05fr_0.95fr] items-start gap-4">
                {/* LEFT — TICKET INFORMATION */}
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
                                    label="Return Requested By"
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
                                    label="Return Requested At"
                                    value={formatDate(
                                        request.requested_at
                                    )}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT — RECLASSIFY & ROUTE */}
                <div className="overflow-hidden rounded-xl border border-gray-300 bg-white">
                    <div className="flex items-start gap-3 border-b border-gray-200 px-5 py-4">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                            <ArrowRight
                                size={18}
                                className="text-gray-600"
                            />
                        </div>

                        <div>
                            <h2 className="text-base font-semibold text-black">
                                Reclassify & Route
                            </h2>

                            <p className="mt-0.5 text-xs text-gray-500">
                                Review the classification and resulting
                                ticket routing.
                            </p>
                        </div>
                    </div>

                    <div className="p-5">
                        {/* CLASSIFICATION */}
                        <div className="grid grid-cols-[1fr_44px_1fr] items-center gap-4">
                            <RoutingCard
                                label="Current"
                                symptom={request.symptom_code}
                                department={request.department}
                            />

                            <div className="flex justify-center">
                                <ArrowRight
                                    size={22}
                                    className="text-gray-400"
                                />
                            </div>

                            <RoutingCard
                                label="Proposed"
                                symptom={selectedSymptomCode?.code}
                                department={selectedSymptomCode?.department}
                                proposed
                            />
                        </div>

                        {/* REASON */}
                        <div className="mt-5">
                            <p className="text-xs font-medium uppercase text-gray-500">
                                Reason for Return
                            </p>

                            <div className="mt-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                                <p className="whitespace-pre-wrap break-words text-sm leading-6 text-black">
                                    {request.reason || "-"}
                                </p>
                            </div>
                        </div>

                        {/* SYMPTOM SELECTION */}
                        {!isReviewed && (
                            <div className="mt-5">
                                <label className="text-xs font-medium uppercase text-gray-500">
                                    Select Correct Symptom Code
                                </label>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setSymptomSheetOpen(true)
                                    }
                                    className="mt-2 flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-3 text-left transition hover:bg-gray-50 focus:border-[#4C4CF9] focus:ring-2 focus:ring-[#4C4CF9]/10"
                                >
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium text-black">
                                            {selectedSymptomCode?.code ||
                                                "Select symptom code"}
                                        </p>

                                        {!selectedSymptomCode && (
                                            <p className="mt-0.5 text-xs text-gray-500">
                                                Search and select the correct
                                                classification
                                            </p>
                                        )}
                                    </div>

                                    <ArrowRight
                                        size={17}
                                        className="ml-3 shrink-0 text-gray-400"
                                    />
                                </button>
                            </div>
                        )}

                        {/* REVIEWED STATE */}
                        {isReviewed && (
                            <div
                                className={`mt-5 flex items-center gap-3 rounded-lg border px-4 py-3 ${
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
                                        This return request has already been{" "}
                                        {isApproved
                                            ? "approved."
                                            : "rejected."}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* BUTTONS */}
                        <div className="mt-5 flex items-center gap-3 border-t border-gray-200 pt-5">
                            <button
                                type="button"
                                disabled={isReviewed}
                                className={`flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
                                    isReviewed
                                        ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                                        : "cursor-pointer border-red-400 bg-white text-red-600 hover:bg-red-50"
                                }`}
                            >
                                <X size={17} />
                                Reject Request
                            </button>

                            <button
                                type="button"
                                disabled={
                                    isReviewed ||
                                    !selectedSymptomCode ||
                                    approving
                                }
                                onClick={handleApprove}
                                className={`flex h-10 flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                                    isReviewed
                                        ? "cursor-not-allowed bg-gray-200 text-gray-400"
                                        : selectedSymptomCode && !approving
                                        ? "cursor-pointer bg-[#4C4CF9] text-white hover:bg-[#3f3fe0]"
                                        : "cursor-not-allowed bg-gray-200 text-gray-400"
                                }`}
                            >
                                <Check size={17} />

                                {approving
                                    ? "Approving..."
                                    : "Approve & Route"}
                            </button>
                        </div>

                        {/* BLUE TIP */}
                        {!isReviewed && (
                            <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-blue-200 bg-blue-50 px-3.5 py-3">
                                <Info
                                    size={17}
                                    className="mt-0.5 shrink-0 text-blue-600"
                                />

                                <div>
                                    <p className="text-sm font-medium text-blue-800">
                                        Automatic Assignment
                                    </p>

                                    <p className="mt-1 text-xs leading-5 text-blue-700">
                                        The IT department and assignment will
                                        be determined automatically from the
                                        selected symptom code after approval.
                                    </p>
                                </div>
                            </div>
                        )}
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

                        <div className="mt-5 border-t border-gray-200 pt-4">
                            <InfoRow
                                label="Reviewed At"
                                value={formatDate(
                                    request.reviewed_at
                                )}
                            />
                        </div>

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

            {!isReviewed && (
                <SymptomCodeSheet
                    open={symptomSheetOpen}
                    onClose={() => setSymptomSheetOpen(false)}
                    onSelect={(symptom) => {
                        setSelectedSymptomCode(symptom);
                        setSymptomSheetOpen(false);
                    }}
                    excludeDepartment={request.department}
                />
            )}
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

function Avatar({ name, size = "md" }) {
    const initials = getInitials(name);

    const sizeClass =
        size === "lg"
            ? "h-12 w-12 text-sm"
            : "h-9 w-9 text-xs";

    return (
        <div
            className={`flex shrink-0 items-center justify-center rounded-full bg-[#4C4CF9]/10 font-semibold text-[#4C4CF9] ${sizeClass}`}
        >
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

function formatStatus(status = "") {
    if (!status) {
        return "-";
    }

    return (
        status.charAt(0).toUpperCase() +
        status.slice(1).toLowerCase()
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

function RoutingCard({
    label,
    symptom,
    department,
    proposed = false,
}) {
    return (
        <div
            className={`min-h-[125px] rounded-xl border px-5 py-4 ${
                proposed
                    ? "border-orange-300 bg-orange-50"
                    : "border-gray-300 bg-gray-50"
            }`}
        >
            <p
                className={`text-xs font-semibold uppercase tracking-wide ${
                    proposed
                        ? "text-orange-600"
                        : "text-gray-500"
                }`}
            >
                {label}
            </p>

            <p
                className={`mt-3 text-2xl font-bold ${
                    proposed
                        ? "text-orange-800"
                        : "text-black"
                }`}
            >
                {symptom || "-"}
            </p>

            <div
                className={`mt-2 border-t pt-2 ${
                    proposed
                        ? "border-orange-200"
                        : "border-gray-200"
                }`}
            >
                <p
                    className={`text-xs ${
                        proposed
                            ? "text-orange-700"
                            : "text-gray-500"
                    }`}
                >
                    IT Department
                </p>

                <p
                    className={`mt-0.5 text-sm font-semibold ${
                        proposed
                            ? "text-orange-800"
                            : "text-gray-700"
                    }`}
                >
                    {department || "-"}
                </p>
            </div>
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