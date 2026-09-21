import { useEffect, useRef, useState } from "react";
import {
    Bell,
    Check,
    ChevronDown,
    LogOut,
    User,
} from "lucide-react";
import api from "../api";

export default function Topbar() {
    const [notificationOpen, setNotificationOpen] = useState(false);
    const [userOpen, setUserOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);

    const notificationRef = useRef(null);
    const userRef = useRef(null);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await api.get("/users/notifications/list/");
                setNotifications(response.data);
            } catch {
                setNotifications([]);
            }
        };

        fetchNotifications();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                notificationRef.current &&
                !notificationRef.current.contains(event.target)
            ) {
                setNotificationOpen(false);
            }

            if (
                userRef.current &&
                !userRef.current.contains(event.target)
            ) {
                setUserOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const unreadCount = notifications.filter(
        (notification) => !notification.is_read
    ).length;

    const formatNotificationTime = (createdAt) => {
        if (!createdAt) {
            return "-";
        }

        const date = new Date(createdAt);

        return date.toLocaleString([], {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
        });
    };

    const getNotificationTitle = (notification) => {
        return (
            notification.notification_type_display ||
            "Notification"
        );
    };

    const markAsRead = async (notification) => {
        if (notification.is_read) {
            return;
        }

        try {
            await api.patch(
                `/notifications/${notification.id}/read/`
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
        } catch {
            return;
        }
    };

    return (
        <header className="flex h-14 shrink-0 items-center justify-end border-b border-gray-300 bg-white px-6">
            <div className="flex items-center gap-3">
                {/* Notifications */}
                <div
                    ref={notificationRef}
                    className="relative"
                >
                    <button
                        type="button"
                        onClick={() => {
                            setNotificationOpen((prev) => !prev);
                            setUserOpen(false);
                        }}
                        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-black"
                    >
                        <Bell size={19} />

                        {unreadCount > 0 && (
                            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
                        )}
                    </button>

                    {notificationOpen && (
                        <div className="absolute right-0 top-11 z-50 w-80 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                                <div>
                                    <h3 className="text-sm font-semibold text-black">
                                        Notifications
                                    </h3>

                                    <p className="mt-0.5 text-xs text-gray-500">
                                        You have {unreadCount} unread
                                        notification
                                        {unreadCount !== 1 ? "s" : ""}.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    className="text-xs font-medium text-[#4C4CF9] hover:underline"
                                >
                                    Mark all read
                                </button>
                            </div>

                            <div className="max-h-80 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="px-4 py-8 text-center">
                                        <Bell
                                            size={20}
                                            className="mx-auto text-gray-300"
                                        />

                                        <p className="mt-2 text-sm font-medium text-gray-600">
                                            No notifications
                                        </p>

                                        <p className="mt-1 text-xs text-gray-400">
                                            You're all caught up.
                                        </p>
                                    </div>
                                ) : (
                                    notifications.map((notification) => (
                                        <button
                                            key={notification.id}
                                            type="button"
                                            onClick={() =>
                                                markAsRead(notification)
                                            }
                                            className={`flex w-full items-start gap-3 border-b border-gray-100 px-4 py-3 text-left transition hover:bg-gray-50 ${
                                                !notification.is_read
                                                    ? "bg-[#4C4CF9]/[0.02]"
                                                    : ""
                                            }`}
                                        >
                                            <div
                                                className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                                                    !notification.is_read
                                                        ? "bg-[#4C4CF9]/10"
                                                        : "bg-gray-100"
                                                }`}
                                            >
                                                <Bell
                                                    size={15}
                                                    className={
                                                        !notification.is_read
                                                            ? "text-[#4C4CF9]"
                                                            : "text-gray-500"
                                                    }
                                                />
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className="text-sm font-medium text-black">
                                                        {getNotificationTitle(
                                                            notification
                                                        )}
                                                    </p>

                                                    {!notification.is_read && (
                                                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#4C4CF9]" />
                                                    )}
                                                </div>

                                                <p className="mt-0.5 text-xs leading-5 text-gray-500">
                                                    {notification.message}
                                                </p>

                                                <p className="mt-1 text-[11px] text-gray-400">
                                                    {formatNotificationTime(
                                                        notification.created_at
                                                    )}
                                                </p>
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>

                            <div className="border-t border-gray-200 px-4 py-3">
                                <button
                                    type="button"
                                    className="w-full text-center text-xs font-medium text-[#4C4CF9] hover:underline"
                                >
                                    View all notifications
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="h-7 w-px bg-gray-200" />

                {/* User */}
                <div
                    ref={userRef}
                    className="relative"
                >
                    <button
                        type="button"
                        onClick={() => {
                            setUserOpen((prev) => !prev);
                            setNotificationOpen(false);
                        }}
                        className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition hover:bg-gray-50"
                    >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#4C4CF9]/10 text-xs font-semibold text-[#4C4CF9]">
                            JD
                        </div>

                        <div className="hidden text-left sm:block">
                            <p className="text-sm font-semibold text-black">
                                Juan Dela Cruz
                            </p>

                            <p className="text-xs text-gray-500">
                                Employee
                            </p>
                        </div>

                        <ChevronDown
                            size={15}
                            className={`text-gray-400 transition ${
                                userOpen ? "rotate-180" : ""
                            }`}
                        />
                    </button>

                    {userOpen && (
                        <div className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                            <div className="border-b border-gray-200 px-4 py-3">
                                <p className="text-sm font-semibold text-black">
                                    Juan Dela Cruz
                                </p>

                                <p className="mt-0.5 text-xs text-gray-500">
                                    Employee
                                </p>
                            </div>

                            <div className="p-1.5">
                                <button
                                    type="button"
                                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-700 transition hover:bg-gray-100"
                                >
                                    <User size={16} />
                                    Profile
                                </button>

                                <button
                                    type="button"
                                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-700 transition hover:bg-gray-100"
                                >
                                    <Check size={16} />
                                    Account Settings
                                </button>

                                <div className="my-1 border-t border-gray-100" />

                                <button
                                    type="button"
                                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-600 transition hover:bg-red-50"
                                >
                                    <LogOut size={16} />
                                    Logout
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}