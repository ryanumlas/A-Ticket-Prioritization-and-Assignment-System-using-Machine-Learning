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
    TrendingUp,
} from "lucide-react";

const ticketVolume = [
    { day: "Mon", total: 12 },
    { day: "Tue", total: 15 },
    { day: "Wed", total: 10 },
    { day: "Thu", total: 14 },
    { day: "Fri", total: 17 },
    { day: "Sat", total: 8 },
    { day: "Sun", total: 6 },
];

export default function SupervisorTicketProgress() {
    const totalTickets = ticketVolume.reduce(
        (total, item) => total + item.total,
        0
    );

    const average = Math.round(
        totalTickets / ticketVolume.length
    );

    const highestDay = ticketVolume.reduce(
        (highest, item) =>
            item.total > highest.total ? item : highest,
        ticketVolume[0]
    );

    const today = ticketVolume[ticketVolume.length - 1];

    const previousDay =
        ticketVolume[ticketVolume.length - 2];

    const percentageChange = previousDay
        ? Math.round(
              ((today.total - previousDay.total) /
                  previousDay.total) *
                  100
          )
        : 0;

    const isIncreasing = percentageChange >= 0;

    return (
        <section className="h-full rounded-xl border border-gray-300 bg-white p-5">
            {/* HEADER */}
            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <h2 className="text-lg font-semibold text-black">
                            Ticket Volume
                        </h2>

                        <span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                            7 Days
                        </span>
                    </div>

                    <p className="mt-1 text-xs text-gray-500">
                        Daily ticket creation across IT Support.
                    </p>
                </div>

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                    <BarChart3
                        size={18}
                        className="text-black"
                    />
                </div>
            </div>

            {/* SUMMARY */}
            <div className="mt-4 flex items-end justify-between">
                <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        Today
                    </p>

                    <div className="mt-1 flex items-end gap-2">
                        <p className="text-2xl font-semibold text-gray-900">
                            {today.total}
                        </p>

                        <span
                            className={`mb-0.5 inline-flex items-center gap-1 text-xs font-medium ${
                                isIncreasing
                                    ? "text-red-600"
                                    : "text-green-600"
                            }`}
                        >
                            <TrendingUp size={12} />
                            {Math.abs(percentageChange)}%
                        </span>
                    </div>
                </div>

                <div className="text-right">
                    <p className="text-xs text-gray-500">
                        Weekly total
                    </p>

                    <p className="mt-1 text-base font-semibold text-gray-900">
                        {totalTickets}
                    </p>
                </div>
            </div>

            {/* CHART */}
            <div className="mt-3 h-[185px] w-full">
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
                                border: "1px solid #E2E8F0",
                                boxShadow:
                                    "0 4px 12px rgba(15, 23, 42, 0.08)",
                                fontSize: "12px",
                            }}
                            formatter={(value) => [
                                `${value} tickets`,
                                "Total",
                            ]}
                        />

                        <Bar
                            dataKey="total"
                            name="Tickets"
                            fill="#2563EB"
                            radius={[5, 5, 0, 0]}
                            barSize={48}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* FOOTER INSIGHT */}
            <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
                <div>
                    <p className="text-xs text-gray-500">
                        Busiest day
                    </p>

                    <p className="mt-0.5 text-sm font-semibold text-gray-900">
                        {highestDay.day}
                        <span className="ml-1 font-normal text-gray-500">
                            · {highestDay.total} tickets
                        </span>
                    </p>
                </div>

                <div className="text-right">
                    <p className="text-xs text-gray-500">
                        Daily average
                    </p>

                    <p className="mt-0.5 text-sm font-semibold text-gray-900">
                        {average} tickets
                    </p>
                </div>
            </div>
        </section>
    );
}