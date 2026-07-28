import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
} from "recharts";
import { Bot, TriangleAlert } from "lucide-react";

const data = [
    { name: "Auto Classified", value: 92 },
    { name: "Manual Review", value: 8 },
];

const COLORS = ["#4C4CF9", "#F59E0B"];

export default function AIOverviewPieChart() {
    return (
        <div className="bg-white border border-gray-300 rounded-xl p-4">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-semibold">
                        AI Classification Results
                    </h2>
                    <p className="text-sm text-gray-500">
                        Overall ticket classification performance
                    </p>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <div className="w-[45%] h-71">
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
                                    1,150 Tickets
                                </h3>
                            </div>
                        </div>

                        <span className="font-bold text-lg text-[#4C4CF9]">
                            92%
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
                                    100 Tickets
                                </h3>
                            </div>
                        </div>

                        <span className="font-bold text-lg text-amber-600">
                            8%
                        </span>
                    </div>

                    <div className="border-t border-gray-300 pt-4 flex justify-between">
                        <div>
                            <p className="text-sm text-gray-500">
                                Total Tickets
                            </p>
                            <h3 className="text-2xl font-bold">
                                1,250
                            </h3>
                        </div>

                        <div className="text-right">
                            <p className="text-sm text-gray-500">
                                AI Success Rate
                            </p>
                            <h3 className="text-2xl font-bold text-green-600">
                                92%
                            </h3>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}