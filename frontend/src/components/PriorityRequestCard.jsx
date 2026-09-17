import { formatDate } from "../utils/formatDate";
import { useNavigate } from "react-router-dom";
import {
    Ticket,
    UserRound,
    Building2,
    MessageSquareText,
    Clock3,
    ArrowRight,
    ChevronRight,
} from "lucide-react";

export default function PriorityRequestCard({
    request
}) {
    const navigate = useNavigate();

    const priorityLabel = {
        P1: "Critical",
        P2: "High",
        P3: "Medium",
        P4: "Low",
        P5: "Very Low",
    };

    const priorityStyle = {
        P1: "border-red-200 bg-red-50 text-red-600",
        P2: "border-orange-200 bg-orange-50 text-orange-600",
        P3: "border-amber-200 bg-amber-50 text-amber-600",
        P4: "border-blue-200 bg-blue-50 text-blue-600",
        P5: "border-gray-300 bg-gray-100 text-gray-600",
    };

    const statusStyle = {
        pending: "border-amber-300 bg-amber-50 text-amber-600",
        approved: "border-green-300 bg-green-50 text-green-600",
        rejected: "border-red-300 bg-red-50 text-red-600",
    };

    const formatStatus = (status = "") => {
        return status
            .replaceAll("_", " ")
            .replace(/\b\w/g, (letter) =>
                letter.toUpperCase()
            );
    };

    const requesterName =
        request.requested_by_first_name &&
        request.requested_by_last_name
            ? `${request.requested_by_first_name} ${request.requested_by_last_name}`
            : "Unknown User";

    return (
        <div className="flex min-h-[118px] w-full items-stretch rounded-xl border border-gray-300 bg-white px-4 py-4 transition-colors hover:border-gray-400">

            {/* LEFT ICON */}
            <div className="flex shrink-0 items-center pr-4">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#4C4CF9]/10">
                    <Ticket
                        size={22}
                        className="text-[#4C4CF9]"
                    />
                </div>

            </div>

            {/* TICKET INFORMATION */}
            <div className="flex min-w-0 flex-[1.7] flex-col justify-center pr-5">

                {/* TICKET CODE */}
                <p className="text-sm font-semibold text-black">
                    {request.ticket_code || "-"}
                </p>

                {/* SUBJECT */}
                <p
                    className="mt-1 truncate text-sm font-semibold text-black"
                    title={request.subject}
                >
                    {request.subject || "No subject"}
                </p>

                {/* REQUESTER / IT DEPARTMENT */}
                <div className="mt-2 flex min-w-0 items-center gap-x-3 text-sm">

                    {/* REQUESTER */}
                    <div className="flex min-w-0 items-center gap-1.5">

                        <UserRound
                            size={14}
                            className="shrink-0 text-gray-400"
                        />

                        <span className="truncate text-black">
                            {requesterName}
                        </span>

                    </div>

                    <span className="text-gray-300">
                        •
                    </span>

                    {/* IT DEPARTMENT */}
                    <div className="flex min-w-0 items-center gap-1.5">

                        <Building2
                            size={14}
                            className="shrink-0 text-gray-400"
                        />

                        <span className="truncate font-medium text-black">
                            {request.it_department ||
                                "No Department"}
                        </span>

                    </div>

                </div>

            </div>

            {/* DIVIDER */}
            <div className="my-1 w-px shrink-0 bg-gray-200" />

            {/* PRIORITY CHANGE */}
            <div className="flex min-w-[285px] flex-col justify-center px-5">

                <p className="mb-2 text-xs font-medium text-gray-500">
                    Priority Change
                </p>

                <div className="flex items-center gap-3">

                    {/* CURRENT PRIORITY */}
                    <span
                        className={`inline-flex whitespace-nowrap rounded-md border px-2.5 py-1 text-xs font-semibold ${
                            priorityStyle[
                                request.current_priority
                            ] ||
                            priorityStyle.P5
                        }`}
                    >
                        {priorityLabel[
                            request.current_priority
                        ]
                            ? `${priorityLabel[request.current_priority]} (${request.current_priority})`
                            : request.current_priority || "-"}
                    </span>

                    <ArrowRight
                        size={16}
                        className="shrink-0 text-gray-500"
                    />

                    {/* REQUESTED PRIORITY */}
                    <span
                        className={`inline-flex whitespace-nowrap rounded-md border px-2.5 py-1 text-xs font-semibold ${
                            priorityStyle[
                                request.requested_priority
                            ] ||
                            priorityStyle.P5
                        }`}
                    >
                        {priorityLabel[
                            request.requested_priority
                        ]
                            ? `${priorityLabel[request.requested_priority]} (${request.requested_priority})`
                            : request.requested_priority || "-"}
                    </span>

                </div>

            </div>

            {/* DIVIDER */}
            <div className="my-1 w-px shrink-0 bg-gray-200" />

            {/* REASON */}
            <div className="flex min-w-0 flex-1 items-center gap-3 px-5">

                <MessageSquareText
                    size={18}
                    className="shrink-0 text-gray-400"
                />

                <div className="min-w-0">

                    <p className="mb-1 text-xs font-medium text-gray-500">
                        Reason
                    </p>

                    <p
                        className="line-clamp-2 text-sm leading-5 text-black"
                        title={request.reason}
                    >
                        {request.reason ||
                            "No reason provided."}
                    </p>

                </div>

            </div>

            {/* DIVIDER */}
            <div className="my-1 w-px shrink-0 bg-gray-200" />

            {/* STATUS / DATE */}
            <div className="flex min-w-[210px] shrink-0 items-center justify-between gap-4 pl-5">

                <div className="flex flex-col items-start justify-center">

                    {/* STATUS */}
                    <span
                        className={`rounded-md border px-2.5 py-1 text-xs font-medium ${
                            statusStyle[
                                request.status
                            ] ||
                            "border-gray-300 bg-gray-50 text-gray-600"
                        }`}
                    >
                        {formatStatus(request.status)}
                    </span>

                    {/* DATE */}
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-black">

                        <Clock3
                            size={14}
                            className="shrink-0 text-gray-400"
                        />

                        <span className="whitespace-nowrap font-medium text-black">
                            {request.requested_at
                                ? formatDate(
                                      request.requested_at
                                  )
                                : "-"}
                        </span>

                    </div>

                </div>

                {/* VIEW DETAILS */}
                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            `/priority-request/${request.id}`
                        )
                    }
                    title="View Details"
                    className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-black"
                >
                    <ChevronRight size={19} />
                </button>

            </div>

        </div>
    );
}