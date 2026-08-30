import api from "../api";
import { formatDate } from "../utils/formatDate";
import { getCurrentUser } from "../utils/auth";
import { statusColor } from "../utils/statusColor";

export default function TicketTableServiceDesk({ ticketList, loading = false, maxRows = 15, dashboard = false }) {
    const displayedTickets = dashboard
        ? ticketList.slice(0, maxRows)
        : ticketList;

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12 text-sm text-gray-500">
                Loading tickets...
            </div>
        );
    }
    const priorityStyle = (priority) => {
        switch (priority) {
            case "P1":
                return "bg-red-50 text-red-600 border-red-200";

            case "P2":
                return "bg-orange-50 text-orange-600 border-orange-200";

            case "P3":
                return "bg-amber-50 text-amber-600 border-amber-200";

            case "P4":
                return "bg-blue-50 text-blue-600 border-blue-200";

            case "P5":
                return "bg-gray-100 text-gray-600 border-gray-300";

            default:
                return "bg-gray-100 text-gray-600 border-gray-300";
        }
    };
    return(
        <div
            className={`bg-white ${
                dashboard
                    ? ""
                    : "max-h-[637px] overflow-y-auto border border-gray-300"
            }`}
        >
            <table className="w-full table-fixed text-sm">
                <thead className="sticky top-0 bg-gray-50">
                    <tr className="text-left">
                        <th className="w-[15%] px-6 py-3 font-semibold">Ticket ID</th>
                        <th className="w-[40%] px-6 font-semibold">Subject</th>
                        <th className="w-[12%] px-6 font-semibold">Priority</th>
                        <th className="w-[13%] px-4 font-semibold">Status</th>
                        <th className="w-[20%] px-6 font-semibold">SLA Remaining</th>
                    </tr>
                </thead>

                <tbody>
                    {displayedTickets.length > 0 ? (
                        displayedTickets.map((ticket) => (
                            <tr
                                key={ticket.id}
                                className="border-t border-gray-300 hover:bg-gray-100 transition cursor-pointer"
                            >
                                <td className="px-6 py-4 font-semibold">
                                    {ticket.ticket_code || "-"}
                                </td>

                                <td className="px-6 py-4 truncate">
                                    {ticket.subject || "-"}
                                </td>

                                <td className="px-6 py-4">
                                    <span
                                        className={`inline-flex min-w-[38px] items-center justify-center rounded-md border px-2.5 py-1 text-xs font-semibold ${
                                            priorityStyle(ticket.priority)
                                        }`}
                                    >
                                        {ticket.priority || "-"}
                                    </span>
                                </td>

                                <td className="px-4 py-4">
                                    <span
                                        className={`inline-flex whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium ${
                                            statusColor[ticket.status] ||
                                            "border border-gray-300 bg-gray-100 text-gray-700"
                                        }`}
                                    >
                                        {ticket.status || "-"}
                                    </span>
                                </td>

                                <td className="px-6 py-4 font-semibold">
                                    {ticket.resolution_time_remaining || "-"}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td
                                colSpan="5"
                                className="py-12 text-center text-sm text-gray-400"
                            >
                                No tickets found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}