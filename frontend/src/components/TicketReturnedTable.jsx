import { formatDate } from "../utils/formatDate";
import { useNavigate } from "react-router-dom";

export default function TicketReturnedTable({
    requests = [],
    loading = false,
}) {
    const navigate = useNavigate();

    if (loading) {
        return (
            <div className="flex h-[637px] items-center justify-center overflow-hidden bg-white">
                <p className="text-sm text-gray-500">
                    Loading returned ticket requests...
                </p>
            </div>
        );
    }

    return (
        <div className="h-[637px] w-full overflow-y-auto overflow-x-hidden bg-white">
            <table className="w-full table-fixed text-sm">
                <thead className="sticky top-0 z-10 bg-gray-50">
                    <tr className="border-b border-gray-300 text-left">
                        <th className="w-[10%] px-4 py-3.5 font-semibold text-black">
                            Ticket ID
                        </th>

                        <th className="w-[22%] px-5 py-3.5 font-semibold text-black">
                            Subject
                        </th>

                        <th className="w-[16%] px-5 py-3.5 font-semibold text-black">
                            Requested By
                        </th>

                        <th className="w-[13%] px-5 py-3.5 font-semibold text-black">
                            IT Department
                        </th>

                        <th className="w-[17%] px-5 py-3.5 font-semibold text-black">
                            Reason
                        </th>

                        <th className="w-[10%] px-5 py-3.5 font-semibold text-black">
                            Status
                        </th>

                        <th className="w-[12%] px-5 py-3.5 font-semibold text-black">
                            Requested At
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {requests.length > 0 ? (
                        requests.map((request) => {
                            const requesterName =
                                request.requested_by_first_name &&
                                request.requested_by_last_name
                                    ? `${request.requested_by_first_name} ${request.requested_by_last_name}`
                                    : "Unknown User";

                            return (
                                <tr
                                    key={request.id}
                                    onClick={() =>
                                        navigate(
                                            `/returned-ticket/${request.id}`
                                        )
                                    }
                                    className="cursor-pointer border-b border-gray-200 transition-colors hover:bg-gray-50 last:border-b-0"
                                >
                                    <td className="px-4 py-4">
                                        <span className="whitespace-nowrap font-semibold text-black">
                                            {request.ticket_code ||
                                                "-"}
                                        </span>
                                    </td>

                                    <td className="px-5 py-4">
                                        <p
                                            className="truncate font-medium text-black"
                                            title={request.subject}
                                        >
                                            {request.subject || "-"}
                                        </p>
                                    </td>

                                    <td className="px-5 py-4">
                                        <div className="min-w-0">
                                            <p
                                                className="truncate font-medium text-black"
                                                title={requesterName}
                                            >
                                                {requesterName}
                                            </p>

                                            <p
                                                className="mt-0.5 truncate text-xs text-gray-500"
                                                title={
                                                    request.requested_by_user_code
                                                }
                                            >
                                                {request.requested_by_user_code ||
                                                    "-"}
                                            </p>
                                        </div>
                                    </td>

                                    <td className="px-5 py-4">
                                        <p
                                            className="truncate text-black"
                                            title={
                                                request.it_department ||
                                                "No Department"
                                            }
                                        >
                                            {request.it_department ||
                                                "No Department"}
                                        </p>
                                    </td>

                                    <td className="px-5 py-4">
                                        <p
                                            className="truncate text-black"
                                            title={request.reason}
                                        >
                                            {request.reason ||
                                                "No reason provided."}
                                        </p>
                                    </td>

                                    <td className="px-5 py-4">
                                        <span
                                            className={`inline-flex whitespace-nowrap rounded-md border px-2.5 py-1 text-xs font-medium ${getStatusStyle(
                                                request.status
                                            )}`}
                                        >
                                            {formatText(
                                                request.status
                                            )}
                                        </span>
                                    </td>

                                    <td className="px-5 py-4">
                                        <span className="whitespace-nowrap font-medium text-black">
                                            {request.requested_at
                                                ? formatDate(
                                                      request.requested_at
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
                                colSpan="7"
                                className="px-6 py-16 text-center"
                            >
                                <p className="font-medium text-black">
                                    No returned requests found
                                </p>

                                <p className="mt-1 text-sm text-gray-500">
                                    There are currently no returned
                                    ticket requests to review.
                                </p>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

function getStatusStyle(status = "") {
    switch (status.toLowerCase()) {
        case "pending":
            return "border-amber-300 bg-amber-50 text-amber-700";

        case "approved":
            return "border-green-300 bg-green-50 text-green-700";

        case "rejected":
            return "border-red-300 bg-red-50 text-red-700";

        case "completed":
            return "border-blue-300 bg-blue-50 text-blue-700";

        default:
            return "border-gray-300 bg-gray-100 text-gray-700";
    }
}

function formatText(value = "") {
    if (!value) {
        return "-";
    }

    return value
        .replaceAll("_", " ")
        .replace(/\b\w/g, (letter) =>
            letter.toUpperCase()
        );
}