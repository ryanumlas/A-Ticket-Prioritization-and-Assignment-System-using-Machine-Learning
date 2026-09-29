import { formatDate } from "../utils/formatDate";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function PriorityRequestTable({
    requests = [],
    loading = false,
}) {
    const navigate = useNavigate();

    if (loading) {
        return (
            <div
                className="
                    flex
                    h-[637px]
                    items-center
                    justify-center
                    overflow-hidden
                    bg-white
                    min-[1280px]:max-[1365px]:h-[450px]
                    min-[1366px]:max-[1537px]:h-[500px]
                    min-[1538px]:max-[1919px]:h-[580px]
                "
            >
                <p
                    className="
                        text-sm
                        text-gray-500
                        min-[1280px]:max-[1365px]:text-[11px]
                        min-[1366px]:max-[1537px]:text-xs
                    "
                >
                    Loading priority requests...
                </p>
            </div>
        );
    }

    return (
        <div
            className="
                h-[637px]
                w-full
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
                                w-[8%]
                                px-4
                                py-3.5
                                font-semibold
                                text-black
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
                                w-[12%]
                                px-5
                                py-3.5
                                font-semibold
                                text-black
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
                                w-[10%]
                                px-5
                                py-3.5
                                font-semibold
                                text-black
                                min-[1280px]:max-[1365px]:px-3
                                min-[1280px]:max-[1365px]:py-2.5
                                min-[1366px]:max-[1537px]:px-3
                                min-[1366px]:max-[1537px]:py-3
                            "
                        >
                            Requested By
                        </th>

                        <th
                            className="
                                w-[11%]
                                px-5
                                py-3.5
                                font-semibold
                                text-black
                                min-[1280px]:max-[1365px]:px-3
                                min-[1280px]:max-[1365px]:py-2.5
                                min-[1366px]:max-[1537px]:px-3
                                min-[1366px]:max-[1537px]:py-3
                            "
                        >
                            IT Department
                        </th>

                        <th
                            className="
                                w-[10%]
                                px-5
                                py-3.5
                                font-semibold
                                text-black
                                min-[1280px]:max-[1365px]:px-3
                                min-[1280px]:max-[1365px]:py-2.5
                                min-[1366px]:max-[1537px]:px-3
                                min-[1366px]:max-[1537px]:py-3
                            "
                        >
                            Priority Change
                        </th>

                        <th
                            className="
                                w-[14%]
                                px-5
                                py-3.5
                                font-semibold
                                text-black
                                min-[1280px]:max-[1365px]:px-3
                                min-[1280px]:max-[1365px]:py-2.5
                                min-[1366px]:max-[1537px]:px-3
                                min-[1366px]:max-[1537px]:py-3
                            "
                        >
                            Reason
                        </th>

                        <th
                            className="
                                w-[7%]
                                px-5
                                py-3.5
                                font-semibold
                                text-black
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
                                w-[13%]
                                px-5
                                py-3.5
                                font-semibold
                                text-black
                                min-[1280px]:max-[1365px]:px-3
                                min-[1280px]:max-[1365px]:py-2.5
                                min-[1366px]:max-[1537px]:px-3
                                min-[1366px]:max-[1537px]:py-3
                            "
                        >
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
                                            `/priority-request/${request.id}`
                                        )
                                    }
                                    className="cursor-pointer border-b border-gray-200 transition-colors hover:bg-gray-50 last:border-b-0"
                                >
                                    <td
                                        className="
                                            px-4
                                            py-4
                                            min-[1280px]:max-[1365px]:px-3
                                            min-[1280px]:max-[1365px]:py-2.5
                                            min-[1366px]:max-[1537px]:px-3
                                            min-[1366px]:max-[1537px]:py-3
                                        "
                                    >
                                        <span className="whitespace-nowrap font-semibold text-black">
                                            {request.ticket_code || "-"}
                                        </span>
                                    </td>

                                    <td
                                        className="
                                            px-5
                                            py-4
                                            min-[1280px]:max-[1365px]:px-3
                                            min-[1280px]:max-[1365px]:py-2.5
                                            min-[1366px]:max-[1537px]:px-3
                                            min-[1366px]:max-[1537px]:py-3
                                        "
                                    >
                                        <p
                                            className="truncate font-medium text-black"
                                            title={request.subject}
                                        >
                                            {request.subject || "-"}
                                        </p>
                                    </td>

                                    <td
                                        className="
                                            px-5
                                            py-4
                                            min-[1280px]:max-[1365px]:px-3
                                            min-[1280px]:max-[1365px]:py-2.5
                                            min-[1366px]:max-[1537px]:px-3
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
                                                    request.requested_by_role
                                                }
                                            >
                                                {request.requested_by_role ||
                                                    "-"}
                                            </p>
                                        </div>
                                    </td>

                                    <td
                                        className="
                                            px-5
                                            py-4
                                            min-[1280px]:max-[1365px]:px-3
                                            min-[1280px]:max-[1365px]:py-2.5
                                            min-[1366px]:max-[1537px]:px-3
                                            min-[1366px]:max-[1537px]:py-3
                                        "
                                    >
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

                                    <td
                                        className="
                                            px-5
                                            py-4
                                            min-[1280px]:max-[1365px]:px-3
                                            min-[1280px]:max-[1365px]:py-2.5
                                            min-[1366px]:max-[1537px]:px-3
                                            min-[1366px]:max-[1537px]:py-3
                                        "
                                    >
                                        <div
                                            className="
                                                flex
                                                items-center
                                                gap-1.5
                                                min-[1280px]:max-[1365px]:gap-1
                                                min-[1366px]:max-[1537px]:gap-1.5
                                            "
                                        >
                                            <span
                                                className={`
                                                    inline-flex
                                                    items-center
                                                    justify-center
                                                    rounded-md
                                                    border
                                                    px-2
                                                    py-1
                                                    text-xs
                                                    font-semibold
                                                    min-[1280px]:max-[1365px]:px-1.5
                                                    min-[1280px]:max-[1365px]:py-0.5
                                                    min-[1280px]:max-[1365px]:text-[10px]
                                                    min-[1366px]:max-[1537px]:px-1.5
                                                    min-[1366px]:max-[1537px]:py-1
                                                    min-[1366px]:max-[1537px]:text-[11px]
                                                    ${getPriorityStyle(
                                                        request.current_priority
                                                    )}
                                                `}
                                            >
                                                {request.current_priority ||
                                                    "-"}
                                            </span>

                                            <ArrowRight
                                                size={13}
                                                className="
                                                    shrink-0
                                                    text-gray-400
                                                    min-[1280px]:max-[1365px]:size-3
                                                "
                                            />

                                            <span
                                                className={`
                                                    inline-flex
                                                    items-center
                                                    justify-center
                                                    rounded-md
                                                    border
                                                    px-2
                                                    py-1
                                                    text-xs
                                                    font-semibold
                                                    min-[1280px]:max-[1365px]:px-1.5
                                                    min-[1280px]:max-[1365px]:py-0.5
                                                    min-[1280px]:max-[1365px]:text-[10px]
                                                    min-[1366px]:max-[1537px]:px-1.5
                                                    min-[1366px]:max-[1537px]:py-1
                                                    min-[1366px]:max-[1537px]:text-[11px]
                                                    ${getPriorityStyle(
                                                        request.requested_priority
                                                    )}
                                                `}
                                            >
                                                {request.requested_priority ||
                                                    "-"}
                                            </span>
                                        </div>
                                    </td>

                                    <td
                                        className="
                                            px-5
                                            py-4
                                            min-[1280px]:max-[1365px]:px-3
                                            min-[1280px]:max-[1365px]:py-2.5
                                            min-[1366px]:max-[1537px]:px-3
                                            min-[1366px]:max-[1537px]:py-3
                                        "
                                    >
                                        <p
                                            className="truncate text-black"
                                            title={request.reason}
                                        >
                                            {request.reason ||
                                                "No reason provided."}
                                        </p>
                                    </td>

                                    <td
                                        className="
                                            px-5
                                            py-4
                                            min-[1280px]:max-[1365px]:px-3
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
                                                font-medium
                                                min-[1280px]:max-[1365px]:px-1.5
                                                min-[1280px]:max-[1365px]:py-0.5
                                                min-[1280px]:max-[1365px]:text-[10px]
                                                min-[1366px]:max-[1537px]:px-2
                                                min-[1366px]:max-[1537px]:py-0.5
                                                min-[1366px]:max-[1537px]:text-[11px]
                                                ${getStatusStyle(
                                                    request.status
                                                )}
                                            `}
                                        >
                                            {formatText(request.status)}
                                        </span>
                                    </td>

                                    <td
                                        className="
                                            px-5
                                            py-4
                                            min-[1280px]:max-[1365px]:px-3
                                            min-[1280px]:max-[1365px]:py-2.5
                                            min-[1366px]:max-[1537px]:px-3
                                            min-[1366px]:max-[1537px]:py-3
                                        "
                                    >
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
                                colSpan="8"
                                className="
                                    px-6
                                    py-16
                                    text-center
                                    min-[1280px]:max-[1365px]:px-4
                                    min-[1280px]:max-[1365px]:py-10
                                    min-[1366px]:max-[1537px]:px-5
                                    min-[1366px]:max-[1537px]:py-12
                                "
                            >
                                <p className="font-medium text-black">
                                    No priority requests found
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
                                    There are currently no priority change
                                    requests to review.
                                </p>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

function getPriorityStyle(priority = "") {
    switch (priority) {
        case "P1":
            return "border-red-200 bg-red-50 text-red-600";

        case "P2":
            return "border-orange-200 bg-orange-50 text-orange-600";

        case "P3":
            return "border-amber-200 bg-amber-50 text-amber-600";

        case "P4":
            return "border-blue-200 bg-blue-50 text-blue-600";

        case "P5":
            return "border-gray-300 bg-gray-100 text-gray-600";

        default:
            return "border-gray-300 bg-gray-100 text-gray-600";
    }
}

function getStatusStyle(status = "") {
    switch (status.toLowerCase()) {
        case "pending":
            return "border-amber-300 bg-amber-50 text-amber-700";

        case "approved":
            return "border-green-300 bg-green-50 text-green-700";

        case "rejected":
            return "border-red-300 bg-red-50 text-red-700";

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