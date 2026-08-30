import api from "../api";
import { useEffect, useState } from "react";
import TicketQueueSupportTable from "../components/TicketQueueSupportTable";
import {
    Search,
    ChevronLeft,
    ChevronRight,
    X,
} from "lucide-react";

export default function TicketQueueSupport() {
    const [ticketList, setTicketList] = useState([]);
    const [loading, setLoading] = useState(true);

    // SEARCH & FILTERS
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("All");
    const [priority, setPriority] = useState("All");
    const [symptomCode, setSymptomCode] = useState("All");

    // PAGINATION
    const [currentPage, setCurrentPage] = useState(1);
    const [totalTickets, setTotalTickets] = useState(0);

    const pageSize = 15;

    useEffect(() => {
        const fetchTicketQueue = async () => {
            try {
                setLoading(true);

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

                if (symptomCode !== "All") {
                    params.symptom_code = symptomCode;
                }

                const response = await api.get(
                    "/tickets/support-specialist/ticket-queue/",
                    { params }
                );

                console.log("QUEUE RESPONSE:", response.data);
                setTicketList(response.data.results);
                setTotalTickets(response.data.count);

            } catch (error) {
                console.error(
                    "Error fetching ticket queue:",
                    error
                );
            } finally {
                setLoading(false);
            }
        };

        fetchTicketQueue();
    }, [
        currentPage,
        search,
        status,
        priority,
        symptomCode,
    ]);

    // TOTAL PAGES
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
        priority !== "All" ||
        symptomCode !== "All";

    const clearFilters = () => {
        setSearch("");
        setStatus("All");
        setPriority("All");
        setSymptomCode("All");
        setCurrentPage(1);
    };

    return (
        <div className="w-full">
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

                        {/* SYMPTOM CODE */}
                        <select
                            value={symptomCode}
                            onChange={(e) => {
                                setSymptomCode(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="h-10 min-w-[165px] cursor-pointer rounded-md border border-gray-300 bg-white px-3 text-sm text-black outline-none transition-colors focus:border-[#4C4CF9]"
                        >
                            <option value="All">
                                All symptom codes
                            </option>

                            <option value="HW-001">HW-001</option>
                            <option value="HW-002">HW-002</option>
                            <option value="HW-003">HW-003</option>
                            <option value="HW-004">HW-004</option>
                            <option value="HW-005">HW-005</option>
                            <option value="HW-006">HW-006</option>

                            <option value="NW-001">NW-001</option>
                            <option value="NW-002">NW-002</option>
                            <option value="NW-003">NW-003</option>

                            <option value="SW-001">SW-001</option>
                            <option value="SW-002">SW-002</option>
                            <option value="SW-003">SW-003</option>
                            <option value="SW-004">SW-004</option>
                            <option value="SW-005">SW-005</option>

                            <option value="AC-001">AC-001</option>
                            <option value="AC-002">AC-002</option>
                            <option value="AC-003">AC-003</option>
                            <option value="AC-004">AC-004</option>
                            <option value="AC-005">AC-005</option>
                            <option value="AC-006">AC-006</option>
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
                <TicketQueueSupportTable
                    ticketList={ticketList}
                    loading={loading}
                />

                {/* PAGINATION */}
                {!loading && (
                    <div className="flex min-h-[60px] items-center justify-between border-t border-gray-300 px-5">

                        {/* SHOWING COUNT */}
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