import api from "../api";
import { useEffect, useState } from "react";
import TicketTableEmployee from "../components/TicketTableEmployee";
import {
    Search,
    ChevronLeft,
    ChevronRight,
    X,
} from "lucide-react";

export default function EmployeeTicket() {
    const [ticketList, setTicketList] = useState([]);
    const [loading, setLoading] = useState(true);

    // SEARCH & FILTERS
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("All");
    const [priority, setPriority] = useState("All");

    // PAGINATION
    const [currentPage, setCurrentPage] = useState(1);
    const [totalTickets, setTotalTickets] = useState(0);

    const pageSize = 15;

    useEffect(() => {
        const fetchTicketList = async () => {
            try {
                setLoading(true);

                // QUERY PARAMETERS SENT TO DJANGO
                const params = {
                    page: currentPage,
                };

                if (search.trim()) {
                    params.search = search.trim();
                }

                if (status !== "All") {
                    params.status = status;
                }

                if (priority !== "All") {
                    params.priority = priority;
                }

                const response = await api.get(
                    "/tickets/employee/list/",
                    { params }
                );

                // PAGINATED RESPONSE FROM DJANGO
                setTicketList(response.data.results);
                setTotalTickets(response.data.count);

            } catch (error) {
                console.error(
                    "Error fetching employee tickets:",
                    error
                );
            } finally {
                setLoading(false);
            }
        };

        fetchTicketList();
    }, [
        currentPage,
        search,
        status,
        priority,
    ]);

    // TOTAL NUMBER OF PAGES
    const totalPages = Math.max(
        1,
        Math.ceil(totalTickets / pageSize)
    );

    // SHOWING X-Y
    const showingStart =
        totalTickets === 0
            ? 0
            : (currentPage - 1) * pageSize + 1;

    const showingEnd = Math.min(
        currentPage * pageSize,
        totalTickets
    );

    const changePage = (page) => {
        if (page < 1 || page > totalPages) return;

        setCurrentPage(page);
    };

    const hasActiveFilters =
        search ||
        status !== "All" ||
        priority !== "All";

    const clearFilters = () => {
        setSearch("");
        setStatus("All");
        setPriority("All");
        setCurrentPage(1);
    };

    return (
        <div className="w-full">

            {/* MAIN CONTAINER */}
            <div className="overflow-hidden rounded-lg border border-gray-300 bg-white">

                {/* TOOLBAR */}
                <div className="flex items-center justify-between gap-4 border-b border-gray-300 p-4">

                    {/* SEARCH */}
                    <div className="relative w-full max-w-[360px]">
                        <Search
                            size={17}
                            strokeWidth={2}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />

                        <input
                            type="text"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setCurrentPage(1);
                            }}
                            placeholder="Search ticket ID or subject..."
                            className="h-10 w-full rounded-md border border-gray-300 bg-white pl-9 pr-3 text-sm text-black outline-none transition-colors placeholder:text-gray-400 focus:border-[#4C4CF9]"
                        />
                    </div>

                    {/* FILTERS */}
                    <div className="flex items-center gap-2">

                        {/* STATUS */}
                        <select
                            value={status}
                            onChange={(e) => {
                                setStatus(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="h-10 min-w-[140px] cursor-pointer rounded-md border border-gray-300 bg-white px-3 text-sm text-black outline-none transition-colors focus:border-[#4C4CF9]"
                        >
                            <option value="All">
                                All statuses
                            </option>

                            <option value="Open">
                                Open
                            </option>

                            <option value="In Progress">
                                In Progress
                            </option>

                            <option value="Under Review">
                                Under Review
                            </option>

                            <option value="Returned">
                                Returned
                            </option>

                            <option value="Resolved">
                                Resolved
                            </option>

                            <option value="Closed">
                                Closed
                            </option>
                        </select>

                        {/* PRIORITY */}
                        <select
                            value={priority}
                            onChange={(e) => {
                                setPriority(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="h-10 min-w-[140px] cursor-pointer rounded-md border border-gray-300 bg-white px-3 text-sm text-black outline-none transition-colors focus:border-[#4C4CF9]"
                        >
                            <option value="All">
                                All priorities
                            </option>

                            <option value="P1">P1</option>
                            <option value="P2">P2</option>
                            <option value="P3">P3</option>
                            <option value="P4">P4</option>
                            <option value="P5">P5</option>
                        </select>

                        {/* CLEAR FILTERS */}
                        {hasActiveFilters && (
                            <button
                                type="button"
                                onClick={clearFilters}
                                title="Clear filters"
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-500 transition-colors hover:bg-gray-50 hover:text-black"
                            >
                                <X size={16} />
                            </button>
                        )}

                    </div>
                </div>

                {/* TABLE */}
                <TicketTableEmployee
                    ticketList={ticketList}
                    loading={loading}
                />

                {/* PAGINATION */}
                {!loading && (
                    <div className="flex min-h-[60px] items-center justify-between border-t border-gray-300 px-5">

                        {/* RESULT COUNT */}
                        <p className="text-sm text-gray-500">
                            Showing{" "}
                            <span className="font-medium text-black">
                                {showingStart}–{showingEnd}
                            </span>{" "}
                            of{" "}
                            <span className="font-medium text-black">
                                {totalTickets}
                            </span>{" "}
                            tickets
                        </p>

                        {/* PAGE CONTROLS */}
                        <div className="flex items-center gap-1">

                            {/* PREVIOUS */}
                            <button
                                type="button"
                                title="Previous page"
                                disabled={currentPage === 1}
                                onClick={() =>
                                    changePage(currentPage - 1)
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 bg-white text-black transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:bg-white"
                            >
                                <ChevronLeft size={16} />
                            </button>

                            {/* PAGE NUMBERS */}
                            {Array.from(
                                { length: totalPages },
                                (_, index) => index + 1
                            ).map((page) => (
                                <button
                                    key={page}
                                    type="button"
                                    onClick={() =>
                                        changePage(page)
                                    }
                                    className={`h-9 min-w-9 rounded-md border px-2 text-sm font-medium transition-colors ${
                                        currentPage === page
                                            ? "border-[#4C4CF9] bg-[#4C4CF9] text-white"
                                            : "border-gray-300 bg-white text-black hover:bg-gray-50"
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}

                            {/* NEXT */}
                            <button
                                type="button"
                                title="Next page"
                                disabled={
                                    currentPage === totalPages
                                }
                                onClick={() =>
                                    changePage(currentPage + 1)
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 bg-white text-black transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:bg-white"
                            >
                                <ChevronRight size={16} />
                            </button>

                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}