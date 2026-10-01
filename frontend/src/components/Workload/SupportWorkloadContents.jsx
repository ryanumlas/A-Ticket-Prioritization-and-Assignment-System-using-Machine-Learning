import { motion } from "motion/react";
import {
    UserRound,
    Ticket,
    CircleCheck,
    Clock3,
    AlertTriangle,
    Circle,
} from "lucide-react";

const containerVariants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.06,
        },
    },
};

const cardVariants = {
    hidden: {
        opacity: 0,
        y: 10,
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.25,
            ease: "easeOut",
        },
    },
};

function formatStatus(status) {
    if (!status) {
        return "Unknown";
    }

    return String(status)
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) =>
            char.toUpperCase()
        );
}

function getAvailabilityStyle(status) {
    switch (String(status || "").toLowerCase()) {
        case "available":
            return {
                label: "Available",
                className:
                    "border-green-200 bg-green-50 text-green-700 rounded-md",
            };

        case "unavailable":
            return {
                label: "Unavailable",
                className:
                    "border-yellow-200 bg-yellow-50 text-yellow-700 rounded-md",
            };

        case "offline":
            return {
                label: "Offline",
                className:
                    "border-gray-200 bg-gray-50 text-gray-600 rounded-md",
            };

        default:
            return {
                label: formatStatus(status),
                className:
                    "border-gray-200 bg-gray-50 text-gray-600",
                dotClassName: "bg-gray-400",
            };
    }
}

function getTicketStatusStyle(status) {
    switch (String(status || "").toLowerCase()) {
        case "in_progress":
            return "border-blue-200 bg-blue-50 text-blue-700";

        case "reopened":
            return "border-orange-200 bg-orange-50 text-orange-700";

        case "open":
            return "border-gray-200 bg-gray-50 text-gray-700";

        case "resolved":
            return "border-green-200 bg-green-50 text-green-700";

        default:
            return "border-gray-200 bg-gray-50 text-gray-600";
    }
}

function getWorkloadStyle(ratio) {
    if (ratio >= 1) {
        return {
            label: "At Capacity",
            className:
                "border-red-200 bg-red-50 text-red-700",
        };
    }

    if (ratio >= 0.8) {
        return {
            label: "High",
            className:
                "border-orange-200 bg-orange-50 text-orange-700",
        };
    }

    if (ratio >= 0.6) {
        return {
            label: "Moderate",
            className:
                "border-yellow-200 bg-yellow-50 text-yellow-700",
        };
    }

    return {
        label: "Normal",
        className:
            "border-green-200 bg-green-50 text-green-700",
    };
}

