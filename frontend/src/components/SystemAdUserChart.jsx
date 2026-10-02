
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    PieChart,
    Pie,
    Cell,
} from "recharts";
import { ChartColumn, ChartPie, Users } from "lucide-react";
import api from "../api"; // Adjust this path if needed

const STATUS_COLORS = ["#4C4CF9", "#F87171"];

const SystemAdUserChart = () => {
    const [usersByRole, setUsersByRole] = useState([]);
    const [accountStatus, setAccountStatus] = useState([
        { name: "Active", value: 0 },
        { name: "Inactive", value: 0 },
    ]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let isMounted = true;

        const fetchUserChartData = async () => {
            try {
                const response = await api.get("/tickets/admin/user-chart/");

                if (!isMounted) return;

                setUsersByRole(response.data.users_by_role ?? []);
                setAccountStatus(response.data.account_status ?? [
                    { name: "Active", value: 0 },
                    { name: "Inactive", value: 0 },
                ]);
                setError("");
            } catch (err) {
                if (isMounted) {
                    console.error("Failed to fetch user chart data:", err);
                    setError("Unable to load user statistics.");
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchUserChartData();

        return () => {
            isMounted = false;
        };
    }, []);

    const totalUsers = usersByRole.reduce(
        (total, item) => total + item.users,
        0
    );

    const totalAccounts = accountStatus.reduce(
        (total, item) => total + item.value,
        0
    );

    const cardVariants = {
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0 },
    };

    return (
        <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-2">
            {/* Users by Role */}
            <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="min-w-0 rounded-xl border border-gray-300 bg-white p-4 transition-colors duration-200 sm:p-5"
            >
                <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#4C4CF9]/10">
                            <ChartColumn size={19} className="text-[#4C4CF9]" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="truncate text-sm font-semibold text-gray-800 sm:text-base">
                                Users by Role
                            </h2>
                            <p className="text-xs text-gray-400">
                                User distribution across roles
                            </p>
                        </div>
                    </div>

                    <div className="hidden shrink-0 items-center gap-1.5 rounded-lg border border-[#4C4CF9]/20 bg-[#4C4CF9]/5 px-2.5 py-1.5 sm:flex">
                        <Users size={13} className="text-[#4C4CF9]" />
                        <span className="text-xs font-semibold text-[#4C4CF9]">
                            {totalUsers}
                        </span>
                    </div>
                </div>

                <div className="h-[230px] w-full min-w-0">
                    {loading ? (
                        <div className="flex h-full items-center justify-center text-sm text-gray-400">
                            Loading user statistics...
                        </div>
                    ) : error ? (
                        <div className="flex h-full items-center justify-center text-sm text-red-500">
                            {error}
                        </div>
                    ) : usersByRole.length === 0 ? (
                        <div className="flex h-full items-center justify-center text-sm text-gray-400">
                            No user data available.
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={usersByRole}
                                layout="vertical"
                                margin={{ top: 5, right: 20, left: 5, bottom: 5 }}
                                barCategoryGap="25%"
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    horizontal={false}
                                    vertical
                                    stroke="#E5E7EB"
                                />
                                <XAxis
                                    type="number"
                                    tick={{ fontSize: 11, fill: "#9CA3AF" }}
                                    axisLine={false}
                                    tickLine={false}
                                    allowDecimals={false}
                                />
                                <YAxis
                                    type="category"
                                    dataKey="role"
                                    width={100}
                                    tick={{ fontSize: 11, fill: "#6B7280" }}
                                    axisLine={false}
                                    tickLine={false}
                                    interval={0}
                                />
                                <Tooltip
                                    cursor={{ fill: "#4C4CF9", fillOpacity: 0.04 }}
                                    contentStyle={{
                                        borderRadius: "10px",
                                        border: "1px solid #D1D5DB",
                                        fontSize: "12px",
                                        padding: "10px 12px",
                                    }}
                                    labelStyle={{
                                        color: "#374151",
                                        fontWeight: 600,
                                        marginBottom: 4,
                                    }}
                                />
                                <Bar
                                    dataKey="users"
                                    name="Total Users"
                                    fill="#4C4CF9"
                                    radius={[0, 5, 5, 0]}
                                    barSize={20}
                                    isAnimationActive
                                    animationDuration={1000}
                                    animationEasing="ease-out"
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-gray-200 pt-3">
                    <span className="text-xs text-gray-400">
                        Total registered users
                    </span>
                    <span className="text-sm font-bold text-gray-800">
                        {totalUsers}
                    </span>
                </div>
            </motion.div>

            {/* Account Status */}
            <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.45, delay: 0.15, ease: "easeOut" }}
                className="min-w-0 rounded-xl border border-gray-300 bg-white p-4 transition-colors duration-200 sm:p-5"
            >
                <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#4C4CF9]/10">
                            <ChartPie size={19} className="text-[#4C4CF9]" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="truncate text-sm font-semibold text-gray-800 sm:text-base">
                                Account Status
                            </h2>
                            <p className="text-xs text-gray-400">
                                Overview of account activity
                            </p>
                        </div>
                    </div>

                    <div className="hidden shrink-0 items-center gap-1.5 rounded-lg border border-[#4C4CF9]/20 bg-[#4C4CF9]/5 px-2.5 py-1.5 sm:flex">
                        <Users size={13} className="text-[#4C4CF9]" />
                        <span className="text-xs font-semibold text-[#4C4CF9]">
                            {totalAccounts}
                        </span>
                    </div>
                </div>

                <div className="flex min-h-[230px] w-full min-w-0 flex-col items-center justify-center gap-3 sm:flex-row sm:gap-2">
                    <div className="relative h-[190px] w-full min-w-0 sm:w-1/2">
                        {loading ? (
                            <div className="flex h-full items-center justify-center text-sm text-gray-400">
                                Loading...
                            </div>
                        ) : error ? (
                            <div className="flex h-full items-center justify-center text-center text-sm text-red-500">
                                {error}
                            </div>
                        ) : totalAccounts === 0 ? (
                            <div className="flex h-full items-center justify-center text-sm text-gray-400">
                                No account data available.
                            </div>
                        ) : (
                            <>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={accountStatus}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={52}
                                            outerRadius={78}
                                            paddingAngle={3}
                                            stroke="none"
                                            isAnimationActive
                                            animationDuration={1000}
                                            animationEasing="ease-out"
                                        >
                                            {accountStatus.map((entry, index) => (
                                                <Cell
                                                    key={entry.name}
                                                    fill={STATUS_COLORS[index % STATUS_COLORS.length]}
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                borderRadius: "10px",
                                                border: "1px solid #D1D5DB",
                                                fontSize: "12px",
                                                padding: "10px 12px",
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>

                                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-2xl font-bold tracking-tight text-gray-800">
                                        {totalAccounts}
                                    </span>
                                    <span className="text-[10px] font-medium text-gray-400">
                                        Total Accounts
                                    </span>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="flex w-full flex-col gap-3 sm:w-1/2 sm:pl-2">
                        {accountStatus.map((item, index) => {
                            const percentage = totalAccounts > 0
                                ? ((item.value / totalAccounts) * 100).toFixed(1)
                                : "0.0";

                            return (
                                <motion.div
                                    key={item.name}
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{
                                        duration: 0.35,
                                        delay: 0.3 + index * 0.1,
                                    }}
                                    className="flex items-center justify-between gap-2"
                                >
                                    <div className="flex min-w-0 items-center gap-2">
                                        <span
                                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                                            style={{
                                                backgroundColor: STATUS_COLORS[index % STATUS_COLORS.length],
                                            }}
                                        />
                                        <span className="truncate text-xs font-medium text-gray-600">
                                            {item.name}
                                        </span>
                                    </div>

                                    <div className="flex shrink-0 items-center gap-2">
                                        <span className="text-xs text-gray-400">
                                            {percentage}%
                                        </span>
                                        <span className="min-w-[24px] text-right text-sm font-semibold text-gray-800">
                                            {item.value}
                                        </span>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-gray-200 pt-3">
                    <span className="text-xs text-gray-400">
                        Account distribution
                    </span>
                    <span className="text-xs font-semibold text-[#4C4CF9]">
                        {totalAccounts} Accounts
                    </span>
                </div>
            </motion.div>
        </div>
    );
};

export default SystemAdUserChart;