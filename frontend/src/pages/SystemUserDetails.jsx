import { useEffect, useState } from "react";
import {
    ArrowLeft,
    BriefcaseBusiness,
    Building2,
    CalendarDays,
    Clock3,
    Mail,
    MapPin,
    UserRound,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import api from "../api";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

export default function SystemAdUserDetails() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUser();
    }, [id]);

    const fetchUser = async () => {
        setLoading(true);

        try {
            const response = await api.get(`/users/admin/${id}/`);

            setUser(response.data);
        } catch {
            toast.error("Failed to load user details.");
            navigate("/user-management");
        } finally {
            setLoading(false);
        }
    };

    const formatDateTime = (value) => {
        if (!value) {
            return "—";
        }

        return new Date(value).toLocaleString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
        });
    };

    const getInitials = () => {
        if (!user) {
            return "";
        }

        const first = user.first_name?.charAt(0) || "";
        const last = user.last_name?.charAt(0) || "";

        return (
            `${first}${last}`.toUpperCase() ||
            user.username?.charAt(0)?.toUpperCase() ||
            "U"
        );
    };

    if (loading) {
        return (
            <div className="flex h-screen overflow-hidden bg-gray-50">
                <Sidebar />

                <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                    <Topbar />

                    <main className="min-h-0 min-w-0 flex-1 overflow-y-auto">
                        <div className="p-5">
                            <div className="mx-auto w-full max-w-7xl overflow-hidden rounded-xl border border-gray-200 bg-white">
                                <div className="border-b border-gray-200 px-6 py-4">
                                    <div className="h-5 w-32 animate-pulse rounded bg-gray-200" />
                                </div>

                                <div className="px-6 py-8">
                                    <div className="animate-pulse">
                                        <div className="flex items-center gap-4">
                                            <div className="h-16 w-16 rounded-full bg-gray-200" />

                                            <div className="space-y-2">
                                                <div className="h-5 w-48 rounded bg-gray-200" />
                                                <div className="h-4 w-32 rounded bg-gray-200" />
                                            </div>
                                        </div>

                                        <div className="mt-10 space-y-5">
                                            <div className="h-4 w-40 rounded bg-gray-200" />
                                            <div className="h-16 rounded bg-gray-100" />
                                            <div className="h-16 rounded bg-gray-100" />
                                            <div className="h-16 rounded bg-gray-100" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    const isITSupport =
        user.role_name === "IT Support Specialist";

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
            <Sidebar />

            <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                <Topbar />

                <main className="min-h-0 min-w-0 flex-1 overflow-y-auto">
                    <div className="p-5">
                        <div className="mx-auto w-full max-w-7xl overflow-hidden rounded-xl border border-gray-200 bg-white">
                            <div className="flex flex-col gap-3 border-b border-gray-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate("/user-management")
                                    }
                                    className="inline-flex min-h-[40px] cursor-pointer items-center gap-2 self-start rounded-lg px-2 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
                                >
                                    <ArrowLeft size={17} />
                                    Back to Users
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate(
                                            `/user-management/${user.id}/edit`
                                        )
                                    }
                                    className="inline-flex min-h-[40px] cursor-pointer items-center justify-center rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#1D4ED8]"
                                >
                                    Edit User
                                </button>
                            </div>

                            <div className="border-b border-gray-200 px-6 py-8">
                                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-blue-50 text-lg font-semibold text-[#2563EB]">
                                            {getInitials()}
                                        </div>

                                        <div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h1 className="text-xl font-semibold text-gray-900">
                                                    {user.full_name}
                                                </h1>

                                                <span
                                                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                                        user.is_active
                                                            ? "bg-green-50 text-green-700"
                                                            : "bg-gray-100 text-gray-500"
                                                    }`}
                                                >
                                                    {user.is_active
                                                        ? "Active"
                                                        : "Inactive"}
                                                </span>
                                            </div>

                                            <p className="mt-1 text-sm text-gray-500">
                                                {user.role_name ||
                                                    "No role"}
                                            </p>

                                            <p className="mt-1 text-sm font-medium text-[#2563EB]">
                                                {user.user_code}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <section className="px-6 py-8">
                                    <div className="mb-6 flex items-center gap-2">
                                        <UserRound
                                            size={18}
                                            className="text-[#2563EB]"
                                        />

                                        <h2 className="text-base font-semibold text-gray-900">
                                            Account Information
                                        </h2>
                                    </div>

                                    <div className="grid grid-cols-1 gap-x-10 gap-y-7 sm:grid-cols-2">
                                        <DetailItem
                                            label="Username"
                                            value={user.username}
                                        />

                                        <DetailItem
                                            label="Email"
                                            value={
                                                user.email ||
                                                "No email provided"
                                            }
                                            icon={
                                                <Mail size={16} />
                                            }
                                        />

                                        <DetailItem
                                            label="First Name"
                                            value={
                                                user.first_name ||
                                                "—"
                                            }
                                        />

                                        <DetailItem
                                            label="Last Name"
                                            value={
                                                user.last_name ||
                                                "—"
                                            }
                                        />
                                    </div>
                                </section>

                                <section className="border-t border-gray-200 px-6 py-8">
                                    <div className="mb-6 flex items-center gap-2">
                                        <Building2
                                            size={18}
                                            className="text-[#2563EB]"
                                        />

                                        <h2 className="text-base font-semibold text-gray-900">
                                            Organization
                                        </h2>
                                    </div>

                                    <div className="grid grid-cols-1 gap-x-10 gap-y-7 sm:grid-cols-2">
                                        {user.employee_department && (
                                            <DetailItem
                                                label="Employee Department"
                                                value={
                                                    user
                                                        .employee_department
                                                        .name
                                                }
                                                icon={
                                                    <BriefcaseBusiness
                                                        size={16}
                                                    />
                                                }
                                            />
                                        )}

                                        {user.it_department && (
                                            <DetailItem
                                                label="IT Department"
                                                value={
                                                    user
                                                        .it_department
                                                        .name
                                                }
                                                icon={
                                                    <BriefcaseBusiness
                                                        size={16}
                                                    />
                                                }
                                            />
                                        )}

                                        <DetailItem
                                            label="Office Location"
                                            value={
                                                user
                                                    .office_location
                                                    ?.name || "—"
                                            }
                                            icon={
                                                <MapPin size={16} />
                                            }
                                        />

                                        <DetailItem
                                            label="Role"
                                            value={
                                                user.role_name ||
                                                "—"
                                            }
                                        />
                                    </div>
                                </section>

                                {isITSupport && (
                                    <section className="border-t border-gray-200 px-6 py-8">
                                        <div className="mb-6 flex items-center gap-2">
                                            <Clock3
                                                size={18}
                                                className="text-[#2563EB]"
                                            />

                                            <h2 className="text-base font-semibold text-gray-900">
                                                IT Support Details
                                            </h2>
                                        </div>

                                        <div className="grid grid-cols-1 gap-x-10 gap-y-7 sm:grid-cols-2">
                                            <DetailItem
                                                label="Current Workload"
                                                value={
                                                    user.current_workload ??
                                                    "—"
                                                }
                                            />

                                            <DetailItem
                                                label="Workload Limit"
                                                value={
                                                    user.workload_limit ??
                                                    "—"
                                                }
                                            />

                                            <DetailItem
                                                label="Availability"
                                                value={
                                                    user.availability_status
                                                        ? formatStatus(
                                                              user.availability_status
                                                          )
                                                        : "—"
                                                }
                                            />

                                            <div>
                                                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">
                                                    Specializations
                                                </p>

                                                {user.specializations
                                                    ?.length ? (
                                                    <div className="flex flex-wrap gap-2">
                                                        {user.specializations.map(
                                                            (
                                                                specialization
                                                            ) => (
                                                                <span
                                                                    key={
                                                                        specialization.id
                                                                    }
                                                                    className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-medium text-[#2563EB]"
                                                                >
                                                                    {
                                                                        specialization.name
                                                                    }
                                                                </span>
                                                            )
                                                        )}
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-gray-500">
                                                        No specializations
                                                        assigned
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </section>
                                )}

                                <section className="border-t border-gray-200 px-6 py-8">
                                    <div className="mb-6 flex items-center gap-2">
                                        <CalendarDays
                                            size={18}
                                            className="text-[#2563EB]"
                                        />

                                        <h2 className="text-base font-semibold text-gray-900">
                                            Account Audit
                                        </h2>
                                    </div>

                                    <div className="grid grid-cols-1 gap-x-10 gap-y-7 sm:grid-cols-2">
                                        <DetailItem
                                            label="Created"
                                            value={formatDateTime(
                                                user.created_at
                                            )}
                                        />

                                        <DetailItem
                                            label="Last Updated"
                                            value={formatDateTime(
                                                user.updated_at
                                            )}
                                        />
                                    </div>
                                </section>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

function DetailItem({ label, value, icon }) {
    return (
        <div>
            <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-gray-400">
                {icon}
                <span>{label}</span>
            </div>

            <p className="break-words text-sm font-medium text-gray-800">
                {value}
            </p>
        </div>
    );
}

function formatStatus(status) {
    return status
        .replaceAll("_", " ")
        .replace(/\b\w/g, (letter) =>
            letter.toUpperCase()
        );
}