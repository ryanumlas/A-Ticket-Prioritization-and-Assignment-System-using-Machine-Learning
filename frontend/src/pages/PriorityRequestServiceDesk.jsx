import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { toast } from "sonner";

import api from "../api";
import PriorityRequestTable from "../components/PriorityRequestTable";

export default function PriorityRequestServiceDesk() {
    const [priorityRequests, setPriorityRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(15);
    const [totalRequests, setTotalRequests] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");

    const [status, setStatus] = useState("");

    useEffect(() => {
        const fetchPriorityRequests = async () => {
            try {
                setLoading(true);

                const response = await api.get(
                    "/tickets/priority-change-requests/list/",
                    {
                        params: {
                            page,
                            page_size: pageSize,
                            search: search || undefined,
                            status: status || undefined,
                        },
                    }
                );

                const data = response.data;

                setPriorityRequests(data.results || []);
                setTotalRequests(data.count || 0);

                setTotalPages(
                    Math.max(
                        1,
                        Math.ceil(
                            (data.count || 0) / pageSize
                        )
                    )
                );
            } catch (error) {
                setPriorityRequests([]);
                setTotalRequests(0);
                setTotalPages(1);

                toast.error(
                    error.response?.data?.detail ||
                        error.response?.data?.error ||
                        "Failed to load priority requests."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchPriorityRequests();
    }, [page, pageSize, search, status]);

    const handleSearch = (event) => {
        event.preventDefault();

        setPage(1);
        setSearch(searchInput.trim());
    };

    const clearSearch = () => {
        setSearchInput("");
        setSearch("");
        setPage(1);
    };

    const handleStatusChange = (event) => {
        setStatus(event.target.value);
        setPage(1);
    };

    const handlePageSizeChange = (event) => {
        setPageSize(Number(event.target.value));
        setPage(1);
    };

    const startItem =
        totalRequests === 0
            ? 0
            : (page - 1) * pageSize + 1;

    const endItem = Math.min(
        page * pageSize,
        totalRequests
    );

    return (
        <div className="min-h-full bg-gray-50">
            {/* PAGE HEADER */}
            <div
                className="
                    border-b
                    border-gray-200
                    px-5
                    py-4
                    min-[1280px]:max-[1365px]:px-4
                    min-[1280px]:max-[1365px]:py-3
                    min-[1366px]:max-[1537px]:px-4
                    min-[1366px]:max-[1537px]:py-3.5
                "
            >
                <h1
                    className="
                        text-xl
                        font-semibold
                        text-gray-900
                        min-[1280px]:max-[1365px]:text-lg
                        min-[1366px]:max-[1537px]:text-lg
                    "
                >
                    Priority Requests
                </h1>

                <p
                    className="
                        mt-1
                        text-sm
                        text-gray-500
                        min-[1280px]:max-[1365px]:text-[11px]
                        min-[1366px]:max-[1537px]:text-xs
                    "
                >
                    Review and process priority change requests from IT
                    Support.
                </p>
            </div>

            {/* TOOLBAR */}
            <div
                className="
                    border-b
                    border-gray-200
                    bg-white
                    px-5
                    py-3
                    min-[1280px]:max-[1365px]:px-4
                    min-[1280px]:max-[1365px]:py-2.5
                    min-[1366px]:max-[1537px]:px-4
                    min-[1366px]:max-[1537px]:py-2.5
                "
            >
                <div
                    className="
                        flex
                        items-center
                        justify-between
                        gap-4
                        min-[1280px]:max-[1365px]:gap-3
                        min-[1366px]:max-[1537px]:gap-3
                    "
                >
                    <form
                        onSubmit={handleSearch}
                        className="
                            relative
                            w-full
                            max-w-[320px]
                            min-[1280px]:max-[1365px]:max-w-[280px]
                            min-[1366px]:max-[1537px]:max-w-[300px]
                        "
                    >
                        <Search
                            size={17}
                            className="
                                absolute
                                left-3
                                top-1/2
                                -translate-y-1/2
                                text-gray-400
                                min-[1280px]:max-[1365px]:left-2.5
                                min-[1280px]:max-[1365px]:size-3.5
                                min-[1366px]:max-[1537px]:left-2.5
                                min-[1366px]:max-[1537px]:size-3.5
                            "
                        />

                        <input
                            type="text"
                            value={searchInput}
                            onChange={(event) =>
                                setSearchInput(
                                    event.target.value
                                )
                            }
                            placeholder="Search ticket ID or subject..."
                            className="
                                h-10
                                w-full
                                rounded-md
                                border
                                border-gray-300
                                bg-white
                                pl-9
                                pr-9
                                text-sm
                                text-gray-700
                                outline-none
                                placeholder:text-gray-400
                                focus:border-blue-500
                                focus:ring-1
                                focus:ring-blue-500
                                min-[1280px]:max-[1365px]:h-9
                                min-[1280px]:max-[1365px]:pl-8
                                min-[1280px]:max-[1365px]:pr-8
                                min-[1280px]:max-[1365px]:text-[11px]
                                min-[1366px]:max-[1537px]:h-9
                                min-[1366px]:max-[1537px]:pl-8
                                min-[1366px]:max-[1537px]:pr-8
                                min-[1366px]:max-[1537px]:text-xs
                            "
                        />

                        {searchInput && (
                            <button
                                type="button"
                                onClick={clearSearch}
                                className="
                                    absolute
                                    right-2
                                    top-1/2
                                    flex
                                    h-7
                                    w-7
                                    -translate-y-1/2
                                    items-center
                                    justify-center
                                    rounded-md
                                    text-gray-400
                                    transition-colors
                                    hover:bg-gray-100
                                    hover:text-gray-600
                                    min-[1280px]:max-[1365px]:right-1.5
                                    min-[1280px]:max-[1365px]:h-6
                                    min-[1280px]:max-[1365px]:w-6
                                    min-[1366px]:max-[1537px]:right-1.5
                                    min-[1366px]:max-[1537px]:h-6
                                    min-[1366px]:max-[1537px]:w-6
                                "
                            >
                                <X
                                    size={15}
                                    className="
                                        min-[1280px]:max-[1365px]:size-3.5
                                        min-[1366px]:max-[1537px]:size-3.5
                                    "
                                />
                            </button>
                        )}
                    </form>

                    <div
                        className="
                            flex
                            items-center
                            gap-3
                            min-[1280px]:max-[1365px]:gap-2
                            min-[1366px]:max-[1537px]:gap-2.5
                        "
                    >
                        <select
                            value={status}
                            onChange={handleStatusChange}
                            className="
                                h-10
                                rounded-md
                                border
                                border-gray-300
                                bg-white
                                px-3
                                text-sm
                                text-gray-700
                                outline-none
                                focus:border-blue-500
                                focus:ring-1
                                focus:ring-blue-500
                                min-[1280px]:max-[1365px]:h-9
                                min-[1280px]:max-[1365px]:px-2.5
                                min-[1280px]:max-[1365px]:text-[11px]
                                min-[1366px]:max-[1537px]:h-9
                                min-[1366px]:max-[1537px]:px-2.5
                                min-[1366px]:max-[1537px]:text-xs
                            "
                        >
                            <option value="">
                                All Statuses
                            </option>

                            <option value="pending">
                                Pending
                            </option>

                            <option value="approved">
                                Approved
                            </option>

                            <option value="rejected">
                                Rejected
                            </option>
                        </select>

                        <div
                            className="
                                flex
                                items-center
                                gap-2
                                min-[1280px]:max-[1365px]:gap-1.5
                                min-[1366px]:max-[1537px]:gap-1.5
                            "
                        >
                            <span
                                className="
                                    text-sm
                                    text-gray-600
                                    min-[1280px]:max-[1365px]:text-[11px]
                                    min-[1366px]:max-[1537px]:text-xs
                                "
                            >
                                Show
                            </span>

                            <select
                                value={pageSize}
                                onChange={
                                    handlePageSizeChange
                                }
                                className="
                                    h-10
                                    rounded-md
                                    border
                                    border-gray-300
                                    bg-white
                                    px-3
                                    text-sm
                                    text-gray-700
                                    outline-none
                                    focus:border-blue-500
                                    focus:ring-1
                                    focus:ring-blue-500
                                    min-[1280px]:max-[1365px]:h-9
                                    min-[1280px]:max-[1365px]:px-2.5
                                    min-[1280px]:max-[1365px]:text-[11px]
                                    min-[1366px]:max-[1537px]:h-9
                                    min-[1366px]:max-[1537px]:px-2.5
                                    min-[1366px]:max-[1537px]:text-xs
                                "
                            >
                                <option value={10}>
                                    10
                                </option>

                                <option value={15}>
                                    15
                                </option>

                                <option value={25}>
                                    25
                                </option>

                                <option value={50}>
                                    50
                                </option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* TABLE */}
            <div className="bg-white">
                <PriorityRequestTable
                    requests={priorityRequests}
                    loading={loading}
                />
            </div>

            {/* PAGINATION */}
            <div
                className="
                    flex
                    items-center
                    justify-between
                    border-t
                    border-gray-200
                    bg-white
                    px-5
                    py-3
                    min-[1280px]:max-[1365px]:px-4
                    min-[1280px]:max-[1365px]:py-2.5
                    min-[1366px]:max-[1537px]:px-4
                    min-[1366px]:max-[1537px]:py-2.5
                "
            >
                <p
                    className="
                        text-sm
                        text-gray-500
                        min-[1280px]:max-[1365px]:text-[11px]
                        min-[1366px]:max-[1537px]:text-xs
                    "
                >
                    Showing{" "}
                    <span className="font-medium text-gray-700">
                        {startItem}
                    </span>{" "}
                    to{" "}
                    <span className="font-medium text-gray-700">
                        {endItem}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium text-gray-700">
                        {totalRequests}
                    </span>{" "}
                    requests
                </p>

                <div
                    className="
                        flex
                        items-center
                        gap-2
                        min-[1280px]:max-[1365px]:gap-1.5
                        min-[1366px]:max-[1537px]:gap-1.5
                    "
                >
                    <button
                        type="button"
                        onClick={() =>
                            setPage((current) =>
                                Math.max(
                                    1,
                                    current - 1
                                )
                            )
                        }
                        disabled={
                            page === 1 ||
                            loading
                        }
                        className="
                            h-9
                            rounded-md
                            border
                            border-gray-300
                            bg-white
                            px-3
                            text-sm
                            font-medium
                            text-gray-700
                            transition-colors
                            hover:bg-gray-50
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                            min-[1280px]:max-[1365px]:h-8
                            min-[1280px]:max-[1365px]:px-2.5
                            min-[1280px]:max-[1365px]:text-[11px]
                            min-[1366px]:max-[1537px]:h-8
                            min-[1366px]:max-[1537px]:px-2.5
                            min-[1366px]:max-[1537px]:text-xs
                        "
                    >
                        Previous
                    </button>

                    <span
                        className="
                            px-2
                            text-sm
                            text-gray-600
                            min-[1280px]:max-[1365px]:px-1.5
                            min-[1280px]:max-[1365px]:text-[11px]
                            min-[1366px]:max-[1537px]:px-1.5
                            min-[1366px]:max-[1537px]:text-xs
                        "
                    >
                        Page {page} of {totalPages}
                    </span>

                    <button
                        type="button"
                        onClick={() =>
                            setPage((current) =>
                                Math.min(
                                    totalPages,
                                    current + 1
                                )
                            )
                        }
                        disabled={
                            page >= totalPages ||
                            loading
                        }
                        className="
                            h-9
                            rounded-md
                            bg-[#2563EB]
                            px-3
                            text-sm
                            font-medium
                            text-white
                            transition-colors
                            hover:bg-[#1D4ED8]
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                            min-[1280px]:max-[1365px]:h-8
                            min-[1280px]:max-[1365px]:px-2.5
                            min-[1280px]:max-[1365px]:text-[11px]
                            min-[1366px]:max-[1537px]:h-8
                            min-[1366px]:max-[1537px]:px-2.5
                            min-[1366px]:max-[1537px]:text-xs
                        "
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}