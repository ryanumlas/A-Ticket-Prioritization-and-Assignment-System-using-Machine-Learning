import { useEffect, useState } from "react";
import api from "../api";
import {
    Gauge,
    MessageSquareReply,
    CircleCheckBig,
} from "lucide-react";

export default function SLAOverview() {
    const [slaData, setSlaData] = useState({
        overall_compliance: 0,
        response_sla: 0,
        resolution_sla: 0,
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSLAPerformance = async () => {
            try {
                setLoading(true);

                const response = await api.get(
                    "/tickets/sla-performance/"
                );

                setSlaData(response.data);

            } catch (error) {
                console.error(
                    "Failed to fetch SLA performance:",
                    error.response?.data || error
                );
            } finally {
                setLoading(false);
            }
        };

        fetchSLAPerformance();
    }, []);

    const overallSLA = slaData.overall_compliance;
    const responseSLA = slaData.response_sla;
    const resolutionSLA = slaData.resolution_sla;

    return (
        <div
            className="
                h-full
                rounded-xl
                border
                border-gray-300
                bg-white
                p-6
                min-[1280px]:max-[1365px]:p-3
                min-[1366px]:max-[1537px]:p-4
                min-[1538px]:max-[1919px]:p-6
                min-[1920px]:p-6
            "
        >

            {/* HEADER */}
            <div
                className="
                    mb-6
                    flex
                    items-start
                    justify-between
                    min-[1280px]:max-[1365px]:mb-4
                    min-[1366px]:max-[1537px]:mb-5
                    min-[1538px]:max-[1919px]:mb-6
                    min-[1920px]:mb-6
                "
            >

                <div>
                    <h2
                        className="
                            text-xl
                            font-semibold
                            text-black
                            min-[1280px]:max-[1365px]:text-lg
                            min-[1366px]:max-[1537px]:text-lg
                            min-[1538px]:max-[1919px]:text-xl
                            min-[1920px]:text-xl
                        "
                    >
                        Overall SLA Performance
                    </h2>

                    <p
                        className="
                            mt-1
                            text-sm
                            text-gray-500
                            min-[1280px]:max-[1365px]:text-[11px]
                            min-[1366px]:max-[1537px]:text-xs
                            min-[1538px]:max-[1919px]:text-sm
                            min-[1920px]:text-sm
                        "
                    >
                        SLA performance across your department's tickets.
                    </p>
                </div>

                <div
                    className="
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-lg
                        bg-gray-100
                        min-[1280px]:max-[1365px]:h-8
                        min-[1280px]:max-[1365px]:w-8
                        min-[1366px]:max-[1537px]:h-9
                        min-[1366px]:max-[1537px]:w-9
                        min-[1538px]:max-[1919px]:h-10
                        min-[1538px]:max-[1919px]:w-10
                    "
                >
                    <Gauge
                        size={20}
                        className="
                            text-black
                            min-[1280px]:max-[1365px]:size-4
                            min-[1366px]:max-[1537px]:size-4
                            min-[1538px]:max-[1919px]:size-5
                        "
                    />
                </div>

            </div>

            {/* MAIN COMPLIANCE */}
            <div
                className="
                    rounded-lg
                    border
                    border-gray-300
                    bg-gray-50
                    px-5
                    py-6
                    min-[1280px]:max-[1365px]:px-3
                    min-[1280px]:max-[1365px]:py-4
                    min-[1366px]:max-[1537px]:px-4
                    min-[1366px]:max-[1537px]:py-5
                    min-[1538px]:max-[1919px]:px-5
                    min-[1538px]:max-[1919px]:py-6
                "
            >

                <p
                    className="
                        text-xs
                        font-semibold
                        uppercase
                        tracking-wide
                        text-gray-500
                        min-[1280px]:max-[1365px]:text-[10px]
                        min-[1366px]:max-[1537px]:text-[11px]
                        min-[1538px]:max-[1919px]:text-xs
                    "
                >
                    Overall Compliance
                </p>

                <div
                    className="
                        mt-3
                        flex
                        items-end
                        gap-2
                        min-[1280px]:max-[1365px]:mt-2
                        min-[1280px]:max-[1365px]:gap-1.5
                        min-[1366px]:max-[1537px]:mt-2.5
                        min-[1366px]:max-[1537px]:gap-1.5
                    "
                >

                    <h3
                        className="
                            text-4xl
                            font-semibold
                            text-black
                            min-[1280px]:max-[1365px]:text-3xl
                            min-[1366px]:max-[1537px]:text-3xl
                            min-[1538px]:max-[1919px]:text-4xl
                        "
                    >
                        {loading ? "..." : `${overallSLA}%`}
                    </h3>

                    {!loading && (
                        <span
                            className="
                                mb-1
                                rounded-md
                                bg-green-50
                                px-2
                                py-1
                                text-xs
                                font-semibold
                                text-green-700
                                min-[1280px]:max-[1365px]:px-1.5
                                min-[1280px]:max-[1365px]:py-0.5
                                min-[1280px]:max-[1365px]:text-[10px]
                                min-[1366px]:max-[1537px]:px-1.5
                                min-[1366px]:max-[1537px]:py-0.5
                                min-[1366px]:max-[1537px]:text-[11px]
                            "
                        >
                            Within SLA
                        </span>
                    )}

                </div>

                <p
                    className="
                        mt-2
                        text-xs
                        leading-5
                        text-gray-500
                        min-[1280px]:max-[1365px]:mt-1.5
                        min-[1280px]:max-[1365px]:text-[10px]
                        min-[1280px]:max-[1365px]:leading-4
                        min-[1366px]:max-[1537px]:text-[11px]
                        min-[1366px]:max-[1537px]:leading-4
                        min-[1538px]:max-[1919px]:text-xs
                    "
                >
                    Overall response and resolution SLA performance.
                </p>

            </div>

            {/* SLA BREAKDOWN */}
            <div
                className="
                    mt-4
                    grid
                    grid-cols-2
                    gap-4
                    min-[1280px]:max-[1365px]:mt-3
                    min-[1280px]:max-[1365px]:gap-3
                    min-[1366px]:max-[1537px]:mt-3.5
                    min-[1366px]:max-[1537px]:gap-3
                    min-[1538px]:max-[1919px]:mt-4
                    min-[1538px]:max-[1919px]:gap-4
                "
            >

                {/* RESPONSE SLA */}
                <div
                    className="
                        rounded-lg
                        border
                        border-gray-300
                        p-4
                        min-[1280px]:max-[1365px]:p-2.5
                        min-[1366px]:max-[1537px]:p-3
                        min-[1538px]:max-[1919px]:p-4
                    "
                >

                    <div
                        className="
                            flex
                            items-center
                            gap-2
                            min-[1280px]:max-[1365px]:gap-1.5
                            min-[1366px]:max-[1537px]:gap-1.5
                        "
                    >
                        <div
                            className="
                                flex
                                h-8
                                w-8
                                items-center
                                justify-center
                                rounded-md
                                bg-gray-100
                                min-[1280px]:max-[1365px]:h-7
                                min-[1280px]:max-[1365px]:w-7
                                min-[1366px]:max-[1537px]:h-7
                                min-[1366px]:max-[1537px]:w-7
                            "
                        >
                            <MessageSquareReply
                                size={16}
                                className="
                                    text-black
                                    min-[1280px]:max-[1365px]:size-3.5
                                    min-[1366px]:max-[1537px]:size-3.5
                                "
                            />
                        </div>

                        <p
                            className="
                                text-sm
                                font-medium
                                text-black
                                min-[1280px]:max-[1365px]:text-[11px]
                                min-[1366px]:max-[1537px]:text-xs
                                min-[1538px]:max-[1919px]:text-sm
                            "
                        >
                            Response SLA
                        </p>
                    </div>

                    <p
                        className="
                            mt-4
                            text-2xl
                            font-semibold
                            text-[#4C4CF9]
                            min-[1280px]:max-[1365px]:mt-3
                            min-[1280px]:max-[1365px]:text-xl
                            min-[1366px]:max-[1537px]:mt-3
                            min-[1366px]:max-[1537px]:text-xl
                            min-[1538px]:max-[1919px]:mt-4
                            min-[1538px]:max-[1919px]:text-2xl
                        "
                    >
                        {loading ? "..." : `${responseSLA}%`}
                    </p>

                    <p
                        className="
                            mt-1
                            text-xs
                            leading-5
                            text-gray-500
                            min-[1280px]:max-[1365px]:text-[10px]
                            min-[1280px]:max-[1365px]:leading-4
                            min-[1366px]:max-[1537px]:text-[11px]
                            min-[1366px]:max-[1537px]:leading-4
                            min-[1538px]:max-[1919px]:text-xs
                        "
                    >
                        Tickets responded to within the required time.
                    </p>

                </div>

                {/* RESOLUTION SLA */}
                <div
                    className="
                        rounded-lg
                        border
                        border-gray-300
                        p-4
                        min-[1280px]:max-[1365px]:p-2.5
                        min-[1366px]:max-[1537px]:p-3
                        min-[1538px]:max-[1919px]:p-4
                    "
                >

                    <div
                        className="
                            flex
                            items-center
                            gap-2
                            min-[1280px]:max-[1365px]:gap-1.5
                            min-[1366px]:max-[1537px]:gap-1.5
                        "
                    >
                        <div
                            className="
                                flex
                                h-8
                                w-8
                                items-center
                                justify-center
                                rounded-md
                                bg-gray-100
                                min-[1280px]:max-[1365px]:h-7
                                min-[1280px]:max-[1365px]:w-7
                                min-[1366px]:max-[1537px]:h-7
                                min-[1366px]:max-[1537px]:w-7
                            "
                        >
                            <CircleCheckBig
                                size={16}
                                className="
                                    text-black
                                    min-[1280px]:max-[1365px]:size-3.5
                                    min-[1366px]:max-[1537px]:size-3.5
                                "
                            />
                        </div>

                        <p
                            className="
                                text-sm
                                font-medium
                                text-black
                                min-[1280px]:max-[1365px]:text-[11px]
                                min-[1366px]:max-[1537px]:text-xs
                                min-[1538px]:max-[1919px]:text-sm
                            "
                        >
                            Resolution SLA
                        </p>
                    </div>

                    <p
                        className="
                            mt-4
                            text-2xl
                            font-semibold
                            text-[#4C4CF9]
                            min-[1280px]:max-[1365px]:mt-3
                            min-[1280px]:max-[1365px]:text-xl
                            min-[1366px]:max-[1537px]:mt-3
                            min-[1366px]:max-[1537px]:text-xl
                            min-[1538px]:max-[1919px]:mt-4
                            min-[1538px]:max-[1919px]:text-2xl
                        "
                    >
                        {loading ? "..." : `${resolutionSLA}%`}
                    </p>

                    <p
                        className="
                            mt-1
                            text-xs
                            leading-5
                            text-gray-500
                            min-[1280px]:max-[1365px]:text-[10px]
                            min-[1280px]:max-[1365px]:leading-4
                            min-[1366px]:max-[1537px]:text-[11px]
                            min-[1366px]:max-[1537px]:leading-4
                            min-[1538px]:max-[1919px]:text-xs
                        "
                    >
                        Tickets resolved within the required time.
                    </p>

                </div>

            </div>

        </div>
    );
}