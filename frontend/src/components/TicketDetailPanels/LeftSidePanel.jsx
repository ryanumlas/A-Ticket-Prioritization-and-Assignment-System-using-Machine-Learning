import {
    CircleDot,
    CircleAlert,
    Users,
    CalendarDays,
    History,
    Ticket,
    Clock,
    Wrench,
    SquareUserRound,
    Tags,
    Stethoscope,
    Pencil,
    UserRound,
} from "lucide-react";

import { statusColor } from "/src/utils/statusColor";
import { priorityColor, priorityLabel } from "/src/utils/priority";
import { formatDate } from "/src/utils/formatDate";
import { getCurrentUser } from "/src/utils/auth";

export default function LeftSidePanel({ ticketDetails }) {
    const user = getCurrentUser();
    const priority = ticketDetails.priority;

    const canViewClassification =
        user?.role === "IT Service Desk" ||
        user?.role === "IT Support Specialist" ||
        user?.role === "IT Supervisor";

    const canEditTicket =
        user?.role === "IT Support Specialist" ||
        user?.role === "IT Supervisor";

    const requesterName =
        `${ticketDetails.first_name || ""} ${ticketDetails.last_name || ""}`.trim() ||
        "Unknown User";

    const assignedName = ticketDetails.assigned_to?.full_name || "Unassigned";
    const assignedRole =
        ticketDetails.assigned_to?.role || "IT Support Specialist";

    return (
        <div className="flex h-full w-full min-w-0 shrink-0 flex-col overflow-hidden border-gray-300 sm:w-[320px] sm:min-w-[320px] lg:w-[320px] lg:min-w-[320px] min-[1280px]:max-[1535px]:w-[320px] min-[1280px]:max-[1535px]:min-w-[320px] 2xl:w-[450px] 2xl:min-w-[450px]">

            <div className="box-border h-auto shrink-0 border-b border-gray-200 px-4 py-4 sm:px-5 min-[1280px]:max-[1535px]:px-4 min-[1280px]:max-[1535px]:py-3.5 min-[1536px]:max-[1599px]:h-[88px] 2xl:px-6 2xl:py-4 min-[1537px]:max-[1920px]:h-[88px]">
                <div className="flex min-w-0 items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                        <Ticket
                            size={20}
                            className="shrink-0 text-[#2563EB] min-[1280px]:max-[1535px]:size-[18px]"
                        />

                        <p className="truncate font-semibold tracking-wide text-black min-[1280px]:max-[1535px]:text-[13px]">
                            Ticket Information
                        </p>
                    </div>

                    <p className="shrink-0 text-xs font-medium text-gray-500">
                        #{ticketDetails.ticket_code}
                    </p>
                </div>

                <p className="mt-1 text-xs text-gray-500 min-[1280px]:max-[1535px]:text-[11px]">
                    View the details and information about the ticket.
                </p>
            </div>

            {/* Scrollable Ticket Information */}
            <div className="min-h-0 flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-gray-300">

                {/* Ticket Summary */}
                <div className="p-4 sm:p-5 min-[1280px]:max-[1535px]:p-4">
                    <div>
                        <p className="mb-1 text-xs font-medium uppercase text-gray-500">
                            Subject
                        </p>

                        <p className="break-words text-sm font-semibold leading-5 text-black min-[1280px]:max-[1535px]:text-[13px]">
                            {ticketDetails.subject}
                        </p>
                    </div>

                    <div className="mt-4 min-[1280px]:max-[1535px]:mt-3">
                        <p className="mb-1 text-xs font-medium uppercase text-gray-500">
                            Description
                        </p>

                        <p className="whitespace-pre-wrap break-words text-sm leading-6 text-black min-[1280px]:max-[1535px]:text-[13px] min-[1280px]:max-[1535px]:leading-5">
                            {ticketDetails.description}
                        </p>
                    </div>

                    {ticketDetails.business_impact && (
                        <div className="mt-4 min-[1280px]:max-[1535px]:mt-3">
                            <p className="mb-1 text-xs font-medium uppercase text-gray-500">
                                Business Impact
                            </p>

                            <p className="whitespace-pre-wrap break-words text-sm leading-6 text-black min-[1280px]:max-[1535px]:text-[13px] min-[1280px]:max-[1535px]:leading-5">
                                {ticketDetails.business_impact}
                            </p>
                        </div>
                    )}
                </div>

                {/* Ticket Details */}
                <div className="px-4 pb-5 sm:px-5 min-[1280px]:max-[1535px]:px-4 min-[1280px]:max-[1535px]:pb-4">
                    <div className="space-y-3 min-[1280px]:max-[1535px]:space-y-3.5">

                        <DetailRow icon={CircleDot} label="Status">
                            <div className="flex min-w-0 flex-wrap items-center gap-2">
                                <span
                                    className={`inline-flex whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium ${statusColor[ticketDetails.status] || "border border-gray-300 bg-gray-100 text-gray-700"}`}
                                >
                                    {ticketDetails.status || "-"}
                                </span>

                                {ticketDetails.is_escalated && (
                                    <span className="inline-flex whitespace-nowrap rounded-md border border-orange-200 bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-600">
                                        Escalated
                                    </span>
                                )}
                            </div>
                        </DetailRow>

                        <DetailRow icon={CircleAlert} label="Priority">
                            <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
                                <span
                                    className={`inline-flex whitespace-nowrap rounded-md border px-2.5 py-1 text-xs font-semibold ${priorityColor[priority] || "border-gray-300 bg-gray-100 text-gray-600"}`}
                                >
                                    {priorityLabel[priority] || priority || "-"}
                                </span>

                                {canEditTicket && (
                                    <EditButton
                                        label="Edit priority"
                                        onClick={() => {}}
                                    />
                                )}
                            </div>
                        </DetailRow>

                        {canViewClassification && (
                            <>
                                <DetailRow icon={Stethoscope} label="Symptom Code">
                                    <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
                                        <span className="min-w-0 break-words text-sm font-medium text-black min-[1280px]:max-[1535px]:text-[13px]">
                                            {ticketDetails.symptom_code || "-"}
                                        </span>

                                        {canEditTicket && (
                                            <EditButton
                                                label="Edit symptom code"
                                                onClick={() => {}}
                                            />
                                        )}
                                    </div>
                                </DetailRow>

                                <DetailRow icon={Tags} label="Category">
                                    <span className="break-words text-sm font-medium text-black min-[1280px]:max-[1535px]:text-[13px]">
                                        {ticketDetails.category || "-"}
                                    </span>
                                </DetailRow>
                            </>
                        )}

                        <DetailRow icon={Users} label="Affected Scope">
                            <span className="break-words text-sm font-medium capitalize text-black min-[1280px]:max-[1535px]:text-[13px]">
                                {ticketDetails.affected_scope || "-"}
                            </span>
                        </DetailRow>

                        <DetailRow icon={History} label="Last Updated">
                            <span className="block whitespace-nowrap text-sm font-medium text-black min-[1280px]:max-[1535px]:text-[13px]">
                                {formatDate(ticketDetails.updated_at)}
                            </span>
                        </DetailRow>

                        <DetailRow icon={CalendarDays} label="Submitted at">
                            <span className="block whitespace-nowrap text-sm font-medium text-black min-[1280px]:max-[1535px]:text-[13px]">
                                {formatDate(ticketDetails.created_at)}
                            </span>
                        </DetailRow>

                        {/* Assigned To */}
                        <DetailRow icon={UserRound} label="Assigned to">
                            {ticketDetails.assigned_to ? (
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-black min-[1280px]:max-[1535px]:text-[13px]">
                                        {assignedName}
                                    </p>

                                    <p className="break-words text-xs leading-4 text-gray-500">
                                        {assignedRole}
                                    </p>
                                </div>
                            ) : (
                                <span className="whitespace-nowrap text-sm font-medium text-gray-500 min-[1280px]:max-[1535px]:text-[13px]">
                                    Unassigned
                                </span>
                            )}
                        </DetailRow>

                        <DetailRow icon={Wrench} label="SLA Deadline">
                            <span className="block whitespace-nowrap text-sm font-medium text-black min-[1280px]:max-[1535px]:text-[13px]">
                                {formatDate(ticketDetails.resolution_deadline)}
                            </span>
                        </DetailRow>

                        <DetailRow icon={CircleAlert} label="SLA Status">
                            <SLAStatusBadge
                                status={ticketDetails.resolution_sla_status}
                            />
                        </DetailRow>

                    </div>
                </div>

                {/* Requester Information */}
                <div className="border-t border-gray-200 p-4 sm:p-5 min-[1280px]:max-[1535px]:p-4">
                    <div className="mb-4 flex items-center gap-2 min-[1280px]:max-[1535px]:mb-3">
                        <SquareUserRound
                            size={20}
                            className="shrink-0 text-[#2563EB] min-[1280px]:max-[1535px]:size-[18px]"
                        />

                        <p className="font-semibold text-black min-[1280px]:max-[1535px]:text-[13px]">
                            Requester Information
                        </p>
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-white p-4 min-[1280px]:max-[1535px]:p-3">

                        {/* Requester Header */}
                        <div className="flex flex-col gap-4 sm:grid sm:grid-cols-[minmax(0,1fr)_100px] sm:items-start min-[1280px]:max-[1535px]:gap-3 2xl:grid-cols-[minmax(0,1fr)_140px] 2xl:gap-4">
                            <div className="flex min-w-0 items-center gap-3">
                                <RequesterAvatar name={requesterName} />

                                <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-black min-[1280px]:max-[1535px]:text-[13px]">
                                        {requesterName}
                                    </p>

                                    <p className="mt-0.5 text-xs text-gray-500">
                                        Employee
                                    </p>
                                </div>
                            </div>

                            <div className="min-w-0">
                                <p className="mb-1 text-xs text-gray-500">
                                    Employee ID
                                </p>

                                <p className="break-words text-sm font-medium text-black min-[1280px]:max-[1535px]:text-[13px]">
                                    {ticketDetails.user_code || "-"}
                                </p>
                            </div>
                        </div>

                        <div className="my-4 border-t border-gray-200 min-[1280px]:max-[1535px]:my-3" />

                        {/* Requester Details */}
                        <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2 min-[1280px]:max-[1535px]:gap-x-4 min-[1280px]:max-[1535px]:gap-y-3">
                            <RequesterField
                                label="Department"
                                value={ticketDetails.employee_department}
                            />

                            <RequesterField
                                label="Office Location"
                                value={ticketDetails.office_location}
                            />

                            <RequesterField
                                label="Workstation"
                                value={ticketDetails.workstation}
                            />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

function DetailRow({ icon: Icon, label, children }) {
    return (
        <div className="grid grid-cols-[120px_minmax(0,1fr)] items-start gap-2 sm:grid-cols-[135px_minmax(0,1fr)] sm:gap-3 lg:grid-cols-[145px_minmax(0,1fr)] xl:grid-cols-[130px_minmax(0,1fr)] xl:gap-0 2xl:grid-cols-[180px_minmax(0,1fr)] 2xl:gap-3">
            <div className="flex min-w-0 items-center gap-2 sm:gap-2 xl:gap-1.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#4C4CF9] min-[1280px]:max-[1535px]:h-6 min-[1280px]:max-[1535px]:w-6">
                    <Icon
                        size={17}
                        className="text-white min-[1280px]:max-[1535px]:size-[15px]"
                    />
                </div>

                <span className="truncate text-sm text-gray-500 min-[1280px]:max-[1535px]:text-[12px]">
                    {label}
                </span>
            </div>

            <div className="min-w-0 break-words">
                {children}
            </div>
        </div>
    );
}

function SLAStatusBadge({ status }) {
    const normalizedStatus = String(status || "").toUpperCase();

    const statusStyles = {
        SAFE: "border border-green-200 bg-green-50 text-green-700",
        WARNING: "border border-yellow-200 bg-yellow-50 text-yellow-700",
        CRITICAL: "border border-orange-200 bg-orange-50 text-orange-700",
        BREACHED: "border border-red-200 bg-red-50 text-red-700",
        MET: "border border-blue-200 bg-blue-50 text-blue-700",
    };

    const statusLabels = {
        SAFE: "Safe",
        WARNING: "Warning",
        CRITICAL: "Critical",
        BREACHED: "Breached",
        MET: "Met",
    };

    if (!normalizedStatus) {
        return (
            <span className="text-sm font-medium text-gray-500 min-[1280px]:max-[1535px]:text-[13px]">
                -
            </span>
        );
    }

    return (
        <span
            className={`inline-flex whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-semibold ${statusStyles[normalizedStatus] || "border border-gray-300 bg-gray-100 text-gray-700"}`}
        >
            {statusLabels[normalizedStatus] || normalizedStatus}
        </span>
    );
}

function RequesterAvatar({ name }) {
    const initials = getInitials(name);

    return (
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#4C4CF9]/10 text-sm font-semibold text-[#4C4CF9] min-[1280px]:max-[1535px]:h-10 min-[1280px]:max-[1535px]:w-10 min-[1280px]:max-[1535px]:text-xs">
            {initials}
        </div>
    );
}

function RequesterField({ label, value }) {
    return (
        <div className="min-w-0">
            <p className="mb-1 text-xs text-gray-500">
                {label}
            </p>

            <p className="break-words text-sm font-medium text-black min-[1280px]:max-[1535px]:text-[13px]">
                {value || "-"}
            </p>
        </div>
    );
}

function EditButton({ label, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={label}
            title={label}
            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md border border-gray-300 bg-white text-gray-600 transition-colors hover:border-gray-400 hover:bg-gray-50 hover:text-black min-[1280px]:max-[1535px]:h-7 min-[1280px]:max-[1535px]:w-7"
        >
            <Pencil
                size={15}
                className="min-[1280px]:max-[1535px]:size-[14px]"
            />
        </button>
    );
}

function getInitials(name) {
    if (!name || name === "Unassigned") {
        return "?";
    }

    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("");
}