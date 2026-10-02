
import Sidebar from "../components/Sidebar";
import { getCurrentUser } from "../utils/auth";
import api from "../api";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    Users,
    Workflow,
    RotateCcw,
    X,
    Info,
    MessageSquareText,
} from "lucide-react";
import { toast } from "sonner";
import TopBar from "../components/Topbar";

import TicketDetailsEmployee from "../components/TicketDetailsEmployee";
import TicketDetailsSupport from "../components/TicketDetailsSupport";
import TicketDetailsServiceDesk from "../components/TicketDetailsServiceDesk";
import SupervisorTicketDetails from "./SupervisorTicketDetails";

import ManageTicketDropdown from "../components/ManageTickets/ManageTicketDropdown";
import RequestPriorityModal from "../components/ManageTickets/RequestPriorityModal";
import ReturnTicketModal from "../components/ManageTickets/ReturnTicketModal";
import EscalateTicketModal from "../components/ManageTickets/EscalateTicketModal";
import RequestAssistanceModal from "../components/ManageTickets/RequestAssistanceModal";
import AutomatedProcessingModal from "../components/AutomatedProcessingModal";
import AssistanceRequestModal from "../components/AssistanceRequestModal";
import ReopenRequestModal from "../components/ReopenRequestModal";

const getFieldValue = (value) => {
    if (value && typeof value === "object") {
        return value.id ?? value.value ?? "";
    }
    return value ?? "";
};

const getFieldLabel = (value) => {
    if (value && typeof value === "object") {
        return value.name ?? value.label ?? value.code ?? String(value.id ?? "");
    }
    return value ?? "";
};

