import {
    TriangleAlert,
    CircleX,
    ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function TicketNeedingAttention() {
    const navigate = useNavigate();

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
                    badge: "border-amber-200 bg-amber-50 text-amber-700",
                };

            case "Critical":
                return {
                    icon: TriangleAlert,
                    iconBg: "bg-orange-50",
                    iconColor: "text-orange-600",
                    badge: "border-orange-200 bg-orange-50 text-orange-700",
                };

            case "Breached":
                return {
                    icon: CircleX,
                    iconBg: "bg-red-50",
                    iconColor: "text-red-600",
                    badge: "border-red-200 bg-red-50 text-red-700",
                };

            default:
                return {
                    icon: TriangleAlert,
                    iconBg: "bg-gray-100",
                    iconColor: "text-gray-500",
                    badge: "border-gray-200 bg-gray-100 text-gray-700",
                };
        }
    };

    return (
        <div className="h-fit w-full overflow-hidden rounded-xl border border-gray-300 bg-white">
            {/* HEADER */}
            <div
                className="
                    border-b
                    border-gray-300
                    px-4
                    py-4

                    min-[1280px]:max-[1365px]:px-4
                    min-[1280px]:max-[1365px]:py-3.5

                    min-[1366px]:max-[1537px]:px-4
                    min-[1366px]:max-[1537px]:py-4

                    min-[1538px]:px-5
                    min-[1538px]:py-5
                "
            >
                <h2
                    className="
                        text-[15px]
                        font-semibold
                        leading-tight
                        text-black

                        min-[1280px]:max-[1365px]:text-[15px]
                        min-[1366px]:max-[1537px]:text-[16px]
                        min-[1538px]:text-xl
                    "
                >
                    Tickets Needing Attention
                </h2>

                <p
                    className="
                        mt-1
                        text-[10px]
                        leading-tight
                        text-gray-500

                        min-[1280px]:max-[1365px]:text-[10px]
                        min-[1366px]:max-[1537px]:text-[11px]
                        min-[1538px]:text-sm
                    "
                >
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
                            className="
                                flex
                                items-center
                                gap-3
                                border-b
                                border-gray-200
                                px-4
                                py-5
                                last:border-b-0
                                hover:bg-gray-50

                                min-[1280px]:max-[1365px]:gap-3
                                min-[1280px]:max-[1365px]:px-4
                                min-[1280px]:max-[1365px]:py-4

                                min-[1366px]:max-[1537px]:gap-3
                                min-[1366px]:max-[1537px]:px-4
                                min-[1366px]:max-[1537px]:py-6

                                min-[1538px]:gap-4
                                min-[1538px]:px-5
                                min-[1538px]:py-6
                            "
                        >
                            {/* STATUS ICON */}
                            <div
                                className={`
                                    flex
                                    h-9
                                    w-9
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-lg

                                    min-[1280px]:max-[1365px]:h-8
                                    min-[1280px]:max-[1365px]:w-8

                                    min-[1366px]:max-[1537px]:h-9
                                    min-[1366px]:max-[1537px]:w-9

                                    min-[1538px]:h-10
                                    min-[1538px]:max-[1538px]:w-10

                                    ${style.iconBg}
                                `}
                            >
                                <StatusIcon
                                    className={style.iconColor}
                                    size={16}
                                />
                            </div>

                            {/* TICKET CONTENT */}
                            <div className="min-w-0 flex-1">
                                {/* TOP ROW */}
                                <div
                                    className="
                                        flex
                                        flex-wrap
                                        items-center
                                        gap-1.5
                                    "
                                >
                                    <p
                                        className="
                                            text-xs
                                            font-semibold
                                            leading-tight
                                            text-black

                                            min-[1280px]:max-[1365px]:text-[12px]
                                            min-[1366px]:max-[1537px]:text-[13px]
                                            min-[1538px]:text-base
                                        "
                                    >
                                        {ticket.ticket_code}
                                    </p>

                                    {/* PRIORITY */}
                                    <span
                                        className="
                                            rounded-md
                                            border
                                            border-gray-300
                                            bg-gray-50
                                            px-1.5
                                            py-0.5
                                            text-[9px]
                                            font-semibold
                                            leading-tight
                                            text-black

                                            min-[1280px]:max-[1365px]:text-[9px]
                                            min-[1366px]:max-[1537px]:text-[10px]
                                            min-[1538px]:px-2
                                            min-[1538px]:text-[11px]
                                        "
                                    >
                                        {ticket.priority}
                                    </span>

                                    {/* SLA STATUS */}
                                    <span
                                        className={`
                                            rounded-md
                                            border
                                            px-1.5
                                            py-0.5
                                            text-[9px]
                                            font-semibold
                                            leading-tight

                                            min-[1280px]:max-[1365px]:text-[9px]
                                            min-[1366px]:max-[1537px]:text-[10px]
                                            min-[1538px]:px-2
                                            min-[1538px]:text-[11px]

                                            ${style.badge}
                                        `}
                                    >
                                        {ticket.sla_status}
                                    </span>
                                </div>

                                {/* SUBJECT */}
                                <p
                                    className="
                                        mt-1
                                        truncate
                                        text-[10px]
                                        leading-tight
                                        text-black

                                        min-[1280px]:max-[1365px]:text-[10px]
                                        min-[1366px]:max-[1537px]:text-[11px]
                                        min-[1538px]:text-sm
                                    "
                                >
                                    {ticket.subject}
                                </p>

                                {/* SLA INFO */}
                                <div
                                    className="
                                        mt-1
                                        flex
                                        flex-wrap
                                        items-center
                                        gap-1.5
                                        text-[9px]
                                        leading-tight
                                        text-gray-500

                                        min-[1280px]:max-[1365px]:text-[9px]
                                        min-[1366px]:max-[1537px]:text-[10px]
                                        min-[1538px]:gap-2
                                        min-[1538px]:text-xs
                                    "
                                >
                                    <span>{ticket.sla_type}</span>

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
                                onClick={() =>
                                    navigate(`/ticket/${ticket.id}`)
                                }
                                className="
                                    flex
                                    shrink-0
                                    cursor-pointer
                                    items-center
                                    justify-center
                                    gap-1.5
                                    rounded-md
                                    bg-[#4C4CF9]
                                    px-2.5
                                    py-1.5
                                    text-[10px]
                                    font-medium
                                    text-white
                                    transition
                                    hover:bg-[#3f3fe6]

                                    min-[1280px]:max-[1365px]:gap-1.5
                                    min-[1280px]:max-[1365px]:px-2.5
                                    min-[1280px]:max-[1365px]:py-1.5
                                    min-[1280px]:max-[1365px]:text-[10px]

                                    min-[1366px]:max-[1537px]:gap-1.5
                                    min-[1366px]:max-[1537px]:px-3
                                    min-[1366px]:max-[1537px]:py-2
                                    min-[1366px]:max-[1537px]:text-[11px]

                                    min-[1538px]:gap-2
                                    min-[1538px]:px-4
                                    min-[1538px]:py-2
                                    min-[1538px]:text-sm
                                "
                            >
                                View Ticket

                                <ArrowRight
                                    className="
                                        h-3
                                        w-3

                                        min-[1366px]:max-[1537px]:h-3.5
                                        min-[1366px]:max-[1537px]:w-3.5

                                        min-[1538px]:h-[15px]
                                        min-[1538px]:w-[15px]
                                    "
                                />
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}