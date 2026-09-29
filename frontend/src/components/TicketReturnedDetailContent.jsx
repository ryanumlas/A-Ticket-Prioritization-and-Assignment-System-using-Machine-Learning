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

    const returnedByName = [
        request.returned_by_first_name,
        request.returned_by_last_name,
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

    const returnedBy = {
        name: returnedByName,
        user_code: request.returned_by_user_code,
        role: request.returned_by_role,
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

        const trimmedRemarks = reviewRemarks.trim();

        if (!trimmedRemarks) {
            toast.error("Review remarks are required", {
                description:
                    "Please provide remarks before approving the return request.",
            });
            return;
        }

        try {
            setApproving(true);

            const response = await api.post(
                `/tickets/return-ticket/${request.id}/approve/`,
                {
                    symptom_code_id: selectedSymptomCode.id,
                    review_remarks: trimmedRemarks,
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
        <div
            className="
                space-y-4
                min-[1280px]:max-[1365px]:space-y-3
            "
        >
            <div
                className="
                    grid
                    grid-cols-[1.05fr_0.95fr]
                    items-start
                    gap-4
                    min-[1280px]:max-[1365px]:gap-3
                "
            >
                {/* LEFT — TICKET INFORMATION */}
                <div className="overflow-hidden rounded-xl border border-gray-300 bg-white">
                    <div
                        className="
                            flex
                            items-start
                            gap-3
                            border-b
                            border-gray-200
                            px-5
                            py-4
                            min-[1280px]:max-[1365px]:gap-2.5
                            min-[1280px]:max-[1365px]:px-4
                            min-[1280px]:max-[1365px]:py-3
                            min-[1366px]:max-[1537px]:px-4
                            min-[1366px]:max-[1537px]:py-3.5
                        "
                    >
                        <div
                            className="
                                flex
                                h-9
                                w-9
                                shrink-0
                                items-center
                                justify-center
                                rounded-lg
                                bg-gray-100
                                min-[1280px]:max-[1365px]:h-8
                                min-[1280px]:max-[1365px]:w-8
                            "
                        >
                            <Ticket
                                size={18}
                                className="
                                    text-gray-600
                                    min-[1280px]:max-[1365px]:h-4
                                    min-[1280px]:max-[1365px]:w-4
                                "
                            />
                        </div>

                        <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-3">
                                <h2
                                    className="
                                        text-base
                                        font-semibold
                                        text-black
                                        min-[1280px]:max-[1365px]:text-sm
                                        min-[1366px]:max-[1537px]:text-sm
                                    "
                                >
                                    Ticket Information
                                </h2>

                                <span
                                    className={`
                                        shrink-0
                                        rounded-md
                                        border
                                        px-2.5
                                        py-1
                                        text-xs
                                        font-medium
                                        min-[1280px]:max-[1365px]:px-2
                                        min-[1280px]:max-[1365px]:py-0.5
                                        min-[1280px]:max-[1365px]:text-[10px]
                                        min-[1366px]:max-[1537px]:px-2
                                        min-[1366px]:max-[1537px]:py-0.5
                                        min-[1366px]:max-[1537px]:text-[11px]
                                        ${getStatusStyle(
                                            request.status
                                        )}
                                    `}
                                >
                                    {formatStatus(request.status)}
                                </span>
                            </div>

                            <p
                                className="
                                    mt-0.5
                                    text-xs
                                    text-gray-500
                                    min-[1280px]:max-[1365px]:text-[11px]
                                "
                            >
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

                        <div
                            className="
                                px-5
                                py-4
                                min-[1280px]:max-[1365px]:px-4
                                min-[1280px]:max-[1365px]:py-3
                                min-[1366px]:max-[1537px]:px-4
                                min-[1366px]:max-[1537px]:py-3.5
                            "
                        >
                            <div
                                className="
                                    grid
                                    grid-cols-2
                                    gap-6
                                    min-[1280px]:max-[1365px]:gap-4
                                    min-[1366px]:max-[1537px]:gap-5
                                "
                            >
                                <UserCard
                                    label="Ticket Submitted By"
                                    user={submittedBy}
                                />

                                <UserCard
                                    label="Return Requested By"
                                    user={returnedBy}
                                />
                            </div>

                            <div
                                className="
                                    mt-5
                                    grid
                                    grid-cols-2
                                    gap-6
                                    border-t
                                    border-gray-200
                                    pt-4
                                    min-[1280px]:max-[1365px]:mt-4
                                    min-[1280px]:max-[1365px]:gap-4
                                    min-[1280px]:max-[1365px]:pt-3
                                    min-[1366px]:max-[1537px]:mt-4
                                    min-[1366px]:max-[1537px]:gap-5
                                    min-[1366px]:max-[1537px]:pt-3.5
                                "
                            >
                                <InfoRow
                                    label="Ticket Submitted At"
                                    value={formatDate(
                                        request.submitted_at
                                    )}
                                />

                                <InfoRow
                                    label="Returned At"
                                    value={formatDate(request.returned_at)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT — RECLASSIFY & ROUTE */}
                <div className="overflow-hidden rounded-xl border border-gray-300 bg-white">
                    <div
                        className="
                            flex
                            items-start
                            gap-3
                            border-b
                            border-gray-200
                            px-5
                            py-4
                            min-[1280px]:max-[1365px]:gap-2.5
                            min-[1280px]:max-[1365px]:px-4
                            min-[1280px]:max-[1365px]:py-3
                            min-[1366px]:max-[1537px]:px-4
                            min-[1366px]:max-[1537px]:py-3.5
                        "
                    >
                        <div
                            className="
                                flex
                                h-9
                                w-9
                                shrink-0
                                items-center
                                justify-center
                                rounded-lg
                                bg-gray-100
                                min-[1280px]:max-[1365px]:h-8
                                min-[1280px]:max-[1365px]:w-8
                            "
                        >
                            <ArrowRight
                                size={18}
                                className="
                                    text-gray-600
                                    min-[1280px]:max-[1365px]:h-4
                                    min-[1280px]:max-[1365px]:w-4
                                "
                            />
                        </div>

                        <div>
                            <h2
                                className="
                                    text-base
                                    font-semibold
                                    text-black
                                    min-[1280px]:max-[1365px]:text-sm
                                    min-[1366px]:max-[1537px]:text-sm
                                "
                            >
                                Reclassify & Route
                            </h2>

                            <p
                                className="
                                    mt-0.5
                                    text-xs
                                    text-gray-500
                                    min-[1280px]:max-[1365px]:text-[11px]
                                "
                            >
                                Review the classification and resulting
                                ticket routing.
                            </p>
                        </div>
                    </div>

                    <div
                        className="
                            p-5
                            min-[1280px]:max-[1365px]:p-4
                            min-[1366px]:max-[1537px]:p-4
                        "
                    >
                        {/* CLASSIFICATION */}
                        <div
                            className="
                                grid
                                grid-cols-[1fr_44px_1fr]
                                items-center
                                gap-4
                                min-[1280px]:max-[1365px]:grid-cols-[1fr_36px_1fr]
                                min-[1280px]:max-[1365px]:gap-2.5
                                min-[1366px]:max-[1537px]:grid-cols-[1fr_40px_1fr]
                                min-[1366px]:max-[1537px]:gap-3
                            "
                        >
                            <RoutingCard
                                label="Current"
                                symptom={request.symptom_code}
                                department={request.department}
                            />

                            <div className="flex justify-center">
                                <ArrowRight
                                    size={22}
                                    className="
                                        text-gray-400
                                        min-[1280px]:max-[1365px]:h-4
                                        min-[1280px]:max-[1365px]:w-4
                                        min-[1366px]:max-[1537px]:h-5
                                        min-[1366px]:max-[1537px]:w-5
                                    "
                                />
                            </div>

                            <RoutingCard
                                label="Proposed"
                                symptom={selectedSymptomCode?.code}
                                department={
                                    selectedSymptomCode?.department
                                }
                                proposed
                            />
                        </div>

                        {/* REASON */}
                        <div
                            className="
                                mt-5
                                min-[1280px]:max-[1365px]:mt-4
                                min-[1366px]:max-[1537px]:mt-4
                            "
                        >
                            <p
                                className="
                                    text-xs
                                    font-medium
                                    uppercase
                                    text-gray-500
                                    min-[1280px]:max-[1365px]:text-[10px]
                                "
                            >
                                Reason for Return
                            </p>

                            <div
                                className="
                                    mt-2
                                    rounded-lg
                                    border
                                    border-gray-200
                                    bg-gray-50
                                    px-4
                                    py-3
                                    min-[1280px]:max-[1365px]:px-3
                                    min-[1280px]:max-[1365px]:py-2.5
                                    min-[1366px]:max-[1537px]:px-3
                                    min-[1366px]:max-[1537px]:py-2.5
                                "
                            >
                                <p
                                    className="
                                        whitespace-pre-wrap
                                        break-words
                                        text-sm
                                        leading-6
                                        text-black
                                        min-[1280px]:max-[1365px]:text-[11px]
                                        min-[1280px]:max-[1365px]:leading-5
                                        min-[1366px]:max-[1537px]:text-xs
                                        min-[1366px]:max-[1537px]:leading-5
                                    "
                                >
                                    {request.reason || "-"}
                                </p>
                            </div>
                        </div>

                        {/* SYMPTOM SELECTION */}
                        {!isReviewed && (
                            <div
                                className="
                                    mt-5
                                    min-[1280px]:max-[1365px]:mt-4
                                    min-[1366px]:max-[1537px]:mt-4
                                "
                            >
                                <label
                                    className="
                                        text-xs
                                        font-medium
                                        uppercase
                                        text-gray-500
                                        min-[1280px]:max-[1365px]:text-[10px]
                                    "
                                >
                                    Select Correct Symptom Code
                                </label>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setSymptomSheetOpen(true)
                                    }
                                    className="
                                        mt-2
                                        flex
                                        w-full
                                        items-center
                                        justify-between
                                        rounded-lg
                                        border
                                        border-gray-300
                                        bg-white
                                        px-4
                                        py-3
                                        text-left
                                        transition
                                        hover:bg-gray-50
                                        focus:border-blue-500
                                        focus:ring-2
                                        focus:ring-blue-500/10
                                        min-[1280px]:max-[1365px]:px-3
                                        min-[1280px]:max-[1365px]:py-2.5
                                        min-[1366px]:max-[1537px]:px-3
                                        min-[1366px]:max-[1537px]:py-2.5
                                    "
                                >
                                    <div className="min-w-0">
                                        <p
                                            className="
                                                truncate
                                                text-sm
                                                font-medium
                                                text-black
                                                min-[1280px]:max-[1365px]:text-[11px]
                                                min-[1366px]:max-[1537px]:text-xs
                                            "
                                        >
                                            {selectedSymptomCode?.code ||
                                                "Select symptom code"}
                                        </p>

                                        {!selectedSymptomCode && (
                                            <p
                                                className="
                                                    mt-0.5
                                                    text-xs
                                                    text-gray-500
                                                    min-[1280px]:max-[1365px]:text-[10px]
                                                "
                                            >
                                                Search and select the correct
                                                classification
                                            </p>
                                        )}
                                    </div>

                                    <ArrowRight
                                        size={17}
                                        className="
                                            ml-3
                                            shrink-0
                                            text-gray-400
                                            min-[1280px]:max-[1365px]:h-4
                                            min-[1280px]:max-[1365px]:w-4
                                        "
                                    />
                                </button>
                            </div>
                        )}

                        {/* REVIEWED STATE */}
                        {isReviewed && (
                            <div
                                className={`
                                    mt-5
                                    flex
                                    items-center
                                    gap-3
                                    rounded-lg
                                    border
                                    px-4
                                    py-3
                                    min-[1280px]:max-[1365px]:mt-4
                                    min-[1280px]:max-[1365px]:gap-2.5
                                    min-[1280px]:max-[1365px]:px-3
                                    min-[1280px]:max-[1365px]:py-2.5
                                    min-[1366px]:max-[1537px]:mt-4
                                    min-[1366px]:max-[1537px]:px-3
                                    min-[1366px]:max-[1537px]:py-2.5
                                    ${
                                        isApproved
                                            ? "border-green-200 bg-green-50"
                                            : "border-red-200 bg-red-50"
                                    }
                                `}
                            >
                                <div
                                    className={`
                                        flex
                                        h-8
                                        w-8
                                        shrink-0
                                        items-center
                                        justify-center
                                        rounded-full
                                        min-[1280px]:max-[1365px]:h-7
                                        min-[1280px]:max-[1365px]:w-7
                                        ${
                                            isApproved
                                                ? "bg-green-100"
                                                : "bg-red-100"
                                        }
                                    `}
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
                                        className={`
                                            text-sm
                                            font-semibold
                                            min-[1280px]:max-[1365px]:text-xs
                                            ${
                                                isApproved
                                                    ? "text-green-800"
                                                    : "text-red-800"
                                            }
                                        `}
                                    >
                                        Review Completed
                                    </p>

                                    <p
                                        className={`
                                            mt-0.5
                                            text-xs
                                            min-[1280px]:max-[1365px]:text-[10px]
                                            ${
                                                isApproved
                                                    ? "text-green-700"
                                                    : "text-red-700"
                                            }
                                        `}
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
                        <div
                            className="
                                mt-5
                                flex
                                items-center
                                gap-3
                                border-t
                                border-gray-200
                                pt-5
                                min-[1280px]:max-[1365px]:mt-4
                                min-[1280px]:max-[1365px]:gap-2
                                min-[1280px]:max-[1365px]:pt-4
                                min-[1366px]:max-[1537px]:mt-4
                                min-[1366px]:max-[1537px]:gap-2
                                min-[1366px]:max-[1537px]:pt-4
                            "
                        >
                            <button
                                type="button"
                                disabled={isReviewed}
                                className={`
                                    flex
                                    h-10
                                    flex-1
                                    items-center
                                    justify-center
                                    gap-2
                                    rounded-lg
                                    border
                                    px-4
                                    py-3
                                    text-sm
                                    font-medium
                                    transition-colors
                                    min-[1280px]:max-[1365px]:h-9
                                    min-[1280px]:max-[1365px]:gap-1.5
                                    min-[1280px]:max-[1365px]:px-3
                                    min-[1280px]:max-[1365px]:py-2
                                    min-[1280px]:max-[1365px]:text-[11px]
                                    min-[1366px]:max-[1537px]:h-9
                                    min-[1366px]:max-[1537px]:px-3
                                    min-[1366px]:max-[1537px]:py-2
                                    min-[1366px]:max-[1537px]:text-xs
                                    ${
                                        isReviewed
                                            ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                                            : "cursor-pointer border-red-400 bg-white text-red-600 hover:bg-red-50"
                                    }
                                `}
                            >
                                <X
                                    size={17}
                                    className="
                                        min-[1280px]:max-[1365px]:h-4
                                        min-[1280px]:max-[1365px]:w-4
                                    "
                                />
                                Reject Request
                            </button>

                            <button
                                type="button"
                                disabled={
                                    isReviewed ||
                                    !selectedSymptomCode ||
                                    !reviewRemarks.trim() ||
                                    approving
                                }
                                onClick={handleApprove}
                                className={`
                                    flex
                                    h-10
                                    flex-1
                                    items-center
                                    justify-center
                                    gap-2
                                    rounded-lg
                                    px-4
                                    py-3
                                    text-sm
                                    font-medium
                                    transition-colors
                                    min-[1280px]:max-[1365px]:h-9
                                    min-[1280px]:max-[1365px]:gap-1.5
                                    min-[1280px]:max-[1365px]:px-3
                                    min-[1280px]:max-[1365px]:py-2
                                    min-[1280px]:max-[1365px]:text-[11px]
                                    min-[1366px]:max-[1537px]:h-9
                                    min-[1366px]:max-[1537px]:px-3
                                    min-[1366px]:max-[1537px]:py-2
                                    min-[1366px]:max-[1537px]:text-xs
                                    ${
                                        isReviewed
                                            ? "cursor-not-allowed bg-gray-200 text-gray-400"
                                            : selectedSymptomCode &&
                                              reviewRemarks.trim() &&
                                              !approving
                                            ? "cursor-pointer bg-blue-600 text-white hover:bg-blue-700"
                                            : "cursor-not-allowed bg-gray-200 text-gray-400"
                                    }
                                `}
                            >
                                <Check
                                    size={17}
                                    className="
                                        min-[1280px]:max-[1365px]:h-4
                                        min-[1280px]:max-[1365px]:w-4
                                    "
                                />

                                {approving
                                    ? "Approving..."
                                    : "Approve & Route"}
                            </button>
                        </div>

                        {/* BLUE TIP */}
                        {!isReviewed && (
                            <div
                                className="
                                    mt-4
                                    flex
                                    items-start
                                    gap-2.5
                                    rounded-lg
                                    border
                                    border-blue-200
                                    bg-blue-50
                                    px-3.5
                                    py-3
                                    min-[1280px]:max-[1365px]:mt-3
                                    min-[1280px]:max-[1365px]:gap-2
                                    min-[1280px]:max-[1365px]:px-3
                                    min-[1280px]:max-[1365px]:py-2.5
                                    min-[1366px]:max-[1537px]:px-3
                                    min-[1366px]:max-[1537px]:py-2.5
                                "
                            >
                                <Info
                                    size={17}
                                    className="
                                        mt-0.5
                                        shrink-0
                                        text-blue-600
                                        min-[1280px]:max-[1365px]:h-4
                                        min-[1280px]:max-[1365px]:w-4
                                    "
                                />

                                <div>
                                    <p
                                        className="
                                            text-sm
                                            font-medium
                                            text-blue-800
                                            min-[1280px]:max-[1365px]:text-xs
                                        "
                                    >
                                        Automatic Assignment
                                    </p>

                                    <p
                                        className="
                                            mt-1
                                            text-xs
                                            leading-5
                                            text-blue-700
                                            min-[1280px]:max-[1365px]:text-[10px]
                                            min-[1280px]:max-[1365px]:leading-4
                                        "
                                    >
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
                <div
                    className="
                        flex
                        items-start
                        gap-3
                        border-b
                        border-gray-200
                        px-5
                        py-4
                        min-[1280px]:max-[1365px]:gap-2.5
                        min-[1280px]:max-[1365px]:px-4
                        min-[1280px]:max-[1365px]:py-3
                        min-[1366px]:max-[1537px]:px-4
                        min-[1366px]:max-[1537px]:py-3.5
                    "
                >
                    <div
                        className="
                            flex
                            h-9
                            w-9
                            shrink-0
                            items-center
                            justify-center
                            rounded-lg
                            bg-gray-100
                            min-[1280px]:max-[1365px]:h-8
                            min-[1280px]:max-[1365px]:w-8
                        "
                    >
                        <MessageSquareText
                            size={18}
                            className="
                                text-gray-600
                                min-[1280px]:max-[1365px]:h-4
                                min-[1280px]:max-[1365px]:w-4
                            "
                        />
                    </div>

                    <div>
                        <h2
                            className="
                                text-base
                                font-semibold
                                text-black
                                min-[1280px]:max-[1365px]:text-sm
                                min-[1366px]:max-[1537px]:text-sm
                            "
                        >
                            Review Remarks
                            {!isReviewed && (
                                <span className="ml-1 font-normal text-red-500">
                                    *
                                </span>
                            )}
                        </h2>

                        <p
                            className="
                                mt-0.5
                                text-xs
                                text-gray-500
                                min-[1280px]:max-[1365px]:text-[11px]
                            "
                        >
                            {isReviewed
                                ? "Details of the Service Desk review."
                                : "Review remarks are required before approval."}
                        </p>
                    </div>
                </div>

                {isReviewed ? (
                    <div
                        className="
                            p-5
                            min-[1280px]:max-[1365px]:p-4
                            min-[1366px]:max-[1537px]:p-4
                        "
                    >
                        <div
                            className="
                                grid
                                grid-cols-2
                                gap-6
                                min-[1280px]:max-[1365px]:gap-4
                                min-[1366px]:max-[1537px]:gap-5
                            "
                        >
                            <div>
                                <p
                                    className="
                                        text-xs
                                        font-medium
                                        uppercase
                                        text-gray-500
                                        min-[1280px]:max-[1365px]:text-[10px]
                                    "
                                >
                                    Decision
                                </p>

                                <div className="mt-2 flex items-center gap-2">
                                    <div
                                        className={`
                                            flex
                                            h-7
                                            w-7
                                            items-center
                                            justify-center
                                            rounded-full
                                            min-[1280px]:max-[1365px]:h-6
                                            min-[1280px]:max-[1365px]:w-6
                                            ${
                                                isApproved
                                                    ? "bg-green-100"
                                                    : "bg-red-100"
                                            }
                                        `}
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
                                        className={`
                                            text-sm
                                            font-semibold
                                            min-[1280px]:max-[1365px]:text-xs
                                            ${
                                                isApproved
                                                    ? "text-green-700"
                                                    : "text-red-700"
                                            }
                                        `}
                                    >
                                        {isApproved
                                            ? "Approved"
                                            : "Rejected"}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <p
                                    className="
                                        text-xs
                                        font-medium
                                        uppercase
                                        text-gray-500
                                        min-[1280px]:max-[1365px]:text-[10px]
                                    "
                                >
                                    Reviewed By
                                </p>

                                <div className="mt-2 flex items-center gap-3">
                                    <Avatar
                                        name={reviewedBy.name}
                                    />

                                    <div className="min-w-0">
                                        <p
                                            className="
                                                truncate
                                                text-sm
                                                font-semibold
                                                text-black
                                                min-[1280px]:max-[1365px]:text-[11px]
                                                min-[1366px]:max-[1537px]:text-xs
                                            "
                                        >
                                            {reviewedBy.name || "-"}
                                        </p>

                                        <p
                                            className="
                                                mt-0.5
                                                truncate
                                                text-xs
                                                text-gray-500
                                                min-[1280px]:max-[1365px]:text-[10px]
                                            "
                                        >
                                            {reviewedBy.user_code || "-"}
                                            {" • "}
                                            {reviewedBy.role || "-"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div
                            className="
                                mt-5
                                border-t
                                border-gray-200
                                pt-4
                                min-[1280px]:max-[1365px]:mt-4
                                min-[1280px]:max-[1365px]:pt-3
                            "
                        >
                            <InfoRow
                                label="Reviewed At"
                                value={formatDate(
                                    request.reviewed_at
                                )}
                            />
                        </div>

                        <div
                            className="
                                mt-5
                                border-t
                                border-gray-200
                                pt-4
                                min-[1280px]:max-[1365px]:mt-4
                                min-[1280px]:max-[1365px]:pt-3
                            "
                        >
                            <p
                                className="
                                    text-xs
                                    font-medium
                                    uppercase
                                    text-gray-500
                                    min-[1280px]:max-[1365px]:text-[10px]
                                "
                            >
                                Review Remarks
                            </p>

                            <div
                                className="
                                    mt-2
                                    rounded-lg
                                    border
                                    border-gray-200
                                    bg-gray-50
                                    px-4
                                    py-3
                                    min-[1280px]:max-[1365px]:px-3
                                    min-[1280px]:max-[1365px]:py-2.5
                                    min-[1366px]:max-[1537px]:px-3
                                    min-[1366px]:max-[1537px]:py-2.5
                                "
                            >
                                <p
                                    className="
                                        whitespace-pre-wrap
                                        break-words
                                        text-sm
                                        leading-6
                                        text-black
                                        min-[1280px]:max-[1365px]:text-[11px]
                                        min-[1280px]:max-[1365px]:leading-5
                                        min-[1366px]:max-[1537px]:text-xs
                                        min-[1366px]:max-[1537px]:leading-5
                                    "
                                >
                                    {request.review_remarks || "-"}
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div
                        className="
                            p-5
                            min-[1280px]:max-[1365px]:p-4
                            min-[1366px]:max-[1537px]:p-4
                        "
                    >
                        <textarea
                            rows={4}
                            maxLength={500}
                            value={reviewRemarks}
                            onChange={(e) =>
                                setReviewRemarks(e.target.value)
                            }
                            placeholder="Enter your review remarks..."
                            className="
                                w-full
                                resize-none
                                rounded-lg
                                border
                                border-gray-300
                                bg-white
                                px-3
                                py-2.5
                                text-sm
                                text-black
                                outline-none
                                transition
                                placeholder:text-gray-400
                                focus:border-blue-500
                                focus:ring-2
                                focus:ring-blue-500/10
                                min-[1280px]:max-[1365px]:px-3
                                min-[1280px]:max-[1365px]:py-2
                                min-[1280px]:max-[1365px]:text-[11px]
                                min-[1366px]:max-[1537px]:py-2
                                min-[1366px]:max-[1537px]:text-xs
                            "
                        />

                        <div
                            className="
                                mt-1
                                text-right
                                text-xs
                                text-gray-400
                                min-[1280px]:max-[1365px]:text-[10px]
                            "
                        >
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
            className={`
                px-5
                py-4
                min-[1280px]:max-[1365px]:px-4
                min-[1280px]:max-[1365px]:py-3
                min-[1366px]:max-[1537px]:px-4
                min-[1366px]:max-[1537px]:py-3.5
                ${bordered ? "border-l border-gray-200" : ""}
            `}
        >
            <p
                className="
                    text-xs
                    font-medium
                    uppercase
                    text-gray-500
                    min-[1280px]:max-[1365px]:text-[10px]
                "
            >
                {label}
            </p>

            <p
                className={`
                    mt-2
                    whitespace-pre-wrap
                    break-words
                    text-sm
                    text-black
                    min-[1280px]:max-[1365px]:mt-1.5
                    min-[1280px]:max-[1365px]:text-[11px]
                    min-[1366px]:max-[1537px]:text-xs
                    ${
                        multiline
                            ? "leading-6 min-[1280px]:max-[1537px]:leading-5"
                            : "font-medium"
                    }
                `}
            >
                {value || "-"}
            </p>
        </div>
    );
}

function InfoRow({ label, value }) {
    return (
        <div className="min-w-0">
            <p
                className="
                    text-xs
                    font-medium
                    uppercase
                    text-gray-500
                    min-[1280px]:max-[1365px]:text-[10px]
                "
            >
                {label}
            </p>

            <p
                className="
                    mt-2
                    text-sm
                    font-medium
                    text-black
                    min-[1280px]:max-[1365px]:mt-1.5
                    min-[1280px]:max-[1365px]:text-[11px]
                    min-[1366px]:max-[1537px]:text-xs
                "
            >
                {value || "-"}
            </p>
        </div>
    );
}

function UserCard({ label, user }) {
    return (
        <div className="min-w-0">
            <p
                className="
                    text-xs
                    font-medium
                    uppercase
                    text-gray-500
                    min-[1280px]:max-[1365px]:text-[10px]
                "
            >
                {label}
            </p>

            {!user?.name ? (
                <p
                    className="
                        mt-3
                        text-sm
                        text-gray-400
                        min-[1280px]:max-[1365px]:mt-2
                        min-[1280px]:max-[1365px]:text-[11px]
                    "
                >
                    -
                </p>
            ) : (
                <div
                    className="
                        mt-3
                        flex
                        items-center
                        gap-3
                        min-[1280px]:max-[1365px]:mt-2
                        min-[1280px]:max-[1365px]:gap-2
                    "
                >
                    <Avatar name={user.name} />

                    <div className="min-w-0">
                        <p
                            className="
                                truncate
                                text-sm
                                font-semibold
                                text-black
                                min-[1280px]:max-[1365px]:text-[11px]
                                min-[1366px]:max-[1537px]:text-xs
                            "
                        >
                            {user.name}
                        </p>

                        <p
                            className="
                                mt-1
                                truncate
                                text-xs
                                text-gray-500
                                min-[1280px]:max-[1365px]:mt-0.5
                                min-[1280px]:max-[1365px]:text-[10px]
                            "
                        >
                            {user.user_code || "-"}
                            {" • "}
                            {user.role || "-"}
                        </p>

                        {user.department && (
                            <p
                                className="
                                    mt-0.5
                                    truncate
                                    text-xs
                                    text-gray-500
                                    min-[1280px]:max-[1365px]:text-[10px]
                                "
                            >
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
            className={`
                flex
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-blue-50
                font-semibold
                text-blue-600
                ${sizeClass}
                min-[1280px]:max-[1365px]:h-8
                min-[1280px]:max-[1365px]:w-8
                min-[1280px]:max-[1365px]:text-[10px]
            `}
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
            className={`
                min-h-[125px]
                rounded-xl
                border
                px-5
                py-4
                min-[1280px]:max-[1365px]:min-h-[105px]
                min-[1280px]:max-[1365px]:px-3
                min-[1280px]:max-[1365px]:py-3
                min-[1366px]:max-[1537px]:min-h-[115px]
                min-[1366px]:max-[1537px]:px-4
                min-[1366px]:max-[1537px]:py-3
                ${
                    proposed
                        ? "border-orange-300 bg-orange-50"
                        : "border-gray-300 bg-gray-50"
                }
            `}
        >
            <p
                className={`
                    text-xs
                    font-semibold
                    uppercase
                    tracking-wide
                    min-[1280px]:max-[1365px]:text-[10px]
                    ${
                        proposed
                            ? "text-orange-600"
                            : "text-gray-500"
                    }
                `}
            >
                {label}
            </p>

            <p
                className={`
                    mt-3
                    text-2xl
                    font-bold
                    min-[1280px]:max-[1365px]:mt-2
                    min-[1280px]:max-[1365px]:text-lg
                    min-[1366px]:max-[1537px]:text-xl
                    ${
                        proposed
                            ? "text-orange-800"
                            : "text-black"
                    }
                `}
            >
                {symptom || "-"}
            </p>

            <div
                className={`
                    mt-2
                    border-t
                    pt-2
                    min-[1280px]:max-[1365px]:mt-1.5
                    min-[1280px]:max-[1365px]:pt-1.5
                    ${
                        proposed
                            ? "border-orange-200"
                            : "border-gray-200"
                    }
                `}
            >
                <p
                    className={`
                        text-xs
                        min-[1280px]:max-[1365px]:text-[10px]
                        ${
                            proposed
                                ? "text-orange-700"
                                : "text-gray-500"
                        }
                    `}
                >
                    IT Department
                </p>

                <p
                    className={`
                        mt-0.5
                        text-sm
                        font-semibold
                        min-[1280px]:max-[1365px]:text-[11px]
                        min-[1366px]:max-[1537px]:text-xs
                        ${
                            proposed
                                ? "text-orange-800"
                                : "text-gray-700"
                        }
                    `}
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