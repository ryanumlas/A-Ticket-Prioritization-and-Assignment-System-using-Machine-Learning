import { formatDate } from "../utils/formatDate";
import { useNavigate } from "react-router-dom";

export default function FlaggedTicketsTable({
    flaggedTickets = [],
    loading = false,
    maxRows = 15,
}) {
    const navigate = useNavigate();

    const limitedTickets = flaggedTickets.slice(0, maxRows);

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
        <div className="max-h-[637px] w-full overflow-y-auto bg-white">
            <table className="w-full table-fixed text-sm">

                {/* Header */}
                <thead className="sticky top-0 z-10 bg-gray-50">
                    <tr className="border-b border-gray-300 text-left">

                        <th className="w-[13%] px-6 py-3.5 font-semibold text-black">
                            Ticket ID
                        </th>

                        <th className="w-[25%] px-6 py-3.5 font-semibold text-black">
                            Subject
                        </th>

                        <th className="w-[15%] px-6 py-3.5 font-semibold text-black">
                            Submitted By
                        </th>

                        <th className="w-[16%] px-6 py-3.5 font-semibold text-black">
                            Department
                        </th>

                        <th className="w-[14%] px-6 py-3.5 font-semibold text-black">
                            Flag Reason
                        </th>

                        <th className="w-[9%] px-6 py-3.5 font-semibold text-black">
                            Status
                        </th>

                        <th className="w-[17%] px-6 py-3.5 font-semibold text-black">
                            Submitted
                        </th>

                    </tr>
                </thead>

                {/* Body */}
                <tbody>
                    {limitedTickets.length > 0 ? (
                        limitedTickets.map((ticket) => {
                            const requesterName =
                                ticket.first_name &&
                                ticket.last_name
                                    ? `${ticket.first_name} ${ticket.last_name}`
                                    : "Unknown User";

                            const department =
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
                                    className="cursor-pointer border-b border-gray-200 transition-colors hover:bg-gray-50 last:border-b-0"
                                >

                                    {/* Ticket ID */}
                                    <td className="px-6 py-4">
                                        <span className="font-semibold text-black">
                                            {ticket.ticket_code || "-"}
                                        </span>
                                    </td>

                                    {/* Subject */}
                                    <td className="px-6 py-4">
                                        <p
                                            className="truncate font-medium text-black"
                                            title={ticket.subject}
                                        >
                                            {ticket.subject || "-"}
                                        </p>
                                    </td>

                                    {/* Requester */}
                                    <td className="px-6 py-4">
                                        <p
                                            className="truncate text-black"
                                            title={requesterName}
                                        >
                                            {requesterName}
                                        </p>
                                    </td>

                                    {/* Department */}
                                    <td className="px-6 py-4">
                                        <p
                                            className="truncate text-black"
                                            title={department}
                                        >
                                            {department}
                                        </p>
                                    </td>

                                    {/* Flag Reason */}
                                    <td className="px-6 py-4">
                                        <span
                                            className={`inline-flex max-w-full items-center rounded-md border px-2.5 py-1 text-xs font-semibold ${getFlagReasonStyle(
                                                ticket.reason
                                            )}`}
                                        >
                                            <span className="truncate">
                                                {formatText(ticket.reason)}
                                            </span>
                                        </span>
                                    </td>

                                    {/* Status */}
                                    <td className="px-6 py-4">
                                        <span
                                            className={`inline-flex whitespace-nowrap rounded-md border px-2.5 py-1 text-xs font-medium ${getStatusStyle(
                                                ticket.status
                                            )}`}
                                        >
                                            {formatText(ticket.status)}
                                        </span>
                                    </td>

                                    {/* Submitted */}
                                    <td className="px-6 py-4">
                                        <span className="whitespace-nowrap font-medium text-black">
                                            {ticket.created_at
                                                ? formatDate(ticket.created_at)
                                                : "-"}
                                        </span>
                                    </td>

                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td
                                colSpan="7"
                                className="px-6 py-16 text-center"
                            >
                                <p className="font-medium text-black">
                                    No flagged tickets found
                                </p>

                                <p className="mt-1 text-sm text-gray-500">
                                    There are currently no flagged tickets requiring review.
                                </p>
                            </td>
                        </tr>
                    )}
                </tbody>

            </table>
        </div>
    );
}

function getFlagReasonStyle(reason = "") {
    const value = reason.toLowerCase();

    if (value.includes("unclear")) {
        return "border-red-300 bg-red-50 text-red-700";
    }

    if (
        value.includes("symptom") ||
        value.includes("not_detected")
    ) {
        return "border-orange-300 bg-orange-50 text-orange-700";
    }

    if (value.includes("keyword")) {
        return "border-purple-300 bg-purple-50 text-purple-700";
    }

    if (value.includes("confidence")) {
        return "border-blue-300 bg-blue-50 text-blue-700";
    }

    return "border-gray-300 bg-gray-50 text-gray-700";
}

function getStatusStyle(status = "") {
    const value = status.toLowerCase();

    if (value === "pending") {
        return "border-amber-300 bg-amber-50 text-amber-700";
    }

    if (
        value === "under_review" ||
        value === "under review"
    ) {
        return "border-blue-300 bg-blue-50 text-blue-700";
    }

    if (
        value === "approved" ||
        value === "resolved"
    ) {
        return "border-green-300 bg-green-50 text-green-700";
    }

    if (value === "rejected") {
        return "border-red-300 bg-red-50 text-red-700";
    }

    if (value === "closed") {
        return "border-gray-300 bg-gray-100 text-gray-700";
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