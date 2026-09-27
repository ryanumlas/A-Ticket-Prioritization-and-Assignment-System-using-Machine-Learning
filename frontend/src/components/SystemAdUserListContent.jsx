import { useState } from "react";
import { MoreVertical } from "lucide-react";
import { formatDate } from "../utils/formatDate";

export default function SystemAdUserListContent({
    users = [],
    selectedRole = "",
    loading = false,
    onViewDetails,
    onEditUser,
    onToggleStatus,
}) {
    if (loading) {
        return (
            <div className="flex h-[510px] items-center justify-center bg-white">
                <p className="text-sm text-gray-500">
                    Loading users...
                </p>
            </div>
        );
    }

    const isAllUsers = selectedRole === "";

    const isITSupport =
        selectedRole === "IT Support Specialist";

    const isITServiceDesk =
        selectedRole === "IT Service Desk";

    return (
        <div
            className="
                h-[510px] w-full overflow-auto bg-white
                [&::-webkit-scrollbar]:w-[3px]
                [&::-webkit-scrollbar]:h-[3px]
                [&::-webkit-scrollbar-track]:bg-transparent
                [&::-webkit-scrollbar-thumb]:rounded-full
                [&::-webkit-scrollbar-thumb]:bg-gray-300
                hover:[&::-webkit-scrollbar-thumb]:bg-gray-400
            "
        >
            <table className="w-full table-fixed text-sm">
                <thead className="sticky top-0 z-10 bg-gray-50">
                    {isAllUsers ? (
                        <tr className="border-b border-gray-300 text-left">
                            <th className="w-[10%] px-2.5 py-3 font-semibold text-black">
                                User Code
                            </th>

                            <th className="w-[16%] px-2.5 py-3 font-semibold text-black">
                                User
                            </th>

                            <th className="w-[13%] px-2.5 py-3 font-semibold text-black">
                                Role
                            </th>

                            <th className="w-[16%] px-2.5 py-3 font-semibold text-black">
                                Department
                            </th>

                            <th className="w-[15%] px-2.5 py-3 font-semibold text-black">
                                Office Location
                            </th>

                            <th className="w-[9%] px-2.5 py-3 font-semibold text-black">
                                Status
                            </th>

                            <th className="w-[8%] px-2.5 py-3 font-semibold text-black">
                                Created
                            </th>

                            <th className="w-[7%] px-2 py-3 text-center font-semibold text-black">
                                Actions
                            </th>
                        </tr>
                    ) : isITSupport ? (
                        <tr className="border-b border-gray-300 text-left">
                            <th className="w-[11%] px-2.5 py-3 font-semibold text-black">
                                User Code
                            </th>

                            <th className="w-[17%] px-2.5 py-3 font-semibold text-black">
                                User
                            </th>

                            <th className="w-[16%] px-2.5 py-3 font-semibold text-black">
                                IT Department
                            </th>

                            <th className="w-[16%] px-2.5 py-3 font-semibold text-black">
                                Office Location
                            </th>

                            <th className="w-[9%] px-2.5 py-3 font-semibold text-black">
                                Workload
                            </th>

                            <th className="w-[11%] px-2.5 py-3 font-semibold text-black">
                                Availability
                            </th>

                            <th className="w-[8%] px-2.5 py-3 font-semibold text-black">
                                Status
                            </th>

                            <th className="w-[7%] px-2.5 py-3 font-semibold text-black">
                                Created
                            </th>

                            <th className="w-[5%] px-2 py-3 text-center font-semibold text-black">
                                Actions
                            </th>
                        </tr>
                    ) : isITServiceDesk ? (
                        <tr className="border-b border-gray-300 text-left">
                            <th className="w-[13%] px-2.5 py-3 font-semibold text-black">
                                User Code
                            </th>

                            <th className="w-[22%] px-2.5 py-3 font-semibold text-black">
                                User
                            </th>

                            <th className="w-[21%] px-2.5 py-3 font-semibold text-black">
                                IT Department
                            </th>

                            <th className="w-[19%] px-2.5 py-3 font-semibold text-black">
                                Office Location
                            </th>

                            <th className="w-[10%] px-2.5 py-3 font-semibold text-black">
                                Status
                            </th>

                            <th className="w-[9%] px-2.5 py-3 font-semibold text-black">
                                Created
                            </th>

                            <th className="w-[6%] px-2 py-3 text-center font-semibold text-black">
                                Actions
                            </th>
                        </tr>
                    ) : (
                        <tr className="border-b border-gray-300 text-left">
                            <th className="w-[13%] px-2.5 py-3 font-semibold text-black">
                                User Code
                            </th>

                            <th className="w-[17%] px-2.5 py-3 font-semibold text-black">
                                User
                            </th>

                            <th className="w-[18%] px-2.5 py-3 font-semibold text-black">
                                Department
                            </th>

                            <th className="w-[17%] px-2.5 py-3 font-semibold text-black">
                                Office Location
                            </th>

                            <th className="w-[10%] px-2.5 py-3 font-semibold text-black">
                                Status
                            </th>

                            <th className="w-[9%] px-2.5 py-3 font-semibold text-black">
                                Created
                            </th>

                            <th className="w-[6%] px-2 py-3 text-center font-semibold text-black">
                                Actions
                            </th>
                        </tr>
                    )}
                </thead>

                <tbody>
                    {users.length > 0 ? (
                        users.map((user) => (
                            <UserRow
                                key={user.id}
                                user={user}
                                isAllUsers={isAllUsers}
                                isITSupport={isITSupport}
                                isITServiceDesk={isITServiceDesk}
                                onViewDetails={onViewDetails}
                                onEditUser={onEditUser}
                                onToggleStatus={onToggleStatus}
                            />
                        ))
                    ) : (
                        <tr>
                            <td
                                colSpan={
                                    isAllUsers
                                        ? 8
                                        : isITSupport
                                        ? 9
                                        : isITServiceDesk
                                        ? 7
                                        : 7
                                }
                                className="px-6 py-16 text-center"
                            >
                                <p className="font-medium text-black">
                                    No users found
                                </p>

                                <p className="mt-1 text-sm text-gray-500">
                                    There are currently no users
                                    matching your search or filters.
                                </p>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

function UserRow({
    user,
    isAllUsers,
    isITSupport,
    isITServiceDesk,
    onViewDetails,
    onEditUser,
    onToggleStatus,
}) {
    const [menuOpen, setMenuOpen] = useState(false);

    const handleViewDetails = () => {
        setMenuOpen(false);
        onViewDetails?.(user);
    };

    const handleEditUser = () => {
        setMenuOpen(false);
        onEditUser?.(user);
    };

    const handleToggleStatus = () => {
        setMenuOpen(false);
        onToggleStatus?.(user);
    };

    const employeeDepartment = user.employee_department;
    const itDepartment = user.it_department;

    return (
        <tr className="border-b border-gray-200 transition-colors hover:bg-gray-50 last:border-b-0">
            <td
                className={`${
                    isAllUsers ? "px-2.5" : "px-3"
                } py-3.5`}
            >
                <span className="whitespace-nowrap font-semibold text-black">
                    {user.user_code || "-"}
                </span>
            </td>

            <td
                className={`${
                    isAllUsers ? "px-2.5" : "px-3"
                } py-3.5`}
            >
                <p
                    className="truncate font-medium text-black"
                    title={user.full_name}
                >
                    {user.full_name || "-"}
                </p>

                <p
                    className="mt-0.5 truncate text-xs text-gray-500"
                    title={
                        user.email || "No email provided"
                    }
                >
                    {user.email || "No email provided"}
                </p>
            </td>

            {isAllUsers ? (
                <>
                    <td className="px-2.5 py-3.5">
                        <RoleBadge
                            role={user.role_name}
                        />
                    </td>

                    <td className="px-2.5 py-3.5">
                        <p
                            className="truncate text-black"
                            title={
                                user.role_name ===
                                    "IT Support Specialist" ||
                                user.role_name ===
                                    "IT Service Desk"
                                    ? itDepartment ||
                                      "No IT Department"
                                    : employeeDepartment ||
                                      "No Department"
                            }
                        >
                            {user.role_name ===
                                "IT Support Specialist" ||
                            user.role_name ===
                                "IT Service Desk"
                                ? itDepartment ||
                                  "No IT Department"
                                : employeeDepartment ||
                                  "No Department"}
                        </p>
                    </td>

                    <td className="px-2.5 py-3.5">
                        <p
                            className="truncate text-black"
                            title={
                                user.office_location ||
                                "No Office Location"
                            }
                        >
                            {user.office_location ||
                                "No Office Location"}
                        </p>
                    </td>

                    <td className="px-2.5 py-3.5">
                        <StatusBadge
                            isActive={user.is_active}
                        />
                    </td>

                    <td className="px-2.5 py-3.5">
                        <span className="whitespace-nowrap font-medium text-black">
                            {user.created_at
                                ? formatDate(
                                      user.created_at
                                  )
                                : "-"}
                        </span>
                    </td>
                </>
            ) : isITSupport ? (
                <>
                    <td className="px-3 py-3.5">
                        <p
                            className="truncate text-black"
                            title={
                                itDepartment ||
                                "No IT Department"
                            }
                        >
                            {itDepartment ||
                                "No IT Department"}
                        </p>
                    </td>

                    <td className="px-3 py-3.5">
                        <p
                            className="truncate text-black"
                            title={
                                user.office_location ||
                                "No Office Location"
                            }
                        >
                            {user.office_location ||
                                "No Office Location"}
                        </p>
                    </td>

                    <td className="px-3 py-3.5">
                        {user.current_workload !== null &&
                        user.workload_limit !== null ? (
                            <span className="whitespace-nowrap font-medium text-black">
                                {user.current_workload} /{" "}
                                {user.workload_limit}
                            </span>
                        ) : (
                            "-"
                        )}
                    </td>

                    <td className="px-3 py-3.5">
                        <AvailabilityBadge
                            status={
                                user.availability_status
                            }
                        />
                    </td>

                    <td className="px-3 py-3.5">
                        <StatusBadge
                            isActive={user.is_active}
                        />
                    </td>

                    <td className="px-3 py-3.5">
                        <span className="whitespace-nowrap font-medium text-black">
                            {user.created_at
                                ? formatDate(
                                      user.created_at
                                  )
                                : "-"}
                        </span>
                    </td>
                </>
            ) : isITServiceDesk ? (
                <>
                    <td className="px-3 py-3.5">
                        <p
                            className="truncate text-black"
                            title={
                                itDepartment ||
                                "No IT Department"
                            }
                        >
                            {itDepartment ||
                                "No IT Department"}
                        </p>
                    </td>

                    <td className="px-3 py-3.5">
                        <p
                            className="truncate text-black"
                            title={
                                user.office_location ||
                                "No Office Location"
                            }
                        >
                            {user.office_location ||
                                "No Office Location"}
                        </p>
                    </td>

                    <td className="px-3 py-3.5">
                        <StatusBadge
                            isActive={user.is_active}
                        />
                    </td>

                    <td className="px-3 py-3.5">
                        <span className="whitespace-nowrap font-medium text-black">
                            {user.created_at
                                ? formatDate(
                                      user.created_at
                                  )
                                : "-"}
                        </span>
                    </td>
                </>
            ) : (
                <>
                    <td className="px-3 py-3.5">
                        <p
                            className="truncate text-black"
                            title={
                                employeeDepartment ||
                                "No Department"
                            }
                        >
                            {employeeDepartment ||
                                "No Department"}
                        </p>
                    </td>

                    <td className="px-3 py-3.5">
                        <p
                            className="truncate text-black"
                            title={
                                user.office_location ||
                                "No Office Location"
                            }
                        >
                            {user.office_location ||
                                "No Office Location"}
                        </p>
                    </td>

                    <td className="px-3 py-3.5">
                        <StatusBadge
                            isActive={user.is_active}
                        />
                    </td>

                    <td className="px-3 py-3.5">
                        <span className="whitespace-nowrap font-medium text-black">
                            {user.created_at
                                ? formatDate(
                                      user.created_at
                                  )
                                : "-"}
                        </span>
                    </td>
                </>
            )}

            <td className="px-2 py-3.5 text-center">
                <div className="relative inline-block">
                    <button
                        type="button"
                        onClick={() =>
                            setMenuOpen(
                                (current) => !current
                            )
                        }
                        className="
                            inline-flex h-8 w-8 items-center justify-center
                            rounded-md text-gray-500 transition-colors
                            hover:bg-gray-100 hover:text-black
                        "
                        aria-label={`Actions for ${
                            user.full_name ||
                            user.user_code
                        }`}
                    >
                        <MoreVertical size={18} />
                    </button>

                    {menuOpen && (
                        <div
                            className="
                                absolute right-0 top-9 z-30 w-44
                                overflow-hidden rounded-lg border
                                border-gray-200 bg-white py-1
                                text-left shadow-lg
                            "
                        >
                            <button
                                type="button"
                                onClick={handleViewDetails}
                                className="
                                    w-full px-4 py-2.5 text-left text-sm
                                    text-gray-700 hover:bg-gray-50
                                    hover:text-black
                                "
                            >
                                View Details
                            </button>

                            <button
                                type="button"
                                onClick={handleEditUser}
                                className="
                                    w-full px-4 py-2.5 text-left text-sm
                                    text-gray-700 hover:bg-gray-50
                                    hover:text-black
                                "
                            >
                                Edit User
                            </button>

                            <div className="my-1 border-t border-gray-100" />

                            <button
                                type="button"
                                onClick={handleToggleStatus}
                                className={`w-full px-4 py-2.5 text-left text-sm ${
                                    user.is_active
                                        ? "text-red-600 hover:bg-red-50"
                                        : "text-green-600 hover:bg-green-50"
                                }`}
                            >
                                {user.is_active
                                    ? "Deactivate Account"
                                    : "Activate Account"}
                            </button>
                        </div>
                    )}
                </div>
            </td>
        </tr>
    );
}

function RoleBadge({ role }) {
    const roleStyles = {
        Employee:
            "border-gray-300 bg-gray-50 text-gray-700",

        "IT Support Specialist":
            "border-blue-300 bg-blue-50 text-blue-700",

        "IT Service Desk":
            "border-purple-300 bg-purple-50 text-purple-700",

        "IT Supervisor":
            "border-amber-300 bg-amber-50 text-amber-700",

        "System Administrator":
            "border-red-300 bg-red-50 text-red-700",
    };

    const roleLabels = {
        Employee: "Employee",
        "IT Support Specialist": "IT Support",
        "IT Service Desk": "Service Desk",
        "IT Supervisor": "IT Supervisor",
        "System Administrator": "Administrator",
    };

    const normalizedRole = role || "";

    return (
        <span
            className={`inline-flex whitespace-nowrap rounded-md border px-2 py-1 text-xs font-medium ${
                roleStyles[normalizedRole] ||
                "border-gray-300 bg-gray-50 text-gray-700"
            }`}
        >
            {roleLabels[normalizedRole] ||
                normalizedRole ||
                "-"}
        </span>
    );
}

function StatusBadge({ isActive }) {
    return (
        <span
            className={`inline-flex whitespace-nowrap rounded-md border px-2.5 py-1 text-xs font-medium ${
                isActive
                    ? "border-green-300 bg-green-50 text-green-700"
                    : "border-red-300 bg-red-50 text-red-700"
            }`}
        >
            {isActive ? "Active" : "Inactive"}
        </span>
    );
}

function AvailabilityBadge({ status }) {
    const styles = {
        available:
            "border-green-300 bg-green-50 text-green-700",

        unavailable:
            "border-amber-300 bg-amber-50 text-amber-700",

        offline:
            "border-gray-300 bg-gray-100 text-gray-700",
    };

    const labels = {
        available: "Available",
        unavailable: "Unavailable",
        offline: "Offline",
    };

    const normalizedStatus =
        status?.toLowerCase() || "";

    return (
        <span
            className={`inline-flex whitespace-nowrap rounded-md border px-2.5 py-1 text-xs font-medium ${
                styles[normalizedStatus] ||
                "border-gray-300 bg-gray-100 text-gray-700"
            }`}
        >
            {labels[normalizedStatus] || "-"}
        </span>
    );
}