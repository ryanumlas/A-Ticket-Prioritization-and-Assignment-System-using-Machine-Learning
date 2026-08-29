import {
    TriangleAlert,
    CircleX,
    ArrowRight,
} from "lucide-react";

export default function TicketNeedingAttention() {
    const tickets = [
        {
            id: 31,
            ticket_code: "TKT-0031",
            subject: "Unable to connect to company network",
            priority: "P1",
            sla_type: "Resolution SLA",
            sla_status: "Critical",
            remaining: "18m remaining",
        },
        {
            id: 28,
            ticket_code: "TKT-0028",
            subject: "Application frequently stops responding",
            priority: "P2",
            sla_type: "Response SLA",
            sla_status: "Warning",
            remaining: "25m remaining",
        },
        {
            id: 22,
            ticket_code: "TKT-0022",
            subject: "Shared drive access issue",
            priority: "P1",
            sla_type: "Resolution SLA",
            sla_status: "Breached",
            remaining: "12m overdue",
        },
    ];

    const statusStyle = (status) => {
        switch (status) {
            case "Warning":
                return {
                    icon: TriangleAlert,
                    iconBg: "bg-amber-50",
                    iconColor: "text-amber-600",
                    badge: "bg-amber-50 text-amber-700 border-amber-200",
                };

            case "Critical":
                return {
                    icon: TriangleAlert,
                    iconBg: "bg-orange-50",
                    iconColor: "text-orange-600",
                    badge: "bg-orange-50 text-orange-700 border-orange-200",
                };

            case "Breached":
                return {
                    icon: CircleX,
                    iconBg: "bg-red-50",
                    iconColor: "text-red-600",
                    badge: "bg-red-50 text-red-700 border-red-200",
                };

            default:
                return {
                    icon: TriangleAlert,
                    iconBg: "bg-gray-100",
                    iconColor: "text-gray-500",
                    badge: "bg-gray-100 text-gray-700 border-gray-200",
                };
        }
    };

    return (
        <div className="overflow-hidden rounded-xl border border-gray-300 bg-white">

            {/* HEADER */}
            <div className="border-b border-gray-300 px-5 py-4">
                <h2 className="text-xl font-semibold text-black">
                    Tickets Needing Attention
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                    Assigned tickets approaching or exceeding SLA deadlines.
                </p>
            </div>

            {/* LIST */}
            <div>
                {tickets.map((ticket) => {
                    const style = statusStyle(ticket.sla_status);
                    const StatusIcon = style.icon;

                    return (
                        <div
                            key={ticket.id}
                            className="flex items-center gap-4 border-b border-gray-200 px-5 py-4 last:border-b-0 hover:bg-gray-50"
                        >
                            {/* STATUS ICON */}
                            <div
                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${style.iconBg}`}
                            >
                                <StatusIcon
                                    size={18}
                                    className={style.iconColor}
                                />
                            </div>

                            {/* TICKET */}
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-3">

                                    <p className="font-semibold text-black">
                                        {ticket.ticket_code}
                                    </p>

                                    <span className="rounded-md border border-gray-300 bg-gray-50 px-2 py-0.5 text-[11px] font-semibold text-black">
                                        {ticket.priority}
                                    </span>

                                    <span
                                        className={`rounded-md border px-2 py-0.5 text-[11px] font-semibold ${style.badge}`}
                                    >
                                        {ticket.sla_status}
                                    </span>

                                </div>

                                <p className="mt-1 truncate text-sm text-black">
                                    {ticket.subject}
                                </p>

                                <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                                    <span>
                                        {ticket.sla_type}
                                    </span>

                                    <span>•</span>

                                    <span
                                        className={
                                            ticket.sla_status === "Breached"
                                                ? "font-medium text-red-600"
                                                : "font-medium text-black"
                                        }
                                    >
                                        {ticket.remaining}
                                    </span>
                                </div>
                            </div>

                            {/* ACTION */}
                            <button
                                type="button"
                                className="flex shrink-0 cursor-pointer items-center gap-2 rounded-md border border-gray-300 bg-[#4C4CF9] text-white px-4 py-2 text-sm transition hover:bg-[#3f3fe6]"
                            >
                                View Ticket
                                <ArrowRight size={15} />
                            </button>
                        </div>
                    );
                })}
            </div>

        </div>
    );
}