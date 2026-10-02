import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    AlertTriangle,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock3,
    RefreshCw,
    Search,
    ShieldAlert,
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";

import api from "../api";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/Topbar";
import {
    priorityColor,
    priorityLabel,
} from "../utils/priority";

const PAGE_SIZES = [10, 15, 25, 50];

const SLA_FILTERS = [
    { value: "", label: "All SLA" },
    { value: "SAFE", label: "Safe" },
    { value: "WARNING", label: "Warning" },
    { value: "CRITICAL", label: "Critical" },
    { value: "BREACHED", label: "Breached" },
];

const PRIORITY_FILTERS = [
    { value: "", label: "All Priority" },
    { value: "P1", label: "Critical (P1)" },
    { value: "P2", label: "High (P2)" },
    { value: "P3", label: "Medium (P3)" },
    { value: "P4", label: "Low (P4)" },
    { value: "P5", label: "Very Low (P5)" },
];

function getSLAStyle(status = "") {
    const value = String(status).toUpperCase();

    if (value === "SAFE") {
        return "border-blue-300 bg-blue-50 text-blue-700";
    }

    if (value === "WARNING") {
        return "border-amber-300 bg-amber-50 text-amber-700";
    }

    if (value === "CRITICAL") {
        return "border-orange-300 bg-orange-50 text-orange-700";
    }

    if (value === "BREACHED") {
        return "border-red-300 bg-red-50 text-red-700";
    }

    if (value === "MET") {
        return "border-green-300 bg-green-50 text-green-700";
    }

    return "border-gray-300 bg-gray-100 text-gray-700";
}

function getTicketStatusStyle(status = "") {
    const value = String(status).toLowerCase();

    if (value.includes("progress")) {
        return "border-amber-300 bg-amber-50 text-amber-700";
    }

    if (value.includes("open")) {
        return "border-blue-300 bg-blue-50 text-blue-700";
    }

    if (value.includes("review")) {
        return "border-purple-300 bg-purple-50 text-purple-700";
    }

    if (value.includes("returned")) {
        return "border-orange-300 bg-orange-50 text-orange-700";
    }

    if (value.includes("reopened")) {
        return "border-cyan-300 bg-cyan-50 text-cyan-700";
    }

    return "border-gray-300 bg-gray-100 text-gray-700";
}

function SLABadge({ status }) {
    if (!status) {
        return (
            <span className="text-gray-400">
                —
            </span>
        );
    }

    return (
        <span
            className={`inline-flex rounded-md border px-2 py-1 text-xs font-semibold ${getSLAStyle(
                status
            )}`}
        >
            {String(status).toUpperCase()}
        </span>
    );
}

function SLACell({
    status,
    remaining,
}) {
    const statusText = String(
        status || ""
    ).toUpperCase();

    const remainingText = String(
        remaining || ""
    ).trim();

    const remainingUpper =
        remainingText.toUpperCase();

    const statusWords = [
        "SAFE",
        "WARNING",
        "CRITICAL",
        "BREACHED",
        "MET",
    ];

    /*
     * Do not print remaining underneath
     * when the backend returned another
     * SLA status word instead of a time.
     */
    const showRemaining =
        remainingText &&
        !statusWords.includes(
            remainingUpper
        ) &&
        remainingUpper !==
            statusText;

    return (
        <div className="space-y-1.5">
            <SLABadge status={status} />

            {showRemaining && (
                <p className="text-xs text-gray-500">
                    {remainingText}
                </p>
            )}
        </div>
    );
}

