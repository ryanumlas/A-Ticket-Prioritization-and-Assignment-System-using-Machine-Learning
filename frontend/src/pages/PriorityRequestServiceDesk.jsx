import { useEffect, useState } from "react";
import api from "../api";
import PriorityRequestCard from "../components/PriorityRequestCard";

export default function PriorityRequestServiceDesk() {
    const [priorityRequests, setPriorityRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchPriorityRequests = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                "/tickets/priority-change-requests/list/"
            );

            console.log(
                "Priority Requests:",
                response.data
            );

            setPriorityRequests(response.data);
        }
        catch (error) {
            console.error(
                "Error fetching priority requests:",
                error.response?.data || error
            );

            setError(
                error.response?.data?.error ||
                "Failed to load priority requests."
            );
        }
        finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPriorityRequests();
    }, []);

    return (
        <div className="h-full overflow-y-auto px-8 pb-8">

            {/* PAGE HEADER */}
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-black">
                    Priority Requests
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                    Review and process priority change requests from IT Support.
                </p>
            </div>

            {/* LOADING */}
            {loading && (
                <div className="flex min-h-[250px] items-center justify-center">
                    <p className="text-sm text-gray-500">
                        Loading priority requests...
                    </p>
                </div>
            )}

            {/* ERROR */}
            {!loading && error && (
                <div className="flex min-h-[250px] items-center justify-center rounded-xl border border-red-200 bg-red-50">
                    <p className="text-sm text-red-600">
                        {error}
                    </p>
                </div>
            )}

            {/* EMPTY */}
            {!loading &&
                !error &&
                priorityRequests.length === 0 && (
                    <div className="flex min-h-[250px] items-center justify-center rounded-xl border border-gray-300 bg-white">
                        <p className="text-sm text-gray-500">
                            No priority requests found.
                        </p>
                    </div>
                )}

            {/* REQUEST CARDS */}
            {!loading &&
                !error &&
                priorityRequests.length > 0 && (
                    <div className="space-y-3">
                        {priorityRequests.map((request) => (
                            <PriorityRequestCard
                                key={request.id}
                                request={request}
                            />
                        ))}
                    </div>
                )}

        </div>
    );
}