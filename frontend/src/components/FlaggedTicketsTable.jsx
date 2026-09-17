import { formatDate } from "../utils/formatDate";
import { useNavigate } from "react-router-dom";
import {
    Flag,
    Ticket,
    UserRound,
    Building2,
    Clock3,
} from "lucide-react";

export default function FlaggedTicketsTable({
    flaggedTickets,
    loading = false,
    maxRows = 15,
}) {
    const limitedTickets = flaggedTickets.slice(0, maxRows);
    const navigate = useNavigate();

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12 text-sm text-gray-500">
                Loading tickets...
            </div>
        );
    }

    if (limitedTickets.length === 0) {
        return (
            <div className="flex min-h-[250px] items-center justify-center rounded-xl border border-gray-300 bg-white">
                <p className="text-sm text-gray-500">
                    No flagged tickets found.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {limitedTickets.map((ticket) => (
                <div
                    key={ticket.id}
                    onClick={() =>
                        navigate(`/flagged-ticket/${ticket.id}`)
                    }
                    className="cursor-pointer rounded-xl border border-gray-300 bg-white transition-colors duration-150 hover:border-gray-400 hover:bg-gray-50"
                >
                    <div className="flex min-h-[125px] items-stretch px-4 py-4">

                        {/* LEFT ICON */}
                        <div className="flex shrink-0 items-center pr-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#4C4CF9]/10">
                                <Flag
                                    size={22}
                                    className="text-[#4C4CF9]"
                                />
                            </div>
                        </div>

                        {/* MAIN CONTENT */}
                        <div className="flex min-w-0 flex-1 flex-col">

                            {/* TOP */}
                            <div className="flex items-start justify-between gap-6">

                                {/* SUBJECT */}
                                <h3
                                    className="min-w-0 truncate text-base font-semibold text-black"
                                    title={ticket.subject}
                                >
                                    {ticket.subject}
                                </h3>

                                {/* BADGES */}
                                <div className="flex shrink-0 items-center gap-2">

                                    <span
                                        className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold ${getFlagReasonStyle(
                                            ticket.reason
                                        )}`}
                                    >
                                        {formatText(ticket.reason)}
                                    </span>

                                    <span
                                        className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold ${getStatusStyle(
                                            ticket.status
                                        )}`}
                                    >
                                        {formatText(ticket.status)}
                                    </span>

                                </div>

                            </div>

                            {/* DESCRIPTION */}
                            <p
                                className="mt-1.5 max-w-[1000px] line-clamp-2 break-words text-sm leading-5 text-gray-600"
                                title={ticket.description}
                            >
                                {ticket.description ||
                                    "No description provided."}
                            </p>

                            {/* BOTTOM */}
                            <div className="mt-auto flex items-center justify-between gap-6 pt-3">

                                {/* TICKET INFORMATION */}
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">

                                    {/* TICKET CODE */}
                                    <div className="flex items-center gap-1.5">
                                        <Ticket
                                            size={15}
                                            className="text-gray-400"
                                        />

                                        <span className="font-semibold text-black">
                                            {ticket.ticket_code}
                                        </span>
                                    </div>

                                    <span className="text-gray-300">
                                        •
                                    </span>

                                    {/* USER */}
                                    <div className="flex items-center gap-1.5">
                                        <UserRound
                                            size={15}
                                            className="text-gray-400"
                                        />

                                        <span className="text-black">
                                            {ticket.first_name &&
                                            ticket.last_name
                                                ? `${ticket.first_name} ${ticket.last_name}`
                                                : "Unknown User"}
                                        </span>
                                    </div>

                                    <span className="text-gray-300">
                                        •
                                    </span>

                                    {/* DEPARTMENT */}
                                    <div className="flex items-center gap-1.5">
                                        <Building2
                                            size={15}
                                            className="text-gray-400"
                                        />

                                        <span className="font-medium text-black">
                                            {ticket.employee_department ||
                                                ticket.department ||
                                                "No Department"}
                                        </span>
                                    </div>

                                </div>

                                {/* DATE */}
                                <div className="flex shrink-0 items-center gap-2 text-sm">
                                    <Clock3
                                        size={15}
                                        className="text-gray-400"
                                    />

                                    <span className="whitespace-nowrap font-medium text-black">
                                        {formatDate(ticket.created_at)}
                                    </span>
                                </div>

                            </div>

                        </div>

                    </div>
                </div>
            ))}
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

    if (value === "approved") {
        return "border-green-300 bg-green-50 text-green-700";
    }

    if (value === "rejected") {
        return "border-red-300 bg-red-50 text-red-700";
    }

    return "border-gray-300 bg-gray-50 text-gray-700";
}

function formatText(value = "") {
    return value
        .replaceAll("_", " ")
        .replace(/\b\w/g, (letter) =>
            letter.toUpperCase()
        );
}