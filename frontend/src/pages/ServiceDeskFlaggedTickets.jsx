import FlaggedTicketsTable from "../components/FlaggedTicketsTable";
import api from "../api";
import { useEffect, useState } from "react";

export default function ServiceDeskFlaggedTickets() {
    const [flaggedTickets, setFlaggedTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFlaggedTicketsList = async () => {
            try {
                setLoading(true);
                const response = await api.get("/tickets/flagged/list/") 
                setFlaggedTickets(response.data);
                console.log(response.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }

        fetchFlaggedTicketsList();
    }, [])

    if (!flaggedTickets) {
        return <div>Loading...</div>;
    }
    return(
        <FlaggedTicketsTable flaggedTickets={flaggedTickets} loading={loading}/>
    );
}