import { MessageCircle } from "lucide-react";
import { formatDate } from "../utils/formatDate";
import { useNavigate } from "react-router-dom";
import { statusColor } from "../utils/statusColor";
import { priorityColor, priorityLabel } from "../utils/priority";

export default function TicketTableEmployee({
    loading = false,
    ticketList = [],
    maxRows = 15,
    dashboard = false,
}) {
    const navigate = useNavigate();

    const displayedTickets = dashboard ? ticketList.slice(0, maxRows) : ticketList;

    const staticUnread = {
        "TKT-000009": 2,
        "TKT-000006": 1,
        "TKT-000004": 3,
        "TKT-000005": 1,
    };

    if (loading) {
        return (
            <div className="flex min-h-[240px] items-center justify-center bg-white">
                <p className="text-sm text-gray-500">Loading tickets...</p>
            </div>
        );
    }

    return (
        <div className={dashboard ? "h-[380px] overflow-y-auto bg-white" : "max-h-[637px] overflow-y-auto bg-white"}>
            <table className="w-full table-fixed text-sm">
                <thead className="sticky top-0 z-20 bg-gray-50">
                    <tr className="border-b border-gray-300 text-left">
                        <th className="w-[16%] px-6 py-3.5 font-semibold text-black">Ticket ID</th>
                        <th className="w-[38%] px-6 py-3.5 font-semibold text-black">Subject</th>
                        <th className="w-[12%] px-6 py-3.5 font-semibold text-black">Priority</th>
                        <th className="w-[16%] px-4 py-3.5 font-semibold text-black">Status</th>
                        <th className="w-[18%] px-6 py-3.5 font-semibold text-black">Created</th>
                    </tr>
                </thead>

                <tbody>
                    {displayedTickets.length > 0 ? (
                        displayedTickets.map((ticket) => {
                            const unreadCount = staticUnread[ticket.ticket_code] || 0;
                            const hasUnread = unreadCount > 0;

                            return (
                                <tr
                                    key={ticket.id}
                                    onClick={() => navigate(`/ticket/${ticket.id}`)}
                                    className={`cursor-pointer border-b border-gray-200 transition-colors last:border-b-0 ${
                                        hasUnread
                                            ? "bg-[#4C4CF9]/[0.035] hover:bg-[#4C4CF9]/[0.06]"
                                            : "hover:bg-gray-50"
                                    }`}
                                >
                                    <td className="px-6 py-4">
                                        <span className="whitespace-nowrap font-semibold text-black">
                                            {ticket.ticket_code || "-"}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4">
                                        <div className="flex min-w-0 items-center gap-3">
                                            <p
                                                className={`truncate text-black ${hasUnread ? "font-semibold" : "font-medium"}`}
                                                title={ticket.subject}
                                            >
                                                {ticket.subject || "-"}
                                            </p>

                                            {hasUnread && (
                                                <div className="relative shrink-0">
                                                    <MessageCircle size={20} className="text-[#4C4CF9]" />

                                                    <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-semibold leading-none text-white">
                                                        {unreadCount > 99 ? "99+" : unreadCount}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </td>

                                    <td className="px-6 py-4">
                                        <span
                                            className={`inline-flex whitespace-nowrap rounded-md border px-2.5 py-1 text-xs font-semibold ${
                                                priorityColor[ticket.priority] ||
                                                "border-gray-300 bg-gray-100 text-gray-600"
                                            }`}
                                        >
                                            {priorityLabel[ticket.priority] || ticket.priority || "-"}
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

                                    <td className="px-6 py-4">
                                        <span className="whitespace-nowrap font-medium text-black">
                                            {ticket.created_at ? formatDate(ticket.created_at) : "-"}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan="5" className="px-6 py-16 text-center">
                                <p className="font-medium text-black">No tickets found</p>
                                <p className="mt-1 text-sm text-gray-500">There are currently no tickets to display.</p>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}