function TechnicianCard({ technician }) {
    const workload = technician?.workload || 0;
    const workloadLimit =
        technician?.workload_limit || 0;

    const rawRatio =
        technician?.workload_ratio ??
        (workloadLimit > 0
            ? workload / workloadLimit
            : 0);

    const ratio = Math.max(
        0,
        Math.min(rawRatio, 1)
    );

    const percentage = Math.round(
        ratio * 100
    );

    const availability =
        getAvailabilityStyle(
            technician?.availability_status
        );

    const workloadStatus =
        getWorkloadStyle(rawRatio);

    const tickets = Array.isArray(
        technician?.tickets
    )
        ? technician.tickets
        : [];

    const initials = technician?.name
        ? technician.name
              .split(" ")
              .filter(Boolean)
              .slice(0, 2)
              .map((part) =>
                  part.charAt(0).toUpperCase()
              )
              .join("")
        : "?";

    return (
        <motion.div
            variants={cardVariants}
            whileHover={{
                y: -2,
            }}
            transition={{
                duration: 0.15,
            }}
            className="
                overflow-hidden
                rounded-xl
                border
                border-gray-200
                bg-white
                shadow-sm
            "
        >
            <div className="border-b border-gray-100 px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                        <div
                            className="
                                flex
                                h-10
                                w-10
                                shrink-0
                                items-center
                                justify-center
                                rounded-full
                                bg-blue-100
                                text-sm
                                font-semibold
                                text-blue-700
                            "
                        >
                            {initials}
                        </div>

                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-gray-900">
                                {technician?.name ||
                                    "Unknown Technician"}
                            </p>

                            <p className="truncate text-xs text-gray-500">
                                @{technician?.username ||
                                    "—"}
                            </p>
                        </div>
                    </div>

                    <span
                        className={`
                            inline-flex
                            shrink-0
                            items-center
                            gap-1.5
                            rounded-full
                            border
                            px-2.5
                            py-1
                            text-[11px]
                            font-medium
                            ${availability.className}
                        `}
                    >
                        {availability.label}
                    </span>
                </div>
            </div>

            <div className="px-4 py-4">
                <div className="mb-2 flex items-center justify-between gap-3">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Current Workload
                        </p>

                        <p className="mt-1 text-lg font-semibold text-gray-900">
                            {workload}
                            <span className="text-sm font-medium text-gray-400">
                                {" "}
                                / {workloadLimit}
                            </span>
                        </p>
                    </div>

                    <span
                        className={`
                            rounded-md
                            border
                            px-2
                            py-1
                            text-[11px]
                            font-semibold
                            ${workloadStatus.className}
                        `}
                    >
                        {workloadStatus.label}
                    </span>
                </div>

                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                    <motion.div
                        initial={{
                            width: 0,
                        }}
                        animate={{
                            width: `${percentage}%`,
                        }}
                        transition={{
                            duration: 0.5,
                            ease: "easeOut",
                        }}
                        className="h-full rounded-full bg-[#4C4CF9]"
                    />
                </div>

                <div className="mt-1.5 flex items-center justify-between">
                    <span className="text-[11px] text-gray-400">
                        {percentage}% capacity
                    </span>

                    <span className="text-[11px] text-gray-400">
                        Limit: {workloadLimit}
                    </span>
                </div>
            </div>

            <div className="border-t border-gray-100 px-4 py-4">
                <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Ticket
                            size={15}
                            className="text-[#4C4CF9]"
                        />

                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Current Tickets
                        </p>
                    </div>

                    <span className="text-xs font-medium text-gray-400">
                        {tickets.length}
                    </span>
                </div>

                {tickets.length === 0 ? (
                    <div className="flex items-center gap-2 rounded-lg border border-dashed border-gray-200 bg-gray-50 px-3 py-3">
                        <CircleCheck
                            size={15}
                            className="shrink-0 text-green-500"
                        />

                        <p className="text-xs text-gray-500">
                            No active tickets
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {tickets.map(
                            (ticket, index) => (
                                <motion.div
                                    key={
                                        ticket?.ticket_code ||
                                        index
                                    }
                                    initial={{
                                        opacity: 0,
                                        x: -4,
                                    }}
                                    animate={{
                                        opacity: 1,
                                        x: 0,
                                    }}
                                    transition={{
                                        duration: 0.2,
                                        delay:
                                            index * 0.04,
                                    }}
                                    className="
                                        flex
                                        items-center
                                        justify-between
                                        gap-3
                                        rounded-lg
                                        border
                                        border-gray-100
                                        bg-gray-50
                                        px-3
                                        py-2.5
                                    "
                                >
                                    <div className="flex min-w-0 items-center gap-2">
                                        <Circle
                                            size={7}
                                            fill="currentColor"
                                            className="shrink-0 text-[#4C4CF9]"
                                        />

                                        <span className="truncate text-xs font-medium text-gray-700">
                                            {
                                                ticket?.ticket_code
                                            }
                                        </span>
                                    </div>

                                    <span
                                        className={`
                                            shrink-0
                                            rounded-md
                                            border
                                            px-2
                                            py-1
                                            text-[10px]
                                            font-medium
                                            ${getTicketStatusStyle(
                                                ticket?.status
                                            )}
                                        `}
                                    >
                                        {formatStatus(
                                            ticket?.status
                                        )}
                                    </span>
                                </motion.div>
                            )
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );
}

export default function SupportWorkloadContents({
    departments = [],
}) {
    if (!departments.length) {
        return (
            <motion.div
                initial={{
                    opacity: 0,
                    y: 8,
                }}
                animate={{
                    opacity: 1,
                    y: 0,
                }}
                className="
                    rounded-xl
                    border
                    border-gray-200
                    bg-white
                    px-5
                    py-12
                    text-center
                "
            >
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-gray-100">
                    <UserRound
                        size={20}
                        className="text-gray-400"
                    />
                </div>

                <p className="mt-3 text-sm font-semibold text-gray-800">
                    No workload data available
                </p>

                <p className="mt-1 text-xs text-gray-500">
                    There are currently no IT Support or
                    departments available to display.
                </p>
            </motion.div>
        );
    }

    return (
        <div className="space-y-7">
            {departments.map((department) => (
                <motion.section
                    key={department.id}
                    initial={{
                        opacity: 0,
                        y: 8,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                    }}
                    transition={{
                        duration: 0.25,
                    }}
                >
                    <div className="mb-3 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                            <h2 className="truncate text-base font-semibold text-gray-900">
                                {department.name}
                            </h2>

                            <p className="mt-0.5 text-xs text-gray-500">
                                {department.pagination?.count || 0}{" "}
                                IT Support
                                {department.pagination?.count === 1
                                    ? ""
                                    : "s"}
                            </p>
                        </div>
                    </div>

                    {department.technicians?.length ? (
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="
                                grid
                                grid-cols-1
                                gap-5
                                md:grid-cols-2
                                xl:grid-cols-3
                            "
                        >
                            {department.technicians.map(
                                (technician) => (
                                    <TechnicianCard
                                        key={
                                            technician.profile_id
                                        }
                                        technician={
                                            technician
                                        }
                                    />
                                )
                            )}
                        </motion.div>
                    ) : (
                        <div className="rounded-xl border border-dashed border-gray-200 bg-white px-5 py-8 text-center">
                            <p className="text-sm font-medium text-gray-600">
                                No IT Support on this page.
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                                There are no more IT Support members to display for this department on the current page.
                            </p>
                        </div>
                    )}
                </motion.section>
            ))}
        </div>
    );
}