function SummaryCard({
    title,
    value,
    icon: Icon,
    tone,
}) {
    const toneStyles = {
        safe:
            "border-blue-300 bg-blue-50 text-blue-700",

        warning:
            "border-amber-300 bg-amber-50 text-amber-700",

        critical:
            "border-orange-300 bg-orange-50 text-orange-700",

        breached:
            "border-red-300 bg-red-50 text-red-700",
    };

    return (
        <motion.div
            initial={{
                opacity: 0,
                y: 8,
            }}
            animate={{
                opacity: 1,
                y: 0,
            }}
            className="rounded-xl border border-gray-300 bg-white p-4"
        >
            <div className="flex items-center justify-between gap-4">
                <div>
                    <p className="text-sm font-medium text-gray-500">
                        {title}
                    </p>

                    <p className="mt-2 text-2xl font-bold text-black">
                        {value}
                    </p>
                </div>

                <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl border ${toneStyles[tone]}`}
                >
                    <Icon size={21} />
                </div>
            </div>
        </motion.div>
    );
}

export default function SLAMonitoring() {
    const navigate = useNavigate();

    const [
        tickets,
        setTickets,
    ] = useState([]);

    const [
        summary,
        setSummary,
    ] = useState({
        safe: 0,
        warning: 0,
        critical: 0,
        breached: 0,
    });

    const [
        departments,
        setDepartments,
    ] = useState([]);

    const [
        searchInput,
        setSearchInput,
    ] = useState("");

    const [
        search,
        setSearch,
    ] = useState("");

    const [
        slaStatus,
        setSlaStatus,
    ] = useState("");

    const [
        priority,
        setPriority,
    ] = useState("");

    const [
        department,
        setDepartment,
    ] = useState("");

    const [
        pageSize,
        setPageSize,
    ] = useState(15);

    const [
        page,
        setPage,
    ] = useState(1);

    const [
        count,
        setCount,
    ] = useState(0);

    const [
        totalPages,
        setTotalPages,
    ] = useState(1);

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        refreshing,
        setRefreshing,
    ] = useState(false);

    const [
        error,
        setError,
    ] = useState("");

    const fetchTickets = useCallback(
        async (
            showRefresh = false
        ) => {
            try {
                if (showRefresh) {
                    setRefreshing(true);
                } else {
                    setLoading(true);
                }

                setError("");

                const params = {
                    page,
                    page_size: pageSize,
                };

                if (search) {
                    params.search =
                        search;
                }

                if (slaStatus) {
                    params.sla_status =
                        slaStatus;
                }

                if (priority) {
                    params.priority =
                        priority;
                }

                if (department) {
                    params.department =
                        department;
                }

                const response =
                    await api.get(
                        "/tickets/supervisor/sla-monitoring/",
                        {
                            params,
                        }
                    );

                const payload =
                    response.data;

                setTickets(
                    payload.results || []
                );

                setSummary(
                    payload.summary || {
                        safe: 0,
                        warning: 0,
                        critical: 0,
                        breached: 0,
                    }
                );

                setDepartments(
                    payload.departments || []
                );

                setCount(
                    payload.count || 0
                );

                setTotalPages(
                    payload.total_pages ||
                        1
                );
            } catch (err) {
                console.error(
                    "Failed to load SLA monitoring:",
                    err
                );

                const message =
                    err?.response?.data
                        ?.detail ||
                    "Unable to load SLA monitoring.";

                setError(message);

                if (showRefresh) {
                    toast.error(
                        "Unable to refresh SLA monitoring."
                    );
                }
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        [
            page,
            pageSize,
            search,
            slaStatus,
            priority,
            department,
        ]
    );

    useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);

    useEffect(() => {
        const timer =
            window.setTimeout(
                () => {
                    setPage(1);

                    setSearch(
                        searchInput.trim()
                    );
                },
                350
            );

        return () => {
            window.clearTimeout(
                timer
            );
        };
    }, [searchInput]);

    const showingStart =
        count === 0
            ? 0
            : (page - 1) *
                  pageSize +
              1;

    const showingEnd = Math.min(
        page * pageSize,
        count
    );

    const handleOpenTicket = (
        ticket
    ) => {
        navigate(
            `/ticket/${ticket.id}`
        );
    };

    const handleRefresh =
        async () => {
            await fetchTickets(true);

            toast.success(
                "SLA monitoring refreshed."
            );
        };

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
            <div className="h-screen shrink-0">
                <Sidebar />
            </div>

            <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                <div className="shrink-0">
                    <TopBar />
                </div>

                <main className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
                    <div className="w-full">
                        {/* HEADER */}
                        <div className="flex flex-col gap-3 border-b border-gray-300 bg-white px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-black">
                                    SLA Monitoring
                                </h1>

                                <p className="mt-1 text-sm text-gray-500">
                                    Monitor active tickets approaching or exceeding response and resolution SLA deadlines.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={
                                    handleRefresh
                                }
                                disabled={
                                    refreshing
                                }
                                className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-lg border border-gray-300 bg-white px-4 text-sm font-semibold text-black transition hover:bg-gray-50 disabled:opacity-50"
                            >
                                <RefreshCw
                                    size={16}
                                    className={
                                        refreshing
                                            ? "animate-spin"
                                            : ""
                                    }
                                />

                                {refreshing
                                    ? "Refreshing..."
                                    : "Refresh"}
                            </button>
                        </div>

                        {/* KPI CARDS */}
                        <div className="grid gap-3 border-b border-gray-300 bg-gray-50 p-4 sm:grid-cols-2 xl:grid-cols-4">
                            <SummaryCard
                                title="Safe"
                                value={
                                    summary.safe
                                }
                                icon={
                                    CheckCircle2
                                }
                                tone="safe"
                            />

                            <SummaryCard
                                title="Warning"
                                value={
                                    summary.warning
                                }
                                icon={Clock3}
                                tone="warning"
                            />

                            <SummaryCard
                                title="Critical"
                                value={
                                    summary.critical
                                }
                                icon={
                                    AlertTriangle
                                }
                                tone="critical"
                            />

                            <SummaryCard
                                title="Breached"
                                value={
                                    summary.breached
                                }
                                icon={
                                    ShieldAlert
                                }
                                tone="breached"
                            />
                        </div>

                        {/* TABLE SECTION */}
                        <section className="overflow-hidden border-b border-gray-300 bg-white">
                            {/* SEARCH AND FILTERS */}
                            <div className="border-b border-gray-300 px-5 py-4">
                                <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                                    <div className="relative w-full xl:max-w-md">
                                        <Search
                                            size={
                                                17
                                            }
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                        />

                                        <input
                                            type="text"
                                            value={
                                                searchInput
                                            }
                                            onChange={(
                                                event
                                            ) => {
                                                setSearchInput(
                                                    event
                                                        .target
                                                        .value
                                                );
                                            }}
                                            placeholder="Search ticket ID or subject..."
                                            className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-3 text-sm text-black outline-none transition focus:border-[#4C4CF9]"
                                        />
                                    </div>

                                    <div className="flex flex-wrap gap-3">
                                        <select
                                            value={
                                                slaStatus
                                            }
                                            onChange={(
                                                event
                                            ) => {
                                                setPage(
                                                    1
                                                );

                                                setSlaStatus(
                                                    event
                                                        .target
                                                        .value
                                                );
                                            }}
                                            className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-black outline-none focus:border-[#4C4CF9]"
                                        >
                                            {SLA_FILTERS.map(
                                                (
                                                    option
                                                ) => (
                                                    <option
                                                        key={
                                                            option.value
                                                        }
                                                        value={
                                                            option.value
                                                        }
                                                    >
                                                        {
                                                            option.label
                                                        }
                                                    </option>
                                                )
                                            )}
                                        </select>

                                        <select
                                            value={
                                                department
                                            }
                                            onChange={(
                                                event
                                            ) => {
                                                setPage(
                                                    1
                                                );

                                                setDepartment(
                                                    event
                                                        .target
                                                        .value
                                                );
                                            }}
                                            className="h-10 max-w-[220px] rounded-lg border border-gray-300 bg-white px-3 text-sm text-black outline-none focus:border-[#4C4CF9]"
                                        >
                                            <option value="">
                                                All Departments
                                            </option>

                                            {departments.map(
                                                (
                                                    item
                                                ) => (
                                                    <option
                                                        key={
                                                            item.id
                                                        }
                                                        value={
                                                            item.id
                                                        }
                                                    >
                                                        {
                                                            item.name
                                                        }
                                                    </option>
                                                )
                                            )}
                                        </select>

                                        <select
                                            value={
                                                priority
                                            }
                                            onChange={(
                                                event
                                            ) => {
                                                setPage(
                                                    1
                                                );

                                                setPriority(
                                                    event
                                                        .target
                                                        .value
                                                );
                                            }}
                                            className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-black outline-none focus:border-[#4C4CF9]"
                                        >
                                            {PRIORITY_FILTERS.map(
                                                (
                                                    option
                                                ) => (
                                                    <option
                                                        key={
                                                            option.value
                                                        }
                                                        value={
                                                            option.value
                                                        }
                                                    >
                                                        {
                                                            option.label
                                                        }
                                                    </option>
                                                )
                                            )}
                                        </select>

                                        <select
                                            value={
                                                pageSize
                                            }
                                            onChange={(
                                                event
                                            ) => {
                                                setPage(
                                                    1
                                                );

                                                setPageSize(
                                                    Number(
                                                        event
                                                            .target
                                                            .value
                                                    )
                                                );
                                            }}
                                            className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-black outline-none focus:border-[#4C4CF9]"
                                        >
                                            {PAGE_SIZES.map(
                                                (
                                                    size
                                                ) => (
                                                    <option
                                                        key={
                                                            size
                                                        }
                                                        value={
                                                            size
                                                        }
                                                    >
                                                        {
                                                            size
                                                        }{" "}
                                                        / page
                                                    </option>
                                                )
                                            )}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* ERROR */}
                            {error ? (
                                <div className="p-10 text-center">
                                    <AlertTriangle
                                        size={30}
                                        className="mx-auto text-red-500"
                                    />

                                    <p className="mt-3 text-sm font-semibold text-black">
                                        Unable to load
                                        SLA monitoring
                                    </p>

                                    <p className="mt-1 text-sm text-gray-500">
                                        {error}
                                    </p>
                                </div>
                            ) : loading ? (
                                <div className="flex min-h-[320px] items-center justify-center">
                                    <RefreshCw
                                        size={25}
                                        className="animate-spin text-[#4C4CF9]"
                                    />
                                </div>
                            ) : tickets.length ===
                              0 ? (
                                <div className="p-10 text-center">
                                    <CheckCircle2
                                        size={32}
                                        className="mx-auto text-gray-400"
                                    />

                                    <p className="mt-3 text-sm font-semibold text-black">
                                        No active SLA
                                        tickets found
                                    </p>

                                    <p className="mt-1 text-sm text-gray-500">
                                        Try changing
                                        your search or
                                        filters.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {/* DESKTOP TABLE */}
                                    <div className="hidden overflow-x-auto lg:block">
                                        <table className="w-full min-w-[1450px] border-collapse text-left">
                                            <thead>
                                                <tr className="border-b border-gray-300 bg-gray-50 text-xs font-semibold text-black">
                                                    <th className="px-5 py-3">
                                                        Ticket ID
                                                    </th>

                                                    <th className="px-5 py-3">
                                                        Subject
                                                    </th>

                                                    <th className="px-5 py-3">
                                                        IT Department
                                                    </th>

                                                    <th className="px-5 py-3">
                                                        Assigned To
                                                    </th>

                                                    <th className="px-5 py-3">
                                                        Priority
                                                    </th>

                                                    <th className="px-5 py-3">
                                                        Status
                                                    </th>

                                                    <th className="px-5 py-3">
                                                        Response SLA
                                                    </th>

                                                    <th className="px-5 py-3">
                                                        Resolution SLA
                                                    </th>

                                                    <th className="px-5 py-3">
                                                        Overall SLA
                                                    </th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {tickets.map(
                                                    (
                                                        ticket
                                                    ) => (
                                                        <tr
                                                            key={
                                                                ticket.id
                                                            }
                                                            onClick={() =>
                                                                handleOpenTicket(
                                                                    ticket
                                                                )
                                                            }
                                                            className="cursor-pointer border-b border-gray-200 transition last:border-b-0 hover:bg-gray-50"
                                                        >
                                                            <td className="whitespace-nowrap px-5 py-4 text-sm font-bold text-black">
                                                                {
                                                                    ticket.ticket_code
                                                                }
                                                            </td>

                                                            <td className="max-w-[300px] px-5 py-4">
                                                                <p
                                                                    title={
                                                                        ticket.subject
                                                                    }
                                                                    className="truncate text-sm font-medium text-black"
                                                                >
                                                                    {
                                                                        ticket.subject
                                                                    }
                                                                </p>
                                                            </td>

                                                            <td className="px-5 py-4 text-sm text-black">
                                                                {ticket.department_name ||
                                                                    "—"}
                                                            </td>

                                                            <td className="px-5 py-4">
                                                                <p className="text-sm font-medium text-black">
                                                                    {ticket.assigned_to_name ||
                                                                        "Unassigned"}
                                                                </p>
                                                            </td>

                                                            <td className="whitespace-nowrap px-5 py-4">
                                                                {ticket.priority ? (
                                                                    <span
                                                                        className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold ${
                                                                            priorityColor[
                                                                                ticket
                                                                                    .priority
                                                                            ] ||
                                                                            "border border-gray-300 bg-gray-100 text-gray-700"
                                                                        }`}
                                                                    >
                                                                        {priorityLabel[
                                                                            ticket
                                                                                .priority
                                                                        ] ||
                                                                            ticket.priority}
                                                                    </span>
                                                                ) : (
                                                                    "—"
                                                                )}
                                                            </td>

                                                            <td className="whitespace-nowrap px-5 py-4">
                                                                <span
                                                                    className={`inline-flex rounded-md border px-2 py-1 text-xs font-semibold ${getTicketStatusStyle(
                                                                        ticket.status
                                                                    )}`}
                                                                >
                                                                    {
                                                                        ticket.status
                                                                    }
                                                                </span>
                                                            </td>

                                                            <td className="whitespace-nowrap px-5 py-4">
                                                                <SLACell
                                                                    status={
                                                                        ticket.response_sla_status
                                                                    }
                                                                    remaining={
                                                                        ticket.response_time_remaining
                                                                    }
                                                                />
                                                            </td>

                                                            <td className="whitespace-nowrap px-5 py-4">
                                                                <SLACell
                                                                    status={
                                                                        ticket.resolution_sla_status
                                                                    }
                                                                    remaining={
                                                                        ticket.resolution_time_remaining
                                                                    }
                                                                />
                                                            </td>

                                                            <td className="whitespace-nowrap px-5 py-4">
                                                                <SLABadge
                                                                    status={
                                                                        ticket.overall_sla_status
                                                                    }
                                                                />
                                                            </td>
                                                        </tr>
                                                    )
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* MOBILE */}
                                    <div className="divide-y divide-gray-200 lg:hidden">
                                        {tickets.map(
                                            (
                                                ticket
                                            ) => (
                                                <button
                                                    key={
                                                        ticket.id
                                                    }
                                                    type="button"
                                                    onClick={() =>
                                                        handleOpenTicket(
                                                            ticket
                                                        )
                                                    }
                                                    className="block w-full p-4 text-left transition hover:bg-gray-50"
                                                >
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-bold text-black">
                                                                {
                                                                    ticket.ticket_code
                                                                }
                                                            </p>

                                                            <p className="mt-1 truncate text-sm text-gray-700">
                                                                {
                                                                    ticket.subject
                                                                }
                                                            </p>
                                                        </div>

                                                        <SLABadge
                                                            status={
                                                                ticket.overall_sla_status
                                                            }
                                                        />
                                                    </div>

                                                    <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
                                                        <div>
                                                            <p className="text-gray-500">
                                                                Department
                                                            </p>

                                                            <p className="mt-1 font-medium text-black">
                                                                {ticket.department_name ||
                                                                    "—"}
                                                            </p>
                                                        </div>

                                                        <div>
                                                            <p className="text-gray-500">
                                                                Assigned To
                                                            </p>

                                                            <p className="mt-1 font-medium text-black">
                                                                {ticket.assigned_to_name ||
                                                                    "Unassigned"}
                                                            </p>
                                                        </div>

                                                        <div>
                                                            <p className="mb-1 text-gray-500">
                                                                Response SLA
                                                            </p>

                                                            <SLACell
                                                                status={
                                                                    ticket.response_sla_status
                                                                }
                                                                remaining={
                                                                    ticket.response_time_remaining
                                                                }
                                                            />
                                                        </div>

                                                        <div>
                                                            <p className="mb-1 text-gray-500">
                                                                Resolution SLA
                                                            </p>

                                                            <SLACell
                                                                status={
                                                                    ticket.resolution_sla_status
                                                                }
                                                                remaining={
                                                                    ticket.resolution_time_remaining
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                </button>
                                            )
                                        )}
                                    </div>
                                </>
                            )}

                            {/* PAGINATION */}
                            {!error &&
                                !loading && (
                                    <div className="flex flex-col gap-3 border-t border-gray-300 bg-white px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
                                        <p className="text-xs text-gray-500">
                                            Showing{" "}
                                            <span className="font-semibold text-black">
                                                {
                                                    showingStart
                                                }
                                            </span>{" "}
                                            to{" "}
                                            <span className="font-semibold text-black">
                                                {
                                                    showingEnd
                                                }
                                            </span>{" "}
                                            of{" "}
                                            <span className="font-semibold text-black">
                                                {count}
                                            </span>{" "}
                                            active tickets
                                        </p>

                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                disabled={
                                                    page <=
                                                    1
                                                }
                                                onClick={() => {
                                                    setPage(
                                                        (
                                                            current
                                                        ) =>
                                                            Math.max(
                                                                1,
                                                                current -
                                                                    1
                                                            )
                                                    );
                                                }}
                                                className="inline-flex h-9 items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 text-sm text-black transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
                                            >
                                                <ChevronLeft
                                                    size={
                                                        15
                                                    }
                                                />

                                                Previous
                                            </button>

                                            <span className="px-2 text-sm text-gray-600">
                                                Page{" "}
                                                <span className="font-semibold text-black">
                                                    {
                                                        page
                                                    }
                                                </span>{" "}
                                                of{" "}
                                                <span className="font-semibold text-black">
                                                    {
                                                        totalPages
                                                    }
                                                </span>
                                            </span>

                                            <button
                                                type="button"
                                                disabled={
                                                    page >=
                                                    totalPages
                                                }
                                                onClick={() => {
                                                    setPage(
                                                        (
                                                            current
                                                        ) =>
                                                            Math.min(
                                                                totalPages,
                                                                current +
                                                                    1
                                                            )
                                                    );
                                                }}
                                                className="inline-flex h-9 items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 text-sm text-black transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
                                            >
                                                Next

                                                <ChevronRight
                                                    size={
                                                        15
                                                    }
                                                />
                                            </button>
                                        </div>
                                    </div>
                                )}
                        </section>
                    </div>
                </main>
            </div>
        </div>
    );
}