import { useEffect, useRef, useState } from "react";
import {
    SlidersHorizontal,
    ArrowUpDown,
    Undo2,
    Users,
    ArrowUp,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

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

    const menuItems = [
        {
            label: "Request Priority Change",
            description: "Request a review of the ticket priority.",
            icon: ArrowUpDown,
            onClick: onPriorityRequest,
        },
        {
            label: "Return to Service Desk",
            description: "Return an incorrectly routed ticket.",
            icon: Undo2,
            onClick: onReturnTicket,
        },
        {
            label: "Request Assistance",
            description: "Ask another technician for support.",
            icon: Users,
            onClick: onRequestAssistance,
        },
    ];

    const handleAction = (callback) => {
        setIsOpen(false);
        callback?.();
    };

    return (
        <div
            ref={dropdownRef}
            className="relative"
        >
            {/* Manage Ticket Button */}
            <motion.button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                whileTap={{ scale: 0.97 }}
                className="flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-[#2563EB] bg-[#2563EB] px-3.5 text-sm font-medium text-white transition-colors hover:bg-[#1D4ED8] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 min-[1280px]:max-[1535px]:h-8 min-[1280px]:max-[1535px]:gap-1.5 min-[1280px]:max-[1535px]:rounded-md min-[1280px]:max-[1535px]:px-3 min-[1280px]:max-[1535px]:text-[13px]"
            >
                Manage Ticket

                <motion.div
                    animate={{
                        rotate: isOpen ? 90 : 0,
                    }}
                    transition={{
                        duration: 0.2,
                        ease: "easeOut",
                    }}
                >
                    <SlidersHorizontal
                        size={16}
                        className="min-[1280px]:max-[1535px]:h-[14px] min-[1280px]:max-[1535px]:w-[14px]"
                    />
                </motion.div>
            </motion.button>

            {/* Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{
                            opacity: 0,
                            y: -8,
                            scale: 0.97,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                            scale: 1,
                        }}
                        exit={{
                            opacity: 0,
                            y: -6,
                            scale: 0.98,
                        }}
                        transition={{
                            duration: 0.18,
                            ease: [0.22, 1, 0.36, 1],
                        }}
                        style={{
                            transformOrigin: "top right",
                        }}
                        className="absolute right-0 top-full z-50 mt-2 w-[280px] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg"
                    >
                        {/* Header */}
                        <motion.div
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                delay: 0.03,
                                duration: 0.15,
                            }}
                            className="border-b border-gray-200 px-4 py-3"
                        >
                            <p className="text-sm font-semibold text-black">
                                Manage Ticket
                            </p>

                            <p className="mt-0.5 text-xs text-gray-500">
                                Select an action for this ticket.
                            </p>
                        </motion.div>

                        <div className="p-1.5">
                            {menuItems.map((item, index) => {
                                const Icon = item.icon;

                                return (
                                    <motion.button
                                        key={item.label}
                                        type="button"
                                        initial={{
                                            opacity: 0,
                                            x: 8,
                                        }}
                                        animate={{
                                            opacity: 1,
                                            x: 0,
                                        }}
                                        transition={{
                                            delay: 0.04 + index * 0.035,
                                            duration: 0.16,
                                            ease: "easeOut",
                                        }}
                                        whileHover={{
                                            x: 2,
                                        }}
                                        whileTap={{
                                            scale: 0.985,
                                        }}
                                        onClick={() =>
                                            handleAction(item.onClick)
                                        }
                                        className="flex w-full cursor-pointer items-start gap-3 rounded-md px-3 py-2.5 text-left transition-colors hover:bg-gray-50"
                                    >
                                        <Icon
                                            size={18}
                                            className="mt-0.5 shrink-0 text-gray-500"
                                        />

                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-black">
                                                {item.label}
                                            </p>

                                            <p className="mt-0.5 text-xs leading-4 text-gray-500">
                                                {item.description}
                                            </p>
                                        </div>
                                    </motion.button>
                                );
                            })}

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.14 }}
                                className="my-1 border-t border-gray-200"
                            />

                            {/* Escalate Ticket */}
                            <motion.button
                                type="button"
                                initial={{
                                    opacity: 0,
                                    x: 8,
                                }}
                                animate={{
                                    opacity: 1,
                                    x: 0,
                                }}
                                transition={{
                                    delay: 0.15,
                                    duration: 0.16,
                                    ease: "easeOut",
                                }}
                                whileHover={{
                                    x: 2,
                                }}
                                whileTap={{
                                    scale: 0.985,
                                }}
                                onClick={() =>
                                    handleAction(onEscalateTicket)
                                }
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
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}