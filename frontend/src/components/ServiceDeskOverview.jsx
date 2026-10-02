
import {
    ClipboardList,
    CheckCircle2,
    Flag,
    Undo2,
    Headphones,
    ShieldCheck,
} from "lucide-react";
import { getCurrentUser } from "../utils/auth";
import api from "../api";
import { useEffect, useState } from "react";

export default function ServiceDeskOverview() {
    const user = getCurrentUser();
    const [overviewData, setOverviewData] = useState(null);

    useEffect(() => {
        const fetchOverviewData = async () => {
            try {
                const response = await api.get(
                    "/tickets/service-desk/overview/"
                );

                setOverviewData(response.data);

                console.log(
                    "Fetched service desk overview data:",
                    response.data
                );
            } catch (error) {
                console.error(
                    "Error fetching service desk overview data:",
                    error
                );
            }
        };

        fetchOverviewData();
    }, []);

    return (
        <div className="w-full overflow-hidden rounded-xl border border-gray-300 bg-white">
            {/* Header */}
            <div className="relative overflow-hidden bg-gradient-to-r from-[#4C4CF9] to-[#6366F1] px-3 py-3 text-white sm:px-6 sm:py-5 min-[1280px]:max-[1365px]:px-5 min-[1280px]:max-[1365px]:py-4 min-[1366px]:max-[1537px]:px-5 min-[1366px]:max-[1537px]:py-4.5">
                <div className="absolute -right-8 -top-10 h-24 w-24 rounded-full bg-white/10 sm:h-40 sm:w-40 min-[1280px]:max-[1365px]:h-32 min-[1280px]:max-[1365px]:w-32 min-[1366px]:max-[1537px]:h-36 min-[1366px]:max-[1537px]:w-36" />

                <div className="absolute -bottom-10 right-12 h-20 w-20 rounded-full bg-white/10 sm:-bottom-16 sm:right-24 sm:h-32 sm:w-32 min-[1280px]:max-[1365px]:h-28 min-[1280px]:max-[1365px]:w-28 min-[1366px]:max-[1537px]:h-30 min-[1366px]:max-[1537px]:w-30" />

                <div className="relative flex items-center justify-between gap-2 sm:gap-4">
                    <div className="flex min-w-0 items-center gap-2.5 sm:gap-4 min-[1280px]:max-[1365px]:gap-3 min-[1366px]:max-[1537px]:gap-3.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/20 bg-white/15 sm:h-12 sm:w-12 sm:rounded-xl min-[1280px]:max-[1365px]:h-10 min-[1280px]:max-[1365px]:w-10 min-[1366px]:max-[1537px]:h-11 min-[1366px]:max-[1537px]:w-11">
                            <Headphones size={18} className="sm:size-6 min-[1280px]:max-[1365px]:size-5 min-[1366px]:max-[1537px]:size-5" />
                        </div>

                        <div className="min-w-0">
                            <h1 className="truncate text-[15px] font-semibold leading-tight sm:text-xl min-[1280px]:max-[1365px]:text-lg min-[1366px]:max-[1537px]:text-lg">
                                Welcome back,{" "}
                                {user?.first_name || user?.username || "User"}!
                            </h1>

                            <p className="mt-0.5 truncate text-[10px] leading-tight text-indigo-100 sm:mt-1 sm:text-sm min-[1280px]:max-[1365px]:text-[11px] min-[1366px]:max-[1537px]:text-xs">
                                Monitor tickets, resolutions, reviews, and returned requests.
                            </p>
                        </div>
                    </div>

                    <div className="hidden shrink-0 items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 py-2 md:flex min-[1280px]:max-[1365px]:gap-1.5 min-[1280px]:max-[1365px]:px-2.5 min-[1280px]:max-[1365px]:py-1.5 min-[1280px]:max-[1365px]:text-[11px] min-[1366px]:max-[1537px]:gap-1.5 min-[1366px]:max-[1537px]:px-2.5 min-[1366px]:max-[1537px]:py-1.5 min-[1366px]:max-[1537px]:text-xs">
                        <ShieldCheck size={16} className="min-[1280px]:max-[1365px]:size-3.5 min-[1366px]:max-[1537px]:size-3.5" />
                        <span className="font-medium">Service Desk Operations</span>
                    </div>
                </div>
            </div>

            {/* Overview Cards */}
            <div className="p-3 sm:p-4 min-[1280px]:max-[1365px]:p-3 min-[1366px]:max-[1537px]:p-3.5">
                <div className="grid grid-cols-2 gap-3 xl:grid-cols-4 min-[1280px]:max-[1365px]:gap-3 min-[1366px]:max-[1537px]:gap-4">
                    {/* Total Tickets */}
                    <div className="rounded-xl border border-gray-200 p-3 transition hover:border-blue-200 hover:shadow-md sm:p-4 min-[1280px]:max-[1365px]:rounded-lg min-[1280px]:max-[1365px]:p-3 min-[1366px]:max-[1537px]:p-3.5">
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 sm:h-10 sm:w-10 min-[1280px]:max-[1365px]:h-9 min-[1280px]:max-[1365px]:w-9 min-[1366px]:max-[1537px]:h-9 min-[1366px]:max-[1537px]:w-9">
                                <ClipboardList className="text-blue-600" size={18} aria-hidden="true" />
                            </div>

                            <span className="rounded-lg border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-600 sm:px-2 sm:py-1 sm:text-xs min-[1280px]:max-[1365px]:px-1.5 min-[1280px]:max-[1365px]:py-0.5 min-[1280px]:max-[1365px]:text-[10px] min-[1366px]:max-[1537px]:px-1.5 min-[1366px]:max-[1537px]:py-0.5 min-[1366px]:max-[1537px]:text-[11px]">
                                All
                            </span>
                        </div>

                        <p className="mt-4 text-xs text-gray-500 sm:mt-5 sm:text-sm min-[1280px]:max-[1365px]:mt-4 min-[1280px]:max-[1365px]:text-[11px] min-[1366px]:max-[1537px]:mt-4 min-[1366px]:max-[1537px]:text-xs">
                            Total Tickets
                        </p>

                        <h2 className="mt-1 text-xl font-bold text-gray-900 sm:text-2xl min-[1280px]:max-[1365px]:text-xl min-[1366px]:max-[1537px]:text-xl">
                            {overviewData?.total_tickets ?? 0}
                        </h2>

                        <p className="mt-1.5 text-[10px] leading-tight text-gray-400 sm:mt-2 sm:text-xs min-[1280px]:max-[1365px]:mt-1.5 min-[1280px]:max-[1365px]:text-[10px] min-[1366px]:max-[1537px]:text-[11px]">
                            Across all departments
                        </p>
                    </div>

                    {/* Resolved Tickets */}
                    <div className="rounded-xl border border-gray-200 p-3 transition hover:border-green-200 hover:shadow-md sm:p-4 min-[1280px]:max-[1365px]:rounded-lg min-[1280px]:max-[1365px]:p-3 min-[1366px]:max-[1537px]:p-3.5">
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100 sm:h-10 sm:w-10 min-[1280px]:max-[1365px]:h-9 min-[1280px]:max-[1365px]:w-9 min-[1366px]:max-[1537px]:h-9 min-[1366px]:max-[1537px]:w-9">
                                <CheckCircle2 className="text-green-600" size={18} aria-hidden="true" />
                            </div>

                            <span className="rounded-lg border border-green-200 bg-green-50 px-1.5 py-0.5 text-[10px] font-semibold text-green-600 sm:px-2 sm:py-1 sm:text-xs min-[1280px]:max-[1365px]:px-1.5 min-[1280px]:max-[1365px]:py-0.5 min-[1280px]:max-[1365px]:text-[10px] min-[1366px]:max-[1537px]:px-1.5 min-[1366px]:max-[1537px]:py-0.5 min-[1366px]:max-[1537px]:text-[11px]">
                                Completed
                            </span>
                        </div>

                        <p className="mt-4 text-xs text-gray-500 sm:mt-5 sm:text-sm min-[1280px]:max-[1365px]:mt-4 min-[1280px]:max-[1365px]:text-[11px] min-[1366px]:max-[1537px]:mt-4 min-[1366px]:max-[1537px]:text-xs">
                            Resolved Tickets
                        </p>

                        <h2 className="mt-1 text-xl font-bold text-gray-900 sm:text-2xl min-[1280px]:max-[1365px]:text-xl min-[1366px]:max-[1537px]:text-xl">
                            {overviewData?.resolved_tickets ?? 0}
                        </h2>

                        <p className="mt-1.5 text-[10px] leading-tight text-gray-400 sm:mt-2 sm:text-xs min-[1280px]:max-[1365px]:mt-1.5 min-[1280px]:max-[1365px]:text-[10px] min-[1366px]:max-[1537px]:text-[11px]">
                            Tickets marked as resolved
                        </p>
                    </div>

                    {/* Flagged Tickets */}
                    <div className="rounded-xl border border-gray-200 p-3 transition hover:border-red-200 hover:shadow-md sm:p-4 min-[1280px]:max-[1365px]:rounded-lg min-[1280px]:max-[1365px]:p-3 min-[1366px]:max-[1537px]:p-3.5">
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100 sm:h-10 sm:w-10 min-[1280px]:max-[1365px]:h-9 min-[1280px]:max-[1365px]:w-9 min-[1366px]:max-[1537px]:h-9 min-[1366px]:max-[1537px]:w-9">
                                <Flag className="text-red-600" size={18} aria-hidden="true" />
                            </div>

                            <span className="rounded-lg border border-red-200 bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold text-red-600 sm:px-2 sm:py-1 sm:text-xs min-[1280px]:max-[1365px]:px-1.5 min-[1280px]:max-[1365px]:py-0.5 min-[1280px]:max-[1365px]:text-[10px] min-[1366px]:max-[1537px]:px-1.5 min-[1366px]:max-[1537px]:py-0.5 min-[1366px]:max-[1537px]:text-[11px]">
                                Review
                            </span>
                        </div>

                        <p className="mt-4 text-xs text-gray-500 sm:mt-5 sm:text-sm min-[1280px]:max-[1365px]:mt-4 min-[1280px]:max-[1365px]:text-[11px] min-[1366px]:max-[1537px]:mt-4 min-[1366px]:max-[1537px]:text-xs">
                            Flagged Tickets
                        </p>

                        <h2 className="mt-1 text-xl font-bold text-gray-900 sm:text-2xl min-[1280px]:max-[1365px]:text-xl min-[1366px]:max-[1537px]:text-xl">
                            {overviewData?.flagged_tickets ?? 0}
                        </h2>

                        <p className="mt-1.5 text-[10px] leading-tight text-gray-400 sm:mt-2 sm:text-xs min-[1280px]:max-[1365px]:mt-1.5 min-[1280px]:max-[1365px]:text-[10px] min-[1366px]:max-[1537px]:text-[11px]">
                            Requires manual review
                        </p>
                    </div>

                    {/* Returned Tickets */}
                    <div className="rounded-xl border border-gray-200 p-3 transition hover:border-amber-200 hover:shadow-md sm:p-4 min-[1280px]:max-[1365px]:rounded-lg min-[1280px]:max-[1365px]:p-3 min-[1366px]:max-[1537px]:p-3.5">
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 sm:h-10 sm:w-10 min-[1280px]:max-[1365px]:h-9 min-[1280px]:max-[1365px]:w-9 min-[1366px]:max-[1537px]:h-9 min-[1366px]:max-[1537px]:w-9">
                                <Undo2 className="text-amber-600" size={18} aria-hidden="true" />
                            </div>

                            <span className="rounded-lg border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600 sm:px-2 sm:py-1 sm:text-xs min-[1280px]:max-[1365px]:px-1.5 min-[1280px]:max-[1365px]:py-0.5 min-[1280px]:max-[1365px]:text-[10px] min-[1366px]:max-[1537px]:px-1.5 min-[1366px]:max-[1537px]:py-0.5 min-[1366px]:max-[1537px]:text-[11px]">
                                Returned
                            </span>
                        </div>

                        <p className="mt-4 text-xs text-gray-500 sm:mt-5 sm:text-sm min-[1280px]:max-[1365px]:mt-4 min-[1280px]:max-[1365px]:text-[11px] min-[1366px]:max-[1537px]:mt-4 min-[1366px]:max-[1537px]:text-xs">
                            Returned Tickets
                        </p>

                        <h2 className="mt-1 text-xl font-bold text-gray-900 sm:text-2xl min-[1280px]:max-[1365px]:text-xl min-[1366px]:max-[1537px]:text-xl">
                            {overviewData?.returned_tickets ?? 0}
                        </h2>

                        <p className="mt-1.5 text-[10px] leading-tight text-gray-400 sm:mt-2 sm:text-xs min-[1280px]:max-[1365px]:mt-1.5 min-[1280px]:max-[1365px]:text-[10px] min-[1366px]:max-[1537px]:text-[11px]">
                            Returned for ticket revision
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}