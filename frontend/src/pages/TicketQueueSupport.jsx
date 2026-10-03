import api from "../api";
import { useEffect, useState } from "react";
import TicketQueueSupportTable from "../components/TicketQueueSupportTable";
import { Search, X } from "lucide-react";
import { toast } from "sonner";

export default function TicketQueueSupport() {
    const [ticketList, setTicketList] = useState([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [priority, setPriority] = useState("");
    const [symptomCode, setSymptomCode] = useState("");
    const [resolutionSlaStatus, setResolutionSlaStatus] = useState("");

    const [symptomCodes, setSymptomCodes] = useState([]);

    const [page, setPage] = useState(1);
    const [pageSize] = useState(15);

    const [totalPages, setTotalPages] = useState(1);
    const [totalTickets, setTotalTickets] = useState(0);

    useEffect(() => {
        fetchSymptomCodes();
    }, []);

    useEffect(() => {
        fetchTicketQueue();
    }, [
        page,
        search,
        status,
        priority,
        symptomCode,
        resolutionSlaStatus,
        pageSize,
    ]);

    const fetchTicketQueue = async () => {
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

            if (resolutionSlaStatus) {
                params.resolution_sla_status =
                    resolutionSlaStatus;
            }

            const response = await api.get(
                "/tickets/ticket-queue/list/",
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
            toast.error("Failed to load ticket queue.");

            setTicketList([]);
            setTotalTickets(0);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    };

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

    const handleResolutionSlaStatusChange = (value) => {
        setResolutionSlaStatus(value);
        setPage(1);
    };

    const clearFilters = () => {
        setSearch("");
        setStatus("");
        setPriority("");
        setSymptomCode("");
        setResolutionSlaStatus("");
        setPage(1);
    };

    const hasActiveFilters =
        search.trim() ||
        status ||
        priority ||
        symptomCode ||
        resolutionSlaStatus;

    return (
        <div className="min-h-screen overflow-hidden bg-gray-50">
            <div className="w-full">
                {/* Header */}
                <div className="flex flex-col gap-4 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between min-[1366px]:max-[1537px]:gap-3 min-[1366px]:max-[1537px]:px-4 min-[1366px]:max-[1537px]:py-3">
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900 min-[1366px]:max-[1537px]:text-lg">
                            Ticket Queue
                        </h1>

                        <p className="mt-0.5 text-sm text-gray-500 min-[1366px]:max-[1537px]:text-xs">
                            View, manage, and monitor support tickets available to your IT department.
                        </p>
                    </div>
                </div>

                {/* Search + Filters */}
                <div className="border-b border-gray-200 bg-white px-5 py-3 min-[1366px]:max-[1537px]:px-4 min-[1366px]:max-[1537px]:py-2.5">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between min-[1366px]:max-[1537px]:gap-2.5">
                        {/* Search */}
                        <div className="relative w-full md:max-w-md">
                            <Search
                                size={17}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 min-[1366px]:max-[1537px]:h-4 min-[1366px]:max-[1537px]:w-4"
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
                                className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 min-[1366px]:max-[1537px]:h-9 min-[1366px]:max-[1537px]:pl-8 min-[1366px]:max-[1537px]:pr-2.5 min-[1366px]:max-[1537px]:text-xs"
                            />
                        </div>

                        {/* Filters */}
                        <div className="flex flex-wrap items-center gap-3 min-[1366px]:max-[1537px]:gap-2">
                            {/* Status */}
                            <select
                                value={status}
                                onChange={(event) =>
                                    handleStatusChange(
                                        event.target.value
                                    )
                                }
                                className="h-10 cursor-pointer rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 min-[1366px]:max-[1537px]:h-9 min-[1366px]:max-[1537px]:px-2.5 min-[1366px]:max-[1537px]:text-xs"
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

                            {/* Priority */}
                            <select
                                value={priority}
                                onChange={(event) =>
                                    handlePriorityChange(
                                        event.target.value
                                    )
                                }
                                className="h-10 cursor-pointer rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 min-[1366px]:max-[1537px]:h-9 min-[1366px]:max-[1537px]:px-2.5 min-[1366px]:max-[1537px]:text-xs"
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

                            {/* Resolution SLA Status */}
                            <select
                                value={resolutionSlaStatus}
                                onChange={(event) =>
                                    handleResolutionSlaStatusChange(
                                        event.target.value
                                    )
                                }
                                className="h-10 cursor-pointer rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 min-[1366px]:max-[1537px]:h-9 min-[1366px]:max-[1537px]:px-2.5 min-[1366px]:max-[1537px]:text-xs"
                            >
                                <option value="">
                                    All SLA Status
                                </option>

                                <option value="SAFE">
                                    Safe
                                </option>

                                <option value="WARNING">
                                    Warning
                                </option>

                                <option value="CRITICAL">
                                    Critical
                                </option>

                                <option value="BREACHED">
                                    Breached
                                </option>

                                <option value="MET">
                                    Met
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
                                className="h-10 cursor-pointer rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 min-[1366px]:max-[1537px]:h-9 min-[1366px]:max-[1537px]:px-2.5 min-[1366px]:max-[1537px]:text-xs"
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

                            {/* Clear Filters */}
                            {hasActiveFilters && (
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    title="Clear filters"
                                    className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-500 transition hover:bg-gray-50 hover:text-gray-900 min-[1366px]:max-[1537px]:h-9 min-[1366px]:max-[1537px]:w-9"
                                >
                                    <X
                                        size={16}
                                        className="min-[1366px]:max-[1537px]:h-[15px] min-[1366px]:max-[1537px]:w-[15px]"
                                    />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Ticket Table */}
                <div className="bg-white">
                    <TicketQueueSupportTable
                        ticketList={ticketList}
                        loading={loading}
                    />
                </div>

                {/* Pagination */}
                <div className="flex flex-col gap-3 border-t border-gray-200 bg-white px-5 py-3 sm:flex-row sm:items-center sm:justify-between min-[1366px]:max-[1537px]:gap-2 min-[1366px]:max-[1537px]:px-4 min-[1366px]:max-[1537px]:py-2.5">
                    <p className="text-sm text-gray-500 min-[1366px]:max-[1537px]:text-xs">
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

                    <div className="flex items-center gap-2 min-[1366px]:max-[1537px]:gap-1.5">
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
                            className={`rounded-lg border px-3 py-2 text-sm font-medium transition min-[1366px]:max-[1537px]:px-2.5 min-[1366px]:max-[1537px]:py-1.5 min-[1366px]:max-[1537px]:text-xs ${
                                page <= 1
                                    ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                                    : "cursor-pointer border-[#2563EB] bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
                            }`}
                        >
                            Previous
                        </button>

                        {/* Page Indicator */}
                        <span className="min-w-[80px] text-center text-sm text-gray-600 min-[1366px]:max-[1537px]:min-w-[70px] min-[1366px]:max-[1537px]:text-xs">
                            Page {page} of {totalPages}
                        </span>

                        {/* Next */}
                        <button
                            type="button"
                            disabled={page >= totalPages}
                            onClick={() =>
                                setPage((current) =>
                                    Math.min(
                                        current + 1,
                                        totalPages
                                    )
                                )
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
        </div>
    );
}