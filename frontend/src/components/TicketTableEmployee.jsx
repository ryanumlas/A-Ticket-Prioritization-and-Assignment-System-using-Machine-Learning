import api from "../api";
import { useEffect, useState } from "react";

export default function TicketTableEmployee({ ticketList }) {
    const limitedTickets = ticketList.slice(0, 15);

    return(
        <div className="max-h-[740px] overflow-y-auto bg-white no-scrollbar border-gray-300 border rounded-xl">
            <table className="w-full text-sm">
                <thead className="sticky top-0 z-20 bg-gray-200 shadow-sm">
                    <tr className="text-left text-gray-500">
                        <th className="py-4 pl-10 font-semibold">Ticket ID</th>
                        <th className="px-4 pl-10 font-semibold">Subject</th>
                        <th className="px-4 pl-10 font-semibold">Assignee</th>
                        <th className="px-4 pl-30 font-semibold">Priority</th>
                        <th className="px-4 pl-10 font-semibold">Status</th>
                        <th className="px-4 pl-30 font-semibold">Created</th>
                    </tr>
                </thead>

                <tbody>
                    {limitedTickets.map(ticket => (
                        <tr
                            key={ticket.id}
                            className="border-b border-gray-300 hover:bg-gray-300 hover:text-white transition ease-in-out cursor-pointer text-gray-800"
                        >
                            <td className="py-4 pl-10 font-medium">{ticket.ticket_code || "-"}</td>
                            <td className="px-4 pl-10 font-medium">{ticket.subject || "-"}</td>
                            <td className="px-4 pl-10 font-medium">{ticket.assigned_to || "-"}</td>
                            <td className="px-4 pl-30 font-medium">{ticket.priority || "-"}</td>
                            <td className="px-4 pl-10 font-medium">{ticket.status || "-"}</td>
                            <td className="px-4 pl-30 font-medium">{new Date(ticket.created_at).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}