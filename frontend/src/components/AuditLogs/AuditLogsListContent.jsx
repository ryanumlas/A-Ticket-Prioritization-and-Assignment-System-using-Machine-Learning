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
    dashboard = false,
    maxRows = 5,
}) {
    // Dashboard only shows the latest 5 records.
    // Full audit log page shows everything.
    const displayedLogs = dashboard
        ? auditLogs.slice(0, maxRows)
        : auditLogs;

    if (loading) {
        return (
            <div
                className={
                    dashboard
                        ? `
                            w-full
                            overflow-x-auto
                            overflow-y-hidden
                            bg-white
                        `
                        : `
                            h-[calc(100vh-250px)]
                            min-h-[420px]
                            max-h-[637px]
                            w-full
                            overflow-auto
                            bg-white

                            [&::-webkit-scrollbar]:w-px
                            [&::-webkit-scrollbar]:h-px
                            [&::-webkit-scrollbar]:track:bg-transparent
                            [&::-webkit-scrollbar]:thumb:bg-transparent
                            hover:[&::-webkit-scrollbar]:thumb:bg-gray-300
                            [&::-webkit-scrollbar]:thumb:rounded-full
                        `
                }
            >
                <p
                    className={
                        dashboard
                            ? "text-xs text-gray-500"
                            : `
                                text-sm text-gray-500
                                min-[1280px]:max-[1365px]:text-[11px]
                                min-[1366px]:max-[1537px]:text-xs
                            `
                    }
                >
                    Loading audit logs...
                </p>
            </div>
        );
    }

    return (
        <div
            className={
                dashboard
                    ? `
                        h-[280px]
                        w-full
                        overflow-hidden
                        bg-white
                    `
                    : `
                        h-[calc(100vh-250px)]
                        min-h-[420px]
                        max-h-[637px]
                        w-full
                        overflow-auto
                        bg-white
                        [&::-webkit-scrollbar]:w-px
                        [&::-webkit-scrollbar]:h-px
                        [&::-webkit-scrollbar-track]:bg-transparent
                        [&::-webkit-scrollbar-thumb]:rounded-full
                        [&::-webkit-scrollbar-thumb]:bg-transparent
                        hover:[&::-webkit-scrollbar-thumb]:bg-gray-300
                    `
            }
        >
            <table
                className={`
                    w-full
                    table-fixed
                    text-sm
                    ${dashboard ? "text-xs" : ""}
                    min-[1280px]:max-[1365px]:text-[11px]
                    min-[1366px]:max-[1537px]:text-xs
                `}
            >
                <thead className="sticky top-0 z-20 bg-gray-50">
                    <tr className="border-b border-gray-300 text-left">

                        {/* USER CODE */}
                        <th
                            className={`
                                w-[8%]
                                px-2.5
                                ${dashboard ? "py-2.5" : "py-3.5"}
                                font-semibold
                                text-black
                                min-[1280px]:max-[1365px]:px-2
                                min-[1280px]:max-[1365px]:py-2.5
                                min-[1366px]:max-[1537px]:px-2
                                min-[1366px]:max-[1537px]:py-3
                            `}
                        >
                            User Code
                        </th>

                        {/* USER */}
                        <th
                            className={`
                                w-[15%]
                                px-2.5
                                ${dashboard ? "py-2.5" : "py-3.5"}
                                font-semibold
                                text-black
                                min-[1280px]:max-[1365px]:px-2
                                min-[1280px]:max-[1365px]:py-2.5
                                min-[1366px]:max-[1537px]:px-2
                                min-[1366px]:max-[1537px]:py-3
                            `}
                        >
                            User
                        </th>

                        {/* ROLE */}
                        <th
                            className={`
                                w-[12%]
                                px-2.5
                                ${dashboard ? "py-2.5" : "py-3.5"}
                                font-semibold
                                text-black
                                min-[1280px]:max-[1365px]:px-2
                                min-[1280px]:max-[1365px]:py-2.5
                                min-[1366px]:max-[1537px]:px-2
                                min-[1366px]:max-[1537px]:py-3
                            `}
                        >
                            Role
                        </th>

                        {/* DEPARTMENT */}
                        <th
                            className={`
                                w-[12%]
                                px-2.5
                                ${dashboard ? "py-2.5" : "py-3.5"}
                                font-semibold
                                text-black
                                min-[1280px]:max-[1365px]:px-2
                                min-[1280px]:max-[1365px]:py-2.5
                                min-[1366px]:max-[1537px]:px-2
                                min-[1366px]:max-[1537px]:py-3
                            `}
                        >
                            Department
                        </th>

                        {/* ACTION */}
                        <th
                            className={`
                                w-[13%]
                                px-2.5
                                ${dashboard ? "py-2.5" : "py-3.5"}
                                font-semibold
                                text-black
                                min-[1280px]:max-[1365px]:px-2
                                min-[1280px]:max-[1365px]:py-2.5
                                min-[1366px]:max-[1537px]:px-2
                                min-[1366px]:max-[1537px]:py-3
                            `}
                        >
                            Action
                        </th>

                        {/* DETAILS */}
                        <th
                            className={`
                                w-[25%]
                                px-2.5
                                ${dashboard ? "py-2.5" : "py-3.5"}
                                font-semibold
                                text-black
                                min-[1280px]:max-[1365px]:px-2
                                min-[1280px]:max-[1365px]:py-2.5
                                min-[1366px]:max-[1537px]:px-2
                                min-[1366px]:max-[1537px]:py-3
                            `}
                        >
                            Details
                        </th>

                        {/* CREATED */}
                        <th
                            className={`
                                w-[15%]
                                px-2.5
                                ${dashboard ? "py-2.5" : "py-3.5"}
                                font-semibold
                                text-black
                                min-[1280px]:max-[1365px]:px-2
                                min-[1280px]:max-[1365px]:py-2.5
                                min-[1366px]:max-[1537px]:px-2
                                min-[1366px]:max-[1537px]:py-3
                            `}
                        >
                            Created
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {displayedLogs.length > 0 ? (
                        displayedLogs.map((log) => (
                            <AuditLogRow
                                key={
                                    log.id ||
                                    `${log.action}-${log.created_at}`
                                }
                                log={log}
                                dashboard={dashboard}
                            />
                        ))
                    ) : (
                        <tr>
                            <td
                                colSpan={7}
                                className={
                                    dashboard
                                        ? "px-4 py-10 text-center"
                                        : `
                                            px-6
                                            py-16
                                            text-center
                                            min-[1280px]:max-[1365px]:px-4
                                            min-[1280px]:max-[1365px]:py-10
                                            min-[1366px]:max-[1537px]:px-5
                                            min-[1366px]:max-[1537px]:py-12
                                        `
                                }
                            >
                                <p className="font-medium text-black">
                                    No audit logs found
                                </p>

                                <p
                                    className={
                                        dashboard
                                            ? "mt-1 text-xs text-gray-500"
                                            : `
                                                mt-1
                                                text-sm
                                                text-gray-500
                                                min-[1280px]:max-[1365px]:text-[11px]
                                                min-[1366px]:max-[1537px]:text-xs
                                            `
                                    }
                                >
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

function AuditLogRow({ log, dashboard }) {
    const action = log.action || "";

    return (
        <tr
            className="
                border-b
                border-gray-200
                transition-colors
                last:border-b-0
                hover:bg-gray-50
            "
        >
            {/* USER CODE */}
            <td
                className={`
                    px-2.5
                    ${dashboard ? "py-2.5" : "py-4"}
                    min-[1280px]:max-[1365px]:px-2
                    min-[1280px]:max-[1365px]:py-2.5
                    min-[1366px]:max-[1537px]:px-2
                    min-[1366px]:max-[1537px]:py-3
                `}
            >
                <p
                    className="truncate font-semibold text-black"
                    title={log.user_code || "-"}
                >
                    {log.user_code || "-"}
                </p>
            </td>

            {/* USER */}
            <td
                className={`
                    px-2.5
                    ${dashboard ? "py-2.5" : "py-4"}
                    min-[1280px]:max-[1365px]:px-2
                    min-[1280px]:max-[1365px]:py-2.5
                    min-[1366px]:max-[1537px]:px-2
                    min-[1366px]:max-[1537px]:py-3
                `}
            >
                <div className="min-w-0">
                    <p
                        className="truncate font-medium text-black"
                        title={getFullName(log)}
                    >
                        {getFullName(log)}
                    </p>

                    <p
                        className="
                            mt-0.5
                            truncate
                            text-xs
                            text-gray-500
                            min-[1280px]:max-[1365px]:text-[10px]
                            min-[1366px]:max-[1537px]:text-[11px]
                        "
                        title={
                            log.email ||
                            "No email provided"
                        }
                    >
                        {log.email || "No email provided"}
                    </p>
                </div>
            </td>

            {/* ROLE */}
            <td
                className={`
                    px-2.5
                    ${dashboard ? "py-2.5" : "py-4"}
                    min-[1280px]:max-[1365px]:px-2
                    min-[1280px]:max-[1365px]:py-2.5
                    min-[1366px]:max-[1537px]:px-2
                    min-[1366px]:max-[1537px]:py-3
                `}
            >
                <RoleBadge role={log.role} />
            </td>

            {/* DEPARTMENT */}
            <td
                className={`
                    px-2.5
                    ${dashboard ? "py-2.5" : "py-4"}
                    min-[1280px]:max-[1365px]:px-2
                    min-[1280px]:max-[1365px]:py-2.5
                    min-[1366px]:max-[1537px]:px-2
                    min-[1366px]:max-[1537px]:py-3
                `}
            >
                <p
                    className="truncate text-black"
                    title={
                        log.department ||
                        "No Department"
                    }
                >
                    {log.department || "No Department"}
                </p>
            </td>

            {/* ACTION */}
            <td
                className={`
                    px-2.5
                    ${dashboard ? "py-2.5" : "py-4"}
                    min-[1280px]:max-[1365px]:px-2
                    min-[1280px]:max-[1365px]:py-2.5
                    min-[1366px]:max-[1537px]:px-2
                    min-[1366px]:max-[1537px]:py-3
                `}
            >
                <ActionBadge action={action} />
            </td>

            {/* DETAILS */}
            <td
                className={`
                    px-2.5
                    ${dashboard ? "py-2.5" : "py-4"}
                    min-[1280px]:max-[1365px]:px-2
                    min-[1280px]:max-[1365px]:py-2.5
                    min-[1366px]:max-[1537px]:px-2
                    min-[1366px]:max-[1537px]:py-3
                `}
            >
                <div className="min-w-0">
                    <p
                        className="truncate text-black"
                        title={getDetails(log)}
                    >
                        {getDetails(log)}
                    </p>

                    {(log.old_value ||
                        log.new_value) && (
                        <div
                            className="
                                mt-1
                                flex
                                min-w-0
                                items-center
                                gap-1.5
                                text-xs
                            "
                        >
                            {log.old_value && (
                                <span
                                    className="
                                        max-w-[100px]
                                        truncate
                                        rounded-md
                                        bg-gray-100
                                        px-1.5
                                        py-0.5
                                        text-gray-600
                                    "
                                    title={String(
                                        log.old_value
                                    )}
                                >
                                    Old:{" "}
                                    {String(
                                        log.old_value
                                    )}
                                </span>
                            )}

                            {log.old_value &&
                                log.new_value && (
                                    <ArrowRight
                                        size={12}
                                        className="shrink-0 text-gray-400"
                                    />
                                )}

                            {log.new_value && (
                                <span
                                    className="
                                        max-w-[100px]
                                        truncate
                                        rounded-md
                                        bg-blue-50
                                        px-1.5
                                        py-0.5
                                        text-blue-700
                                    "
                                    title={String(
                                        log.new_value
                                    )}
                                >
                                    New:{" "}
                                    {String(
                                        log.new_value
                                    )}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </td>

            {/* CREATED */}
            <td
                className={`
                    px-2.5
                    ${dashboard ? "py-2.5" : "py-4"}
                    min-[1280px]:max-[1365px]:px-2
                    min-[1280px]:max-[1365px]:py-2.5
                    min-[1366px]:max-[1537px]:px-2
                    min-[1366px]:max-[1537px]:py-3
                `}
            >
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
        TICKET_CREATED:
            "Ticket has been created.",

        UPDATE:
            "Ticket information has been updated.",

        STATUS_CHANGED:
            "Ticket status has been changed.",

        ASSIGNED:
            "Ticket has been assigned.",

        REASSIGNED:
            "Ticket has been reassigned.",

        PRIORITY_CHANGED:
            "Ticket priority has been changed.",

        RETURNED:
            "Ticket has been returned to the Service Desk.",

        RETURN_APPROVED:
            "Ticket return request has been approved.",

        RETURN_REJECTED:
            "Ticket return request has been rejected.",

        REVIEW_COMPLETED:
            "Ticket review has been completed.",

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

        ESCALATION_ACKNOWLEDGED:
            "Ticket escalation has been acknowledged by a Supervisor.",

        ESCALATION_COMPLETED:
            "Ticket escalation has been completed by the IT Supervisor.",

        LOGIN:
            "User has logged in.",

        LOGOUT:
            "User has logged out.",
    };

    return (
        details[action] ||
        "System activity recorded."
    );
}

function ActionBadge({ action }) {
    const config = {
        TICKET_CREATED: {
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

        ESCALATION_ACKNOWLEDGED: {
            label: "Escalation Acknowledged",
            icon: <CheckCircle2 size={14} />,
            className:
                "border-green-300 bg-green-50 text-green-700",
        },

        ESCALATION_COMPLETED: {
            label: "Escalation Completed",
            icon: <CheckCircle2 size={14} />,
            className:
                "border-green-300 bg-green-50 text-green-700",
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
            className={`
                inline-flex
                max-w-full
                items-center
                gap-1.5
                rounded-md
                border
                px-2
                py-1
                text-xs
                font-medium
                ${current.className}
                min-[1280px]:max-[1365px]:gap-1
                min-[1280px]:max-[1365px]:px-1.5
                min-[1280px]:max-[1365px]:py-0.5
                min-[1280px]:max-[1365px]:text-[10px]
                min-[1366px]:max-[1537px]:gap-1
                min-[1366px]:max-[1537px]:px-1.5
                min-[1366px]:max-[1537px]:py-0.5
                min-[1366px]:max-[1537px]:text-[11px]
            `}
        >
            <span
                className="
                    shrink-0
                    [&>svg]:size-3.5
                    min-[1280px]:max-[1365px]:[&>svg]:size-3
                    min-[1366px]:max-[1537px]:[&>svg]:size-3
                "
            >
                {current.icon}
            </span>

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

        Supervisor:
            "Supervisor",

        "System Administrator":
            "Administrator",
    };

    const normalizedRole = role || "";

    return (
        <span
            className={`
                inline-flex
                max-w-full
                whitespace-nowrap
                rounded-md
                border
                px-2
                py-1
                text-xs
                font-medium
                ${
                    roleStyles[normalizedRole] ||
                    "border-gray-300 bg-gray-50 text-gray-700"
                }
                min-[1280px]:max-[1365px]:px-1.5
                min-[1280px]:max-[1365px]:py-0.5
                min-[1280px]:max-[1365px]:text-[10px]
                min-[1366px]:max-[1537px]:px-1.5
                min-[1366px]:max-[1537px]:py-0.5
                min-[1366px]:max-[1537px]:text-[11px]
            `}
        >
            {roleLabels[normalizedRole] ||
                normalizedRole ||
                "-"}
        </span>
    );
}