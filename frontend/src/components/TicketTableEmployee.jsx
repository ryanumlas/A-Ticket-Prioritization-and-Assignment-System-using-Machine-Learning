import api from "../api";
import { useEffect, useState } from "react";
import { formatDate } from "../utils/formatDate";
import { useNavigate } from "react-router-dom";

export default function TicketTableEmployee({ loading = false, ticketList = [], maxRows = 15, dashboard = false, }) {
    const navigate = useNavigate();
    const limitedTickets = ticketList.slice(0, maxRows);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12 text-sm text-gray-500">
                Loading tickets...
            </div>
        );
    }

    return(
        <div
            className={`bg-white ${
                dashboard
                    ? "h-[380px] overflow-y-auto"
                    : "h-[637px] overflow-y-auto border border-gray-300"
            }`}
        >
            <table className="w-full text-sm">
                <thead className="sticky top-0 z-20 bg-white">
                    <tr className="text-left ">
                        <th className="px-6 py-4 font-semibold">Ticket ID</th>
                        <th className="px-4 font-semibold">Subject</th>
                        {/* <th className="px-4 font-semibold">Assignee</th> */}
                        <th className="px-4 font-semibold">Priority</th>
                        <th className="px-4 font-semibold">Status</th>
                        <th className="px-4 font-semibold">Created</th>
                    </tr>
                </thead>

                <tbody>
                    {limitedTickets.length > 0 ? (
                        limitedTickets.map((ticket) => (
                            <tr
                                key={ticket.id}
                                onClick={() => navigate(`/ticket/${ticket.id}`)}
                                className="border-t border-gray-300 hover:bg-gray-100 transition ease-in-out cursor-pointer"
                        >
                            <td className="py-4 pl-6 font-semibold whitespace-nowrap">{ticket.ticket_code || "-"}</td>
                            <td className="px-4 pl-6 whitespace-nowrap">{ticket.subject || "-"}</td>
                            {/* <td className="px-4 ">{ticket.assigned_to || "-"}</td> */}
                            <td className="px-4 ">{ticket.priority || "-"}</td>
                            <td className="px-4 whitespace-nowrap">{ticket.status || "-"}</td>
                            <td className="px-4 font-semibold whitespace-nowrap">{formatDate(ticket.created_at)}</td>
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
                    )
                }
                </tbody>
            </table>
        </div>
    );
}