import Sidebar from "../components/Sidebar";
import { getCurrentUser } from "../utils/auth";
import api from "../api";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    Users,
    Workflow,
} from "lucide-react";
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

export default function TicketDetails() {
    const user = getCurrentUser();

    const [assistanceModalOpen, setAssistanceModalOpen] =
        useState(false);

    const [assistanceDetailsModalOpen, setAssistanceDetailsModalOpen] =
        useState(false);

    const [priorityModalOpen, setPriorityModalOpen] =
        useState(false);

    const [returnModalOpen, setReturnModalOpen] =
        useState(false);

    const [automatedModalOpen, setAutomatedModalOpen] =
        useState(false);

    const [escalateModalOpen, setEscalateModalOpen] =
        useState(false);

    const [ticketDetails, setTicketDetails] = useState(null);
    const [automationData, setAutomationData] = useState(null);

    const [locallyAssisting, setLocallyAssisting] =
        useState(false);

    const [acceptingAssistance, setAcceptingAssistance] =
        useState(false);

    const [cancellingAssistance, setCancellingAssistance] =
        useState(false);

    const [completingAssistance, setCompletingAssistance] =
        useState(false);

    const [assistanceActionError, setAssistanceActionError] =
        useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const { ticketId } = useParams();
    const navigate = useNavigate();

    const fetchTicketDetails = async () => {
        try {
            setError("");

            let endpoint;

            if (user?.role === "Employee") {
                endpoint =
                    `/tickets/employee/detail/${ticketId}/`;
            } else if (
                user?.role === "IT Service Desk"
            ) {
                endpoint =
                    `/tickets/service-desk/detail/${ticketId}/`;
            } else if (
                user?.role === "IT Support Specialist"
            ) {
                endpoint =
                    `/tickets/support/detail/${ticketId}/`;
            } else if (
                user?.role === "IT Supervisor"
            ) {
                endpoint =
                    `/tickets/supervisor/detail/${ticketId}/`;
            } else {
                setError(
                    "Access Denied / Invalid Role"
                );
                return;
            }

            const response = await api.get(endpoint);

            setTicketDetails(response.data);

            setAutomationData(
                response.data?.automation || null
            );
        } catch (error) {
            setError(
                error.response?.data?.error ||
                    "Failed to load ticket details."
            );
        }
    };

    const handleAcceptAssistance = async (
        requestId
    ) => {
        if (!requestId) {
            setAssistanceActionError(
                "No pending assistance request was found."
            );
            return;
        }

        try {
            setAcceptingAssistance(true);
            setAssistanceActionError("");

            await api.post(
                `/tickets/assistance/request/${requestId}/accept/`
            );

            setLocallyAssisting(true);

            await fetchTicketDetails();

            setAssistanceDetailsModalOpen(
                true
            );
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

    const handleCancelAssistanceRequest = async (
        requestId
    ) => {
        if (!requestId) {
            setAssistanceActionError(
                "Invalid assistance request."
            );
            return;
        }

        try {
            setCancellingAssistance(true);
            setAssistanceActionError("");

            await api.post(
                `/tickets/assistance/request/${requestId}/cancel/`
            );

            await fetchTicketDetails();

            setAssistanceDetailsModalOpen(
                true
            );
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

    const handleCompleteAssistance = async (
        note
    ) => {
        const assistanceId =
            ticketDetails?.my_assistance?.id;

        if (!assistanceId) {
            setAssistanceActionError(
                "Your assistance record could not be found."
            );
            return;
        }

        try {
            setCompletingAssistance(true);
            setAssistanceActionError("");

            await api.post(
                `/tickets/assistance/${assistanceId}/complete/`,
                {
                    assisted_note: note,
                }
            );

            setLocallyAssisting(false);

            await fetchTicketDetails();

            setAssistanceDetailsModalOpen(
                true
            );
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
        const loadTicketDetails = async () => {
            try {
                setLoading(true);

                await fetchTicketDetails();
            } finally {
                setLoading(false);
            }
        };

        if (user?.role && ticketId) {
            loadTicketDetails();
        }
    }, [
        ticketId,
        user?.role,
    ]);

    useEffect(() => {
        setLocallyAssisting(false);
        setAssistanceDetailsModalOpen(false);
        setAssistanceActionError("");
        setCancellingAssistance(false);
        setCompletingAssistance(false);
    }, [ticketId]);

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-gray-50">
                <p className="text-sm text-gray-500">
                    Loading ticket details...
                </p>
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
                            onClick={() =>
                                navigate(-1)
                            }
                            className="
                                mb-3
                                flex
                                w-fit
                                items-center
                                gap-1.5
                                text-sm
                                font-medium
                                text-gray-500
                                transition-colors
                                hover:text-black

                                min-[1280px]:max-[1535px]:gap-1
                                min-[1280px]:max-[1535px]:text-[13px]
                            "
                        >
                            <ArrowLeft
                                size={16}
                                className="
                                    min-[1280px]:max-[1535px]:h-[14px]
                                    min-[1280px]:max-[1535px]:w-[14px]
                                "
                            />

                            Back to Tickets
                        </button>

                        <div className="flex min-h-0 min-w-0 flex-1 items-center justify-center">
                            <p className="text-sm text-gray-500">
                                {error}
                            </p>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    const isAssignedSupport =
        user?.role ===
            "IT Support Specialist" &&
        Number(
            ticketDetails?.assigned_to?.id
        ) ===
            Number(user?.user_id);

    const backendIsAssisting =
        ticketDetails?.is_assisting === true;

    const isAssisting =
        backendIsAssisting ||
        locallyAssisting;

    const isSupervisor =
        user?.role === "IT Supervisor";

    const assistanceRequests =
        Array.isArray(
            ticketDetails?.assistance_requests
        )
            ? ticketDetails.assistance_requests
            : [];

    const hasPendingAssistanceForMyDepartment =
        ticketDetails?.has_pending_assistance_request ===
        true;

    const canAcceptAssistance =
        ticketDetails?.can_accept_assistance ===
        true;

    const pendingAssistanceRequestId =
        ticketDetails?.pending_assistance_request_id ||
        null;

    const currentAssisting = Array.isArray(
        ticketDetails?.current_assisting
    )
        ? ticketDetails.current_assisting
        : [];

    const assistanceParticipantCount =
        currentAssisting.length;

    const ongoingAssistingCount =
        currentAssisting.filter(
            (person) =>
                String(person?.status || "")
                    .trim()
                    .toLowerCase() === "ongoing"
        ).length;

    const hasOngoingAssistance =
        ongoingAssistingCount > 0;

    const hasMyAssistance =
        Boolean(
            ticketDetails?.my_assistance
        );

    const canViewAutomatedDetails =
        user?.role === "IT Service Desk" ||
        user?.role === "IT Support Specialist" ||
        user?.role === "IT Supervisor";

    const canUseTicketActions =
        isAssignedSupport ||
        isSupervisor;

    const showAssistanceDetails =
        user?.role ===
            "IT Support Specialist" &&
        (
            isAssignedSupport ||
            isAssisting ||
            hasPendingAssistanceForMyDepartment ||
            hasMyAssistance
        );

    const canEditAssistance =
        user?.role ===
            "IT Support Specialist" &&
        isAssisting &&
        !isAssignedSupport;

    let MainContent;

    if (user?.role === "Employee") {
        MainContent = (
            <TicketDetailsEmployee
                ticketDetails={ticketDetails}
            />
        );
    } else if (
        user?.role === "IT Service Desk"
    ) {
        MainContent = (
            <TicketDetailsServiceDesk
                ticketDetails={ticketDetails}
            />
        );
    } else if (
        user?.role ===
        "IT Support Specialist"
    ) {
        MainContent = (
            <TicketDetailsSupport
                ticketDetails={ticketDetails}
                onTicketUpdated={
                    fetchTicketDetails
                }
                isAssisting={
                    isAssisting ||
                    hasMyAssistance
                }
                onAssistanceAccepted={() =>
                    setLocallyAssisting(true)
                }
            />
        );
    } else if (
        user?.role === "IT Supervisor"
    ) {
        MainContent = (
            <SupervisorTicketDetails
                ticketDetails={ticketDetails}
                onTicketUpdated={
                    fetchTicketDetails
                }
            />
        );
    } else {
        MainContent = (
            <div className="p-6">
                Access Denied / Invalid Role
            </div>
        );
    }

    return (
        <div className="flex h-screen w-full min-w-0 overflow-hidden bg-gray-50">
            <Sidebar />

            <div className="flex h-screen min-w-0 flex-1 flex-col">
                <TopBar />

                <main
                    className="
                        flex
                        min-h-0
                        min-w-0
                        flex-1
                        flex-col
                        overflow-y-auto
                        p-4

                        [&::-webkit-scrollbar]:w-1
                        [&::-webkit-scrollbar-track]:bg-transparent
                        [&::-webkit-scrollbar-thumb]:bg-transparent
                        hover:[&::-webkit-scrollbar-thumb]:bg-gray-300
                    "
                >
                    <div
                        className="
                            mb-3
                            flex
                            min-h-9
                            shrink-0
                            items-center
                            justify-between
                            gap-3

                            min-[1280px]:max-[1535px]:mb-2
                            min-[1280px]:max-[1535px]:min-h-8
                        "
                    >
                        <button
                            type="button"
                            onClick={() =>
                                navigate(-1)
                            }
                            className="
                                flex
                                shrink-0
                                items-center
                                gap-1.5
                                text-sm
                                font-medium
                                text-gray-500
                                transition-colors
                                hover:text-black

                                min-[1280px]:max-[1535px]:gap-1
                                min-[1280px]:max-[1535px]:text-[13px]
                            "
                        >
                            <ArrowLeft
                                size={16}
                                className="
                                    min-[1280px]:max-[1535px]:h-[14px]
                                    min-[1280px]:max-[1535px]:w-[14px]
                                "
                            />

                            Back to Tickets
                        </button>

                        <div
                            className="
                                flex
                                min-w-0
                                items-center
                                gap-2

                                min-[1280px]:max-[1535px]:gap-1.5
                            "
                        >
                            {showAssistanceDetails && (
                                <>
                                    {hasOngoingAssistance && (
                                        <div
                                            className="
                                                flex
                                                h-9
                                                shrink-0
                                                items-center
                                                gap-2
                                                rounded-lg
                                                border
                                                border-blue-200
                                                bg-blue-50
                                                px-3
                                                text-xs
                                                font-semibold
                                                text-blue-700

                                                min-[1280px]:max-[1535px]:h-8
                                                min-[1280px]:max-[1535px]:gap-1.5
                                                min-[1280px]:max-[1535px]:rounded-md
                                                min-[1280px]:max-[1535px]:px-2.5
                                                min-[1280px]:max-[1535px]:text-[12px]
                                            "
                                        >
                                            <Users
                                                size={15}
                                                className="shrink-0 text-blue-600"
                                            />

                                            <span>
                                                Assistance in Progress
                                            </span>

                                            <span className="text-blue-400">
                                                ·
                                            </span>

                                            <span>
                                                {
                                                    ongoingAssistingCount
                                                }{" "}
                                                IT Support
                                            </span>
                                        </div>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setAssistanceActionError(
                                                ""
                                            );

                                            setAssistanceDetailsModalOpen(
                                                true
                                            );
                                        }}
                                        className="
                                            flex
                                            h-9
                                            shrink-0
                                            cursor-pointer
                                            items-center
                                            gap-2
                                            rounded-lg
                                            border
                                            border-gray-300
                                            bg-white
                                            px-3.5
                                            text-sm
                                            font-medium
                                            text-gray-700
                                            transition-colors
                                            hover:bg-gray-50
                                            hover:text-gray-900
                                            focus:outline-none
                                            focus:ring-2
                                            focus:ring-[#2563EB]/20

                                            min-[1280px]:max-[1535px]:h-8
                                            min-[1280px]:max-[1535px]:gap-1.5
                                            min-[1280px]:max-[1535px]:rounded-md
                                            min-[1280px]:max-[1535px]:px-3
                                            min-[1280px]:max-[1535px]:text-[13px]
                                        "
                                    >
                                        <Users
                                            size={16}
                                            className="
                                                text-[#2563EB]

                                                min-[1280px]:max-[1535px]:h-[14px]
                                                min-[1280px]:max-[1535px]:w-[14px]
                                            "
                                        />

                                        <span className="hidden sm:inline">
                                            Assistance Details
                                        </span>
                                    </button>
                                </>
                            )}

                            {canViewAutomatedDetails && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        setAutomatedModalOpen(
                                            true
                                        )
                                    }
                                    className="
                                        flex
                                        h-9
                                        shrink-0
                                        cursor-pointer
                                        items-center
                                        gap-2
                                        rounded-lg
                                        border
                                        border-gray-300
                                        bg-white
                                        px-3.5
                                        text-sm
                                        font-medium
                                        text-gray-700
                                        transition-colors
                                        hover:bg-gray-50
                                        hover:text-gray-900
                                        focus:outline-none
                                        focus:ring-2
                                        focus:ring-[#2563EB]/20

                                        min-[1280px]:max-[1535px]:h-8
                                        min-[1280px]:max-[1535px]:gap-1.5
                                        min-[1280px]:max-[1535px]:rounded-md
                                        min-[1280px]:max-[1535px]:px-3
                                        min-[1280px]:max-[1535px]:text-[13px]
                                    "
                                >
                                    <Workflow
                                        size={16}
                                        className="
                                            text-[#2563EB]

                                            min-[1280px]:max-[1535px]:h-[14px]
                                            min-[1280px]:max-[1535px]:w-[14px]
                                        "
                                    />

                                    <span className="hidden sm:inline">
                                        Automated Details
                                    </span>
                                </button>
                            )}

                            {canUseTicketActions && (
                                <ManageTicketDropdown
                                    role={user?.role}
                                    onPriorityRequest={() =>
                                        setPriorityModalOpen(
                                            true
                                        )
                                    }
                                    onReturnTicket={() =>
                                        setReturnModalOpen(
                                            true
                                        )
                                    }
                                    onRequestAssistance={() =>
                                        setAssistanceModalOpen(
                                            true
                                        )
                                    }
                                    onEscalateTicket={
                                        isAssignedSupport
                                            ? () =>
                                                setEscalateModalOpen(
                                                    true
                                                )
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

            <RequestPriorityModal
                open={priorityModalOpen}
                onClose={() =>
                    setPriorityModalOpen(false)
                }
                ticketId={ticketDetails?.id}
                currentPriority={
                    ticketDetails?.priority
                }
                onRequestSubmitted={
                    fetchTicketDetails
                }
            />

            <ReturnTicketModal
                open={returnModalOpen}
                onClose={() =>
                    setReturnModalOpen(false)
                }
                ticketId={ticketDetails?.id}
            />

            <RequestAssistanceModal
                open={assistanceModalOpen}
                onClose={() =>
                    setAssistanceModalOpen(false)
                }
                ticketDetails={ticketDetails}
                ticketId={ticketId}
                onSuccess={
                    fetchTicketDetails
                }
            />

            <AssistanceRequestModal
                open={assistanceDetailsModalOpen}
                onClose={() => {
                    setAssistanceDetailsModalOpen(
                        false
                    );

                    setAssistanceActionError(
                        ""
                    );
                }}
                ticketDetails={ticketDetails}
                currentAssisting={
                    ticketDetails?.current_assisting ||
                    []
                }
                assistanceRequests={
                    assistanceRequests
                }
                myAssistance={
                    ticketDetails?.my_assistance ||
                    null
                }
                canEdit={
                    canEditAssistance
                }
                canAccept={
                    canAcceptAssistance
                }
                canAcceptRequestId={
                    pendingAssistanceRequestId
                }
                onAccept={
                    handleAcceptAssistance
                }
                onCancel={
                    handleCancelAssistanceRequest
                }
                onComplete={
                    handleCompleteAssistance
                }
                acceptingAssistance={
                    acceptingAssistance
                }
                isCancelling={
                    cancellingAssistance
                }
                isCompleting={
                    completingAssistance
                }
                actionError={
                    assistanceActionError
                }
            />

            <AutomatedProcessingModal
                open={automatedModalOpen}
                onClose={() =>
                    setAutomatedModalOpen(
                        false
                    )
                }
                automation={
                    automationData
                }
            />

            <EscalateTicketModal
                open={escalateModalOpen}
                onClose={() =>
                    setEscalateModalOpen(
                        false
                    )
                }
                ticketId={
                    ticketDetails?.id
                }
                onEscalationSubmitted={
                    fetchTicketDetails
                }
            />
        </div>
    );
}