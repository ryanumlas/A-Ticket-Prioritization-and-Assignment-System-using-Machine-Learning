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
            <div
                className="
                    border-b
                    border-gray-200
                    px-5
                    py-4

                    min-[1280px]:max-[1365px]:gap-3
                    min-[1280px]:max-[1365px]:px-4
                    min-[1280px]:max-[1365px]:py-3

                    min-[1366px]:max-[1537px]:px-4
                    min-[1366px]:max-[1537px]:py-3

                    min-[1538px]:max-[1919px]:px-5
                    min-[1538px]:max-[1919px]:py-3.5
                "
            >
                <h1
                    className="
                        text-xl
                        font-semibold
                        text-gray-900

                        min-[1280px]:max-[1365px]:text-lg
                        min-[1366px]:max-[1537px]:text-lg
                    "
                >
                    My Tickets
                </h1>

                <p
                    className="
                        mt-1
                        text-sm
                        text-gray-500

                        min-[1280px]:max-[1365px]:mt-0.5
                        min-[1280px]:max-[1365px]:text-xs

                        min-[1366px]:max-[1537px]:mt-0.5
                        min-[1366px]:max-[1537px]:text-xs
                    "
                >
                    View and track your submitted IT support tickets.
                </p>
            </div>

            {/* TOOLBAR */}
            <div
                className="
                    border-b
                    border-gray-200
                    bg-white
                    px-5
                    py-3

                    min-[1280px]:max-[1365px]:px-4
                    min-[1280px]:max-[1365px]:py-2.5

                    min-[1366px]:max-[1537px]:px-4
                    min-[1366px]:max-[1537px]:py-2.5
                "
            >
                <div
                    className="
                        flex
                        flex-col
                        gap-3
                        lg:flex-row
                        lg:items-center
                        lg:justify-between

                        min-[1280px]:max-[1365px]:gap-2.5
                        min-[1366px]:max-[1537px]:gap-2.5
                    "
                >
                    {/* SEARCH */}
                    <form
                        onSubmit={handleSearch}
                        className="
                            relative
                            w-full
                            lg:max-w-[320px]

                            min-[1280px]:max-[1365px]:lg:max-w-[300px]
                            min-[1366px]:max-[1537px]:lg:max-w-[300px]
                        "
                    >
                        <Search
                            size={17}
                            className="
                                absolute
                                left-3
                                top-1/2
                                -translate-y-1/2
                                text-gray-400

                                min-[1280px]:max-[1365px]:left-2.5
                                min-[1280px]:max-[1365px]:h-4
                                min-[1280px]:max-[1365px]:w-4

                                min-[1366px]:max-[1537px]:left-2.5
                                min-[1366px]:max-[1537px]:h-4
                                min-[1366px]:max-[1537px]:w-4
                            "
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
                            className="
                                h-10
                                w-full
                                rounded-md
                                border
                                border-gray-300
                                bg-white
                                pl-9
                                pr-9
                                text-sm
                                text-gray-700
                                outline-none
                                placeholder:text-gray-400
                                focus:border-blue-500
                                focus:ring-1
                                focus:ring-blue-500

                                min-[1280px]:max-[1365px]:h-9
                                min-[1280px]:max-[1365px]:pl-8
                                min-[1280px]:max-[1365px]:pr-8
                                min-[1280px]:max-[1365px]:text-xs

                                min-[1366px]:max-[1537px]:h-9
                                min-[1366px]:max-[1537px]:pl-8
                                min-[1366px]:max-[1537px]:pr-8
                                min-[1366px]:max-[1537px]:text-xs
                            "
                        />

                        {searchInput && (
                            <button
                                type="button"
                                onClick={clearSearch}
                                className="
                                    absolute
                                    right-2
                                    top-1/2
                                    flex
                                    h-7
                                    w-7
                                    -translate-y-1/2
                                    cursor-pointer
                                    items-center
                                    justify-center
                                    rounded-md
                                    text-gray-400
                                    transition-colors
                                    hover:bg-gray-100
                                    hover:text-gray-600

                                    min-[1280px]:max-[1365px]:h-6
                                    min-[1280px]:max-[1365px]:w-6

                                    min-[1366px]:max-[1537px]:h-6
                                    min-[1366px]:max-[1537px]:w-6
                                "
                            >
                                <X
                                    size={15}
                                    className="
                                        min-[1280px]:max-[1365px]:h-3.5
                                        min-[1280px]:max-[1365px]:w-3.5

                                        min-[1366px]:max-[1537px]:h-3.5
                                        min-[1366px]:max-[1537px]:w-3.5
                                    "
                                />
                            </button>
                        )}
                    </form>

                    {/* FILTERS */}
                    <div
                        className="
                            flex
                            flex-wrap
                            items-center
                            gap-3

                            min-[1280px]:max-[1365px]:gap-2
                            min-[1366px]:max-[1537px]:gap-2
                        "
                    >
                        {/* STATUS */}
                        <select
                            value={status}
                            onChange={handleStatusChange}
                            className="
                                h-10
                                min-w-[140px]
                                rounded-md
                                border
                                border-gray-300
                                bg-white
                                px-3
                                text-sm
                                text-gray-700
                                outline-none
                                focus:border-blue-500
                                focus:ring-1
                                focus:ring-blue-500

                                min-[1280px]:max-[1365px]:h-9
                                min-[1280px]:max-[1365px]:min-w-[130px]
                                min-[1280px]:max-[1365px]:px-2
                                min-[1280px]:max-[1365px]:text-xs

                                min-[1366px]:max-[1537px]:h-9
                                min-[1366px]:max-[1537px]:min-w-[130px]
                                min-[1366px]:max-[1537px]:px-2
                                min-[1366px]:max-[1537px]:text-xs
                            "
                        >
                            <option value="">
                                All Status
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
                            className="
                                h-10
                                min-w-[140px]
                                rounded-md
                                border
                                border-gray-300
                                bg-white
                                px-3
                                text-sm
                                text-gray-700
                                outline-none
                                focus:border-blue-500
                                focus:ring-1
                                focus:ring-blue-500

                                min-[1280px]:max-[1365px]:h-9
                                min-[1280px]:max-[1365px]:min-w-[130px]
                                min-[1280px]:max-[1365px]:px-2
                                min-[1280px]:max-[1365px]:text-xs

                                min-[1366px]:max-[1537px]:h-9
                                min-[1366px]:max-[1537px]:min-w-[130px]
                                min-[1366px]:max-[1537px]:px-2
                                min-[1366px]:max-[1537px]:text-xs
                            "
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
                        <div
                            className="
                                flex
                                items-center
                                gap-2

                                min-[1280px]:max-[1365px]:gap-1.5
                                min-[1366px]:max-[1537px]:gap-1.5
                            "
                        >
                            <span
                                className="
                                    text-sm
                                    text-gray-600

                                    min-[1280px]:max-[1365px]:text-xs
                                    min-[1366px]:max-[1537px]:text-xs
                                "
                            >
                                Show
                            </span>

                            <select
                                value={pageSize}
                                onChange={
                                    handlePageSizeChange
                                }
                                className="
                                    h-10
                                    rounded-md
                                    border
                                    border-gray-300
                                    bg-white
                                    px-3
                                    text-sm
                                    text-gray-700
                                    outline-none
                                    focus:border-blue-500
                                    focus:ring-1
                                    focus:ring-blue-500

                                    min-[1280px]:max-[1365px]:h-9
                                    min-[1280px]:max-[1365px]:px-2
                                    min-[1280px]:max-[1365px]:text-xs

                                    min-[1366px]:max-[1537px]:h-9
                                    min-[1366px]:max-[1537px]:px-2
                                    min-[1366px]:max-[1537px]:text-xs
                                "
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
            <div
                className="
                    flex
                    flex-col
                    gap-3
                    border-t
                    border-gray-200
                    bg-white
                    px-5
                    py-3
                    sm:flex-row
                    sm:items-center
                    sm:justify-between

                    min-[1280px]:max-[1365px]:gap-2
                    min-[1280px]:max-[1365px]:px-4
                    min-[1280px]:max-[1365px]:py-2.5

                    min-[1366px]:max-[1537px]:gap-2
                    min-[1366px]:max-[1537px]:px-4
                    min-[1366px]:max-[1537px]:py-2.5
                "
            >
                <p
                    className="
                        text-sm
                        text-gray-500

                        min-[1280px]:max-[1365px]:text-xs
                        min-[1366px]:max-[1537px]:text-xs
                    "
                >
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

                <div
                    className="
                        flex
                        items-center
                        gap-1
                    "
                >
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
                        className="
                            flex
                            h-9
                            w-9
                            cursor-pointer
                            items-center
                            justify-center
                            rounded-md
                            border
                            border-gray-300
                            bg-white
                            text-gray-700
                            transition-colors
                            hover:bg-gray-50
                            disabled:cursor-not-allowed
                            disabled:opacity-50

                            min-[1280px]:max-[1365px]:h-8
                            min-[1280px]:max-[1365px]:w-8

                            min-[1366px]:max-[1537px]:h-8
                            min-[1366px]:max-[1537px]:w-8
                        "
                        title="Previous page"
                    >
                        <ChevronLeft
                            size={16}
                            className="
                                min-[1280px]:max-[1365px]:h-3.5
                                min-[1280px]:max-[1365px]:w-3.5

                                min-[1366px]:max-[1537px]:h-3.5
                                min-[1366px]:max-[1537px]:w-3.5
                            "
                        />
                    </button>

                    <span
                        className="
                            px-2
                            text-sm
                            text-gray-600

                            min-[1280px]:max-[1365px]:text-xs
                            min-[1366px]:max-[1537px]:text-xs
                        "
                    >
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
                        className="
                            flex
                            h-9
                            w-9
                            cursor-pointer
                            items-center
                            justify-center
                            rounded-md
                            bg-[#2563EB]
                            text-white
                            transition-colors
                            hover:bg-[#1D4ED8]
                            disabled:cursor-not-allowed
                            disabled:opacity-50

                            min-[1280px]:max-[1365px]:h-8
                            min-[1280px]:max-[1365px]:w-8

                            min-[1366px]:max-[1537px]:h-8
                            min-[1366px]:max-[1537px]:w-8
                        "
                        title="Next page"
                    >
                        <ChevronRight
                            size={16}
                            className="
                                min-[1280px]:max-[1365px]:h-3.5
                                min-[1280px]:max-[1365px]:w-3.5

                                min-[1366px]:max-[1537px]:h-3.5
                                min-[1366px]:max-[1537px]:w-3.5
                            "
                        />
                    </button>
                </div>
            </div>
        </div>
    );
}