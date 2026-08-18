import {
    Bot,
    Flag,
    Undo2,
    UserCheck,
    Headphones,
    ShieldCheck
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
                const response = await api.get("/tickets/service-desk/overview/");
                setOverviewData(response.data);
                console.log("Fetched service desk overview data:", response.data);
            } catch (error) {
                console.error("Error fetching service desk overview data:", error);
            }
        }

        fetchOverviewData();
    }, []);


            
    return (
        <div className="w-full bg-white border border-gray-300 rounded-xl overflow-hidden">

            <div className="relative overflow-hidden bg-gradient-to-r from-[#4C4CF9] to-[#6366F1] px-6 py-5 text-white">
                
                <div className="absolute -right-8 -top-10 w-40 h-40 rounded-full bg-white/10" />
                <div className="absolute right-24 -bottom-16 w-32 h-32 rounded-full bg-white/10" />

                <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center">
                            <Headphones size={24} />
                        </div>

                        <div>
                            <h1 className="text-xl font-semibold">
                                Welcome back, {user?.first_name || user?.username || "User"}!
                            </h1>

                            <p className="text-sm text-indigo-100 mt-1">
                                Monitor active tickets, reviews, and automated ticket processing.
                            </p>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center gap-2 bg-white/10 border border-white/20 px-3 py-2 rounded-lg">
                        <ShieldCheck size={16} />
                        <span className="text-xs font-medium">
                            Service Desk Operations
                        </span>
                    </div>
                </div>
            </div>


            <div className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                    <div className="border border-gray-200 rounded-xl p-4 hover:shadow-md hover:border-blue-200 transition">
                        <div className="flex items-center justify-between">

                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <UserCheck
                                    className="text-blue-600"
                                    size={18}
                                />
                            </div>

                            <span className="text-xs text-blue-600 border border-blue-200 font-semibold bg-blue-50 px-2 py-1 rounded-lg">
                                Active
                            </span>

                        </div>

                        <p className="text-sm text-gray-500 mt-5">
                            Assigned Tickets
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mt-1">
                            {overviewData?.assigned_tickets || 0}
                        </h2>

                        <p className="text-xs text-gray-400 mt-2">
                            Currently assigned to you
                        </p>
                    </div>


                    {/* Auto Classified */}
                    <div className="border border-gray-200 rounded-xl p-4 hover:shadow-md hover:border-purple-200 transition">
                        <div className="flex items-center justify-between">

                            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                                <Bot
                                    className="text-purple-600"
                                    size={18}
                                />
                            </div>

                            <span className="text-xs text-purple-600 border border-purple-200 font-semibold bg-purple-50 px-2 py-1 rounded-lg">
                                AI
                            </span>

                        </div>

                        <p className="text-sm text-gray-500 mt-5">
                            Auto Classified
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mt-1">
                            {overviewData?.auto_classified_tickets || 0} %
                        </h2>

                        <p className="text-xs text-gray-400 mt-2">
                            Classified automatically
                        </p>
                    </div>


                    <div className="border border-gray-200 rounded-xl p-4 hover:shadow-md hover:border-red-200 transition">
                        <div className="flex items-center justify-between">

                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                                <Flag
                                    className="text-red-600"
                                    size={18}
                                />
                            </div>

                            <span className="text-xs text-red-600 font-semibold border border-red-200 bg-red-50 px-2 py-1 rounded-lg">
                                Review
                            </span>

                        </div>

                        <p className="text-sm text-gray-500 mt-5">
                            Flagged Tickets
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mt-1">
                            {overviewData?.flagged_tickets || 0}
                        </h2>

                        <p className="text-xs text-gray-400 mt-2">
                            Requires manual review
                        </p>
                    </div>


                    {/* Returned Tickets */}
                    <div className="border border-gray-200 rounded-xl p-4 hover:shadow-md hover:border-amber-200 transition">
                        <div className="flex items-center justify-between">

                            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                                <Undo2
                                    className="text-amber-600"
                                    size={18}
                                />
                            </div>

                            <span className="text-xs text-amber-600 font-semibold border border-amber-200 bg-amber-50 px-2 py-1 rounded-lg">
                                Returned
                            </span>

                        </div>

                        <p className="text-sm text-gray-500 mt-5">
                            Returned Tickets
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mt-1">
                            3
                        </h2>

                        <p className="text-xs text-gray-400 mt-2">
                            Returned for ticket revision
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
}