import {
    Ticket,
    CalendarDays,
    Users,
    Clock3,
    ArrowRight
} from "lucide-react";

export default function CurrentTicket() {
    const status = "Open";

    const statusColor = {
        Open: "bg-blue-100 text-blue-700 border border-blue-300",
        "In Progress": "bg-yellow-100 text-yellow-700 border border-yellow-300",
        "Under Review": "bg-purple-100 text-purple-700 border border-purple-300",
        Returned: "bg-orange-100 text-orange-700 border border-orange-300",
        Resolved: "bg-green-100 text-green-700 border border-green-300",
        Closed: "bg-gray-100 text-gray-700 border border-gray-300",
    };

    return (
        <div className="bg-white border border-gray-300 rounded-lg p-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                    Current Active Ticket
                </h2>

                <span
                    className={`px-3 py-1 rounded-md text-xs font-semibold ${statusColor[status]}`}
                >
                    {status}
                </span>
            </div>

            <h3 className="mt-5 text-xl font-semibold text-gray-900">
                My computer won't turn on
            </h3>
            
            <div className="grid grid-cols-2 gap-y-4 gap-x-8 mt-6 text-sm">

                <div className="flex items-center gap-2 text-gray-600">
                    <Ticket size={16} />
                    <span>TKT-00001</span>
                </div>

                <div className="flex items-center gap-2 text-gray-600">
                    <Users size={16} />
                    <span>Ryan Umlas</span>
                </div>

                <div className="flex items-center gap-2 text-gray-600">
                    <CalendarDays size={16} />
                    <span>Created: Jul 25, 2026</span>
                </div>

                <div className="flex items-center gap-2 text-gray-600">
                    <Clock3 size={16} />
                    <span>Deadline: Jul 27, 2026</span>
                </div>

            </div>

            <div className="flex justify-end mt-6">
                <button className="flex items-center gap-2 bg-[#4C4CF9] hover:bg-[#3f3fe3] transition text-white px-5 py-2 rounded-lg font-medium">
                    View Ticket
                    <ArrowRight size={16} />
                </button>
            </div>
        </div>
    );
}