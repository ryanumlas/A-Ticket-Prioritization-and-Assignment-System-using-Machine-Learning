import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

import {
    BarChart3,
    TrendingDown,
    TrendingUp,
} from "lucide-react";

import { motion } from "motion/react";
import { toast } from "sonner";

import api from "../../api";

export default function SupervisorTicketProgress() {
    const [ticketVolume, setTicketVolume] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTicketVolume = useCallback(async () => {
        try {
            setLoading(true);

            const response = await api.get(
                "/tickets/supervisor/dashboard/overview/"
            );

            setTicketVolume(
                Array.isArray(response.data?.ticket_volume)
                    ? response.data.ticket_volume
                    : []
            );
        } catch (error) {
            console.error(
                "Failed to load ticket volume:",
                error
            );

            toast.error(
                "Failed to load ticket volume."
            );

            setTicketVolume([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTicketVolume();
    }, [fetchTicketVolume]);

    const totalTickets = useMemo(() => {
        return ticketVolume.reduce(
            (total, item) =>
                total + Number(item.total || 0),
            0
        );
    }, [ticketVolume]);

    const average = useMemo(() => {
        if (!ticketVolume.length) {
            return 0;
        }

        return Math.round(
            totalTickets / ticketVolume.length
        );
    }, [ticketVolume, totalTickets]);

    const highestDay = useMemo(() => {
        if (!ticketVolume.length) {
            return null;
        }

        return ticketVolume.reduce(
            (highest, item) =>
                Number(item.total || 0) >
                Number(highest.total || 0)
                    ? item
                    : highest,
            ticketVolume[0]
        );
    }, [ticketVolume]);

    const today = ticketVolume.length
        ? ticketVolume[ticketVolume.length - 1]
        : null;

    const previousDay =
        ticketVolume.length >= 2
            ? ticketVolume[ticketVolume.length - 2]
            : null;

    const percentageChange = useMemo(() => {
        if (!today || !previousDay) {
            return 0;
        }

        const todayTotal = Number(
            today.total || 0
        );

        const previousTotal = Number(
            previousDay.total || 0
        );

        if (previousTotal === 0) {
            return todayTotal > 0
                ? null
                : 0;
        }

        return Math.round(
            ((todayTotal - previousTotal) /
                previousTotal) *
                100
        );
    }, [today, previousDay]);

    const isIncreasing =
        percentageChange !== null &&
        percentageChange > 0;

    const isDecreasing =
        percentageChange !== null &&
        percentageChange < 0;

    return (
        <motion.section
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
                ease: "easeOut",
            }}
            className="
                h-full rounded-xl
                border border-gray-300
                bg-white p-5
            "
        >
            {/* HEADER */}
            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <h2 className="text-lg font-semibold text-black">
                            Ticket Volume
                        </h2>

                        <span
                            className="
                                rounded-md
                                bg-blue-50
                                px-2 py-1
                                text-xs font-medium
                                text-blue-700
                            "
                        >
                            7 Days
                        </span>
                    </div>

                    <p className="mt-1 text-xs text-gray-500">
                        Daily ticket creation across IT Support.
                    </p>
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
                        delay: 0.1,
                    }}
                    className="
                        flex h-9 w-9
                        shrink-0
                        items-center
                        justify-center
                        rounded-lg
                        bg-gray-100
                    "
                >
                    <BarChart3
                        size={18}
                        className="text-black"
                    />
                </motion.div>
            </div>

            {/* SUMMARY */}
            <div className="mt-4 flex items-end justify-between">
                <div>
                    <p
                        className="
                            text-xs font-medium
                            uppercase tracking-wide
                            text-gray-500
                        "
                    >
                        Today
                    </p>

                    <div className="mt-1 flex items-end gap-2">
                        <motion.p
                            key={
                                loading
                                    ? "loading"
                                    : today?.total
                            }
                            initial={{
                                opacity: 0,
                                y: 4,
                            }}
                            animate={{
                                opacity: 1,
                                y: 0,
                            }}
                            className="
                                text-2xl
                                font-semibold
                                text-gray-900
                            "
                        >
                            {loading
                                ? "—"
                                : Number(
                                      today?.total || 0
                                  )}
                        </motion.p>

                        {!loading &&
                            percentageChange !== null && (
                                <span
                                    className={`
                                        mb-0.5
                                        inline-flex
                                        items-center gap-1
                                        text-xs font-medium
                                        ${
                                            isIncreasing
                                                ? "text-red-600"
                                                : isDecreasing
                                                  ? "text-green-600"
                                                  : "text-gray-500"
                                        }
                                    `}
                                >
                                    {isDecreasing ? (
                                        <TrendingDown
                                            size={12}
                                        />
                                    ) : (
                                        <TrendingUp
                                            size={12}
                                        />
                                    )}

                                    {Math.abs(
                                        percentageChange
                                    )}
                                    %
                                </span>
                            )}

                        {!loading &&
                            percentageChange === null && (
                                <span
                                    className="
                                        mb-0.5
                                        text-xs
                                        font-medium
                                        text-gray-500
                                    "
                                >
                                    New activity
                                </span>
                            )}
                    </div>
                </div>

                <div className="text-right">
                    <p className="text-xs text-gray-500">
                        7-day total
                    </p>

                    <motion.p
                        key={totalTickets}
                        initial={{
                            opacity: 0,
                        }}
                        animate={{
                            opacity: 1,
                        }}
                        className="
                            mt-1
                            text-base
                            font-semibold
                            text-gray-900
                        "
                    >
                        {loading
                            ? "—"
                            : totalTickets}
                    </motion.p>
                </div>
            </div>

            {/* CHART */}
            <div className="mt-3 h-[185px] w-full">
                {loading ? (
                    <div
                        className="
                            flex h-full
                            items-center
                            justify-center
                            rounded-lg
                            bg-gray-50
                        "
                    >
                        <p className="text-xs text-gray-500">
                            Loading ticket volume...
                        </p>
                    </div>
                ) : ticketVolume.length === 0 ? (
                    <div
                        className="
                            flex h-full
                            items-center
                            justify-center
                            rounded-lg
                            bg-gray-50
                        "
                    >
                        <p className="text-xs text-gray-500">
                            No ticket volume data available.
                        </p>
                    </div>
                ) : (
                    <ResponsiveContainer
                        width="100%"
                        height="100%"
                    >
                        <BarChart
                            data={ticketVolume}
                            margin={{
                                top: 8,
                                right: 4,
                                left: -22,
                                bottom: 2,
                            }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                vertical={false}
                                stroke="#F1F5F9"
                            />

                            <XAxis
                                dataKey="day"
                                axisLine={false}
                                tickLine={false}
                                tick={{
                                    fill: "#64748B",
                                    fontSize: 11,
                                }}
                            />

                            <YAxis
                                allowDecimals={false}
                                axisLine={false}
                                tickLine={false}
                                tick={{
                                    fill: "#94A3B8",
                                    fontSize: 10,
                                }}
                            />

                            <Tooltip
                                cursor={{
                                    fill: "#F8FAFC",
                                }}
                                contentStyle={{
                                    borderRadius: "8px",
                                    border:
                                        "1px solid #E2E8F0",
                                    boxShadow:
                                        "0 4px 12px rgba(15, 23, 42, 0.08)",
                                    fontSize: "12px",
                                }}
                                formatter={(value) => [
                                    `${value} tickets`,
                                    "Total",
                                ]}
                                labelFormatter={(
                                    label,
                                    payload
                                ) => {
                                    const item =
                                        payload?.[0]
                                            ?.payload;

                                    return item?.date
                                        ? `${label} · ${item.date}`
                                        : label;
                                }}
                            />

                            <Bar
                                dataKey="total"
                                name="Tickets"
                                fill="#4C4CF9"
                                radius={[
                                    5,
                                    5,
                                    0,
                                    0,
                                ]}
                                barSize={48}
                                animationDuration={700}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* FOOTER INSIGHT */}
            <div
                className="
                    mt-3 flex
                    items-center
                    justify-between
                    border-t
                    border-gray-100
                    pt-3
                "
            >
                <div>
                    <p className="text-xs text-gray-500">
                        Busiest day
                    </p>

                    <p
                        className="
                            mt-0.5
                            text-sm
                            font-semibold
                            text-gray-900
                        "
                    >
                        {loading
                            ? "—"
                            : highestDay?.day || "—"}

                        {!loading &&
                            highestDay && (
                                <span
                                    className="
                                        ml-1
                                        font-normal
                                        text-gray-500
                                    "
                                >
                                    ·{" "}
                                    {highestDay.total}{" "}
                                    {Number(
                                        highestDay.total
                                    ) === 1
                                        ? "ticket"
                                        : "tickets"}
                                </span>
                            )}
                    </p>
                </div>

                <div className="text-right">
                    <p className="text-xs text-gray-500">
                        Daily average
                    </p>

                    <p
                        className="
                            mt-0.5
                            text-sm
                            font-semibold
                            text-gray-900
                        "
                    >
                        {loading
                            ? "—"
                            : `${average} ${
                                  average === 1
                                      ? "ticket"
                                      : "tickets"
                              }`}
                    </p>
                </div>
            </div>
        </motion.section>
    );
}