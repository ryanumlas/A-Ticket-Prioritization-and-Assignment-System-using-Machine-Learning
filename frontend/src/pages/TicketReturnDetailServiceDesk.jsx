import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import TicketReturnedDetailContent from "../components/TicketReturnedDetailContent";
import api from "../api";

export default function TicketReturnDetailServiceDesk() {
    const { ticketId } = useParams();

    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchReturnedTicket = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await api.get(
                    `/tickets/return-ticket/${ticketId}/detail/`
                );

                setRequest(response.data);
            } catch (err) {
                setError(
                    err.response?.data?.error ||
                    "Failed to load returned ticket request."
                );
            } finally {
                setLoading(false);
            }
        };

        if (ticketId) {
            fetchReturnedTicket();
        } else {
            setError("Returned ticket ID is missing.");
            setLoading(false);
        }
    }, [ticketId]);

    if (loading) {
        return (
            <div className="flex min-h-[300px] items-center justify-center">
                <p className="text-sm text-gray-500">
                    Loading returned ticket...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4">
                <p className="text-sm text-red-600">
                    {error}
                </p>
            </div>
        );
    }

    if (!request) {
        return null;
    }

    return (
        <TicketReturnedDetailContent request={request} />
    );
}