import SupportOverview from "../components/SupportOverview";
import TicketTableSupport from "../components/TicketTableSupport";
import SLAOverview from "../components/SLAOverview";
import TicketNeedingAttention from "../components/TicketNeedingAttention";
import api from "../api";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function SupportDashboard() {
    const [ticketList, setTicketList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTicketList = async () => {
            try {
                setLoading(true);

                const response = await api.get(
                    "/tickets/support-specialist/list/"
                );

                setTicketList(response.data.results || []);
            } catch {
                setTicketList([]);
            } finally {
                setLoading(false);
            }
        };

        fetchTicketList();
    }, []);

    if (loading) {
        return (
            <div className="flex min-h-[300px] items-center justify-center px-4">
                <p className="text-sm text-gray-500">
                    Loading dashboard...
                </p>
            </div>
        );
    }

    return (
        <div className="w-full space-y-4 overflow-hidden sm:px-4 sm:py-4 lg:px-0 lg:py-0">
            {/* OVERVIEW CARDS */}
            <SupportOverview />

            {/* DASHBOARD CONTENT */}
            <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-12">
                {/* TICKETS NEEDING ATTENTION */}
                <div className="h-fit min-w-0 lg:col-span-7">
                    <TicketNeedingAttention />
                </div>

                {/* SLA OVERVIEW */}
                <div className="h-fit min-w-0 lg:col-span-5">
                    <SLAOverview />
                </div>

                {/* MY ACTIVE TICKETS */}
                <div className="min-w-0 lg:col-span-12">
                    <div className="overflow-hidden rounded-xl border border-gray-300 bg-white">
                        {/* HEADER */}
                        <div className="flex flex-col gap-3 border-b border-gray-300 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0">
                                <h1 className="text-lg font-semibold text-black sm:text-xl">
                                    My Active Tickets
                                </h1>

                                <p className="mt-0.5 text-sm text-gray-500">
                                    Recently assigned tickets
                                </p>
                            </div>

                            <Link
                                to="/tickets"
                                className="group inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-[#2563EB] px-5 text-sm font-medium text-white transition hover:bg-[#1D4ED8] sm:w-auto"
                            >
                                View All

                                <ArrowRight
                                    size={16}
                                    className="transition-transform group-hover:translate-x-0.5"
                                />
                            </Link>
                        </div>

                        {/* RESPONSIVE TABLE */}
                        <div className="w-full overflow-x-auto">
                            <div className="min-w-[900px]">
                                <TicketTableSupport
                                    ticketList={ticketList}
                                    dashboard={true}
                                    maxRows={5}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}