import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import SystemAdOverview from "../components/SystemAdOverview";
import SystemAdUserChart from "../components/SystemAdUserChart";
import AuditLogListContent from "../components/AuditLogs/AuditLogsListContent";
import api from "../api";

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

export default function SystemAdminDashboard() {
    const [auditLogs, setAuditLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAuditLogs = async () => {
            try {
                setLoading(true);

                const response = await api.get(
                    "/users/audit-logs/admin/list/",
                    {
                        params: {
                            page: 1,
                            page_size: 5,
                        },
                    }
                );

                const data = response.data;

                setAuditLogs(data.results || []);
            } catch (error) {
                console.error(
                    "Failed to load recent activities:",
                    error
                );

                setAuditLogs([]);
            } finally {
                setLoading(false);
            }
        };

        fetchAuditLogs();
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
            {/* SYSTEM ADMIN OVERVIEW */}
            <motion.div variants={itemVariants}>
                <SystemAdOverview />
            </motion.div>

            {/* USER CHARTS */}
            <motion.div variants={itemVariants}>
                <SystemAdUserChart />
            </motion.div>

            {/* RECENT ACTIVITIES */}
            <motion.div
                variants={itemVariants}
                className="
                    overflow-visible
                    rounded-xl
                    border
                    border-gray-300
                    bg-white
                "
            >
                {/* HEADER */}
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
                            Recent Activities
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
                            Latest system activity and user actions
                        </p>
                    </div>

                    <Link
                        to="/audit-logs"
                        className="
                            group
                            flex
                            items-center
                            gap-2
                            rounded-md
                            bg-[#4C4CF9]
                            px-6
                            py-2
                            text-sm
                            text-white
                            transition
                            hover:bg-[#3f3fe0]

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
                                transition-transform
                                duration-200
                                group-hover:translate-x-0.5

                                min-[1280px]:max-[1365px]:size-3.5

                                min-[1366px]:max-[1537px]:size-3.5

                                min-[1538px]:max-[1919px]:size-4

                                min-[1920px]:size-4
                            "
                        />
                    </Link>
                </div>

                {/* RECENT AUDIT LOGS */}
                <AuditLogListContent
                    auditLogs={auditLogs}
                    loading={loading}
                    dashboard={true}
                    maxRows={5}
                />
            </motion.div>
        </motion.div>
    );
}