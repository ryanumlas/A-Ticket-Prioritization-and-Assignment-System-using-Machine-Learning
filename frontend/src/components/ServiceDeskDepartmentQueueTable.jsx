import { statusColor } from "../utils/statusColor";
import {
    priorityColor,
    priorityLabel,
} from "../utils/priority";
import { affectedScopeColor } from "../utils/affectedScopeColor";
import { useNavigate } from "react-router-dom";

export default function ServiceDeskDepartmentQueueTable({
    ticketList = [],
    loading = false,
}) {
    const navigate = useNavigate();

    if (loading) {
        return (
            <div
                className="
                    flex h-[637px] items-center justify-center overflow-hidden bg-white
                    min-[1280px]:max-[1365px]:h-[450px]
                    min-[1366px]:max-[1537px]:h-[500px]
                    min-[1538px]:max-[1919px]:h-[580px]
                "
            >
                <p
                    className="
                        text-sm text-gray-500
                        min-[1280px]:max-[1365px]:text-[11px]
                        min-[1366px]:max-[1537px]:text-xs
                    "
                >
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
                    w-full table-fixed text-sm
                    min-[1280px]:max-[1365px]:text-[11px]
                    min-[1366px]:max-[1537px]:text-xs
                "
            >
                <thead className="sticky top-0 z-10 bg-gray-50">
                    <tr className="border-b border-gray-300 text-left">
                        <th
                            className="
                                w-[9%] px-6 py-3.5 font-semibold text-black
                                min-[1280px]:max-[1365px]:px-3
                                min-[1280px]:max-[1365px]:py-2.5
                                min-[1366px]:max-[1537px]:px-3
                                min-[1366px]:max-[1537px]:py-3
                            "
                        >
                            Ticket ID
                        </th>

                        <th
                            className="
                                w-[18%] px-6 py-3.5 font-semibold text-black
                                min-[1280px]:max-[1365px]:px-3
                                min-[1280px]:max-[1365px]:py-2.5
                                min-[1366px]:max-[1537px]:px-3
                                min-[1366px]:max-[1537px]:py-3
                            "
                        >
                            Subject
                        </th>

                        <th
                            className="
                                w-[11%] px-4 py-3.5 font-semibold text-black
                                min-[1280px]:max-[1365px]:px-3
                                min-[1280px]:max-[1365px]:py-2.5
                                min-[1366px]:max-[1537px]:px-3
                                min-[1366px]:max-[1537px]:py-3
                            "
                        >
                            Symptom Code
                        </th>

                        <th
                            className="
                                w-[14%] px-4 py-3.5 font-semibold text-black
                                min-[1280px]:max-[1365px]:px-3
                                min-[1280px]:max-[1365px]:py-2.5
                                min-[1366px]:max-[1537px]:px-3
                                min-[1366px]:max-[1537px]:py-3
                            "
                        >
                            Submitted By
                        </th>

                        <th
                            className="
                                w-[13%] px-4 py-3.5 font-semibold text-black
                                min-[1280px]:max-[1365px]:px-3
                                min-[1280px]:max-[1365px]:py-2.5
                                min-[1366px]:max-[1537px]:px-3
                                min-[1366px]:max-[1537px]:py-3
                            "
                        >
                            Affected Scope
                        </th>

                        <th
                            className="
                                w-[10%] px-4 py-3.5 font-semibold text-black
                                min-[1280px]:max-[1365px]:px-3
                                min-[1280px]:max-[1365px]:py-2.5
                                min-[1366px]:max-[1537px]:px-3
                                min-[1366px]:max-[1537px]:py-3
                            "
                        >
                            Priority
                        </th>

                        <th
                            className="
                                w-[8%] px-4 py-3.5 font-semibold text-black
                                min-[1280px]:max-[1365px]:px-3
                                min-[1280px]:max-[1365px]:py-2.5
                                min-[1366px]:max-[1537px]:px-3
                                min-[1366px]:max-[1537px]:py-3
                            "
                        >
                            Status
                        </th>

                        <th
                            className="
                                w-[9%] px-4 py-3.5 font-semibold text-black
                                min-[1280px]:max-[1365px]:px-3
                                min-[1280px]:max-[1365px]:py-2.5
                                min-[1366px]:max-[1537px]:px-3
                                min-[1366px]:max-[1537px]:py-3
                            "
                        >
                            Assigned To
                        </th>

                        <th
                            className="
                                w-[8%] px-4 py-3.5 font-semibold text-black
                                min-[1280px]:max-[1365px]:px-3
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
                                onClick={() =>
                                    navigate(
                                        `/ticket/${ticket.id}`
                                    )
                                }
                                className="cursor-pointer border-b border-gray-200 transition-colors hover:bg-gray-50 last:border-b-0"
                            >
                                <td
                                    className="
                                        px-6 py-4
                                        min-[1280px]:max-[1365px]:px-3
                                        min-[1280px]:max-[1365px]:py-2.5
                                        min-[1366px]:max-[1537px]:px-3
                                        min-[1366px]:max-[1537px]:py-3
                                    "
                                >
                                    <span className="font-semibold text-black">
                                        {ticket.ticket_code || "-"}
                                    </span>
                                </td>

                                <td
                                    className="
                                        px-6 py-4
                                        min-[1280px]:max-[1365px]:px-3
                                        min-[1280px]:max-[1365px]:py-2.5
                                        min-[1366px]:max-[1537px]:px-3
                                        min-[1366px]:max-[1537px]:py-3
                                    "
                                >
                                    <p
                                        className="truncate font-medium text-black"
                                        title={ticket.subject}
                                    >
                                        {ticket.subject || "-"}
                                    </p>
                                </td>

                                <td
                                    className="
                                        px-4 py-4
                                        min-[1280px]:max-[1365px]:px-3
                                        min-[1280px]:max-[1365px]:py-2.5
                                        min-[1366px]:max-[1537px]:px-3
                                        min-[1366px]:max-[1537px]:py-3
                                    "
                                >
                                    <span
                                        className="
                                            inline-flex max-w-full truncate rounded-md
                                            bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700
                                            min-[1280px]:max-[1365px]:px-1.5
                                            min-[1280px]:max-[1365px]:py-0.5
                                            min-[1280px]:max-[1365px]:text-[10px]
                                            min-[1366px]:max-[1537px]:px-2
                                            min-[1366px]:max-[1537px]:py-0.5
                                            min-[1366px]:max-[1537px]:text-[11px]
                                        "
                                        title={
                                            ticket.symptom_code ||
                                            ticket.symptom_code_name
                                        }
                                    >
                                        {ticket.symptom_code ||
                                            ticket.symptom_code_name ||
                                            "-"}
                                    </span>
                                </td>

                                <td
                                    className="
                                        px-4 py-4
                                        min-[1280px]:max-[1365px]:px-3
                                        min-[1280px]:max-[1365px]:py-2.5
                                        min-[1366px]:max-[1537px]:px-3
                                        min-[1366px]:max-[1537px]:py-3
                                    "
                                >
                                    <div className="min-w-0">
                                        <p
                                            className="truncate font-medium text-black"
                                            title={
                                                ticket.submitted_by_name
                                            }
                                        >
                                            {ticket.submitted_by_name ||
                                                "-"}
                                        </p>

                                        <p
                                            className="
                                                mt-0.5 truncate text-xs text-gray-500
                                                min-[1280px]:max-[1365px]:text-[10px]
                                                min-[1366px]:max-[1537px]:text-[11px]
                                            "
                                            title={
                                                ticket.submitted_by_department
                                            }
                                        >
                                            {ticket.submitted_by_department ||
                                                "-"}
                                        </p>
                                    </div>
                                </td>

                                <td
                                    className="
                                        px-4 py-4
                                        min-[1280px]:max-[1365px]:px-3
                                        min-[1280px]:max-[1365px]:py-2.5
                                        min-[1366px]:max-[1537px]:px-3
                                        min-[1366px]:max-[1537px]:py-3
                                    "
                                >
                                    <span
                                        className={`
                                            inline-flex whitespace-nowrap rounded-md
                                            border px-2 py-1 text-xs font-semibold
                                            ${
                                                affectedScopeColor[ticket.affected_scope] ||
                                                "border-gray-300 bg-gray-100 text-gray-600"
                                            }
                                            min-[1280px]:max-[1365px]:px-1.5
                                            min-[1280px]:max-[1365px]:py-0.5
                                            min-[1280px]:max-[1365px]:text-[10px]
                                            min-[1366px]:max-[1537px]:px-2
                                            min-[1366px]:max-[1537px]:py-0.5
                                            min-[1366px]:max-[1537px]:text-[11px]
                                        `}
                                    >
                                        {ticket.affected_scope
                                            ? ticket.affected_scope === "organization_wide"
                                                ? "Organization Wide"
                                                : ticket.affected_scope.charAt(0).toUpperCase() +
                                                ticket.affected_scope.slice(1)
                                            : "-"}
                                    </span>
                                </td>

                                <td
                                    className="
                                        px-4 py-4
                                        min-[1280px]:max-[1365px]:px-3
                                        min-[1280px]:max-[1365px]:py-2.5
                                        min-[1366px]:max-[1537px]:px-3
                                        min-[1366px]:max-[1537px]:py-3
                                    "
                                >
                                    <span
                                        className={`
                                            inline-flex min-w-[38px] items-center
                                            justify-center whitespace-nowrap rounded-md
                                            border px-2 py-1 text-xs font-semibold
                                            ${
                                                priorityColor[
                                                    ticket.priority
                                                ] ||
                                                "border-gray-300 bg-gray-100 text-gray-600"
                                            }
                                            min-[1280px]:max-[1365px]:min-w-[32px]
                                            min-[1280px]:max-[1365px]:px-1.5
                                            min-[1280px]:max-[1365px]:py-0.5
                                            min-[1280px]:max-[1365px]:text-[10px]
                                            min-[1366px]:max-[1537px]:min-w-[34px]
                                            min-[1366px]:max-[1537px]:px-2
                                            min-[1366px]:max-[1537px]:py-0.5
                                            min-[1366px]:max-[1537px]:text-[11px]
                                        `}
                                    >
                                        {priorityLabel[
                                            ticket.priority
                                        ] ||
                                            ticket.priority ||
                                            "-"}
                                    </span>
                                </td>

                                <td
                                    className="
                                        px-4 py-4
                                        min-[1280px]:max-[1365px]:px-3
                                        min-[1280px]:max-[1365px]:py-2.5
                                        min-[1366px]:max-[1537px]:px-3
                                        min-[1366px]:max-[1537px]:py-3
                                    "
                                >
                                    <span
                                        className={`
                                            inline-flex whitespace-nowrap rounded-md
                                            px-2 py-1 text-xs font-medium
                                            ${
                                                statusColor[
                                                    ticket.status
                                                ] ||
                                                "border border-gray-300 bg-gray-100 text-gray-700"
                                            }
                                            min-[1280px]:max-[1365px]:px-1.5
                                            min-[1280px]:max-[1365px]:py-0.5
                                            min-[1280px]:max-[1365px]:text-[10px]
                                            min-[1366px]:max-[1537px]:px-2
                                            min-[1366px]:max-[1537px]:py-0.5
                                            min-[1366px]:max-[1537px]:text-[11px]
                                        `}
                                    >
                                        {ticket.status || "-"}
                                    </span>
                                </td>

                                <td
                                    className="
                                        px-4 py-4
                                        min-[1280px]:max-[1365px]:px-3
                                        min-[1280px]:max-[1365px]:py-2.5
                                        min-[1366px]:max-[1537px]:px-3
                                        min-[1366px]:max-[1537px]:py-3
                                    "
                                >
                                    <p
                                        className="truncate font-medium text-black"
                                        title={ticket.assigned_to}
                                    >
                                        {ticket.assigned_to?.name ||
                                            "Unassigned"}
                                    </p>
                                </td>

                                <td
                                    className="
                                        px-4 py-4
                                        min-[1280px]:max-[1365px]:px-3
                                        min-[1280px]:max-[1365px]:py-2.5
                                        min-[1366px]:max-[1537px]:px-3
                                        min-[1366px]:max-[1537px]:py-3
                                    "
                                >
                                    <span className="whitespace-nowrap font-medium text-black">
                                        {ticket.resolution_time_remaining ||
                                            "-"}
                                    </span>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td
                                colSpan="9"
                                className="
                                    px-6 py-16 text-center
                                    min-[1280px]:max-[1365px]:px-3
                                    min-[1280px]:max-[1365px]:py-12
                                    min-[1366px]:max-[1537px]:px-4
                                    min-[1366px]:max-[1537px]:py-14
                                "
                            >
                                <p className="font-medium text-black">
                                    No tickets found
                                </p>

                                <p
                                    className="
                                        mt-1 text-sm text-gray-500
                                        min-[1280px]:max-[1365px]:text-[11px]
                                        min-[1366px]:max-[1537px]:text-xs
                                    "
                                >
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