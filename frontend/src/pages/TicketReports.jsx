import { useEffect, useMemo, useState } from "react";
import {
    Activity,
    AlertTriangle,
    BarChart3,
    CalendarDays,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    Clock3,
    FileText,
    Flag,
    Monitor,
    RefreshCw,
    RotateCcw,
    Search,
    ShieldAlert,
    Tag,
    TrendingUp,
    Download,
    FileSpreadsheet,
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

import api from "../api";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/Topbar";
import { priorityLabel, priorityColor } from "../utils/priority";

const BRAND = "#4C4CF9";
const RESOLUTION_PAGE_SIZE = 8;

const DATE_FILTERS = [
    { value: "overall", label: "Overall" },
    { value: "today", label: "Today" },
    { value: "7days", label: "Last 7 Days" },
    { value: "30days", label: "Last 30 Days" },
    { value: "this_month", label: "This Month" },
    { value: "last_month", label: "Last Month" },
    { value: "custom", label: "Custom Range" },
];

const PRIORITY_CHART_COLORS = {
    P1: "#dc2626",
    P2: "#ea580c",
    P3: "#ca8a04",
    P4: "#16a34a",
    P5: "#2563eb",
};

const STATUS_CHART_COLORS = {
    open: "#2563eb",
    in_progress: "#4C4CF9",
    under_review: "#f59e0b",
    returned: "#f97316",
    resolved: "#16a34a",
    closed: "#64748b",
    reopened: "#8b5cf6",
    cancelled: "#dc2626",
};

const FALLBACK_CHART_COLORS = [
    BRAND,
    "#16a34a",
    "#f59e0b",
    "#dc2626",
    "#0891b2",
    "#8b5cf6",
    "#64748b",
];

function toDateInputValue(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function getDateRange(filter) {
    if (filter === "overall") {
        return { start: "", end: "" };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let start = new Date(today);
    let end = new Date(today);

    switch (filter) {
        case "today":
            break;
        case "7days":
            start.setDate(today.getDate() - 6);
            break;
        case "30days":
            start.setDate(today.getDate() - 29);
            break;
        case "this_month":
            start = new Date(today.getFullYear(), today.getMonth(), 1);
            end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            break;
        case "last_month":
            start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            end = new Date(today.getFullYear(), today.getMonth(), 0);
            break;
        default:
            break;
    }

    return {
        start: toDateInputValue(start),
        end: toDateInputValue(end),
    };
}

function formatDate(dateValue) {
    if (!dateValue) return "—";
    const date = new Date(`${dateValue}T00:00:00`);
    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

function formatDateTime(dateValue) {
    if (!dateValue) return "—";
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

function formatDuration(seconds) {
    const totalSeconds = Number(seconds || 0);
    if (!totalSeconds) return "0m";

    const totalMinutes = Math.round(totalSeconds / 60);
    const days = Math.floor(totalMinutes / 1440);
    const hours = Math.floor((totalMinutes % 1440) / 60);
    const minutes = totalMinutes % 60;

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
}

function formatChartDate(dateValue) {
    if (!dateValue) return "";
    const date = new Date(`${dateValue}T00:00:00`);
    return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
    });
}

function getStatusStyle(status = "") {
    const value = status.toLowerCase();

    if (value === "pending") {
        return "border-amber-300 bg-amber-50 text-amber-700";
    }

    if (value === "approved" || value === "resolved") {
        return "border-green-300 bg-green-50 text-green-700";
    }

    if (value === "rejected") {
        return "border-red-300 bg-red-50 text-red-700";
    }

    return "border-gray-300 bg-gray-100 text-gray-700";
}

function getRecurrenceStyle(level = "") {
    const value = level.toLowerCase();

    if (value === "high") {
        return "border-red-300 bg-red-50 text-red-700";
    }

    if (value === "review") {
        return "border-amber-300 bg-amber-50 text-amber-700";
    }

    return "border-gray-300 bg-gray-100 text-gray-700";
}

function StatusBadge({ status, count }) {
    return (
        <span
            className={`inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium capitalize ${getStatusStyle(
                status
            )}`}
        >
            {status?.replaceAll("_", " ") || "Unknown"}
            {count !== undefined ? ` · ${count}` : ""}
        </span>
    );
}

function EmptyState({ message = "No report data available for this period." }) {
    return (
        <div className="flex min-h-[180px] items-center justify-center rounded-lg border border-dashed border-gray-300 p-6 text-center">
            <div>
                <FileText size={28} className="mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-500">{message}</p>
            </div>
        </div>
    );
}

function SectionCard({ title, description, icon: Icon, children, className = "" }) {
    return (
        <section className={`rounded-xl border border-gray-300 bg-white ${className}`}>
            <div className="flex items-start gap-3 border-b border-gray-200 px-4 py-4 sm:px-5">
                {Icon && (
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                        <Icon size={18} className="text-black" />
                    </div>
                )}

                <div className="min-w-0">
                    <h2 className="text-base font-semibold text-black sm:text-lg">
                        {title}
                    </h2>
                    {description && (
                        <p className="mt-0.5 text-xs leading-5 text-gray-500 sm:text-sm">
                            {description}
                        </p>
                    )}
                </div>
            </div>

            <div className="p-4 sm:p-5">{children}</div>
        </section>
    );
}

function KpiCard({ title, value, description, icon: Icon }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
            className="rounded-xl border border-gray-300 bg-white p-4 sm:p-5"
        >
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <p className="text-sm text-gray-500">{title}</p>
                    <p className="mt-2 break-words text-2xl font-bold text-black sm:text-3xl">
                        {value}
                    </p>
                </div>

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EEEEFF]">
                    <Icon size={19} className="text-[#4C4CF9]" />
                </div>
            </div>

            <p className="mt-3 text-xs leading-5 text-gray-500">{description}</p>
        </motion.div>
    );
}

function ChartTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;

    return (
        <div className="rounded-lg border border-gray-300 bg-white px-3 py-2">
            {label && <p className="mb-1 text-xs font-semibold text-black">{label}</p>}
            {payload.map((item) => (
                <div
                    key={`${item.name}-${item.value}`}
                    className="flex items-center justify-between gap-5 text-xs"
                >
                    <div className="flex items-center gap-2 text-gray-600">
                        <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: item.color || item.payload?.fill }}
                        />
                        {item.name}
                    </div>
                    <span className="font-semibold text-black">{item.value}</span>
                </div>
            ))}
        </div>
    );
}

