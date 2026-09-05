import {
    CircleUserRound,
    Tag,
    ShieldCheck,
    Users,
    Building2,
    UserRoundCheck,
    Clock3,
    CircleDot,
} from "lucide-react";

import { getCurrentUser } from "../utils/auth";

export default function QueueTicketDetails({ ticketDetails }) {
    const user = getCurrentUser();

    const isUnassigned = !ticketDetails?.assigned_to;

    return (
        <div className="flex h-[830px] w-full flex-col overflow-hidden rounded-xl border border-gray-300 bg-white">

            <div className="flex items-start justify-between border-b border-gray-300 px-5 py-4">
                <div>
                    <div className="mb-1 flex items-center gap-2">
                        <span className="text-sm font-semibold text-[#4C4CF9]">
                            {ticketDetails.ticket_code}
                        </span>

                        <span className="text-gray-300">
                            •
                        </span>

                        <span className="text-sm text-gray-500">
                            Ticket Queue
                        </span>
                    </div>

                    <h1 className="text-lg font-semibold text-black">
                        {ticketDetails.subject}
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Review ticket information, classification, assignment, and current status.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <span className="rounded-md border border-gray-300 bg-gray-50 px-3 py-1.5 text-sm font-medium text-gray-700">
                        {ticketDetails.status}
                    </span>

                    {isUnassigned && (
                        <button
                            type="button"
                            className="rounded-md bg-[#4C4CF9] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#4141df]"
                        >
                            Assign to Me
                        </button>
                    )}
                </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-5">

                <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.5fr_1fr]">

                    <div className="space-y-5">

                        <section className="rounded-lg border border-gray-300 bg-white">
                            <div className="border-b border-gray-200 px-5 py-4">
                                <h2 className="text-sm font-semibold text-black">
                                    Ticket Overview
                                </h2>

                                <p className="mt-1 text-xs text-gray-500">
                                    Request details submitted by the employee.
                                </p>
                            </div>

                            <div className="space-y-5 p-5">

                                <div>
                                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
                                        Description
                                    </p>

                                    <p className="text-sm leading-6 text-gray-800">
                                        {ticketDetails.description || "No description provided."}
                                    </p>
                                </div>

                                <div>
                                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
                                        Business Impact
                                    </p>

                                    <p className="text-sm leading-6 text-gray-800">
                                        {ticketDetails.business_impact || "No business impact provided."}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

                                    <DetailItem
                                        label="Affected Scope"
                                        value={ticketDetails.affected_scope}
                                    />

                                    <DetailItem
                                        label="Priority"
                                        value={ticketDetails.priority}
                                    />

                                    <DetailItem
                                        label="Status"
                                        value={ticketDetails.status}
                                    />

                                    <DetailItem
                                        label="Created At"
                                        value={formatDate(ticketDetails.created_at)}
                                    />

                                    <DetailItem
                                        label="Last Updated"
                                        value={formatDate(ticketDetails.updated_at)}
                                    />

                                    <DetailItem
                                        label="Workstation"
                                        value={ticketDetails.workstation}
                                    />

                                </div>

                            </div>
                        </section>

                        <section className="rounded-lg border border-gray-300 bg-white">
                            <div className="border-b border-gray-200 px-5 py-4">
                                <div className="flex items-center gap-2">
                                    <CircleUserRound
                                        size={17}
                                        className="text-[#4C4CF9]"
                                    />

                                    <h2 className="text-sm font-semibold text-black">
                                        Requester Information
                                    </h2>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-x-8 gap-y-5 p-5 sm:grid-cols-2 lg:grid-cols-3">

                                <DetailItem
                                    label="Name"
                                    value={`${ticketDetails.first_name || ""} ${ticketDetails.last_name || ""}`.trim()}
                                />

                                <DetailItem
                                    label="Employee ID"
                                    value={ticketDetails.user_code}
                                />

                                <DetailItem
                                    label="Department"
                                    value={ticketDetails.employee_department}
                                />

                                <DetailItem
                                    label="Office Location"
                                    value={ticketDetails.office_location}
                                />

                                <DetailItem
                                    label="Workstation"
                                    value={ticketDetails.workstation}
                                />

                            </div>
                        </section>

                    </div>

                    <div className="space-y-5">

                        <section className="rounded-lg border border-gray-300 bg-white">
                            <div className="border-b border-gray-200 px-5 py-4">
                                <div className="flex items-center gap-2">
                                    <Tag
                                        size={17}
                                        className="text-gray-500"
                                    />

                                    <h2 className="text-sm font-semibold text-black">
                                        Classification
                                    </h2>
                                </div>
                            </div>

                            <div className="space-y-4 p-5">

                                <InfoRow
                                    icon={Tag}
                                    label="Category"
                                    value={ticketDetails.category}
                                />

                                <InfoRow
                                    icon={CircleDot}
                                    label="Symptom Code"
                                    value={ticketDetails.symptom_code}
                                />

                                <InfoRow
                                    icon={ShieldCheck}
                                    label="Priority"
                                    value={ticketDetails.priority}
                                />

                                <InfoRow
                                    icon={Users}
                                    label="Required Specialization"
                                    value={ticketDetails.required_specialization}
                                />

                                <InfoRow
                                    icon={ShieldCheck}
                                    label="Classification Source"
                                    value={ticketDetails.classification_source}
                                />

                                <InfoRow
                                    icon={Clock3}
                                    label="Confidence"
                                    value={
                                        ticketDetails.classification_confidence !== null &&
                                        ticketDetails.classification_confidence !== undefined
                                            ? `${Math.round(
                                                  Number(
                                                      ticketDetails.classification_confidence
                                                  ) * 100
                                              )}%`
                                            : "—"
                                    }
                                />

                            </div>
                        </section>

                        <section className="rounded-lg border border-gray-300 bg-white">
                            <div className="border-b border-gray-200 px-5 py-4">
                                <div className="flex items-center gap-2">
                                    <UserRoundCheck
                                        size={17}
                                        className="text-gray-500"
                                    />

                                    <h2 className="text-sm font-semibold text-black">
                                        Assignment
                                    </h2>
                                </div>
                            </div>

                            <div className="space-y-4 p-5">

                                <InfoRow
                                    icon={UserRoundCheck}
                                    label="Assigned To"
                                    value={
                                        ticketDetails.assigned_to?.full_name ||
                                        "Unassigned"
                                    }
                                />

                                <InfoRow
                                    icon={Building2}
                                    label="IT Department"
                                    value={ticketDetails.it_department}
                                />

                                <InfoRow
                                    icon={Users}
                                    label="Required Specialization"
                                    value={ticketDetails.required_specialization}
                                />

                                <InfoRow
                                    icon={CircleDot}
                                    label="Current Status"
                                    value={ticketDetails.status}
                                />

                            </div>
                        </section>

                        <section className="rounded-lg border border-gray-300 bg-white">
                            <div className="border-b border-gray-200 px-5 py-4">
                                <div className="flex items-center gap-2">
                                    <Clock3
                                        size={17}
                                        className="text-gray-500"
                                    />

                                    <h2 className="text-sm font-semibold text-black">
                                        SLA Information
                                    </h2>
                                </div>
                            </div>

                            <div className="space-y-4 p-5">

                                <DetailItem
                                    label="Expected Response"
                                    value={formatDate(ticketDetails.response_deadline)}
                                />

                                <DetailItem
                                    label="Expected Resolution"
                                    value={formatDate(ticketDetails.resolution_deadline)}
                                />

                            </div>
                        </section>

                    </div>

                </div>

            </div>

        </div>
    );
}

function DetailItem({ label, value }) {
    return (
        <div>
            <p className="mb-1 text-xs font-medium text-gray-500">
                {label}
            </p>

            <p className="text-sm font-medium text-gray-900">
                {value || "—"}
            </p>
        </div>
    );
}

function InfoRow({ icon: Icon, label, value }) {
    return (
        <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#4C4CF9]">
                <Icon
                    size={15}
                    className="text-white"
                />
            </div>

            <div className="min-w-0">
                <p className="text-xs text-gray-500">
                    {label}
                </p>

                <p className="mt-0.5 break-words text-sm font-medium text-gray-900">
                    {value || "—"}
                </p>
            </div>
        </div>
    );
}

function formatDate(value) {
    if (!value) {
        return "—";
    }

    return new Date(value).toLocaleString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}