import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";

const data = [
    { category: "Hardware", tickets: 24 },
    { category: "Software", tickets: 18 },
    { category: "Network", tickets: 11 },
    { category: "Account", tickets: 8 },
    { category: "Email", tickets: 6 },
    { category: "Printer", tickets: 3 },
];

export default function TicketsByCategoryChart() {
    return (
        <div className="bg-white border border-gray-300 rounded-xl p-6 h-full">
            <div className="mb-5">
                <h2 className="text-xl font-semibold">
                    Tickets by Category
                </h2>
                <p className="text-sm text-gray-500">
                    Distribution of assigned tickets
                </p>
            </div>

            <ResponsiveContainer width="100%" height={300}>
                <BarChart
                    layout="vertical"
                    data={data}
                    margin={{
                        top: 5,
                        right: 20,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis type="number" />

                    <YAxis
                        type="category"
                        dataKey="category"
                        width={80}
                    />

                    <Tooltip />

                    <Bar
                        dataKey="tickets"
                        fill="#4C4CF9"
                        radius={[0, 6, 6, 0]}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}