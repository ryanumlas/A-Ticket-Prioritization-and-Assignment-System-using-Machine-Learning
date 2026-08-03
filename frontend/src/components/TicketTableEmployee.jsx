import api from "../api";
import { useEffect, useState } from "react";
import { formatDate } from "../utils/formatDate";
import { useNavigate } from "react-router-dom";

export default function TicketTableEmployee({ ticketList }) {
    const navigate = useNavigate();
    const limitedTickets = ticketList.slice(0, 15);

    return(
        <div className="max-h-[637px] overflow-y-auto bg-white scrollbar border-gray-300 border">
            <table className="w-full text-sm">
                <thead className="sticky top-0 z-20 bg-white">
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
                            onClick={() => navigate(`/ticket/${ticket.id}`)}
                            className="border-t border-gray-300 hover:bg-gray-100 transition ease-in-out cursor-pointer"
                        >
                            <td className="py-4 pl-10 font-semibold">{ticket.ticket_code || "-"}</td>
                            <td className="px-4 pl-10 ">{ticket.subject || "-"}</td>
                            <td className="px-4 pl-10 ">{ticket.assigned_to || "-"}</td>
                            <td className="px-4 pl-30 ">{ticket.priority || "-"}</td>
                            <td className="px-4 pl-10 ">{ticket.status || "-"}</td>
                            <td className="px-4 pl-30 font-semibold">{formatDate(ticket.created_at)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}