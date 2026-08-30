import { statusColor } from "../utils/statusColor";

export default function TicketQueueSupportTable({
    ticketList = [],
    loading = false,
}) {
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
        <div className="max-h-[637px] overflow-y-auto bg-white">

            <table className="w-full table-fixed text-sm">

                {/* HEADER */}
                <thead className="sticky top-0 z-10 bg-gray-50">
                    <tr className="border-b border-gray-300 text-left">

                        <th className="w-[14%] px-6 py-3.5 font-semibold text-black">
                            Ticket ID
                        </th>

                        <th className="w-[31%] px-6 py-3.5 font-semibold text-black">
                            Subject
                        </th>

                        <th className="w-[12%] px-6 py-3.5 font-semibold text-black">
                            Symptom
                        </th>

                        <th className="w-[11%] px-6 py-3.5 font-semibold text-black">
                            Priority
                        </th>

                        <th className="w-[14%] px-4 py-3.5 font-semibold text-black">
                            Status
                        </th>

                        <th className="w-[18%] px-6 py-3.5 font-semibold text-black">
                            SLA Remaining
                        </th>

                    </tr>
                </thead>

                {/* BODY */}
                <tbody>
                    {ticketList.length > 0 ? (
                        ticketList.map((ticket) => (
                            <tr
                                key={ticket.id}
                                className="cursor-pointer border-b border-gray-200 transition-colors hover:bg-gray-50 last:border-b-0"
                            >

                                {/* TICKET ID */}
                                <td className="px-6 py-4">
                                    <span className="font-semibold text-black">
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

                                {/* SYMPTOM */}
                                <td className="px-6 py-4 text-black">
                                    {ticket.symptom_code || "-"}
                                </td>

                                {/* PRIORITY */}
                                <td className="px-6 py-4">
                                    <span
                                        className={`inline-flex min-w-[38px] items-center justify-center rounded-md border px-2.5 py-1 text-xs font-semibold ${
                                            priorityStyle(ticket.priority)
                                        }`}
                                    >
                                        {ticket.priority || "-"}
                                    </span>
                                </td>

                                {/* STATUS */}
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

                                {/* SLA */}
                                <td className="px-6 py-4">
                                    <span className="font-medium text-black">
                                        {ticket.resolution_time_remaining || "-"}
                                    </span>
                                </td>

                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td
                                colSpan="6"
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