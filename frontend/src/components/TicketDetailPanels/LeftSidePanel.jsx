import {
    CircleDot,
    CircleAlert,
    Users,
    CalendarDays,
    User,
    History,
    Ticket,
    Clock,
    Wrench,
    SquareUserRound,
} from "lucide-react";

import { statusColor } from "/src/utils/statusColor";
import { priorityColor, priorityLabel } from "/src/utils/priority";
import { formatDate } from "/src/utils/formatDate";

export default function LeftSidePanel({ ticketDetails }) {
    const priority = ticketDetails.priority;

    return (
        <div
            className="
                w-full max-w-[450px] shrink-0
                overflow-y-auto
                border-r border-gray-300
                [&::-webkit-scrollbar]:w-1
                [&::-webkit-scrollbar-track]:bg-transparent
                [&::-webkit-scrollbar-thumb]:rounded-full
                [&::-webkit-scrollbar-thumb]:bg-transparent
                hover:[&::-webkit-scrollbar-thumb]:bg-gray-300
            "
        >
            <div className="border-b border-gray-200 p-5">

                <div className="flex items-center justify-between">

                    <div className="flex items-center gap-2">
                        <Ticket
                            size={20}
                            className="text-gray-500"
                        />

                        <p className="font-semibold tracking-wide text-black">
                            Ticket Information
                        </p>
                    </div>

                    <p className="text-xs font-medium text-gray-500">
                        #{ticketDetails.ticket_code}
                    </p>

                </div>

                <p className="mt-1 text-xs text-gray-500">
                    View the details and information about the ticket.
                </p>

            </div>

            <div className="p-5">

                <div>
                    <p className="mb-1 text-xs font-medium uppercase text-gray-500">
                        Subject
                    </p>

                    <p className="break-words text-sm font-semibold text-black">
                        {ticketDetails.subject}
                    </p>
                </div>

                {/* DESCRIPTION */}
                <div className="mt-4">
                    <p className="mb-1 text-xs font-medium uppercase text-gray-500">
                        Description
                    </p>

                    <p className="break-words whitespace-pre-wrap text-sm leading-6 text-black">
                        {ticketDetails.description}
                    </p>
                </div>

                {/* BUSINESS IMPACT */}
                {ticketDetails.business_impact && (
                    <div className="mt-4">
                        <p className="mb-1 text-xs font-medium uppercase text-gray-500">
                            Business Impact
                        </p>

                        <p className="break-words whitespace-pre-wrap text-sm leading-6 text-black">
                            {ticketDetails.business_impact}
                        </p>
                    </div>
                )}

            </div>

            {/* TICKET INFORMATION */}
            <div className="px-5 pb-5">
                <div className="space-y-3">

                    <DetailRow
                        icon={CircleDot}
                        label="Status"
                    >
                        <span
                            className={`inline-flex whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium ${
                                statusColor[ticketDetails.status] ||
                                "border border-gray-300 bg-gray-100 text-gray-700"
                            }`}
                        >
                            {ticketDetails.status || "-"}
                        </span>
                    </DetailRow>

                    <DetailRow
                        icon={CircleAlert}
                        label="Priority"
                    >
                        <span
                            className={`inline-flex whitespace-nowrap rounded-md border px-2.5 py-1 text-xs font-semibold ${
                                priorityColor[priority] ||
                                "border-gray-300 bg-gray-100 text-gray-600"
                            }`}
                        >
                            {priorityLabel[priority] || priority || "-"}
                        </span>
                    </DetailRow>

                    <DetailRow
                        icon={Users}
                        label="Affected Scope"
                    >
                        <span className="text-sm font-medium capitalize text-black">
                            {ticketDetails.affected_scope || "-"}
                        </span>
                    </DetailRow>

                    <DetailRow
                        icon={History}
                        label="Last Updated"
                    >
                        <span className="text-sm font-medium text-black">
                            {formatDate(ticketDetails.updated_at)}
                        </span>
                    </DetailRow>

                    <DetailRow
                        icon={CalendarDays}
                        label="Created at"
                    >
                        <span className="text-sm font-medium text-black">
                            {formatDate(ticketDetails.created_at)}
                        </span>
                    </DetailRow>

                    <DetailRow
                        icon={User}
                        label="Assigned to"
                    >
                        <span className="inline-flex max-w-full items-center break-words rounded-md border border-gray-300 bg-gray-100 px-2.5 py-1 text-sm font-medium text-black">
                            {ticketDetails.assigned_to || "Unassigned"}
                        </span>
                    </DetailRow>

                    <DetailRow
                        icon={Clock}
                        label="Expected Response"
                    >
                        <span className="text-sm font-medium text-black">
                            {formatDate(ticketDetails.response_deadline)}
                        </span>
                    </DetailRow>

                    <DetailRow
                        icon={Wrench}
                        label="Expected Resolution"
                    >
                        <span className="text-sm font-medium text-black">
                            {formatDate(ticketDetails.resolution_deadline)}
                        </span>
                    </DetailRow>

                </div>
            </div>

            {/* REQUESTER INFORMATION */}
            <div className="border-t border-gray-200 p-5">

                <div className="mb-4 flex items-center gap-2">
                    <SquareUserRound
                        size={20}
                        className="text-gray-500"
                    />

                    <p className="font-semibold text-black">
                        Requester Information
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-x-8 gap-y-4">

                    <div>
                        <p className="mb-1 text-xs text-gray-500">
                            Name
                        </p>

                        <p className="break-words text-sm font-medium text-black">
                            {`${ticketDetails.first_name || ""} ${
                                ticketDetails.last_name || ""
                            }`.trim() || "-"}
                        </p>
                    </div>

                    <div>
                        <p className="mb-1 text-xs text-gray-500">
                            Employee ID
                        </p>

                        <p className="break-words text-sm font-medium text-black">
                            {ticketDetails.user_code || "-"}
                        </p>
                    </div>

                    <div>
                        <p className="mb-1 text-xs text-gray-500">
                            Department
                        </p>

                        <p className="break-words text-sm font-medium text-black">
                            {ticketDetails.employee_department || "-"}
                        </p>
                    </div>

                    <div>
                        <p className="mb-1 text-xs text-gray-500">
                            Office Location
                        </p>

                        <p className="break-words text-sm font-medium text-black">
                            {ticketDetails.office_location || "-"}
                        </p>
                    </div>

                    <div>
                        <p className="mb-1 text-xs text-gray-500">
                            Workstation
                        </p>

                        <p className="break-words text-sm font-medium text-black">
                            {ticketDetails.workstation || "-"}
                        </p>
                    </div>

                </div>
            </div>

        </div>
    );
}


function DetailRow({
    icon: Icon,
    label,
    children,
}) {
    return (
        <div className="grid grid-cols-[170px_minmax(0,1fr)] items-start gap-3">

            <div className="flex min-w-0 items-center gap-2 text-gray-500">
                <Icon
                    size={17}
                    className="shrink-0"
                />

                <span className="text-sm">
                    {label}
                </span>
            </div>

            <div className="min-w-0 break-words">
                {children}
            </div>

        </div>
    );
}