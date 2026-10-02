import { useEffect, useMemo, useState } from "react";
import {
    Activity,
    AlertTriangle,
    BarChart3,
    CalendarDays,
    CheckCircle2,
    Clock3,
    FileClock,
    RefreshCw,
    Search,
    ShieldAlert,
    Timer,
    TrendingUp,
    Download,
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
const BREACH_PAGE_SIZE = 8;

const DATE_FILTERS = [
    { value: "overall", label: "Overall" },
    { value: "today", label: "Today" },
    { value: "7days", label: "Last 7 Days" },
    { value: "30days", label: "Last 30 Days" },
    { value: "this_month", label: "This Month" },
    { value: "last_month", label: "Last Month" },
    { value: "custom", label: "Custom Range" },
];

const SLA_COLORS = {
    MET: "#16a34a",
    SAFE: "#2563eb",
    WARNING: "#f59e0b",
    CRITICAL: "#ea580c",
    BREACHED: "#dc2626",
};

const PRIORITY_CHART_COLORS = {
    P1: "#dc2626",
    P2: "#ea580c",
    P3: "#ca8a04",
    P4: "#16a34a",
    P5: "#2563eb",
};

function toDateInputValue(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function getDateRange(filter) {
    if (filter === "overall") return { start: "", end: "" };

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
    if (seconds === null || seconds === undefined) return "—";

    const totalSeconds = Number(seconds);
    if (Number.isNaN(totalSeconds)) return "—";
    if (totalSeconds === 0) return "0m";
    if (totalSeconds < 60) return `${Math.round(totalSeconds)}s`;

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

function getSlaStyle(status = "") {
    switch (String(status).toUpperCase()) {
        case "MET":
            return "border-green-300 bg-green-50 text-green-700";
        case "SAFE":
            return "border-blue-300 bg-blue-50 text-blue-700";
        case "WARNING":
            return "border-amber-300 bg-amber-50 text-amber-700";
        case "CRITICAL":
            return "border-orange-300 bg-orange-50 text-orange-700";
        case "BREACHED":
            return "border-red-300 bg-red-50 text-red-700";
        default:
            return "border-gray-300 bg-gray-100 text-gray-700";
    }
}

function SlaBadge({ status }) {
    if (!status) return <span className="text-gray-400">—</span>;

    return (
        <span
            className={`inline-flex whitespace-nowrap rounded-md border px-2 py-1 text-xs font-semibold ${getSlaStyle(
                status
            )}`}
        >
            {status}
        </span>
    );
}

function EmptyState({ message = "No SLA report data available for this period." }) {
    return (
        <div className="flex min-h-[180px] items-center justify-center rounded-lg border border-dashed border-gray-300 p-6 text-center">
            <div>
                <FileClock size={28} className="mx-auto mb-2 text-gray-400" />
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
                    <h2 className="text-base font-semibold text-black sm:text-lg">{title}</h2>
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
                    key={`${item.name}-${item.dataKey}`}
                    className="flex items-center justify-between gap-5 text-xs"
                >
                    <div className="flex items-center gap-2 text-gray-600">
                        <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: item.color || item.payload?.fill }}
                        />
                        {item.name}
                    </div>
                    <span className="font-semibold text-black">
                        {typeof item.value === "number" && String(item.name).includes("Rate")
                            ? `${item.value.toFixed(2)}%`
                            : item.value}
                    </span>
                </div>
            ))}
        </div>
    );
}

