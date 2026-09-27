import { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import api from "../api";
import SystemAdUserListContent from "../components/SystemAdUserListContent";

export default function SystemAdUserList() {
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);

    const [selectedRole, setSelectedRole] = useState("");
    const [status, setStatus] = useState("");
    const [search, setSearch] = useState("");

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(15);

    const [totalPages, setTotalPages] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRoles();
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [selectedRole, status, search, page, pageSize]);

    const fetchRoles = async () => {
        try {
            const response = await api.get(
                "/users/admin/create-options/roles/"
            );

            setRoles(response.data || []);
        } catch {
            toast.error("Failed to load user roles.");
        }
    };

    const fetchUsers = async () => {
        setLoading(true);

        try {
            const params = {
                page,
                page_size: pageSize,
            };

            if (selectedRole) {
                params.role = selectedRole;
            }

            if (status) {
                params.status = status;
            }

            if (search.trim()) {
                params.search = search.trim();
            }

            const response = await api.get(
                "/users/admin/list/",
                {
                    params,
                }
            );

            const data = response.data;

            setUsers(data.results || []);
            setTotalUsers(data.count || 0);

            const calculatedPages = Math.ceil(
                (data.count || 0) / pageSize
            );

            setTotalPages(calculatedPages || 1);
        } catch {
            toast.error("Failed to load users.");

            setUsers([]);
            setTotalUsers(0);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = (role) => {
        setSelectedRole(role);
        setPage(1);
    };

    const handleStatusChange = (value) => {
        setStatus(value);
        setPage(1);
    };

    const handleSearchChange = (value) => {
        setSearch(value);
        setPage(1);
    };

    const handlePageSizeChange = (value) => {
        setPageSize(Number(value));
        setPage(1);
    };

    const handleViewDetails = (user) => {
        navigate(`/user-management/${user.id}`);
    };

    const handleEditUser = (user) => {
        navigate(`/user-management/${user.id}/edit`);
    };

    const handleToggleStatus = async (user) => {
        try {
            await api.patch(
                `/users/admin/${user.id}/status/`,
                {
                    is_active: !user.is_active,
                }
            );

            toast.success(
                user.is_active
                    ? "User deactivated successfully."
                    : "User activated successfully."
            );

            fetchUsers();
        } catch {
            toast.error("Failed to update user status.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="w-full">
                {/* Header */}
                <div className="flex flex-col gap-4 border-b border-gray-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900">
                            User Management
                        </h1>

                        <p className="mt-0.5 text-sm text-gray-500">
                            Manage employees, IT support staff,
                            supervisors, service desk users, and
                            administrators.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/user-management/create")
                        }
                        className="inline-flex min-h-[40px] cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#1D4ED8]"
                    >
                        <Plus size={17} />
                        Create User
                    </button>
                </div>

                <div className="border-b border-gray-200 bg-white px-5 py-3">
                    <div className="flex w-fit flex-wrap items-center gap-1 rounded-lg bg-gray-100 p-1">
                        <button
                            type="button"
                            onClick={() => handleRoleChange("")}
                            className={`flex cursor-pointer items-center justify-center rounded-md px-4 py-2.5 text-sm font-medium transition ${
                                selectedRole === ""
                                    ? "bg-[#4C4CF9] text-white shadow-sm"
                                    : "text-gray-500 hover:bg-white hover:text-black"
                            }`}
                        >
                            All Users
                        </button>

                        {roles.map((role) => (
                            <button
                                key={role.id}
                                type="button"
                                onClick={() => handleRoleChange(role.name)}
                                className={`flex cursor-pointer items-center justify-center rounded-md px-4 py-2.5 text-sm font-medium transition ${
                                    selectedRole === role.name
                                        ? "bg-[#4C4CF9] text-white shadow-sm"
                                        : "text-gray-500 hover:bg-white hover:text-black"
                                }`}
                            >
                                {role.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Filters */}
                <div className="border-b border-gray-200 bg-white px-5 py-3">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="relative w-full md:max-w-md">
                            <Search
                                size={17}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />

                            <input
                                type="text"
                                value={search}
                                onChange={(event) =>
                                    handleSearchChange(
                                        event.target.value
                                    )
                                }
                                placeholder="Search name, username, user code, or email..."
                                className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        <div className="flex items-center gap-3">
                            <select
                                value={status}
                                onChange={(event) =>
                                    handleStatusChange(
                                        event.target.value
                                    )
                                }
                                className="h-10 cursor-pointer rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100"
                            >
                                <option value="">
                                    All Status
                                </option>

                                <option value="active">
                                    Active
                                </option>

                                <option value="inactive">
                                    Inactive
                                </option>
                            </select>

                            <select
                                value={pageSize}
                                onChange={(event) =>
                                    handlePageSizeChange(
                                        event.target.value
                                    )
                                }
                                className="h-10 cursor-pointer rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100"
                            >
                                <option value={15}>
                                    15 / page
                                </option>

                                <option value={25}>
                                    25 / page
                                </option>

                                <option value={50}>
                                    50 / page
                                </option>

                                <option value={100}>
                                    100 / page
                                </option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* User Table */}
                <div className="bg-white">
                    <SystemAdUserListContent
                        users={users}
                        selectedRole={selectedRole}
                        loading={loading}
                        onViewDetails={handleViewDetails}
                        onEditUser={handleEditUser}
                        onToggleStatus={handleToggleStatus}
                    />
                </div>

                {/* Pagination */}
                <div className="flex flex-col gap-3 border-t border-gray-200 bg-white px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-gray-500">
                        Showing {users.length} of {totalUsers} users
                    </p>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            disabled={page <= 1}
                            onClick={() =>
                                setPage((current) =>
                                    Math.max(current - 1, 1)
                                )
                            }
                            className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                                page <= 1
                                    ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                                    : "cursor-pointer border-[#2563EB] bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
                            }`}
                        >
                            Previous
                        </button>

                        <span className="min-w-[80px] text-center text-sm text-gray-600">
                            Page {page} of {totalPages}
                        </span>

                        <button
                            type="button"
                            disabled={page >= totalPages}
                            onClick={() =>
                                setPage((current) =>
                                    Math.min(
                                        current + 1,
                                        totalPages
                                    )
                                )
                            }
                            className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                                page >= totalPages
                                    ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                                    : "cursor-pointer border-[#2563EB] bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
                            }`}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}