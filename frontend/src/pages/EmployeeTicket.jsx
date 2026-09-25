import { useEffect, useState } from "react";
import {
    Search,
    X,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

import api from "../api";
import TicketTableEmployee from "../components/TicketTableEmployee";

export default function EmployeeTicket() {
    const [ticketList, setTicketList] = useState([]);
    const [loading, setLoading] = useState(true);

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(15);
    const [totalTickets, setTotalTickets] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");

    const [status, setStatus] = useState("");
    const [priority, setPriority] = useState("");

    useEffect(() => {
        const fetchTicketList = async () => {
            try {
                setLoading(true);

                const response = await api.get(
                    "/tickets/employee/list/",
                    {
                        params: {
                            page,
                            page_size: pageSize,
                            search: search || undefined,
                            status: status || undefined,
                            priority: priority || undefined,
                        },
                    }
                );

                const data = response.data;

                setTicketList(data.results || []);
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
                setTicketList([]);
                setTotalTickets(0);
                setTotalPages(1);
            } finally {
                setLoading(false);
            }
        };

        fetchTicketList();
    }, [page, pageSize, search, status, priority]);

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

    const handlePriorityChange = (event) => {
        setPriority(event.target.value);
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
            {/* PAGE HEADER */}
            <div className="border-b border-gray-200 px-5 py-4">
                <h1 className="text-xl font-semibold text-gray-900">
                    My Tickets
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                    View and track your submitted IT support tickets.
                </p>
            </div>

            {/* TOOLBAR */}
            <div className="border-b border-gray-200 bg-white px-5 py-3">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    {/* SEARCH */}
                    <form
                        onSubmit={handleSearch}
                        className="relative w-full lg:max-w-[320px]"
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
                                className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                            >
                                <X size={15} />
                            </button>
                        )}
                    </form>

                    {/* FILTERS */}
                    <div className="flex flex-wrap items-center gap-3">
                        {/* STATUS */}
                        <select
                            value={status}
                            onChange={handleStatusChange}
                            className="h-10 min-w-[140px] rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        >
                            <option value="">
                                All Statuses
                            </option>

                            <option value="open">
                                Open
                            </option>

                            <option value="in_progress">
                                In Progress
                            </option>

                            <option value="under_review">
                                Under Review
                            </option>

                            <option value="returned">
                                Returned
                            </option>

                            <option value="resolved">
                                Resolved
                            </option>

                            <option value="closed">
                                Closed
                            </option>
                        </select>

                        {/* PRIORITY */}
                        <select
                            value={priority}
                            onChange={handlePriorityChange}
                            className="h-10 min-w-[140px] rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        >
                            <option value="">
                                All Priorities
                            </option>

                            <option value="P1">
                                P1
                            </option>

                            <option value="P2">
                                P2
                            </option>

                            <option value="P3">
                                P3
                            </option>

                            <option value="P4">
                                P4
                            </option>

                            <option value="P5">
                                P5
                            </option>
                        </select>

                        {/* PAGE SIZE */}
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

            {/* TABLE */}
            <div className="w-full overflow-x-auto bg-white">
                <div className="min-w-[1050px]">
                    <TicketTableEmployee
                        ticketList={ticketList}
                        loading={loading}
                    />
                </div>
            </div>

            {/* PAGINATION */}
            <div className="flex flex-col gap-3 border-t border-gray-200 bg-white px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
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

                <div className="flex items-center gap-1">
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
                        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border border-gray-300 bg-white text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                        title="Previous page"
                    >
                        <ChevronLeft size={16} />
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
                            page >= totalPages || loading
                        }
                        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md bg-[#2563EB] text-white transition-colors hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-50"
                        title="Next page"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}