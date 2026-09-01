import { useEffect, useState } from "react";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";

import api from "../api";

export default function TicketsByCategoryChart() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTicketsByCategory = async () => {
            try {
                const response = await api.get(
                    "/tickets/tickets-by-category/"
                );

                setData(response.data || []);
            } catch (error) {
                console.error(
                    "Failed to fetch tickets by category:",
                    error.response?.data || error
                );

                setData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchTicketsByCategory();
    }, []);

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

            {loading ? (
                <div className="flex h-[300px] items-center justify-center">
                    <p className="text-sm text-gray-500">
                        Loading category data...
                    </p>
                </div>
            ) : data.length === 0 ? (
                <div className="flex h-[300px] items-center justify-center">
                    <p className="text-sm text-gray-500">
                        No ticket category data available.
                    </p>
                </div>
            ) : (
                <ResponsiveContainer
                    width="100%"
                    height={300}
                >
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

                        <XAxis
                            type="number"
                            allowDecimals={false}
                        />

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
            )}
        </div>
    );
}