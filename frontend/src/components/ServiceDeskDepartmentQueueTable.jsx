import { statusColor } from "../utils/statusColor";
import {
    priorityColor,
    priorityLabel,
} from "../utils/priority";
import { formatDate } from "../utils/formatDate";
import { useNavigate } from "react-router-dom";

export default function ServiceDeskDepartmentQueueTable({
    ticketList = [],
    loading = false,
}) {
    const navigate = useNavigate();

    if (loading) {
        return (
            <div className="flex h-[637px] items-center justify-center overflow-hidden bg-white">
                <p className="text-sm text-gray-500">
                    Loading tickets...
                </p>
            </div>
        );
    }

    return (
        <div className="h-[637px] overflow-y-auto overflow-x-hidden bg-white">
            <table className="w-full table-fixed text-sm">
                <thead className="sticky top-0 z-10 bg-gray-50">
                    <tr className="border-b border-gray-300 text-left">
                        <th className="w-[10%] px-6 py-3.5 font-semibold text-black">
                            Ticket ID
                        </th>

                        <th className="w-[21%] px-6 py-3.5 font-semibold text-black">
                            Subject
                        </th>

                        <th className="w-[15%] px-4 py-3.5 font-semibold text-black">
                            Submitted By
                        </th>

                        <th className="w-[14%] px-4 py-3.5 font-semibold text-black">
                            Affected Scope
                        </th>

                        <th className="w-[9%] px-4 py-3.5 font-semibold text-black">
                            Priority
                        </th>

                        <th className="w-[10%] px-4 py-3.5 font-semibold text-black">
                            Status
                        </th>

                        <th className="w-[11%] px-4 py-3.5 font-semibold text-black">
                            Assigned To
                        </th>

                        <th className="w-[10%] px-4 py-3.5 font-semibold text-black">
                            SLA Remaining
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {ticketList.length > 0 ? (
                        ticketList.map((ticket) => (
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
                                        {ticket.affected_scope
                                            ? ticket.affected_scope
                                                  .charAt(0)
                                                  .toUpperCase() +
                                              ticket.affected_scope.slice(1)
                                            : "-"}
                                    </span>
                                </td>

                                <td className="px-4 py-4">
                                    <span
                                        className={`inline-flex min-w-[38px] items-center justify-center whitespace-nowrap rounded-md border px-2 py-1 text-xs font-semibold ${
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
                                    <p
                                        className="truncate font-medium text-black"
                                        title={ticket.assigned_to}
                                    >
                                        {ticket.assigned_to ||
                                            "Unassigned"}
                                    </p>
                                </td>

                                <td className="px-4 py-4">
                                    <span className="whitespace-nowrap font-medium text-black">
                                        {ticket.resolution_time_remaining ||
                                            "-"}
                                    </span>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td
                                colSpan="8"
                                className="px-6 py-16 text-center"
                            >
                                <p className="font-medium text-black">
                                    No tickets found
                                </p>

                                <p className="mt-1 text-sm text-gray-500">
                                    There are currently no tickets to display.
                                </p>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}