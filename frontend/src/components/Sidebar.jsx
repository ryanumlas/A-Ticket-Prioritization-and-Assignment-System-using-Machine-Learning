import { useEffect, useState } from "react";
import { getCurrentUser } from "../utils/auth";
import { NavLink } from "react-router-dom";
import foundever_blue from "../assets/foundever_blue.jpeg";
import { sidebarItems } from "../configs/sideBarItems";
import api from "../api";

export default function Sidebar() {
    const user = getCurrentUser();

    const menus = sidebarItems[user.role];

    const [unreadCount, setUnreadCount] = useState(0);
    const [pendingReturnCount, setPendingReturnCount] = useState(0);
    const [pendingPriorityCount, setPendingPriorityCount] = useState(0);

    useEffect(() => {
        const fetchSidebarCounts = async () => {
            try {
                const [
                    notificationsResponse,
                    returnResponse,
                    priorityResponse,
                ] = await Promise.all([
                    api.get("/users/notifications/list/"),
                    api.get(
                        "/tickets/return-ticket/pending-count/"
                    ),
                    api.get(
                        "/tickets/priority-request/pending-count/"
                    ),
                ]);

                const unread = notificationsResponse.data.filter(
                    (notification) => !notification.is_read
                ).length;

                setUnreadCount(unread);
                setPendingReturnCount(returnResponse.data.count);
                setPendingPriorityCount(priorityResponse.data.count);
            } catch {
                setUnreadCount(0);
                setPendingReturnCount(0);
                setPendingPriorityCount(0);
            }
        };

        fetchSidebarCounts();
    }, []);

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
                            </div>
                        );
                    }

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
                })}
            </nav>
        </aside>
    );
}
