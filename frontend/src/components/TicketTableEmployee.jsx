import api from "../api";
import { useEffect, useState } from "react";

export default function TicketTableEmployee({ ticketList }) {
    const limitedTickets = ticketList.slice(0, 15);

    return(
        <table className="w-full text-sm">
                <thead className="border-b border-t bg-gray-200 border-gray-300">
                    <tr className="text-left text-sm font-semibold text-gray-500">
                        <th className="py-4 pl-10">Ticket ID</th>
                        <th className="px-4 pl-10">Subject</th>
                        <th className="px-4 pl-10">Assignee</th>
                        <th className="px-4 pl-30">Priority</th>
                        <th className="px-4 pl-10">Status</th>
                        <th className="px-4 pl-30">Created</th>
                    </tr>
                </thead>
                <tbody className="border-b border-gray-300">
                    {limitedTickets.map(ticket => (
                        <tr key={ticket.id} className="border-b border-gray-300 hover:bg-gray-300 hover:text-white transition ease-in-out cursor-pointer">
                            <td className="py-4 pl-10">{ticket.ticket_code || "-"}</td>
                            <td className="px-4 pl-10">{ticket.subject ||"-"}</td>
                            <td className="px-4 pl-10">{ticket.assigned_to || "-"}</td>
                            <td className="px-4 pl-30">{ticket.priority || "-"}</td>
                            <td className="px-4 pl-10">{ticket.status || "-"}</td>
                            <td className="px-4 pl-30">{ticket.created_at || "-"}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
    );
}