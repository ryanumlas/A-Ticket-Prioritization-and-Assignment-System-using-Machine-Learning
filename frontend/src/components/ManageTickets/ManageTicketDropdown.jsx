import { useEffect, useRef, useState } from "react";
import {
    SlidersHorizontal,
    ChevronDown,
    ArrowUpDown,
    Undo2,
    Users,
    ArrowUp,
} from "lucide-react";

export default function ManageTicketDropdown({ onPriorityRequest, onReturnTicket, onRequestAssistance }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleAction = (action) => {
        console.log("Selected manage ticket action:", action);

        // Close dropdown after selecting an action
        setIsOpen(false);

        // We will connect the modals here later.
    };

    return (
        <div
            ref={dropdownRef}
            className="relative"
        >
            {/* MANAGE TICKET BUTTON */}
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className="flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-[#4C4CF9] px-3.5 text-sm font-medium text-white transition-colors hover:bg-[#3a3ae0] focus:outline-none focus:ring-2 focus:ring-[#4C4CF9]/50"
            >
                Manage Ticket

                <SlidersHorizontal size={16} />
            </button>

            {/* DROPDOWN */}
            {isOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-[280px] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">

                    {/* HEADER */}
                    <div className="border-b border-gray-200 px-4 py-3">
                        <p className="text-sm font-semibold text-black">
                            Manage Ticket
                        </p>

                        <p className="mt-0.5 text-xs text-gray-500">
                            Select an action for this ticket.
                        </p>
                    </div>

                    {/* ACTIONS */}
                    <div className="p-1.5">

                        {/* REQUEST PRIORITY CHANGE */}
                        <button
                            type="button"
                            onClick={() => {
                                setIsOpen(false);
                                onPriorityRequest?.();
                            }}
                            className="flex w-full items-start gap-3 rounded-md px-3 py-2.5 text-left transition-colors hover:bg-gray-50 cursor-pointer"
                        >
                            <ArrowUpDown
                                size={18}
                                className="mt-0.5 shrink-0 text-gray-500"
                            />

                            <div className="min-w-0">
                                <p className="text-sm font-medium text-black">
                                    Request Priority Change
                                </p>

                                <p className="mt-0.5 text-xs leading-4 text-gray-500">
                                    Request a review of the ticket priority.
                                </p>
                            </div>
                        </button>

                        {/* RETURN TO SERVICE DESK */}
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                onReturnTicket?.();
                            }}
                            className="flex w-full items-start gap-3 rounded-md px-3 py-2.5 text-left transition-colors hover:bg-gray-50 cursor-pointer"
                        >
                            <Undo2
                                size={18}
                                className="mt-0.5 shrink-0 text-gray-500"
                            />

                            <div className="min-w-0">
                                <p className="text-sm font-medium text-black">
                                    Return to Service Desk
                                </p>

                                <p className="mt-0.5 text-xs leading-4 text-gray-500">
                                    Return an incorrectly routed ticket.
                                </p>
                            </div>
                        </button>

                        {/* REQUEST ASSISTANCE */}
                        <button
                            type="button"
                            onClick={() => {
                                setIsOpen(false);
                                onRequestAssistance?.();
                            }}
                            className="flex w-full items-start gap-3 rounded-md px-3 py-2.5 text-left transition-colors hover:bg-gray-50 cursor-pointer"
                        >
                            <Users
                                size={18}
                                className="mt-0.5 shrink-0 text-gray-500"
                            />

                            <div className="min-w-0">
                                <p className="text-sm font-medium text-black">
                                    Request Assistance
                                </p>

                                <p className="mt-0.5 text-xs leading-4 text-gray-500">
                                    Ask another technician for support.
                                </p>
                            </div>
                        </button>

                        {/* DIVIDER */}
                        <div className="my-1 border-t border-gray-200" />

                        {/* ESCALATE */}
                        <button
                            type="button"
                            onClick={() =>
                                handleAction("escalate")
                            }
                            className="flex w-full items-start gap-3 rounded-md px-3 py-2.5 text-left transition-colors hover:bg-gray-50 cursor-pointer"
                        >
                            <ArrowUp
                                size={18}
                                className="mt-0.5 shrink-0 text-gray-500"
                            />

                            <div className="min-w-0">
                                <p className="text-sm font-medium text-black">
                                    Escalate Ticket
                                </p>

                                <p className="mt-0.5 text-xs leading-4 text-gray-500">
                                    Escalate for higher-level intervention.
                                </p>
                            </div>
                        </button>

                    </div>
                </div>
            )}
        </div>
    );
}