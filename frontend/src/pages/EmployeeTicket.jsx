import { getCurrentUser } from "../utils/auth";
import api from "../api";
import { useEffect, useState } from "react";
import TicketTableEmployee from "../components/TicketTableEmployee";

export default function EmployeeTicket() {
    const [ticketList, setTicketList] = useState([]);

    useEffect(() => {
        const fetchTicketList = async () => {
            try {
                const response = await api.get("/tickets/employee/list/");
                setTicketList(response.data);
            } catch (error) {
                console.error(error);
            }
        }

        fetchTicketList();
    }, []);

    if (!ticketList) {
        return <div>Loading...</div>;
    }

    return(
        <div className="">
            <TicketTableEmployee ticketList={ticketList}/>
        </div>
    );
}