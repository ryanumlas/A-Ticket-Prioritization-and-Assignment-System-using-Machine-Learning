
import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import api from "../api";
import { toast } from "sonner";
import SupportReopenRequestTable from "../components/SupportReopenRequestTable";

export default function SupportReopenRequest() {
    const [requestList, setRequestList] = useState([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All Status");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(15);
    const [loading, setLoading] = useState(true);

    const fetchRequests = async () => {
        setLoading(true);

        try {
            const response = await api.get("/tickets/reopen-requests/");
            const data = response.data;

            setRequestList(
                Array.isArray(data)
                    ? data
                    : Array.isArray(data?.results)
                        ? data.results
                        : []
            );
        } catch (error) {
            console.error("Error fetching reopen requests:", error);
            toast.error("Failed to load reopen requests.");
            setRequestList([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const filteredRequests = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        return requestList.filter((request) => {
            const matchesSearch = !keyword || [
                request.ticket_code,
                request.ticket_title,
                request.title,
                request.requested_by,
                request.department,
                request.reason,
                request.current_assignee,
            ].some((value) =>
                String(value ?? "").toLowerCase().includes(keyword)
            );

            const requestStatus = String(request.status ?? "Pending").toLowerCase();
            const matchesStatus =
                statusFilter === "All Status" ||
                requestStatus === statusFilter.toLowerCase();

            return matchesSearch && matchesStatus;
        });
    }, [requestList, search, statusFilter]);

    const totalRequests = filteredRequests.length;
    const totalPages = Math.max(1, Math.ceil(totalRequests / pageSize));
    const startIndex = (page - 1) * pageSize;

    const paginatedRequests = filteredRequests.slice(
        startIndex,
        startIndex + pageSize
    );

    useEffect(() => {
        setPage(1);
    }, [search, statusFilter, pageSize]);

    useEffect(() => {
        if (page > totalPages) {
            setPage(totalPages);
        }
    }, [page, totalPages]);

    const handleReviewComplete = () => {
        fetchRequests();
    };

    const clearSearch = () => {
        setSearch("");
        setPage(1);
    };

    const selectClassName =
        "h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 min-[1366px]:max-[1537px]:h-9 min-[1366px]:max-[1537px]:px-2.5 min-[1366px]:max-[1537px]:text-xs";

    return (
        <div className="flex h-full min-h-0 flex-col overflow-hidden bg-gray-50">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 bg-white px-5 py-4 min-[1366px]:max-[1537px]:px-4 min-[1366px]:max-[1537px]:py-3">
                <div className="min-w-0">
                    <h1 className="text-xl font-semibold text-gray-900 min-[1366px]:max-[1537px]:text-lg">
                        Reopen Requests
                    </h1>
                    <p className="mt-0.5 text-sm text-gray-500 min-[1366px]:max-[1537px]:text-xs">
                        Review employee requests to reopen resolved tickets in your IT department.
                    </p>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="border-b border-gray-200 bg-white px-5 py-3 min-[1366px]:max-[1537px]:px-4 min-[1366px]:max-[1537px]:py-2.5">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between min-[1366px]:max-[1537px]:gap-2.5">
                    <div className="relative w-full md:max-w-md">
                        <Search
                            size={17}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 min-[1366px]:max-[1537px]:h-4 min-[1366px]:max-[1537px]:w-4"
                        />

                        <input
                            type="text"
                            value={search}
                            onChange={(event) => {
                                setSearch(event.target.value);
                                setPage(1);
                            }}
                            placeholder="Search ticket ID or subject..."
                            className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-9 pr-9 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 min-[1366px]:max-[1537px]:h-9 min-[1366px]:max-[1537px]:pl-8 min-[1366px]:max-[1537px]:pr-8 min-[1366px]:max-[1537px]:text-xs"
                        />

                        {search && (
                            <button
                                type="button"
                                onClick={clearSearch}
                                title="Clear search"
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 transition hover:text-gray-700"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 min-[1366px]:max-[1537px]:gap-1.5">
                        <select
                            value={statusFilter}
                            onChange={(event) => {
                                setStatusFilter(event.target.value);
                                setPage(1);
                            }}
                            className={selectClassName}
                            aria-label="Filter by status"
                        >
                            <option value="All Status">All Status</option>
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                        </select>

                        <select
                            value={pageSize}
                            onChange={(event) => setPageSize(Number(event.target.value))}
                            className={selectClassName}
                            aria-label="Requests per page"
                        >
                            <option value={15}>15 / page</option>
                            <option value={25}>25 / page</option>
                            <option value={50}>50 / page</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Request Table */}
            <div className="min-h-0 flex-1 overflow-hidden bg-white">
                <SupportReopenRequestTable
                    requestList={paginatedRequests}
                    loading={loading}
                    onReviewComplete={handleReviewComplete}
                />
            </div>

            {/* Pagination */}
            <div className="flex shrink-0 flex-col gap-3 border-t border-gray-200 bg-white px-5 py-3 sm:flex-row sm:items-center sm:justify-between min-[1366px]:max-[1537px]:gap-2 min-[1366px]:max-[1537px]:px-4 min-[1366px]:max-[1537px]:py-2.5">
                <p className="text-sm text-gray-500 min-[1366px]:max-[1537px]:text-xs">
                    Showing{" "}
                    <span className="font-medium text-gray-900">
                        {totalRequests === 0 ? 0 : startIndex + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-medium text-gray-900">
                        {Math.min(startIndex + pageSize, totalRequests)}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium text-gray-900">
                        {totalRequests}
                    </span>{" "}
                    requests
                </p>

                <div className="flex items-center gap-2 min-[1366px]:max-[1537px]:gap-1.5">
                    <button
                        type="button"
                        disabled={page <= 1}
                        onClick={() => setPage((current) => Math.max(current - 1, 1))}
                        className={`rounded-lg border px-3 py-2 text-sm font-medium transition min-[1366px]:max-[1537px]:px-2.5 min-[1366px]:max-[1537px]:py-1.5 min-[1366px]:max-[1537px]:text-xs ${
                            page <= 1
                                ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                                : "cursor-pointer border-[#2563EB] bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
                        }`}
                    >
                        Previous
                    </button>

                    <span className="min-w-[80px] text-center text-sm text-gray-600 min-[1366px]:max-[1537px]:min-w-[70px] min-[1366px]:max-[1537px]:text-xs">
                        Page {page} of {totalPages}
                    </span>

                    <button
                        type="button"
                        disabled={page >= totalPages}
                        onClick={() =>
                            setPage((current) => Math.min(current + 1, totalPages))
                        }
                        className={`rounded-lg border px-3 py-2 text-sm font-medium transition min-[1366px]:max-[1537px]:px-2.5 min-[1366px]:max-[1537px]:py-1.5 min-[1366px]:max-[1537px]:text-xs ${
                            page >= totalPages
                                ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                                : "cursor-pointer border-[#2563EB] bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
                        }`}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}