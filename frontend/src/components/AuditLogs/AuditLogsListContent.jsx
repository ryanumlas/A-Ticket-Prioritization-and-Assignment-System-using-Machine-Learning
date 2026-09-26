import {
    Activity,
    AlertCircle,
    ArrowRight,
    CheckCircle2,
    Clock3,
    FileText,
    User,
} from "lucide-react";

import { formatDate } from "../../utils/formatDate";

export default function AuditLogsListContent({
    auditLogs = [],
    loading = false,
}) {
    if (loading) {
        return (
            <div className="flex h-[510px] items-center justify-center bg-white">
                <p className="text-sm text-gray-500">
                    Loading audit logs...
                </p>
            </div>
        );
    }

    return (
        <div
            className="
                h-[calc(100vh-250px)]
                min-h-[420px]
                max-h-[637px]
                w-full
                overflow-auto
                bg-white
                [&::-webkit-scrollbar]:w-[3px]
                [&::-webkit-scrollbar]:h-[3px]
                [&::-webkit-scrollbar-track]:bg-transparent
                [&::-webkit-scrollbar-thumb]:rounded-full
                [&::-webkit-scrollbar-thumb]:bg-gray-300
                hover:[&::-webkit-scrollbar-thumb]:bg-gray-400
            "
        >
            <table className="w-full min-w-[1200px] table-fixed text-sm">
                <thead className="sticky top-0 z-20 bg-gray-50">
                    <tr className="border-b border-gray-300 text-left">
                        <th className="w-[10%] px-2.5 py-3.5 font-semibold text-black">
                            User Code
                        </th>

                        <th className="w-[15%] px-2.5 py-3.5 font-semibold text-black">
                            User
                        </th>

                        <th className="w-[12%] px-2.5 py-3.5 font-semibold text-black">
                            Role
                        </th>

                        <th className="w-[15%] px-2.5 py-3.5 font-semibold text-black">
                            Department
                        </th>

                        <th className="w-[11%] px-2.5 py-3.5 font-semibold text-black">
                            Action
                        </th>

                        <th className="w-[19%] px-2.5 py-3.5 font-semibold text-black">
                            Details
                        </th>

                        <th className="w-[18%] px-2.5 py-3.5 font-semibold text-black">
                            Created
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {auditLogs.length > 0 ? (
                        auditLogs.map((log) => (
                            <AuditLogRow
                                key={
                                    log.id ||
                                    `${log.action}-${log.created_at}`
                                }
                                log={log}
                            />
                        ))
                    ) : (
                        <tr>
                            <td
                                colSpan={7}
                                className="px-6 py-16 text-center"
                            >
                                <p className="font-medium text-black">
                                    No audit logs found
                                </p>

                                <p className="mt-1 text-sm text-gray-500">
                                    There are currently no audit logs
                                    matching your search or filters.
                                </p>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

function AuditLogRow({ log }) {
    const action = log.action || "";

    return (
        <tr className="border-b border-gray-200 transition-colors last:border-b-0 hover:bg-gray-50">
            {/* USER CODE */}
            <td className="px-2.5 py-4">
                <p
                    className="truncate font-semibold text-black"
                    title={log.user_code || "-"}
                >
                    {log.user_code || "-"}
                </p>
            </td>

            {/* USER */}
            <td className="px-2.5 py-4">
                <div className="min-w-0">
                    <p
                        className="truncate font-medium text-black"
                        title={getFullName(log)}
                    >
                        {getFullName(log)}
                    </p>

                    <p
                        className="mt-0.5 truncate text-xs text-gray-500"
                        title={log.email || "No email provided"}
                    >
                        {log.email || "No email provided"}
                    </p>
                </div>
            </td>

            {/* ROLE */}
            <td className="px-2.5 py-4">
                <RoleBadge role={log.role} />
            </td>

            {/* DEPARTMENT */}
            <td className="px-2.5 py-4">
                <p
                    className="truncate text-black"
                    title={log.department || "No Department"}
                >
                    {log.department || "No Department"}
                </p>
            </td>

            {/* ACTION */}
            <td className="px-2.5 py-4">
                <ActionBadge action={action} />
            </td>

            {/* DETAILS */}
            <td className="px-2.5 py-4">
                <div className="min-w-0">
                    <p
                        className="truncate text-black"
                        title={getDetails(log)}
                    >
                        {getDetails(log)}
                    </p>

                    {(log.old_value || log.new_value) && (
                        <div className="mt-1 flex min-w-0 items-center gap-1.5 text-xs">
                            {log.old_value && (
                                <span
                                    className="max-w-[100px] truncate rounded-md bg-gray-100 px-1.5 py-0.5 text-gray-600"
                                    title={String(log.old_value)}
                                >
                                    Old: {String(log.old_value)}
                                </span>
                            )}

                            {log.old_value && log.new_value && (
                                <ArrowRight
                                    size={12}
                                    className="shrink-0 text-gray-400"
                                />
                            )}

                            {log.new_value && (
                                <span
                                    className="max-w-[100px] truncate rounded-md bg-blue-50 px-1.5 py-0.5 text-blue-700"
                                    title={String(log.new_value)}
                                >
                                    New: {String(log.new_value)}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </td>

            {/* CREATED */}
            <td className="px-2.5 py-4">
                <span
                    className="whitespace-nowrap font-medium text-black"
                    title={
                        log.created_at
                            ? formatDate(log.created_at)
                            : "-"
                    }
                >
                    {log.created_at
                        ? formatDate(log.created_at)
                        : "-"}
                </span>
            </td>
        </tr>
    );
}

function getFullName(log) {
    const fullName = `${log.first_name || ""} ${
        log.last_name || ""
    }`.trim();

    return fullName || "-";
}

function getDetails(log) {
    const action = log.action || "";

    const details = {
        CREATE: "Ticket has been created.",
        UPDATE: "Ticket information has been updated.",
        STATUS_CHANGED: "Ticket status has been changed.",
        ASSIGNED: "Ticket has been assigned.",
        REASSIGNED: "Ticket has been reassigned.",
        PRIORITY_CHANGED: "Ticket priority has been changed.",
        RETURNED: "Ticket has been returned to the Service Desk.",
        RETURN_APPROVED: "Ticket return request has been approved.",
        RETURN_REJECTED: "Ticket return request has been rejected.",
        REVIEW_COMPLETED: "Ticket review has been completed.",
        PRIORITY_REVIEW_REQUESTED:
            "Priority review has been requested.",
        PRIORITY_REVIEW:
            "Priority review has been requested.",
        PRIORITY_REJECTED:
            "Priority change request has been rejected.",
        ESCALATED:
            "Ticket has been escalated for Supervisor review.",

        "Ticket Escalated":
            "Ticket has been escalated for Supervisor review.",

        LOGIN: "User has logged in.",
        LOGOUT: "User has logged out.",
    };

    return details[action] || "System activity recorded.";
}

function ActionBadge({ action }) {
    const config = {
        CREATE: {
            label: "Created",
            icon: <CheckCircle2 size={14} />,
            className:
                "border-green-300 bg-green-50 text-green-700",
        },

        UPDATE: {
            label: "Updated",
            icon: <FileText size={14} />,
            className:
                "border-blue-300 bg-blue-50 text-blue-700",
        },

        STATUS_CHANGED: {
            label: "Status Changed",
            icon: <Activity size={14} />,
            className:
                "border-blue-300 bg-blue-50 text-blue-700",
        },

        ASSIGNED: {
            label: "Assigned",
            icon: <User size={14} />,
            className:
                "border-indigo-300 bg-indigo-50 text-indigo-700",
        },

        REASSIGNED: {
            label: "Reassigned",
            icon: <User size={14} />,
            className:
                "border-indigo-300 bg-indigo-50 text-indigo-700",
        },

        PRIORITY_CHANGED: {
            label: "Priority Changed",
            icon: <AlertCircle size={14} />,
            className:
                "border-amber-300 bg-amber-50 text-amber-700",
        },

        RETURNED: {
            label: "Returned",
            icon: <ArrowRight size={14} />,
            className:
                "border-orange-300 bg-orange-50 text-orange-700",
        },

        RETURN_APPROVED: {
            label: "Return Approved",
            icon: <CheckCircle2 size={14} />,
            className:
                "border-green-300 bg-green-50 text-green-700",
        },

        RETURN_REJECTED: {
            label: "Return Rejected",
            icon: <AlertCircle size={14} />,
            className:
                "border-red-300 bg-red-50 text-red-700",
        },

        REVIEW_COMPLETED: {
            label: "Review Completed",
            icon: <CheckCircle2 size={14} />,
            className:
                "border-green-300 bg-green-50 text-green-700",
        },

        PRIORITY_REVIEW_REQUESTED: {
            label: "Priority Review Requested",
            icon: <AlertCircle size={14} />,
            className:
                "border-amber-300 bg-amber-50 text-amber-700",
        },

        PRIORITY_REVIEW: {
            label: "Priority Review",
            icon: <AlertCircle size={14} />,
            className:
                "border-amber-300 bg-amber-50 text-amber-700",
        },

        PRIORITY_REJECTED: {
            label: "Priority Rejected",
            icon: <AlertCircle size={14} />,
            className:
                "border-red-300 bg-red-50 text-red-700",
        },

        ESCALATED: {
            label: "Escalated",
            icon: <AlertCircle size={14} />,
            className:
                "border-red-300 bg-red-50 text-red-700",
        },

        LOGIN: {
            label: "Login",
            icon: <Clock3 size={14} />,
            className:
                "border-green-300 bg-green-50 text-green-700",
        },

        LOGOUT: {
            label: "Logout",
            icon: <Clock3 size={14} />,
            className:
                "border-gray-300 bg-gray-100 text-gray-700",
        },
    };

    const current =
        config[action] || {
            label: action || "Activity",
            icon: <FileText size={14} />,
            className:
                "border-gray-300 bg-gray-100 text-gray-700",
        };

    return (
        <span
            className={`inline-flex max-w-full items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium ${current.className}`}
        >
            {current.icon}

            <span className="truncate">
                {current.label}
            </span>
        </span>
    );
}

function RoleBadge({ role }) {
    const roleStyles = {
        Employee:
            "border-gray-300 bg-gray-50 text-gray-700",

        "IT Support Specialist":
            "border-blue-300 bg-blue-50 text-blue-700",

        "IT Service Desk":
            "border-purple-300 bg-purple-50 text-purple-700",

        Supervisor:
            "border-amber-300 bg-amber-50 text-amber-700",

        "System Administrator":
            "border-red-300 bg-red-50 text-red-700",
    };

    const roleLabels = {
        Employee: "Employee",

        "IT Support Specialist":
            "IT Support",

        "IT Service Desk":
            "Service Desk",

        Supervisor: "Supervisor",

        "System Administrator":
            "Administrator",
    };

    const normalizedRole = role || "";

    return (
        <span
            className={`inline-flex max-w-full whitespace-nowrap rounded-md border px-2 py-1 text-xs font-medium ${
                roleStyles[normalizedRole] ||
                "border-gray-300 bg-gray-50 text-gray-700"
            }`}
        >
            {roleLabels[normalizedRole] ||
                normalizedRole ||
                "-"}
        </span>
    );
}