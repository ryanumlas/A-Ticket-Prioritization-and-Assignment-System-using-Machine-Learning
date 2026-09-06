import Sidebar from "../components/Sidebar";
import { getCurrentUser } from "../utils/auth";
import api from "../api";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    SlidersHorizontal
} from "lucide-react";

import TicketDetailsEmployee from "../components/TicketDetailsEmployee";
import TicketDetailsServiceDesk from "../components/TicketDetailsServiceDesk";
import TicketDetailsSupport from "../components/TicketDetailsSupport";

export default function TicketDetails() {
    const user = getCurrentUser();

    const [ticketDetails, setTicketDetails] = useState(null);
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
            }
            else if (user?.role === "IT Service Desk") {
                endpoint = `/tickets/service-desk/detail/${ticketId}/`;
            }
            else if (user?.role === "IT Support Specialist") {
                endpoint = `/tickets/support/detail/${ticketId}/`;
            }
            else {
                setError("Access Denied / Invalid Role");
                return;
            }

            const response = await api.get(endpoint);

            setTicketDetails(response.data);

            console.log(
                "Fetched ticket details:",
                response.data
            );
        }
        catch (error) {
            console.error(
                "Error fetching ticket details:",
                error.response?.data || error
            );

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
            }
            finally {
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

                    <div className="h-14 shrink-0 border-b border-gray-300 bg-white" />

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

    let MainContent;

    if (user?.role === "Employee") {
        MainContent = (
            <TicketDetailsEmployee
                ticketDetails={ticketDetails}
            />
        );
    }
    else if (user?.role === "IT Service Desk") {
        MainContent = (
            <TicketDetailsServiceDesk
                ticketDetails={ticketDetails}
            />
        );
    }
    else if (user?.role === "IT Support Specialist") {
        MainContent = (
            <TicketDetailsSupport
                ticketDetails={ticketDetails}
                onTicketUpdated={fetchTicketDetails}
            />
        );
    }
    else {
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

                <div className="h-14 shrink-0 border-b border-gray-300 bg-white" />

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

                        {isAssignedSupport && (
                            <button
                                type="button"
                                className="flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-[#4C4CF9] px-3.5 text-sm font-medium text-white transition-colors hover:bg-[#3a3ae0] focus:outline-none focus:ring-2 focus:ring-[#4C4CF9]/50"
                            >
                                Manage Tickets
                                <SlidersHorizontal size={16} />
                            </button>
                        )}

                    </div>

                    <div className="min-h-0 flex-1">
                        {MainContent}
                    </div>

                </main>

            </div>

        </div>
    );
}