function WorkstationCard({ item }) {
    const [expanded, setExpanded] = useState(false);
    const codes = item.ticket_codes || [];
    const visibleCodes = expanded ? codes : codes.slice(0, 3);
    const hiddenCount = Math.max(0, codes.length - 3);

    return (
        <div className="rounded-lg border border-gray-300 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="text-base font-semibold text-black">{item.workstation}</p>
                        <span
                            className={`inline-flex rounded-md border px-2 py-1 text-xs font-medium capitalize ${getRecurrenceStyle(
                                item.recurrence_level
                            )}`}
                        >
                            {item.recurrence_level}
                        </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                        {item.ticket_count} related ticket
                        {item.ticket_count === 1 ? "" : "s"} in this report period
                    </p>
                </div>

                <div className="shrink-0 rounded-lg bg-gray-100 px-3 py-2 text-center">
                    <p className="text-lg font-bold text-black">{item.ticket_count}</p>
                    <p className="text-[10px] uppercase tracking-wide text-gray-500">
                        Tickets
                    </p>
                </div>
            </div>

            <div className="mt-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Related Tickets
                </p>

                <div className="flex flex-wrap gap-2">
                    {visibleCodes.map((code) => (
                        <span
                            key={code}
                            className="rounded-md border border-gray-300 bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700"
                        >
                            {code}
                        </span>
                    ))}
                </div>

                {codes.length > 3 && (
                    <button
                        type="button"
                        onClick={() => setExpanded((value) => !value)}
                        className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[#4C4CF9] hover:underline"
                    >
                        {expanded ? (
                            <>
                                Show less <ChevronUp size={14} />
                            </>
                        ) : (
                            <>
                                +{hiddenCount} more <ChevronDown size={14} />
                            </>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
}

export default function TicketReports() {
    const [dateFilter, setDateFilter] = useState("overall");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [resolutionSearch, setResolutionSearch] = useState("");
    const [resolutionPage, setResolutionPage] = useState(1);
    const [exporting, setExporting] = useState(false);

    const handleExportExcel = async () => {
        if (dateFilter === "custom") {
            if (!startDate || !endDate) {
                toast.error("Please select both start and end dates.");
                return;
            }

            if (startDate > endDate) {
                toast.error("Start date cannot be after end date.");
                return;
            }
        }

        try {
            setExporting(true);

            const params =
                dateFilter === "overall"
                    ? {}
                    : {
                        start_date: startDate,
                        end_date: endDate,
                    };

            const response = await api.get(
                "/tickets/supervisor/reports/export/",
                {
                    params,
                    responseType: "blob",
                }
            );

            const blob = new Blob([response.data], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");

            link.href = url;

            link.download =
                dateFilter === "overall"
                    ? "IT_Reports_Overall.xlsx"
                    : `IT_Reports_${startDate}_to_${endDate}.xlsx`;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            window.URL.revokeObjectURL(url);

            toast.success("Excel report exported successfully.");
        } catch (error) {
            console.error("Excel export failed:", error);
            toast.error("Unable to export the Excel report.");
        } finally {
            setExporting(false);
        }
    };

    const fetchReport = async (start = startDate, end = endDate, filter = dateFilter) => {
        if (filter === "custom") {
            if (!start || !end) {
                toast.error("Please select both start and end dates.");
                return;
            }

            if (start > end) {
                toast.error("Start date cannot be after end date.");
                return;
            }
        }

        try {
            setResolutionPage(1);
            setLoading(true);
            setError("");

            const params =
                filter === "overall"
                    ? {}
                    : {
                          start_date: start,
                          end_date: end,
                      };

            const response = await api.get(
                "/tickets/supervisor/reports/tickets/",
                { params }
            );

            setData(response.data);
        } catch (err) {
            console.error("Failed to load ticket reports:", err);

            const message =
                err?.response?.data?.detail ||
                "Unable to load ticket reports.";

            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport("", "", "overall");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handlePresetChange = (value) => {
        setDateFilter(value);

        if (value === "custom") return;

        const range = getDateRange(value);
        setStartDate(range.start);
        setEndDate(range.end);
        fetchReport(range.start, range.end, value);
    };

    const handleApplyCustomRange = () => {
        fetchReport(startDate, endDate, "custom");
    };

    const summary = data?.summary || {};

    const ticketVolume = useMemo(
        () =>
            (data?.ticket_volume || []).map((item) => ({
                ...item,
                displayDate: formatChartDate(item.date),
            })),
        [data]
    );

    const statusData = useMemo(
        () =>
            (data?.tickets_by_status || []).map((item) => ({
                code: item.status,
                name: item.label,
                count: item.count,
            })),
        [data]
    );

    const priorityData = useMemo(
        () =>
            (data?.tickets_by_priority || []).map((item) => ({
                code: item.priority,
                name: priorityLabel[item.priority] || item.priority,
                count: item.count,
            })),
        [data]
    );

    const categoryData = useMemo(
        () =>
            (data?.tickets_by_category || []).map((item) => ({
                name: item.category,
                count: item.count,
            })),
        [data]
    );

    const departmentData = useMemo(
        () =>
            (data?.tickets_by_department || []).map((item) => ({
                name: item.department,
                count: item.count,
            })),
        [data]
    );

    const filteredResolutions = useMemo(() => {
        const items = data?.resolution_remarks || [];
        const search = resolutionSearch.trim().toLowerCase();

        if (!search) return items;

        return items.filter((item) =>
            [
                item.ticket_code,
                item.subject,
                item.priority,
                item.category,
                item.department,
                item.resolved_by,
                item.remarks,
            ]
                .filter(Boolean)
                .some((value) =>
                    String(value).toLowerCase().includes(search)
                )
        );
    }, [data, resolutionSearch]);

    const resolutionTotalPages = Math.max(
        1,
        Math.ceil(filteredResolutions.length / RESOLUTION_PAGE_SIZE)
    );

    const paginatedResolutions = useMemo(() => {
        const start = (resolutionPage - 1) * RESOLUTION_PAGE_SIZE;
        return filteredResolutions.slice(
            start,
            start + RESOLUTION_PAGE_SIZE
        );
    }, [filteredResolutions, resolutionPage]);

    useEffect(() => {
        setResolutionPage(1);
    }, [resolutionSearch]);

    const periodText =
        dateFilter === "overall"
            ? "Overall · All available ticket data"
            : startDate && endDate
              ? `${formatDate(startDate)} — ${formatDate(endDate)}`
              : "Select a custom date range";

    const reportContent = (
        <div className="mx-auto w-full max-w-[1800px] p-4 sm:p-5 lg:p-6 xl:p-8">
            <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <FileText size={22} className="text-[#4C4CF9]" />
                        <h1 className="text-xl font-bold text-black sm:text-2xl">
                            Ticket Reports
                        </h1>
                    </div>
                    <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">
                        Review ticket volume, resolution performance, workflow
                        activity, and recurring IT issues.
                    </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <CalendarDays size={15} />
                        <span>{periodText}</span>
                    </div>

                    <button
                        type="button"
                        onClick={handleExportExcel}
                        disabled={exporting || loading}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-green-700 bg-green-600 px-4 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {exporting ? (
                            <RefreshCw
                                size={17}
                                className="animate-spin"
                            />
                        ) : (
                            <FileSpreadsheet size={18} />
                        )}

                        {exporting
                            ? "Exporting..."
                            : "Export Excel"}
                    </button>
                </div>
            </div>

            <div className="mb-5 rounded-xl border border-gray-300 bg-white p-4">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                    <div className="min-w-0 flex-1">
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Report Period
                        </label>

                        <div className="flex flex-wrap gap-2">
                            {DATE_FILTERS.map((filter) => (
                                <button
                                    key={filter.value}
                                    type="button"
                                    onClick={() =>
                                        handlePresetChange(filter.value)
                                    }
                                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                                        dateFilter === filter.value
                                            ? "border-[#4C4CF9] bg-[#4C4CF9] text-white"
                                            : "border-gray-300 bg-white text-black hover:bg-gray-100"
                                    }`}
                                >
                                    {filter.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {dateFilter === "custom" && (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-gray-500">
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(event) =>
                                        setStartDate(event.target.value)
                                    }
                                    className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-black outline-none focus:border-[#4C4CF9]"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-gray-500">
                                    End Date
                                </label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(event) =>
                                        setEndDate(event.target.value)
                                    }
                                    className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-black outline-none focus:border-[#4C4CF9]"
                                />
                            </div>

                            <button
                                type="button"
                                onClick={handleApplyCustomRange}
                                disabled={loading}
                                className="flex h-10 items-center justify-center gap-2 rounded-lg bg-[#4C4CF9] px-4 text-sm font-medium text-white transition hover:bg-[#4141df] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {loading ? (
                                    <RefreshCw size={16} className="animate-spin" />
                                ) : (
                                    <Search size={16} />
                                )}
                                Apply
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {error && (
                <div className="mb-5 rounded-xl border border-red-300 bg-red-50 p-4">
                    <div className="flex items-start gap-3">
                        <AlertTriangle
                            size={18}
                            className="mt-0.5 shrink-0 text-red-600"
                        />
                        <div>
                            <p className="text-sm font-semibold text-black">
                                Report could not be loaded
                            </p>
                            <p className="mt-1 text-sm text-gray-600">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
                <KpiCard
                    title="Total Tickets"
                    value={summary.total_tickets ?? 0}
                    description="Tickets submitted in the selected period."
                    icon={FileText}
                />
                <KpiCard
                    title="Resolved"
                    value={summary.resolved_tickets ?? 0}
                    description="Submitted tickets with a recorded resolution."
                    icon={CheckCircle2}
                />
                <KpiCard
                    title="Resolution Rate"
                    value={`${Number(summary.resolution_rate || 0).toFixed(2)}%`}
                    description="Resolved tickets as a percentage of submitted tickets."
                    icon={TrendingUp}
                />
                <KpiCard
                    title="SLA Breached"
                    value={summary.breached_tickets ?? 0}
                    description="Tickets with a response or resolution SLA breach."
                    icon={ShieldAlert}
                />
                <KpiCard
                    title="Escalated"
                    value={summary.escalated_tickets ?? 0}
                    description="Tickets marked as escalated."
                    icon={Flag}
                />
                <KpiCard
                    title="Avg. Resolution"
                    value={formatDuration(summary.average_resolution_seconds)}
                    description="Average actual time from submission to resolution."
                    icon={Clock3}
                />
            </div>

            <div className="mb-5">
                <SectionCard
                    title="Ticket Volume"
                    description="Submitted and resolved ticket activity across the selected report period."
                    icon={Activity}
                >
                    {ticketVolume.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <div className="h-[300px] w-full sm:h-[360px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                    data={ticketVolume}
                                    margin={{
                                        top: 12,
                                        right: 18,
                                        left: -10,
                                        bottom: 5,
                                    }}
                                >
                                    <CartesianGrid
                                        stroke="#e5e7eb"
                                        strokeDasharray="4 4"
                                        vertical={false}
                                    />
                                    <XAxis
                                        dataKey="displayDate"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: "#6b7280" }}
                                    />
                                    <YAxis
                                        allowDecimals={false}
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: "#6b7280" }}
                                    />
                                    <Tooltip content={<ChartTooltip />} />
                                    <Legend
                                        iconType="circle"
                                        wrapperStyle={{ fontSize: 12 }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="submitted"
                                        name="Submitted"
                                        stroke={BRAND}
                                        strokeWidth={3}
                                        dot={{ r: 3, fill: BRAND }}
                                        activeDot={{ r: 5 }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="resolved"
                                        name="Resolved"
                                        stroke="#16a34a"
                                        strokeWidth={3}
                                        dot={{ r: 3, fill: "#16a34a" }}
                                        activeDot={{ r: 5 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </SectionCard>
            </div>

            <div className="mb-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
                <SectionCard
                    title="Tickets by Status"
                    description="Current status distribution for tickets submitted in the selected period."
                    icon={BarChart3}
                >
                    {statusData.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_180px] lg:items-center">
                            <div className="h-[280px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={statusData}
                                            dataKey="count"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={62}
                                            outerRadius={96}
                                            paddingAngle={3}
                                            stroke="white"
                                            strokeWidth={3}
                                        >
                                            {statusData.map((item, index) => (
                                                <Cell
                                                    key={item.code}
                                                    fill={
                                                        STATUS_CHART_COLORS[
                                                            item.code
                                                        ] ||
                                                        FALLBACK_CHART_COLORS[
                                                            index %
                                                                FALLBACK_CHART_COLORS.length
                                                        ]
                                                    }
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<ChartTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="space-y-2">
                                {statusData.map((item, index) => (
                                    <div
                                        key={item.code}
                                        className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 px-3 py-2"
                                    >
                                        <div className="flex min-w-0 items-center gap-2">
                                            <span
                                                className="h-2.5 w-2.5 shrink-0 rounded-full"
                                                style={{
                                                    backgroundColor:
                                                        STATUS_CHART_COLORS[
                                                            item.code
                                                        ] ||
                                                        FALLBACK_CHART_COLORS[
                                                            index %
                                                                FALLBACK_CHART_COLORS.length
                                                        ],
                                                }}
                                            />
                                            <span className="truncate text-xs text-gray-600">
                                                {item.name}
                                            </span>
                                        </div>
                                        <span className="text-sm font-semibold text-black">
                                            {item.count}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </SectionCard>

                <SectionCard
                    title="Tickets by Priority"
                    description="Ticket distribution across the assigned priority levels."
                    icon={AlertTriangle}
                >
                    {priorityData.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <div className="h-[320px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={priorityData}
                                    margin={{
                                        top: 10,
                                        right: 10,
                                        left: -10,
                                        bottom: 15,
                                    }}
                                >
                                    <CartesianGrid
                                        stroke="#e5e7eb"
                                        strokeDasharray="4 4"
                                        vertical={false}
                                    />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        interval={0}
                                        tick={{
                                            fontSize: 11,
                                            fill: "#6b7280",
                                        }}
                                    />
                                    <YAxis
                                        allowDecimals={false}
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: "#6b7280" }}
                                    />
                                    <Tooltip content={<ChartTooltip />} />
                                    <Bar
                                        dataKey="count"
                                        name="Tickets"
                                        radius={[7, 7, 0, 0]}
                                        maxBarSize={56}
                                    >
                                        {priorityData.map((item) => (
                                            <Cell
                                                key={item.code}
                                                fill={
                                                    PRIORITY_CHART_COLORS[
                                                        item.code
                                                    ] || BRAND
                                                }
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </SectionCard>
            </div>

            <div className="mb-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
                <SectionCard
                    title="Tickets by Category"
                    description="Most common ticket categories during the selected period."
                    icon={Tag}
                >
                    {categoryData.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <div className="h-[320px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={categoryData}
                                    layout="vertical"
                                    margin={{
                                        top: 5,
                                        right: 25,
                                        left: 30,
                                        bottom: 5,
                                    }}
                                >
                                    <CartesianGrid
                                        stroke="#e5e7eb"
                                        strokeDasharray="4 4"
                                        horizontal={false}
                                    />
                                    <XAxis
                                        type="number"
                                        allowDecimals={false}
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: "#6b7280" }}
                                    />
                                    <YAxis
                                        type="category"
                                        dataKey="name"
                                        width={125}
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 11, fill: "#374151" }}
                                    />
                                    <Tooltip content={<ChartTooltip />} />
                                    <Bar
                                        dataKey="count"
                                        name="Tickets"
                                        fill={BRAND}
                                        radius={[0, 7, 7, 0]}
                                        maxBarSize={32}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </SectionCard>

                <SectionCard
                    title="Tickets by IT Department"
                    description="Ticket workload distribution across IT departments."
                    icon={BarChart3}
                >
                    {departmentData.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <div className="h-[320px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={departmentData}
                                    layout="vertical"
                                    margin={{
                                        top: 5,
                                        right: 25,
                                        left: 50,
                                        bottom: 5,
                                    }}
                                >
                                    <CartesianGrid
                                        stroke="#e5e7eb"
                                        strokeDasharray="4 4"
                                        horizontal={false}
                                    />
                                    <XAxis
                                        type="number"
                                        allowDecimals={false}
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: "#6b7280" }}
                                    />
                                    <YAxis
                                        type="category"
                                        dataKey="name"
                                        width={165}
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fill: "#374151" }}
                                    />
                                    <Tooltip content={<ChartTooltip />} />
                                    <Bar
                                        dataKey="count"
                                        name="Tickets"
                                        fill={BRAND}
                                        radius={[0, 7, 7, 0]}
                                        maxBarSize={32}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </SectionCard>
            </div>

            <div className="mb-5">
                <SectionCard
                    title="Workflow Activity"
                    description="Ticket activity requiring review or additional workflow actions."
                    icon={RotateCcw}
                >
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        {[
                            {
                                title: "Returned Tickets",
                                icon: RotateCcw,
                                data: data?.returned_tickets,
                                empty: "No return activity",
                            },
                            {
                                title: "Priority Requests",
                                icon: TrendingUp,
                                data: data?.priority_change_requests,
                                empty: "No priority requests",
                            },
                            {
                                title: "Review Flags",
                                icon: Flag,
                                data: data?.review_flags,
                                empty: "No review flags",
                            },
                        ].map((item) => {
                            const Icon = item.icon;
                            const breakdown = item.data?.breakdown || [];

                            return (
                                <div
                                    key={item.title}
                                    className="rounded-lg border border-gray-300 p-4"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-sm text-gray-500">
                                                {item.title}
                                            </p>
                                            <p className="mt-1 text-2xl font-bold text-black">
                                                {item.data?.total ?? 0}
                                            </p>
                                        </div>
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100">
                                            <Icon size={18} className="text-gray-600" />
                                        </div>
                                    </div>

                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {breakdown.map((row) => (
                                            <StatusBadge
                                                key={row.status}
                                                status={row.status}
                                                count={row.count}
                                            />
                                        ))}

                                        {!breakdown.length && (
                                            <span className="text-xs text-gray-400">
                                                {item.empty}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </SectionCard>
            </div>

            <div className="mb-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
                <SectionCard
                    title="Recurring Workstation Issues"
                    description="Repeated workstation incidents that may need Supervisor review. This does not automatically mean replacement."
                    icon={Monitor}
                >
                    {!data?.recurring_workstations?.length ? (
                        <EmptyState message="No recurring workstation issues found." />
                    ) : (
                        <div className="grid gap-3">
                            {data.recurring_workstations.map((item) => (
                                <WorkstationCard
                                    key={item.workstation}
                                    item={item}
                                />
                            ))}
                        </div>
                    )}
                </SectionCard>

                <SectionCard
                    title="Recurring Problems"
                    description="Repeated symptom codes found across tickets submitted during the selected period."
                    icon={Activity}
                >
                    {!data?.recurring_problems?.length ? (
                        <EmptyState message="No recurring problems found." />
                    ) : (
                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                            {data.recurring_problems.map((item) => (
                                <div
                                    key={item.symptom_code_id}
                                    className="rounded-lg border border-gray-300 p-4"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                                Symptom Code
                                            </p>
                                            <p className="mt-1 text-base font-semibold text-black">
                                                {item.symptom_code}
                                            </p>
                                            <p className="mt-2 text-xs leading-5 text-gray-500">
                                                Repeated issue detected across multiple
                                                tickets.
                                            </p>
                                        </div>

                                        <div className="shrink-0 rounded-lg bg-[#EEEEFF] px-3 py-2 text-center">
                                            <p className="text-lg font-bold text-[#4C4CF9]">
                                                {item.ticket_count}
                                            </p>
                                            <p className="text-[10px] uppercase tracking-wide text-gray-500">
                                                Tickets
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </SectionCard>
            </div>

            <SectionCard
                title="Resolution Documentation"
                description="Resolved tickets, responsible IT Support personnel, resolution time, and recorded resolution remarks."
                icon={CheckCircle2}
            >
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative w-full sm:max-w-sm">
                        <Search
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                            type="text"
                            value={resolutionSearch}
                            onChange={(event) =>
                                setResolutionSearch(event.target.value)
                            }
                            placeholder="Search resolved tickets..."
                            className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 text-sm text-black outline-none placeholder:text-gray-400 focus:border-[#4C4CF9]"
                        />
                    </div>

                    <p className="text-xs text-gray-500">
                        {filteredResolutions.length} record
                        {filteredResolutions.length === 1 ? "" : "s"}
                    </p>
                </div>

                {filteredResolutions.length === 0 ? (
                    <EmptyState message="No resolution records found for this period." />
                ) : (
                    <>
                        <div className="hidden overflow-x-auto rounded-lg border border-gray-300 lg:block">
                            <table className="w-full min-w-[1150px] border-collapse text-left">
                                <thead className="bg-gray-50">
                                    <tr className="border-b border-gray-300 text-xs uppercase tracking-wide text-gray-500">
                                        <th className="px-4 py-3 font-semibold">Ticket</th>
                                        <th className="px-4 py-3 font-semibold">Subject</th>
                                        <th className="px-4 py-3 font-semibold">Priority</th>
                                        <th className="px-4 py-3 font-semibold">Category</th>
                                        <th className="px-4 py-3 font-semibold">Department</th>
                                        <th className="px-4 py-3 font-semibold">Resolved By</th>
                                        <th className="px-4 py-3 font-semibold">Resolved At</th>
                                        <th className="px-4 py-3 font-semibold">Remarks</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {paginatedResolutions.map((item) => (
                                        <tr
                                            key={item.ticket_id}
                                            className="border-b border-gray-200 align-top last:border-b-0"
                                        >
                                            <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-black">
                                                {item.ticket_code}
                                            </td>
                                            <td className="max-w-[250px] px-4 py-3 text-sm text-black">
                                                {item.subject}
                                            </td>
                                            <td className="px-4 py-3">
                                                {item.priority ? (
                                                    <span
                                                        className={`inline-flex whitespace-nowrap rounded-md px-2 py-1 text-xs font-medium ${
                                                            priorityColor[
                                                                item.priority
                                                            ] ||
                                                            "border border-gray-300 bg-gray-50 text-black"
                                                        }`}
                                                    >
                                                        {priorityLabel[
                                                            item.priority
                                                        ] || item.priority}
                                                    </span>
                                                ) : (
                                                    "—"
                                                )}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-sm text-black">
                                                {item.category || "—"}
                                            </td>
                                            <td className="max-w-[190px] px-4 py-3 text-sm text-black">
                                                {item.department || "—"}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-sm text-black">
                                                {item.resolved_by || "—"}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                                                {formatDateTime(item.resolved_at)}
                                            </td>
                                            <td className="max-w-[320px] px-4 py-3 text-sm leading-5 text-gray-600">
                                                {item.remarks ||
                                                    "No remarks recorded"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="grid gap-3 lg:hidden">
                            {paginatedResolutions.map((item) => (
                                <article
                                    key={item.ticket_id}
                                    className="rounded-lg border border-gray-300 p-4"
                                >
                                    <div className="flex flex-wrap items-start justify-between gap-2">
                                        <div>
                                            <p className="text-sm font-semibold text-black">
                                                {item.ticket_code}
                                            </p>
                                            <p className="mt-1 text-sm text-gray-700">
                                                {item.subject}
                                            </p>
                                        </div>

                                        {item.priority && (
                                            <span
                                                className={`inline-flex whitespace-nowrap rounded-md px-2 py-1 text-xs font-medium ${
                                                    priorityColor[item.priority] ||
                                                    "border border-gray-300 bg-gray-50 text-black"
                                                }`}
                                            >
                                                {priorityLabel[item.priority] ||
                                                    item.priority}
                                            </span>
                                        )}
                                    </div>

                                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                        <div>
                                            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                                                Category
                                            </p>
                                            <p className="mt-1 text-sm text-black">
                                                {item.category || "—"}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                                                Department
                                            </p>
                                            <p className="mt-1 text-sm text-black">
                                                {item.department || "—"}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                                                Resolved By
                                            </p>
                                            <p className="mt-1 text-sm text-black">
                                                {item.resolved_by || "—"}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                                                Resolved At
                                            </p>
                                            <p className="mt-1 text-sm text-black">
                                                {formatDateTime(item.resolved_at)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-3">
                                        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                                            Resolution Remarks
                                        </p>
                                        <p className="mt-1 text-sm leading-6 text-gray-700">
                                            {item.remarks ||
                                                "No remarks recorded"}
                                        </p>
                                    </div>
                                </article>
                            ))}
                        </div>

                        <div className="mt-4 flex flex-col gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-xs text-gray-500">
                                Showing{" "}
                                {filteredResolutions.length === 0
                                    ? 0
                                    : (resolutionPage - 1) *
                                          RESOLUTION_PAGE_SIZE +
                                      1}
                                {"–"}
                                {Math.min(
                                    resolutionPage * RESOLUTION_PAGE_SIZE,
                                    filteredResolutions.length
                                )}{" "}
                                of {filteredResolutions.length}
                            </p>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    disabled={resolutionPage === 1}
                                    onClick={() =>
                                        setResolutionPage((page) => page - 1)
                                    }
                                    className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-black transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Previous
                                </button>
                                <span className="px-2 text-xs text-gray-500">
                                    Page {resolutionPage} of{" "}
                                    {resolutionTotalPages}
                                </span>
                                <button
                                    type="button"
                                    disabled={
                                        resolutionPage ===
                                        resolutionTotalPages
                                    }
                                    onClick={() =>
                                        setResolutionPage((page) => page + 1)
                                    }
                                    className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-black transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </SectionCard>
        </div>
    );

    if (loading && !data) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar />
                <div className="min-w-0 flex-1">
                    <TopBar />
                    <main className="flex min-h-[70vh] items-center justify-center">
                        <div className="text-center">
                            <RefreshCw
                                size={30}
                                className="mx-auto animate-spin text-[#4C4CF9]"
                            />
                            <p className="mt-3 text-sm text-gray-500">
                                Loading ticket reports...
                            </p>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

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
                    {reportContent}
                </main>
            </div>
        </div>
    );
}