function StatusBreakdown({ data }) {
    const total = data.reduce((sum, item) => sum + Number(item.count || 0), 0);

    if (!data.length) return <EmptyState />;

    return (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_190px] lg:items-center">
            <div className="relative h-[270px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            dataKey="count"
                            nameKey="status"
                            cx="50%"
                            cy="50%"
                            innerRadius={62}
                            outerRadius={96}
                            paddingAngle={3}
                            stroke="white"
                            strokeWidth={3}
                        >
                            {data.map((item) => (
                                <Cell
                                    key={item.status}
                                    fill={SLA_COLORS[item.status] || BRAND}
                                />
                            ))}
                        </Pie>
                        <Tooltip content={<ChartTooltip />} />
                    </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-black">{total}</p>
                        <p className="text-[10px] uppercase tracking-wide text-gray-500">
                            Tracked
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                {data.map((item) => (
                    <div
                        key={item.status}
                        className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 px-3 py-2"
                    >
                        <div className="flex min-w-0 items-center gap-2">
                            <span
                                className="h-2.5 w-2.5 shrink-0 rounded-full"
                                style={{
                                    backgroundColor: SLA_COLORS[item.status] || BRAND,
                                }}
                            />
                            <span className="truncate text-xs text-gray-600">
                                {item.status}
                            </span>
                        </div>
                        <span className="text-sm font-semibold text-black">{item.count}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function SLAReports() {
    const [dateFilter, setDateFilter] = useState("overall");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [breachSearch, setBreachSearch] = useState("");
    const [breachPage, setBreachPage] = useState(1);

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
            setBreachPage(1);
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
                "/tickets/supervisor/reports/sla/",
                { params }
            );

            setData(response.data);
        } catch (err) {
            console.error("Failed to load SLA reports:", err);

            const message =
                err?.response?.data?.detail ||
                "Unable to load SLA reports.";

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

    const performanceData = useMemo(
        () =>
            (data?.sla_performance_over_time || []).map((item) => ({
                ...item,
                displayDate: formatChartDate(item.date),
            })),
        [data]
    );

    const responseBreakdown = useMemo(
        () => data?.response_sla_breakdown || [],
        [data]
    );

    const resolutionBreakdown = useMemo(
        () => data?.resolution_sla_breakdown || [],
        [data]
    );

    const resolutionRisk = useMemo(() => {
        const counts = {};
        resolutionBreakdown.forEach((item) => {
            counts[item.status] = Number(item.count || 0);
        });
        return {
            safe: counts.SAFE || 0,
            warning: counts.WARNING || 0,
            critical: counts.CRITICAL || 0,
            breached: counts.BREACHED || 0,
        };
    }, [resolutionBreakdown]);

    const priorityData = useMemo(
        () =>
            (data?.sla_by_priority || []).map((item) => ({
                ...item,
                name: priorityLabel[item.priority] || item.priority,
            })),
        [data]
    );

    const departmentData = useMemo(
        () =>
            (data?.sla_by_department || []).map((item) => ({
                ...item,
                name: item.department,
            })),
        [data]
    );

    const filteredBreaches = useMemo(() => {
        const items = data?.sla_breach_details || [];
        const search = breachSearch.trim().toLowerCase();

        if (!search) return items;

        return items.filter((item) =>
            [
                item.ticket_code,
                item.subject,
                item.priority,
                item.department,
                item.response_sla_status,
                item.resolution_sla_status,
                item.assigned_to,
                item.resolved_by,
            ]
                .filter(Boolean)
                .some((value) =>
                    String(value).toLowerCase().includes(search)
                )
        );
    }, [data, breachSearch]);

    const breachTotalPages = Math.max(
        1,
        Math.ceil(filteredBreaches.length / BREACH_PAGE_SIZE)
    );

    const paginatedBreaches = useMemo(() => {
        const start = (breachPage - 1) * BREACH_PAGE_SIZE;
        return filteredBreaches.slice(start, start + BREACH_PAGE_SIZE);
    }, [filteredBreaches, breachPage]);

    useEffect(() => {
        setBreachPage(1);
    }, [breachSearch]);

    useEffect(() => {
        if (breachPage > breachTotalPages) {
            setBreachPage(breachTotalPages);
        }
    }, [breachPage, breachTotalPages]);

    const periodText =
        dateFilter === "overall"
            ? "Overall · All available SLA data"
            : startDate && endDate
              ? `${formatDate(startDate)} — ${formatDate(endDate)}`
              : "Select a custom date range";

    const reportContent = (
        <div className="mx-auto w-full max-w-[1800px] p-4 sm:p-5 lg:p-6 xl:p-8">
            <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <FileClock size={22} className="text-[#4C4CF9]" />
                        <h1 className="text-xl font-bold text-black sm:text-2xl">
                            SLA Reports
                        </h1>
                    </div>
                    <p className="mt-1 max-w-3xl text-sm leading-6 text-gray-500">
                        Review response and resolution SLA compliance, current SLA risk,
                        department performance, and breached ticket details.
                    </p>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <CalendarDays size={15} />
                    <span>{periodText}</span>
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
                                    onClick={() => handlePresetChange(filter.value)}
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
                                    onChange={(event) => setStartDate(event.target.value)}
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
                                    onChange={(event) => setEndDate(event.target.value)}
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
                    title="SLA Tracked"
                    value={summary.total_sla_tracked ?? 0}
                    description="Tickets with response or resolution SLA tracking."
                    icon={FileClock}
                />
                <KpiCard
                    title="Response Met Rate"
                    value={`${Number(summary.response_met_rate || 0).toFixed(2)}%`}
                    description={`${summary.response_met ?? 0} met · ${summary.response_breached ?? 0} breached finalized response outcomes.`}
                    icon={CheckCircle2}
                />
                <KpiCard
                    title="Resolution Met Rate"
                    value={`${Number(summary.resolution_met_rate || 0).toFixed(2)}%`}
                    description={`${summary.resolution_met ?? 0} met · ${summary.resolution_breached ?? 0} breached finalized resolution outcomes.`}
                    icon={TrendingUp}
                />
                <KpiCard
                    title="Response Breaches"
                    value={summary.response_breached ?? 0}
                    description="Tickets whose response SLA was breached."
                    icon={ShieldAlert}
                />
                <KpiCard
                    title="Resolution Breaches"
                    value={summary.resolution_breached ?? 0}
                    description="Tickets whose resolution SLA was breached."
                    icon={AlertTriangle}
                />
                <KpiCard
                    title="Avg. Response"
                    value={formatDuration(summary.average_response_seconds)}
                    description="Average actual time from submission to first response."
                    icon={Timer}
                />
            </div>

            <div className="mb-5">
                <SectionCard
                    title="SLA Performance Over Time"
                    description="Daily finalized response and resolution SLA outcomes for tickets submitted in the selected period."
                    icon={Activity}
                >
                    {performanceData.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <div className="h-[320px] w-full sm:h-[380px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                    data={performanceData}
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
                                        dataKey="response_met"
                                        name="Response Met"
                                        stroke="#16a34a"
                                        strokeWidth={3}
                                        dot={{ r: 3, fill: "#16a34a" }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="response_breached"
                                        name="Response Breached"
                                        stroke="#dc2626"
                                        strokeWidth={3}
                                        dot={{ r: 3, fill: "#dc2626" }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="resolution_met"
                                        name="Resolution Met"
                                        stroke={BRAND}
                                        strokeWidth={3}
                                        dot={{ r: 3, fill: BRAND }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="resolution_breached"
                                        name="Resolution Breached"
                                        stroke="#ea580c"
                                        strokeWidth={3}
                                        dot={{ r: 3, fill: "#ea580c" }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </SectionCard>
            </div>

            <div className="mb-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
                <SectionCard
                    title="Response SLA Status"
                    description="Current response SLA status distribution for tracked tickets."
                    icon={Timer}
                >
                    <StatusBreakdown data={responseBreakdown} />
                </SectionCard>

                <SectionCard
                    title="Resolution SLA Status"
                    description="Current resolution SLA status, including active SAFE, WARNING, and CRITICAL tickets."
                    icon={ShieldAlert}
                >
                    <StatusBreakdown data={resolutionBreakdown} />

                    <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {[
                            ["SAFE", resolutionRisk.safe],
                            ["WARNING", resolutionRisk.warning],
                            ["CRITICAL", resolutionRisk.critical],
                            ["BREACHED", resolutionRisk.breached],
                        ].map(([status, count]) => (
                            <div
                                key={status}
                                className={`rounded-lg border p-3 ${getSlaStyle(status)}`}
                            >
                                <p className="text-[10px] font-semibold uppercase tracking-wide">
                                    {status}
                                </p>
                                <p className="mt-1 text-xl font-bold">{count}</p>
                            </div>
                        ))}
                    </div>
                </SectionCard>
            </div>

            <div className="mb-5">
                <SectionCard
                    title="SLA Performance by Priority"
                    description="Response and resolution compliance rates across assigned ticket priority levels."
                    icon={BarChart3}
                >
                    {priorityData.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <>
                            <div className="h-[340px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={priorityData}
                                        margin={{
                                            top: 10,
                                            right: 15,
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
                                            dataKey="priority"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 12, fill: "#374151" }}
                                        />
                                        <YAxis
                                            domain={[0, 100]}
                                            tickFormatter={(value) => `${value}%`}
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 12, fill: "#6b7280" }}
                                        />
                                        <Tooltip content={<ChartTooltip />} />
                                        <Legend
                                            iconType="circle"
                                            wrapperStyle={{ fontSize: 12 }}
                                        />
                                        <Bar
                                            dataKey="response_met_rate"
                                            name="Response Rate"
                                            fill={BRAND}
                                            radius={[6, 6, 0, 0]}
                                            maxBarSize={48}
                                        />
                                        <Bar
                                            dataKey="resolution_met_rate"
                                            name="Resolution Rate"
                                            fill="#16a34a"
                                            radius={[6, 6, 0, 0]}
                                            maxBarSize={48}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
                                {priorityData.map((item) => (
                                    <div
                                        key={item.priority}
                                        className="rounded-lg border border-gray-300 p-3"
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <span
                                                className={`inline-flex rounded-md px-2 py-1 text-xs font-medium ${
                                                    priorityColor[item.priority] ||
                                                    "border border-gray-300 bg-gray-50 text-black"
                                                }`}
                                            >
                                                {priorityLabel[item.priority] ||
                                                    item.priority}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {item.total} tickets
                                            </span>
                                        </div>
                                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                                            <div>
                                                <p className="text-gray-500">Response</p>
                                                <p className="mt-1 font-semibold text-black">
                                                    {Number(
                                                        item.response_met_rate || 0
                                                    ).toFixed(2)}
                                                    %
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500">Resolution</p>
                                                <p className="mt-1 font-semibold text-black">
                                                    {Number(
                                                        item.resolution_met_rate || 0
                                                    ).toFixed(2)}
                                                    %
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </SectionCard>
            </div>

            <div className="mb-5">
                <SectionCard
                    title="SLA Performance by IT Department"
                    description="Compare finalized response and resolution SLA compliance across IT departments."
                    icon={BarChart3}
                >
                    {departmentData.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <>
                            <div
                                className="w-full"
                                style={{
                                    height: Math.max(
                                        320,
                                        departmentData.length * 72
                                    ),
                                }}
                            >
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={departmentData}
                                        layout="vertical"
                                        margin={{
                                            top: 5,
                                            right: 30,
                                            left: 70,
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
                                            domain={[0, 100]}
                                            tickFormatter={(value) => `${value}%`}
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 11, fill: "#6b7280" }}
                                        />
                                        <YAxis
                                            type="category"
                                            dataKey="name"
                                            width={180}
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 10, fill: "#374151" }}
                                        />
                                        <Tooltip content={<ChartTooltip />} />
                                        <Legend
                                            iconType="circle"
                                            wrapperStyle={{ fontSize: 12 }}
                                        />
                                        <Bar
                                            dataKey="response_met_rate"
                                            name="Response Rate"
                                            fill={BRAND}
                                            radius={[0, 6, 6, 0]}
                                            maxBarSize={24}
                                        />
                                        <Bar
                                            dataKey="resolution_met_rate"
                                            name="Resolution Rate"
                                            fill="#16a34a"
                                            radius={[0, 6, 6, 0]}
                                            maxBarSize={24}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                                {departmentData.map((item) => (
                                    <div
                                        key={item.department_id ?? item.department}
                                        className="rounded-lg border border-gray-300 p-4"
                                    >
                                        <p className="min-h-[40px] text-sm font-semibold text-black">
                                            {item.department}
                                        </p>
                                        <p className="mt-1 text-xs text-gray-500">
                                            {item.total} tracked ticket
                                            {item.total === 1 ? "" : "s"}
                                        </p>

                                        <div className="mt-4 space-y-3">
                                            <div>
                                                <div className="mb-1 flex items-center justify-between text-xs">
                                                    <span className="text-gray-500">
                                                        Response
                                                    </span>
                                                    <span className="font-semibold text-black">
                                                        {Number(
                                                            item.response_met_rate || 0
                                                        ).toFixed(2)}
                                                        %
                                                    </span>
                                                </div>
                                                <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                                                    <div
                                                        className="h-full rounded-full bg-[#4C4CF9]"
                                                        style={{
                                                            width: `${Math.min(
                                                                100,
                                                                Number(
                                                                    item.response_met_rate ||
                                                                        0
                                                                )
                                                            )}%`,
                                                        }}
                                                    />
                                                </div>
                                                <p className="mt-1 text-[11px] text-gray-400">
                                                    {item.response_met} met ·{" "}
                                                    {item.response_breached} breached
                                                </p>
                                            </div>

                                            <div>
                                                <div className="mb-1 flex items-center justify-between text-xs">
                                                    <span className="text-gray-500">
                                                        Resolution
                                                    </span>
                                                    <span className="font-semibold text-black">
                                                        {Number(
                                                            item.resolution_met_rate || 0
                                                        ).toFixed(2)}
                                                        %
                                                    </span>
                                                </div>
                                                <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                                                    <div
                                                        className="h-full rounded-full bg-green-600"
                                                        style={{
                                                            width: `${Math.min(
                                                                100,
                                                                Number(
                                                                    item.resolution_met_rate ||
                                                                        0
                                                                )
                                                            )}%`,
                                                        }}
                                                    />
                                                </div>
                                                <p className="mt-1 text-[11px] text-gray-400">
                                                    {item.resolution_met} met ·{" "}
                                                    {item.resolution_breached} breached
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </SectionCard>
            </div>

            <SectionCard
                title="SLA Breach Details"
                description="Tickets that breached either response SLA, resolution SLA, or both."
                icon={ShieldAlert}
            >
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative w-full sm:max-w-sm">
                        <Search
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                            type="text"
                            value={breachSearch}
                            onChange={(event) => setBreachSearch(event.target.value)}
                            placeholder="Search breached tickets..."
                            className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 text-sm text-black outline-none placeholder:text-gray-400 focus:border-[#4C4CF9]"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                        <span>
                            {filteredBreaches.length} record
                            {filteredBreaches.length === 1 ? "" : "s"}
                        </span>
                        <span>·</span>
                        <span>
                            {summary.total_breached_tickets ?? 0} unique breached
                            ticket
                            {summary.total_breached_tickets === 1 ? "" : "s"}
                        </span>
                    </div>
                </div>

                {filteredBreaches.length === 0 ? (
                    <EmptyState message="No SLA breach records found for this period." />
                ) : (
                    <>
                        <div className="hidden overflow-x-auto rounded-lg border border-gray-300 lg:block">
                            <table className="w-full min-w-[1550px] border-collapse text-left">
                                <thead className="bg-gray-50">
                                    <tr className="border-b border-gray-300 text-xs uppercase tracking-wide text-gray-500">
                                        <th className="px-4 py-3 font-semibold">Ticket</th>
                                        <th className="px-4 py-3 font-semibold">Subject</th>
                                        <th className="px-4 py-3 font-semibold">Priority</th>
                                        <th className="px-4 py-3 font-semibold">Department</th>
                                        <th className="px-4 py-3 font-semibold">Response SLA</th>
                                        <th className="px-4 py-3 font-semibold">Resolution SLA</th>
                                        <th className="px-4 py-3 font-semibold">Actual Response</th>
                                        <th className="px-4 py-3 font-semibold">Actual Resolution</th>
                                        <th className="px-4 py-3 font-semibold">Response Deadline</th>
                                        <th className="px-4 py-3 font-semibold">Resolution Deadline</th>
                                        <th className="px-4 py-3 font-semibold">Assigned To</th>
                                        <th className="px-4 py-3 font-semibold">Resolved By</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedBreaches.map((item) => (
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
                                                            priorityColor[item.priority] ||
                                                            "border border-gray-300 bg-gray-50 text-black"
                                                        }`}
                                                    >
                                                        {priorityLabel[item.priority] ||
                                                            item.priority}
                                                    </span>
                                                ) : (
                                                    "—"
                                                )}
                                            </td>
                                            <td className="max-w-[190px] px-4 py-3 text-sm text-black">
                                                {item.department || "—"}
                                            </td>
                                            <td className="px-4 py-3">
                                                <SlaBadge status={item.response_sla_status} />
                                            </td>
                                            <td className="px-4 py-3">
                                                <SlaBadge status={item.resolution_sla_status} />
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-sm text-black">
                                                {formatDuration(
                                                    item.actual_response_seconds
                                                )}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-sm text-black">
                                                {formatDuration(
                                                    item.actual_resolution_seconds
                                                )}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                                                {formatDateTime(item.response_deadline)}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                                                {formatDateTime(item.resolution_deadline)}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-sm text-black">
                                                {item.assigned_to || "—"}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-sm text-black">
                                                {item.resolved_by || "—"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="grid gap-3 lg:hidden">
                            {paginatedBreaches.map((item) => (
                                <article
                                    key={item.ticket_id}
                                    className="rounded-lg border border-gray-300 p-4"
                                >
                                    <div className="flex flex-wrap items-start justify-between gap-2">
                                        <div className="min-w-0">
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

                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <SlaBadge status={item.response_sla_status} />
                                        <SlaBadge status={item.resolution_sla_status} />
                                    </div>

                                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
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
                                                Assigned To
                                            </p>
                                            <p className="mt-1 text-sm text-black">
                                                {item.assigned_to || "—"}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                                                Actual Response
                                            </p>
                                            <p className="mt-1 text-sm text-black">
                                                {formatDuration(
                                                    item.actual_response_seconds
                                                )}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                                                Actual Resolution
                                            </p>
                                            <p className="mt-1 text-sm text-black">
                                                {formatDuration(
                                                    item.actual_resolution_seconds
                                                )}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                                                Response Deadline
                                            </p>
                                            <p className="mt-1 text-sm text-black">
                                                {formatDateTime(item.response_deadline)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                                                Resolution Deadline
                                            </p>
                                            <p className="mt-1 text-sm text-black">
                                                {formatDateTime(item.resolution_deadline)}
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
                                                Created At
                                            </p>
                                            <p className="mt-1 text-sm text-black">
                                                {formatDateTime(item.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>

                        <div className="mt-4 flex flex-col gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-xs text-gray-500">
                                Showing{" "}
                                {(breachPage - 1) * BREACH_PAGE_SIZE + 1}
                                {"–"}
                                {Math.min(
                                    breachPage * BREACH_PAGE_SIZE,
                                    filteredBreaches.length
                                )}{" "}
                                of {filteredBreaches.length}
                            </p>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    disabled={breachPage === 1}
                                    onClick={() =>
                                        setBreachPage((page) => page - 1)
                                    }
                                    className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-black transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Previous
                                </button>
                                <span className="px-2 text-xs text-gray-500">
                                    Page {breachPage} of {breachTotalPages}
                                </span>
                                <button
                                    type="button"
                                    disabled={breachPage === breachTotalPages}
                                    onClick={() =>
                                        setBreachPage((page) => page + 1)
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
            <div className="flex h-screen overflow-hidden bg-gray-50">
                <div className="h-screen shrink-0">
                    <Sidebar />
                </div>

                <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                    <div className="shrink-0">
                        <TopBar />
                    </div>

                    <main className="flex min-w-0 flex-1 items-center justify-center overflow-hidden">
                        <div className="text-center">
                            <RefreshCw
                                size={30}
                                className="mx-auto animate-spin text-[#4C4CF9]"
                            />
                            <p className="mt-3 text-sm text-gray-500">
                                Loading SLA reports...
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
