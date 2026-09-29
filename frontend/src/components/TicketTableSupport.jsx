import { MessageCircle } from "lucide-react";
import { statusColor } from "../utils/statusColor";
import { priorityColor, priorityLabel } from "../utils/priority";
import { formatDate } from "../utils/formatDate";
import { useNavigate } from "react-router-dom";

export default function TicketTableSupport({
    ticketList = [],
    loading = false,
    maxRows = 15,
    dashboard = false,
}) {
    const navigate = useNavigate();

    const displayedTickets = dashboard
        ? ticketList.slice(0, maxRows)
        : ticketList;

    const formatAffectedScope = (scope) => {
        if (!scope) return "-";

        return (
            scope.charAt(0).toUpperCase() +
            scope.slice(1)
        );
    };

    if (loading) {
        return (
            <div className="flex min-h-[300px] items-center justify-center bg-white px-4 py-12 md:h-[637px]">
                <p className="text-sm text-gray-500">
                    Loading tickets...
                </p>
            </div>
        );
    }

    if (displayedTickets.length === 0) {
        return (
            <div className="bg-white">
                <div className="px-6 py-16 text-center">
                    <p className="font-medium text-black">
                        No tickets found
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                        There are currently no tickets to display.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="overflow-hidden bg-white">
            {/* Desktop / Tablet */}
<div
    className={
        dashboard
            ? "hidden md:block"
            : "hidden h-[637px] overflow-y-auto md:block min-[1280px]:max-[1365px]:h-[450px] min-[1366px]:max-[1537px]:h-[500px] min-[1538px]:max-[1919px]:h-[580px] [&::-webkit-scrollbar]:w-px [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full"
    }
>
                <table className="w-full table-fixed text-sm min-[1280px]:max-[1365px]:text-[11px] min-[1366px]:max-[1535px]:text-xs">
                    <thead className="sticky top-0 z-10 bg-gray-50">
                        <tr className="border-b border-gray-300 text-left">
                            <th className="w-[7%] px-6 py-3.5 font-semibold text-black min-[1280px]:max-[1365px]:px-3 min-[1280px]:max-[1365px]:py-2.5 min-[1366px]:max-[1535px]:px-4 min-[1366px]:max-[1535px]:py-3">
                                Ticket ID
                            </th>

                            <th className="w-[13%] px-6 py-3.5 font-semibold text-black min-[1280px]:max-[1365px]:px-3 min-[1280px]:max-[1365px]:py-2.5 min-[1366px]:max-[1535px]:px-4 min-[1366px]:max-[1535px]:py-3">
                                Subject
                            </th>

                            <th className="w-[10%] px-4 py-3.5 font-semibold text-black min-[1280px]:max-[1365px]:px-2.5 min-[1280px]:max-[1365px]:py-2.5 min-[1366px]:max-[1535px]:px-3 min-[1366px]:max-[1535px]:py-3">
                                Submitted By
                            </th>

                            <th className="w-[9%] px-4 py-3.5 font-semibold text-black min-[1280px]:max-[1365px]:px-2.5 min-[1280px]:max-[1365px]:py-2.5 min-[1366px]:max-[1535px]:px-3 min-[1366px]:max-[1535px]:py-3">
                                Symptom Code
                            </th>

                            <th className="w-[10%] px-4 py-3.5 font-semibold text-black min-[1280px]:max-[1365px]:px-2.5 min-[1280px]:max-[1365px]:py-2.5 min-[1366px]:max-[1535px]:px-3 min-[1366px]:max-[1535px]:py-3">
                                Affected Scope
                            </th>

                            <th className="w-[8%] px-4 py-3.5 font-semibold text-black min-[1280px]:max-[1365px]:px-2.5 min-[1280px]:max-[1365px]:py-2.5 min-[1366px]:max-[1535px]:px-3 min-[1366px]:max-[1535px]:py-3">
                                Priority
                            </th>

                            <th className="w-[8%] px-4 py-3.5 font-semibold text-black min-[1280px]:max-[1365px]:px-2.5 min-[1280px]:max-[1365px]:py-2.5 min-[1366px]:max-[1535px]:px-3 min-[1366px]:max-[1535px]:py-3">
                                Status
                            </th>

                            <th className="w-[9%] px-4 py-3.5 font-semibold text-black min-[1280px]:max-[1365px]:px-2.5 min-[1280px]:max-[1365px]:py-2.5 min-[1366px]:max-[1535px]:px-3 min-[1366px]:max-[1535px]:py-3">
                                Created
                            </th>

                            <th className="w-[10%] px-4 py-3.5 font-semibold text-black min-[1280px]:max-[1365px]:px-2.5 min-[1280px]:max-[1365px]:py-2.5 min-[1366px]:max-[1535px]:px-3 min-[1366px]:max-[1535px]:py-3">
                                SLA Remaining
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {displayedTickets.map((ticket) => {
                            const unreadCount =
                                Number(
                                    ticket.unread_comment_count
                                ) || 0;

                            const hasUnread =
                                unreadCount > 0;

                            return (
                                <tr
                                    key={ticket.id}
                                    onClick={() =>
                                        navigate(
                                            `/ticket/${ticket.id}`
                                        )
                                    }
                                    className={`cursor-pointer border-b border-gray-200 transition-colors last:border-b-0 ${
                                        hasUnread
                                            ? "bg-[#2563EB]/[0.035] hover:bg-[#2563EB]/[0.06]"
                                            : "hover:bg-gray-50"
                                    }`}
                                >
                                    {/* Ticket ID */}
                                    <td className="whitespace-nowrap px-6 py-4 min-[1280px]:max-[1365px]:px-3 min-[1280px]:max-[1365px]:py-2.5 min-[1366px]:max-[1535px]:px-4 min-[1366px]:max-[1535px]:py-3">
                                        <span
                                            className="font-semibold text-black"
                                            title={ticket.ticket_code}
                                        >
                                            {ticket.ticket_code ||
                                                "-"}
                                        </span>
                                    </td>

                                    {/* Subject + Unread Messages */}
                                    <td className="min-w-0 overflow-hidden px-6 py-4 min-[1280px]:max-[1365px]:px-3 min-[1280px]:max-[1365px]:py-2.5 min-[1366px]:max-[1535px]:px-4 min-[1366px]:max-[1535px]:py-3">
                                        <div className="flex min-w-0 items-center gap-3 min-[1280px]:max-[1365px]:gap-1.5 min-[1366px]:max-[1535px]:gap-2">
                                            <p
                                                className={`min-w-0 flex-1 truncate text-black ${
                                                    hasUnread
                                                        ? "font-semibold"
                                                        : "font-medium"
                                                }`}
                                                title={
                                                    ticket.subject
                                                }
                                            >
                                                {ticket.subject ||
                                                    "-"}
                                            </p>

                                            {hasUnread && (
                                                <div className="relative shrink-0">
                                                    <MessageCircle
                                                        size={20}
                                                        className="text-[#2563EB] min-[1280px]:max-[1365px]:h-4 min-[1280px]:max-[1365px]:w-4 min-[1366px]:max-[1535px]:h-[18px] min-[1366px]:max-[1535px]:w-[18px]"
                                                    />

                                                    <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-semibold leading-none text-white">
                                                        {unreadCount >
                                                        99
                                                            ? "99+"
                                                            : unreadCount}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </td>

                                    {/* Submitted By */}
                                    <td className="min-w-0 overflow-hidden px-4 py-4 min-[1280px]:max-[1365px]:px-2.5 min-[1280px]:max-[1365px]:py-2.5 min-[1366px]:max-[1535px]:px-3 min-[1366px]:max-[1535px]:py-3">
                                        <div className="min-w-0">
                                            <p
                                                className="truncate font-medium text-black"
                                                title={
                                                    ticket.submitted_by_name
                                                }
                                            >
                                                {ticket.submitted_by_name ||
                                                    "-"}
                                            </p>

                                            <p
                                                className="mt-0.5 truncate text-xs text-gray-500 min-[1280px]:max-[1365px]:text-[10px]"
                                                title={
                                                    ticket.submitted_by_department
                                                }
                                            >
                                                {ticket.submitted_by_department ||
                                                    "-"}
                                            </p>
                                        </div>
                                    </td>

                                    {/* Symptom Code */}
                                    <td className="min-w-0 overflow-hidden px-4 py-4 min-[1280px]:max-[1365px]:px-2.5 min-[1280px]:max-[1365px]:py-2.5 min-[1366px]:max-[1535px]:px-3 min-[1366px]:max-[1535px]:py-3">
                                        <span
                                            className="block truncate font-medium text-black"
                                            title={
                                                ticket.symptom_code ||
                                                ticket.symptom_code_name
                                            }
                                        >
                                            {ticket.symptom_code ||
                                                ticket.symptom_code_name ||
                                                "-"}
                                        </span>
                                    </td>

                                    {/* Affected Scope */}
                                    <td className="min-w-0 overflow-hidden px-4 py-4 min-[1280px]:max-[1365px]:px-2.5 min-[1280px]:max-[1365px]:py-2.5 min-[1366px]:max-[1535px]:px-3 min-[1366px]:max-[1535px]:py-3">
                                        <span
                                            className="block truncate whitespace-nowrap font-medium text-black"
                                            title={formatAffectedScope(
                                                ticket.affected_scope
                                            )}
                                        >
                                            {formatAffectedScope(
                                                ticket.affected_scope
                                            )}
                                        </span>
                                    </td>

                                    {/* Priority */}
                                    <td className="min-w-0 overflow-hidden px-4 py-4 min-[1280px]:max-[1365px]:px-2.5 min-[1280px]:max-[1365px]:py-2.5 min-[1366px]:max-[1535px]:px-3 min-[1366px]:max-[1535px]:py-3">
                                        <span
                                            className={`inline-flex max-w-full whitespace-nowrap rounded-md border px-2 py-1 text-xs font-semibold min-[1280px]:max-[1365px]:px-1.5 min-[1280px]:max-[1365px]:py-0.5 min-[1280px]:max-[1365px]:text-[10px] min-[1366px]:max-[1535px]:px-1.5 min-[1366px]:max-[1535px]:py-0.5 ${
                                                priorityColor[
                                                    ticket.priority
                                                ] ||
                                                "border-gray-300 bg-gray-100 text-gray-600"
                                            }`}
                                        >
                                            {priorityLabel[
                                                ticket.priority
                                            ] ||
                                                ticket.priority ||
                                                "-"}
                                        </span>
                                    </td>

                                    {/* Status */}
                                    <td className="min-w-0 overflow-hidden px-4 py-4 min-[1280px]:max-[1365px]:px-2.5 min-[1280px]:max-[1365px]:py-2.5 min-[1366px]:max-[1535px]:px-3 min-[1366px]:max-[1535px]:py-3">
                                        <span
                                            className={`inline-flex max-w-full whitespace-nowrap rounded-md px-2 py-1 text-xs font-medium min-[1280px]:max-[1365px]:px-1.5 min-[1280px]:max-[1365px]:py-0.5 min-[1280px]:max-[1365px]:text-[10px] min-[1366px]:max-[1535px]:px-1.5 min-[1366px]:max-[1535px]:py-0.5 ${
                                                statusColor[
                                                    ticket.status
                                                ] ||
                                                "border border-gray-300 bg-gray-100 text-gray-700"
                                            }`}
                                        >
                                            {ticket.status || "-"}
                                        </span>
                                    </td>

                                    {/* Created */}
                                    <td className="min-w-0 overflow-hidden px-4 py-4 min-[1280px]:max-[1365px]:px-2.5 min-[1280px]:max-[1365px]:py-2.5 min-[1366px]:max-[1535px]:px-3 min-[1366px]:max-[1535px]:py-3">
                                        <span
                                            className="block truncate whitespace-nowrap text-black"
                                            title={formatDate(
                                                ticket.created_at
                                            )}
                                        >
                                            {formatDate(
                                                ticket.created_at
                                            )}
                                        </span>
                                    </td>

                                    {/* SLA Remaining */}
                                    <td className="min-w-0 overflow-hidden px-4 py-4 min-[1280px]:max-[1365px]:px-2.5 min-[1280px]:max-[1365px]:py-2.5 min-[1366px]:max-[1535px]:px-3 min-[1366px]:max-[1535px]:py-3">
                                        <span
                                            className="block truncate whitespace-nowrap font-medium text-black"
                                            title={
                                                ticket.resolution_time_remaining ||
                                                "-"
                                            }
                                        >
                                            {ticket.resolution_time_remaining ||
                                                "-"}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Mobile */}
            <div
                className={
                    dashboard
                        ? "md:hidden"
                        : "h-[450px] overflow-y-auto md:hidden"
                }
            >
                {displayedTickets.map((ticket) => {
                    const unreadCount =
                        Number(
                            ticket.unread_comment_count
                        ) || 0;

                    const hasUnread =
                        unreadCount > 0;

                    return (
                        <div
                            key={ticket.id}
                            onClick={() =>
                                navigate(
                                    `/ticket/${ticket.id}`
                                )
                            }
                            className={`cursor-pointer border-b border-gray-300 transition-colors ${
                                hasUnread
                                    ? "bg-[#2563EB]/[0.035] hover:bg-[#2563EB]/[0.06]"
                                    : "bg-white hover:bg-gray-50"
                            }`}
                        >
                            <table className="w-full table-fixed text-xs">
                                <tbody>
                                    {/* Ticket ID */}
                                    <tr className="bg-gray-100">
                                        <th className="w-[40%] border-r border-gray-300 px-3 py-2 text-left font-semibold text-gray-700">
                                            Ticket ID
                                        </th>

                                        <td className="px-3 py-2 font-semibold text-[#2563EB]">
                                            {ticket.ticket_code ||
                                                "-"}
                                        </td>
                                    </tr>

                                    {/* Subject */}
                                    <tr>
                                        <th className="border-r border-gray-200 px-3 py-2 text-left font-medium text-gray-600">
                                            Subject
                                        </th>

                                        <td
                                            className={`truncate px-3 py-2 text-gray-900 ${
                                                hasUnread
                                                    ? "font-semibold"
                                                    : "font-medium"
                                            }`}
                                            title={ticket.subject}
                                        >
                                            <div className="flex min-w-0 items-center gap-3">
                                                <span className="min-w-0 truncate">
                                                    {ticket.subject ||
                                                        "-"}
                                                </span>

                                                {hasUnread && (
                                                    <div className="relative shrink-0">
                                                        <MessageCircle
                                                            size={20}
                                                            className="text-[#2563EB]"
                                                        />

                                                        <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-semibold leading-none text-white">
                                                            {unreadCount >
                                                            99
                                                                ? "99+"
                                                                : unreadCount}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>

                                    {/* Submitted By */}
                                    <tr className="bg-gray-100">
                                        <th className="border-r border-gray-300 px-3 py-2 text-left font-medium text-gray-700">
                                            Submitted By
                                        </th>

                                        <td
                                            className="truncate px-3 py-2 text-gray-900"
                                            title={
                                                ticket.submitted_by_name
                                            }
                                        >
                                            {ticket.submitted_by_name ||
                                                "-"}
                                        </td>
                                    </tr>

                                    {/* Submitted By Department */}
                                    <tr>
                                        <th className="border-r border-gray-200 px-3 py-2 text-left font-medium text-gray-600">
                                            Department
                                        </th>

                                        <td
                                            className="truncate px-3 py-2 text-gray-900"
                                            title={
                                                ticket.submitted_by_department
                                            }
                                        >
                                            {ticket.submitted_by_department ||
                                                "-"}
                                        </td>
                                    </tr>

                                    {/* Symptom Code */}
                                    <tr className="bg-gray-100">
                                        <th className="border-r border-gray-300 px-3 py-2 text-left font-medium text-gray-700">
                                            Symptom Code
                                        </th>

                                        <td
                                            className="truncate px-3 py-2 text-gray-900"
                                            title={
                                                ticket.symptom_code ||
                                                ticket.symptom_code_name
                                            }
                                        >
                                            {ticket.symptom_code ||
                                                ticket.symptom_code_name ||
                                                "-"}
                                        </td>
                                    </tr>

                                    {/* Affected Scope */}
                                    <tr>
                                        <th className="border-r border-gray-200 px-3 py-2 text-left font-medium text-gray-600">
                                            Affected Scope
                                        </th>

                                        <td className="px-3 py-2 text-gray-900">
                                            {formatAffectedScope(
                                                ticket.affected_scope
                                            )}
                                        </td>
                                    </tr>

                                    {/* Priority */}
                                    <tr>
                                        <th className="border-r border-gray-200 px-3 py-2 text-left font-medium text-gray-600">
                                            Priority
                                        </th>

                                        <td className="px-3 py-2">
                                            <span
                                                className={`inline-flex rounded-md border px-2 py-1 text-[10px] font-semibold ${
                                                    priorityColor[
                                                        ticket.priority
                                                    ] ||
                                                    "border-gray-300 bg-gray-100 text-gray-600"
                                                }`}
                                            >
                                                {priorityLabel[
                                                    ticket.priority
                                                ] ||
                                                    ticket.priority ||
                                                    "-"}
                                            </span>
                                        </td>
                                    </tr>

                                    {/* Status */}
                                    <tr className="bg-gray-100">
                                        <th className="border-r border-gray-300 px-3 py-2 text-left font-medium text-gray-700">
                                            Status
                                        </th>

                                        <td className="px-3 py-2">
                                            <span
                                                className={`inline-flex rounded-md px-2 py-1 text-[10px] font-medium ${
                                                    statusColor[
                                                        ticket.status
                                                    ] ||
                                                    "border border-gray-300 bg-gray-100 text-gray-700"
                                                }`}
                                            >
                                                {ticket.status || "-"}
                                            </span>
                                        </td>
                                    </tr>

                                    {/* Created */}
                                    <tr>
                                        <th className="border-r border-gray-200 px-3 py-2 text-left font-medium text-gray-600">
                                            Created
                                        </th>

                                        <td
                                            className="px-3 py-2 font-medium text-gray-900"
                                            title={formatDate(
                                                ticket.created_at
                                            )}
                                        >
                                            {formatDate(
                                                ticket.created_at
                                            )}
                                        </td>
                                    </tr>

                                    {/* SLA Remaining */}
                                    <tr className="bg-gray-100">
                                        <th className="border-r border-gray-300 px-3 py-2 text-left font-medium text-gray-700">
                                            SLA Remaining
                                        </th>

                                        <td className="px-3 py-2 font-medium text-gray-900">
                                            {ticket.resolution_time_remaining ||
                                                "-"}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}