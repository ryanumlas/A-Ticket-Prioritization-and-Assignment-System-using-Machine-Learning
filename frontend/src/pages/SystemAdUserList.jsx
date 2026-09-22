import { useEffect, useState } from "react";
import { Search, ChevronLeft, ChevronRight, X, Plus } from "lucide-react";
import api from "../api";
import SystemAdUserListContent from "../components/SystemAdUserListContent";
import { useNavigate } from "react-router-dom";

const roleTabs = [
    { label: "All Users", value: "" },
    { label: "Employees", value: "Employee" },
    { label: "IT Support", value: "IT Support Specialist" },
    { label: "IT Service Desk", value: "IT Service Desk" },
    { label: "Supervisor", value: "Supervisor" },
    { label: "Administrators", value: "System Administrator" },
];

export default function SystemAdUserList() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selectedRole, setSelectedRole] = useState("");
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("All");

    const [currentPage, setCurrentPage] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);

    const pageSize = 15;
    
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);

                const params = {
                    page: currentPage,
                };

                if (selectedRole) {
                    params.role = selectedRole;
                }

                if (search.trim()) {
                    params.search = search.trim();
                }

                if (status !== "All") {
                    params.status = status.toLowerCase();
                }

                const response = await api.get(
                    "/users/admin/list/",
                    { params }
                );

                setUsers(response.data.results || []);
                setTotalUsers(response.data.count || 0);
            } catch {
                setUsers([]);
                setTotalUsers(0);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [
        currentPage,
        selectedRole,
        search,
        status,
    ]);

    const totalPages = Math.max(
        1,
        Math.ceil(totalUsers / pageSize)
    );

    const showingStart =
        totalUsers === 0
            ? 0
            : (currentPage - 1) * pageSize + 1;

    const showingEnd = Math.min(
        currentPage * pageSize,
        totalUsers
    );

    const changePage = (page) => {
        if (page < 1 || page > totalPages) {
            return;
        }

        setCurrentPage(page);
    };

    const hasActiveFilters =
        search.trim() !== "" ||
        status !== "All";

    const clearFilters = () => {
        setSearch("");
        setStatus("All");
        setCurrentPage(1);
    };

    const handleRoleChange = (role) => {
        setSelectedRole(role);
        setCurrentPage(1);
    };

    const handleCreateUser = () => {
        navigate("/user-management/create");
    };

    return (
        <div className="w-full">
            <div className="flex items-center justify-between p-6">
                <div>
                    <h1 className="text-2xl font-semibold text-black">
                        User Management
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Manage system users, roles, and accounts.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleCreateUser}
                    className="inline-flex h-10 items-center gap-2 cursor-pointer rounded-md bg-[#4C4CF9] px-4 text-sm font-medium text-white transition-colors hover:bg-[#3f3fe8]"
                >
                    <Plus size={17} strokeWidth={2} />
                    Create User
                </button>
            </div>

            <div className="overflow-hidden border border-gray-300 bg-white">
                <div className="border-b border-gray-300 px-4 pt-4">
                    <div className="flex items-center gap-6 overflow-x-auto">
                        {roleTabs.map((tab) => (
                            <button
                                key={tab.label}
                                type="button"
                                onClick={() =>
                                    handleRoleChange(tab.value)
                                }
                                className={`relative whitespace-nowrap pb-3 text-sm font-medium transition-colors ${
                                    selectedRole === tab.value
                                        ? "text-[#4C4CF9]"
                                        : "text-gray-500 hover:text-black"
                                }`}
                            >
                                {tab.label}

                                {selectedRole === tab.value && (
                                    <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[#4C4CF9]" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center justify-between gap-4 border-b border-gray-300 p-4">
                    <div className="relative w-full max-w-[360px]">
                        <Search
                            size={17}
                            strokeWidth={2}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />

                        <input
                            type="text"
                            value={search}
                            onChange={(event) => {
                                setSearch(event.target.value);
                                setCurrentPage(1);
                            }}
                            placeholder="Search name, user code, username..."
                            className="h-10 w-full rounded-md border border-gray-300 bg-white pl-9 pr-3 text-sm text-black outline-none transition-colors placeholder:text-gray-400 focus:border-[#4C4CF9]"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <select
                            value={status}
                            onChange={(event) => {
                                setStatus(event.target.value);
                                setCurrentPage(1);
                            }}
                            className="h-10 min-w-[130px] cursor-pointer rounded-md border border-gray-300 bg-white px-3 text-sm text-black outline-none transition-colors focus:border-[#4C4CF9]"
                        >
                            <option value="All">
                                All Status
                            </option>
                            <option value="Active">
                                Active
                            </option>
                            <option value="Inactive">
                                Inactive
                            </option>
                        </select>

                        {hasActiveFilters && (
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="inline-flex h-10 items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-black"
                            >
                                <X size={15} />
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                <SystemAdUserListContent
                    users={users}
                    selectedRole={selectedRole}
                    loading={loading}
                />

                {!loading && (
                    <div className="flex min-h-[60px] items-center justify-between border-t border-gray-300 px-5">
                        <p className="text-sm text-gray-500">
                            Showing{" "}
                            <span className="font-medium text-black">
                                {showingStart}–{showingEnd}
                            </span>{" "}
                            of{" "}
                            <span className="font-medium text-black">
                                {totalUsers}
                            </span>{" "}
                            users
                        </p>

                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={() =>
                                    changePage(currentPage - 1)
                                }
                                disabled={currentPage === 1}
                                className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <ChevronLeft size={16} />
                            </button>

                            {Array.from(
                                { length: totalPages },
                                (_, index) => index + 1
                            ).map((page) => (
                                <button
                                    key={page}
                                    type="button"
                                    onClick={() =>
                                        changePage(page)
                                    }
                                    className={`flex h-8 min-w-8 items-center justify-center rounded-md cursor-pointer border px-2 text-sm font-medium transition-colors ${
                                        currentPage === page
                                            ? "border-[#4C4CF9] bg-[#4C4CF9] text-white"
                                            : "border-gray-300 bg-white text-black hover:bg-gray-50"
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                type="button"
                                onClick={() =>
                                    changePage(currentPage + 1)
                                }
                                disabled={
                                    currentPage === totalPages
                                }
                                className="flex h-8 w-8 items-center cursor-pointer justify-center rounded-md border border-gray-300 bg-white text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}