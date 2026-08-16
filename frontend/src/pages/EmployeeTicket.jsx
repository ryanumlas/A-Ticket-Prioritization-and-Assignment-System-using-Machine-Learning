import { getCurrentUser } from "../utils/auth";
import api from "../api";
import { useEffect, useState } from "react";
import TicketTableEmployee from "../components/TicketTableEmployee";

export default function EmployeeTicket() {
    const [ticketList, setTicketList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTicketList = async () => {
            try {
                setLoading(true);
                const response = await api.get("/tickets/employee/list/");
                setTicketList(response.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }

        fetchTicketList();
    }, []);

    if (!ticketList) {
        return <div>Loading...</div>;
    }

    return(
        <div className="">
            <TicketTableEmployee ticketList={ticketList} loading={loading} />
        </div>
    );
}