import {
    History,
    CircleCheck,
    UserCheck,
    Clock3,
} from "lucide-react";

export default function RightSidePanel() {
    return (
        <div className="flex h-full w-[350px] shrink-0 flex-col border-l border-gray-300 bg-white">

            {/* HEADER */}
            <div className="shrink-0 border-b border-gray-200 p-5">
                <div className="flex items-center gap-2">
                    <History
                        size={20}
                        className="text-gray-500"
                    />

                    <p className="font-semibold text-black">
                        Status History
                    </p>
                </div>

                <p className="mt-1 text-xs text-gray-500">
                    Track the progress of your ticket.
                </p>
            </div>

            {/* CURRENT STATUS */}
            <div className="shrink-0 border-b border-gray-200 p-5">
                <p className="text-xs font-medium uppercase text-gray-500">
                    Current Status
                </p>

                <div className="mt-2">
                    <span className="inline-flex rounded-md border border-green-300 bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                        Resolved
                    </span>
                </div>

                <p className="mt-2 text-xs text-gray-500">
                    Last updated Sep 1, 2026 • 10:45 AM
                </p>
            </div>

            {/* TIMELINE */}
            <div
                className="
                    min-h-0 flex-1 overflow-y-auto p-5
                    [&::-webkit-scrollbar]:w-1
                    [&::-webkit-scrollbar-track]:bg-transparent
                    [&::-webkit-scrollbar-thumb]:rounded-full
                    [&::-webkit-scrollbar-thumb]:bg-transparent
                    hover:[&::-webkit-scrollbar-thumb]:bg-gray-300
                "
            >
                <div className="relative">

                    {/* CONNECTING LINE */}
                    <div className="absolute bottom-5 left-[15px] top-5 w-px bg-gray-200" />

                    {/* SUBMITTED */}
                    <TimelineItem
                        icon={CircleCheck}
                        title="Ticket Submitted"
                        description="Your ticket was successfully submitted."
                        date="Sep 1, 2026"
                        time="10:24 AM"
                        active
                    />

                    {/* ASSIGNED */}
                    <TimelineItem
                        icon={UserCheck}
                        title="Assigned to IT Support"
                        description="Your ticket was assigned to an IT support specialist."
                        date="Sep 1, 2026"
                        time="10:32 AM"
                        active
                    />

                    {/* IN PROGRESS */}
                    <TimelineItem
                        icon={Clock3}
                        title="In Progress"
                        description="IT Support started working on your ticket."
                        date="Sep 1, 2026"
                        time="10:45 AM"
                        active
                    />

                    {/* RESOLVED */}
                    <TimelineItem
                        icon={CircleCheck}
                        title="Resolved"
                        description="The issue has been resolved."
                        date="Sep 1, 2026"
                        time="11:08 AM"
                        active
                    />

                </div>
            </div>

        </div>
    );
}


function TimelineItem({
    icon: Icon,
    title,
    description,
    date,
    time,
    active = false,
}) {
    return (
        <div className="relative flex gap-3 pb-7 last:pb-0">

            {/* TIMELINE ICON */}
            <div
                className={`relative z-10 flex h-[31px] w-[31px] shrink-0 items-center justify-center rounded-full border ${
                    active
                        ? "border-gray-300 bg-white text-black"
                        : "border-gray-200 bg-gray-50 text-gray-400"
                }`}
            >
                <Icon size={15} />
            </div>

            {/* CONTENT */}
            <div className="min-w-0 pt-0.5">

                <p
                    className={`text-sm font-semibold ${
                        active
                            ? "text-black"
                            : "text-gray-400"
                    }`}
                >
                    {title}
                </p>

                <p
                    className={`mt-1 text-xs leading-5 ${
                        active
                            ? "text-gray-500"
                            : "text-gray-400"
                    }`}
                >
                    {description}
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-x-1 text-[11px] text-gray-400">
                    <span>{date}</span>

                    {time && (
                        <>
                            <span>•</span>
                            <span>{time}</span>
                        </>
                    )}
                </div>

            </div>

        </div>
    );
}