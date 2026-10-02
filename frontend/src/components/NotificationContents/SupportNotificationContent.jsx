import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import {
    Bell,
    CheckCheck,
    Ticket,
    Filter,
} from "lucide-react";

import api from "../../api";
import { getCurrentUser } from "../../utils/auth";


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

    const currentUser = getCurrentUser();

    const role = String(
        currentUser?.role || ""
    )
        .trim()
        .toLowerCase();

    const isSupervisor =
        role === "it supervisor";


    // --------------------------------------------------
    // STATE
    // --------------------------------------------------

    const [notifications, setNotifications] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [filter, setFilter] =
        useState("all");

    const [markingId, setMarkingId] =
        useState(null);


    // Supervisor filters
    const [
        departmentFilter,
        setDepartmentFilter,
    ] = useState("all");

    const [
        typeFilter,
        setTypeFilter,
    ] = useState("all");

    const [
        slaFilter,
        setSlaFilter,
    ] = useState("all");


    // --------------------------------------------------
    // FETCH NOTIFICATIONS
    // --------------------------------------------------

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                "/users/notifications/list/"
            );

            setNotifications(
                response.data || []
            );
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


    // --------------------------------------------------
    // NOTIFICATION CLICK
    // --------------------------------------------------

    const handleNotificationClick =
        async (notification) => {
            try {
                if (!notification.is_read) {
                    setMarkingId(
                        notification.id
                    );

                    await api.patch(
                        `/users/notifications/${notification.id}/read/`
                    );

                    setNotifications(
                        (current) =>
                            current.map(
                                (item) =>
                                    item.id ===
                                    notification.id
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


    // --------------------------------------------------
    // UNREAD COUNT
    // --------------------------------------------------

    const unreadCount =
        notifications.filter(
            (notification) =>
                !notification.is_read
        ).length;


    // --------------------------------------------------
    // GET UNIQUE DEPARTMENTS
    // --------------------------------------------------

    const departments = [
        ...new Map(
            notifications
                .filter(
                    (notification) =>
                        notification.it_department_id &&
                        notification.it_department
                )
                .map(
                    (notification) => [
                        notification.it_department_id,
                        {
                            id:
                                notification.it_department_id,
                            name:
                                notification.it_department,
                        },
                    ]
                )
        ).values(),
    ].sort((a, b) =>
        a.name.localeCompare(b.name)
    );


    // --------------------------------------------------
    // NOTIFICATION TYPE GROUPS
    // --------------------------------------------------

    const slaTypes = [
        "ticket_warning",
        "ticket_critical",
        "ticket_breached",
    ];


    // --------------------------------------------------
    // FILTER NOTIFICATIONS
    // --------------------------------------------------

    const filteredNotifications =
        notifications.filter(
            (notification) => {

                // All / Unread
                const matchesRead =
                    filter === "all" ||
                    (
                        filter === "unread" &&
                        !notification.is_read
                    );


                // Normal users do not need
                // supervisor-specific filtering.
                if (!isSupervisor) {
                    return matchesRead;
                }


                // Department
                const matchesDepartment =
                    departmentFilter === "all" ||
                    String(
                        notification.it_department_id
                    ) === departmentFilter;


                // Notification Type
                let matchesType = true;

                if (typeFilter === "sla") {
                    matchesType =
                        slaTypes.includes(
                            notification.notification_type
                        );
                }

                if (typeFilter === "ticket") {
                    matchesType =
                        !slaTypes.includes(
                            notification.notification_type
                        );
                }


                // SLA Severity
                let matchesSla = true;

                if (
                    typeFilter === "sla" &&
                    slaFilter !== "all"
                ) {
                    matchesSla =
                        notification.notification_type ===
                        `ticket_${slaFilter}`;
                }


                return (
                    matchesRead &&
                    matchesDepartment &&
                    matchesType &&
                    matchesSla
                );
            }
        );


    // --------------------------------------------------
    // RESET SUPERVISOR FILTERS
    // --------------------------------------------------

    const resetFilters = () => {
        setDepartmentFilter("all");
        setTypeFilter("all");
        setSlaFilter("all");
    };


    const hasActiveSupervisorFilters =
        departmentFilter !== "all" ||
        typeFilter !== "all" ||
        slaFilter !== "all";


    // --------------------------------------------------
    // RENDER
    // --------------------------------------------------

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
                        {unreadCount !== 1
                            ? "s"
                            : ""}
                    </p>
                </div>


                {/* All / Unread */}
                <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1">

                    <button
                        type="button"
                        onClick={() =>
                            setFilter("all")
                        }
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
                        onClick={() =>
                            setFilter("unread")
                        }
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


            {/* Supervisor Filters */}
            {isSupervisor && (
                <div className="border-b border-gray-200 bg-gray-50 px-5 py-3">

                    <div className="flex flex-wrap items-center gap-2">

                        <div className="mr-1 flex items-center gap-1.5 text-xs font-medium text-gray-500">
                            <Filter
                                size={14}
                                strokeWidth={1.8}
                            />

                            Filters
                        </div>


                        {/* Department */}
                        <select
                            value={
                                departmentFilter
                            }
                            onChange={(event) =>
                                setDepartmentFilter(
                                    event.target.value
                                )
                            }
                            className="cursor-pointer rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700 outline-none transition focus:border-[#2563EB]"
                        >
                            <option value="all">
                                All Departments
                            </option>

                            {departments.map(
                                (department) => (
                                    <option
                                        key={
                                            department.id
                                        }
                                        value={String(
                                            department.id
                                        )}
                                    >
                                        {
                                            department.name
                                        }
                                    </option>
                                )
                            )}
                        </select>


                        {/* Notification Type */}
                        <select
                            value={typeFilter}
                            onChange={(event) => {
                                const value =
                                    event.target.value;

                                setTypeFilter(
                                    value
                                );

                                if (
                                    value !==
                                    "sla"
                                ) {
                                    setSlaFilter(
                                        "all"
                                    );
                                }
                            }}
                            className="cursor-pointer rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700 outline-none transition focus:border-[#2563EB]"
                        >
                            <option value="all">
                                All Notification Types
                            </option>

                            <option value="sla">
                                SLA Alerts
                            </option>

                            <option value="ticket">
                                Ticket Activity
                            </option>
                        </select>


                        {/* SLA Severity */}
                        {typeFilter === "sla" && (
                            <select
                                value={slaFilter}
                                onChange={(
                                    event
                                ) =>
                                    setSlaFilter(
                                        event
                                            .target
                                            .value
                                    )
                                }
                                className="cursor-pointer rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700 outline-none transition focus:border-[#2563EB]"
                            >
                                <option value="all">
                                    All SLA Alerts
                                </option>

                                <option value="warning">
                                    Warning
                                </option>

                                <option value="critical">
                                    Critical
                                </option>

                                <option value="breached">
                                    Breached
                                </option>
                            </select>
                        )}


                        {/* Reset */}
                        {hasActiveSupervisorFilters && (
                            <button
                                type="button"
                                onClick={
                                    resetFilters
                                }
                                className="cursor-pointer rounded-lg px-3 py-2 text-xs font-medium text-[#2563EB] transition hover:bg-blue-50"
                            >
                                Clear Filters
                            </button>
                        )}

                    </div>


                    {/* Filter Result Count */}
                    {hasActiveSupervisorFilters && (
                        <p className="mt-2 text-xs text-gray-400">
                            Showing{" "}
                            {
                                filteredNotifications.length
                            }{" "}
                            of{" "}
                            {
                                notifications.length
                            }{" "}
                            notifications
                        </p>
                    )}

                </div>
            )}


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
                filteredNotifications.length ===
                    0 && (
                    <div className="flex h-[637px] flex-col items-center justify-center px-5 text-center">

                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100">
                            <Bell
                                size={19}
                                className="text-gray-400"
                            />
                        </div>


                        <p className="mt-3 text-sm font-medium text-gray-900">
                            {filter ===
                            "unread"
                                ? "No unread notifications"
                                : hasActiveSupervisorFilters
                                  ? "No matching notifications"
                                  : "No notifications"}
                        </p>


                        <p className="mt-1 max-w-sm text-xs leading-5 text-gray-500">
                            {filter ===
                            "unread"
                                ? "You're all caught up."
                                : hasActiveSupervisorFilters
                                  ? "Try changing or clearing your filters."
                                  : "Notifications about ticket assignments and support activity will appear here."}
                        </p>


                        {isSupervisor &&
                            hasActiveSupervisorFilters && (
                                <button
                                    type="button"
                                    onClick={
                                        resetFilters
                                    }
                                    className="mt-3 cursor-pointer text-xs font-medium text-[#2563EB] hover:underline"
                                >
                                    Clear Filters
                                </button>
                            )}

                    </div>
                )}


            {/* Notifications */}
            {!loading &&
                !error &&
                filteredNotifications.length >
                    0 && (
                    <div
                        className="
                            h-[637px]
                            overflow-y-auto
                            overflow-x-hidden
                            [&::-webkit-scrollbar]:w-0.5
                            [&::-webkit-scrollbar-track]:bg-transparent
                            [&::-webkit-scrollbar-thumb]:bg-transparent
                            hover:[&::-webkit-scrollbar-thumb]:bg-gray-300
                            [&::-webkit-scrollbar-thumb]:rounded-full
                        "
                    >

                        {filteredNotifications.map(
                            (notification) => {

                                const isUnread =
                                    !notification.is_read;

                                const isMarking =
                                    markingId ===
                                    notification.id;


                                return (
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
                                        disabled={
                                            isMarking
                                        }
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


                                            {/* Metadata */}
                                            <div className="mt-2 flex flex-wrap items-center gap-2">

                                                {/* Ticket */}
                                                {notification.ticket_code && (
                                                    <div className="inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-500">

                                                        <Ticket
                                                            size={
                                                                12
                                                            }
                                                            strokeWidth={
                                                                1.8
                                                            }
                                                        />

                                                        {
                                                            notification.ticket_code
                                                        }

                                                    </div>
                                                )}


                                                {/* Department */}
                                                {notification.it_department && (
                                                    <div className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-500">
                                                        {
                                                            notification.it_department
                                                        }
                                                    </div>
                                                )}

                                            </div>

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