import {
    History,
    CircleCheck,
    UserCheck,
    Clock3,
    ChevronDown,
} from "lucide-react";

import { useState } from "react";

export default function RightSidePanel() {
    const [status, setStatus] = useState("Resolved");

    return (
        <div className="flex h-full w-[350px] shrink-0 flex-col border-l border-gray-300 bg-white">

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
                    Track and manage the progress of this ticket.
                </p>
            </div>

            <div className="shrink-0 border-b border-gray-200 p-5">
                <p className="text-xs font-medium uppercase text-gray-500">
                    Current Status
                </p>

                <div className="relative mt-2">
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="
                            w-full appearance-none rounded-lg
                            border border-gray-300 bg-white
                            px-3 py-2.5 pr-10
                            text-sm font-medium text-black
                            outline-none transition-colors
                            focus:border-[#4C4CF9]
                            focus:ring-2 focus:ring-[#4C4CF9]/10
                        "
                    >
                        <option value="Open">
                            Open
                        </option>

                        <option value="In Progress">
                            In Progress
                        </option>

                        <option value="Resolved">
                            Resolved
                        </option>

                        <option value="Closed">
                            Closed
                        </option>
                    </select>

                    <ChevronDown
                        size={16}
                        className="
                            pointer-events-none absolute
                            right-3 top-1/2
                            -translate-y-1/2 text-gray-400
                        "
                    />
                </div>

                <p className="mt-2 text-xs text-gray-500">
                    Last updated Sep 1, 2026 • 10:45 AM
                </p>
            </div>

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

                    <div className="absolute bottom-5 left-[15px] top-5 w-px bg-[#4C4CF9]" />

                    <TimelineItem
                        icon={CircleCheck}
                        title="Ticket Submitted"
                        description="Your ticket was successfully submitted."
                        date="Sep 1, 2026"
                        time="10:24 AM"
                        active
                    />

                    <TimelineItem
                        icon={UserCheck}
                        title="Assigned to IT Support"
                        description="Your ticket was assigned to an IT support specialist."
                        date="Sep 1, 2026"
                        time="10:32 AM"
                        active
                    />

                    <TimelineItem
                        icon={Clock3}
                        title="In Progress"
                        description="IT Support started working on your ticket."
                        date="Sep 1, 2026"
                        time="10:45 AM"
                        active
                    />

                    <TimelineItem
                        icon={CircleCheck}
                        title="Resolved"
                        description="The issue has been resolved."
                        date="Sep 1, 2026"
                        time="11:08 AM"
                        active
                        current
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
    current = false,
}) {
    return (
        <div className="relative flex gap-3 pb-7 last:pb-0">

            <div
                className={`
                    relative z-10 flex h-[31px] w-[31px] shrink-0
                    items-center justify-center rounded-full border
                    ${
                        active
                            ? "border-[#4C4CF9] bg-[#4C4CF9] text-white"
                            : "border-gray-200 bg-white text-gray-400"
                    }
                    ${
                        current
                            ? "ring-4 ring-[#4C4CF9]/15"
                            : ""
                    }
                `}
            >
                <Icon size={15} strokeWidth={2.2} />
            </div>

            <div className="min-w-0 pt-0.5">

                <div className="flex items-center gap-2">
                    <p
                        className={`text-sm font-semibold ${
                            active
                                ? "text-black"
                                : "text-gray-400"
                        }`}
                    >
                        {title}
                    </p>

                    {current && (
                        <span className="rounded-full bg-[#4C4CF9]/10 px-2 py-0.5 text-[10px] font-medium text-[#4C4CF9]">
                            Current
                        </span>
                    )}
                </div>

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