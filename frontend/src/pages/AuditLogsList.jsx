import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";

import api from "../api";
import AuditLogListContent from "../components/AuditLogs/AuditLogsListContent"

export default function AuditLogList() {
    const [auditLogs, setAuditLogs] = useState([]);

    const [action, setAction] = useState("");
    const [search, setSearch] = useState("");

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(15);

    const [totalPages, setTotalPages] = useState(1);
    const [totalLogs, setTotalLogs] = useState(0);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAuditLogs();
    }, [action, search, page, pageSize]);

    const fetchAuditLogs = async () => {
        setLoading(true);

        try {
            const params = {
                page,
                page_size: pageSize,
            };

            if (action) {
                params.action = action;
            }

            if (search.trim()) {
                params.search = search.trim();
            }

            const response = await api.get(
                "/users/audit-logs/admin/list/",
                {
                    params,
                }
            );

            const data = response.data;

            setAuditLogs(data.results || []);
            setTotalLogs(data.count || 0);

            const calculatedPages = Math.ceil(
                (data.count || 0) / pageSize
            );

            setTotalPages(calculatedPages || 1);
        } catch {
            toast.error("Failed to load audit logs.");

            setAuditLogs([]);
            setTotalLogs(0);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    };

    const handleActionChange = (value) => {
        setAction(value);
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

    return (
        <div className="min-h-full bg-gray-50">
            <div className="w-full">
                {/* Header */}
                <div className="border-b border-gray-200 bg-white px-5 py-4">
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900">
                            Audit Logs
                        </h1>

                        <p className="mt-0.5 text-sm text-gray-500">
                            Review system activity, user actions, and
                            ticket-related changes.
                        </p>
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
                                placeholder="Search user, ticket, action, or details..."
                                className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <select
                                value={action}
                                onChange={(event) =>
                                    handleActionChange(
                                        event.target.value
                                    )
                                }
                                className="h-10 cursor-pointer rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100"
                            >
                                <option value="">
                                    All Actions
                                </option>

                                <option value="CREATE">
                                    Created
                                </option>

                                <option value="UPDATE">
                                    Updated
                                </option>

                                <option value="STATUS_CHANGED">
                                    Status Changed
                                </option>

                                <option value="ASSIGNED">
                                    Assigned
                                </option>

                                <option value="REASSIGNED">
                                    Reassigned
                                </option>

                                <option value="PRIORITY_CHANGED">
                                    Priority Changed
                                </option>

                                <option value="RETURNED">
                                    Returned
                                </option>

                                <option value="ESCALATED">
                                    Escalated
                                </option>

                                <option value="LOGIN">
                                    Login
                                </option>

                                <option value="LOGOUT">
                                    Logout
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

                {/* Audit Log Table */}
                <div className="bg-white">
                    <AuditLogListContent
                        auditLogs={auditLogs}
                        loading={loading}
                    />
                </div>

                {/* Pagination */}
                <div className="flex flex-col gap-3 border-t border-gray-200 bg-white px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-gray-500">
                        Showing {auditLogs.length} of {totalLogs} audit
                        logs
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