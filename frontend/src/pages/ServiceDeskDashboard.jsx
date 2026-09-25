import { getCurrentUser } from "../utils/auth";
import { ArrowRight } from "lucide-react";
import ServiceDeskOverview from "../components/ServiceDeskOverview";
import FlaggedTicketsTable from "../components/FlaggedTicketsTable";
import { Link } from "react-router-dom";
import api from "../api";
import { useEffect, useState } from "react";
import SLAOverview from "../components/SLAOverview";
import TicketsByCategoryChart from "../components/TicketsByCategoryChart";
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
            className="space-y-4"
        >
            <motion.div variants={itemVariants}>
                <ServiceDeskOverview />
            </motion.div>

            <div className="grid grid-cols-12 gap-4">
                {/* FLAGGED TICKETS */}
                <motion.div
                    variants={itemVariants}
                    className="col-span-7"
                >
                    <div className="overflow-hidden rounded-xl border border-gray-300 bg-white">
                        <div className="flex items-center justify-between border-b border-gray-300 px-4 py-4">
                            <div>
                                <h1 className="text-xl font-semibold text-black">
                                    Flagged Tickets
                                </h1>

                                <p className="text-sm text-gray-500">
                                    Tickets requiring Service Desk review
                                </p>
                            </div>

                            <Link
                                to="/flagged-tickets"
                                className="group flex cursor-pointer items-center gap-2 rounded-md bg-[#2563EB] px-6 py-2 text-sm text-white transition hover:bg-[#1D4ED8]"
                            >
                                View All
                                <ArrowRight size={16} />
                            </Link>
                        </div>

                        <FlaggedTicketsTable
                            flaggedTickets={flaggedTickets}
                            dashboard={true}
                            maxRows={5}
                        />
                    </div>
                </motion.div>

                {/* AI RESULT */}
                <motion.div
                    variants={itemVariants}
                    className="col-span-5"
                >
                    <AIResultPieChart />
                </motion.div>

                {/* SLA */}
                <motion.div
                    variants={itemVariants}
                    className="col-span-5"
                >
                    <SLAOverview />
                </motion.div>

                {/* TICKETS BY CATEGORY */}
                <motion.div
                    variants={itemVariants}
                    className="col-span-7"
                >
                    <TicketsByCategoryChart />
                </motion.div>
            </div>
        </motion.div>
    );
}