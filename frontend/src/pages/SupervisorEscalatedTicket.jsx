import { useEffect, useState } from "react";
import {
    Search,
    Flag,
    CircleAlert,
    ShieldAlert,
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";

import api from "../api";
import SupervisorEscalatedTicketTable from "../components/EscalatedTickets/SupervisorEscalatedTicketTable";

function SummaryCard({
    title,
    value,
    icon: Icon,
    tone = "blue",
    delay = 0,
}) {
    const tones = {
        blue: {
            icon: "text-blue-600",
            box: "border-blue-300 bg-blue-50",
        },
        orange: {
            icon: "text-orange-600",
            box: "border-orange-300 bg-orange-50",
        },
        red: {
            icon: "text-red-600",
            box: "border-red-300 bg-red-50",
        },
    };

    const selectedTone = tones[tone] || tones.blue;

    return (
        <motion.div
            initial={{
                opacity: 0,
                y: 12,
            }}
            animate={{
                opacity: 1,
                y: 0,
            }}
            transition={{
                duration: 0.35,
                delay,
                ease: "easeOut",
            }}
            whileHover={{
                y: -2,
            }}
            className="
                flex min-h-[94px] items-center justify-between
                rounded-xl border border-gray-300 bg-white
                px-4 py-4
                transition-colors
                hover:bg-gray-50
                min-[1280px]:max-[1365px]:min-h-[82px]
                min-[1280px]:max-[1365px]:px-4
                min-[1280px]:max-[1365px]:py-3
                min-[1366px]:max-[1537px]:min-h-[88px]
            "
        >
            <div className="min-w-0">
                <p
                    className="
                        text-sm font-medium text-gray-500
                        min-[1280px]:max-[1365px]:text-[11px]
                        min-[1366px]:max-[1537px]:text-xs
                    "
                >
                    {title}
                </p>

                <motion.p
                    key={value}
                    initial={{
                        opacity: 0,
                        y: 4,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                    }}
                    transition={{
                        duration: 0.25,
                    }}
                    className="
                        mt-2 text-2xl font-bold leading-none text-black
                        min-[1280px]:max-[1365px]:mt-1.5
                        min-[1280px]:max-[1365px]:text-xl
                        min-[1366px]:max-[1537px]:text-xl
                    "
                >
                    {value}
                </motion.p>
            </div>

            <motion.div
                initial={{
                    opacity: 0,
                    scale: 0.85,
                }}
                animate={{
                    opacity: 1,
                    scale: 1,
                }}
                transition={{
                    duration: 0.3,
                    delay: delay + 0.08,
                }}
                whileHover={{
                    scale: 1.06,
                }}
                className={`
                    flex h-11 w-11 shrink-0
                    items-center justify-center
                    rounded-xl border
                    ${selectedTone.box}
                    min-[1280px]:max-[1365px]:h-10
                    min-[1280px]:max-[1365px]:w-10
                `}
            >
                <Icon
                    size={19}
                    strokeWidth={2}
                    className={selectedTone.icon}
                />
            </motion.div>
        </motion.div>
    );
}

export default function SupervisorEscalatedTickets() {
    const [ticketList, setTicketList] = useState([]);

    const [summary, setSummary] = useState({
        total_escalated: 0,
        critical_priority: 0,
        sla_breached: 0,
    });

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [priority, setPriority] = useState("");

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(15);

    const [totalPages, setTotalPages] = useState(1);
    const [totalTickets, setTotalTickets] = useState(0);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTickets();
    }, [status, priority, search, page, pageSize]);

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

            if (search.trim()) {
                params.search = search.trim();
            }

            const response = await api.get(
                "/tickets/supervisor/escalated/list/",
                {
                    params,
                }
            );

            const data = response.data;

            if (Array.isArray(data)) {
                setTicketList(data);
                setTotalTickets(data.length);
                setTotalPages(1);

                setSummary({
                    total_escalated: data.length,
                    critical_priority: 0,
                    sla_breached: 0,
                });
            } else {
                setTicketList(data.results || []);
                setTotalTickets(data.count || 0);

                setSummary({
                    total_escalated:
                        data.summary?.total_escalated || 0,
                    critical_priority:
                        data.summary?.critical_priority || 0,
                    sla_breached:
                        data.summary?.sla_breached || 0,
                });

                const calculatedPages = Math.ceil(
                    (data.count || 0) / pageSize
                );

                setTotalPages(calculatedPages || 1);
            }
        } catch {
            toast.error("Failed to load escalated tickets.");

            setTicketList([]);
            setTotalTickets(0);
            setTotalPages(1);

            setSummary({
                total_escalated: 0,
                critical_priority: 0,
                sla_breached: 0,
            });
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

    const handleSearchChange = (value) => {
        setSearch(value);
        setPage(1);
    };

    const handlePageSizeChange = (value) => {
        setPageSize(Number(value));
        setPage(1);
    };

    return (
        /*
         * IMPORTANT:
         * overflow-y-auto makes the whole page vertically scrollable.
         * The pagination at the bottom will always be reachable.
         */
        <div className="h-full min-h-0 overflow-y-auto overflow-x-hidden bg-gray-50">
            <div className="w-full">
                {/* HEADER */}
                <motion.div
                    initial={{
                        opacity: 0,
                        y: -8,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                    }}
                    transition={{
                        duration: 0.3,
                        ease: "easeOut",
                    }}
                    className="
                        flex flex-col gap-4
                        border-b border-gray-200
                        bg-gray-50
                        px-5 py-4
                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                        min-[1280px]:max-[1365px]:gap-2
                        min-[1280px]:max-[1365px]:px-4
                        min-[1280px]:max-[1365px]:py-3
                        min-[1366px]:max-[1537px]:gap-3
                        min-[1366px]:max-[1537px]:px-4
                        min-[1366px]:max-[1537px]:py-3.5
                    "
                >
                    <div>
                        <h1
                            className="
                                text-xl font-semibold text-gray-900
                                min-[1280px]:max-[1365px]:text-lg
                                min-[1366px]:max-[1537px]:text-lg
                            "
                        >
                            Escalated Tickets
                        </h1>

                        <p
                            className="
                                mt-0.5 text-sm text-gray-500
                                min-[1280px]:max-[1365px]:text-[11px]
                                min-[1366px]:max-[1537px]:text-xs
                            "
                        >
                            View and monitor tickets escalated by IT Support
                            Specialists.
                        </p>
                    </div>
                </motion.div>

                {/* KPI OVERVIEW */}
                <div
                    className="
                        border-b border-gray-300
                        bg-gray-50
                        p-4
                        min-[1280px]:max-[1365px]:p-3
                    "
                >
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <SummaryCard
                            title="Total Escalated"
                            value={
                                loading &&
                                summary.total_escalated === 0
                                    ? "—"
                                    : summary.total_escalated
                            }
                            icon={Flag}
                            tone="blue"
                            delay={0.05}
                        />

                        <SummaryCard
                            title="Critical Priority"
                            value={
                                loading &&
                                summary.critical_priority === 0
                                    ? "—"
                                    : summary.critical_priority
                            }
                            icon={CircleAlert}
                            tone="orange"
                            delay={0.1}
                        />

                        <SummaryCard
                            title="SLA Breached"
                            value={
                                loading &&
                                summary.sla_breached === 0
                                    ? "—"
                                    : summary.sla_breached
                            }
                            icon={ShieldAlert}
                            tone="red"
                            delay={0.15}
                        />
                    </div>
                </div>

                {/* FILTERS */}
                <motion.div
                    initial={{
                        opacity: 0,
                        y: 6,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                    }}
                    transition={{
                        duration: 0.3,
                        delay: 0.15,
                    }}
                    className="
                        border-b border-gray-200
                        bg-white
                        px-5 py-3
                        min-[1280px]:max-[1365px]:px-4
                        min-[1280px]:max-[1365px]:py-2.5
                        min-[1366px]:max-[1537px]:px-4
                        min-[1366px]:max-[1537px]:py-3
                    "
                >
                    <div
                        className="
                            flex flex-col gap-3
                            md:flex-row
                            md:items-center
                            md:justify-between
                            min-[1280px]:max-[1365px]:gap-2
                            min-[1366px]:max-[1537px]:gap-2.5
                        "
                    >
                        {/* SEARCH */}
                        <div className="relative w-full md:max-w-md">
                            <Search
                                size={17}
                                className="
                                    absolute left-3 top-1/2
                                    -translate-y-1/2
                                    text-gray-400
                                    min-[1280px]:max-[1365px]:left-2.5
                                    min-[1280px]:max-[1365px]:size-3.5
                                    min-[1366px]:max-[1537px]:left-2.5
                                    min-[1366px]:max-[1537px]:size-3.5
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
                                    focus:border-[#4C4CF9]
                                    focus:ring-2
                                    focus:ring-[#4C4CF9]/10
                                    min-[1280px]:max-[1365px]:h-9
                                    min-[1280px]:max-[1365px]:pl-8
                                    min-[1280px]:max-[1365px]:pr-2.5
                                    min-[1280px]:max-[1365px]:text-[11px]
                                    min-[1366px]:max-[1537px]:h-9
                                    min-[1366px]:max-[1537px]:pl-8
                                    min-[1366px]:max-[1537px]:pr-2.5
                                    min-[1366px]:max-[1537px]:text-xs
                                "
                            />
                        </div>

                        {/* FILTER CONTROLS */}
                        <div
                            className="
                                flex flex-wrap
                                items-center gap-3
                                min-[1280px]:max-[1365px]:gap-2
                                min-[1366px]:max-[1537px]:gap-2.5
                            "
                        >
                            {/* STATUS */}
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
                                    focus:border-[#4C4CF9]
                                    focus:ring-2
                                    focus:ring-[#4C4CF9]/10
                                    min-[1280px]:max-[1365px]:h-9
                                    min-[1280px]:max-[1365px]:px-2.5
                                    min-[1280px]:max-[1365px]:text-[11px]
                                    min-[1366px]:max-[1537px]:h-9
                                    min-[1366px]:max-[1537px]:px-2.5
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
                                    focus:border-[#4C4CF9]
                                    focus:ring-2
                                    focus:ring-[#4C4CF9]/10
                                    min-[1280px]:max-[1365px]:h-9
                                    min-[1280px]:max-[1365px]:px-2.5
                                    min-[1280px]:max-[1365px]:text-[11px]
                                    min-[1366px]:max-[1537px]:h-9
                                    min-[1366px]:max-[1537px]:px-2.5
                                    min-[1366px]:max-[1537px]:text-xs
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

                            {/* PAGE SIZE */}
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
                                    focus:border-[#4C4CF9]
                                    focus:ring-2
                                    focus:ring-[#4C4CF9]/10
                                    min-[1280px]:max-[1365px]:h-9
                                    min-[1280px]:max-[1365px]:px-2.5
                                    min-[1280px]:max-[1365px]:text-[11px]
                                    min-[1366px]:max-[1537px]:h-9
                                    min-[1366px]:max-[1537px]:px-2.5
                                    min-[1366px]:max-[1537px]:text-xs
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
                </motion.div>

                {/* TICKET TABLE */}
                <motion.div
                    initial={{
                        opacity: 0,
                    }}
                    animate={{
                        opacity: 1,
                    }}
                    transition={{
                        duration: 0.3,
                        delay: 0.2,
                    }}
                    className="bg-white"
                >
                    <SupervisorEscalatedTicketTable
                        ticketList={ticketList}
                        loading={loading}
                    />
                </motion.div>

                {/* PAGINATION */}
                <motion.div
                    initial={{
                        opacity: 0,
                        y: 6,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                    }}
                    transition={{
                        duration: 0.3,
                        delay: 0.22,
                    }}
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
                        min-[1280px]:max-[1365px]:text-[11px]
                        min-[1366px]:max-[1537px]:gap-2
                        min-[1366px]:max-[1537px]:px-4
                        min-[1366px]:max-[1537px]:py-3
                        min-[1366px]:max-[1537px]:text-xs
                    "
                >
                    <p
                        className="
                            text-sm text-gray-500
                            min-[1280px]:max-[1365px]:text-[11px]
                            min-[1366px]:max-[1537px]:text-xs
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
                        escalated tickets
                    </p>

                    <div
                        className="
                            flex items-center gap-2
                            min-[1280px]:max-[1365px]:gap-1.5
                            min-[1366px]:max-[1537px]:gap-1.5
                        "
                    >
                        {/* PREVIOUS */}
                        <motion.button
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
                            whileTap={
                                page > 1
                                    ? {
                                          scale: 0.97,
                                      }
                                    : undefined
                            }
                            className={`
                                rounded-lg border
                                px-3 py-2
                                text-sm font-medium
                                transition
                                min-[1280px]:max-[1365px]:px-2.5
                                min-[1280px]:max-[1365px]:py-1.5
                                min-[1280px]:max-[1365px]:text-[11px]
                                min-[1366px]:max-[1537px]:px-2.5
                                min-[1366px]:max-[1537px]:py-1.5
                                min-[1366px]:max-[1537px]:text-xs
                                ${
                                    page <= 1
                                        ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                                        : "cursor-pointer border-[#4C4CF9] bg-[#4C4CF9] text-white hover:bg-[#4141E8]"
                                }
                            `}
                        >
                            Previous
                        </motion.button>

                        {/* PAGE INDICATOR */}
                        <motion.span
                            key={`${page}-${totalPages}`}
                            initial={{
                                opacity: 0,
                                scale: 0.96,
                            }}
                            animate={{
                                opacity: 1,
                                scale: 1,
                            }}
                            transition={{
                                duration: 0.2,
                            }}
                            className="
                                min-w-[80px]
                                text-center
                                text-sm text-gray-600
                                min-[1280px]:max-[1365px]:min-w-[68px]
                                min-[1280px]:max-[1365px]:text-[11px]
                                min-[1366px]:max-[1537px]:min-w-[72px]
                                min-[1366px]:max-[1537px]:text-xs
                            "
                        >
                            Page {page} of {totalPages}
                        </motion.span>

                        {/* NEXT */}
                        <motion.button
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
                            whileTap={
                                page < totalPages
                                    ? {
                                          scale: 0.97,
                                      }
                                    : undefined
                            }
                            className={`
                                rounded-lg border
                                px-3 py-2
                                text-sm font-medium
                                transition
                                min-[1280px]:max-[1365px]:px-2.5
                                min-[1280px]:max-[1365px]:py-1.5
                                min-[1280px]:max-[1365px]:text-[11px]
                                min-[1366px]:max-[1537px]:px-2.5
                                min-[1366px]:max-[1537px]:py-1.5
                                min-[1366px]:max-[1537px]:text-xs
                                ${
                                    page >= totalPages
                                        ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                                        : "cursor-pointer border-[#4C4CF9] bg-[#4C4CF9] text-white hover:bg-[#4141E8]"
                                }
                            `}
                        >
                            Next
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}