import { useEffect, useState } from "react";
import { toast } from "sonner";

import api from "../api";
import TicketReturnedTable from "../components/TicketReturnedTable";

export default function TicketReturnServiceDesk() {
    const [returnedRequests, setReturnedRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchReturnedRequests = async () => {
        setIsLoading(true);

        try {
            const response = await api.get(
                "/tickets/return-ticket/list/"
            );

            setReturnedRequests(response.data);
        } catch (error) {
            toast.error(
                error.response?.data?.detail ||
                error.response?.data?.error ||
                "Failed to load returned ticket requests."
            );
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReturnedRequests();
    }, []);

    return (
        <div>
            <h1>Returned Ticket</h1>

            <TicketReturnedTable
                requests={returnedRequests}
                isLoading={isLoading}
            />
        </div>
    );
}