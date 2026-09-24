import { useEffect, useState } from "react";
import {
    Bell,
    Check,
    ChevronDown,
    LogOut,
    User,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constant";

export default function Topbar() {
    const navigate = useNavigate();

    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notificationOpen, setNotificationOpen] = useState(false);
    const [userOpen, setUserOpen] = useState(false);

    const [user, setUser] = useState({
        first_name: "",
        last_name: "",
        role: "",
    });

    useEffect(() => {
        const token = localStorage.getItem(ACCESS_TOKEN);

        if (!token) {
            return;
        }

        try {
            const payload = JSON.parse(
                atob(token.split(".")[1])
            );

            setUser({
                first_name: payload.first_name || "",
                last_name: payload.last_name || "",
                role: payload.role || "",
            });
        } catch {
            setUser({
                first_name: "",
                last_name: "",
                role: "",
            });
        }
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await api.get(
                "/users/notifications/list/"
            );

            const data = response.data || [];

            setNotifications(data);

            const unread = data.filter(
                (notification) => !notification.is_read
            ).length;

            setUnreadCount(unread);
        } catch {
            setNotifications([]);
            setUnreadCount(0);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleNotificationClick = async (notification) => {
        if (!notification.is_read) {
            try {
                await api.patch(
                    `/users/notifications/${notification.id}/read/`
                );

                setNotifications((current) =>
                    current.map((item) =>
                        item.id === notification.id
                            ? {
                                  ...item,
                                  is_read: true,
                              }
                            : item
                    )
                );

                setUnreadCount((current) =>
                    Math.max(current - 1, 0)
                );
            } catch {
                return;
            }
        }

        if (notification.ticket) {
            navigate(`/tickets/${notification.ticket}`);
        }
    };

    const handleLogout = async () => {
        const refreshToken = localStorage.getItem(
            REFRESH_TOKEN
        );

        try {
            if (refreshToken) {
                await api.post("/user/logout/", {
                    refresh: refreshToken,
                });
            }
        } catch {
            // Continue logout even if the backend request fails.
        } finally {
            localStorage.removeItem(ACCESS_TOKEN);
            localStorage.removeItem(REFRESH_TOKEN);

            window.location.href = "/login";
        }
    };

    const firstInitial =
        user.first_name?.trim()?.charAt(0)?.toUpperCase() || "";

    const lastInitial =
        user.last_name?.trim()?.charAt(0)?.toUpperCase() || "";

    const initials =
        `${firstInitial}${lastInitial}` || "U";

    const fullName =
        `${user.first_name} ${user.last_name}`.trim() ||
        "User";

    const displayRole = user.role || "User";

    const displayUnreadCount =
        unreadCount > 99 ? "99+" : unreadCount;

    return (
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-end border-b border-gray-200 bg-white px-6">
            <div className="flex items-center gap-4">
                {/* Notifications */}
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => {
                            setNotificationOpen(
                                (current) => !current
                            );
                            setUserOpen(false);
                        }}
                        className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
                    >
                        <Bell size={20} />

                        {unreadCount > 0 && (
                            <span className="absolute -right-1.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-semibold leading-none text-white">
                                {displayUnreadCount}
                            </span>
                        )}
                    </button>

                    {notificationOpen && (
                        <div className="absolute right-0 top-11 z-50 w-96 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900">
                                        Notifications
                                    </h3>

                                    <p className="text-xs text-gray-500">
                                        {unreadCount > 0
                                            ? `${unreadCount} unread`
                                            : "All caught up"}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate(
                                            "/notifications"
                                        )
                                    }
                                    className="cursor-pointer text-xs font-medium text-[#2563EB] hover:underline"
                                >
                                    View all
                                </button>
                            </div>

                            <div className="max-h-96 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="px-4 py-8 text-center">
                                        <Bell
                                            size={22}
                                            className="mx-auto mb-2 text-gray-300"
                                        />

                                        <p className="text-sm text-gray-500">
                                            No notifications
                                        </p>
                                    </div>
                                ) : (
                                    notifications
                                        .slice(0, 8)
                                        .map(
                                            (
                                                notification
                                            ) => (
                                                <button
                                                    key={
                                                        notification.id
                                                    }
                                                    type="button"
                                                    onClick={() =>
                                                        handleNotificationClick(
                                                            notification
                                                        )
                                                    }
                                                    className={`flex w-full cursor-pointer items-start gap-3 border-b border-gray-100 px-4 py-3 text-left transition ${
                                                        notification.is_read
                                                            ? "bg-white hover:bg-gray-50"
                                                            : "bg-blue-50 hover:bg-blue-100"
                                                    }`}
                                                >
                                                    <div
                                                        className={`mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                                                            notification.is_read
                                                                ? "bg-gray-100 text-gray-500"
                                                                : "bg-blue-100 text-[#2563EB]"
                                                        }`}
                                                    >
                                                        {notification.is_read ? (
                                                            <Check
                                                                size={
                                                                    14
                                                                }
                                                            />
                                                        ) : (
                                                            <Bell
                                                                size={
                                                                    14
                                                                }
                                                            />
                                                        )}
                                                    </div>

                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <p
                                                                className={`text-xs leading-5 ${
                                                                    notification.is_read
                                                                        ? "font-normal text-gray-600"
                                                                        : "font-medium text-gray-900"
                                                                }`}
                                                            >
                                                                {
                                                                    notification.message
                                                                }
                                                            </p>

                                                            {!notification.is_read && (
                                                                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#2563EB]" />
                                                            )}
                                                        </div>

                                                        {notification.ticket_code && (
                                                            <span className="mt-1 inline-block rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500">
                                                                {
                                                                    notification.ticket_code
                                                                }
                                                            </span>
                                                        )}
                                                    </div>
                                                </button>
                                            )
                                        )
                                )}
                            </div>

                            {notifications.length > 8 && (
                                <div className="border-t border-gray-100 px-4 py-2">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            navigate(
                                                "/notifications"
                                            )
                                        }
                                        className="w-full cursor-pointer text-center text-xs font-medium text-[#2563EB] hover:underline"
                                    >
                                        View all notifications
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* User Menu */}
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => {
                            setUserOpen(
                                (current) => !current
                            );
                            setNotificationOpen(false);
                        }}
                        className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 transition hover:bg-gray-100"
                    >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2563EB] text-xs font-semibold text-white">
                            {initials}
                        </div>

                        <div className="hidden text-left sm:block">
                            <p className="text-sm font-medium text-gray-900">
                                {fullName}
                            </p>

                            <p className="text-xs text-gray-500">
                                {displayRole}
                            </p>
                        </div>

                        <ChevronDown
                            size={16}
                            className="text-gray-500"
                        />
                    </button>

                    {userOpen && (
                        <div className="absolute right-0 top-12 z-50 w-48 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
                            <div className="border-b border-gray-100 px-4 py-3">
                                <p className="text-sm font-medium text-gray-900">
                                    {fullName}
                                </p>

                                <p className="mt-0.5 text-xs text-gray-500">
                                    {displayRole}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    setUserOpen(false);
                                    navigate("/profile");
                                }}
                                className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-sm text-gray-700 transition hover:bg-gray-50"
                            >
                                <User size={16} />
                                Profile
                            </button>

                            <div className="my-1 border-t border-gray-100" />

                            <button
                                type="button"
                                onClick={handleLogout}
                                className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-sm text-gray-700 transition hover:bg-gray-50"
                            >
                                <LogOut size={16} />
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}