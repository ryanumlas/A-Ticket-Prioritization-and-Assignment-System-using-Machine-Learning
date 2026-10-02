
import { motion, AnimatePresence } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import {
    RefreshCw,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

import api from "../api";
import SupportWorkloadContents from "../components/Workload/SupportWorkloadContents";

export default function SupportWorkload() {
    const [departments, setDepartments] = useState([]);
    const [scope, setScope] = useState(null);
    const [assignedToMeCount, setAssignedToMeCount] = useState(0);
    const [totalTechnicians, setTotalTechnicians] = useState(0);

    const [selectedDepartment, setSelectedDepartment] = useState("all");
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const fetchWorkload = async (isRefresh = false, requestedPage = page) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const response = await api.get(
                `/tickets/team-workload/?page=${requestedPage}`
            );

            const data = response.data;
            const departmentData = Array.isArray(data?.departments)
                ? data.departments
                : [];

            setDepartments(departmentData);
            setScope(data?.scope || null);
            setAssignedToMeCount(
                Number(data?.assigned_to_me_count || 0)
            );
            setTotalTechnicians(
                Number(data?.total_technicians || 0)
            );
        } catch (err) {
            console.error("Failed to fetch team workload:", err);

            setError(
                err?.response?.data?.error ||
                    "Unable to load team workload."
            );

            setDepartments([]);
            setScope(null);
            setAssignedToMeCount(0);
            setTotalTechnicians(0);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchWorkload(false, page);
    }, [page]);

    const visibleDepartments = useMemo(() => {
        if (selectedDepartment === "all") {
            return departments;
        }

        return departments.filter(
            (department) =>
                String(department.id) === String(selectedDepartment)
        );
    }, [departments, selectedDepartment]);

    const totalActiveTickets = useMemo(
        () =>
            visibleDepartments.reduce(
                (total, department) =>
                    total +
                    Number(department.active_workload_count || 0),
                0
            ),
        [visibleDepartments]
    );

    const departmentPagination = useMemo(
        () =>
            visibleDepartments
                .map((department) => department.pagination)
                .filter(Boolean),
        [visibleDepartments]
    );

    const totalPages =
        departmentPagination.length > 0
            ? Math.max(
                  ...departmentPagination.map(
                      (pagination) =>
                          Number(pagination.total_pages || 1)
                  )
              )
            : 1;

    const hasPreviousPage = page > 1;

    const hasNextPage = departmentPagination.some(
        (pagination) =>
            page < Number(pagination.total_pages || 1)
    );

    const handleDepartmentChange = (event) => {
        setSelectedDepartment(event.target.value);
        setPage(1);
    };

    const handlePreviousPage = () => {
        if (hasPreviousPage && !loading) {
            setPage((current) => Math.max(current - 1, 1));
        }
    };

    const handleNextPage = () => {
        if (hasNextPage && !loading) {
            setPage((current) => current + 1);
        }
    };

    const isSupervisor = scope === "all_departments";
    const isSupportSpecialist = scope === "department";

    return (
        <div className="h-[calc(100vh-4rem)] w-full overflow-y-auto overflow-x-hidden bg-gray-50">
            <div className="mx-auto w-full max-w-[1600px] p-4 sm:p-5 lg:p-6">
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="mb-5"
                >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                            <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">
                                Team Workload
                            </h1>

                            <p className="mt-0.5 text-sm text-gray-500">
                                Monitor your team's current workload and assigned tickets.
                            </p>
                        </div>

                        <motion.button
                            type="button"
                            onClick={() => fetchWorkload(true, page)}
                            disabled={loading || refreshing}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <RefreshCw
                                size={15}
                                className={refreshing ? "animate-spin" : ""}
                            />
                            Refresh
                        </motion.button>
                    </div>
                </motion.div>

                {!loading && !error && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2"
                    >
                        <div className="rounded-xl border border-gray-200 bg-white px-4 py-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                {isSupportSpecialist
                                    ? "Assigned to Me"
                                    : "IT Support"}
                            </p>

                            <p className="mt-1 text-2xl font-semibold text-gray-900">
                                {isSupportSpecialist
                                    ? assignedToMeCount
                                    : totalTechnicians}
                            </p>

                            <p className="mt-0.5 text-xs text-gray-500">
                                {isSupportSpecialist
                                    ? "In Progress tickets assigned to you"
                                    : "Across all departments"}
                            </p>
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-white px-4 py-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Active Workload
                            </p>

                            <p className="mt-1 text-2xl font-semibold text-gray-900">
                                {totalActiveTickets}
                            </p>

                            <p className="mt-0.5 text-xs text-gray-500">
                                {selectedDepartment === "all"
                                    ? isSupervisor
                                        ? "Active tickets across all departments"
                                        : "Active tickets in your department"
                                    : "Active tickets in the selected department"}
                            </p>
                        </div>
                    </motion.div>
                )}

                {!loading &&
                    !error &&
                    isSupervisor &&
                    departments.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.15 }}
                            className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
                        >
                            <div>
                                <p className="text-sm font-semibold text-gray-900">
                                    Department
                                </p>
                                <p className="text-xs text-gray-500">
                                    Filter workload by IT department.
                                </p>
                            </div>

                            <div className="relative w-full sm:w-64">
                                <select
                                    value={selectedDepartment}
                                    onChange={handleDepartmentChange}
                                    className="h-10 w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 pr-9 text-sm text-gray-700 outline-none transition focus:border-[#4C4CF9] focus:ring-2 focus:ring-[#4C4CF9]/10"
                                >
                                    <option value="all">
                                        All Departments
                                    </option>

                                    {departments.map((department) => (
                                        <option
                                            key={department.id}
                                            value={department.id}
                                        >
                                            {department.name}
                                        </option>
                                    ))}
                                </select>

                                <ChevronDown
                                    size={16}
                                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                                />
                            </div>
                        </motion.div>
                    )}

                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="grid grid-cols-1 items-start gap-5 md:grid-cols-2 xl:grid-cols-3"
                        >
                            {[1, 2, 3, 4, 5, 6].map((item) => (
                                <div
                                    key={item}
                                    className="h-64 animate-pulse rounded-xl border border-gray-200 bg-white"
                                />
                            ))}
                        </motion.div>
                    ) : error ? (
                        <motion.div
                            key="error"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="rounded-xl border border-red-200 bg-red-50 px-5 py-6 text-center"
                        >
                            <p className="text-sm font-semibold text-red-800">
                                Unable to load team workload
                            </p>
                            <p className="mt-1 text-xs text-red-600">
                                {error}
                            </p>
                            <button
                                type="button"
                                onClick={() => fetchWorkload(false, page)}
                                className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
                            >
                                Try Again
                            </button>
                        </motion.div>
                    ) : visibleDepartments.length === 0 ? (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="rounded-xl border border-gray-200 bg-white px-5 py-10 text-center"
                        >
                            <p className="text-sm font-semibold text-gray-700">
                                No workload data available
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                                There are no IT Support technicians to display.
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key={`${selectedDepartment}-${page}-${departments.length}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <SupportWorkloadContents
                                departments={visibleDepartments}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {!loading && !error && departments.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25 }}
                        className="mt-6 flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm"
                    >
                        <p className="text-xs text-gray-500">
                            Page{" "}
                            <span className="font-medium text-gray-700">
                                {page}
                            </span>{" "}
                            of{" "}
                            <span className="font-medium text-gray-700">
                                {totalPages}
                            </span>
                        </p>

                        <div className="flex items-center gap-2">
                            <motion.button
                                type="button"
                                onClick={handlePreviousPage}
                                disabled={!hasPreviousPage || loading}
                                whileHover={hasPreviousPage ? { scale: 1.03 } : {}}
                                whileTap={hasPreviousPage ? { scale: 0.97 } : {}}
                                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#4C4CF9] px-3 text-xs font-medium text-white transition-colors hover:bg-[#3F3FE0] disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <ChevronLeft size={15} />
                                Previous
                            </motion.button>

                            <motion.button
                                type="button"
                                onClick={handleNextPage}
                                disabled={!hasNextPage || loading}
                                whileHover={hasNextPage ? { scale: 1.03 } : {}}
                                whileTap={hasNextPage ? { scale: 0.97 } : {}}
                                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#4C4CF9] px-3 text-xs font-medium text-white transition-colors hover:bg-[#3F3FE0] disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Next
                                <ChevronRight size={15} />
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}