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
} from "lucide-react";

export default function Sidebar() {
    const user = getCurrentUser();

    const menus = sidebarItems[user.role] || [];

    const [unreadCount, setUnreadCount] = useState(0);
    const [pendingReturnCount, setPendingReturnCount] = useState(0);
    const [pendingPriorityCount, setPendingPriorityCount] = useState(0);
    const [departments, setDepartments] = useState([]);

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

    const renderNavItem = (item) => {
        const Icon = item.icon;
        const itemCount = getItemCount(item);

        return (
            <NavLink
                key={item.name}
                to={item.path}
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
                        {itemCount > 99
                            ? "99+"
                            : itemCount}
                    </span>
                )}
            </NavLink>
        );
    };

    return (
        <aside className="h-screen w-67 bg-[#4C4CF9] p-4 text-white shadow-lg">
            <img
                src={foundever_blue}
                alt="Foundever"
                className="mb-10 p-2"
            />

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
                                    departments.map(
                                        (department) => {
                                            const Icon =
                                                departmentIcons[
                                                    department.name
                                                ];

                                            return (
                                                <NavLink
                                                    key={department.id}
                                                    to={`/service-desk/department/${department.id}`}
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
                                                        {
                                                            department.name
                                                        }
                                                    </span>
                                                </NavLink>
                                            );
                                        }
                                    )}
                            </div>
                        );
                    }

                    return renderNavItem(item);
                })}
            </nav>
        </aside>
    );
}