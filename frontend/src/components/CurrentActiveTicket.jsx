import {
    Ticket,
    UserRound,
    Clock3,
    ArrowRight,
    CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { priorityColor, priorityLabel } from "../utils/priority";
import { statusColor } from "../utils/statusColor";
import { formatDate } from "../utils/formatDate";

export default function CurrentActiveTicket({ ticket }) {
    const navigate = useNavigate();

    if (!ticket) {
        return (
            <div className="flex h-full min-h-[320px] w-full flex-col rounded-xl border border-gray-300 bg-white p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <Ticket
                                size={20}
                                className="shrink-0 text-[#2563EB]"
                            />

                            <h1 className="text-lg font-semibold text-gray-900 sm:text-xl">
                                Current Active Ticket
                            </h1>
                        </div>

                        <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                            Overview of your currently active support request.
                        </p>
                    </div>

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-600">
                        <CheckCircle2 size={20} />
                    </div>
                </div>

                <div className="flex flex-1 flex-col items-center justify-center px-4 py-8 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
                        <CheckCircle2 size={24} />
                    </div>

                    <h2 className="mt-4 text-lg font-semibold text-gray-900">
                        No active tickets
                    </h2>

                    <p className="mt-1 max-w-sm text-sm text-gray-500">
                        You currently don't have any active support tickets.
                    </p>

                    <button
                        type="button"
                        onClick={() => navigate("/submit/ticket")}
                        className="mt-5 inline-flex h-10 cursor-pointer items-center gap-2 rounded-md bg-[#2563EB] px-5 text-sm font-medium text-white transition-colors hover:bg-[#1D4ED8]"
                    >
                        Submit a Ticket
                        <ArrowRight size={16} />
                    </button>
                </div>
            </div>
        );
    }

    const priorityClass =
        priorityColor[ticket.priority] ||
        "border border-gray-300 bg-gray-100 text-gray-700";

    const statusClass =
        statusColor[ticket.status] ||
        "border border-gray-300 bg-gray-100 text-gray-700";

    return (
        <div className="flex h-full min-h-[320px] w-full flex-col rounded-xl border border-gray-300 bg-white p-5 sm:p-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <Ticket
                            size={20}
                            className="shrink-0 text-[#2563EB]"
                        />

                        <h1 className="truncate text-lg font-semibold text-gray-900 sm:text-xl">
                            Current Active Ticket
                        </h1>
                    </div>

                    <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                        Overview of your currently active support request.
                    </p>
                </div>

                <span
                    className="shrink-0 pt-0.5 text-sm font-semibold text-[#2563EB]"
                    title={ticket.ticket_code}
                >
                    {ticket.ticket_code || "-"}
                </span>
            </div>

            {/* Subject */}
            <div className="mt-5 min-w-0">
                <p className="text-xs font-medium text-gray-400">
                    Subject
                </p>

                <h2
                    className="mt-1 truncate text-lg font-semibold text-gray-900 sm:text-xl"
                    title={ticket.subject}
                >
                    {ticket.subject || "-"}
                </h2>
            </div>

            {/* Status / Priority */}
            <div className="mt-5 grid grid-cols-2 gap-4">
                <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-400">
                        Status
                    </p>

                    <span
                        className={`mt-2 inline-flex max-w-full truncate rounded-md px-2.5 py-1.5 text-sm font-medium ${statusClass}`}
                    >
                        {ticket.status || "-"}
                    </span>
                </div>

                <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-400">
                        Priority
                    </p>

                    <span
                        className={`mt-2 inline-flex max-w-full truncate rounded-md px-2.5 py-1.5 text-sm font-semibold ${priorityClass}`}
                    >
                        {priorityLabel[ticket.priority] ||
                            ticket.priority ||
                            "-"}
                    </span>
                </div>
            </div>

            {/* Assigned To / Last Updated */}
            <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                        <UserRound size={17} />
                    </div>

                    <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-400">
                            Assigned To
                        </p>

                        <p
                            className="mt-0.5 truncate text-sm font-medium text-gray-800"
                            title={
                                ticket.assigned_to?.full_name ||
                                "Not assigned"
                            }
                        >
                            {ticket.assigned_to?.full_name ||
                                "Not assigned"}
                        </p>
                    </div>
                </div>

                <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                        <Clock3 size={17} />
                    </div>

                    <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-400">
                            Last Updated
                        </p>

                        <p className="mt-0.5 truncate text-sm font-medium text-gray-800">
                            {formatDate(ticket.updated_at)}
                        </p>
                    </div>
                </div>
            </div>

            {/* View Ticket */}
            <div className="mt-auto pt-6">
                <button
                    type="button"
                    onClick={() =>
                        navigate(`/ticket/${ticket.id}`)
                    }
                    className="group inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-[#2563EB] px-4 text-sm font-medium text-white transition-colors hover:bg-[#1D4ED8]"
                >
                    View Ticket

                    <ArrowRight
                        size={17}
                        className="transition-transform group-hover:translate-x-0.5"
                    />
                </button>
            </div>
        </div>
    );
}