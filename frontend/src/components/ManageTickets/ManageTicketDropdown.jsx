import { useEffect, useRef, useState } from "react";
import {
    SlidersHorizontal,
    ArrowUpDown,
    Undo2,
    Users,
    ArrowUp,
    Sparkles,
} from "lucide-react";

export default function ManageTicketDropdown({
    onPriorityRequest,
    onReturnTicket,
    onRequestAssistance,
    onEscalateTicket,
    onAutomated,
}) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

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
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };
    }, []);

    return (
        <div
            ref={dropdownRef}
            className="relative"
        >
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className="flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-[#2563EB] bg-[#2563EB] px-3.5 text-sm font-medium text-white transition-colors hover:bg-[#1D4ED8] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30"
            >
                Manage Ticket

                <SlidersHorizontal size={16} />
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-[280px] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
                    <div className="border-b border-gray-200 px-4 py-3">
                        <p className="text-sm font-semibold text-black">
                            Manage Ticket
                        </p>

                        <p className="mt-0.5 text-xs text-gray-500">
                            Select an action for this ticket.
                        </p>
                    </div>

                    <div className="p-1.5">
                        <button
                            type="button"
                            onClick={() => {
                                setIsOpen(false);
                                onPriorityRequest?.();
                            }}
                            className="flex w-full cursor-pointer items-start gap-3 rounded-md px-3 py-2.5 text-left transition-colors hover:bg-gray-50"
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

                        <button
                            type="button"
                            onClick={() => {
                                setIsOpen(false);
                                onReturnTicket?.();
                            }}
                            className="flex w-full cursor-pointer items-start gap-3 rounded-md px-3 py-2.5 text-left transition-colors hover:bg-gray-50"
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

                        <button
                            type="button"
                            onClick={() => {
                                setIsOpen(false);
                                onRequestAssistance?.();
                            }}
                            className="flex w-full cursor-pointer items-start gap-3 rounded-md px-3 py-2.5 text-left transition-colors hover:bg-gray-50"
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


                        <div className="my-1 border-t border-gray-200" />

                        <button
                            type="button"
                            onClick={() => {
                                setIsOpen(false);
                                onEscalateTicket?.();
                            }}
                            className="flex w-full cursor-pointer items-start gap-3 rounded-md px-3 py-2.5 text-left transition-colors hover:bg-gray-50"
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