import api from "../api";
import { useEffect, useState } from "react";

export default function TicketTableEmployee({ ticketList }) {
    const limitedTickets = ticketList.slice(0, 15);

    return(
        <div className="max-h-[550px] overflow-y-auto bg-white scrollbar border-gray-300 border rounded-lg">
            <table className="w-full text-sm">
                <thead className="sticky top-0 z-20 shadow-sm bg-white">
                    <tr className="text-left ">
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
                            className="border-b border-gray-300 hover:bg-gray-100 transition ease-in-out cursor-pointer"
                        >
                            <td className="py-4 pl-10 font-semibold">{ticket.ticket_code || "-"}</td>
                            <td className="px-4 pl-10 ">{ticket.subject || "-"}</td>
                            <td className="px-4 pl-10 ">{ticket.assigned_to || "-"}</td>
                            <td className="px-4 pl-30 ">{ticket.priority || "-"}</td>
                            <td className="px-4 pl-10 ">{ticket.status || "-"}</td>
                            <td className="px-4 pl-30 font-semibold">{new Date(ticket.created_at).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}