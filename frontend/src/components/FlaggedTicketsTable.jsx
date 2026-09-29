import { formatDate } from "../utils/formatDate";
import { useNavigate } from "react-router-dom";

export default function FlaggedTicketsTable({
    flaggedTickets = [],
    loading = false,
    maxRows = 15,
    dashboard = false,
}) {
    const navigate = useNavigate();

    const displayedTickets = dashboard
        ? flaggedTickets.slice(0, maxRows)
        : flaggedTickets;

    if (loading) {
        return (
            <div
                className={
                    dashboard
                        ? "flex items-center justify-center bg-white py-10"
                        : `
                            flex h-[637px]
                            items-center justify-center
                            overflow-hidden
                            bg-white
                            min-[1280px]:max-[1365px]:h-[450px]
                            min-[1366px]:max-[1537px]:h-[500px]
                            min-[1538px]:max-[1919px]:h-[580px]
                        `
                }
            >
                <p
                    className="
                        text-sm
                        text-gray-500
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
        <div className="w-full overflow-hidden bg-white">
            <div
                className={
                    dashboard
                        ? ""
                        : `
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
                        `
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
                    <thead className="sticky top-0 z-10 bg-gray-50">
                        <tr className="border-b border-gray-300 text-left">
                            <th
                                className="
                                    w-[13%]
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
                                    w-[25%]
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
                                    w-[17%]
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
                                Submitted By
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
                                Flag Reason
                            </th>

                            <th
                                className="
                                    w-[11%]
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
                                Status
                            </th>

                            <th
                                className="
                                    w-[20%]
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
                                Submitted
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {displayedTickets.length > 0 ? (
                            displayedTickets.map((ticket) => {
                                const requesterName =
                                    ticket.first_name &&
                                    ticket.last_name
                                        ? `${ticket.first_name} ${ticket.last_name}`
                                        : "Unknown User";

                                const employeeDepartment =
                                    ticket.employee_department ||
                                    ticket.department ||
                                    "No Department";

                                return (
                                    <tr
                                        key={ticket.id}
                                        onClick={() =>
                                            navigate(
                                                `/flagged-ticket/${ticket.id}`
                                            )
                                        }
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
                                                {ticket.ticket_code || "-"}
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
                                                title={ticket.subject}
                                            >
                                                {ticket.subject || "-"}
                                            </p>
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
                                            <div className="min-w-0">
                                                <p
                                                    className="truncate font-medium text-black"
                                                    title={requesterName}
                                                >
                                                    {requesterName}
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
                                                    title={
                                                        employeeDepartment
                                                    }
                                                >
                                                    {employeeDepartment}
                                                </p>
                                            </div>
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
                                            <span
                                                className={`
                                                    inline-flex
                                                    max-w-full
                                                    items-center
                                                    rounded-md
                                                    border
                                                    px-2.5
                                                    py-1
                                                    text-xs
                                                    font-semibold
                                                    ${getFlagReasonStyle(
                                                        ticket.reason
                                                    )}
                                                    min-[1280px]:max-[1365px]:px-2
                                                    min-[1280px]:max-[1365px]:py-0.5
                                                    min-[1280px]:max-[1365px]:text-[10px]
                                                    min-[1366px]:max-[1537px]:px-2
                                                    min-[1366px]:max-[1537px]:py-1
                                                    min-[1366px]:max-[1537px]:text-[11px]
                                                `}
                                            >
                                                <span className="truncate">
                                                    {formatText(
                                                        ticket.reason
                                                    )}
                                                </span>
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
                                            <span
                                                className={`
                                                    inline-flex
                                                    whitespace-nowrap
                                                    rounded-md
                                                    border
                                                    px-2.5
                                                    py-1
                                                    text-xs
                                                    font-medium
                                                    ${getStatusStyle(
                                                        ticket.status
                                                    )}
                                                    min-[1280px]:max-[1365px]:px-2
                                                    min-[1280px]:max-[1365px]:py-0.5
                                                    min-[1280px]:max-[1365px]:text-[10px]
                                                    min-[1366px]:max-[1537px]:px-2
                                                    min-[1366px]:max-[1537px]:py-1
                                                    min-[1366px]:max-[1537px]:text-[11px]
                                                `}
                                            >
                                                {formatText(
                                                    ticket.status
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
                                    className="
                                        px-6
                                        py-16
                                        text-center
                                        min-[1280px]:max-[1365px]:px-3
                                        min-[1280px]:max-[1365px]:py-10
                                        min-[1366px]:max-[1537px]:px-4
                                        min-[1366px]:max-[1537px]:py-12
                                    "
                                >
                                    <p className="font-medium text-black">
                                        No flagged tickets found
                                    </p>

                                    <p
                                        className="
                                            mt-1
                                            text-sm
                                            text-gray-500
                                            min-[1280px]:max-[1365px]:text-[11px]
                                            min-[1366px]:max-[1537px]:text-xs
                                        "
                                    >
                                        There are currently no flagged
                                        tickets requiring review.
                                    </p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function getFlagReasonStyle(reason = "") {
    const value = reason.toLowerCase();

    if (value.includes("unclear")) {
        return "border-red-300 bg-red-50 text-red-700";
    }

    if (value.includes("confidence")) {
        return "border-blue-300 bg-blue-50 text-blue-700";
    }

    if (value.includes("priority")) {
        return "border-orange-300 bg-orange-50 text-orange-700";
    }

    return "border-gray-300 bg-gray-50 text-gray-700";
}

function getStatusStyle(status = "") {
    const value = status.toLowerCase();

    if (value === "pending") {
        return "border-amber-300 bg-amber-50 text-amber-700";
    }

    if (value === "approved" || value === "resolved") {
        return "border-green-300 bg-green-50 text-green-700";
    }

    if (value === "rejected") {
        return "border-red-300 bg-red-50 text-red-700";
    }

    return "border-gray-300 bg-gray-100 text-gray-700";
}

function formatText(value = "") {
    if (!value) return "-";

    return value
        .replaceAll("_", " ")
        .replace(/\b\w/g, (letter) =>
            letter.toUpperCase()
        );
}