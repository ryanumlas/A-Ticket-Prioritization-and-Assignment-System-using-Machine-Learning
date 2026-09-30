import { statusColor } from "../utils/statusColor";
import { priorityColor, priorityLabel } from "../utils/priority";
import {
    affectedScopeLabel,
    affectedScopeColor,
} from "../utils/affectedScopeColor";
import { useNavigate } from "react-router-dom";

export default function TicketQueueSupportTable({
    ticketList = [],
    loading = false,
}) {
    const navigate = useNavigate();

    const getDisplayValue = (value, fallback = "-") => {
        if (value === null || value === undefined || value === "") {
            return fallback;
        }

        if (typeof value === "object") {
            if (Array.isArray(value)) {
                return value.length
                    ? value
                          .map((item) => getDisplayValue(item, ""))
                          .filter(Boolean)
                          .join(", ")
                    : fallback;
            }

            if (value.name) return String(value.name);
            if (value.username) return String(value.username);
            if (value.label) return String(value.label);
            if (value.title) return String(value.title);
            if (value.code) return String(value.code);

            if (value.id !== undefined && value.id !== null) {
                return String(value.id);
            }

            return fallback;
        }

        return String(value);
    };

    const handleTicketClick = (ticket) => {
        navigate(`/ticket/${ticket.id}`, {
            state: {
                fromAssistedTickets: true,
            },
        });
    };

    if (loading) {
        return (
            <div className="flex h-[637px] items-center justify-center overflow-hidden bg-white">
                <p className="text-sm text-gray-500">
                    Loading tickets...
                </p>
            </div>
        );
    }

    return (
        <div
            className="
                h-[637px]
                overflow-y-auto
                overflow-x-hidden
                bg-white

                min-[1280px]:max-[1365px]:h-[450px]
                min-[1366px]:max-[1537px]:h-[500px]
                min-[1538px]:max-[1919px]:h-[580px]

                [&::-webkit-scrollbar]:w-px
                [&::-webkit-scrollbar-track]:bg-transparent
                [&::-webkit-scrollbar-thumb]:bg-transparent
                hover:[&::-webkit-scrollbar-thumb]:bg-gray-300
                [&::-webkit-scrollbar-thumb]:rounded-full
            "
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
                <thead className="sticky top-0 z-10 bg-gray-50">
                    <tr className="border-b border-gray-300 text-left">
                        <th
                            className="
                                w-[9%]
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
                            Ticket ID
                        </th>

                        <th
                            className="
                                w-[21%]
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
                            Subject
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
                            Submitted By
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
                            Symptom Code
                        </th>

                        <th
                            className="
                                w-[10%]
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
                            Affected Scope
                        </th>

                        <th
                            className="
                                w-[9%]
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
                                w-[10%]
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
                                w-[10%]
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
                            Assigned To
                        </th>

                        <th
                            className="
                                w-[10%]
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
                            SLA Remaining
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {ticketList.length > 0 ? (
                        ticketList.map((ticket) => (
                            <tr
                                key={ticket.id}
                                onClick={() => handleTicketClick(ticket)}
                                className="
                                    cursor-pointer
                                    border-b
                                    border-gray-200
                                    transition-colors
                                    hover:bg-gray-50
                                    last:border-b-0
                                "
                            >
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
                                    <span className="font-semibold text-black">
                                        {getDisplayValue(
                                            ticket.ticket_code
                                        )}
                                    </span>
                                </td>

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
                                    <p
                                        className="truncate font-medium text-black"
                                        title={getDisplayValue(
                                            ticket.subject,
                                            ""
                                        )}
                                    >
                                        {getDisplayValue(
                                            ticket.subject
                                        )}
                                    </p>
                                </td>

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
                                    <div className="min-w-0">
                                        <p
                                            className="truncate font-medium text-black"
                                            title={getDisplayValue(
                                                ticket.submitted_by_name,
                                                ""
                                            )}
                                        >
                                            {getDisplayValue(
                                                ticket.submitted_by_name
                                            )}
                                        </p>

                                        <p
                                            className="
                                                mt-0.5
                                                truncate
                                                text-xs
                                                text-gray-500
                                                min-[1280px]:max-[1365px]:text-[10px]
                                                min-[1366px]:max-[1537px]:text-[11px]
                                            "
                                            title={getDisplayValue(
                                                ticket.submitted_by_department,
                                                ""
                                            )}
                                        >
                                            {getDisplayValue(
                                                ticket.submitted_by_department
                                            )}
                                        </p>
                                    </div>
                                </td>

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
                                        className="block truncate font-medium text-black"
                                        title={getDisplayValue(
                                            ticket.symptom_code ||
                                                ticket.symptom_code_name,
                                            ""
                                        )}
                                    >
                                        {getDisplayValue(
                                            ticket.symptom_code ||
                                                ticket.symptom_code_name
                                        )}
                                    </span>
                                </td>

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
                                    {ticket.affected_scope ? (
                                        <span
                                            className={`
                                                inline-flex
                                                max-w-full
                                                items-center
                                                justify-center
                                                whitespace-nowrap
                                                rounded-md
                                                border
                                                px-2
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
                                                    affectedScopeColor[
                                                        typeof ticket.affected_scope ===
                                                        "object"
                                                            ? ticket.affected_scope?.id
                                                            : ticket.affected_scope
                                                    ] ||
                                                    "border-gray-300 bg-gray-100 text-gray-600"
                                                }
                                            `}
                                            title={getDisplayValue(
                                                affectedScopeLabel[
                                                    typeof ticket.affected_scope ===
                                                    "object"
                                                        ? ticket.affected_scope?.id
                                                        : ticket.affected_scope
                                                ] ||
                                                    ticket.affected_scope
                                            )}
                                        >
                                            {getDisplayValue(
                                                affectedScopeLabel[
                                                    typeof ticket.affected_scope ===
                                                    "object"
                                                        ? ticket.affected_scope?.id
                                                        : ticket.affected_scope
                                                ] ||
                                                    ticket.affected_scope
                                            )}
                                        </span>
                                    ) : (
                                        "-"
                                    )}
                                </td>

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
                                            min-w-[38px]
                                            items-center
                                            justify-center
                                            whitespace-nowrap
                                            rounded-md
                                            border
                                            px-2
                                            py-1
                                            text-xs
                                            font-semibold

                                            min-[1280px]:max-[1365px]:min-w-[32px]
                                            min-[1280px]:max-[1365px]:px-1.5
                                            min-[1280px]:max-[1365px]:py-0.5
                                            min-[1280px]:max-[1365px]:text-[10px]

                                            min-[1366px]:max-[1537px]:min-w-[34px]
                                            min-[1366px]:max-[1537px]:px-1.5
                                            min-[1366px]:max-[1537px]:py-0.5
                                            min-[1366px]:max-[1537px]:text-[11px]

                                            ${
                                                priorityColor[
                                                    typeof ticket.priority ===
                                                    "object"
                                                        ? ticket.priority?.id
                                                        : ticket.priority
                                                ] ||
                                                "border-gray-300 bg-gray-100 text-gray-600"
                                            }
                                        `}
                                    >
                                        {getDisplayValue(
                                            priorityLabel[
                                                typeof ticket.priority ===
                                                "object"
                                                    ? ticket.priority?.id
                                                    : ticket.priority
                                            ] ||
                                                ticket.priority
                                        )}
                                    </span>
                                </td>

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
                                            px-2
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
                                                    typeof ticket.status ===
                                                    "object"
                                                        ? ticket.status?.id
                                                        : ticket.status
                                                ] ||
                                                "border border-gray-300 bg-gray-100 text-gray-700"
                                            }
                                        `}
                                    >
                                        {getDisplayValue(
                                            ticket.status
                                        )}
                                    </span>
                                </td>

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
                                    <div className="min-w-0">
                                        <p
                                            className="truncate font-medium text-black"
                                            title={getDisplayValue(
                                                ticket.assigned_to,
                                                ""
                                            )}
                                        >
                                            {getDisplayValue(
                                                ticket.assigned_to,
                                                "Unassigned"
                                            )}
                                        </p>
                                    </div>
                                </td>

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
                                    <span className="whitespace-nowrap font-medium text-black">
                                        {getDisplayValue(
                                            ticket.resolution_time_remaining
                                        )}
                                    </span>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td
                                colSpan="9"
                                className="px-6 py-16 text-center"
                            >
                                <p className="font-medium text-black">
                                    No tickets found
                                </p>

                                <p className="mt-1 text-sm text-gray-500">
                                    There are currently no tickets to
                                    display.
                                </p>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}