import { useEffect, useState } from "react";
import api from "../api";
import PriorityRequestTable from "../components/PriorityRequestTable";

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

            setPriorityRequests(response.data);
        } catch (error) {
            console.error(
                "Error fetching priority requests:",
                error.response?.data || error
            );

            setError(
                error.response?.data?.error ||
                "Failed to load priority requests."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPriorityRequests();
    }, []);

    return (
        <div className="h-full overflow-y-auto pb-8">

            {/* Page Header */}
            <div className="mb-6 px-8">
                <h1 className="text-2xl font-semibold text-black">
                    Priority Requests
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                    Review and process priority change requests from IT Support.
                </p>
            </div>

            {/* Error */}
            {!loading && error && (
                <div className="mx-8 flex min-h-[250px] items-center justify-center rounded-xl border border-red-200 bg-red-50">
                    <p className="text-sm text-red-600">
                        {error}
                    </p>
                </div>
            )}

            {/* Table */}
            {!error && (
                <div className="w-full overflow-hidden border-y border-gray-300 bg-white">
                    <PriorityRequestTable
                        requests={priorityRequests}
                        loading={loading}
                    />
                </div>
            )}

        </div>
    );
}