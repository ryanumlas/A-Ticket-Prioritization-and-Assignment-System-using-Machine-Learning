import TicketTableServiceDesk from "../components/TicketTableServiceDesk";
import api from "../api";
import { useEffect, useState } from "react";

export default function ServiceDeskTicket() {
    const [ticketList, setTicketList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTicketList = async () => {
            try {
                setLoading(true);
                const response = await api.get("/tickets/service-desk/list/");
                setTicketList(response.data);
                console.log("Service Desk Tickets:", response.data);
            } catch (error) {
                console.error("Error fetching ticket list:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTicketList();
    }, []);

    if (!ticketList) {
        return <div>Loading...</div>;
    }

    return(
        <div>
            <TicketTableServiceDesk ticketList={ticketList} loading={loading} />
        </div>
    );
}