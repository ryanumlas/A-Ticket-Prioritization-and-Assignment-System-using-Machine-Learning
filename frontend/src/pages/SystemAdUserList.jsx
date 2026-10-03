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
            const response = await api.patch(
                `/users/admin/${user.id}/status/`,
                {
                    is_active: !user.is_active,
                }
            );

            toast.success(
                response.data?.message ||
                    (
                        user.is_active
                            ? "User deactivated successfully."
                            : "User activated successfully."
                    )
            );

            await fetchUsers();
        } catch (error) {
            toast.error(
                error.response?.data?.detail ||
                    "Failed to update user status."
            );
        }
    };

    return (
        <div
            className="
                min-h-screen
                bg-gray-50
                overflow-y-auto
                [&::-webkit-scrollbar]:w-px
                [&::-webkit-scrollbar-track]:bg-transparent
                [&::-webkit-scrollbar-thumb]:bg-transparent
                hover:[&::-webkit-scrollbar-thumb]:bg-gray-300
                [&::-webkit-scrollbar-thumb]:rounded-full
            "
        >
            <div className="w-full">
                {/* Header */}
                <div
                    className="
                        flex flex-col gap-4
                        border-b border-gray-200
                        bg-white
                        px-5 py-4
                        sm:flex-row sm:items-center sm:justify-between
                        min-[1280px]:max-[1365px]:gap-3
                        min-[1280px]:max-[1365px]:px-4
                        min-[1280px]:max-[1365px]:py-3
                        min-[1366px]:max-[1537px]:gap-3
                        min-[1366px]:max-[1537px]:px-4
                        min-[1366px]:max-[1537px]:py-3.5
                    "
                >
                    <div>
                        <h1
                            className="
                                text-xl font-semibold text-gray-900
                                min-[1280px]:max-[1365px]:text-lg
                                min-[1366px]:max-[1537px]:text-lg
                            "
                        >
                            User Management
                        </h1>

                        <p
                            className="
                                mt-0.5 text-sm text-gray-500
                                min-[1280px]:max-[1365px]:text-[11px]
                                min-[1366px]:max-[1537px]:text-xs
                            "
                        >
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
                        className="
                            inline-flex min-h-[40px]
                            cursor-pointer items-center justify-center
                            gap-2 rounded-lg
                            bg-[#2563EB]
                            px-4 py-2
                            text-sm font-medium text-white
                            transition hover:bg-[#1D4ED8]
                            min-[1280px]:max-[1365px]:min-h-[36px]
                            min-[1280px]:max-[1365px]:gap-1.5
                            min-[1280px]:max-[1365px]:px-3
                            min-[1280px]:max-[1365px]:py-1.5
                            min-[1280px]:max-[1365px]:text-[11px]
                            min-[1366px]:max-[1537px]:min-h-[38px]
                            min-[1366px]:max-[1537px]:gap-1.5
                            min-[1366px]:max-[1537px]:px-3.5
                            min-[1366px]:max-[1537px]:py-1.5
                            min-[1366px]:max-[1537px]:text-xs
                        "
                    >
                        <Plus
                            size={17}
                            className="
                                min-[1280px]:max-[1365px]:size-3.5
                                min-[1366px]:max-[1537px]:size-3.5
                            "
                        />
                        Create User
                    </button>
                </div>

                {/* Role Tabs */}
                <div
                    className="
                        border-b border-gray-200
                        bg-white
                        px-5 py-3
                        min-[1280px]:max-[1365px]:px-4
                        min-[1280px]:max-[1365px]:py-2.5
                        min-[1366px]:max-[1537px]:px-4
                        min-[1366px]:max-[1537px]:py-2.5
                    "
                >
                    <div
                        className="
                            flex w-fit flex-wrap items-center gap-1
                            rounded-lg bg-gray-100 p-1
                            min-[1280px]:max-[1365px]:gap-0.5
                            min-[1280px]:max-[1365px]:p-0.5
                            min-[1366px]:max-[1537px]:gap-0.5
                            min-[1366px]:max-[1537px]:p-0.5
                        "
                    >
                        <button
                            type="button"
                            onClick={() => handleRoleChange("")}
                            className={`flex cursor-pointer items-center justify-center rounded-md px-4 py-2.5 text-sm font-medium transition min-[1280px]:max-[1365px]:px-3 min-[1280px]:max-[1365px]:py-2 min-[1280px]:max-[1365px]:text-[11px] min-[1366px]:max-[1537px]:px-3.5 min-[1366px]:max-[1537px]:py-2 min-[1366px]:max-[1537px]:text-xs ${
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
                                onClick={() =>
                                    handleRoleChange(role.name)
                                }
                                className={`flex cursor-pointer items-center justify-center rounded-md px-4 py-2.5 text-sm font-medium transition min-[1280px]:max-[1365px]:px-3 min-[1280px]:max-[1365px]:py-2 min-[1280px]:max-[1365px]:text-[11px] min-[1366px]:max-[1537px]:px-3.5 min-[1366px]:max-[1537px]:py-2 min-[1366px]:max-[1537px]:text-xs ${
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
                <div
                    className="
                        border-b border-gray-200
                        bg-white
                        px-5 py-3
                        min-[1280px]:max-[1365px]:px-4
                        min-[1280px]:max-[1365px]:py-2.5
                        min-[1366px]:max-[1537px]:px-4
                        min-[1366px]:max-[1537px]:py-2.5
                    "
                >
                    <div
                        className="
                            flex flex-col gap-3
                            md:flex-row md:items-center md:justify-between
                            min-[1280px]:max-[1365px]:gap-2
                            min-[1366px]:max-[1537px]:gap-2.5
                        "
                    >
                        <div
                            className="
                                relative w-full md:max-w-md
                                min-[1280px]:max-[1365px]:md:max-w-sm
                            "
                        >
                            <Search
                                size={17}
                                className="
                                    absolute left-3 top-1/2
                                    -translate-y-1/2 text-gray-400
                                    min-[1280px]:max-[1365px]:left-2.5
                                    min-[1280px]:max-[1365px]:size-3.5
                                    min-[1366px]:max-[1537px]:left-2.5
                                    min-[1366px]:max-[1537px]:size-3.5
                                "
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
                                className="
                                    h-10 w-full
                                    rounded-lg border border-gray-300
                                    bg-white
                                    pl-9 pr-3
                                    text-sm text-gray-900
                                    outline-none transition
                                    placeholder:text-gray-400
                                    focus:border-[#2563EB]
                                    focus:ring-2 focus:ring-blue-100
                                    min-[1280px]:max-[1365px]:h-9
                                    min-[1280px]:max-[1365px]:pl-8
                                    min-[1280px]:max-[1365px]:pr-2.5
                                    min-[1280px]:max-[1365px]:text-[11px]
                                    min-[1366px]:max-[1537px]:h-9
                                    min-[1366px]:max-[1537px]:pl-8
                                    min-[1366px]:max-[1537px]:pr-2.5
                                    min-[1366px]:max-[1537px]:text-xs
                                "
                            />
                        </div>

                        <div
                            className="
                                flex items-center gap-3
                                min-[1280px]:max-[1365px]:gap-2
                                min-[1366px]:max-[1537px]:gap-2.5
                            "
                        >
                            <select
                                value={status}
                                onChange={(event) =>
                                    handleStatusChange(
                                        event.target.value
                                    )
                                }
                                className="
                                    h-10 cursor-pointer
                                    rounded-lg border border-gray-300
                                    bg-white px-3
                                    text-sm text-gray-700
                                    outline-none transition
                                    focus:border-[#2563EB]
                                    focus:ring-2 focus:ring-blue-100
                                    min-[1280px]:max-[1365px]:h-9
                                    min-[1280px]:max-[1365px]:px-2.5
                                    min-[1280px]:max-[1365px]:text-[11px]
                                    min-[1366px]:max-[1537px]:h-9
                                    min-[1366px]:max-[1537px]:px-2.5
                                    min-[1366px]:max-[1537px]:text-xs
                                "
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
                                className="
                                    h-10 cursor-pointer
                                    rounded-lg border border-gray-300
                                    bg-white px-3
                                    text-sm text-gray-700
                                    outline-none transition
                                    focus:border-[#2563EB]
                                    focus:ring-2 focus:ring-blue-100
                                    min-[1280px]:max-[1365px]:h-9
                                    min-[1280px]:max-[1365px]:px-2.5
                                    min-[1280px]:max-[1365px]:text-[11px]
                                    min-[1366px]:max-[1537px]:h-9
                                    min-[1366px]:max-[1537px]:px-2.5
                                    min-[1366px]:max-[1537px]:text-xs
                                "
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
                <div
                    className="
                        flex flex-col gap-3
                        border-t border-gray-200
                        bg-white
                        px-5 py-3
                        sm:flex-row sm:items-center sm:justify-between
                        min-[1280px]:max-[1365px]:gap-2
                        min-[1280px]:max-[1365px]:px-4
                        min-[1280px]:max-[1365px]:py-2.5
                        min-[1366px]:max-[1537px]:gap-2.5
                        min-[1366px]:max-[1537px]:px-4
                        min-[1366px]:max-[1537px]:py-2.5
                    "
                >
                    <p
                        className="
                            text-sm text-gray-500
                            min-[1280px]:max-[1365px]:text-[11px]
                            min-[1366px]:max-[1537px]:text-xs
                        "
                    >
                        Showing {users.length} of {totalUsers} users
                    </p>

                    <div
                        className="
                            flex items-center gap-2
                            min-[1280px]:max-[1365px]:gap-1.5
                            min-[1366px]:max-[1537px]:gap-1.5
                        "
                    >
                        <button
                            type="button"
                            disabled={page <= 1}
                            onClick={() =>
                                setPage((current) =>
                                    Math.max(current - 1, 1)
                                )
                            }
                            className={`rounded-lg border px-3 py-2 text-sm font-medium transition min-[1280px]:max-[1365px]:px-2.5 min-[1280px]:max-[1365px]:py-1.5 min-[1280px]:max-[1365px]:text-[11px] min-[1366px]:max-[1537px]:px-2.5 min-[1366px]:max-[1537px]:py-1.5 min-[1366px]:max-[1537px]:text-xs ${
                                page <= 1
                                    ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                                    : "cursor-pointer border-[#2563EB] bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
                            }`}
                        >
                            Previous
                        </button>

                        <span
                            className="
                                min-w-[80px]
                                text-center text-sm text-gray-600
                                min-[1280px]:max-[1365px]:min-w-[65px]
                                min-[1280px]:max-[1365px]:text-[11px]
                                min-[1366px]:max-[1537px]:min-w-[70px]
                                min-[1366px]:max-[1537px]:text-xs
                            "
                        >
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
                            className={`rounded-lg border px-3 py-2 text-sm font-medium transition min-[1280px]:max-[1365px]:px-2.5 min-[1280px]:max-[1365px]:py-1.5 min-[1280px]:max-[1365px]:text-[11px] min-[1366px]:max-[1537px]:px-2.5 min-[1366px]:max-[1537px]:py-1.5 min-[1366px]:max-[1537px]:text-xs ${
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