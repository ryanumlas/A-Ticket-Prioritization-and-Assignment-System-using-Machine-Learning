import api from "../api";
import { formatDate } from "../utils/formatDate";
import { getCurrentUser } from "../utils/auth";

export default function TicketTableServiceDesk({ ticketList, loading = false, maxRows = 15, dashboard = false }) {
    const limitedTickets = ticketList.slice(0, maxRows);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12 text-sm text-gray-500">
                Loading tickets...
            </div>
        );
    }
    return(
        <div
            className={`bg-white ${
                dashboard
                    ? ""
                    : "max-h-[637px] overflow-y-auto border border-gray-300"
            }`}
        >
            <table className="w-full table-fixed text-sm">
                <thead className="sticky top-0 bg-white">
                    <tr className="text-left">
                        <th className="w-[15%] px-6 py-3 font-semibold">Ticket ID</th>
                        <th className="w-[40%] px-6 font-semibold">Subject</th>
                        <th className="w-[12%] px-6 font-semibold">Priority</th>
                        <th className="w-[13%] px-4 font-semibold">Status</th>
                        <th className="w-[20%] px-6 font-semibold">SLA Remaining</th>
                    </tr>
                </thead>

                <tbody>
                    {limitedTickets.length > 0 ? (
                        limitedTickets.map((ticket) => (
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
                                    {ticket.priority || "-"}
                                </td>

                                <td className="px-4 py-4">
                                    {ticket.status || "-"}
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