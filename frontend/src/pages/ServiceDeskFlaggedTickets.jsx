import FlaggedTicketsTable from "../components/FlaggedTicketsTable";
import api from "../api";
import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { toast } from "sonner";

export default function ServiceDeskFlaggedTickets() {
    const [flaggedTickets, setFlaggedTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(15);
    const [totalTickets, setTotalTickets] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");

    const [reason, setReason] = useState("");
    const [status, setStatus] = useState("");

    useEffect(() => {
        const fetchFlaggedTicketsList = async () => {
            try {
                setLoading(true);

                const response = await api.get(
                    "/tickets/flagged/list/",
                    {
                        params: {
                            page,
                            page_size: pageSize,
                            search: search || undefined,
                            reason: reason || undefined,
                            status: status || undefined,
                        },
                    }
                );

                const data = response.data;

                setFlaggedTickets(data.results || []);
                setTotalTickets(data.count || 0);

                setTotalPages(
                    Math.max(
                        1,
                        Math.ceil(
                            (data.count || 0) / pageSize
                        )
                    )
                );
            } catch {
                setFlaggedTickets([]);
                setTotalTickets(0);
                setTotalPages(1);

                toast.error(
                    "Failed to load flagged tickets."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchFlaggedTicketsList();
    }, [page, pageSize, search, reason, status]);

    const handleSearch = (event) => {
        event.preventDefault();

        setPage(1);
        setSearch(searchInput.trim());
    };

    const clearSearch = () => {
        setSearchInput("");
        setSearch("");
        setPage(1);
    };

    const handleReasonChange = (event) => {
        setReason(event.target.value);
        setPage(1);
    };

    const handleStatusChange = (event) => {
        setStatus(event.target.value);
        setPage(1);
    };

    const handlePageSizeChange = (event) => {
        setPageSize(Number(event.target.value));
        setPage(1);
    };

    const startItem =
        totalTickets === 0
            ? 0
            : (page - 1) * pageSize + 1;

    const endItem = Math.min(
        page * pageSize,
        totalTickets
    );

    return (
        <div className="min-h-full bg-gray-50">
            <div className="border-b border-gray-200 px-5 py-4">
                <h1 className="text-xl font-semibold text-gray-900">
                    Flagged Tickets
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                    Review tickets that have been flagged for additional attention.
                </p>
            </div>

            <div className="border-b border-gray-200 bg-white px-5 py-3">
                <div className="flex items-center justify-between gap-4">
                    <form
                        onSubmit={handleSearch}
                        className="relative w-full max-w-[320px]"
                    >
                        <Search
                            size={17}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />

                        <input
                            type="text"
                            value={searchInput}
                            onChange={(event) =>
                                setSearchInput(
                                    event.target.value
                                )
                            }
                            placeholder="Search ticket ID or subject..."
                            className="h-10 w-full rounded-md border border-gray-300 bg-white pl-9 pr-9 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />

                        {searchInput && (
                            <button
                                type="button"
                                onClick={clearSearch}
                                className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                            >
                                <X size={15} />
                            </button>
                        )}
                    </form>

                    <div className="flex items-center gap-3">
                        <select
                            value={reason}
                            onChange={handleReasonChange}
                            className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        >
                            <option value="">
                                All Reasons
                            </option>

                            <option value="unclear_description">
                                Unclear Description
                            </option>

                            <option value="low_confidence">
                                Low Confidence
                            </option>
                        </select>

                        <select
                            value={status}
                            onChange={handleStatusChange}
                            className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        >
                            <option value="">
                                All Statuses
                            </option>

                            <option value="pending">
                                Pending
                            </option>

                            <option value="approved">
                                Approved
                            </option>

                            <option value="rejected">
                                Rejected
                            </option>

                            <option value="resolved">
                                Resolved
                            </option>
                        </select>

                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">
                                Show
                            </span>

                            <select
                                value={pageSize}
                                onChange={
                                    handlePageSizeChange
                                }
                                className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            >
                                <option value={10}>
                                    10
                                </option>

                                <option value={15}>
                                    15
                                </option>

                                <option value={25}>
                                    25
                                </option>

                                <option value={50}>
                                    50
                                </option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white">
                <FlaggedTicketsTable
                    flaggedTickets={flaggedTickets}
                    loading={loading}
                />
            </div>

            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-5 py-3">
                <p className="text-sm text-gray-500">
                    Showing{" "}
                    <span className="font-medium text-gray-700">
                        {startItem}
                    </span>{" "}
                    to{" "}
                    <span className="font-medium text-gray-700">
                        {endItem}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium text-gray-700">
                        {totalTickets}
                    </span>{" "}
                    tickets
                </p>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() =>
                            setPage((current) =>
                                Math.max(
                                    1,
                                    current - 1
                                )
                            )
                        }
                        disabled={
                            page === 1 || loading
                        }
                        className="h-9 rounded-md border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Previous
                    </button>

                    <span className="px-2 text-sm text-gray-600">
                        Page {page} of {totalPages}
                    </span>

                    <button
                        type="button"
                        onClick={() =>
                            setPage((current) =>
                                Math.min(
                                    totalPages,
                                    current + 1
                                )
                            )
                        }
                        disabled={
                            page >= totalPages ||
                            loading
                        }
                        className="h-9 rounded-md bg-[#2563EB] px-3 text-sm font-medium text-white transition-colors hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}