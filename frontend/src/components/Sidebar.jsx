import { useEffect, useState } from "react";
import { getCurrentUser } from "../utils/auth";
import { NavLink } from "react-router-dom";
import foundever_blue from "../assets/foundever_blue.jpeg";
import { sidebarItems } from "../configs/sideBarItems";
import api from "../api";
import {
    Headphones,
    Network,
    AppWindow,
    MonitorCog,
    Menu,
    X,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function Sidebar() {
    const user = getCurrentUser();

    const menus = sidebarItems[user.role] || [];

    const [unreadCount, setUnreadCount] = useState(0);
    const [pendingReturnCount, setPendingReturnCount] = useState(0);
    const [pendingPriorityCount, setPendingPriorityCount] = useState(0);
    const [departments, setDepartments] = useState([]);
    const [mobileOpen, setMobileOpen] = useState(false);

    const departmentIcons = {
        "Help Desk": Headphones,
        "Network & Infrastructure": Network,
        "Network & Infrastructure Support": Network,
        "Business Applications": AppWindow,
        "Business Applications Support": AppWindow,
        "Hardware Support": MonitorCog,
    };

    useEffect(() => {
        const fetchSidebarData = async () => {
            try {
                const notificationResponse = await api.get(
                    "/users/notifications/list/"
                );

                const unread = (
                    notificationResponse.data || []
                ).filter(
                    (notification) => !notification.is_read
                ).length;

                setUnreadCount(unread);

                if (user.role === "IT Service Desk") {
                    const [
                        returnResponse,
                        priorityResponse,
                        departmentResponse,
                    ] = await Promise.all([
                        api.get(
                            "/tickets/return-ticket/pending-count/"
                        ),
                        api.get(
                            "/tickets/priority-request/pending-count/"
                        ),
                        api.get(
                            "/tickets/service-desk/departments/"
                        ),
                    ]);

                    setPendingReturnCount(
                        returnResponse.data?.count || 0
                    );

                    setPendingPriorityCount(
                        priorityResponse.data?.count || 0
                    );

                    const serviceDeskDepartments = (
                        departmentResponse.data || []
                    ).filter(
                        (department) =>
                            department.name.toLowerCase() !==
                            "service desk"
                    );

                    setDepartments(serviceDeskDepartments);
                }
            } catch {
                setUnreadCount(0);
                setPendingReturnCount(0);
                setPendingPriorityCount(0);
                setDepartments([]);
            }
        };

        fetchSidebarData();
    }, [user.role]);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setMobileOpen(false);
            }
        };

        window.addEventListener("resize", handleResize);

        return () =>
            window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        if (!mobileOpen) return;

        const handleEscape = (event) => {
            if (event.key === "Escape") {
                setMobileOpen(false);
            }
        };

        document.addEventListener("keydown", handleEscape);

        return () =>
            document.removeEventListener("keydown", handleEscape);
    }, [mobileOpen]);

    useEffect(() => {
        document.body.style.overflow = mobileOpen ? "hidden" : "";

        return () => {
            document.body.style.overflow = "";
        };
    }, [mobileOpen]);

    const getItemCount = (item) => {
        if (item.name === "Notifications") {
            return unreadCount;
        }

        if (
            item.name === "Returned Tickets" &&
            user.role === "IT Service Desk"
        ) {
            return pendingReturnCount;
        }

        if (
            item.name === "Priority Requests" &&
            user.role === "IT Service Desk"
        ) {
            return pendingPriorityCount;
        }

        return 0;
    };

    const closeMobileSidebar = () => {
        if (window.innerWidth < 768) {
            setMobileOpen(false);
        }
    };

    const renderNavItem = (item) => {
        const Icon = item.icon;
        const itemCount = getItemCount(item);

        return (
            <NavLink
                key={item.name}
                to={item.path}
                onClick={closeMobileSidebar}
                className={({ isActive }) =>
                    `flex items-center gap-3 rounded-md p-2 text-sm transition-all ${
                        isActive
                            ? "bg-white text-black"
                            : "hover:bg-white hover:text-black"
                    }`
                }
            >
                {Icon && <Icon size={18} />}

                <span className="flex-1">
                    {item.name}
                </span>

                {itemCount > 0 && (
                    <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-semibold leading-none text-white">
                        {itemCount > 99 ? "99+" : itemCount}
                    </span>
                )}
            </NavLink>
        );
    };

    const sidebarContent = (
        <>
            <div className="mb-10 flex items-center justify-between gap-3">
                <img
                    src={foundever_blue}
                    alt="Foundever"
                    className="h-auto w-[190px] shrink-0 object-contain"
                />

                <button
                    type="button"
                    onClick={() => setMobileOpen(false)}
                    aria-label="Close navigation"
                    className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-md text-white transition hover:bg-white/10 md:hidden"
                >
                    <X size={22} />
                </button>
            </div>

            <nav className="flex flex-col gap-2">
                {menus.map((item) => {
                    if (item.type === "section") {
                        return (
                            <div
                                key={item.title}
                                className="mt-4"
                            >
                                <p className="mb-2 text-xs font-semibold uppercase text-white">
                                    {item.title}
                                </p>

                                {item.title === "TEAMS" &&
                                    user.role === "IT Service Desk" &&
                                    departments.map((department) => {
                                        const Icon =
                                            departmentIcons[
                                                department.name
                                            ];

                                        return (
                                            <NavLink
                                                key={department.id}
                                                to={`/service-desk/department/${department.id}`}
                                                onClick={
                                                    closeMobileSidebar
                                                }
                                                className={({ isActive }) =>
                                                    `mb-2 flex items-center gap-3 rounded-md p-2 text-sm transition-all ${
                                                        isActive
                                                            ? "bg-white text-black"
                                                            : "hover:bg-white hover:text-black"
                                                    }`
                                                }
                                            >
                                                {Icon && (
                                                    <Icon size={18} />
                                                )}

                                                <span className="flex-1">
                                                    {department.name}
                                                </span>
                                            </NavLink>
                                        );
                                    })}
                            </div>
                        );
                    }

                    return renderNavItem(item);
                })}
            </nav>
        </>
    );

    return (
        <>
            {!mobileOpen && (
                <button
                    type="button"
                    onClick={() => setMobileOpen(true)}
                    aria-label="Open navigation"
                    className="fixed left-4 top-4 z-[9999] flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg bg-[#2563EB] text-white shadow-lg transition hover:bg-[#1D4ED8] md:hidden"
                >
                    <Menu
                        size={24}
                        strokeWidth={2.5}
                    />
                </button>
            )}

            <aside className="hidden h-screen w-67 shrink-0 bg-[#4C4CF9] p-4 text-white shadow-lg md:block">
                {sidebarContent}
            </aside>

            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{
                                duration: 0.2,
                            }}
                            onClick={() =>
                                setMobileOpen(false)
                            }
                            className="fixed inset-0 z-[9997] bg-black/40 md:hidden"
                        />

                        <motion.aside
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 30,
                            }}
                            className="fixed left-0 top-0 z-[9998] h-screen w-[300px] max-w-[85vw] overflow-y-auto bg-[#4C4CF9] p-4 text-white shadow-2xl md:hidden"
                        >
                            {sidebarContent}
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}