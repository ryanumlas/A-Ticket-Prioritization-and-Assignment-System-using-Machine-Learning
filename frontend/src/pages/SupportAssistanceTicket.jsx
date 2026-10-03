import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";

import api from "../api";
import TicketQueueSupportTable from "../components/TicketQueueSupportTable";

export default function SupportAssistanceTickets() {
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
    const [loadingSymptomCodes, setLoadingSymptomCodes] =
        useState(true);

    // ----------------------------------------
    // Fetch symptom codes
    // ----------------------------------------
    const fetchSymptomCodes = async () => {
        setLoadingSymptomCodes(true);

        try {
            const response = await api.get(
                "/tickets/symptom-codes/ticket-queue/"
            );

            const data = response.data;

            setSymptomCodes(
                Array.isArray(data)
                    ? data
                    : data.results || []
            );
        } catch (error) {
            console.error(
                "Failed to load symptom codes:",
                error.response?.data || error
            );

            toast.error(
                "Failed to load symptom codes."
            );

            setSymptomCodes([]);
        } finally {
            setLoadingSymptomCodes(false);
        }
    };

    // ----------------------------------------
    // Fetch assisted tickets
    // ----------------------------------------
    const fetchAssistedTickets = async () => {
        setLoading(true);

        try {
            const params = {
                page,
                page_size: pageSize,
            };

            if (search.trim()) {
                params.search = search.trim();
            }

            if (status) {
                params.status = status;
            }

            if (priority) {
                params.priority = priority;
            }

            if (symptomCode) {
                params.symptom_code = symptomCode;
            }

            const response = await api.get(
                "/tickets/assistance/assisted/list/",
                {
                    params,
                }
            );

            const data = response.data;

            setTicketList(data.results || []);
            setTotalTickets(data.count || 0);
            setTotalPages(data.total_pages || 1);
        } catch (error) {
            console.error(
                "Failed to load assisted tickets:",
                error.response?.data || error
            );

            toast.error(
                error.response?.data?.message ||
                    "Failed to load assisted tickets."
            );

            setTicketList([]);
            setTotalTickets(0);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    };

    // ----------------------------------------
    // Initial data
    // ----------------------------------------
    useEffect(() => {
        fetchSymptomCodes();
    }, []);

    // ----------------------------------------
    // Refetch tickets when filters change
    // ----------------------------------------
    useEffect(() => {
        fetchAssistedTickets();
    }, [
        search,
        status,
        priority,
        symptomCode,
        page,
        pageSize,
    ]);

    // ----------------------------------------
    // Handlers
    // ----------------------------------------
    const handleSearchChange = (value) => {
        setSearch(value);
        setPage(1);
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

    const clearFilters = () => {
        setSearch("");
        setStatus("");
        setPriority("");
        setSymptomCode("");
        setPage(1);
    };

    const handlePageSizeChange = (value) => {
        setPageSize(Number(value));
        setPage(1);
    };

    const hasActiveFilters =
        search.trim() ||
        status ||
        priority ||
        symptomCode;

    return (
        <div className="min-h-screen overflow-hidden bg-gray-50">
            <div className="w-full">

                {/* -------------------------------- */}
                {/* Header */}
                {/* -------------------------------- */}
                <div
                    className="
                        flex
                        flex-col
                        gap-3
                        border-b
                        border-gray-200
                        px-5
                        py-4

                        sm:flex-row
                        sm:items-center
                        sm:justify-between

                        min-[1366px]:max-[1535px]:px-4
                        min-[1366px]:max-[1535px]:py-3
                    "
                >
                    <div>
                        <h1
                            className="
                                text-xl
                                font-semibold
                                text-gray-900

                                min-[1366px]:max-[1535px]:text-lg
                            "
                        >
                            Assisted Tickets
                        </h1>

                        <p
                            className="
                                mt-0.5
                                text-sm
                                text-gray-500

                                min-[1366px]:max-[1535px]:text-xs
                            "
                        >
                            Tickets you are currently assisting
                            with.
                        </p>
                    </div>
                </div>

                {/* -------------------------------- */}
                {/* Filters */}
                {/* -------------------------------- */}
                <div
                    className="
                        border-b
                        border-gray-200
                        bg-white
                        px-5
                        py-3

                        min-[1366px]:max-[1535px]:px-4
                        min-[1366px]:max-[1535px]:py-2.5
                    "
                >
                    <div
                        className="
                            flex
                            flex-col
                            gap-3

                            md:flex-row
                            md:items-center
                            md:justify-between

                            min-[1366px]:max-[1535px]:gap-2
                        "
                    >
                        {/* Search */}
                        <div
                            className="
                                relative
                                w-full
                                min-w-0

                                md:max-w-md

                                min-[1366px]:max-[1535px]:max-w-[340px]
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
                                    h-10
                                    w-full
                                    rounded-lg
                                    border
                                    border-gray-300
                                    bg-white
                                    pl-9
                                    pr-3
                                    text-sm
                                    text-gray-900
                                    outline-none
                                    transition
                                    placeholder:text-gray-400
                                    focus:border-[#2563EB]
                                    focus:ring-2
                                    focus:ring-blue-100

                                    min-[1366px]:max-[1535px]:h-9
                                    min-[1366px]:max-[1535px]:pl-8
                                    min-[1366px]:max-[1535px]:pr-2
                                    min-[1366px]:max-[1535px]:text-xs
                                "
                            />
                        </div>

                        {/* Filters + Page Size */}
                        <div
                            className="
                                flex
                                min-w-0
                                flex-wrap
                                items-center
                                justify-end
                                gap-2

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
                                    h-10
                                    rounded-lg
                                    border
                                    border-gray-300
                                    bg-white
                                    px-3
                                    text-sm
                                    text-gray-700
                                    outline-none
                                    focus:border-[#2563EB]
                                    focus:ring-2
                                    focus:ring-blue-100

                                    min-[1366px]:max-[1535px]:h-9
                                    min-[1366px]:max-[1535px]:px-2.5
                                    min-[1366px]:max-[1535px]:text-xs
                                "
                            >
                                <option value="">
                                    All Status
                                </option>

                                <option value="open">
                                    Open
                                </option>

                                <option value="under_review">
                                    Under Review
                                </option>

                                <option value="in_progress">
                                    In Progress
                                </option>

                                <option value="resolved">
                                    Resolved
                                </option>

                                <option value="closed">
                                    Closed
                                </option>

                                <option value="reopened">
                                    Reopened
                                </option>

                                <option value="cancelled">
                                    Cancelled
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
                                    h-10
                                    rounded-lg
                                    border
                                    border-gray-300
                                    bg-white
                                    px-3
                                    text-sm
                                    text-gray-700
                                    outline-none
                                    focus:border-[#2563EB]
                                    focus:ring-2
                                    focus:ring-blue-100

                                    min-[1366px]:max-[1535px]:h-9
                                    min-[1366px]:max-[1535px]:px-2.5
                                    min-[1366px]:max-[1535px]:text-xs
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

                            {/* Symptom Code */}
                            <select
                                value={symptomCode}
                                onChange={(event) =>
                                    handleSymptomCodeChange(
                                        event.target.value
                                    )
                                }
                                disabled={loadingSymptomCodes}
                                className="
                                    h-10
                                    min-w-[170px]
                                    rounded-lg
                                    border
                                    border-gray-300
                                    bg-white
                                    px-3
                                    text-sm
                                    text-gray-700
                                    outline-none
                                    focus:border-[#2563EB]
                                    focus:ring-2
                                    focus:ring-blue-100
                                    disabled:cursor-not-allowed
                                    disabled:bg-gray-50
                                    disabled:text-gray-400

                                    min-[1366px]:max-[1535px]:h-9
                                    min-[1366px]:max-[1535px]:min-w-[155px]
                                    min-[1366px]:max-[1535px]:px-2.5
                                    min-[1366px]:max-[1535px]:text-xs
                                "
                            >
                                <option value="">
                                    {loadingSymptomCodes
                                        ? "Loading Symptom Codes..."
                                        : "All Symptom Codes"}
                                </option>

                                {!loadingSymptomCodes &&
                                    symptomCodes.map(
                                        (item) => (
                                            <option
                                                key={item.id}
                                                value={item.code}
                                            >
                                                {item.code}
                                            </option>
                                        )
                                    )}
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
                                    h-10
                                    rounded-lg
                                    border
                                    border-gray-300
                                    bg-white
                                    px-3
                                    text-sm
                                    text-gray-700
                                    outline-none
                                    focus:border-[#2563EB]
                                    focus:ring-2
                                    focus:ring-blue-100

                                    min-[1366px]:max-[1535px]:h-9
                                    min-[1366px]:max-[1535px]:px-2.5
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

                            {/* Clear */}
                            {hasActiveFilters && (
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="
                                        h-10
                                        rounded-lg
                                        border
                                        border-gray-300
                                        bg-white
                                        px-3
                                        text-sm
                                        font-medium
                                        text-gray-600
                                        transition-colors
                                        hover:bg-gray-50

                                        min-[1366px]:max-[1535px]:h-9
                                        min-[1366px]:max-[1535px]:px-2.5
                                        min-[1366px]:max-[1535px]:text-xs
                                    "
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-white">
                    <TicketQueueSupportTable
                        ticketList={ticketList}
                        loading={loading}
                    />
                </div>


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

                        min-[1366px]:max-[1535px]:px-4
                        min-[1366px]:max-[1535px]:py-2.5
                    "
                >
                    {/* Total */}
                    <p
                        className="
                            text-sm
                            text-gray-500

                            min-[1366px]:max-[1535px]:text-xs
                        "
                    >
                        Showing{" "}
                        <span className="font-medium text-gray-900">
                            {totalTickets}
                        </span>{" "}
                        of{" "}
                        <span className="font-medium text-gray-900">
                            {totalTickets}
                        </span>{" "}
                        assisted tickets
                    </p>

                    {/* Pagination */}
                    <div className="flex items-center gap-2">
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
                            className="
                                rounded-lg
                                border
                                border-gray-300
                                bg-white
                                px-3
                                py-2
                                text-xs
                                font-medium
                                text-gray-700
                                transition-colors
                                hover:bg-gray-50
                                disabled:cursor-not-allowed
                                disabled:text-gray-400
                            "
                        >
                            Previous
                        </button>

                        {/* Page */}
                        <span
                            className="
                                min-w-[90px]
                                text-center
                                text-xs
                                text-gray-600
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
                            className="
                                rounded-lg
                                border
                                border-gray-300
                                bg-white
                                px-3
                                py-2
                                text-xs
                                font-medium
                                text-gray-700
                                transition-colors
                                hover:bg-gray-50
                                disabled:cursor-not-allowed
                                disabled:text-gray-400
                            "
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}