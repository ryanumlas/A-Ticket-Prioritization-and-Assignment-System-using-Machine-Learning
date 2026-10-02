
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

import {
    ChartColumn,
    ChartPie,
    Users,
} from "lucide-react";

const SystemAdUserChart = () => {

    // Static data: Users by Role
    const usersByRole = [
        { role: "Employee", users: 85 },
        { role: "IT Support", users: 25 },
        { role: "Supervisor", users: 10 },
        { role: "System Admin", users: 5 },
    ];

    // Static data: Account Status
    const accountStatus = [
        { name: "Active", value: 118 },
        { name: "Inactive", value: 5 },
    ];

    const statusColors = ["#4C4CF9", "#F87171"];

    const totalUsers = usersByRole.reduce(
        (total, item) => total + item.users,
        0
    );

    const totalAccounts = accountStatus.reduce(
        (total, item) => total + item.value,
        0
    );

    const cardVariants = {
        hidden: {
            opacity: 0,
            y: 15,
        },
        visible: {
            opacity: 1,
            y: 0,
        },
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

                {/* Header */}
                <div className="mb-4 flex items-center justify-between gap-3">

                    <div className="flex min-w-0 items-center gap-3">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#4C4CF9]/10">
                            <ChartColumn
                                size={19}
                                className="text-[#4C4CF9]"
                            />
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

                {/* Chart */}
                <div className="h-[230px] w-full min-w-0">

                    <ResponsiveContainer width="100%" height="100%">

                        <BarChart
                            data={usersByRole}
                            layout="vertical"
                            margin={{
                                top: 5,
                                right: 20,
                                left: 5,
                                bottom: 5,
                            }}
                            barCategoryGap="25%"
                        >

                            <CartesianGrid
                                strokeDasharray="3 3"
                                horizontal={false}
                                vertical={true}
                                stroke="#E5E7EB"
                            />

                            <XAxis
                                type="number"
                                tick={{
                                    fontSize: 11,
                                    fill: "#9CA3AF",
                                }}
                                axisLine={false}
                                tickLine={false}
                                allowDecimals={false}
                            />

                            <YAxis
                                type="category"
                                dataKey="role"
                                width={85}
                                tick={{
                                    fontSize: 11,
                                    fill: "#6B7280",
                                }}
                                axisLine={false}
                                tickLine={false}
                                interval={0}
                            />

                            <Tooltip
                                cursor={{
                                    fill: "#4C4CF9",
                                    fillOpacity: 0.04,
                                }}
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
                                isAnimationActive={true}
                                animationDuration={1000}
                                animationEasing="ease-out"
                            />

                        </BarChart>

                    </ResponsiveContainer>

                </div>

                {/* Footer */}
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
                transition={{
                    duration: 0.45,
                    delay: 0.15,
                    ease: "easeOut",
                }}
                className="min-w-0 rounded-xl border border-gray-300 bg-white p-4 transition-colors duration-200 sm:p-5"
            >

                {/* Header */}
                <div className="mb-4 flex items-center justify-between gap-3">

                    <div className="flex min-w-0 items-center gap-3">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#4C4CF9]/10">
                            <ChartPie
                                size={19}
                                className="text-[#4C4CF9]"
                            />
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

                {/* Chart and Legend */}
                <div className="flex min-h-[230px] w-full min-w-0 flex-col items-center justify-center gap-3 sm:flex-row sm:gap-2">

                    {/* Donut Chart */}
                    <div className="relative h-[190px] w-full min-w-0 sm:w-1/2">

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
                                    isAnimationActive={true}
                                    animationDuration={1000}
                                    animationEasing="ease-out"
                                >

                                    {accountStatus.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={statusColors[index]}
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

                        {/* Center Text */}
                        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">

                            <span className="text-2xl font-bold tracking-tight text-gray-800">
                                {totalAccounts}
                            </span>

                            <span className="text-[10px] font-medium text-gray-400">
                                Total Accounts
                            </span>

                        </div>

                    </div>

                    {/* Legend */}
                    <div className="flex w-full flex-col gap-3 sm:w-1/2 sm:pl-2">

                        {accountStatus.map((item, index) => {

                            const percentage = (
                                (item.value / totalAccounts) * 100
                            ).toFixed(1);

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
                                                backgroundColor: statusColors[index],
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

                {/* Footer */}
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