import { MessageCircle } from "lucide-react";
import { formatDate } from "../utils/formatDate";
import { useNavigate } from "react-router-dom";
import { statusColor } from "../utils/statusColor";
import { priorityColor, priorityLabel } from "../utils/priority";

export default function TicketTableEmployee({
    loading = false,
    ticketList = [],
    maxRows = 15,
    dashboard = false,
}) {
    const navigate = useNavigate();

    const displayedTickets = dashboard
        ? ticketList.slice(0, maxRows)
        : ticketList;

    const getAssignedTo = (ticket) => {
        const assignedTo = ticket.assigned_to;

        if (!assignedTo) {
            return {
                name: "-",
                role: "",
            };
        }

        if (typeof assignedTo === "string") {
            return {
                name: assignedTo,
                role: "",
            };
        }

        const name =
            assignedTo.name ||
            `${assignedTo.first_name || ""} ${assignedTo.last_name || ""}`.trim() ||
            assignedTo.username ||
            "-";

        const role =
            assignedTo.role?.name ||
            assignedTo.role?.role_name ||
            assignedTo.role_name ||
            assignedTo.role ||
            "";

        return {
            name,
            role,
        };
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
                    : "max-h-[637px] overflow-y-auto bg-white min-[1280px]:max-[1365px]:max-h-[450px] min-[1366px]:max-[1537px]:max-h-[500px] min-[1538px]:max-[1919px]:max-h-[580px] [&::-webkit-scrollbar]:w-px [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full"
            }
        >
            <table
                className="
                    w-full
                    table-fixed
                    text-sm
                    min-[1280px]:max-[1365px]:text-[11px]
                    min-[1366px]:max-[1537px]:text-xs
                "
            >
                <thead className="sticky top-0 z-20 bg-gray-50">
                    <tr className="border-b border-gray-300 text-left">
                        <th
                            className="
                                w-[14%]
                                px-6
                                py-3.5
                                font-semibold
                                text-black
                                min-[1280px]:max-[1365px]:w-[8%]
                                min-[1366px]:max-[1537px]:w-[8%]
                                min-[1280px]:max-[1365px]:px-3
                                min-[1280px]:max-[1365px]:py-2.5
                                min-[1366px]:max-[1537px]:px-4
                                min-[1366px]:max-[1537px]:py-3
                            "
                        >
                            Ticket ID
                        </th>

                        <th
                            className="
                                w-[29%]
                                px-6
                                py-3.5
                                font-semibold
                                text-black
                                min-[1280px]:max-[1365px]:w-[18%]
                                min-[1366px]:max-[1537px]:w-[18%]
                                min-[1280px]:max-[1365px]:px-3
                                min-[1280px]:max-[1365px]:py-2.5
                                min-[1366px]:max-[1537px]:px-4
                                min-[1366px]:max-[1537px]:py-3
                            "
                        >
                            Subject
                        </th>

                        <th
                            className="
                                w-[19%]
                                min-[1280px]:max-[1365px]:w-[10%]
                                min-[1366px]:max-[1537px]:w-[10%]
                                px-4 py-3.5
                                min-[1280px]:max-[1365px]:px-3
                                min-[1366px]:max-[1537px]:px-3
                                font-semibold text-black
                            "
                        >
                            Assigned To
                        </th>

                        <th
                            className="
                                w-[11%]
                                px-4
                                py-3.5
                                font-semibold
                                text-black
                                min-[1280px]:max-[1365px]:px-2.5
                                min-[1280px]:max-[1365px]:py-2.5
                                min-[1366px]:max-[1537px]:px-3
                                min-[1366px]:max-[1537px]:py-3
                            "
                        >
                            Priority
                        </th>

                        <th
                            className="
                                w-[13%]
                                px-4
                                py-3.5
                                font-semibold
                                text-black
                                min-[1280px]:max-[1365px]:px-2.5
                                min-[1280px]:max-[1365px]:py-2.5
                                min-[1366px]:max-[1537px]:px-3
                                min-[1366px]:max-[1537px]:py-3
                            "
                        >
                            Status
                        </th>

                        <th
                            className="
                                w-[14%]
                                px-6
                                py-3.5
                                font-semibold
                                text-black
                                min-[1280px]:max-[1365px]:px-3
                                min-[1280px]:max-[1365px]:py-2.5
                                min-[1366px]:max-[1537px]:px-4
                                min-[1366px]:max-[1537px]:py-3
                            "
                        >
                            Created
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {displayedTickets.length > 0 ? (
                        displayedTickets.map((ticket) => {
                            const unreadCount =
                                Number(
                                    ticket.unread_comment_count
                                ) || 0;

                            const hasUnread =
                                unreadCount > 0;

                            const assignedTo =
                                getAssignedTo(ticket);

                            return (
                                <tr
                                    key={ticket.id}
                                    onClick={() =>
                                        navigate(
                                            `/ticket/${ticket.id}`
                                        )
                                    }
                                    className={`cursor-pointer border-b border-gray-200 transition-colors last:border-b-0 ${
                                        hasUnread
                                            ? "bg-[#2563EB]/[0.035] hover:bg-[#2563EB]/[0.06]"
                                            : "hover:bg-gray-50"
                                    }`}
                                >
                                    {/* TICKET ID */}
                                    <td
                                        className="
                                            px-6
                                            py-4
                                            min-[1280px]:max-[1365px]:px-3
                                            min-[1280px]:max-[1365px]:py-2.5
                                            min-[1366px]:max-[1537px]:px-4
                                            min-[1366px]:max-[1537px]:py-3
                                        "
                                    >
                                        <span className="whitespace-nowrap font-semibold text-black">
                                            {ticket.ticket_code ||
                                                "-"}
                                        </span>
                                    </td>

                                    {/* SUBJECT */}
                                    <td
                                        className="
                                            px-6
                                            py-4
                                            min-[1280px]:max-[1365px]:px-3
                                            min-[1280px]:max-[1365px]:py-2.5
                                            min-[1366px]:max-[1537px]:px-4
                                            min-[1366px]:max-[1537px]:py-3
                                        "
                                    >
                                        <div
                                            className="
                                                flex
                                                min-w-0
                                                items-center
                                                gap-3
                                                min-[1280px]:max-[1365px]:gap-1.5
                                                min-[1366px]:max-[1537px]:gap-2
                                            "
                                        >
                                            <p
                                                className={`truncate text-black ${
                                                    hasUnread
                                                        ? "font-semibold"
                                                        : "font-medium"
                                                }`}
                                                title={
                                                    ticket.subject
                                                }
                                            >
                                                {ticket.subject ||
                                                    "-"}
                                            </p>

                                            {hasUnread && (
                                                <div className="relative shrink-0">
                                                    <MessageCircle
                                                        size={20}
                                                        className="
                                                            text-[#2563EB]
                                                            min-[1280px]:max-[1365px]:h-4
                                                            min-[1280px]:max-[1365px]:w-4
                                                            min-[1366px]:max-[1537px]:h-[18px]
                                                            min-[1366px]:max-[1537px]:w-[18px]
                                                        "
                                                    />

                                                    <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-semibold leading-none text-white">
                                                        {unreadCount >
                                                        99
                                                            ? "99+"
                                                            : unreadCount}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </td>

                                    {/* ASSIGNED TO */}
                                    <td
                                        className="
                                            px-4
                                            py-4
                                            min-[1280px]:max-[1365px]:px-2.5
                                            min-[1280px]:max-[1365px]:py-2.5
                                            min-[1366px]:max-[1537px]:px-3
                                            min-[1366px]:max-[1537px]:py-3
                                        "
                                    >
                                        <div
                                            className="min-w-0"
                                            title={
                                                assignedTo.role
                                                    ? `${assignedTo.name} — ${assignedTo.role}`
                                                    : assignedTo.name
                                            }
                                        >
                                            <p className="truncate font-medium text-gray-900">
                                                {assignedTo.name}
                                            </p>

                                            {assignedTo.role && (
                                                <p
                                                    className="
                                                        mt-0.5
                                                        truncate
                                                        text-xs
                                                        text-gray-500
                                                        min-[1280px]:max-[1365px]:text-[10px]
                                                        min-[1366px]:max-[1537px]:text-[11px]
                                                    "
                                                >
                                                    {assignedTo.role}
                                                </p>
                                            )}
                                        </div>
                                    </td>

                                    {/* PRIORITY */}
                                    <td
                                        className="
                                            px-4
                                            py-4
                                            min-[1280px]:max-[1365px]:px-2.5
                                            min-[1280px]:max-[1365px]:py-2.5
                                            min-[1366px]:max-[1537px]:px-3
                                            min-[1366px]:max-[1537px]:py-3
                                        "
                                    >
                                        <span
                                            className={`
                                                inline-flex
                                                whitespace-nowrap
                                                rounded-md
                                                border
                                                px-2.5
                                                py-1
                                                text-xs
                                                font-semibold

                                                min-[1280px]:max-[1365px]:px-1.5
                                                min-[1280px]:max-[1365px]:py-0.5
                                                min-[1280px]:max-[1365px]:text-[10px]

                                                min-[1366px]:max-[1537px]:px-1.5
                                                min-[1366px]:max-[1537px]:py-0.5
                                                min-[1366px]:max-[1537px]:text-[11px]

                                                ${
                                                    priorityColor[
                                                        ticket.priority
                                                    ] ||
                                                    "border-gray-300 bg-gray-100 text-gray-600"
                                                }
                                            `}
                                        >
                                            {priorityLabel[
                                                ticket.priority
                                            ] ||
                                                ticket.priority ||
                                                "-"}
                                        </span>
                                    </td>

                                    {/* STATUS */}
                                    <td
                                        className="
                                            px-4
                                            py-4
                                            min-[1280px]:max-[1365px]:px-2.5
                                            min-[1280px]:max-[1365px]:py-2.5
                                            min-[1366px]:max-[1537px]:px-3
                                            min-[1366px]:max-[1537px]:py-3
                                        "
                                    >
                                        <span
                                            className={`
                                                inline-flex
                                                whitespace-nowrap
                                                rounded-md
                                                px-2.5
                                                py-1
                                                text-xs
                                                font-medium

                                                min-[1280px]:max-[1365px]:px-1.5
                                                min-[1280px]:max-[1365px]:py-0.5
                                                min-[1280px]:max-[1365px]:text-[10px]

                                                min-[1366px]:max-[1537px]:px-1.5
                                                min-[1366px]:max-[1537px]:py-0.5
                                                min-[1366px]:max-[1537px]:text-[11px]

                                                ${
                                                    statusColor[
                                                        ticket.status
                                                    ] ||
                                                    "border border-gray-300 bg-gray-100 text-gray-700"
                                                }
                                            `}
                                        >
                                            {ticket.status || "-"}
                                        </span>
                                    </td>

                                    {/* CREATED */}
                                    <td
                                        className="
                                            px-6
                                            py-4
                                            min-[1280px]:max-[1365px]:px-3
                                            min-[1280px]:max-[1365px]:py-2.5
                                            min-[1366px]:max-[1537px]:px-4
                                            min-[1366px]:max-[1537px]:py-3
                                        "
                                    >
                                        <span className="whitespace-nowrap font-medium text-black">
                                            {ticket.created_at
                                                ? formatDate(
                                                      ticket.created_at
                                                  )
                                                : "-"}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })
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
                                    There are currently no
                                    tickets to display.
                                </p>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}