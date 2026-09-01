import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
} from "recharts";
import { Bot, TriangleAlert } from "lucide-react";
import api from "../api";
import { useEffect, useState } from "react";

const COLORS = ["#4C4CF9", "#F59E0B"];

export default function AIOverviewPieChart() {
    const [classifiedResults, setClassifiedResults] = useState(null);

    useEffect(() => {
        const fetchClassifiedResults = async () => {
            try {
                const response = await api.get("/tickets/service-desk/classified-results/");
                setClassifiedResults(response.data);
                console.log("Fetched classified results:", response.data);
            } catch (error) {
                console.error("Error fetching classified results:", error);
            }
        }
        fetchClassifiedResults();
    }, [])

    const {
        auto_classified_percentage = 0,
        automated_tickets = 0,
        rule_based_tickets = 0,
        machine_learning_tickets = 0,
        manual_override_percentage = 0,
        manual_override_tickets = 0,
        total_tickets = 0,
    } = classifiedResults || {};

    const data = [
        {
            name: "Auto Classified",
            value: auto_classified_percentage,
        },
        {
            name: "Manual Override",
            value: manual_override_percentage,
        }
    ]

    return (
        <div className="bg-white border border-gray-300 rounded-xl p-4">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-semibold">
                        Automated Classification Results
                    </h2>
                    <p className="text-sm text-gray-500">
                        Overall ticket classification performance
                    </p>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <div className="w-[45%] h-79">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                dataKey="value"
                                innerRadius={70}
                                outerRadius={100}
                                paddingAngle={4}
                            >
                                {data.map((entry, index) => (
                                    <Cell
                                        key={index}
                                        fill={COLORS[index]}
                                    />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="w-[45%] space-y-5">

                    <div className="flex items-center justify-between border border-gray-300 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                <Bot
                                    className="text-[#4C4CF9]"
                                    size={18}
                                />
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">
                                    Auto Classified
                                </p>
                                <h3 className="font-semibold">
                                    {automated_tickets || 0} Tickets
                                </h3>
                            </div>
                        </div>

                        <span className="font-bold text-lg text-[#4C4CF9]">
                            {auto_classified_percentage || 0}%
                        </span>
                    </div>

                    <div className="flex items-center justify-between border border-gray-300 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                                <TriangleAlert
                                    className="text-amber-600"
                                    size={18}
                                />
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">
                                    Manual Review
                                </p>
                                <h3 className="font-semibold">
                                    {manual_override_tickets || 0} Tickets
                                </h3>
                            </div>
                        </div>

                        <span className="font-bold text-lg text-amber-600">
                            {manual_override_percentage || 0}%
                        </span>
                    </div>

                    <div className="border-t border-gray-300 pt-4 flex justify-between">
                        <div>
                            <p className="text-sm text-gray-500">
                                Total Tickets
                            </p>
                            <h3 className="text-2xl font-bold">
                                {total_tickets || 0}
                            </h3>
                        </div>

                        <div className="text-right">
                            <p className="text-sm text-gray-500">
                                System Success Rate
                            </p>
                            <h3 className="text-2xl font-bold text-green-600">
                                {auto_classified_percentage || 0}%
                            </h3>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}