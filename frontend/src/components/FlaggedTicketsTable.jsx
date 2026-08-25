import { formatDate } from "../utils/formatDate";
import { useNavigate } from "react-router-dom";

export default function FlaggedTicketsTable({ flaggedTickets, loading = false, maxRows = 15 }) {
    const limitedTickets = flaggedTickets.slice(0, maxRows);
    const navigate = useNavigate();

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12 text-sm text-gray-500">
                Loading tickets...
            </div>
        );
    }

    return (
        <div className="overflow-hidden border border-gray-300 bg-white">
            <table className="w-full table-fixed text-sm text-left">
                <thead className="bg-gray-50">
                    <tr className="border-b border-gray-300">
                        <th className="w-[10%] px-6 py-4 font-semibold">
                            Ticket ID
                        </th>

                        <th className="w-[20%] px-6 py-4 font-semibold">
                            Subject
                        </th>

                        <th className="w-[10%] px-6 py-4 font-semibold">
                            Flag Reason
                        </th>

                        <th className="w-[8%] px-6 py-4 font-semibold">
                            Status
                        </th>

                        <th className="w-[12%] px-6 py-4 font-semibold">
                            Flagged At
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {limitedTickets.map((ticket) => (
                        <tr
                            key={ticket.id}
                            onClick={() => navigate(`/flagged-ticket/${ticket.id}`)}
                            className="border-b border-gray-200 transition last:border-b-0 hover:bg-gray-50 cursor-pointer"
                        >
                            <td className="px-6 py-5">
                                <span className="font-semibold">
                                    {ticket.ticket_code}
                                </span>
                            </td>

                            <td className="px-6 py-5">
                                <p
                                    className="truncate font-medium"
                                    title={ticket.subject}
                                >
                                    {ticket.subject}
                                </p>
                            </td>

                            <td className="px-6 py-5">
                                <span className="inline-flex rounded-md border border-gray-300 px-2.5 py-1 text-xs font-medium">
                                    {ticket.reason}
                                </span>
                            </td>

                            <td className="px-6 py-5">
                                <span className="inline-flex rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium">
                                    {ticket.status}
                                </span>
                            </td>

                            <td className="px-6 py-5 text-gray-600">
                                {formatDate(ticket.created_at)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}