export default function TicketDetails() {
    const user = getCurrentUser();

    const [assistanceModalOpen, setAssistanceModalOpen] = useState(false);
    const [assistanceDetailsModalOpen, setAssistanceDetailsModalOpen] = useState(false);
    const [priorityModalOpen, setPriorityModalOpen] = useState(false);
    const [returnModalOpen, setReturnModalOpen] = useState(false);
    const [automatedModalOpen, setAutomatedModalOpen] = useState(false);
    const [escalateModalOpen, setEscalateModalOpen] = useState(false);

    const [reopenRequestModalOpen, setReopenRequestModalOpen] = useState(false);
    const [reopenDetailsModalOpen, setReopenDetailsModalOpen] = useState(false);
    const [reopenReason, setReopenReason] = useState("");
    const [submittingReopenRequest, setSubmittingReopenRequest] = useState(false);
    const [reviewingReopenRequest, setReviewingReopenRequest] = useState(false);

    const [ticketDetails, setTicketDetails] = useState(null);
    const [automationData, setAutomationData] = useState(null);

    const [locallyAssisting, setLocallyAssisting] = useState(false);
    const [acceptingAssistance, setAcceptingAssistance] = useState(false);
    const [cancellingAssistance, setCancellingAssistance] = useState(false);
    const [completingAssistance, setCompletingAssistance] = useState(false);
    const [assistanceActionError, setAssistanceActionError] = useState("");

    const [pendingClarification, setPendingClarification] = useState(null);
    const [clarificationModalOpen, setClarificationModalOpen] = useState(false);
    const [clarificationForm, setClarificationForm] = useState({
        workstation: "",
        subject: "",
        description: "",
        business_impact: "",
        affected_scope: "",
    });
    const [submittingClarification, setSubmittingClarification] = useState(false);
    const [clarificationErrors, setClarificationErrors] = useState({});
    const [clarificationCheckComplete, setClarificationCheckComplete] = useState(false);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const { ticketId } = useParams();
    const navigate = useNavigate();

    const fetchTicketDetails = async () => {
        try {
            setError("");

            let endpoint;

            if (user?.role === "Employee") {
                endpoint = `/tickets/employee/detail/${ticketId}/`;
            } else if (user?.role === "IT Service Desk") {
                endpoint = `/tickets/service-desk/detail/${ticketId}/`;
            } else if (user?.role === "IT Support Specialist") {
                endpoint = `/tickets/support/detail/${ticketId}/`;
            } else if (user?.role === "IT Supervisor") {
                endpoint = `/tickets/supervisor/detail/${ticketId}/`;
            } else {
                setError("Access Denied / Invalid Role");
                return null;
            }

            const response = await api.get(endpoint);
            setTicketDetails(response.data);
            setAutomationData(response.data?.automation || null);
            return response.data;
        } catch (error) {
            setError(
                error.response?.data?.error ||
                "Failed to load ticket details."
            );
            return null;
        }
    };

    const fetchPendingClarification = async (currentTicketId, details) => {
        if (user?.role !== "Employee" || !currentTicketId) {
            setPendingClarification(null);
            setClarificationModalOpen(false);
            setClarificationCheckComplete(true);
            return;
        }

        try {
            setClarificationCheckComplete(false);

            const response = await api.get(
                "/tickets/clarification-requests/pending/"
            );

            const data = response.data;
            const pendingTicketId = data?.ticket?.id;

            if (
                data?.pending === true &&
                Number(pendingTicketId) === Number(currentTicketId)
            ) {
                setPendingClarification(data.ticket);

                setClarificationForm({
                    workstation: String(getFieldValue(details?.workstation)),
                    subject: details?.subject || "",
                    description: details?.description || "",
                    business_impact: details?.business_impact || "",
                    affected_scope: "",
                });

                setClarificationErrors({});
                setClarificationModalOpen(true);
            } else {
                setPendingClarification(null);
                setClarificationModalOpen(false);
            }
        } catch (error) {
            console.error("Failed to check pending clarification:", error);
            setPendingClarification(null);
            setClarificationModalOpen(false);
        } finally {
            setClarificationCheckComplete(true);
        }
    };

    const handleClarificationFieldChange = (event) => {
        const { name, value } = event.target;

        setClarificationForm((previous) => ({
            ...previous,
            [name]: value,
        }));

        setClarificationErrors((previous) => ({
            ...previous,
            [name]: "",
            non_field_errors: "",
        }));
    };

    const validateClarificationForm = () => {
        const errors = {};
        const subject = clarificationForm.subject.trim();
        const description = clarificationForm.description.trim();
        const businessImpact = clarificationForm.business_impact.trim();

        if (subject.length < 15) {
            errors.subject = "Subject must be at least 15 characters.";
        } else if (subject.length > 100) {
            errors.subject = "Subject cannot exceed 100 characters.";
        }

        if (description.length < 50) {
            errors.description = "Description must be at least 50 characters.";
        } else if (description.length > 750) {
            errors.description = "Description cannot exceed 750 characters.";
        }

        if (businessImpact.length < 20) {
            errors.business_impact = "Business Impact must be at least 20 characters.";
        } else if (businessImpact.length > 500) {
            errors.business_impact = "Business Impact cannot exceed 500 characters.";
        }

        if (!clarificationForm.affected_scope.trim()) {
            errors.affected_scope = "Affected Scope is required.";
        }

        setClarificationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmitClarification = async (event) => {
        event.preventDefault();

        if (!validateClarificationForm()) {
            toast.error("Please correct the highlighted fields.");
            return;
        }

        try {
            setSubmittingClarification(true);
            setClarificationErrors({});

            const payload = {
                workstation: clarificationForm.workstation || null,
                subject: clarificationForm.subject.trim(),
                description: clarificationForm.description.trim(),
                business_impact: clarificationForm.business_impact.trim(),
                affected_scope: clarificationForm.affected_scope,
            };

            const response = await api.post(
                `/tickets/flagged/${ticketId}/resubmit/`,
                payload
            );

            const message =
                response.data?.message || "Ticket resubmitted successfully.";

            toast.success(message);

            const refreshedTicket = await fetchTicketDetails();
            const responseMessage = String(response.data?.message || "").toLowerCase();
            const stillNeedsClarification =
                responseMessage.includes("further clarification") ||
                responseMessage.includes("still needs more information");

            if (stillNeedsClarification) {
                setPendingClarification({
                    id: Number(ticketId),
                    ticket_code:
                        response.data?.ticket_code ||
                        pendingClarification?.ticket_code,
                    subject: clarificationForm.subject.trim(),
                });
                setClarificationModalOpen(true);

                if (refreshedTicket) {
                    setClarificationForm((previous) => ({
                        ...previous,
                        workstation: String(
                            getFieldValue(refreshedTicket.workstation)
                        ),
                        subject: refreshedTicket.subject || previous.subject,
                        description: refreshedTicket.description || previous.description,
                        business_impact:
                            refreshedTicket.business_impact || previous.business_impact,
                        affected_scope: "",
                    }));
                } else {
                    setClarificationForm((previous) => ({
                        ...previous,
                        affected_scope: "",
                    }));
                }
            } else {
                setPendingClarification(null);
                setClarificationModalOpen(false);
            }
        } catch (error) {
            const responseData = error.response?.data;

            if (responseData && typeof responseData === "object") {
                const fieldErrors = {};

                Object.entries(responseData).forEach(([key, value]) => {
                    fieldErrors[key] = Array.isArray(value)
                        ? value.join(" ")
                        : typeof value === "string"
                            ? value
                            : JSON.stringify(value);
                });

                setClarificationErrors(fieldErrors);
            }

            toast.error(
                responseData?.message ||
                responseData?.detail ||
                responseData?.error ||
                "Failed to resubmit the ticket."
            );
        } finally {
            setSubmittingClarification(false);
        }
    };

    const handleSubmitReopenRequest = async () => {
        const reason = reopenReason.trim();

        if (reason.length < 10) {
            toast.error("Please provide a reason with at least 10 characters.");
            return;
        }

        if (reason.length > 1000) {
            toast.error("The reason cannot exceed 1000 characters.");
            return;
        }

        try {
            setSubmittingReopenRequest(true);

            const response = await api.post(
                `/tickets/${ticketId}/reopen-request/`,
                { reason }
            );

            toast.success(
                response.data?.message || "Reopen request submitted successfully."
            );

            setReopenRequestModalOpen(false);
            setReopenReason("");

            await fetchTicketDetails();
        } catch (error) {
            console.error("Error submitting reopen request:", error);

            toast.error(
                error.response?.data?.error ||
                error.response?.data?.detail ||
                error.response?.data?.message ||
                "Failed to submit the reopen request."
            );
        } finally {
            setSubmittingReopenRequest(false);
        }
    };

    const handleReviewReopenRequest = async (requestId, decision, reviewRemarks) => {
        if (!requestId) {
            toast.error("Reopen request not found.");
            return;
        }

        if (decision === "rejected" && !reviewRemarks.trim()) {
            toast.error("Please provide a reason for rejecting this request.");
            return;
        }

        try {
            setReviewingReopenRequest(true);

            const response = await api.post(
                `/tickets/reopen-requests/${requestId}/review/`,
                {
                    decision,
                    review_remarks: reviewRemarks.trim(),
                }
            );

            toast.success(
                response.data?.message || "Reopen request reviewed successfully."
            );

            await fetchTicketDetails();
            setReopenDetailsModalOpen(false);
        } catch (error) {
            toast.error(
                error.response?.data?.error ||
                error.response?.data?.detail ||
                error.response?.data?.message ||
                "Failed to review the reopen request."
            );
        } finally {
            setReviewingReopenRequest(false);
        }
    };

    const handleAcceptAssistance = async (requestId) => {
        if (!requestId) {
            setAssistanceActionError("No pending assistance request was found.");
            return;
        }

        try {
            setAcceptingAssistance(true);
            setAssistanceActionError("");

            await api.post(`/tickets/assistance/request/${requestId}/accept/`);

            setLocallyAssisting(true);
            await fetchTicketDetails();
            setAssistanceDetailsModalOpen(true);
        } catch (error) {
            setAssistanceActionError(
                error.response?.data?.message ||
                error.response?.data?.error ||
                "Failed to accept the assistance request."
            );
        } finally {
            setAcceptingAssistance(false);
        }
    };

    const handleCancelAssistanceRequest = async (requestId) => {
        if (!requestId) {
            setAssistanceActionError("Invalid assistance request.");
            return;
        }

        try {
            setCancellingAssistance(true);
            setAssistanceActionError("");

            await api.post(`/tickets/assistance/request/${requestId}/cancel/`);

            await fetchTicketDetails();
            setAssistanceDetailsModalOpen(true);
        } catch (error) {
            setAssistanceActionError(
                error.response?.data?.message ||
                error.response?.data?.error ||
                "Failed to cancel the assistance request."
            );
        } finally {
            setCancellingAssistance(false);
        }
    };

    const handleCompleteAssistance = async (note) => {
        const assistanceId = ticketDetails?.my_assistance?.id;

        if (!assistanceId) {
            setAssistanceActionError("Your assistance record could not be found.");
            return;
        }

        try {
            setCompletingAssistance(true);
            setAssistanceActionError("");

            await api.post(`/tickets/assistance/${assistanceId}/complete/`, {
                assisted_note: note,
            });

            setLocallyAssisting(false);
            await fetchTicketDetails();
            setAssistanceDetailsModalOpen(true);
        } catch (error) {
            setAssistanceActionError(
                error.response?.data?.message ||
                error.response?.data?.error ||
                "Failed to complete your assistance."
            );
        } finally {
            setCompletingAssistance(false);
        }
    };

    useEffect(() => {
        let cancelled = false;

        const loadTicketDetails = async () => {
            try {
                setLoading(true);
                setClarificationCheckComplete(false);

                const details = await fetchTicketDetails();

                if (!cancelled && user?.role === "Employee" && details) {
                    await fetchPendingClarification(ticketId, details);
                } else if (!cancelled) {
                    setPendingClarification(null);
                    setClarificationModalOpen(false);
                    setClarificationCheckComplete(true);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        if (user?.role && ticketId) {
            loadTicketDetails();
        }

        return () => {
            cancelled = true;
        };
    }, [ticketId, user?.role]);

    useEffect(() => {
        setLocallyAssisting(false);
        setAssistanceDetailsModalOpen(false);
        setAssistanceActionError("");
        setCancellingAssistance(false);
        setCompletingAssistance(false);
        setReopenRequestModalOpen(false);
        setReopenDetailsModalOpen(false);
        setReopenReason("");
        setPendingClarification(null);
        setClarificationModalOpen(false);
        setClarificationErrors({});
        setClarificationCheckComplete(false);
    }, [ticketId]);

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-gray-50">
                <p className="text-sm text-gray-500">Loading ticket details...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-screen w-full min-w-0 overflow-hidden bg-gray-50">
                <Sidebar />
                <div className="flex h-screen min-w-0 flex-1 flex-col">
                    <TopBar />
                    <main className="flex min-h-0 min-w-0 flex-1 flex-col p-4">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="mb-3 flex w-fit items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-black min-[1280px]:max-[1535px]:gap-1 min-[1280px]:max-[1535px]:text-[13px]"
                        >
                            <ArrowLeft size={16} />
                            Back to Tickets
                        </button>
                        <div className="flex min-h-0 min-w-0 flex-1 items-center justify-center">
                            <p className="text-sm text-gray-500">{error}</p>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    const isAssignedSupport =
        user?.role === "IT Support Specialist" &&
        Number(ticketDetails?.assigned_to?.id) === Number(user?.user_id);

    const backendIsAssisting = ticketDetails?.is_assisting === true;
    const isAssisting = backendIsAssisting || locallyAssisting;
    const isSupervisor = user?.role === "IT Supervisor";

    const assistanceRequests = Array.isArray(ticketDetails?.assistance_requests)
        ? ticketDetails.assistance_requests
        : [];

    const hasPendingAssistanceForMyDepartment =
        ticketDetails?.has_pending_assistance_request === true;

    const canAcceptAssistance = ticketDetails?.can_accept_assistance === true;
    const pendingAssistanceRequestId =
        ticketDetails?.pending_assistance_request_id || null;

    const currentAssisting = Array.isArray(ticketDetails?.current_assisting)
        ? ticketDetails.current_assisting
        : [];

    const ongoingAssistanceCount = currentAssisting.filter(
        (person) =>
            String(person?.status || "").trim().toLowerCase() === "ongoing"
    ).length;

    const hasOngoingAssistance = ongoingAssistanceCount > 0;
    const hasMyAssistance = Boolean(ticketDetails?.my_assistance);

    const canViewAutomatedDetails =
        user?.role === "IT Service Desk" ||
        user?.role === "IT Support Specialist" ||
        user?.role === "IT Supervisor";

    const canUseTicketActions = isAssignedSupport || isSupervisor;

    const showAssistanceDetails =
        user?.role === "IT Support Specialist" &&
        (
            isAssignedSupport ||
            isAssisting ||
            hasPendingAssistanceForMyDepartment ||
            hasMyAssistance
        );

    const canEditAssistance =
        user?.role === "IT Support Specialist" &&
        isAssisting &&
        !isAssignedSupport;

    const ticketStatus = String(ticketDetails?.status ?? "").toUpperCase();

    const latestReopenRequest = ticketDetails?.latest_reopen_request || null;
    const reopenRequestStatus = String(latestReopenRequest?.status || "").toLowerCase();
    const hasPendingReopenRequest = reopenRequestStatus === "pending";

    const canRequestReopen =
        user?.role === "Employee" &&
        ticketStatus === "RESOLVED" &&
        !hasPendingReopenRequest &&
        ticketDetails?.has_pending_reopen_request !== true;

    const canViewReopenDetails =
        (user?.role === "Employee" ||
            user?.role === "IT Support Specialist") &&
        Boolean(latestReopenRequest);

    let MainContent;

    if (user?.role === "Employee") {
        MainContent = <TicketDetailsEmployee ticketDetails={ticketDetails} />;
    } else if (user?.role === "IT Service Desk") {
        MainContent = <TicketDetailsServiceDesk ticketDetails={ticketDetails} />;
    } else if (user?.role === "IT Support Specialist") {
        MainContent = (
            <TicketDetailsSupport
                ticketDetails={ticketDetails}
                onTicketUpdated={fetchTicketDetails}
                isAssisting={isAssisting || hasMyAssistance}
                onAssistanceAccepted={() => setLocallyAssisting(true)}
            />
        );
    } else if (user?.role === "IT Supervisor") {
        MainContent = (
            <SupervisorTicketDetails
                ticketDetails={ticketDetails}
                onTicketUpdated={fetchTicketDetails}
            />
        );
    } else {
        MainContent = <div className="p-6">Access Denied / Invalid Role</div>;
    }

    const workstationLabel = getFieldLabel(ticketDetails?.workstation);
    const affectedScopeLabel = getFieldLabel(ticketDetails?.affected_scope);

    return (
        <div className="flex h-screen w-full min-w-0 overflow-hidden bg-gray-50">
            <Sidebar />

            <div className="flex h-screen min-w-0 flex-1 flex-col">
                <TopBar />

                <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto p-4 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-gray-300">
                    <div className="mb-3 flex min-h-9 shrink-0 items-center justify-between gap-3 min-[1280px]:max-[1535px]:mb-2 min-[1280px]:max-[1535px]:min-h-8">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="flex shrink-0 items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-black min-[1280px]:max-[1535px]:gap-1 min-[1280px]:max-[1535px]:text-[13px]"
                        >
                            <ArrowLeft size={16} className="min-[1280px]:max-[1535px]:h-[14px] min-[1280px]:max-[1535px]:w-[14px]" />
                            Back to Tickets
                        </button>

                        <div className="flex min-w-0 items-center gap-2 min-[1280px]:max-[1535px]:gap-1.5">
                            {canRequestReopen && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setReopenReason("");
                                        setReopenRequestModalOpen(true);
                                    }}
                                    className="flex h-9 shrink-0 cursor-pointer items-center gap-2 rounded-lg bg-[#4C4CF9] px-3.5 text-sm font-medium text-white transition-colors hover:bg-[#3D3DE5] focus:outline-none focus:ring-2 focus:ring-[#4C4CF9]/30 min-[1280px]:max-[1535px]:h-8 min-[1280px]:max-[1535px]:gap-1.5 min-[1280px]:max-[1535px]:rounded-md min-[1280px]:max-[1535px]:px-3 min-[1280px]:max-[1535px]:text-[13px]"
                                >
                                    <RotateCcw size={16} className="min-[1280px]:max-[1535px]:h-[14px] min-[1280px]:max-[1535px]:w-[14px]" />
                                    <span>Reopen Request</span>
                                </button>
                            )}

                            {canViewReopenDetails && (
                                <button
                                    type="button"
                                    onClick={() => setReopenDetailsModalOpen(true)}
                                    className="flex h-9 shrink-0 cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-white px-3.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#4C4CF9]/20 min-[1280px]:max-[1535px]:h-8 min-[1280px]:max-[1535px]:gap-1.5 min-[1280px]:max-[1535px]:rounded-md min-[1280px]:max-[1535px]:px-3 min-[1280px]:max-[1535px]:text-[13px]"
                                >
                                    <RotateCcw size={16} className="text-[#4C4CF9] min-[1280px]:max-[1535px]:h-[14px] min-[1280px]:max-[1535px]:w-[14px]" />
                                    <span>Reopen Details</span>
                                </button>
                            )}

                            {showAssistanceDetails && (
                                <>
                                    {hasOngoingAssistance && (
                                        <div className="flex h-9 shrink-0 items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 text-xs font-semibold text-blue-700 min-[1280px]:max-[1535px]:h-8 min-[1280px]:max-[1535px]:gap-1.5 min-[1280px]:max-[1535px]:rounded-md min-[1280px]:max-[1535px]:px-2.5 min-[1280px]:max-[1535px]:text-[12px]">
                                            <Users size={15} className="shrink-0 text-blue-600" />
                                            <span>Assistance in Progress</span>
                                            <span className="text-blue-400">·</span>
                                            <span>{ongoingAssistanceCount} IT Support</span>
                                        </div>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setAssistanceActionError("");
                                            setAssistanceDetailsModalOpen(true);
                                        }}
                                        className="flex h-9 shrink-0 cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-white px-3.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 min-[1280px]:max-[1535px]:h-8 min-[1280px]:max-[1535px]:gap-1.5 min-[1280px]:max-[1535px]:rounded-md min-[1280px]:max-[1535px]:px-3 min-[1280px]:max-[1535px]:text-[13px]"
                                    >
                                        <Users size={16} className="text-[#2563EB] min-[1280px]:max-[1535px]:h-[14px] min-[1280px]:max-[1535px]:w-[14px]" />
                                        <span className="hidden sm:inline">Assistance Details</span>
                                    </button>
                                </>
                            )}

                            {canViewAutomatedDetails && (
                                <button
                                    type="button"
                                    onClick={() => setAutomatedModalOpen(true)}
                                    className="flex h-9 shrink-0 cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-white px-3.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 min-[1280px]:max-[1535px]:h-8 min-[1280px]:max-[1535px]:gap-1.5 min-[1280px]:max-[1535px]:rounded-md min-[1280px]:max-[1535px]:px-3 min-[1280px]:max-[1535px]:text-[13px]"
                                >
                                    <Workflow size={16} className="text-[#2563EB] min-[1280px]:max-[1535px]:h-[14px] min-[1280px]:max-[1535px]:w-[14px]" />
                                    <span className="hidden sm:inline">Automated Details</span>
                                </button>
                            )}

                            {canUseTicketActions && (
                                <ManageTicketDropdown
                                    role={user?.role}
                                    onPriorityRequest={() => setPriorityModalOpen(true)}
                                    onReturnTicket={() => setReturnModalOpen(true)}
                                    onRequestAssistance={() => setAssistanceModalOpen(true)}
                                    onEscalateTicket={
                                        isAssignedSupport
                                            ? () => setEscalateModalOpen(true)
                                            : undefined
                                    }
                                />
                            )}
                        </div>
                    </div>

                    <div className="min-h-0 min-w-0 flex-1">
                        {MainContent}
                    </div>
                </main>
            </div>

            {/* Employee clarification modal */}
            {user?.role === "Employee" && clarificationModalOpen && pendingClarification && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-black/50 p-3 sm:p-5">
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="clarification-title"
                        className="my-auto max-h-[95vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
                    >
                        <div className="flex items-start justify-between gap-3 border-b border-gray-200 px-5 py-4 sm:px-6">
                            <div className="flex min-w-0 items-start gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                                    <MessageSquareText size={22} />
                                </div>
                                <div className="min-w-0">
                                    <h2 id="clarification-title" className="text-lg font-semibold text-gray-900">
                                        Provide More Details
                                    </h2>
                                    <p className="mt-1 text-sm leading-5 text-gray-500">
                                        The Service Desk needs more information before your ticket can continue.
                                    </p>
                                    <p className="mt-1 text-xs font-medium text-gray-500">
                                        {pendingClarification.ticket_code || ticketDetails?.ticket_code || `Ticket #${ticketId}`}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setClarificationModalOpen(false)}
                                disabled={submittingClarification}
                                className="shrink-0 rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
                                aria-label="Close clarification modal"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitClarification}>
                            <div className="space-y-4 px-5 py-5 sm:px-6">
                                <div className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-3 text-sm leading-5 text-amber-800">
                                    <Info size={18} className="mt-0.5 shrink-0" />
                                    <p>
                                        Review the existing information and add enough detail to help the IT Service Desk understand the issue and its impact.
                                    </p>
                                </div>

                                <div>
                                    <label htmlFor="clarification-workstation" className="mb-1.5 block text-sm font-medium text-gray-800">
                                        Workstation
                                    </label>
                                    <input
                                        id="clarification-workstation"
                                        name="workstation"
                                        type="text"
                                        value={clarificationForm.workstation}
                                        onChange={handleClarificationFieldChange}
                                        disabled={submittingClarification}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#4C4CF9] focus:ring-2 focus:ring-[#4C4CF9]/15 disabled:bg-gray-100"
                                        placeholder="Enter workstation or asset identifier"
                                    />
                                    {clarificationErrors.workstation && (
                                        <p className="mt-1 text-xs text-red-600">{clarificationErrors.workstation}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="clarification-subject" className="mb-1.5 block text-sm font-medium text-gray-800">
                                        Subject <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="clarification-subject"
                                        name="subject"
                                        type="text"
                                        maxLength={100}
                                        required
                                        value={clarificationForm.subject}
                                        onChange={handleClarificationFieldChange}
                                        disabled={submittingClarification}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#4C4CF9] focus:ring-2 focus:ring-[#4C4CF9]/15 disabled:bg-gray-100"
                                    />
                                    <p className="mt-1 text-right text-xs text-gray-400">
                                        {clarificationForm.subject.trim().length}/100 characters · minimum 15
                                    </p>
                                    {clarificationErrors.subject && (
                                        <p className="mt-1 text-xs text-red-600">{clarificationErrors.subject}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="clarification-description" className="mb-1.5 block text-sm font-medium text-gray-800">
                                        Description <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        id="clarification-description"
                                        name="description"
                                        rows={4}
                                        maxLength={750}
                                        required
                                        value={clarificationForm.description}
                                        onChange={handleClarificationFieldChange}
                                        disabled={submittingClarification}
                                        placeholder="Describe what happened, when it started, any error messages, and what you have already tried."
                                        className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#4C4CF9] focus:ring-2 focus:ring-[#4C4CF9]/15 disabled:bg-gray-100"
                                    />
                                    <p className="mt-1 text-right text-xs text-gray-400">
                                        {clarificationForm.description.trim().length}/750 characters · minimum 50
                                    </p>
                                    {clarificationErrors.description && (
                                        <p className="mt-1 text-xs text-red-600">{clarificationErrors.description}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="clarification-impact" className="mb-1.5 block text-sm font-medium text-gray-800">
                                        Business Impact <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        id="clarification-impact"
                                        name="business_impact"
                                        rows={3}
                                        maxLength={500}
                                        required
                                        value={clarificationForm.business_impact}
                                        onChange={handleClarificationFieldChange}
                                        disabled={submittingClarification}
                                        placeholder="Explain which work or business activities are affected."
                                        className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#4C4CF9] focus:ring-2 focus:ring-[#4C4CF9]/15 disabled:bg-gray-100"
                                    />
                                    <p className="mt-1 text-right text-xs text-gray-400">
                                        {clarificationForm.business_impact.trim().length}/500 characters · minimum 20
                                    </p>
                                    {clarificationErrors.business_impact && (
                                        <p className="mt-1 text-xs text-red-600">{clarificationErrors.business_impact}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="clarification-scope" className="mb-1.5 block text-sm font-medium text-gray-800">
                                        Affected Scope <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        id="clarification-scope"
                                        name="affected_scope"
                                        required
                                        value={clarificationForm.affected_scope}
                                        onChange={handleClarificationFieldChange}
                                        disabled={submittingClarification}
                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#4C4CF9] focus:ring-2 focus:ring-[#4C4CF9]/15 disabled:bg-gray-100"
                                    >
                                        <option value="">Select affected scope</option>
                                        <option value="individual">Individual</option>
                                        <option value="group">Group</option>
                                        <option value="department">Department</option>
                                        <option value="organization_wide">Organization Wide</option>
                                    </select>

                                    {clarificationErrors.affected_scope && (
                                        <p className="mt-1 text-xs text-red-600">
                                            {clarificationErrors.affected_scope}
                                        </p>
                                    )}
                                </div>

                                {clarificationErrors.non_field_errors && (
                                    <p className="text-sm text-red-600">{clarificationErrors.non_field_errors}</p>
                                )}
                            </div>

                            <div className="flex flex-col-reverse gap-2 border-t border-gray-200 bg-gray-50/70 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
                                <button
                                    type="button"
                                    onClick={() => setClarificationModalOpen(false)}
                                    disabled={submittingClarification}
                                    className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Do This Later
                                </button>
                                <button
                                    type="submit"
                                    disabled={
                                        submittingClarification ||
                                        clarificationForm.subject.trim().length < 15 ||
                                        clarificationForm.subject.trim().length > 100 ||
                                        clarificationForm.description.trim().length < 50 ||
                                        clarificationForm.description.trim().length > 750 ||
                                        clarificationForm.business_impact.trim().length < 20 ||
                                        clarificationForm.business_impact.trim().length > 500 ||
                                        !clarificationForm.affected_scope.trim()
                                    }
                                    className="rounded-lg bg-[#4C4CF9] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3D3DE5] focus:outline-none focus:ring-2 focus:ring-[#4C4CF9]/30 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {submittingClarification ? "Submitting..." : "Submit Details"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {reopenRequestModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget && !submittingReopenRequest) {
                            setReopenRequestModalOpen(false);
                        }
                    }}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="reopen-request-title"
                        className="w-full max-w-lg overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl"
                    >
                        <div className="flex items-start justify-between border-b border-gray-200 px-5 py-4">
                            <div className="flex min-w-0 items-start gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#4C4CF9]/10 text-[#4C4CF9]">
                                    <RotateCcw size={20} />
                                </div>
                                <div className="min-w-0">
                                    <h2 id="reopen-request-title" className="text-base font-semibold text-gray-900">
                                        Request to Reopen Ticket
                                    </h2>
                                    <p className="mt-1 text-sm leading-5 text-gray-500">
                                        Tell us why this resolved ticket needs further attention.
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setReopenRequestModalOpen(false)}
                                disabled={submittingReopenRequest}
                                className="ml-3 rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                                aria-label="Close modal"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4 px-5 py-5">
                            <div>
                                <label htmlFor="reopen-reason" className="mb-2 block text-sm font-medium text-gray-900">
                                    Reason for reopening <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    id="reopen-reason"
                                    value={reopenReason}
                                    onChange={(event) => setReopenReason(event.target.value)}
                                    disabled={submittingReopenRequest}
                                    maxLength={1000}
                                    rows={5}
                                    placeholder="Explain what remains unresolved or why further assistance is needed..."
                                    className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#4C4CF9] focus:ring-2 focus:ring-[#4C4CF9]/20 disabled:bg-gray-50"
                                />
                                <p className="mt-1.5 text-right text-xs text-gray-400">
                                    {reopenReason.length}/1000 characters (minimum 10)
                                </p>
                            </div>

                            <div className="flex items-start gap-2.5 rounded-lg border border-blue-200 bg-blue-50 px-3.5 py-3 text-sm leading-5 text-blue-700">
                                <Info size={17} className="mt-0.5 shrink-0 text-blue-600" />
                                <p className="text-xs text-blue-700">
                                    After you submit this request, IT Support will review it.
                                    Your ticket will remain resolved until the request is approved.
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 border-t border-gray-200 bg-gray-50/50 px-5 py-4">
                            <button
                                type="button"
                                onClick={() => setReopenRequestModalOpen(false)}
                                disabled={submittingReopenRequest}
                                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={
                                    submittingReopenRequest ||
                                    reopenReason.trim().length < 10 ||
                                    reopenReason.trim().length > 1000
                                }
                                onClick={handleSubmitReopenRequest}
                                className="rounded-lg bg-[#4C4CF9] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#3D3DE5] focus:outline-none focus:ring-2 focus:ring-[#4C4CF9]/30 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {submittingReopenRequest ? "Submitting..." : "Submit Request"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ReopenRequestModal
                open={reopenDetailsModalOpen}
                onClose={() => setReopenDetailsModalOpen(false)}
                reopenRequest={latestReopenRequest}
                isSupport={user?.role === "IT Support Specialist"}
                onReview={handleReviewReopenRequest}
                reviewing={reviewingReopenRequest}
            />

            <RequestPriorityModal
                open={priorityModalOpen}
                onClose={() => setPriorityModalOpen(false)}
                ticketId={ticketDetails?.id}
                currentPriority={ticketDetails?.priority}
                onRequestSubmitted={fetchTicketDetails}
            />

            <ReturnTicketModal
                open={returnModalOpen}
                onClose={() => setReturnModalOpen(false)}
                ticketId={ticketDetails?.id}
            />

            <RequestAssistanceModal
                open={assistanceModalOpen}
                onClose={() => setAssistanceModalOpen(false)}
                ticketDetails={ticketDetails}
                ticketId={ticketId}
                onSuccess={fetchTicketDetails}
            />

            <AssistanceRequestModal
                open={assistanceDetailsModalOpen}
                onClose={() => {
                    setAssistanceDetailsModalOpen(false);
                    setAssistanceActionError("");
                }}
                ticketDetails={ticketDetails}
                currentAssisting={ticketDetails?.current_assisting || []}
                assistanceRequests={assistanceRequests}
                myAssistance={ticketDetails?.my_assistance || null}
                canEdit={canEditAssistance}
                canAccept={canAcceptAssistance}
                canAcceptRequestId={pendingAssistanceRequestId}
                onAccept={handleAcceptAssistance}
                onCancel={handleCancelAssistanceRequest}
                onComplete={handleCompleteAssistance}
                acceptingAssistance={acceptingAssistance}
                isCancelling={cancellingAssistance}
                isCompleting={completingAssistance}
                actionError={assistanceActionError}
            />

            <AutomatedProcessingModal
                open={automatedModalOpen}
                onClose={() => setAutomatedModalOpen(false)}
                automation={automationData}
            />

            <EscalateTicketModal
                open={escalateModalOpen}
                onClose={() => setEscalateModalOpen(false)}
                ticketId={ticketDetails?.id}
                onEscalationSubmitted={fetchTicketDetails}
            />
        </div>
    );
}