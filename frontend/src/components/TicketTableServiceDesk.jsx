import api from "../api";
import { formatDate } from "../utils/formatDate";
import { getCurrentUser } from "../utils/auth";

export default function TicketTableServiceDesk({ maxRows = 15, dashboard = false,}) {
    const ticketList = [
    {
        id: 1,
        ticket_code: "TKT-0001",
        subject: "My computer wont turn on",
        priority: "P2",
        status: "Open",
        resolution_remaining: "3h 25m"
    },
    {
        id: 2,
        ticket_code: "TKT-0001",
        subject: "My computer wont turn on",
        priority: "P2",
        status: "Open",
        resolution_remaining: "3h 25m"
    },
    {
        id: 3,
        ticket_code: "TKT-0001",
        subject: "My computer wont turn on",
        priority: "P2",
        status: "Open",
        resolution_remaining: "3h 25m"
    },
        {
        id: 4,
        ticket_code: "TKT-0001",
        subject: "My computer wont turn on",
        priority: "P2",
        status: "Open",
        resolution_remaining: "3h 25m"
    },
        {
        id: 5,
        ticket_code: "TKT-0001",
        subject: "My computer wont turn on",
        priority: "P2",
        status: "Open",
        resolution_remaining: "3h 25m"
    },
        {
        id: 6,
        ticket_code: "TKT-0001",
        subject: "My computer wont turn on",
        priority: "P2",
        status: "Open",
        resolution_remaining: "3h 25m"
    },
        {
        id: 7,
        ticket_code: "TKT-0001",
        subject: "My computer wont turn on",
        priority: "P2",
        status: "Open", 
        resolution_remaining: "3h 25m"
    },

];
    const limitedTickets = ticketList.slice(0, maxRows);

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
                        <th className="w-[13%] px-6 font-semibold">Status</th>
                        <th className="w-[20%] px-6 font-semibold">SLA Remaining</th>
                    </tr>
                </thead>

                <tbody>
                    {limitedTickets.map(ticket => (
                        <tr key={ticket.id} className="border-t border-gray-300 hover:bg-gray-100">
                            <td className="px-6 py-4 font-semibold">{ticket.ticket_code}</td>
                            <td className="px-6">{ticket.subject}</td>
                            <td className="px-6">{ticket.priority}</td>
                            <td className="px-6">{ticket.status}</td>
                            <td className="px-6 font-semibold">{ticket.resolution_remaining}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}