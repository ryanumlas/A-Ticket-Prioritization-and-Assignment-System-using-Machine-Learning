import Sidebar from "../components/Sidebar";
import { getCurrentUser } from "../utils/auth";
import api from "../api";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Workflow } from "lucide-react";
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

export default function TicketDetails() {
    const user = getCurrentUser();

    const [assistanceModalOpen, setAssistanceModalOpen] = useState(false);
    const [priorityModalOpen, setPriorityModalOpen] = useState(false);
    const [returnModalOpen, setReturnModalOpen] = useState(false);
    const [automatedModalOpen, setAutomatedModalOpen] = useState(false);
    const [escalateModalOpen, setEscalateModalOpen] = useState(false);

    const [ticketDetails, setTicketDetails] = useState(null);
    const [automationData, setAutomationData] = useState(null);

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
                return;
            }

            const response = await api.get(endpoint);

            setTicketDetails(response.data);
            setAutomationData(response.data?.automation || null);
        } catch (error) {
            setError(
                error.response?.data?.error ||
                    "Failed to load ticket details."
            );
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
    }, [ticketId, user?.role]);

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
                            onClick={() => navigate(-1)}
                            className="mb-3 flex w-fit items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-black min-[1280px]:max-[1535px]:gap-1 min-[1280px]:max-[1535px]:text-[13px]"
                        >
                            <ArrowLeft
                                size={16}
                                className="min-[1280px]:max-[1535px]:h-[14px] min-[1280px]:max-[1535px]:w-[14px]"
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

    /*
     * IT Support Specialist:
     * Can manage the ticket when it is assigned to them.
     */
    const isAssignedSupport =
        user?.role === "IT Support Specialist" &&
        Number(ticketDetails?.assigned_to?.id) ===
            Number(user?.user_id);

    /*
     * IT Supervisor:
     * Can manage tickets.
     */
    const isSupervisor =
        user?.role === "IT Supervisor";

    /*
     * Automated Details is view-only.
     *
     * IT Service Desk:
     * - Can view tickets across departments
     * - Can view automated processing details
     *
     * IT Support Specialist:
     * - Can view automated processing details
     *   even when the ticket is not assigned to them
     *
     * IT Supervisor:
     * - Can view automated processing details
     */
    const canViewAutomatedDetails =
        user?.role === "IT Service Desk" ||
        user?.role === "IT Support Specialist" ||
        user?.role === "IT Supervisor";

    /*
     * Manage Ticket is separate from Automated Details.
     *
     * IT Service Desk:
     * - View only
     *
     * IT Support Specialist:
     * - Can manage when assigned to them
     *
     * IT Supervisor:
     * - Can manage tickets
     */
    const canUseTicketActions =
        isAssignedSupport ||
        isSupervisor;

    let MainContent;

    if (user?.role === "Employee") {
        MainContent = (
            <TicketDetailsEmployee
                ticketDetails={ticketDetails}
            />
        );
    } else if (user?.role === "IT Service Desk") {
        MainContent = (
            <TicketDetailsServiceDesk
                ticketDetails={ticketDetails}
            />
        );
    } else if (user?.role === "IT Support Specialist") {
        MainContent = (
            <TicketDetailsSupport
                ticketDetails={ticketDetails}
                onTicketUpdated={fetchTicketDetails}
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
                        flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto p-4
                        [&::-webkit-scrollbar]:w-1
                        [&::-webkit-scrollbar-track]:bg-transparent
                        [&::-webkit-scrollbar-thumb]:bg-transparent
                        hover:[&::-webkit-scrollbar-thumb]:bg-gray-300
                    "
                >
                    <div className="mb-3 flex min-h-9 shrink-0 items-center justify-between gap-3 min-[1280px]:max-[1535px]:mb-2 min-[1280px]:max-[1535px]:min-h-8">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="flex shrink-0 items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-black min-[1280px]:max-[1535px]:gap-1 min-[1280px]:max-[1535px]:text-[13px]"
                        >
                            <ArrowLeft
                                size={16}
                                className="min-[1280px]:max-[1535px]:h-[14px] min-[1280px]:max-[1535px]:w-[14px]"
                            />

                            Back to Tickets
                        </button>

                        <div className="flex min-w-0 items-center gap-2 min-[1280px]:max-[1535px]:gap-1.5">
                            {canViewAutomatedDetails && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        setAutomatedModalOpen(true)
                                    }
                                    className="flex h-9 shrink-0 cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-white px-3.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 min-[1280px]:max-[1535px]:h-8 min-[1280px]:max-[1535px]:gap-1.5 min-[1280px]:max-[1535px]:rounded-md min-[1280px]:max-[1535px]:px-3 min-[1280px]:max-[1535px]:text-[13px]"
                                >
                                    <Workflow
                                        size={16}
                                        className="text-[#2563EB] min-[1280px]:max-[1535px]:h-[14px] min-[1280px]:max-[1535px]:w-[14px]"
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
                                        setPriorityModalOpen(true)
                                    }
                                    onReturnTicket={() =>
                                        setReturnModalOpen(true)
                                    }
                                    onRequestAssistance={() =>
                                        setAssistanceModalOpen(true)
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