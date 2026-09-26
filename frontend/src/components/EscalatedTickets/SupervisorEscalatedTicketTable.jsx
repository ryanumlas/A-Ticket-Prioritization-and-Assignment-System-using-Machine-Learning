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
                        : "flex min-h-[300px] items-center justify-center bg-white px-4 py-12"
                }
            >
                <p className="text-sm text-gray-500">
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
                            : "px-6 py-16 text-center"
                    }
                >
                    <p className="font-medium text-black">
                        No escalated tickets found
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                        There are currently no escalated tickets to display.
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
                        : "hidden max-h-[637px] overflow-y-auto md:block"
                }
            >
                <table className="w-full table-fixed text-sm">
                    <thead className="bg-gray-50">
                        <tr className="border-b border-gray-300 text-left">
                            <th className="w-[8%] px-5 py-3 font-semibold text-black">
                                Ticket ID
                            </th>

                            <th className="w-[19%] px-5 py-3 font-semibold text-black">
                                Subject
                            </th>

                            <th className="w-[10%] px-4 py-3 font-semibold text-black">
                                Submitted By
                            </th>

                            <th className="w-[12%] px-4 py-3 font-semibold text-black">
                                Assigned To
                            </th>

                            <th className="w-[8%] px-4 py-3 font-semibold text-black">
                                Priority
                            </th>

                            <th className="w-[8%] px-4 py-3 font-semibold text-black">
                                Status
                            </th>

                            <th className="w-[12%] px-4 py-3 font-semibold text-black">
                                Escalated
                            </th>

                            <th className="w-[9%] px-4 py-3 font-semibold text-black">
                                SLA Remaining
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {displayedTickets.map((ticket) => (
                            <tr
                                key={ticket.id}
                                onClick={() =>
                                    navigate(`/ticket/${ticket.id}`)
                                }
                                className="cursor-pointer border-b border-gray-200 transition-colors hover:bg-gray-50 last:border-b-0"
                            >
                                {/* Ticket ID */}
                                <td className="px-5 py-3">
                                    <span className="font-semibold text-black">
                                        {ticket.ticket_code || "-"}
                                    </span>
                                </td>

                                {/* Subject */}
                                <td className="px-5 py-3">
                                    <p
                                        className="truncate font-medium text-black"
                                        title={ticket.subject}
                                    >
                                        {ticket.subject || "-"}
                                    </p>
                                </td>

                                {/* Submitted By + Employee Department */}
                                <td className="px-4 py-3">
                                    <div className="min-w-0">
                                        <p
                                            className="truncate font-medium text-black"
                                            title={ticket.submitted_by_name}
                                        >
                                            {ticket.submitted_by_name || "-"}
                                        </p>

                                        <p
                                            className="mt-0.5 truncate text-xs text-gray-500"
                                            title={
                                                ticket.submitted_by_department
                                            }
                                        >
                                            {ticket.submitted_by_department ||
                                                "-"}
                                        </p>
                                    </div>
                                </td>

                                {/* Assigned To + IT Department */}
                                <td className="px-4 py-3">
                                    <div className="min-w-0">
                                        <p
                                            className="truncate font-medium text-black"
                                            title={ticket.assigned_to_name}
                                        >
                                            {ticket.assigned_to_name || "-"}
                                        </p>

                                        <p
                                            className="mt-0.5 truncate text-xs text-gray-500"
                                            title={ticket.department_name}
                                        >
                                            {ticket.department_name || "-"}
                                        </p>
                                    </div>
                                </td>

                                {/* Priority */}
                                <td className="px-4 py-3">
                                    <span
                                        className={`inline-flex whitespace-nowrap rounded-md border px-2 py-1 text-xs font-semibold ${
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
                                <td className="px-4 py-3">
                                    <span
                                        className={`inline-flex whitespace-nowrap rounded-md px-2 py-1 text-xs font-medium ${
                                            statusColor[
                                                ticket.status
                                            ] ||
                                            "border border-gray-300 bg-gray-100 text-gray-700"
                                        }`}
                                    >
                                        {ticket.status || "-"}
                                    </span>
                                </td>

                                {/* Escalated */}
                                <td className="px-4 py-3">
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

                                {/* SLA Remaining */}
                                <td className="px-4 py-3">
                                    <span className="whitespace-nowrap font-medium text-gray-900">
                                        {ticket.resolution_time_remaining ||
                                            "-"}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile */}
            <div
                className={
                    dashboard
                        ? "md:hidden"
                        : "max-h-[637px] overflow-y-auto md:hidden"
                }
            >
                {displayedTickets.map((ticket) => (
                    <div
                        key={ticket.id}
                        onClick={() =>
                            navigate(`/ticket/${ticket.id}`)
                        }
                        className="cursor-pointer border-b border-gray-300 bg-white transition-colors hover:bg-gray-50"
                    >
                        <table className="w-full table-fixed text-xs">
                            <tbody>
                                {/* Ticket ID */}
                                <tr className="bg-gray-100">
                                    <th className="w-[40%] border-r border-gray-300 px-3 py-2 text-left font-semibold text-gray-700">
                                        Ticket ID
                                    </th>

                                    <td className="px-3 py-2 font-semibold text-[#2563EB]">
                                        {ticket.ticket_code || "-"}
                                    </td>
                                </tr>

                                {/* Subject */}
                                <tr>
                                    <th className="border-r border-gray-200 px-3 py-2 text-left font-medium text-gray-600">
                                        Subject
                                    </th>

                                    <td
                                        className="truncate px-3 py-2 font-medium text-gray-900"
                                        title={ticket.subject}
                                    >
                                        {ticket.subject || "-"}
                                    </td>
                                </tr>

                                {/* Submitted By */}
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
                                            {ticket.submitted_by_name || "-"}
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

                                {/* Assigned To */}
                                <tr>
                                    <th className="border-r border-gray-200 px-3 py-2 text-left font-medium text-gray-600">
                                        Assigned To
                                    </th>

                                    <td className="px-3 py-2">
                                        <p
                                            className="truncate font-medium text-gray-900"
                                            title={ticket.assigned_to_name}
                                        >
                                            {ticket.assigned_to_name || "-"}
                                        </p>

                                        <p
                                            className="mt-0.5 truncate text-[11px] text-gray-500"
                                            title={ticket.department_name}
                                        >
                                            {ticket.department_name || "-"}
                                        </p>
                                    </td>
                                </tr>

                                {/* Priority */}
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

                                {/* Status */}
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

                                {/* Escalated */}
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

                                {/* SLA Remaining */}
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
                ))}
            </div>
        </div>
    );
}