import Sidebar from "../components/Sidebar"
import { getCurrentUser } from "../utils/auth"
import api from "../api";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import TicketDetailsEmployee from "../components/TicketDetailsEmployee";
import TicketDetailsServiceDesk from "../components/TicketDetailsServiceDesk";

export default function TicketDetails() {
    const user = getCurrentUser();
    const [ticketDetails, setTicketDetails] = useState(null);
    const { ticketId } = useParams();

    useEffect(() => {
        const fetchTicketDetails = async () => {
            try {
                const response = await api.get(`/tickets/employee/detail/${ticketId}/`);
                setTicketDetails(response.data);
                console.log("Fetched ticket details:", response.data);
            } catch (error) {
                console.error("Error fetching ticket details:", error);
            }
        }

        fetchTicketDetails();
    }, [ticketId]);

    if (!ticketDetails) {
        return <p>Loading...</p>;
    }

    let MainContent;

    if (user?.role === "Employee") {
        MainContent = <TicketDetailsEmployee/>;
    }
    // else if (user?.role === "IT Support Specialist") {
    //     MainContent = <SupportTicket/>;
    // }
    else if (user?.role === "IT Service Desk") {
        MainContent = <TicketDetailsServiceDesk/>;
    }
    else {
        MainContent = <div className="p-6">Access Denied / Invalid Role</div>;
    }

    return(
        <div className="flex w-screen h-screen overflow-hidden bg-gray-50">
            <Sidebar/>
            <div className="flex-1 h-screen flex flex-col">
                <div className="h-14 border-b border-gray-300 mb-4 bg-white shrink-0">
                </div>
                {/* <p className="text-sm">Back to my tickets</p> */}
                <main className="flex-1 h-full p-4">
                    {MainContent = (<TicketDetailsEmployee ticketDetails={ticketDetails}/>)}
                </main>
            </div>
        </div>
    );
}