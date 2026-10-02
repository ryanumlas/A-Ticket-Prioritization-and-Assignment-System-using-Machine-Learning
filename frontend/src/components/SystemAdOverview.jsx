
import {
    Users,
    UserCheck,
    Building2,
    ShieldCheck,
} from "lucide-react";

const SystemAdOverview = () => {
    const overviewCards = [
        {
            title: "Total Users",
            value: "125",
            description: "Registered users in the system",
            status: "Users",
            icon: Users,
            iconColor: "text-blue-600",
            iconBg: "bg-blue-100",
            statusColor: "text-blue-600 bg-blue-50 border-blue-200",
        },
        {
            title: "Active Accounts",
            value: "118",
            description: "Currently active user accounts",
            status: "Active",
            icon: UserCheck,
            iconColor: "text-emerald-600",
            iconBg: "bg-emerald-100",
            statusColor: "text-emerald-600 bg-emerald-50 border-emerald-200",
        },
        {
            title: "Departments",
            value: "8",
            description: "Registered departments",
            status: "Organized",
            icon: Building2,
            iconColor: "text-purple-600",
            iconBg: "bg-purple-100",
            statusColor: "text-purple-600 bg-purple-50 border-purple-200",
        },
        {
            title: "System Roles",
            value: "4",
            description: "Configured roles and permissions",
            status: "Configured",
            icon: ShieldCheck,
            iconColor: "text-red-600",
            iconBg: "bg-red-100",
            statusColor: "text-red-600 bg-red-50 border-red-200",
        },
    ];

    return (
        <div className="w-full bg-gray-50">

            {/* Header */}
            <div className="relative overflow-hidden rounded-t-xl border border-gray-300 bg-gradient-to-r from-indigo-600 to-indigo-500 px-6 py-5 text-white">

                {/* Decorative Background */}
                <div className="absolute -right-5 -top-16 h-48 w-48 rounded-full bg-white/5" />
                <div className="absolute right-20 -bottom-20 h-40 w-40 rounded-full bg-white/5" />

                <div className="relative z-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10">
                            <ShieldCheck size={25} />
                        </div>

                        <div>
                            <h1 className="text-xl font-bold tracking-tight">
                                Welcome back, Admin!
                            </h1>

                            <p className="mt-1 text-sm text-indigo-100">
                                Manage users, system roles, departments, and configurations.
                            </p>
                        </div>
                    </div>

                    <div className="flex w-fit items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs font-medium text-white">
                        <ShieldCheck size={16} />
                        System Administration
                    </div>

                </div>
            </div>

            {/* Overview Cards */}
            <div className="rounded-b-xl border border-t-0 border-gray-300 bg-white p-4 md:p-5">

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

                    {overviewCards.map((card, index) => {
                        const Icon = card.icon;

                        return (
                            <div
                                key={index}
                                className="rounded-xl border border-gray-300 bg-white p-4 transition-shadow duration-200 hover:shadow-md"
                            >

                                {/* Icon and Status */}
                                <div className="flex items-center justify-between">

                                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${card.iconBg}`}>
                                        <Icon
                                            size={19}
                                            className={card.iconColor}
                                        />
                                    </div>

                                    <span className={`rounded-lg border px-2.5 py-1 text-xs font-medium ${card.statusColor}`}>
                                        {card.status}
                                    </span>

                                </div>

                                {/* Card Information */}
                                <div className="mt-5">

                                    <p className="text-sm font-medium text-gray-500">
                                        {card.title}
                                    </p>

                                    <h2 className="mt-1 text-2xl font-bold tracking-tight text-gray-900">
                                        {card.value}
                                    </h2>

                                    <p className="mt-2 text-xs text-gray-400">
                                        {card.description}
                                    </p>

                                </div>

                            </div>
                        );
                    })}

                </div>

            </div>

        </div>
    );
};

export default SystemAdOverview;