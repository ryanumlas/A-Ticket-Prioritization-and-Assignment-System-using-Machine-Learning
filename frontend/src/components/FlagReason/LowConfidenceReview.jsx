import { useState } from "react";
import {
    CircleAlert,
    ClipboardCheck,
    Ticket,
    TrendingUp,
    Pencil,
    Search,
    Check,
    CheckCircle2,
} from "lucide-react";
import SymptomCodeSheet from "./SymptomCodeSheet";
import RemarksModal from "../RemarksModal";
import { toast } from "sonner";
import { formatDate } from "../../utils/formatDate";
import { useNavigate } from "react-router-dom";
import api from "/src/api";

export default function LowConfidenceReview({ flag }) {
    const [selectedSymptom, setSelectedSymptom] = useState("");
    const [sheetOpen, setSheetOpen] = useState(false);
    const [accepting, setAccepting] = useState(false);
    const [approving, setApproving] = useState(false);
    const [remarks, setRemarks] = useState("");
    const [reviewAction, setReviewAction] = useState(null);

    const navigate = useNavigate();

    const MIN_REMARKS_LENGTH = 30;

    const openAcceptModal = () => {
        setRemarks("");
        setReviewAction("accept");
    };

    const openOverrideModal = () => {
        if (!selectedSymptom) return;

        setRemarks("");
        setReviewAction("override");
    };

    const closeReviewModal = () => {
        if (accepting || approving) return;

        setReviewAction(null);
        setRemarks("");
    };

    const handleAcceptRecommendation = async () => {
        const cleanRemarks = remarks.trim();

        if (cleanRemarks.length < MIN_REMARKS_LENGTH) {
            toast.error("Review remarks are required", {
                description: `Please provide at least ${MIN_REMARKS_LENGTH} characters explaining the review decision.`,
                duration: 5000,
                style: {
                    background: "#ffffff",
                    color: "#000000",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    padding: "16px 18px",
                    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
                },
            });

            return;
        }

        try {
            setAccepting(true);

            const response = await api.post(
                `/tickets/flagged/${flag.id}/accept-recommendation/`,
                {
                    remarks: cleanRemarks,
                }
            );

            setReviewAction(null);
            setRemarks("");

            navigate("/dashboard");

            toast.success("Recommendation accepted", {
                description: `${response.data.ticket.ticket_code} was classified as ${response.data.ticket.symptom_code}.`,
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
            toast.error("Unable to accept recommendation", {
                description:
                    error.response?.data?.message ||
                    "Something went wrong while completing the review.",
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
            setAccepting(false);
        }
    };

    const handleApproveOverride = async () => {
        if (!selectedSymptom) return;

        const cleanRemarks = remarks.trim();

        if (cleanRemarks.length < MIN_REMARKS_LENGTH) {
            toast.error("Review remarks are required", {
                description: `Please provide at least ${MIN_REMARKS_LENGTH} characters explaining the review decision.`,
                duration: 5000,
                style: {
                    background: "#ffffff",
                    color: "#000000",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    padding: "16px 18px",
                    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
                },
            });

            return;
        }

        try {
            setApproving(true);

            const response = await api.post(
                `/tickets/flagged/${flag.id}/approve-override/`,
                {
                    symptom_code: selectedSymptom,
                    remarks: cleanRemarks,
                }
            );

            setReviewAction(null);
            setRemarks("");

            navigate("/dashboard");

            toast.success("Classification updated", {
                description: `${response.data.ticket.ticket_code} was classified as ${response.data.ticket.symptom_code}.`,
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
            toast.error("Unable to approve override", {
                description:
                    error.response?.data?.message ||
                    "Something went wrong while completing the review.",
                duration: 5000,
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

    const handleConfirmReview = () => {
        if (reviewAction === "accept") {
            handleAcceptRecommendation();
            return;
        }

        if (reviewAction === "override") {
            handleApproveOverride();
        }
    };

    const confidence =
        flag.confidence != null
            ? (flag.confidence * 100).toFixed(2)
            : "0.00";

    const secondConfidence =
        flag.second_confidence != null
            ? (flag.second_confidence * 100).toFixed(2)
            : "0.00";

    const confidenceMargin =
        flag.confidence_margin != null
            ? (flag.confidence_margin * 100).toFixed(2)
            : "0.00";

    const canOverride =
        selectedSymptom &&
        selectedSymptom !== flag.predicted_symptom_code;

    const reviewModalTitle =
        reviewAction === "override"
            ? "Confirm Classification Override"
            : "Accept Model Recommendation";

    const reviewModalDescription =
        reviewAction === "override" ? (
            <>
                You are changing the symptom classification from{" "}
                <span className="font-semibold">
                    {flag.predicted_symptom_code || "-"}
                </span>{" "}
                to{" "}
                <span className="font-semibold">
                    {selectedSymptom || "-"}
                </span>
                .
            </>
        ) : (
            <>
                You are accepting the model&apos;s recommended symptom code{" "}
                <span className="font-semibold">
                    {flag.predicted_symptom_code || "-"}
                </span>
                .
            </>
        );

    const reviewModalConfirmText =
        reviewAction === "override"
            ? "Confirm Override"
            : "Confirm Review";

    const submittedByName =
        `${flag.first_name || ""} ${flag.last_name || ""}`.trim();

    return (
        <>
            <div className="space-y-4">
                <div
                    className="
                        grid
                        grid-cols-[1.05fr_0.95fr]
                        items-start
                        gap-4
                        min-[1280px]:max-[1365px]:gap-3
                        min-[1366px]:max-[1537px]:gap-3
                    "
                >
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
                                min-[1366px]:max-[1537px]:gap-2.5
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
                                    min-[1366px]:max-[1537px]:h-8
                                    min-[1366px]:max-[1537px]:w-8
                                "
                            >
                                <Ticket
                                    size={18}
                                    className="
                                        text-gray-600
                                        min-[1280px]:max-[1365px]:size-[16px]
                                        min-[1366px]:max-[1537px]:size-[17px]
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
                                            ${getStatusStyle(flag.status)}
                                        `}
                                    >
                                        {formatStatus(flag.status)}
                                    </span>
                                </div>

                                <p
                                    className="
                                        mt-0.5
                                        text-xs
                                        text-gray-500
                                        min-[1280px]:max-[1365px]:text-[10px]
                                        min-[1366px]:max-[1537px]:text-[11px]
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
                                    value={flag.ticket_code}
                                />

                                <InfoCell
                                    label="Affected Scope"
                                    value={flag.affected_scope}
                                    bordered
                                />
                            </div>

                            <InfoCell
                                label="Subject"
                                value={flag.subject}
                            />

                            <InfoCell
                                label="Description"
                                value={flag.description}
                                multiline
                            />

                            <InfoCell
                                label="Business Impact"
                                value={flag.business_impact}
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
                                <div className="grid grid-cols-2 gap-6 min-[1280px]:max-[1537px]:gap-4">
                                    <UserCard
                                        label="Ticket Submitted By"
                                        user={{
                                            name: submittedByName,
                                            userCode: flag.user_code,
                                            department: flag.role,
                                            officeLocation:
                                                flag.employee_department,
                                        }}
                                    />

                                    <UserCard
                                        label="Ticket Submitted At"
                                        value={
                                            flag.created_at ||
                                            flag.submitted_at
                                                ? formatDate(
                                                      flag.created_at ||
                                                          flag.submitted_at
                                                  )
                                                : "-"
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

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
                                min-[1366px]:max-[1537px]:gap-2.5
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
                                    min-[1366px]:max-[1537px]:h-8
                                    min-[1366px]:max-[1537px]:w-8
                                "
                            >
                                <ClipboardCheck
                                    size={18}
                                    className="
                                        text-gray-600
                                        min-[1280px]:max-[1365px]:size-[16px]
                                        min-[1366px]:max-[1537px]:size-[17px]
                                    "
                                />
                            </div>

                            <div className="min-w-0">
                                <h2
                                    className="
                                        text-base
                                        font-semibold
                                        text-black
                                        min-[1280px]:max-[1365px]:text-sm
                                        min-[1366px]:max-[1537px]:text-sm
                                    "
                                >
                                    Review Classification
                                </h2>

                                <p
                                    className="
                                        mt-0.5
                                        text-xs
                                        text-gray-500
                                        min-[1280px]:max-[1365px]:text-[10px]
                                        min-[1366px]:max-[1537px]:text-[11px]
                                    "
                                >
                                    Review the model recommendation and decide
                                    the final symptom classification.
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
                            <div
                                className="
                                    rounded-lg
                                    border
                                    border-gray-300
                                    bg-gray-50
                                    px-4
                                    py-3
                                    min-[1280px]:max-[1365px]:px-3
                                    min-[1280px]:max-[1365px]:py-2.5
                                    min-[1366px]:max-[1537px]:px-3.5
                                    min-[1366px]:max-[1537px]:py-2.5
                                "
                            >
                                <p
                                    className="
                                        text-xs
                                        font-medium
                                        uppercase
                                        text-gray-500
                                        min-[1280px]:max-[1365px]:text-[10px]
                                        min-[1366px]:max-[1537px]:text-[11px]
                                    "
                                >
                                    Review Reason
                                </p>

                                <div className="mt-2 flex items-center gap-2">
                                    <CircleAlert
                                        size={17}
                                        className="
                                            shrink-0
                                            text-red-700
                                            min-[1280px]:max-[1365px]:size-[15px]
                                            min-[1366px]:max-[1537px]:size-[16px]
                                        "
                                    />

                                    <p
                                        className="
                                            text-sm
                                            font-semibold
                                            text-black
                                            min-[1280px]:max-[1365px]:text-xs
                                            min-[1366px]:max-[1537px]:text-xs
                                        "
                                    >
                                        {flag.reason || "Low Confidence"}
                                    </p>
                                </div>
                            </div>

                            <div
                                className="
                                    mt-5
                                    rounded-lg
                                    border
                                    border-gray-300
                                    bg-gray-50
                                    p-4
                                    min-[1280px]:max-[1365px]:mt-4
                                    min-[1280px]:max-[1365px]:p-3
                                    min-[1366px]:max-[1537px]:mt-4
                                    min-[1366px]:max-[1537px]:p-3.5
                                "
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <p
                                        className="
                                            text-xs
                                            font-medium
                                            uppercase
                                            text-gray-500
                                            min-[1280px]:max-[1365px]:text-[10px]
                                            min-[1366px]:max-[1537px]:text-[11px]
                                        "
                                    >
                                        Model Recommended
                                    </p>

                                    <span
                                        className="
                                            rounded-full
                                            bg-[#4C4CF9]/10
                                            px-2.5
                                            py-1
                                            text-xs
                                            font-semibold
                                            text-[#4C4CF9]
                                            min-[1280px]:max-[1365px]:px-2
                                            min-[1280px]:max-[1365px]:py-0.5
                                            min-[1280px]:max-[1365px]:text-[10px]
                                            min-[1366px]:max-[1537px]:px-2
                                            min-[1366px]:max-[1537px]:py-0.5
                                            min-[1366px]:max-[1537px]:text-[11px]
                                        "
                                    >
                                        {confidence}%
                                    </span>
                                </div>

                                <p
                                    className="
                                        mt-3
                                        text-xl
                                        font-semibold
                                        text-black
                                        min-[1280px]:max-[1365px]:mt-2
                                        min-[1280px]:max-[1365px]:text-lg
                                        min-[1366px]:max-[1537px]:mt-2.5
                                        min-[1366px]:max-[1537px]:text-lg
                                    "
                                >
                                    {flag.predicted_symptom_code || "-"}
                                </p>

                                <p
                                    className="
                                        mt-1
                                        text-xs
                                        text-gray-500
                                        min-[1280px]:max-[1365px]:text-[10px]
                                        min-[1366px]:max-[1537px]:text-[11px]
                                    "
                                >
                                    Primary recommended symptom code
                                </p>
                            </div>

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
                                        min-[1366px]:max-[1537px]:text-[11px]
                                    "
                                >
                                    Select Correct Symptom Code
                                </label>

                                <button
                                    type="button"
                                    onClick={() => setSheetOpen(true)}
                                    className="
                                        mt-2
                                        flex
                                        w-full
                                        cursor-pointer
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
                                        focus:border-[#4C4CF9]
                                        focus:ring-2
                                        focus:ring-[#4C4CF9]/10
                                        min-[1280px]:max-[1365px]:px-3
                                        min-[1280px]:max-[1365px]:py-2.5
                                        min-[1366px]:max-[1537px]:px-3.5
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
                                                min-[1280px]:max-[1365px]:text-xs
                                                min-[1366px]:max-[1537px]:text-xs
                                            "
                                        >
                                            {selectedSymptom ||
                                                "Select symptom code"}
                                        </p>

                                        {!selectedSymptom && (
                                            <p
                                                className="
                                                    mt-0.5
                                                    text-xs
                                                    text-gray-500
                                                    min-[1280px]:max-[1365px]:text-[10px]
                                                    min-[1366px]:max-[1537px]:text-[11px]
                                                "
                                            >
                                                Search and select the correct
                                                classification
                                            </p>
                                        )}
                                    </div>

                                    <Search
                                        size={17}
                                        className="
                                            ml-3
                                            shrink-0
                                            text-gray-400
                                            min-[1280px]:max-[1365px]:size-[15px]
                                            min-[1366px]:max-[1537px]:size-[16px]
                                        "
                                    />
                                </button>
                            </div>

                            {selectedSymptom && (
                                <div
                                    className="
                                        mt-4
                                        rounded-lg
                                        border
                                        border-[#4C4CF9]/30
                                        bg-[#4C4CF9]/5
                                        px-4
                                        py-3.5
                                        min-[1280px]:max-[1365px]:mt-3
                                        min-[1280px]:max-[1365px]:px-3
                                        min-[1280px]:max-[1365px]:py-3
                                        min-[1366px]:max-[1537px]:mt-3
                                        min-[1366px]:max-[1537px]:px-3.5
                                        min-[1366px]:max-[1537px]:py-3
                                    "
                                >
                                    <p
                                        className="
                                            text-xs
                                            font-semibold
                                            uppercase
                                            text-gray-500
                                            min-[1280px]:max-[1365px]:text-[10px]
                                            min-[1366px]:max-[1537px]:text-[11px]
                                        "
                                    >
                                        Selected Classification
                                    </p>

                                    <div className="mt-2 flex items-center justify-between gap-3">
                                        <div className="flex min-w-0 items-center gap-2">
                                            <Pencil
                                                size={15}
                                                className={
                                                    canOverride
                                                        ? "text-[#4C4CF9]"
                                                        : "text-gray-400"
                                                }
                                            />

                                            <p
                                                className="
                                                    truncate
                                                    text-sm
                                                    font-semibold
                                                    text-black
                                                    min-[1280px]:max-[1365px]:text-xs
                                                    min-[1366px]:max-[1537px]:text-xs
                                                "
                                            >
                                                {selectedSymptom}
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setSheetOpen(true)
                                            }
                                            className="
                                                shrink-0
                                                cursor-pointer
                                                text-xs
                                                font-medium
                                                text-[#4C4CF9]
                                                hover:underline
                                                min-[1280px]:max-[1365px]:text-[10px]
                                                min-[1366px]:max-[1537px]:text-[11px]
                                            "
                                        >
                                            Change
                                        </button>
                                    </div>

                                    {!canOverride && (
                                        <p
                                            className="
                                                mt-2
                                                text-xs
                                                leading-5
                                                text-gray-500
                                                min-[1280px]:max-[1365px]:text-[10px]
                                                min-[1280px]:max-[1365px]:leading-4
                                                min-[1366px]:max-[1537px]:text-[11px]
                                                min-[1366px]:max-[1537px]:leading-4
                                            "
                                        >
                                            This is already the AI recommended
                                            symptom code. Use Accept
                                            Recommendation instead.
                                        </p>
                                    )}
                                </div>
                            )}

                            <div
                                className="
                                    mt-5
                                    grid
                                    grid-cols-2
                                    gap-3
                                    min-[1280px]:max-[1365px]:mt-4
                                    min-[1280px]:max-[1365px]:gap-2
                                    min-[1366px]:max-[1537px]:mt-4
                                    min-[1366px]:max-[1537px]:gap-2.5
                                "
                            >
                                <button
                                    type="button"
                                    onClick={openOverrideModal}
                                    disabled={
                                        !canOverride ||
                                        approving ||
                                        accepting
                                    }
                                    className={`
                                        flex
                                        h-10
                                        cursor-pointer
                                        items-center
                                        justify-center
                                        gap-2
                                        rounded-lg
                                        px-4
                                        text-sm
                                        font-medium
                                        transition
                                        min-[1280px]:max-[1365px]:h-9
                                        min-[1280px]:max-[1365px]:px-2.5
                                        min-[1280px]:max-[1365px]:text-[11px]
                                        min-[1366px]:max-[1537px]:h-9
                                        min-[1366px]:max-[1537px]:px-3
                                        min-[1366px]:max-[1537px]:text-xs
                                        ${
                                            canOverride &&
                                            !approving &&
                                            !accepting
                                                ? "bg-[#4C4CF9] text-white hover:bg-[#3f3fe0]"
                                                : "cursor-not-allowed bg-gray-100 text-gray-400"
                                        }
                                    `}
                                >
                                    <Check
                                        size={16}
                                        strokeWidth={2.2}
                                        className="
                                            min-[1280px]:max-[1365px]:size-[14px]
                                            min-[1366px]:max-[1537px]:size-[15px]
                                        "
                                    />

                                    {approving
                                        ? "Approving..."
                                        : "Approve Override"}
                                </button>

                                <button
                                    type="button"
                                    onClick={openAcceptModal}
                                    disabled={accepting || approving}
                                    className={`
                                        flex
                                        h-10
                                        cursor-pointer
                                        items-center
                                        justify-center
                                        gap-2
                                        rounded-lg
                                        px-4
                                        text-sm
                                        font-medium
                                        text-white
                                        transition
                                        min-[1280px]:max-[1365px]:h-9
                                        min-[1280px]:max-[1365px]:px-2.5
                                        min-[1280px]:max-[1365px]:text-[11px]
                                        min-[1366px]:max-[1537px]:h-9
                                        min-[1366px]:max-[1537px]:px-3
                                        min-[1366px]:max-[1537px]:text-xs
                                        ${
                                            accepting || approving
                                                ? "cursor-not-allowed bg-gray-400"
                                                : "bg-[#4C4CF9] hover:bg-[#3f3fe0]"
                                        }
                                    `}
                                >
                                    <CheckCircle2
                                        size={16}
                                        strokeWidth={2.2}
                                        className="
                                            min-[1280px]:max-[1365px]:size-[14px]
                                            min-[1366px]:max-[1537px]:size-[15px]
                                        "
                                    />

                                    {accepting
                                        ? "Accepting..."
                                        : "Accept Recommendation"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

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
                            min-[1366px]:max-[1537px]:gap-2.5
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
                                min-[1366px]:max-[1537px]:h-8
                                min-[1366px]:max-[1537px]:w-8
                            "
                        >
                            <TrendingUp
                                size={18}
                                className="
                                    text-gray-600
                                    min-[1280px]:max-[1365px]:size-[16px]
                                    min-[1366px]:max-[1537px]:size-[17px]
                                "
                            />
                        </div>

                        <div className="min-w-0">
                            <h2
                                className="
                                    text-base
                                    font-semibold
                                    text-black
                                    min-[1280px]:max-[1365px]:text-sm
                                    min-[1366px]:max-[1537px]:text-sm
                                "
                            >
                                Model Recommendation Result
                            </h2>

                            <p
                                className="
                                    mt-0.5
                                    text-xs
                                    text-gray-500
                                    min-[1280px]:max-[1365px]:text-[10px]
                                    min-[1366px]:max-[1537px]:text-[11px]
                                "
                            >
                                The model returned a low-confidence
                                recommendation and requires manual
                                verification.
                            </p>
                        </div>
                    </div>

                    <div
                        className="
                            grid
                            grid-cols-3
                            gap-4
                            p-5
                            min-[1280px]:max-[1365px]:gap-3
                            min-[1280px]:max-[1365px]:p-4
                            min-[1366px]:max-[1537px]:gap-3
                            min-[1366px]:max-[1537px]:p-4
                        "
                    >
                        <div
                            className="
                                rounded-lg
                                border
                                border-gray-300
                                p-4
                                min-[1280px]:max-[1365px]:p-3
                                min-[1366px]:max-[1537px]:p-3.5
                            "
                        >
                            <div className="flex items-center justify-between gap-3">
                                <p
                                    className="
                                        text-xs
                                        font-medium
                                        uppercase
                                        text-gray-500
                                        min-[1280px]:max-[1365px]:text-[10px]
                                        min-[1366px]:max-[1537px]:text-[11px]
                                    "
                                >
                                    Primary Recommended
                                </p>

                                <span
                                    className="
                                        rounded-full
                                        bg-gray-100
                                        px-2.5
                                        py-1
                                        text-[11px]
                                        font-medium
                                        text-gray-700
                                        min-[1280px]:max-[1365px]:px-2
                                        min-[1280px]:max-[1365px]:py-0.5
                                        min-[1280px]:max-[1365px]:text-[9px]
                                        min-[1366px]:max-[1537px]:px-2
                                        min-[1366px]:max-[1537px]:py-0.5
                                        min-[1366px]:max-[1537px]:text-[10px]
                                    "
                                >
                                    Model Recommended
                                </span>
                            </div>

                            <div
                                className="
                                    mt-5
                                    flex
                                    items-end
                                    justify-between
                                    gap-4
                                    min-[1280px]:max-[1365px]:mt-4
                                    min-[1366px]:max-[1537px]:mt-4
                                "
                            >
                                <p
                                    className="
                                        text-xl
                                        font-semibold
                                        text-black
                                        min-[1280px]:max-[1365px]:text-lg
                                        min-[1366px]:max-[1537px]:text-lg
                                    "
                                >
                                    {flag.predicted_symptom_code || "-"}
                                </p>

                                <p
                                    className="
                                        text-lg
                                        font-semibold
                                        text-[#4C4CF9]
                                        min-[1280px]:max-[1365px]:text-base
                                        min-[1366px]:max-[1537px]:text-base
                                    "
                                >
                                    {confidence}%
                                </p>
                            </div>

                            <p
                                className="
                                    mt-3
                                    text-xs
                                    leading-5
                                    text-gray-500
                                    min-[1280px]:max-[1365px]:mt-2
                                    min-[1280px]:max-[1365px]:text-[10px]
                                    min-[1280px]:max-[1365px]:leading-4
                                    min-[1366px]:max-[1537px]:mt-2
                                    min-[1366px]:max-[1537px]:text-[11px]
                                    min-[1366px]:max-[1537px]:leading-4
                                "
                            >
                                Primary confidence recommended by the model.
                            </p>
                        </div>

                        <div
                            className="
                                rounded-lg
                                border
                                border-gray-300
                                p-4
                                min-[1280px]:max-[1365px]:p-3
                                min-[1366px]:max-[1537px]:p-3.5
                            "
                        >
                            <p
                                className="
                                    text-xs
                                    font-medium
                                    uppercase
                                    text-gray-500
                                    min-[1280px]:max-[1365px]:text-[10px]
                                    min-[1366px]:max-[1537px]:text-[11px]
                                "
                            >
                                Secondary Recommended
                            </p>

                            <div
                                className="
                                    mt-5
                                    flex
                                    items-end
                                    justify-between
                                    gap-4
                                    min-[1280px]:max-[1365px]:mt-4
                                    min-[1366px]:max-[1537px]:mt-4
                                "
                            >
                                <p
                                    className="
                                        text-xl
                                        font-semibold
                                        text-black
                                        min-[1280px]:max-[1365px]:text-lg
                                        min-[1366px]:max-[1537px]:text-lg
                                    "
                                >
                                    {flag.second_predicted_symptom_code ||
                                        "-"}
                                </p>

                                <p
                                    className="
                                        text-lg
                                        font-semibold
                                        text-amber-600
                                        min-[1280px]:max-[1365px]:text-base
                                        min-[1366px]:max-[1537px]:text-base
                                    "
                                >
                                    {secondConfidence}%
                                </p>
                            </div>

                            <p
                                className="
                                    mt-3
                                    text-xs
                                    leading-5
                                    text-gray-500
                                    min-[1280px]:max-[1365px]:mt-2
                                    min-[1280px]:max-[1365px]:text-[10px]
                                    min-[1280px]:max-[1365px]:leading-4
                                    min-[1366px]:max-[1537px]:mt-2
                                    min-[1366px]:max-[1537px]:text-[11px]
                                    min-[1366px]:max-[1537px]:leading-4
                                "
                            >
                                Secondary confidence recommended by the model.
                            </p>
                        </div>

                        <div
                            className="
                                rounded-lg
                                border
                                border-gray-300
                                p-4
                                min-[1280px]:max-[1365px]:p-3
                                min-[1366px]:max-[1537px]:p-3.5
                            "
                        >
                            <p
                                className="
                                    text-xs
                                    font-medium
                                    uppercase
                                    text-gray-500
                                    min-[1280px]:max-[1365px]:text-[10px]
                                    min-[1366px]:max-[1537px]:text-[11px]
                                "
                            >
                                Confidence Margin
                            </p>

                            <p
                                className="
                                    mt-5
                                    text-2xl
                                    font-semibold
                                    text-green-600
                                    min-[1280px]:max-[1365px]:mt-4
                                    min-[1280px]:max-[1365px]:text-xl
                                    min-[1366px]:max-[1537px]:mt-4
                                    min-[1366px]:max-[1537px]:text-xl
                                "
                            >
                                {confidenceMargin}%
                            </p>

                            <p
                                className="
                                    mt-3
                                    text-xs
                                    leading-5
                                    text-gray-500
                                    min-[1280px]:max-[1365px]:mt-2
                                    min-[1280px]:max-[1365px]:text-[10px]
                                    min-[1280px]:max-[1365px]:leading-4
                                    min-[1366px]:max-[1537px]:mt-2
                                    min-[1366px]:max-[1537px]:text-[11px]
                                    min-[1366px]:max-[1537px]:leading-4
                                "
                            >
                                Difference between the primary and secondary
                                recommendation confidence.
                            </p>
                        </div>
                    </div>

                    <div
                        className="
                            mx-5
                            mb-5
                            flex
                            items-start
                            gap-2.5
                            rounded-lg
                            border
                            border-blue-200
                            bg-blue-50
                            px-3.5
                            py-3
                            min-[1280px]:max-[1365px]:mx-4
                            min-[1280px]:max-[1365px]:mb-4
                            min-[1280px]:max-[1365px]:gap-2
                            min-[1280px]:max-[1365px]:px-3
                            min-[1280px]:max-[1365px]:py-2.5
                            min-[1366px]:max-[1537px]:mx-4
                            min-[1366px]:max-[1537px]:mb-4
                            min-[1366px]:max-[1537px]:px-3
                            min-[1366px]:max-[1537px]:py-2.5
                        "
                    >
                        <CircleAlert
                            size={17}
                            className="
                                mt-0.5
                                shrink-0
                                text-blue-600
                                min-[1280px]:max-[1365px]:size-[15px]
                                min-[1366px]:max-[1537px]:size-[16px]
                            "
                        />

                        <div className="min-w-0">
                            <p
                                className="
                                    text-sm
                                    font-medium
                                    text-blue-800
                                    min-[1280px]:max-[1365px]:text-xs
                                    min-[1366px]:max-[1537px]:text-xs
                                "
                            >
                                Low Confidence Recommendation
                            </p>

                            <p
                                className="
                                    mt-1
                                    text-xs
                                    leading-5
                                    text-blue-700
                                    min-[1280px]:max-[1365px]:text-[10px]
                                    min-[1280px]:max-[1365px]:leading-4
                                    min-[1366px]:max-[1537px]:text-[11px]
                                    min-[1366px]:max-[1537px]:leading-4
                                "
                            >
                                This ticket was flagged because the model
                                recommendation did not meet the required
                                confidence threshold. Manual verification is
                                required before the ticket can continue.
                            </p>
                        </div>
                    </div>
                </div>

                <SymptomCodeSheet
                    open={sheetOpen}
                    onClose={() => setSheetOpen(false)}
                    onSelect={(symptom) => {
                        setSelectedSymptom(symptom.code);
                        setSheetOpen(false);
                    }}
                    excludeCode={flag.predicted_symptom_code}
                />
            </div>

            <RemarksModal
                open={Boolean(reviewAction)}
                title={reviewModalTitle}
                description={reviewModalDescription}
                remarks={remarks}
                setRemarks={setRemarks}
                onCancel={closeReviewModal}
                onConfirm={handleConfirmReview}
                loading={accepting || approving}
                confirmText={reviewModalConfirmText}
                required
                minLength={MIN_REMARKS_LENGTH}
            />
        </>
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
                    min-[1366px]:max-[1537px]:text-[11px]
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
                    min-[1280px]:max-[1365px]:text-xs
                    min-[1366px]:max-[1537px]:mt-1.5
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

function UserCard({ label, user, value }) {
    if (value !== undefined) {
        return (
            <div className="min-w-0">
                <p
                    className="
                        text-xs
                        font-medium
                        uppercase
                        text-gray-500
                        min-[1280px]:max-[1365px]:text-[10px]
                        min-[1366px]:max-[1537px]:text-[11px]
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
                        min-[1280px]:max-[1365px]:text-xs
                        min-[1366px]:max-[1537px]:mt-1.5
                        min-[1366px]:max-[1537px]:text-xs
                    "
                >
                    {value || "-"}
                </p>
            </div>
        );
    }

    return (
        <div className="min-w-0">
            <p
                className="
                    text-xs
                    font-medium
                    uppercase
                    text-gray-500
                    min-[1280px]:max-[1365px]:text-[10px]
                    min-[1366px]:max-[1537px]:text-[11px]
                "
            >
                {label}
            </p>

            <div
                className="
                    mt-3
                    flex
                    items-center
                    gap-3
                    min-[1280px]:max-[1365px]:mt-2
                    min-[1280px]:max-[1365px]:gap-2
                    min-[1366px]:max-[1537px]:mt-2.5
                    min-[1366px]:max-[1537px]:gap-2.5
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
                            min-[1280px]:max-[1365px]:text-xs
                            min-[1366px]:max-[1537px]:text-xs
                        "
                    >
                        {user.name || "-"}
                    </p>

                    <p
                        className="
                            mt-1
                            truncate
                            text-xs
                            text-gray-500
                            min-[1280px]:max-[1365px]:mt-0.5
                            min-[1280px]:max-[1365px]:text-[10px]
                            min-[1366px]:max-[1537px]:mt-0.5
                            min-[1366px]:max-[1537px]:text-[11px]
                        "
                    >
                        {user.userCode || "-"}
                        {user.department
                            ? ` • ${user.department}`
                            : ""}
                    </p>

                    <p
                        className="
                            mt-0.5
                            truncate
                            text-xs
                            text-gray-500
                            min-[1280px]:max-[1365px]:text-[10px]
                            min-[1366px]:max-[1537px]:text-[11px]
                        "
                    >
                        {user.officeLocation || "-"}
                    </p>
                </div>
            </div>
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
                bg-[#4C4CF9]/10
                font-semibold
                text-[#4C4CF9]
                ${sizeClass}
                min-[1280px]:max-[1365px]:h-8
                min-[1280px]:max-[1365px]:w-8
                min-[1280px]:max-[1365px]:text-[10px]
                min-[1366px]:max-[1537px]:h-8
                min-[1366px]:max-[1537px]:w-8
                min-[1366px]:max-[1537px]:text-[11px]
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
        .map((part) => part.charAt(0).toUpperCase())
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