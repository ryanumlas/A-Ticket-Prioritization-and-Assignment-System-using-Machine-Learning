import { formatDate } from "../utils/formatDate";
import { useNavigate } from "react-router-dom";
import { statusColor } from "../utils/statusColor";

export default function TicketTableEmployee({
    loading = false,
    ticketList = [],
    maxRows = 15,
    dashboard = false,
}) {
    const navigate = useNavigate();

    // Only limit tickets when used on the dashboard.
    // Full ticket page already handles pagination.
    const displayedTickets = dashboard
        ? ticketList.slice(0, maxRows)
        : ticketList;

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

    if (loading) {
        return (
            <div className="flex min-h-[240px] items-center justify-center bg-white">
                <p className="text-sm text-gray-500">
                    Loading tickets...
                </p>
            </div>
        );
    }

    return (
        <div
            className={
                dashboard
                    ? "h-[380px] overflow-y-auto bg-white"
                    : "max-h-[637px] overflow-y-auto bg-white"
            }
        >
            <table className="w-full table-fixed text-sm">

                {/* HEADER */}
                <thead className="sticky top-0 z-20 bg-gray-50">
                    <tr className="border-b border-gray-300 text-left">

                        <th className="w-[16%] px-6 py-3.5 font-semibold text-black">
                            Ticket ID
                        </th>

                        <th className="w-[38%] px-6 py-3.5 font-semibold text-black">
                            Subject
                        </th>

                        <th className="w-[12%] px-6 py-3.5 font-semibold text-black">
                            Priority
                        </th>

                        <th className="w-[16%] px-4 py-3.5 font-semibold text-black">
                            Status
                        </th>

                        <th className="w-[18%] px-6 py-3.5 font-semibold text-black">
                            Created
                        </th>

                    </tr>
                </thead>

                {/* BODY */}
                <tbody>
                    {displayedTickets.length > 0 ? (
                        displayedTickets.map((ticket) => (
                            <tr
                                key={ticket.id}
                                onClick={() =>
                                    navigate(`/ticket/${ticket.id}`)
                                }
                                className="cursor-pointer border-b border-gray-200 transition-colors hover:bg-gray-50 last:border-b-0"
                            >

                                {/* TICKET ID */}
                                <td className="px-6 py-4">
                                    <span className="whitespace-nowrap font-semibold text-black">
                                        {ticket.ticket_code || "-"}
                                    </span>
                                </td>

                                {/* SUBJECT */}
                                <td className="px-6 py-4">
                                    <p
                                        className="truncate font-medium text-black"
                                        title={ticket.subject}
                                    >
                                        {ticket.subject || "-"}
                                    </p>
                                </td>

                                {/* PRIORITY */}
                                <td className="px-6 py-4">
                                    <span
                                        className={`inline-flex min-w-[38px] items-center justify-center rounded-md border px-2.5 py-1 text-xs font-semibold ${
                                            priorityStyle(
                                                ticket.priority
                                            )
                                        }`}
                                    >
                                        {ticket.priority || "-"}
                                    </span>
                                </td>

                                {/* STATUS */}
                                <td className="px-4 py-4">
                                    <span
                                        className={`inline-flex whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium ${
                                            statusColor[
                                                ticket.status
                                            ] ||
                                            "border border-gray-300 bg-gray-100 text-gray-700"
                                        }`}
                                    >
                                        {ticket.status || "-"}
                                    </span>
                                </td>

                                {/* CREATED */}
                                <td className="px-6 py-4">
                                    <span className="whitespace-nowrap font-medium text-black">
                                        {ticket.created_at
                                            ? formatDate(
                                                  ticket.created_at
                                              )
                                            : "-"}
                                    </span>
                                </td>

                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td
                                colSpan="5"
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