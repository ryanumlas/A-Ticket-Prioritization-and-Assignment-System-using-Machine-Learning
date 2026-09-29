import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";

import api from "../api";
import TicketTableSupport from "../components/TicketTableSupport";

export default function SupportTicket() {
    const [ticketList, setTicketList] = useState([]);
    const [symptomCodes, setSymptomCodes] = useState([]);

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [priority, setPriority] = useState("");
    const [symptomCode, setSymptomCode] = useState("");

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(15);

    const [totalPages, setTotalPages] = useState(1);
    const [totalTickets, setTotalTickets] = useState(0);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSymptomCodes();
    }, []);

    useEffect(() => {
        fetchTickets();
    }, [
        status,
        priority,
        symptomCode,
        search,
        page,
        pageSize,
    ]);

    const fetchSymptomCodes = async () => {
        try {
            const response = await api.get(
                "/tickets/symptom-codes/ticket-queue/"
            );

            setSymptomCodes(response.data || []);
        } catch {
            toast.error("Failed to load symptom codes.");
            setSymptomCodes([]);
        }
    };

    const fetchTickets = async () => {
        setLoading(true);

        try {
            const params = {
                page,
                page_size: pageSize,
            };

            if (status) {
                params.status = status;
            }

            if (priority) {
                params.priority = priority;
            }

            if (symptomCode) {
                params.symptom_code = symptomCode;
            }

            if (search.trim()) {
                params.search = search.trim();
            }

            const response = await api.get(
                "/tickets/support-specialist/list/",
                {
                    params,
                }
            );

            const data = response.data;

            setTicketList(data.results || []);
            setTotalTickets(data.count || 0);

            const calculatedPages = Math.ceil(
                (data.count || 0) / pageSize
            );

            setTotalPages(calculatedPages || 1);
        } catch {
            toast.error("Failed to load support tickets.");

            setTicketList([]);
            setTotalTickets(0);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = (value) => {
        setStatus(value);
        setPage(1);
    };

    const handlePriorityChange = (value) => {
        setPriority(value);
        setPage(1);
    };

    const handleSymptomCodeChange = (value) => {
        setSymptomCode(value);
        setPage(1);
    };

    const handleSearchChange = (value) => {
        setSearch(value);
        setPage(1);
    };

    const handlePageSizeChange = (value) => {
        setPageSize(Number(value));
        setPage(1);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="w-full">
                {/* Header */}
                <div
                    className="
                        flex flex-col gap-4
                        border-b border-gray-200
                        px-5 py-4
                        sm:flex-row sm:items-center sm:justify-between

                        min-[1280px]:max-[1365px]:gap-3
                        min-[1280px]:max-[1365px]:px-4
                        min-[1280px]:max-[1365px]:py-3

                        min-[1366px]:max-[1535px]:gap-3
                        min-[1366px]:max-[1535px]:px-4
                        min-[1366px]:max-[1535px]:py-3
                    "
                >
                    <div>
                        <h1
                            className="
                                text-xl font-semibold text-gray-900

                                min-[1280px]:max-[1365px]:text-lg
                                min-[1366px]:max-[1535px]:text-lg
                            "
                        >
                            Ticket Queue
                        </h1>

                        <p
                            className="
                                mt-0.5 text-sm text-gray-500

                                min-[1280px]:max-[1365px]:text-xs
                                min-[1366px]:max-[1535px]:text-xs
                            "
                        >
                            View, manage, and monitor support tickets assigned
                            to your IT department.
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div
                    className="
                        border-b border-gray-200
                        bg-white
                        px-5 py-3

                        min-[1280px]:max-[1365px]:px-4
                        min-[1280px]:max-[1365px]:py-2.5

                        min-[1366px]:max-[1535px]:px-4
                        min-[1366px]:max-[1535px]:py-2.5
                    "
                >
                    <div
                        className="
                            flex flex-col gap-3
                            md:flex-row md:items-center md:justify-between

                            min-[1280px]:max-[1365px]:gap-2

                            min-[1366px]:max-[1535px]:gap-2
                        "
                    >
                        {/* Search */}
                        <div
                            className="
                                relative w-full min-w-0 md:max-w-md

                                min-[1280px]:max-[1365px]:max-w-[320px]

                                min-[1366px]:max-[1535px]:max-w-[340px]
                            "
                        >
                            <Search
                                size={17}
                                className="
                                    absolute left-3 top-1/2
                                    -translate-y-1/2
                                    text-gray-400

                                    min-[1280px]:max-[1365px]:left-2.5
                                    min-[1280px]:max-[1365px]:h-4
                                    min-[1280px]:max-[1365px]:w-4

                                    min-[1366px]:max-[1535px]:left-2.5
                                    min-[1366px]:max-[1535px]:h-4
                                    min-[1366px]:max-[1535px]:w-4
                                "
                            />

                            <input
                                type="text"
                                value={search}
                                onChange={(event) =>
                                    handleSearchChange(
                                        event.target.value
                                    )
                                }
                                placeholder="Search ticket ID or subject..."
                                className="
                                    h-10 w-full
                                    rounded-lg
                                    border border-gray-300
                                    bg-white
                                    pl-9 pr-3
                                    text-sm text-gray-900
                                    outline-none
                                    transition
                                    placeholder:text-gray-400
                                    focus:border-[#2563EB]
                                    focus:ring-2
                                    focus:ring-blue-100

                                    min-[1280px]:max-[1365px]:h-9
                                    min-[1280px]:max-[1365px]:pl-8
                                    min-[1280px]:max-[1365px]:pr-2
                                    min-[1280px]:max-[1365px]:text-xs

                                    min-[1366px]:max-[1535px]:h-9
                                    min-[1366px]:max-[1535px]:pl-8
                                    min-[1366px]:max-[1535px]:pr-2
                                    min-[1366px]:max-[1535px]:text-xs
                                "
                            />
                        </div>

                        {/* Filters */}
                        <div
                            className="
                                flex min-w-0 flex-wrap
                                items-center gap-3

                                min-[1280px]:max-[1365px]:gap-2

                                min-[1366px]:max-[1535px]:gap-2
                            "
                        >
                            {/* Status */}
                            <select
                                value={status}
                                onChange={(event) =>
                                    handleStatusChange(
                                        event.target.value
                                    )
                                }
                                className="
                                    h-10 cursor-pointer
                                    rounded-lg
                                    border border-gray-300
                                    bg-white
                                    px-3
                                    text-sm text-gray-700
                                    outline-none
                                    transition
                                    focus:border-[#2563EB]
                                    focus:ring-2
                                    focus:ring-blue-100

                                    min-[1280px]:max-[1365px]:h-9
                                    min-[1280px]:max-[1365px]:px-2
                                    min-[1280px]:max-[1365px]:text-xs

                                    min-[1366px]:max-[1535px]:h-9
                                    min-[1366px]:max-[1535px]:px-2
                                    min-[1366px]:max-[1535px]:text-xs
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

                            {/* Priority */}
                            <select
                                value={priority}
                                onChange={(event) =>
                                    handlePriorityChange(
                                        event.target.value
                                    )
                                }
                                className="
                                    h-10 cursor-pointer
                                    rounded-lg
                                    border border-gray-300
                                    bg-white
                                    px-3
                                    text-sm text-gray-700
                                    outline-none
                                    transition
                                    focus:border-[#2563EB]
                                    focus:ring-2
                                    focus:ring-blue-100

                                    min-[1280px]:max-[1365px]:h-9
                                    min-[1280px]:max-[1365px]:px-2
                                    min-[1280px]:max-[1365px]:text-xs

                                    min-[1366px]:max-[1535px]:h-9
                                    min-[1366px]:max-[1535px]:px-2
                                    min-[1366px]:max-[1535px]:text-xs
                                "
                            >
                                <option value="">
                                    All Priority
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

                            {/* Symptom Code */}
                            <select
                                value={symptomCode}
                                onChange={(event) =>
                                    handleSymptomCodeChange(
                                        event.target.value
                                    )
                                }
                                className="
                                    h-10 cursor-pointer
                                    rounded-lg
                                    border border-gray-300
                                    bg-white
                                    px-3
                                    text-sm text-gray-700
                                    outline-none
                                    transition
                                    focus:border-[#2563EB]
                                    focus:ring-2
                                    focus:ring-blue-100

                                    min-[1280px]:max-[1365px]:h-9
                                    min-[1280px]:max-[1365px]:px-2
                                    min-[1280px]:max-[1365px]:text-xs

                                    min-[1366px]:max-[1535px]:h-9
                                    min-[1366px]:max-[1535px]:px-2
                                    min-[1366px]:max-[1535px]:text-xs
                                "
                            >
                                <option value="">
                                    All Symptom Codes
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

                            {/* Page Size */}
                            <select
                                value={pageSize}
                                onChange={(event) =>
                                    handlePageSizeChange(
                                        event.target.value
                                    )
                                }
                                className="
                                    h-10 cursor-pointer
                                    rounded-lg
                                    border border-gray-300
                                    bg-white
                                    px-3
                                    text-sm text-gray-700
                                    outline-none
                                    transition
                                    focus:border-[#2563EB]
                                    focus:ring-2
                                    focus:ring-blue-100

                                    min-[1280px]:max-[1365px]:h-9
                                    min-[1280px]:max-[1365px]:px-2
                                    min-[1280px]:max-[1365px]:text-xs

                                    min-[1366px]:max-[1535px]:h-9
                                    min-[1366px]:max-[1535px]:px-2
                                    min-[1366px]:max-[1535px]:text-xs
                                "
                            >
                                <option value={15}>
                                    15 / page
                                </option>

                                <option value={25}>
                                    25 / page
                                </option>

                                <option value={50}>
                                    50 / page
                                </option>

                                <option value={100}>
                                    100 / page
                                </option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Ticket Table */}
                <div className="bg-white">
                    <TicketTableSupport
                        ticketList={ticketList}
                        loading={loading}
                    />
                </div>

                {/* Pagination */}
                <div
                    className="
                        flex flex-col gap-3
                        border-t border-gray-200
                        bg-white
                        px-5 py-3
                        sm:flex-row
                        sm:items-center
                        sm:justify-between

                        min-[1280px]:max-[1365px]:gap-2
                        min-[1280px]:max-[1365px]:px-4
                        min-[1280px]:max-[1365px]:py-2.5

                        min-[1366px]:max-[1535px]:gap-2
                        min-[1366px]:max-[1535px]:px-4
                        min-[1366px]:max-[1535px]:py-2.5
                    "
                >
                    <p
                        className="
                            text-sm text-gray-500

                            min-[1280px]:max-[1365px]:text-xs
                            min-[1366px]:max-[1535px]:text-xs
                        "
                    >
                        Showing{" "}
                        <span className="font-medium text-gray-900">
                            {ticketList.length}
                        </span>{" "}
                        of{" "}
                        <span className="font-medium text-gray-900">
                            {totalTickets}
                        </span>{" "}
                        tickets
                    </p>

                    <div
                        className="
                            flex items-center gap-2

                            min-[1280px]:max-[1365px]:gap-1.5
                            min-[1366px]:max-[1535px]:gap-1.5
                        "
                    >
                        {/* Previous */}
                        <button
                            type="button"
                            disabled={page <= 1}
                            onClick={() =>
                                setPage((current) =>
                                    Math.max(
                                        current - 1,
                                        1
                                    )
                                )
                            }
                            className={`rounded-lg border px-3 py-2 text-sm font-medium transition min-[1280px]:max-[1365px]:px-2.5 min-[1280px]:max-[1365px]:py-1.5 min-[1280px]:max-[1365px]:text-xs min-[1366px]:max-[1535px]:px-2.5 min-[1366px]:max-[1535px]:py-1.5 min-[1366px]:max-[1535px]:text-xs ${
                                page <= 1
                                    ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                                    : "cursor-pointer border-[#2563EB] bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
                            }`}
                        >
                            Previous
                        </button>

                        {/* Page Indicator */}
                        <span
                            className="
                                min-w-[80px]
                                text-center
                                text-sm
                                text-gray-600

                                min-[1280px]:max-[1365px]:min-w-[70px]
                                min-[1280px]:max-[1365px]:text-xs

                                min-[1366px]:max-[1535px]:min-w-[70px]
                                min-[1366px]:max-[1535px]:text-xs
                            "
                        >
                            Page {page} of {totalPages}
                        </span>

                        {/* Next */}
                        <button
                            type="button"
                            disabled={
                                page >= totalPages
                            }
                            onClick={() =>
                                setPage((current) =>
                                    Math.min(
                                        current + 1,
                                        totalPages
                                    )
                                )
                            }
                            className={`rounded-lg border px-3 py-2 text-sm font-medium transition min-[1280px]:max-[1365px]:px-2.5 min-[1280px]:max-[1365px]:py-1.5 min-[1280px]:max-[1365px]:text-xs min-[1366px]:max-[1535px]:px-2.5 min-[1366px]:max-[1535px]:py-1.5 min-[1366px]:max-[1535px]:text-xs ${
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
        </div>
    );
}