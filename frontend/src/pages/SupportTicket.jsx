import api from "../api";
import { useEffect, useState } from "react";
import TicketTableSupport from "../components/TicketTableSupport";
import {
    Search,
    ChevronLeft,
    ChevronRight,
    X,
} from "lucide-react";

export default function SupportTicket() {
    const [ticketList, setTicketList] = useState([]);
    const [loading, setLoading] = useState(true);

    // SEARCH & FILTERS
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("All");
    const [priority, setPriority] = useState("All");

    // Selected symptom code
    const [symptomCode, setSymptomCode] = useState("All");

    // Available symptom codes for user's department
    const [symptomCodes, setSymptomCodes] = useState([]);

    // PAGINATION
    const [currentPage, setCurrentPage] = useState(1);
    const [totalTickets, setTotalTickets] = useState(0);

    const pageSize = 15;

    // FETCH TICKET LIST
    useEffect(() => {
        const fetchTicketList = async () => {
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
                    "/tickets/support-specialist/list/",
                    { params }
                );

                setTicketList(response.data.results);
                setTotalTickets(response.data.count);

            } catch (error) {
                console.error(
                    "Error fetching IT Support tickets:",
                    error.response?.data || error
                );

                setTicketList([]);
                setTotalTickets(0);

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
        symptomCode,
    ]);

    // FETCH SYMPTOM CODES FOR USER'S DEPARTMENT
    useEffect(() => {
        const fetchSymptomCodes = async () => {
            try {
                const response = await api.get(
                    "/tickets/symptom-codes/ticket-queue/"
                );

                setSymptomCodes(response.data);

            } catch (error) {
                console.error(
                    "Failed to fetch symptom codes:",
                    error.response?.data || error
                );

                setSymptomCodes([]);
            }
        };

        fetchSymptomCodes();
    }, []);

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

    // CHANGE PAGE
    const changePage = (page) => {
        if (page < 1 || page > totalPages) return;

        setCurrentPage(page);
    };

    // CHECK ACTIVE FILTERS
    const hasActiveFilters =
        search ||
        status !== "All" ||
        priority !== "All" ||
        symptomCode !== "All";

    // CLEAR FILTERS
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

                            {symptomCodes.map((symptom) => (
                                <option
                                    key={symptom.id}
                                    value={symptom.code}
                                >
                                    {symptom.code}
                                </option>
                            ))}
                        </select>

                        {/* CLEAR */}
                        {hasActiveFilters && (
                            <button
                                type="button"
                                onClick={clearFilters}
                                title="Clear filters"
                                className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-md border border-gray-300 bg-white text-gray-500 transition-colors hover:bg-gray-50 hover:text-black"
                            >
                                <X size={16} />
                            </button>
                        )}

                    </div>
                </div>

                {/* TABLE */}
                <TicketTableSupport
                    ticketList={ticketList}
                    loading={loading}
                />

                {/* PAGINATION */}
                {!loading && (
                    <div className="flex min-h-[60px] items-center justify-between border-t border-gray-300 px-5">

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

                        <div className="flex items-center gap-1">

                            {/* PREVIOUS */}
                            <button
                                type="button"
                                title="Previous page"
                                disabled={currentPage === 1}
                                onClick={() =>
                                    changePage(currentPage - 1)
                                }
                                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border border-gray-300 bg-white text-black transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:bg-white"
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
                                    className={`h-9 min-w-9 cursor-pointer rounded-md border px-2 text-sm font-medium transition-colors ${
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
                                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border border-gray-300 bg-white text-black transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:bg-white"
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