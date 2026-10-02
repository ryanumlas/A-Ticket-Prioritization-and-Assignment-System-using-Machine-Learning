import { MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { statusColor } from "../../utils/statusColor";
import { priorityColor, priorityLabel } from "../../utils/priority";
import { formatDate } from "../../utils/formatDate";

export default function SupervisorEscalatedTicketTable({
    ticketList = [],
    loading = false,
    maxRows = 15,
    dashboard = false,
}) {
    const navigate = useNavigate();

    const displayedTickets = dashboard
        ? ticketList.slice(0, maxRows)
        : ticketList;

    if (loading) {
        return (
            <div
                className={
                    dashboard
                        ? "flex min-h-[220px] items-center justify-center bg-white px-4 py-10"
                        : "flex min-h-[220px] items-center justify-center bg-white px-4 py-12"
                }
            >
                <p
                    className="
                        text-sm text-gray-500
                        min-[1280px]:max-[1365px]:text-[11px]
                        min-[1366px]:max-[1537px]:text-xs
                    "
                >
                    Loading escalated tickets...
                </p>
            </div>
        );
    }

    if (displayedTickets.length === 0) {
        return (
            <div className="bg-white">
                <div
                    className={
                        dashboard
                            ? "px-6 py-10 text-center"
                            : "px-6 py-16 text-center min-[1280px]:max-[1365px]:px-4 min-[1280px]:max-[1365px]:py-12 min-[1366px]:max-[1537px]:px-5 min-[1366px]:max-[1537px]:py-14"
                    }
                >
                    <p
                        className="
                            font-medium text-black
                            min-[1280px]:max-[1365px]:text-[11px]
                            min-[1366px]:max-[1537px]:text-xs
                        "
                    >
                        No escalated tickets found
                    </p>

                    <p
                        className="
                            mt-1 text-sm text-gray-500
                            min-[1280px]:max-[1365px]:text-[11px]
                            min-[1366px]:max-[1537px]:text-xs
                        "
                    >
                        There are currently no escalated tickets to display.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="overflow-hidden bg-white">
            {/* DESKTOP / TABLET */}
            <div
                className={
                    dashboard
                        ? "hidden md:block"
                        : "hidden md:block"
                }
            >
                <table className="w-full table-fixed text-sm min-[1280px]:max-[1365px]:text-[11px] min-[1366px]:max-[1537px]:text-xs">
                    <thead className="bg-gray-50">
                        <tr className="border-b border-gray-300 text-left">
                            <th className="w-[8%] px-5 py-3 font-semibold text-black min-[1280px]:max-[1365px]:px-3 min-[1280px]:max-[1365px]:py-2.5 min-[1366px]:max-[1537px]:px-3 min-[1366px]:max-[1537px]:py-3">
                                Ticket ID
                            </th>

                            <th className="w-[19%] px-5 py-3 font-semibold text-black min-[1280px]:max-[1365px]:px-3 min-[1280px]:max-[1365px]:py-2.5 min-[1366px]:max-[1537px]:px-3 min-[1366px]:max-[1537px]:py-3">
                                Subject
                            </th>

                            <th className="w-[10%] px-4 py-3 font-semibold text-black min-[1280px]:max-[1365px]:px-3 min-[1280px]:max-[1365px]:py-2.5 min-[1366px]:max-[1537px]:px-3 min-[1366px]:max-[1537px]:py-3">
                                Submitted By
                            </th>

                            <th className="w-[12%] px-4 py-3 font-semibold text-black min-[1280px]:max-[1365px]:px-3 min-[1280px]:max-[1365px]:py-2.5 min-[1366px]:max-[1537px]:px-3 min-[1366px]:max-[1537px]:py-3">
                                Assigned To
                            </th>

                            <th className="w-[8%] px-4 py-3 font-semibold text-black min-[1280px]:max-[1365px]:px-3 min-[1280px]:max-[1365px]:py-2.5 min-[1366px]:max-[1537px]:px-3 min-[1366px]:max-[1537px]:py-3">
                                Priority
                            </th>

                            <th className="w-[8%] px-4 py-3 font-semibold text-black min-[1280px]:max-[1365px]:px-3 min-[1280px]:max-[1365px]:py-2.5 min-[1366px]:max-[1537px]:px-3 min-[1366px]:max-[1537px]:py-3">
                                Status
                            </th>

                            <th className="w-[12%] px-4 py-3 font-semibold text-black min-[1280px]:max-[1365px]:px-3 min-[1280px]:max-[1365px]:py-2.5 min-[1366px]:max-[1537px]:px-3 min-[1366px]:max-[1537px]:py-3">
                                Escalated
                            </th>

                            <th className="w-[9%] px-4 py-3 font-semibold text-black min-[1280px]:max-[1365px]:px-3 min-[1280px]:max-[1365px]:py-2.5 min-[1366px]:max-[1537px]:px-3 min-[1366px]:max-[1537px]:py-3">
                                SLA Remaining
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {displayedTickets.map((ticket) => {
                            const unreadCount =
                                Number(ticket.unread_comment_count) || 0;

                            const hasUnread = unreadCount > 0;

                            return (
                                <tr
                                    key={ticket.id}
                                    onClick={() =>
                                        navigate(`/ticket/${ticket.id}`)
                                    }
                                    className={`cursor-pointer border-b border-gray-200 transition-colors last:border-b-0 ${
                                        hasUnread
                                            ? "bg-[#2563EB]/[0.035] hover:bg-[#2563EB]/[0.06]"
                                            : "hover:bg-gray-50"
                                    }`}
                                >
                                    {/* TICKET ID */}
                                    <td className="px-5 py-3 min-[1280px]:max-[1365px]:px-3 min-[1280px]:max-[1365px]:py-2.5 min-[1366px]:max-[1537px]:px-3 min-[1366px]:max-[1537px]:py-3">
                                        <span className="font-semibold text-black">
                                            {ticket.ticket_code || "-"}
                                        </span>
                                    </td>

                                    {/* SUBJECT */}
                                    <td className="px-5 py-3 min-[1280px]:max-[1365px]:px-3 min-[1280px]:max-[1365px]:py-2.5 min-[1366px]:max-[1537px]:px-3 min-[1366px]:max-[1537px]:py-3">
                                        <div className="flex min-w-0 items-center gap-3 min-[1280px]:max-[1365px]:gap-2 min-[1366px]:max-[1537px]:gap-2">
                                            <p
                                                className={`min-w-0 truncate text-black ${
                                                    hasUnread
                                                        ? "font-semibold"
                                                        : "font-medium"
                                                }`}
                                                title={ticket.subject}
                                            >
                                                {ticket.subject || "-"}
                                            </p>

                                            {hasUnread && (
                                                <div className="relative shrink-0">
                                                    <MessageCircle
                                                        size={20}
                                                        className="text-[#2563EB] min-[1280px]:max-[1365px]:size-4 min-[1366px]:max-[1537px]:size-[18px]"
                                                    />

                                                    <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-semibold leading-none text-white min-[1280px]:max-[1365px]:h-3.5 min-[1280px]:max-[1365px]:min-w-3.5 min-[1280px]:max-[1365px]:text-[8px] min-[1366px]:max-[1537px]:h-3.5 min-[1366px]:max-[1537px]:min-w-3.5 min-[1366px]:max-[1537px]:text-[8px]">
                                                        {unreadCount > 99
                                                            ? "99+"
                                                            : unreadCount}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </td>

                                    {/* SUBMITTED BY */}
                                    <td className="px-4 py-3 min-[1280px]:max-[1365px]:px-3 min-[1280px]:max-[1365px]:py-2.5 min-[1366px]:max-[1537px]:px-3 min-[1366px]:max-[1537px]:py-3">
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
                                                className="mt-0.5 truncate text-xs text-gray-500 min-[1280px]:max-[1365px]:text-[10px] min-[1366px]:max-[1537px]:text-[11px]"
                                                title={
                                                    ticket.submitted_by_department
                                                }
                                            >
                                                {ticket.submitted_by_department ||
                                                    "-"}
                                            </p>
                                        </div>
                                    </td>

                                    {/* ASSIGNED TO */}
                                    <td className="px-4 py-3 min-[1280px]:max-[1365px]:px-3 min-[1280px]:max-[1365px]:py-2.5 min-[1366px]:max-[1537px]:px-3 min-[1366px]:max-[1537px]:py-3">
                                        <div className="min-w-0">
                                            <p
                                                className="truncate font-medium text-black"
                                                title={
                                                    ticket.assigned_to_name
                                                }
                                            >
                                                {ticket.assigned_to_name ||
                                                    "-"}
                                            </p>

                                            <p
                                                className="mt-0.5 truncate text-xs text-gray-500 min-[1280px]:max-[1365px]:text-[10px] min-[1366px]:max-[1537px]:text-[11px]"
                                                title={
                                                    ticket.department_name
                                                }
                                            >
                                                {ticket.department_name ||
                                                    "-"}
                                            </p>
                                        </div>
                                    </td>

                                    {/* PRIORITY */}
                                    <td className="px-4 py-3 min-[1280px]:max-[1365px]:px-3 min-[1280px]:max-[1365px]:py-2.5 min-[1366px]:max-[1537px]:px-3 min-[1366px]:max-[1537px]:py-3">
                                        <span
                                            className={`inline-flex whitespace-nowrap rounded-md border px-2 py-1 text-xs font-semibold min-[1280px]:max-[1365px]:px-1.5 min-[1280px]:max-[1365px]:py-0.5 min-[1280px]:max-[1365px]:text-[10px] min-[1366px]:max-[1537px]:px-1.5 min-[1366px]:max-[1537px]:py-1 min-[1366px]:max-[1537px]:text-[11px] ${
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

                                    {/* STATUS */}
                                    <td className="px-4 py-3 min-[1280px]:max-[1365px]:px-3 min-[1280px]:max-[1365px]:py-2.5 min-[1366px]:max-[1537px]:px-3 min-[1366px]:max-[1537px]:py-3">
                                        <span
                                            className={`inline-flex whitespace-nowrap rounded-md px-2 py-1 text-xs font-medium min-[1280px]:max-[1365px]:px-1.5 min-[1280px]:max-[1365px]:py-0.5 min-[1280px]:max-[1365px]:text-[10px] min-[1366px]:max-[1537px]:px-1.5 min-[1366px]:max-[1537px]:py-1 min-[1366px]:max-[1537px]:text-[11px] ${
                                                statusColor[
                                                    ticket.status
                                                ] ||
                                                "border border-gray-300 bg-gray-100 text-gray-700"
                                            }`}
                                        >
                                            {ticket.status || "-"}
                                        </span>
                                    </td>

                                    {/* ESCALATED */}
                                    <td className="px-4 py-3 min-[1280px]:max-[1365px]:px-3 min-[1280px]:max-[1365px]:py-2.5 min-[1366px]:max-[1537px]:px-3 min-[1366px]:max-[1537px]:py-3">
                                        <span
                                            className="whitespace-nowrap text-gray-700"
                                            title={formatDate(
                                                ticket.escalated_at
                                            )}
                                        >
                                            {formatDate(
                                                ticket.escalated_at
                                            )}
                                        </span>
                                    </td>

                                    {/* SLA REMAINING */}
                                    <td className="px-4 py-3 min-[1280px]:max-[1365px]:px-3 min-[1280px]:max-[1365px]:py-2.5 min-[1366px]:max-[1537px]:px-3 min-[1366px]:max-[1537px]:py-3">
                                        <span className="whitespace-nowrap font-medium text-gray-900">
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

            {/* MOBILE */}
            <div
                className={
                    dashboard
                        ? "md:hidden"
                        : "md:hidden"
                }
            >
                {displayedTickets.map((ticket) => {
                    const unreadCount =
                        Number(ticket.unread_comment_count) || 0;

                    const hasUnread = unreadCount > 0;

                    return (
                        <div
                            key={ticket.id}
                            onClick={() =>
                                navigate(`/ticket/${ticket.id}`)
                            }
                            className={`cursor-pointer border-b border-gray-300 transition-colors ${
                                hasUnread
                                    ? "bg-[#2563EB]/[0.035] hover:bg-[#2563EB]/[0.06]"
                                    : "bg-white hover:bg-gray-50"
                            }`}
                        >
                            <table className="w-full table-fixed text-xs">
                                <tbody>
                                    {/* TICKET ID */}
                                    <tr className="bg-gray-100">
                                        <th className="w-[40%] border-r border-gray-300 px-3 py-2 text-left font-semibold text-gray-700">
                                            Ticket ID
                                        </th>

                                        <td className="px-3 py-2 font-semibold text-[#2563EB]">
                                            {ticket.ticket_code || "-"}
                                        </td>
                                    </tr>

                                    {/* SUBJECT */}
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

                                    {/* SUBMITTED BY */}
                                    <tr className="bg-gray-100">
                                        <th className="border-r border-gray-300 px-3 py-2 text-left font-medium text-gray-700">
                                            Submitted By
                                        </th>

                                        <td className="px-3 py-2">
                                            <p
                                                className="truncate font-medium text-gray-900"
                                                title={
                                                    ticket.submitted_by_name
                                                }
                                            >
                                                {ticket.submitted_by_name ||
                                                    "-"}
                                            </p>

                                            <p
                                                className="mt-0.5 truncate text-[11px] text-gray-500"
                                                title={
                                                    ticket.submitted_by_department
                                                }
                                            >
                                                {ticket.submitted_by_department ||
                                                    "-"}
                                            </p>
                                        </td>
                                    </tr>

                                    {/* ASSIGNED TO */}
                                    <tr>
                                        <th className="border-r border-gray-200 px-3 py-2 text-left font-medium text-gray-600">
                                            Assigned To
                                        </th>

                                        <td className="px-3 py-2">
                                            <p
                                                className="truncate font-medium text-gray-900"
                                                title={
                                                    ticket.assigned_to_name
                                                }
                                            >
                                                {ticket.assigned_to_name ||
                                                    "-"}
                                            </p>

                                            <p
                                                className="mt-0.5 truncate text-[11px] text-gray-500"
                                                title={
                                                    ticket.department_name
                                                }
                                            >
                                                {ticket.department_name ||
                                                    "-"}
                                            </p>
                                        </td>
                                    </tr>

                                    {/* PRIORITY */}
                                    <tr className="bg-gray-100">
                                        <th className="border-r border-gray-300 px-3 py-2 text-left font-medium text-gray-700">
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

                                    {/* STATUS */}
                                    <tr>
                                        <th className="border-r border-gray-200 px-3 py-2 text-left font-medium text-gray-600">
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

                                    {/* ESCALATED */}
                                    <tr className="bg-gray-100">
                                        <th className="border-r border-gray-300 px-3 py-2 text-left font-medium text-gray-700">
                                            Escalated
                                        </th>

                                        <td
                                            className="px-3 py-2 text-gray-900"
                                            title={formatDate(
                                                ticket.escalated_at
                                            )}
                                        >
                                            {formatDate(
                                                ticket.escalated_at
                                            )}
                                        </td>
                                    </tr>

                                    {/* SLA REMAINING */}
                                    <tr>
                                        <th className="border-r border-gray-200 px-3 py-2 text-left font-medium text-gray-600">
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