import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    Gauge,
    MessageSquareReply,
    CircleCheckBig,
} from "lucide-react";

import { motion } from "motion/react";
import { toast } from "sonner";

import api from "../../api";

function formatPercentage(value) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
        return "0";
    }

    if (Number.isInteger(number)) {
        return number.toString();
    }

    return number.toFixed(1);
}

function getComplianceBadge(value) {
    const percentage = Number(value || 0);

    if (percentage >= 90) {
        return {
            label: "Within SLA",
            className:
                "border-green-200 bg-green-50 text-green-700",
        };
    }

    if (percentage >= 75) {
        return {
            label: "Needs Attention",
            className:
                "border-amber-200 bg-amber-50 text-amber-700",
        };
    }

    return {
        label: "Below Target",
        className:
            "border-red-200 bg-red-50 text-red-700",
    };
}

export default function SupervisorSLAOverview() {
    const [slaData, setSlaData] = useState({
        overall_compliance: 0,
        response_sla: 0,
        resolution_sla: 0,
    });

    const [loading, setLoading] = useState(true);

    const fetchSLAPerformance = useCallback(
        async () => {
            try {
                setLoading(true);

                const response = await api.get(
                    "/tickets/supervisor/dashboard/overview/"
                );

                const data =
                    response.data?.sla_performance || {};

                setSlaData({
                    overall_compliance:
                        data.overall_compliance ?? 0,

                    response_sla:
                        data.response_sla ?? 0,

                    resolution_sla:
                        data.resolution_sla ?? 0,
                });
            } catch (error) {
                console.error(
                    "Failed to load SLA performance:",
                    error
                );

                toast.error(
                    "Failed to load SLA performance."
                );

                setSlaData({
                    overall_compliance: 0,
                    response_sla: 0,
                    resolution_sla: 0,
                });
            } finally {
                setLoading(false);
            }
        },
        []
    );

    useEffect(() => {
        fetchSLAPerformance();
    }, [fetchSLAPerformance]);

    const complianceBadge =
        getComplianceBadge(
            slaData.overall_compliance
        );

    return (
        <motion.div
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
                h-full
                rounded-xl
                border border-gray-300
                bg-white
                p-6
            "
        >
            {/* HEADER */}
            <div
                className="
                    mb-6
                    flex items-start
                    justify-between
                "
            >
                <div>
                    <h2
                        className="
                            text-xl
                            font-semibold
                            text-black
                        "
                    >
                        Overall SLA Performance
                    </h2>

                    <p
                        className="
                            mt-1
                            text-sm
                            text-gray-500
                        "
                    >
                        SLA performance across IT Support tickets.
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
                        delay: 0.08,
                    }}
                    whileHover={{
                        scale: 1.05,
                    }}
                    className="
                        flex h-10 w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-lg
                        bg-gray-100
                    "
                >
                    <Gauge
                        size={20}
                        className="text-black"
                    />
                </motion.div>
            </div>

            {/* MAIN COMPLIANCE */}
            <motion.div
                initial={{
                    opacity: 0,
                    y: 8,
                }}
                animate={{
                    opacity: 1,
                    y: 0,
                }}
                transition={{
                    duration: 0.35,
                    delay: 0.08,
                }}
                className="
                    rounded-lg
                    border border-gray-300
                    bg-gray-50
                    px-5 py-6
                "
            >
                <p
                    className="
                        text-xs
                        font-semibold
                        uppercase
                        tracking-wide
                        text-gray-500
                    "
                >
                    Overall Compliance
                </p>

                <div
                    className="
                        mt-3
                        flex flex-wrap
                        items-end
                        gap-2
                    "
                >
                    <motion.h3
                        key={
                            loading
                                ? "overall-loading"
                                : slaData.overall_compliance
                        }
                        initial={{
                            opacity: 0,
                            y: 5,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                        }}
                        transition={{
                            duration: 0.25,
                        }}
                        className="
                            text-4xl
                            font-semibold
                            text-black
                        "
                    >
                        {loading
                            ? "—"
                            : `${formatPercentage(
                                  slaData.overall_compliance
                              )}%`}
                    </motion.h3>

                    {!loading && (
                        <span
                            className={`
                                mb-1
                                rounded-md
                                border
                                px-2 py-1
                                text-xs
                                font-semibold
                                ${complianceBadge.className}
                            `}
                        >
                            {complianceBadge.label}
                        </span>
                    )}
                </div>

                <p
                    className="
                        mt-2
                        text-xs
                        leading-5
                        text-gray-500
                    "
                >
                    Overall response and resolution SLA performance.
                </p>
            </motion.div>

            {/* SLA BREAKDOWN */}
            <div
                className="
                    mt-4
                    grid grid-cols-1
                    gap-4
                    sm:grid-cols-2
                "
            >
                {/* RESPONSE SLA */}
                <motion.div
                    initial={{
                        opacity: 0,
                        y: 10,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                    }}
                    transition={{
                        duration: 0.35,
                        delay: 0.14,
                    }}
                    whileHover={{
                        y: -2,
                    }}
                    className="
                        rounded-lg
                        border border-gray-300
                        p-4
                        transition-colors
                        hover:border-gray-400
                    "
                >
                    <div
                        className="
                            flex items-center
                            gap-2
                        "
                    >
                        <div
                            className="
                                flex h-8 w-8
                                items-center
                                justify-center
                                rounded-md
                                bg-gray-100
                            "
                        >
                            <MessageSquareReply
                                size={16}
                                className="text-black"
                            />
                        </div>

                        <p
                            className="
                                text-sm
                                font-medium
                                text-black
                            "
                        >
                            Response SLA
                        </p>
                    </div>

                    <motion.p
                        key={
                            loading
                                ? "response-loading"
                                : slaData.response_sla
                        }
                        initial={{
                            opacity: 0,
                            y: 4,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                        }}
                        transition={{
                            duration: 0.25,
                        }}
                        className="
                            mt-4
                            text-2xl
                            font-semibold
                            text-[#4C4CF9]
                        "
                    >
                        {loading
                            ? "—"
                            : `${formatPercentage(
                                  slaData.response_sla
                              )}%`}
                    </motion.p>

                    <p
                        className="
                            mt-1
                            text-xs
                            leading-5
                            text-gray-500
                        "
                    >
                        Tickets responded to within the required time.
                    </p>
                </motion.div>

                {/* RESOLUTION SLA */}
                <motion.div
                    initial={{
                        opacity: 0,
                        y: 10,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                    }}
                    transition={{
                        duration: 0.35,
                        delay: 0.2,
                    }}
                    whileHover={{
                        y: -2,
                    }}
                    className="
                        rounded-lg
                        border border-gray-300
                        p-4
                        transition-colors
                        hover:border-gray-400
                    "
                >
                    <div
                        className="
                            flex items-center
                            gap-2
                        "
                    >
                        <div
                            className="
                                flex h-8 w-8
                                items-center
                                justify-center
                                rounded-md
                                bg-gray-100
                            "
                        >
                            <CircleCheckBig
                                size={16}
                                className="text-black"
                            />
                        </div>

                        <p
                            className="
                                text-sm
                                font-medium
                                text-black
                            "
                        >
                            Resolution SLA
                        </p>
                    </div>

                    <motion.p
                        key={
                            loading
                                ? "resolution-loading"
                                : slaData.resolution_sla
                        }
                        initial={{
                            opacity: 0,
                            y: 4,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                        }}
                        transition={{
                            duration: 0.25,
                        }}
                        className="
                            mt-4
                            text-2xl
                            font-semibold
                            text-[#4C4CF9]
                        "
                    >
                        {loading
                            ? "—"
                            : `${formatPercentage(
                                  slaData.resolution_sla
                              )}%`}
                    </motion.p>

                    <p
                        className="
                            mt-1
                            text-xs
                            leading-5
                            text-gray-500
                        "
                    >
                        Tickets resolved within the required time.
                    </p>
                </motion.div>
            </div>
        </motion.div>
    );
}