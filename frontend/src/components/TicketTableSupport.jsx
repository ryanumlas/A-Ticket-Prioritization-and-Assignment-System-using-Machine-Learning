export default function TicketTableSupport({
    loading = false,
    maxRows = 15,
    dashboard = false,
}) {
    const ticketList = [
        {
            id: 1,
            ticket_code: "TKT-000031",
            subject: "Unable to connect to company network",
            priority: "P1",
            status: "In Progress",
            resolution_time_remaining: "18m",
        },
        {
            id: 2,
            ticket_code: "TKT-000029",
            subject: "Application keeps crashing during work",
            priority: "P2",
            status: "Open",
            resolution_time_remaining: "1h 24m",
        },
        {
            id: 3,
            ticket_code: "TKT-000025",
            subject: "Printer is not responding",
            priority: "P3",
            status: "In Progress",
            resolution_time_remaining: "5h 10m",
        },
        {
            id: 4,
            ticket_code: "TKT-000021",
            subject: "Laptop performance is very slow",
            priority: "P3",
            status: "Open",
            resolution_time_remaining: "8h 32m",
        },
    ];

    const limitedTickets = ticketList.slice(0, maxRows);

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
                return "bg-gray-100 text-gray-600 border-gray-200";

            default:
                return "bg-gray-100 text-black border-gray-200";
        }
    };

    const statusStyle = (status) => {
        switch (status) {
            case "In Progress":
                return "bg-blue-50 text-blue-600";

            case "Open":
                return "bg-gray-100 text-black";

            case "Resolved":
                return "bg-green-50 text-green-600";

            default:
                return "bg-gray-100 text-black";
        }
    };

    return (
        <div
            className={`bg-white ${
                dashboard
                    ? ""
                    : "max-h-[637px] overflow-y-auto border border-gray-300"
            }`}
        >
            <table className="w-full table-fixed text-sm">

                {/* HEADER */}
                <thead className="sticky top-0 z-10 bg-gray-50">
                    <tr className="text-left">

                        <th className="w-[15%] px-6 py-3 font-semibold text-black">
                            Ticket ID
                        </th>

                        <th className="w-[40%] px-6 py-3 font-semibold text-black">
                            Subject
                        </th>

                        <th className="w-[12%] px-6 py-3 font-semibold text-black">
                            Priority
                        </th>

                        <th className="w-[13%] px-4 py-3 font-semibold text-black">
                            Status
                        </th>

                        <th className="w-[20%] px-6 py-3 font-semibold text-black">
                            SLA Remaining
                        </th>

                    </tr>
                </thead>

                {/* BODY */}
                <tbody>
                    {limitedTickets.length > 0 ? (
                        limitedTickets.map((ticket) => (
                            <tr
                                key={ticket.id}
                                className="cursor-pointer border-t border-gray-300 transition hover:bg-gray-50"
                            >

                                {/* TICKET CODE */}
                                <td className="px-6 py-4 font-semibold text-black">
                                    {ticket.ticket_code || "-"}
                                </td>

                                {/* SUBJECT */}
                                <td className="truncate px-6 py-4 text-black">
                                    {ticket.subject || "-"}
                                </td>

                                {/* PRIORITY */}
                                <td className="px-6 py-4">
                                    <span
                                        className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-semibold ${priorityStyle(
                                            ticket.priority
                                        )}`}
                                    >
                                        {ticket.priority || "-"}
                                    </span>
                                </td>

                                {/* STATUS */}
                                <td className="px-4 py-4">
                                    <span
                                        className={`inline-flex rounded-md px-2.5 py-1 text-xs font-medium ${statusStyle(
                                            ticket.status
                                        )}`}
                                    >
                                        {ticket.status || "-"}
                                    </span>
                                </td>

                                {/* SLA */}
                                <td className="px-6 py-4">
                                    <span className="font-semibold text-black">
                                        {ticket.resolution_time_remaining || "-"}
                                    </span>
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