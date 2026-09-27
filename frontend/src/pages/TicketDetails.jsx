import Sidebar from "../components/Sidebar";
import { getCurrentUser } from "../utils/auth";
import api from "../api";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Workflow } from "lucide-react";
import TopBar from "../components/Topbar";

import TicketDetailsEmployee from "../components/TicketDetailsEmployee";
import TicketDetailsSupport from "../components/TicketDetailsSupport";
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
            <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
                <p className="text-sm text-gray-500">
                    Loading ticket details...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-screen w-screen overflow-hidden bg-gray-50">
                <Sidebar />

                <div className="flex h-screen flex-1 flex-col">
                    <TopBar />

                    <main className="flex min-h-0 flex-1 flex-col p-4">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="mb-3 flex w-fit items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-black"
                        >
                            <ArrowLeft size={16} />
                            Back to Tickets
                        </button>

                        <div className="flex flex-1 items-center justify-center">
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
        user?.role === "IT Support Specialist" &&
        Number(ticketDetails?.assigned_to?.id) ===
            Number(user?.user_id);

    const isSupervisor =
        user?.role === "IT Supervisor";

    const canUseTicketActions =
        isAssignedSupport || isSupervisor;

    let MainContent;

    if (user?.role === "Employee") {
        MainContent = (
            <TicketDetailsEmployee
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
        <div className="flex h-screen w-screen overflow-hidden bg-gray-50">
            <Sidebar />

            <div className="flex h-screen flex-1 flex-col">
                <TopBar />

                <main className="flex min-h-0 flex-1 flex-col p-4">
                    <div className="mb-3 flex h-9 shrink-0 items-center justify-between">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-black"
                        >
                            <ArrowLeft size={16} />
                            Back to Tickets
                        </button>

                        {canUseTicketActions && (
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setAutomatedModalOpen(true)
                                    }
                                    className="flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-white px-3.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                                >
                                    <Workflow
                                        size={16}
                                        className="text-[#2563EB]"
                                    />
                                    Automated Details
                                </button>

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
                                                setEscalateModalOpen(true)
                                            : undefined
                                    }
                                />
                            </div>
                        )}
                    </div>

                    <div className="min-h-0 flex-1">
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