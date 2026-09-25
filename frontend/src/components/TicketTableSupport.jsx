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
                        : "hidden h-[637px] overflow-y-auto md:block"
                }
            >
                <table className="w-full table-fixed text-sm">
                    <thead className="sticky top-0 z-10 bg-gray-50">
                        <tr className="border-b border-gray-300 text-left">
                            <th className="w-[10%] px-6 py-3.5 font-semibold text-black">
                                Ticket ID
                            </th>

                            <th className="w-[24%] px-6 py-3.5 font-semibold text-black">
                                Subject
                            </th>

                            <th className="w-[14%] px-4 py-3.5 font-semibold text-black">
                                Submitted By
                            </th>

                            <th className="w-[11%] px-4 py-3.5 font-semibold text-black">
                                Affected Scope
                            </th>

                            <th className="w-[9%] px-4 py-3.5 font-semibold text-black">
                                Priority
                            </th>

                            <th className="w-[10%] px-4 py-3.5 font-semibold text-black">
                                Status
                            </th>

                            <th className="w-[10%] px-4 py-3.5 font-semibold text-black">
                                Created
                            </th>

                            <th className="w-[12%] px-4 py-3.5 font-semibold text-black">
                                SLA Remaining
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {displayedTickets.map((ticket) => (
                            <tr
                                key={ticket.id}
                                onClick={() =>
                                    navigate(
                                        `/ticket/${ticket.id}`
                                    )
                                }
                                className="cursor-pointer border-b border-gray-200 transition-colors hover:bg-gray-50 last:border-b-0"
                            >
                                <td className="px-6 py-4">
                                    <span className="font-semibold text-black">
                                        {ticket.ticket_code || "-"}
                                    </span>
                                </td>

                                <td className="px-6 py-4">
                                    <p
                                        className="truncate font-medium text-black"
                                        title={ticket.subject}
                                    >
                                        {ticket.subject || "-"}
                                    </p>
                                </td>

                                <td className="px-4 py-4">
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

                                <td className="px-4 py-4">
                                    <span className="whitespace-nowrap text-black">
                                        {formatAffectedScope(
                                            ticket.affected_scope
                                        )}
                                    </span>
                                </td>

                                <td className="px-4 py-4">
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

                                <td className="px-4 py-4">
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

                                <td className="px-4 py-4">
                                    <span
                                        className="whitespace-nowrap text-black"
                                        title={formatDate(
                                            ticket.created_at
                                        )}
                                    >
                                        {formatDate(
                                            ticket.created_at
                                        )}
                                    </span>
                                </td>

                                <td className="px-4 py-4">
                                    <span className="whitespace-nowrap font-medium text-black">
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

                                {/* Affected Scope */}
                                <tr className="bg-gray-100">
                                    <th className="border-r border-gray-300 px-3 py-2 text-left font-medium text-gray-700">
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
                                        className="px-3 py-2 text-gray-900"
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
                ))}
            </div>
        </div>
    );
}