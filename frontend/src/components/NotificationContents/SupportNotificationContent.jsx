import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Bell,
    CheckCheck,
    Ticket,
} from "lucide-react";
import api from "../../api";

function formatNotificationDate(date) {
    if (!date) {
        return "-";
    }

    const notificationDate = new Date(date);
    const now = new Date();
    const difference = now - notificationDate;

    const minutes = Math.floor(difference / 60000);
    const hours = Math.floor(difference / 3600000);
    const days = Math.floor(difference / 86400000);

    if (minutes < 1) {
        return "Just now";
    }

    if (minutes < 60) {
        return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
    }

    if (hours < 24) {
        return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
    }

    if (days === 1) {
        return "Yesterday";
    }

    if (days < 7) {
        return `${days} days ago`;
    }

    return notificationDate.toLocaleDateString([], {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function getNotificationIcon(type) {
    switch (type) {
        case "ticket_resolved":
        case "ticket_closed":
            return (
                <CheckCheck
                    size={17}
                    strokeWidth={1.8}
                />
            );

        case "ticket_assigned":
        case "ticket_created":
        case "status_updated":
        case "comment_added":
        case "review_required":
        case "ticket_escalated":
        case "escalation_acknowledged":
        default:
            return (
                <Bell
                    size={17}
                    strokeWidth={1.8}
                />
            );
    }
}

function getIconStyle(isRead) {
    return isRead
        ? "bg-gray-100 text-gray-500"
        : "bg-[#2563EB]/10 text-[#2563EB]";
}

export default function SupportNotificationContent() {
    const navigate = useNavigate();

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState("all");
    const [markingId, setMarkingId] = useState(null);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                "/users/notifications/list/"
            );

            setNotifications(response.data || []);
        } catch (err) {
            setError(
                err.response?.data?.error ||
                    "Failed to load notifications."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleNotificationClick = async (notification) => {
        try {
            if (!notification.is_read) {
                setMarkingId(notification.id);

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
            }

            if (notification.ticket_id) {
                navigate(
                    `/ticket/${notification.ticket_id}`
                );
            }
        } catch (err) {
            setError(
                err.response?.data?.error ||
                    "Failed to mark notification as read."
            );

            if (notification.ticket_id) {
                navigate(
                    `/ticket/${notification.ticket_id}`
                );
            }
        } finally {
            setMarkingId(null);
        }
    };

    const unreadCount = notifications.filter(
        (notification) => !notification.is_read
    ).length;

    const filteredNotifications =
        filter === "unread"
            ? notifications.filter(
                  (notification) => !notification.is_read
              )
            : notifications;

    return (
        <div className="bg-white">
            {/* Notification Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3">
                <div>
                    <h2 className="text-sm font-semibold text-gray-900">
                        Your Notifications
                    </h2>

                    <p className="mt-0.5 text-xs text-gray-500">
                        {unreadCount} unread notification
                        {unreadCount !== 1 ? "s" : ""}
                    </p>
                </div>

                <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1">
                    <button
                        type="button"
                        onClick={() => setFilter("all")}
                        className={`cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition ${
                            filter === "all"
                                ? "bg-white text-gray-900 shadow-sm"
                                : "text-gray-500 hover:text-gray-900"
                        }`}
                    >
                        All
                    </button>

                    <button
                        type="button"
                        onClick={() => setFilter("unread")}
                        className={`cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition ${
                            filter === "unread"
                                ? "bg-white text-gray-900 shadow-sm"
                                : "text-gray-500 hover:text-gray-900"
                        }`}
                    >
                        Unread
                    </button>
                </div>
            </div>

            {/* Loading */}
            {loading && (
                <div className="flex h-[637px] items-center justify-center">
                    <p className="text-sm text-gray-500">
                        Loading notifications...
                    </p>
                </div>
            )}

            {/* Error */}
            {!loading && error && (
                <div className="px-5 py-4">
                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                        <p className="text-sm text-red-600">
                            {error}
                        </p>
                    </div>
                </div>
            )}

            {/* Empty */}
            {!loading &&
                !error &&
                filteredNotifications.length === 0 && (
                    <div className="flex h-[637px] flex-col items-center justify-center px-5 text-center">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100">
                            <Bell
                                size={19}
                                className="text-gray-400"
                            />
                        </div>

                        <p className="mt-3 text-sm font-medium text-gray-900">
                            {filter === "unread"
                                ? "No unread notifications"
                                : "No notifications"}
                        </p>

                        <p className="mt-1 max-w-sm text-xs leading-5 text-gray-500">
                            {filter === "unread"
                                ? "You're all caught up."
                                : "Notifications about ticket assignments and support activity will appear here."}
                        </p>
                    </div>
                )}

            {/* Notifications */}
            {!loading &&
                !error &&
                filteredNotifications.length > 0 && (
                    <div className="h-[637px] overflow-y-auto overflow-x-hidden">
                        {filteredNotifications.map(
                            (notification) => {
                                const isUnread =
                                    !notification.is_read;

                                const isMarking =
                                    markingId ===
                                    notification.id;

                                return (
                                    <button
                                        key={notification.id}
                                        type="button"
                                        onClick={() =>
                                            handleNotificationClick(
                                                notification
                                            )
                                        }
                                        disabled={isMarking}
                                        className={`flex w-full cursor-pointer items-start gap-4 border-b border-gray-100 px-5 py-4 text-left transition last:border-b-0 ${
                                            isUnread
                                                ? "bg-blue-50/[0.35] hover:bg-blue-50"
                                                : "bg-white hover:bg-gray-50"
                                        }`}
                                    >
                                        {/* Icon */}
                                        <div
                                            className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${getIconStyle(
                                                notification.is_read
                                            )}`}
                                        >
                                            {getNotificationIcon(
                                                notification.notification_type
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <p
                                                            className={`truncate text-sm ${
                                                                isUnread
                                                                    ? "font-semibold text-gray-900"
                                                                    : "font-medium text-gray-700"
                                                            }`}
                                                        >
                                                            {
                                                                notification.notification_type_display
                                                            }
                                                        </p>

                                                        {isUnread && (
                                                            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#2563EB]" />
                                                        )}
                                                    </div>

                                                    <p
                                                        className={`mt-1 text-sm leading-5 ${
                                                            isUnread
                                                                ? "text-gray-700"
                                                                : "text-gray-500"
                                                        }`}
                                                    >
                                                        {
                                                            notification.message
                                                        }
                                                    </p>
                                                </div>

                                                <span className="shrink-0 text-xs text-gray-400">
                                                    {formatNotificationDate(
                                                        notification.created_at
                                                    )}
                                                </span>
                                            </div>

                                            {notification.ticket_code && (
                                                <div className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-500">
                                                    <Ticket
                                                        size={12}
                                                        strokeWidth={
                                                            1.8
                                                        }
                                                    />

                                                    {
                                                        notification.ticket_code
                                                    }
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                );
                            }
                        )}
                    </div>
                )}
        </div>
    );
}