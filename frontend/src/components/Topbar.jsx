
import { useEffect, useState } from "react";
import {
    Bell,
    Check,
    ChevronDown,
    LogOut,
    User,
    AlertOctagon,
    AlertTriangle,
    ClockAlert,
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

        if (!token) return;

        try {
            const payload = JSON.parse(atob(token.split(".")[1]));

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
            const response = await api.get("/users/notifications/list/");
            const data = response.data || [];

            setNotifications(data);
            setUnreadCount(
                data.filter((notification) => !notification.is_read).length
            );
        } catch {
            setNotifications([]);
            setUnreadCount(0);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const formatNotificationDate = (date) => {
        if (!date) return "";

        const formattedDate = new Date(date);

        if (Number.isNaN(formattedDate.getTime())) return "";

        const datePart = formattedDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });

        const timePart = formattedDate.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });

        return `${datePart} • ${timePart}`;
    };

    const getNotificationStyle = (notification) => {
        switch (notification.notification_type) {
            case "ticket_breached":
                return {
                    container: notification.is_read
                        ? "bg-red-50 hover:bg-red-100"
                        : "bg-red-100 hover:bg-red-200",
                    icon: "bg-red-200 text-red-700",
                    text: notification.is_read
                        ? "font-normal text-red-800"
                        : "font-semibold text-red-900",
                    indicator: "bg-red-600",
                    Icon: AlertOctagon,
                    label: "BREACHED",
                    badge: "bg-red-200 text-red-800",
                };

            case "ticket_critical":
                return {
                    container: notification.is_read
                        ? "bg-orange-50 hover:bg-orange-100"
                        : "bg-orange-100 hover:bg-orange-200",
                    icon: "bg-orange-200 text-orange-700",
                    text: notification.is_read
                        ? "font-normal text-orange-800"
                        : "font-semibold text-orange-900",
                    indicator: "bg-orange-600",
                    Icon: AlertTriangle,
                    label: "CRITICAL",
                    badge: "bg-orange-200 text-orange-800",
                };

            case "ticket_warning":
                return {
                    container: notification.is_read
                        ? "bg-amber-50 hover:bg-amber-100"
                        : "bg-amber-100 hover:bg-amber-200",
                    icon: "bg-amber-200 text-amber-700",
                    text: notification.is_read
                        ? "font-normal text-amber-800"
                        : "font-semibold text-amber-900",
                    indicator: "bg-amber-500",
                    Icon: ClockAlert,
                    label: "WARNING",
                    badge: "bg-amber-200 text-amber-800",
                };

            default:
                return {
                    container: notification.is_read
                        ? "bg-white hover:bg-gray-50"
                        : "bg-blue-50 hover:bg-blue-100",
                    icon: notification.is_read
                        ? "bg-gray-100 text-gray-500"
                        : "bg-blue-100 text-[#2563EB]",
                    text: notification.is_read
                        ? "font-normal text-gray-600"
                        : "font-medium text-gray-900",
                    indicator: "bg-[#2563EB]",
                    Icon: notification.is_read ? Check : Bell,
                    label: "",
                    badge: "",
                };
        }
    };

    const handleNotificationClick = async (notification) => {
        if (!notification.is_read) {
            try {
                await api.patch(
                    `/users/notifications/${notification.id}/read/`
                );

                setNotifications((current) =>
                    current.map((item) =>
                        item.id === notification.id
                            ? { ...item, is_read: true }
                            : item
                    )
                );

                setUnreadCount((current) => Math.max(current - 1, 0));
            } catch {
                return;
            }
        }

        if (notification.ticket_id) {
            setNotificationOpen(false);
            navigate(`/ticket/${notification.ticket_id}`);
        }
    };

    const handleLogout = async () => {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN);

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

    const initials = `${firstInitial}${lastInitial}` || "U";

    const fullName =
        `${user.first_name} ${user.last_name}`.trim() || "User";

    const displayRole = user.role || "User";

    const displayUnreadCount = unreadCount > 99 ? "99+" : unreadCount;

    return (
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-end border-b border-gray-200 bg-white px-3 sm:px-4 lg:px-6">
            <div className="flex items-center gap-1.5 sm:gap-3 lg:gap-4">
                {/* Notifications */}
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => {
                            setNotificationOpen((current) => !current);
                            setUserOpen(false);
                        }}
                        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
                        aria-expanded={notificationOpen}
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
                        <div className="fixed left-3 right-3 top-[68px] z-50 max-h-[calc(100vh-80px)] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg sm:absolute sm:left-auto sm:right-0 sm:top-11 sm:w-[360px] sm:max-h-none">
                            {/* Notification Header */}
                            <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-3 py-3 sm:px-4">
                                <div className="min-w-0">
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
                                    onClick={() => {
                                        setNotificationOpen(false);
                                        navigate("/notifications");
                                    }}
                                    className="shrink-0 cursor-pointer text-xs font-medium text-[#2563EB] hover:underline"
                                >
                                    View all
                                </button>
                            </div>

                            {/* Notification List */}
                            <div className="max-h-[calc(100vh-150px)] overflow-y-auto sm:max-h-96">
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
                                    notifications.slice(0, 8).map((notification) => {
                                        const style =
                                            getNotificationStyle(notification);
                                        const NotificationIcon = style.Icon;

                                        return (
                                            <button
                                                key={notification.id}
                                                type="button"
                                                onClick={() =>
                                                    handleNotificationClick(
                                                        notification
                                                    )
                                                }
                                                className={`flex w-full cursor-pointer items-start gap-2.5 border-b border-gray-100 px-3 py-3 text-left transition sm:gap-3 sm:px-4 ${style.container}`}
                                            >
                                                {/* Notification Icon */}
                                                <div
                                                    className={`mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${style.icon}`}
                                                >
                                                    <NotificationIcon size={14} />
                                                </div>

                                                {/* Notification Content */}
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex min-w-0 items-start justify-between gap-2">
                                                        <p
                                                            className={`min-w-0 break-words text-xs leading-5 ${style.text}`}
                                                        >
                                                            {notification.message}
                                                        </p>

                                                        {!notification.is_read && (
                                                            <span
                                                                className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${style.indicator}`}
                                                            />
                                                        )}
                                                    </div>

                                                    {style.label && (
                                                        <span
                                                            className={`mt-1 inline-block rounded px-1.5 py-0.5 text-[9px] font-bold ${style.badge}`}
                                                        >
                                                            {style.label}
                                                        </span>
                                                    )}

                                                    {notification.ticket_code && (
                                                        <span className="mt-1 inline-block max-w-full truncate rounded bg-white/70 px-1.5 py-0.5 text-[10px] font-medium text-gray-600">
                                                            {notification.ticket_code}
                                                        </span>
                                                    )}

                                                    {notification.created_at && (
                                                        <p className="mt-1 break-words text-[10px] text-gray-500">
                                                            {formatNotificationDate(
                                                                notification.created_at
                                                            )}
                                                        </p>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })
                                )}
                            </div>

                            {/* View All Footer */}
                            {notifications.length > 8 && (
                                <div className="border-t border-gray-100 px-3 py-2 sm:px-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setNotificationOpen(false);
                                            navigate("/notifications");
                                        }}
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
                            setUserOpen((current) => !current);
                            setNotificationOpen(false);
                        }}
                        aria-expanded={userOpen}
                        className="flex cursor-pointer items-center gap-1.5 rounded-lg px-1.5 py-1.5 transition hover:bg-gray-100 sm:gap-2 sm:px-2"
                    >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#2563EB] text-xs font-semibold text-white">
                            {initials}
                        </div>

                        <div className="hidden text-left sm:block">
                            <p className="max-w-[160px] truncate text-sm font-medium text-gray-900">
                                {fullName}
                            </p>

                            <p className="max-w-[160px] truncate text-xs text-gray-500">
                                {displayRole}
                            </p>
                        </div>

                        <ChevronDown
                            size={16}
                            className="shrink-0 text-gray-500"
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