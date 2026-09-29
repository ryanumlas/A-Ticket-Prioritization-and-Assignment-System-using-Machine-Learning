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

export default function AIResultPieChart() {
    const [classifiedResults, setClassifiedResults] = useState(null);

    useEffect(() => {
        const fetchClassifiedResults = async () => {
            try {
                const response = await api.get(
                    "/tickets/service-desk/classified-results/"
                );

                setClassifiedResults(response.data);

                console.log(
                    "Fetched classified results:",
                    response.data
                );
            } catch (error) {
                console.error(
                    "Error fetching classified results:",
                    error
                );
            }
        };

        fetchClassifiedResults();
    }, []);

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
        },
    ];

    return (
        <div
            className="
                rounded-xl
                border
                border-gray-300
                bg-white
                p-4
                min-[1280px]:max-[1365px]:p-3
                min-[1366px]:max-[1537px]:p-3.5
            "
        >
            <div
                className="
                    mb-6
                    flex
                    items-center
                    justify-between
                    min-[1280px]:max-[1365px]:mb-4
                    min-[1366px]:max-[1537px]:mb-5
                "
            >
                <div>
                    <h2
                        className="
                            text-xl
                            font-semibold
                            min-[1280px]:max-[1365px]:text-lg
                            min-[1366px]:max-[1537px]:text-lg
                        "
                    >
                        Automated Classification Results
                    </h2>

                    <p
                        className="
                            text-sm
                            text-gray-500
                            min-[1280px]:max-[1365px]:text-[11px]
                            min-[1366px]:max-[1537px]:text-xs
                        "
                    >
                        Overall ticket classification performance
                    </p>
                </div>
            </div>

            <div
                className="
                    flex
                    items-center
                    justify-between
                    min-[1280px]:max-[1365px]:gap-3
                    min-[1366px]:max-[1537px]:gap-3
                "
            >
                {/* Pie Chart */}
                <div
                    className="
                        h-79
                        w-[45%]
                        min-[1280px]:max-[1365px]:h-60
                        min-[1366px]:max-[1537px]:h-68
                    "
                >
                    <ResponsiveContainer
                        width="100%"
                        height="100%"
                    >
                        <PieChart>
                            <Pie
                                data={data}
                                dataKey="value"
                                innerRadius={70}
                                outerRadius={100}
                                paddingAngle={4}
                                className="
                                    min-[1280px]:max-[1365px]:[&>path]:!outline-none
                                "
                            >
                                {data.map(
                                    (entry, index) => (
                                        <Cell
                                            key={index}
                                            fill={COLORS[index]}
                                        />
                                    )
                                )}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Statistics */}
                <div
                    className="
                        w-[45%]
                        space-y-5
                        min-[1280px]:max-[1365px]:space-y-3
                        min-[1366px]:max-[1537px]:space-y-4
                    "
                >
                    {/* Auto Classified */}
                    <div
                        className="
                            flex
                            items-center
                            justify-between
                            rounded-lg
                            border
                            border-gray-300
                            p-4
                            min-[1280px]:max-[1365px]:p-3
                            min-[1366px]:max-[1537px]:p-3.5
                        "
                    >
                        <div
                            className="
                                flex
                                items-center
                                gap-3
                                min-[1280px]:max-[1365px]:gap-2
                                min-[1366px]:max-[1537px]:gap-2.5
                            "
                        >
                            <div
                                className="
                                    flex
                                    h-10
                                    w-10
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-full
                                    bg-indigo-100
                                    min-[1280px]:max-[1365px]:h-8
                                    min-[1280px]:max-[1365px]:w-8
                                    min-[1366px]:max-[1537px]:h-9
                                    min-[1366px]:max-[1537px]:w-9
                                "
                            >
                                <Bot
                                    className="text-[#4C4CF9]"
                                    size={18}
                                    aria-hidden="true"
                                />
                            </div>

                            <div className="min-w-0">
                                <p
                                    className="
                                        truncate
                                        text-sm
                                        text-gray-500
                                        min-[1280px]:max-[1365px]:text-[11px]
                                        min-[1366px]:max-[1537px]:text-xs
                                    "
                                >
                                    Auto Classified
                                </p>

                                <h3
                                    className="
                                        truncate
                                        font-semibold
                                        min-[1280px]:max-[1365px]:text-[11px]
                                        min-[1366px]:max-[1537px]:text-xs
                                    "
                                >
                                    {automated_tickets || 0} Tickets
                                </h3>
                            </div>
                        </div>

                        <span
                            className="
                                shrink-0
                                text-lg
                                font-bold
                                text-[#4C4CF9]
                                min-[1280px]:max-[1365px]:text-base
                                min-[1366px]:max-[1537px]:text-base
                            "
                        >
                            {auto_classified_percentage || 0}%
                        </span>
                    </div>

                    {/* Manual Review */}
                    <div
                        className="
                            flex
                            items-center
                            justify-between
                            rounded-lg
                            border
                            border-gray-300
                            p-4
                            min-[1280px]:max-[1365px]:p-3
                            min-[1366px]:max-[1537px]:p-3.5
                        "
                    >
                        <div
                            className="
                                flex
                                items-center
                                gap-3
                                min-[1280px]:max-[1365px]:gap-2
                                min-[1366px]:max-[1537px]:gap-2.5
                            "
                        >
                            <div
                                className="
                                    flex
                                    h-10
                                    w-10
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-full
                                    bg-amber-100
                                    min-[1280px]:max-[1365px]:h-8
                                    min-[1280px]:max-[1365px]:w-8
                                    min-[1366px]:max-[1537px]:h-9
                                    min-[1366px]:max-[1537px]:w-9
                                "
                            >
                                <TriangleAlert
                                    className="text-amber-600"
                                    size={18}
                                    aria-hidden="true"
                                />
                            </div>

                            <div className="min-w-0">
                                <p
                                    className="
                                        truncate
                                        text-sm
                                        text-gray-500
                                        min-[1280px]:max-[1365px]:text-[11px]
                                        min-[1366px]:max-[1537px]:text-xs
                                    "
                                >
                                    Manual Review
                                </p>

                                <h3
                                    className="
                                        truncate
                                        font-semibold
                                        min-[1280px]:max-[1365px]:text-[11px]
                                        min-[1366px]:max-[1537px]:text-xs
                                    "
                                >
                                    {manual_override_tickets || 0} Tickets
                                </h3>
                            </div>
                        </div>

                        <span
                            className="
                                shrink-0
                                text-lg
                                font-bold
                                text-amber-600
                                min-[1280px]:max-[1365px]:text-base
                                min-[1366px]:max-[1537px]:text-base
                            "
                        >
                            {manual_override_percentage || 0}%
                        </span>
                    </div>

                    {/* Summary */}
                    <div
                        className="
                            flex
                            justify-between
                            border-t
                            border-gray-300
                            pt-4
                            min-[1280px]:max-[1365px]:pt-3
                            min-[1366px]:max-[1537px]:pt-3.5
                        "
                    >
                        <div>
                            <p
                                className="
                                    text-sm
                                    text-gray-500
                                    min-[1280px]:max-[1365px]:text-[11px]
                                    min-[1366px]:max-[1537px]:text-xs
                                "
                            >
                                Total Tickets
                            </p>

                            <h3
                                className="
                                    text-2xl
                                    font-bold
                                    min-[1280px]:max-[1365px]:text-xl
                                    min-[1366px]:max-[1537px]:text-xl
                                "
                            >
                                {total_tickets || 0}
                            </h3>
                        </div>

                        <div className="text-right">
                            <p
                                className="
                                    text-sm
                                    text-gray-500
                                    min-[1280px]:max-[1365px]:text-[11px]
                                    min-[1366px]:max-[1537px]:text-xs
                                "
                            >
                                System Success Rate
                            </p>

                            <h3
                                className="
                                    text-2xl
                                    font-bold
                                    text-green-600
                                    min-[1280px]:max-[1365px]:text-xl
                                    min-[1366px]:max-[1537px]:text-xl
                                "
                            >
                                {auto_classified_percentage || 0}%
                            </h3>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}