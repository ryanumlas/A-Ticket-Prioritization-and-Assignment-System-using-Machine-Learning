import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { toast } from "sonner";

import api from "../api";
import TicketReturnedTable from "../components/TicketReturnedTable";

export default function TicketReturnServiceDesk() {
    const [returnedRequests, setReturnedRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(15);
    const [totalRequests, setTotalRequests] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");

    const [status, setStatus] = useState("");

    useEffect(() => {
        const fetchReturnedRequests = async () => {
            try {
                setIsLoading(true);

                const response = await api.get(
                    "/tickets/return-ticket/list/",
                    {
                        params: {
                            page,
                            page_size: pageSize,
                            search: search || undefined,
                            status: status || undefined,
                        },
                    }
                );

                const data = response.data;

                setReturnedRequests(data.results || []);
                setTotalRequests(data.count || 0);

                setTotalPages(
                    Math.max(
                        1,
                        Math.ceil(
                            (data.count || 0) / pageSize
                        )
                    )
                );
            } catch (error) {
                setReturnedRequests([]);
                setTotalRequests(0);
                setTotalPages(1);

                toast.error(
                    error.response?.data?.detail ||
                        error.response?.data?.error ||
                        "Failed to load returned ticket requests."
                );
            } finally {
                setIsLoading(false);
            }
        };

        fetchReturnedRequests();
    }, [page, pageSize, search, status]);

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

    const handleStatusChange = (event) => {
        setStatus(event.target.value);
        setPage(1);
    };

    const handlePageSizeChange = (event) => {
        setPageSize(Number(event.target.value));
        setPage(1);
    };

    const startItem =
        totalRequests === 0
            ? 0
            : (page - 1) * pageSize + 1;

    const endItem = Math.min(
        page * pageSize,
        totalRequests
    );

    return (
        <div className="min-h-full bg-gray-50">
            <div className="border-b border-gray-200 px-5 py-4">
                <h1 className="text-xl font-semibold text-gray-900">
                    Returned Tickets
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                    Review ticket return requests submitted by IT support.
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

                            <option value="completed">
                                Completed
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
                <TicketReturnedTable
                    requests={returnedRequests}
                    loading={isLoading}
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
                        {totalRequests}
                    </span>{" "}
                    requests
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
                            page === 1 ||
                            isLoading
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
                            isLoading
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