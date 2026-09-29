import { getCurrentUser } from "../utils/auth";
import { ArrowRight } from "lucide-react";
import ServiceDeskOverview from "../components/ServiceDeskOverview";
import FlaggedTicketsTable from "../components/FlaggedTicketsTable";
import { Link } from "react-router-dom";
import api from "../api";
import { useEffect, useState } from "react";
import SLAOverview from "../components/SLAOverview";
import AIResultPieChart from "../components/AIResultPieChart";
import { motion } from "motion/react";

const containerVariants = {
    hidden: {},
    show: {
        transition: {
            delayChildren: 0.2,
            staggerChildren: 0.2,
        },
    },
};

const itemVariants = {
    hidden: {
        opacity: 0,
        y: 12,
    },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.7,
            ease: "easeOut",
        },
    },
};

export default function ServiceDeskDashboard() {
    const user = getCurrentUser();

    const [flaggedTickets, setFlaggedTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFlaggedTickets = async () => {
            try {
                setLoading(true);

                const response = await api.get(
                    "/tickets/flagged/list/"
                );

                setFlaggedTickets(
                    response.data.results ||
                        response.data ||
                        []
                );
            } catch {
                setFlaggedTickets([]);
            } finally {
                setLoading(false);
            }
        };

        fetchFlaggedTickets();
    }, []);

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="
                space-y-4
                min-[1280px]:max-[1365px]:space-y-3
                min-[1366px]:max-[1537px]:space-y-3.5
                min-[1538px]:max-[1919px]:space-y-4
                min-[1920px]:space-y-4
            "
        >
            {/* SERVICE DESK OVERVIEW */}
            <motion.div variants={itemVariants}>
                <ServiceDeskOverview />
            </motion.div>

            <div
                className="
                    grid
                    grid-cols-12
                    gap-4
                    min-[1280px]:max-[1365px]:gap-3
                    min-[1366px]:max-[1537px]:gap-3.5
                    min-[1538px]:max-[1919px]:gap-4
                    min-[1920px]:gap-4
                "
            >
                {/* AI RESULT */}
                <motion.div
                    variants={itemVariants}
                    className="
                        col-span-12
                        md:col-span-6
                    "
                >
                    <AIResultPieChart />
                </motion.div>

                {/* SLA */}
                <motion.div
                    variants={itemVariants}
                    className="
                        col-span-12
                        md:col-span-6
                    "
                >
                    <SLAOverview />
                </motion.div>

                {/* FLAGGED TICKETS */}
                <motion.div
                    variants={itemVariants}
                    className="
                        col-span-12
                    "
                >
                    <div className="overflow-hidden rounded-xl border border-gray-300 bg-white">
                        <div
                            className="
                                flex
                                items-center
                                justify-between
                                border-b
                                border-gray-300
                                px-4
                                py-4
                                min-[1280px]:max-[1365px]:px-3
                                min-[1280px]:max-[1365px]:py-3
                                min-[1366px]:max-[1537px]:px-3.5
                                min-[1366px]:max-[1537px]:py-3.5
                                min-[1538px]:max-[1919px]:px-4
                                min-[1538px]:max-[1919px]:py-4
                                min-[1920px]:px-4
                                min-[1920px]:py-4
                            "
                        >
                            <div>
                                <h1
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
                                    Flagged Tickets
                                </h1>

                                <p
                                    className="
                                        text-sm
                                        text-gray-500
                                        min-[1280px]:max-[1365px]:text-[11px]
                                        min-[1366px]:max-[1537px]:text-xs
                                        min-[1538px]:max-[1919px]:text-sm
                                        min-[1920px]:text-sm
                                    "
                                >
                                    Tickets requiring Service Desk review
                                </p>
                            </div>

                            <Link
                                to="/flagged-tickets"
                                className="
                                    group
                                    flex
                                    cursor-pointer
                                    items-center
                                    gap-2
                                    rounded-md
                                    bg-[#2563EB]
                                    px-6
                                    py-2
                                    text-sm
                                    text-white
                                    transition
                                    hover:bg-[#1D4ED8]
                                    min-[1280px]:max-[1365px]:gap-1.5
                                    min-[1280px]:max-[1365px]:px-4
                                    min-[1280px]:max-[1365px]:py-1.5
                                    min-[1280px]:max-[1365px]:text-[11px]
                                    min-[1366px]:max-[1537px]:gap-1.5
                                    min-[1366px]:max-[1537px]:px-5
                                    min-[1366px]:max-[1537px]:py-1.5
                                    min-[1366px]:max-[1537px]:text-xs
                                    min-[1538px]:max-[1919px]:gap-2
                                    min-[1538px]:max-[1919px]:px-6
                                    min-[1538px]:max-[1919px]:py-2
                                    min-[1538px]:max-[1919px]:text-sm
                                    min-[1920px]:gap-2
                                    min-[1920px]:px-6
                                    min-[1920px]:py-2
                                    min-[1920px]:text-sm
                                "
                            >
                                View All

                                <ArrowRight
                                    size={16}
                                    className="
                                        min-[1280px]:max-[1365px]:size-3.5
                                        min-[1366px]:max-[1537px]:size-3.5
                                        min-[1538px]:max-[1919px]:size-4
                                        min-[1920px]:size-4
                                    "
                                />
                            </Link>
                        </div>

                        <FlaggedTicketsTable
                            flaggedTickets={flaggedTickets}
                            dashboard={true}
                            maxRows={5}
                        />
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}