import { useState } from "react";
import {
    CircleAlert,
    ClipboardCheck,
    Ticket,
    CheckCircle2,
    Pencil,
} from "lucide-react";
import { formatDate } from "../../utils/formatDate";
import {
    priorityLabel,
    priorityColor,
} from "../../utils/priority";
import {
    affectedScopeLabel,
    affectedScopeColor,
} from "../../utils/affectedScopeColor";
import api from "/src/api";

const MIN_REMARKS_LENGTH = 30;

export default function PriorityAssessmentReview({ flag }) {
    const [accepting, setAccepting] = useState(false);
    const [overriding, setOverriding] = useState(false);
    const [remarks, setRemarks] = useState("");
    const [remarksTouched, setRemarksTouched] = useState(false);
    const [reviewAction, setReviewAction] = useState(null);
    const [selectedPriority, setSelectedPriority] = useState("");
    const [priorityModalOpen, setPriorityModalOpen] = useState(false);
    const [reviewedFlag, setReviewedFlag] = useState(null);
    const [apiError, setApiError] = useState("");
    const [toast, setToast] = useState(null);

    const activeFlag = reviewedFlag || flag;

    const submittedByName =
        `${activeFlag?.first_name || ""} ${activeFlag?.last_name || ""}`.trim();

    const currentPriority =
        activeFlag?.priority ||
        activeFlag?.predicted_priority ||
        activeFlag?.priority_level ||
        activeFlag?.final_priority ||
        activeFlag?.contextual_priority ||
        activeFlag?.calculated_priority ||
        null;

    const basePriority =
        activeFlag?.base_priority ||
        activeFlag?.based_priority ||
        null;

    const affectedScope =
        activeFlag?.affected_scope ||
        activeFlag?.affectedScope ||
        null;

    const businessCritical =
        activeFlag?.business_critical ??
        activeFlag?.businessCritical ??
        false;

    const timeCritical =
        activeFlag?.time_critical ??
        activeFlag?.timeCritical ??
        false;

    const impact =
        activeFlag?.impact ||
        getImpact(affectedScope);

    const urgency =
        activeFlag?.urgency ||
        getUrgency(businessCritical, timeCritical);

    const reviewedAt =
        activeFlag?.reviewed_at ||
        activeFlag?.review_date ||
        activeFlag?.resolved_at ||
        null;

    const normalizedStatus = String(
        activeFlag?.status || ""
    ).toLowerCase();

    const isReviewed =
        normalizedStatus === "resolved" ||
        normalizedStatus === "reviewed" ||
        normalizedStatus === "approved" ||
        Boolean(reviewedAt) ||
        Boolean(activeFlag?.reviewed_by) ||
        Boolean(activeFlag?.reviewed_by_name) ||
        Boolean(activeFlag?.reviewer_name) ||
        Boolean(activeFlag?.review_remarks);

    const reviewedBy =
        activeFlag?.reviewed_by ||
        activeFlag?.reviewer ||
        null;

    const reviewedByName =
        activeFlag?.reviewed_by_name ||
        activeFlag?.reviewer_name ||
        getReviewerName(reviewedBy) ||
        "-";

    const reviewedByUserCode =
        activeFlag?.reviewed_by_user_code ||
        activeFlag?.reviewer_user_code ||
        reviewedBy?.user_code ||
        "";

    const reviewedByDepartment =
        activeFlag?.reviewed_by_it_department ||
        activeFlag?.reviewed_by_department ||
        activeFlag?.reviewer_department ||
        getReviewerDepartment(reviewedBy) ||
        "";

    const existingReviewRemarks =
        activeFlag?.review_remarks ||
        activeFlag?.reviewer_remarks ||
        activeFlag?.remarks ||
        "-";

    const trimmedRemarks = remarks.trim();
    const remarksLength = trimmedRemarks.length;

    const isRemarksValid =
        remarksLength >= MIN_REMARKS_LENGTH;

    const remarksTooShort =
        remarksLength > 0 &&
        remarksLength < MIN_REMARKS_LENGTH;

    const showRemarksError =
        remarksTouched &&
        !isRemarksValid;

    const showToast = (type, message) => {
        setToast({
            type,
            message,
        });

        setTimeout(() => {
            setToast(null);
        }, 4000);
    };

    const handleAcceptPriority = async () => {
        const cleanRemarks = remarks.trim();

        setRemarksTouched(true);
        setApiError("");

        if (cleanRemarks.length < MIN_REMARKS_LENGTH) {
            return;
        }

        setAccepting(true);

        try {
            const response = await api.post(
                `/tickets/flagged/${activeFlag.id}/accept-priority/`,
                {
                    remarks: cleanRemarks,
                }
            );

            const data = response.data;

            const returnedReviewer =
                data?.review_flag?.reviewed_by ||
                data?.reviewed_by ||
                null;

            const returnedReviewFlag = {
                ...activeFlag,

                status:
                    data?.review_flag?.status ||
                    "resolved",

                reviewed_by:
                    data?.review_flag?.reviewed_by ||
                    data?.reviewed_by ||
                    returnedReviewer,

                reviewed_by_name:
                    data?.review_flag?.reviewed_by_name ||
                    data?.reviewed_by_name ||
                    getReviewerName(returnedReviewer) ||
                    "Service Desk",

                reviewed_by_user_code:
                    data?.review_flag?.reviewed_by_user_code ||
                    data?.reviewed_by_user_code ||
                    returnedReviewer?.user_code ||
                    "",

                reviewed_by_it_department:
                    data?.review_flag?.reviewed_by_it_department ||
                    data?.reviewed_by_it_department ||
                    "",

                reviewed_by_department:
                    data?.review_flag?.reviewed_by_department ||
                    data?.reviewed_by_department ||
                    getReviewerDepartment(returnedReviewer) ||
                    "",

                reviewed_at:
                    data?.review_flag?.reviewed_at ||
                    data?.reviewed_at ||
                    new Date().toISOString(),

                review_remarks:
                    data?.review_flag?.review_remarks ||
                    data?.review_remarks ||
                    cleanRemarks,

                remarks: cleanRemarks,

                priority:
                    data?.ticket?.priority ||
                    currentPriority,
            };

            setReviewedFlag(returnedReviewFlag);
            setReviewAction(null);
            setRemarks("");
            setRemarksTouched(false);
            setSelectedPriority("");
            setApiError("");

            showToast(
                "success",
                "Priority assessment accepted successfully."
            );

            console.log(
                "Priority accepted successfully:",
                data
            );
        } catch (error) {
            console.error(
                "Priority review request failed:",
                error
            );

            const responseData =
                error?.response?.data;

            const errorMessage =
                typeof responseData?.detail === "string"
                    ? responseData.detail
                    : Array.isArray(
                          responseData?.remarks
                      )
                    ? responseData.remarks[0]
                    : typeof responseData?.remarks === "string"
                    ? responseData.remarks
                    : typeof responseData?.message === "string"
                    ? responseData.message
                    : error?.message ||
                      "Failed to accept the priority assessment.";

            setApiError(errorMessage);

            showToast(
                "error",
                errorMessage
            );
        } finally {
            setAccepting(false);
        }
    };

    const openAcceptReview = () => {
        if (isReviewed) {
            return;
        }

        setApiError("");
        setReviewAction("accept");

        if (
            remarks.trim().length >=
            MIN_REMARKS_LENGTH
        ) {
            handleAcceptPriority();
        } else {
            setRemarksTouched(true);
        }
    };

    const openPriorityModal = () => {
        if (isReviewed) {
            return;
        }

        setApiError("");
        setPriorityModalOpen(true);
    };

    const openPriorityChange = () => {
        if (isReviewed) {
            return;
        }

        setApiError("");
        setPriorityModalOpen(true);
    };

    const closePriorityModal = () => {
        if (overriding) {
            return;
        }

        setPriorityModalOpen(false);
    };

    const continuePriorityOverride = () => {
        if (isReviewed) {
            return;
        }

        if (!selectedPriority) {
            return;
        }

        if (selectedPriority === currentPriority) {
            return;
        }

        setPriorityModalOpen(false);
        setRemarks("");
        setRemarksTouched(false);
        setApiError("");
    };

    const handleOverridePriority = async () => {
        if (isReviewed || !selectedPriority) {
            return;
        }

        const cleanRemarks = remarks.trim();

        setRemarksTouched(true);
        setApiError("");

        if (!selectedPriority) {
            setApiError("Please select a new priority.");

            showToast(
                "error",
                "Please select a new priority."
            );

            return;
        }

        if (selectedPriority === currentPriority) {
            setApiError(
                "Please select a different priority from the current priority."
            );

            showToast(
                "error",
                "Please select a different priority."
            );

            return;
        }

        if (cleanRemarks.length < MIN_REMARKS_LENGTH) {
            return;
        }

        setOverriding(true);

        try {
            const response = await api.post(
                `/tickets/flagged/${activeFlag.id}/override-priority/`,
                {
                    priority: selectedPriority,
                    remarks: cleanRemarks,
                }
            );

            const data = response.data;

            const returnedReviewer =
                data?.review_flag?.reviewed_by ||
                data?.reviewed_by ||
                null;

            const returnedPriority =
                data?.ticket?.priority ||
                selectedPriority;

            const returnedReviewFlag = {
                ...activeFlag,

                status:
                    data?.review_flag?.status ||
                    "resolved",

                reviewed_by:
                    data?.review_flag?.reviewed_by ||
                    data?.reviewed_by ||
                    returnedReviewer,

                reviewed_by_name:
                    data?.review_flag?.reviewed_by_name ||
                    data?.reviewed_by_name ||
                    getReviewerName(returnedReviewer) ||
                    "Service Desk",

                reviewed_by_user_code:
                    data?.review_flag?.reviewed_by_user_code ||
                    data?.reviewed_by_user_code ||
                    returnedReviewer?.user_code ||
                    "",

                reviewed_by_it_department:
                    data?.review_flag?.reviewed_by_it_department ||
                    data?.reviewed_by_it_department ||
                    "",

                reviewed_by_department:
                    data?.review_flag?.reviewed_by_department ||
                    data?.reviewed_by_department ||
                    getReviewerDepartment(returnedReviewer) ||
                    "",

                reviewed_at:
                    data?.review_flag?.reviewed_at ||
                    data?.reviewed_at ||
                    new Date().toISOString(),

                review_remarks:
                    data?.review_flag?.review_remarks ||
                    data?.review_remarks ||
                    cleanRemarks,

                remarks: cleanRemarks,

                priority: returnedPriority,
            };

            setReviewedFlag(returnedReviewFlag);
            setReviewAction(null);
            setRemarks("");
            setRemarksTouched(false);
            setSelectedPriority("");
            setApiError("");

            showToast(
                "success",
                `Priority successfully overridden to ${returnedPriority}.`
            );

            console.log(
                "Priority overridden successfully:",
                data
            );
        } catch (error) {
            console.error(
                "Priority override request failed:",
                error
            );

            const responseData =
                error?.response?.data;

            const errorMessage =
                typeof responseData?.detail === "string"
                    ? responseData.detail
                    : Array.isArray(
                          responseData?.remarks
                      )
                    ? responseData.remarks[0]
                    : typeof responseData?.remarks === "string"
                    ? responseData.remarks
                    : Array.isArray(
                          responseData?.priority
                      )
                    ? responseData.priority[0]
                    : typeof responseData?.priority === "string"
                    ? responseData.priority
                    : typeof responseData?.message === "string"
                    ? responseData.message
                    : error?.message ||
                      "Failed to override the priority.";

            setApiError(errorMessage);

            showToast(
                "error",
                errorMessage
            );
        } finally {
            setOverriding(false);
        }
    };

    const handlePriorityAction = () => {
        if (selectedPriority) {
            handleOverridePriority();
        } else {
            openPriorityModal();
        }
    };

    return (
        <>
            <div className="space-y-4">
                <div
                    className="
                        grid
                        grid-cols-1
                        items-start
                        gap-4
                        min-[768px]:grid-cols-[1.05fr_0.95fr]
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
                                            ${getStatusStyle(
                                                activeFlag?.status
                                            )}
                                        `}
                                    >
                                        {formatStatus(
                                            activeFlag?.status
                                        )}
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
                            <div className="grid grid-cols-1 min-[500px]:grid-cols-2">
                                <InfoCell
                                    label="Ticket Code"
                                    value={
                                        activeFlag?.ticket_code
                                    }
                                />

                                <InfoCell
                                    label="Affected Scope"
                                    value={
                                        <span
                                            className={`
                                                inline-flex
                                                rounded-md
                                                border
                                                px-2.5
                                                py-1
                                                text-xs
                                                font-semibold
                                                ${
                                                    affectedScopeColor[
                                                        affectedScope
                                                    ] ||
                                                    "border-gray-300 bg-gray-100 text-gray-700"
                                                }
                                            `}
                                        >
                                            {affectedScopeLabel[
                                                affectedScope
                                            ] ||
                                                formatAffectedScope(
                                                    affectedScope
                                                )}
                                        </span>
                                    }
                                    bordered
                                />
                            </div>

                            <InfoCell
                                label="Subject"
                                value={
                                    activeFlag?.subject
                                }
                            />

                            <InfoCell
                                label="Description"
                                value={
                                    activeFlag?.description
                                }
                                multiline
                            />

                            <InfoCell
                                label="Business Impact"
                                value={
                                    activeFlag?.business_impact
                                }
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
                                <div className="grid grid-cols-1 gap-5 min-[500px]:grid-cols-2 min-[1280px]:max-[1537px]:gap-4">
                                    <UserCard
                                        label="Ticket Submitted By"
                                        user={{
                                            name:
                                                submittedByName ||
                                                "-",
                                            userCode:
                                                activeFlag?.user_code,
                                            department:
                                                activeFlag?.employee_department ||
                                                "IT Service Desk",
                                        }}
                                    />

                                    <UserCard
                                        label="Ticket Submitted At"
                                        value={
                                            activeFlag?.created_at ||
                                            activeFlag?.submitted_at
                                                ? formatDate(
                                                      activeFlag?.created_at ||
                                                          activeFlag?.submitted_at
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
                                    Review Priority
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
                                    Review the system-assessed priority and
                                    decide the final priority classification.
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
                                            text-orange-600
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
                                        {formatReason(
                                            activeFlag?.reason
                                        )}
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
                                        System Assessed Priority
                                    </p>

                                    <span
                                        className={`
                                            rounded-full
                                            border
                                            px-2.5
                                            py-1
                                            text-xs
                                            font-semibold
                                            ${getPriorityBadgeStyle(
                                                currentPriority
                                            )}
                                            min-[1280px]:max-[1365px]:px-2
                                            min-[1280px]:max-[1365px]:py-0.5
                                            min-[1280px]:max-[1365px]:text-[10px]
                                            min-[1366px]:max-[1537px]:px-2
                                            min-[1366px]:max-[1537px]:py-0.5
                                            min-[1366px]:max-[1537px]:text-[11px]
                                        `}
                                    >
                                        {currentPriority || "-"}
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
                                    {priorityLabel[
                                        currentPriority
                                    ] || "-"}
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
                                    Priority calculated from impact and urgency.
                                </p>
                            </div>

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
                                <PriorityFactor
                                    label="Base Priority"
                                    value={
                                        priorityLabel[
                                            basePriority
                                        ] ||
                                        basePriority
                                    }
                                    badge
                                    badgeStyle={getPriorityBadgeStyle(
                                        basePriority
                                    )}
                                />

                                <PriorityFactor
                                    label="Affected Scope"
                                    value={
                                        affectedScopeLabel[
                                            affectedScope
                                        ] ||
                                        formatAffectedScope(
                                            affectedScope
                                        )
                                    }
                                    badge
                                    badgeStyle={
                                        affectedScopeColor[
                                            affectedScope
                                        ] ||
                                        "border-gray-300 bg-gray-100 text-gray-700"
                                    }
                                    badgeRounded="rounded-md"
                                />

                                <PriorityFactor
                                    label="Business Critical"
                                    value={formatBoolean(
                                        businessCritical
                                    )}
                                />

                                <PriorityFactor
                                    label="Time Critical"
                                    value={formatBoolean(
                                        timeCritical
                                    )}
                                />
                            </div>

                            <div
                                className="
                                    mt-4
                                    grid
                                    grid-cols-2
                                    gap-3
                                    min-[1280px]:max-[1537px]:gap-2.5
                                "
                            >
                                <PriorityFactor
                                    label="Impact"
                                    value={impact}
                                    badge
                                    badgeStyle={getImpactStyle(
                                        impact
                                    )}
                                />

                                <PriorityFactor
                                    label="Urgency"
                                    value={urgency}
                                    badge
                                    badgeStyle={getUrgencyStyle(
                                        urgency
                                    )}
                                />
                            </div>

                            {!isReviewed &&
                                selectedPriority && (
                                    <div
                                        className="
                                            mt-5
                                            rounded-lg
                                            border
                                            border-[#4C4CF9]/30
                                            bg-[#4C4CF9]/5
                                            px-4
                                            py-3.5
                                            min-[1280px]:max-[1365px]:mt-4
                                            min-[1280px]:max-[1365px]:px-3
                                            min-[1280px]:max-[1365px]:py-3
                                            min-[1366px]:max-[1537px]:mt-4
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
                                            Selected Priority
                                        </p>

                                        <div className="mt-2 flex items-center justify-between gap-3">
                                            <div className="flex min-w-0 items-center gap-2">
                                                <Pencil
                                                    size={15}
                                                    className="shrink-0 text-[#4C4CF9]"
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
                                                    {priorityLabel[
                                                        selectedPriority
                                                    ] ||
                                                        selectedPriority}
                                                </p>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={
                                                    openPriorityChange
                                                }
                                                disabled={
                                                    accepting ||
                                                    overriding ||
                                                    isReviewed
                                                }
                                                className="
                                                    shrink-0
                                                    text-xs
                                                    font-medium
                                                    text-[#4C4CF9]
                                                    hover:underline
                                                    disabled:cursor-not-allowed
                                                    disabled:opacity-50
                                                    min-[1280px]:max-[1365px]:text-[10px]
                                                    min-[1366px]:max-[1537px]:text-[11px]
                                                "
                                            >
                                                Change
                                            </button>
                                        </div>
                                    </div>
                                )}

                            <div
                                className="
                                    mt-5
                                    grid
                                    grid-cols-1
                                    gap-3
                                    border-t
                                    border-gray-200
                                    pt-4
                                    min-[500px]:grid-cols-2
                                    min-[1280px]:max-[1365px]:mt-4
                                    min-[1280px]:max-[1365px]:pt-3
                                    min-[1366px]:max-[1537px]:mt-4
                                    min-[1366px]:max-[1537px]:pt-3.5
                                "
                            >
                                <button
                                    type="button"
                                    onClick={
                                        handlePriorityAction
                                    }
                                    disabled={
                                        accepting ||
                                        overriding ||
                                        isReviewed
                                    }
                                    className={`
                                        flex
                                        h-10
                                        cursor-pointer
                                        items-center
                                        justify-center
                                        gap-2
                                        rounded-lg
                                        border
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
                                            selectedPriority
                                                ? "border-[#4C4CF9] bg-[#4C4CF9] text-white hover:bg-[#3f3fe0]"
                                                : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                                        }
                                        ${
                                            accepting ||
                                            overriding ||
                                            isReviewed
                                                ? "cursor-not-allowed opacity-50"
                                                : ""
                                        }
                                    `}
                                >
                                    <ClipboardCheck
                                        size={16}
                                        strokeWidth={2.2}
                                        className="
                                            min-[1280px]:max-[1365px]:size-[14px]
                                            min-[1366px]:max-[1537px]:size-[15px]
                                        "
                                    />

                                    {overriding
                                        ? "Overriding..."
                                        : selectedPriority
                                        ? "Override Priority"
                                        : "Choose Priority"}
                                </button>

                                <button
                                    type="button"
                                    onClick={
                                        openAcceptReview
                                    }
                                    disabled={
                                        accepting ||
                                        overriding ||
                                        isReviewed
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
                                        text-white
                                        transition
                                        min-[1280px]:max-[1365px]:h-9
                                        min-[1280px]:max-[1365px]:px-2.5
                                        min-[1280px]:max-[1365px]:text-[11px]
                                        min-[1366px]:max-[1537px]:h-9
                                        min-[1366px]:max-[1537px]:px-3
                                        min-[1366px]:max-[1537px]:text-xs
                                        ${
                                            accepting ||
                                            overriding ||
                                            isReviewed
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
                                        : "Accept Priority"}
                                </button>
                            </div>

                            {apiError && (
                                <div
                                    className="
                                        mt-4
                                        rounded-lg
                                        border
                                        border-red-200
                                        bg-red-50
                                        px-3
                                        py-2.5
                                    "
                                >
                                    <p className="text-xs font-medium text-red-700">
                                        {apiError}
                                    </p>
                                </div>
                            )}
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
                                {isReviewed
                                    ? "Review Details"
                                    : "Review Remarks"}
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
                                {isReviewed
                                    ? "Details of the Service Desk review and decision."
                                    : "Add remarks before confirming the priority assessment."}
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
                        {isReviewed ? (
                            <ReviewedDetails
                                reviewedBy={reviewedByName}
                                reviewedByUserCode={
                                    reviewedByUserCode
                                }
                                reviewedByDepartment={
                                    reviewedByDepartment
                                }
                                reviewedAt={
                                    reviewedAt
                                }
                                remarks={
                                    existingReviewRemarks
                                }
                            />
                        ) : (
                            <div
                                className="
                                    rounded-lg
                                    border
                                    border-gray-300
                                    bg-white
                                    p-4
                                    min-[1280px]:max-[1365px]:p-3
                                    min-[1366px]:max-[1537px]:p-3.5
                                "
                            >
                                <div className="flex items-center justify-between gap-3">
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
                                        Review Remarks
                                    </label>

                                    <span
                                        className={`
                                            text-[11px]
                                            font-medium
                                            ${
                                                isRemarksValid
                                                    ? "text-green-600"
                                                    : "text-gray-400"
                                            }
                                        `}
                                    >
                                        {remarksLength}/
                                        {
                                            MIN_REMARKS_LENGTH
                                        }{" "}
                                        minimum
                                    </span>
                                </div>

                                <textarea
                                    value={remarks}
                                    onChange={(event) => {
                                        setRemarks(
                                            event.target
                                                .value
                                        );
                                        setRemarksTouched(
                                            true
                                        );
                                    }}
                                    onBlur={() =>
                                        setRemarksTouched(
                                            true
                                        )
                                    }
                                    disabled={
                                        accepting ||
                                        overriding
                                    }
                                    rows={4}
                                    placeholder="Enter remarks for this priority assessment..."
                                    className={`
                                        mt-2
                                        w-full
                                        resize-none
                                        rounded-lg
                                        border
                                        px-3
                                        py-2.5
                                        text-sm
                                        text-black
                                        outline-none
                                        transition
                                        placeholder:text-gray-400
                                        focus:ring-2
                                        min-[1280px]:max-[1365px]:text-xs
                                        min-[1366px]:max-[1537px]:text-xs
                                        ${
                                            showRemarksError
                                                ? "border-red-400 focus:border-red-500 focus:ring-red-500/10"
                                                : isRemarksValid
                                                ? "border-green-400 focus:border-green-500 focus:ring-green-500/10"
                                                : "border-gray-300 focus:border-[#4C4CF9] focus:ring-[#4C4CF9]/10"
                                        }
                                    `}
                                />

                                {showRemarksError ? (
                                    <p className="mt-2 text-xs font-medium text-red-600">
                                        {remarksTooShort
                                            ? `Review remarks must be at least ${MIN_REMARKS_LENGTH} characters.`
                                            : "Review remarks are required."}
                                    </p>
                                ) : (
                                    <p className="mt-2 text-xs text-gray-500">
                                        Review remarks must contain at
                                        least{" "}
                                        {
                                            MIN_REMARKS_LENGTH
                                        }{" "}
                                        characters.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {!isReviewed && (
                    <div className="overflow-hidden rounded-xl border border-gray-300 bg-white">
                        <div
                            className="
                                flex
                                items-start
                                gap-2.5
                                border-b
                                border-blue-200
                                bg-blue-50
                                px-4
                                py-3
                                min-[1280px]:max-[1537px]:px-3
                                min-[1280px]:max-[1537px]:py-2.5
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
                                        min-[1280px]:max-[1537px]:text-xs
                                    "
                                >
                                    Priority Assessment Required
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
                                    This ticket was classified as a
                                    high-impact priority and requires Service
                                    Desk validation before assignment can
                                    continue.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {priorityModalOpen && (
                <PrioritySelectionModal
                    currentPriority={
                        currentPriority
                    }
                    selectedPriority={
                        selectedPriority
                    }
                    setSelectedPriority={
                        setSelectedPriority
                    }
                    onCancel={
                        closePriorityModal
                    }
                    onContinue={
                        continuePriorityOverride
                    }
                />
            )}

            {toast && (
                <div
                    className="
                        fixed
                        right-4
                        top-4
                        z-[100]
                        w-[calc(100%-2rem)]
                        max-w-sm
                    "
                >
                    <div
                        className={`
                            flex
                            items-start
                            gap-3
                            rounded-lg
                            border
                            px-4
                            py-3
                            shadow-lg
                            ${
                                toast.type ===
                                "success"
                                    ? "border-green-200 bg-green-50"
                                    : "border-red-200 bg-red-50"
                            }
                        `}
                    >
                        {toast.type ===
                        "success" ? (
                            <CheckCircle2
                                size={18}
                                className="mt-0.5 shrink-0 text-green-600"
                            />
                        ) : (
                            <CircleAlert
                                size={18}
                                className="mt-0.5 shrink-0 text-red-600"
                            />
                        )}

                        <div className="min-w-0 flex-1">
                            <p
                                className={`
                                    text-sm
                                    font-semibold
                                    ${
                                        toast.type ===
                                        "success"
                                            ? "text-green-800"
                                            : "text-red-800"
                                    }
                                `}
                            >
                                {toast.type ===
                                "success"
                                    ? "Success"
                                    : "Error"}
                            </p>

                            <p
                                className={`
                                    mt-0.5
                                    text-xs
                                    leading-5
                                    ${
                                        toast.type ===
                                        "success"
                                            ? "text-green-700"
                                            : "text-red-700"
                                    }
                                `}
                            >
                                {toast.message}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

function PrioritySelectionModal({
    currentPriority,
    selectedPriority,
    setSelectedPriority,
    onCancel,
    onContinue,
}) {
    const priorities = [
        "P1",
        "P2",
        "P3",
        "P4",
        "P5",
    ];

    const isSameAsCurrent =
        selectedPriority === currentPriority;

    return (
        <div
            className="
                fixed
                inset-0
                z-50
                flex
                items-center
                justify-center
                bg-black/40
                px-4
            "
        >
            <div
                className="
                    w-full
                    max-w-lg
                    overflow-hidden
                    rounded-xl
                    border
                    border-gray-200
                    bg-white
                    shadow-xl
                "
            >
                <div className="border-b border-gray-200 px-5 py-4">
                    <h3 className="text-base font-semibold text-black">
                        Select Priority
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-gray-500">
                        Select the priority you want to assign to this ticket.
                    </p>
                </div>

                <div className="p-5">
                    <div
                        className="
                            flex
                            items-center
                            justify-between
                            gap-3
                            rounded-lg
                            border
                            border-gray-300
                            bg-gray-50
                            px-4
                            py-3
                        "
                    >
                        <div>
                            <p className="text-[11px] font-medium uppercase text-gray-500">
                                Current Priority
                            </p>

                            <p className="mt-1 text-sm font-semibold text-black">
                                {currentPriority ||
                                    "-"}
                            </p>
                        </div>

                        <span
                            className={`
                                rounded-full
                                border
                                px-2.5
                                py-1
                                text-xs
                                font-semibold
                                ${getPriorityBadgeStyle(
                                    currentPriority
                                )}
                            `}
                        >
                            {priorityLabel[
                                currentPriority
                            ] ||
                                currentPriority ||
                                "-"}
                        </span>
                    </div>

                    <div className="mt-5">
                        <p className="mb-3 text-xs font-medium uppercase text-gray-500">
                            Choose New Priority
                        </p>

                        <div className="grid grid-cols-2 gap-3 min-[500px]:grid-cols-5">
                            {priorities.map(
                                (priority) => {
                                    const selected =
                                        selectedPriority ===
                                        priority;

                                    return (
                                        <button
                                            key={
                                                priority
                                            }
                                            type="button"
                                            onClick={() =>
                                                setSelectedPriority(
                                                    priority
                                                )
                                            }
                                            className={`
                                                flex
                                                min-h-[74px]
                                                cursor-pointer
                                                flex-col
                                                items-center
                                                justify-center
                                                rounded-lg
                                                border
                                                px-3
                                                py-3
                                                transition
                                                ${
                                                    selected
                                                        ? getPrioritySelectedStyle(
                                                              priority
                                                          )
                                                        : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                                                }
                                            `}
                                        >
                                            <span className="text-sm font-bold">
                                                {
                                                    priority
                                                }
                                            </span>

                                            <span className="mt-1 text-[11px] font-medium">
                                                {
                                                    priorityLabel[
                                                        priority
                                                    ]
                                                }
                                            </span>
                                        </button>
                                    );
                                }
                            )}
                        </div>
                    </div>

                    {isSameAsCurrent && (
                        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
                            <p className="text-xs font-medium text-amber-700">
                                This is already the current priority. Please
                                select a different priority to continue.
                            </p>
                        </div>
                    )}

                    {selectedPriority &&
                        !isSameAsCurrent && (
                            <div className="mt-4 rounded-lg border border-[#4C4CF9]/20 bg-[#4C4CF9]/5 px-4 py-3">
                                <p className="text-[11px] font-medium uppercase text-gray-500">
                                    New Priority
                                </p>

                                <div className="mt-1 flex items-center justify-between gap-3">
                                    <p className="text-sm font-semibold text-black">
                                        {
                                            selectedPriority
                                        }{" "}
                                        {
                                            priorityLabel[
                                                selectedPriority
                                            ]
                                        }
                                    </p>

                                    <span
                                        className={`
                                            rounded-full
                                            border
                                            px-2.5
                                            py-1
                                            text-xs
                                            font-semibold
                                            ${getPriorityBadgeStyle(
                                                selectedPriority
                                            )}
                                        `}
                                    >
                                        {
                                            selectedPriority
                                        }
                                    </span>
                                </div>
                            </div>
                        )}
                </div>

                <div
                    className="
                        flex
                        justify-end
                        gap-2
                        border-t
                        border-gray-200
                        px-5
                        py-4
                    "
                >
                    <button
                        type="button"
                        onClick={onCancel}
                        className="
                            rounded-lg
                            border
                            border-gray-300
                            bg-white
                            px-4
                            py-2
                            text-sm
                            font-medium
                            text-gray-700
                            transition
                            hover:bg-gray-50
                        "
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={onContinue}
                        disabled={
                            !selectedPriority ||
                            isSameAsCurrent
                        }
                        className="
                            rounded-lg
                            bg-[#4C4CF9]
                            px-4
                            py-2
                            text-sm
                            font-medium
                            text-white
                            transition
                            hover:bg-[#3f3fe0]
                            disabled:cursor-not-allowed
                            disabled:bg-gray-300
                        "
                    >
                        Continue
                    </button>
                </div>
            </div>
        </div>
    );
}

function ReviewedDetails({
    reviewedBy,
    reviewedByUserCode,
    reviewedByDepartment,
    reviewedAt,
    remarks,
}) {
    return (
        <div className="space-y-4">
            <div
                className="
                    grid
                    grid-cols-1
                    gap-3
                    min-[600px]:grid-cols-2
                "
            >
                <div
                    className="
                        p-4
                        min-[1280px]:max-[1537px]:p-3.5
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
                        Decision
                    </p>

                    <div className="mt-2 flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100">
                            <CheckCircle2
                                size={15}
                                className="text-green-600"
                            />
                        </div>

                        <p
                            className="
                                text-sm
                                font-semibold
                                text-green-700
                                min-[1280px]:max-[1537px]:text-xs
                            "
                        >
                            Resolved
                        </p>
                    </div>
                </div>

                <div
                    className="
                        p-4
                        min-[1280px]:max-[1537px]:p-3.5
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
                        Reviewed By
                    </p>

                    <div
                        className="
                            mt-3
                            flex
                            items-center
                            gap-3
                            min-[1280px]:max-[1365px]:mt-2
                            min-[1280px]:max-[1365px]:gap-2.5
                            min-[1366px]:max-[1537px]:mt-2.5
                            min-[1366px]:max-[1537px]:gap-2.5
                        "
                    >
                        <Avatar name={reviewedBy} />

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
                                {reviewedBy || "-"}
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
                                {reviewedByUserCode || "-"}
                                {reviewedByDepartment
                                    ? ` • ${reviewedByDepartment}`
                                    : ""}
                            </p>
                        </div>
                    </div>
                </div>

                <div
                    className="
                        p-4
                        min-[1280px]:max-[1537px]:p-3.5
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
                        Reviewed At
                    </p>

                    <p
                        className="
                            mt-2
                            text-sm
                            font-medium
                            text-black
                            min-[1280px]:max-[1537px]:text-xs
                        "
                    >
                        {reviewedAt
                            ? formatDate(
                                  reviewedAt
                              )
                            : "-"}
                    </p>
                </div>
            </div>

            <div
                className="
                    rounded-lg
                    border
                    border-gray-300
                    bg-white
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
                    Review Remarks
                </p>

                <div
                    className="
                        mt-2
                        whitespace-pre-wrap
                        rounded-lg
                        border
                        border-gray-200
                        bg-gray-50
                        px-3
                        py-3
                        text-sm
                        leading-6
                        text-gray-700
                        min-[1280px]:max-[1537px]:text-xs
                        min-[1280px]:max-[1537px]:leading-5
                    "
                >
                    {remarks || "-"}
                </div>
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

function UserCard({
    label,
    user,
    value,
}) {
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
                    min-[1280px]:max-[1365px]:gap-2.5
                    min-[1366px]:max-[1537px]:mt-2.5
                    min-[1366px]:max-[1537px]:gap-2.5
                "
            >
                <Avatar name={user?.name} />

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
                        {user?.name || "-"}
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
                        {user?.userCode || "-"}
                        {user?.department
                            ? ` • ${user.department}`
                            : ""}
                    </p>
                </div>
            </div>
        </div>
    );
}

function Avatar({ name }) {
    const initials = getInitials(name);

    return (
        <div
            className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-[#4C4CF9]/10
                text-xs
                font-semibold
                text-[#4C4CF9]
                min-[1280px]:max-[1365px]:h-8
                min-[1280px]:max-[1365px]:w-8
                min-[1280px]:max-[1365px]:text-[10px]
                min-[1366px]:max-[1537px]:h-8
                min-[1366px]:max-[1537px]:w-8
                min-[1366px]:max-[1537px]:text-[11px]
            "
        >
            {initials}
        </div>
    );
}

function PriorityFactor({
    label,
    value,
    badge = false,
    badgeStyle = "",
    badgeRounded = "rounded-full",
}) {
    return (
        <div
            className="
                rounded-lg
                border
                border-gray-300
                bg-white
                p-3
                min-[1280px]:max-[1365px]:p-2.5
                min-[1366px]:max-[1537px]:p-3
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
                {label}
            </p>

            {badge ? (
                <span
                    className={`
                        mt-2
                        inline-flex
                        ${badgeRounded}
                        border
                        px-2.5
                        py-1
                        text-xs
                        font-semibold
                        ${badgeStyle}
                        min-[1280px]:max-[1365px]:px-2
                        min-[1280px]:max-[1365px]:py-0.5
                        min-[1280px]:max-[1365px]:text-[10px]
                        min-[1366px]:max-[1537px]:px-2
                        min-[1366px]:max-[1537px]:py-0.5
                        min-[1366px]:max-[1537px]:text-[11px]
                    `}
                >
                    {value || "-"}
                </span>
            ) : (
                <p
                    className="
                        mt-2
                        text-sm
                        font-semibold
                        text-black
                        min-[1280px]:max-[1365px]:text-xs
                        min-[1366px]:max-[1537px]:text-xs
                    "
                >
                    {value || "-"}
                </p>
            )}
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

function getReviewerName(reviewer) {
    if (!reviewer) {
        return "";
    }

    if (typeof reviewer === "string") {
        return reviewer;
    }

    const fullName =
        `${reviewer.first_name || ""} ${reviewer.last_name || ""}`.trim();

    return (
        fullName ||
        reviewer.name ||
        reviewer.username ||
        reviewer.user_code ||
        ""
    );
}

function getReviewerDepartment(reviewer) {
    if (!reviewer || typeof reviewer !== "object") {
        return "";
    }

    if (typeof reviewer.department === "string") {
        return reviewer.department;
    }

    if (typeof reviewer.department_name === "string") {
        return reviewer.department_name;
    }

    if (
        reviewer.department &&
        typeof reviewer.department === "object"
    ) {
        return (
            reviewer.department.name ||
            reviewer.department.department_name ||
            ""
        );
    }

    return "";
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

function formatReason(reason = "") {
    if (!reason) {
        return "Priority Assessment";
    }

    if (reason === "priority_assessment") {
        return "Priority Assessment";
    }

    return reason
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) =>
            char.toUpperCase()
        );
}

function getStatusStyle(status = "") {
    switch (status.toLowerCase()) {
        case "pending":
            return "border-amber-300 bg-amber-50 text-amber-700";

        case "approved":
            return "border-green-300 bg-green-50 text-green-700";

        case "resolved":
            return "border-green-300 bg-green-50 text-green-700";

        case "reviewed":
            return "border-green-300 bg-green-50 text-green-700";

        case "rejected":
            return "border-red-300 bg-red-50 text-red-700";

        default:
            return "border-gray-300 bg-gray-100 text-gray-700";
    }
}

function formatAffectedScope(scope = "") {
    return (
        affectedScopeLabel[scope] ||
        scope ||
        "-"
    );
}

function formatBoolean(value) {
    if (value === true) {
        return "Yes";
    }

    if (value === false) {
        return "No";
    }

    return "-";
}

function getImpact(scope = "") {
    switch (scope) {
        case "individual":
            return "Low";

        case "group":
            return "Medium";

        case "department":
            return "High";

        case "organization_wide":
            return "Critical";

        default:
            return "-";
    }
}

function getUrgency(
    businessCritical,
    timeCritical
) {
    if (
        businessCritical &&
        timeCritical
    ) {
        return "High";
    }

    if (
        businessCritical ||
        timeCritical
    ) {
        return "Medium";
    }

    if (
        businessCritical === false &&
        timeCritical === false
    ) {
        return "Low";
    }

    return "-";
}

function getPriorityBadgeStyle(
    priority = ""
) {
    const color =
        priorityColor[priority];

    if (color) {
        return `${color} rounded-md`;
    }

    return "border-gray-300 bg-gray-100 text-gray-700 rounded-md";
}

function getPrioritySelectedStyle(
    priority = ""
) {
    const color =
        priorityColor[priority];

    if (color) {
        return `${color} ring-2 ring-[#4C4CF9]/20`;
    }

    return "border-[#4C4CF9] bg-[#4C4CF9]/5 text-[#4C4CF9] ring-2 ring-[#4C4CF9]/20";
}

function getImpactStyle(impact = "") {
    switch (
        String(impact || "").toLowerCase()
    ) {
        case "critical":
            return "border-red-300 bg-red-50 text-red-700 rounded-md";

        case "high":
            return "border-orange-300 bg-orange-50 text-orange-700 rounded-md";

        case "medium":
            return "border-yellow-300 bg-yellow-50 text-yellow-700 rounded-md";

        case "low":
            return "border-blue-300 bg-blue-50 text-blue-700 rounded-md";

        default:
            return "border-gray-300 bg-gray-100 text-gray-700 rounded-md";
    }
}

function getUrgencyStyle(urgency = "") {
    switch (
        String(urgency || "").toLowerCase()
    ) {
        case "high":
            return "border-red-300 bg-red-50 text-red-700 rounded-md";

        case "medium":
            return "border-orange-300 bg-orange-50 text-orange-700 rounded-md";

        case "low":
            return "border-green-300 bg-green-50 text-green-700 rounded-md";

        default:
            return "border-gray-300 bg-gray-100 text-gray-700 rounded-md";
    }
}