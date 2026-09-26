import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import api from "../api";

import SupervisorDashboardOverview from "../components/SupervisorDashboardComponents/SupervisorDashboardOverview";
import SupervisorSLAOverview from "../components/SupervisorDashboardComponents/SupervisorSLAOverview";
import SupervisorTicketProgress from "../components/SupervisorDashboardComponents/SupervisorTicketProgress";
import SupervisorEscalatedTicketTable from "../components/EscalatedTickets/SupervisorEscalatedTicketTable";

export default function SupervisorDashboard() {
    const [ticketList, setTicketList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEscalatedTickets();
    }, []);

    const fetchEscalatedTickets = async () => {
        setLoading(true);

        try {
            const response = await api.get(
                "/tickets/supervisor/escalated/list/",
                {
                    params: {
                        page: 1,
                        page_size: 5,
                    },
                }
            );

            const data = response.data;

            if (Array.isArray(data)) {
                setTicketList(data.slice(0, 5));
            } else {
                setTicketList(data.results || []);
            }
        } catch {
            toast.error(
                "Failed to load escalated tickets."
            );

            setTicketList([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full space-y-4 overflow-hidden sm:px-4 sm:py-4 lg:px-0 lg:py-0">
            {/* OVERVIEW CARDS */}
            <SupervisorDashboardOverview />

            {/* TICKET VOLUME + SLA PERFORMANCE */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                <div className="min-w-0 lg:col-span-7">
                    <SupervisorTicketProgress />
                </div>

                <div className="min-w-0 lg:col-span-5">
                    <SupervisorSLAOverview />
                </div>
            </div>

            {/* ESCALATED TICKETS */}
            <section className="overflow-hidden rounded-xl border border-gray-300 bg-white">
                {/* HEADER */}
                <div className="flex flex-col gap-3 border-b border-gray-300 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                        <h1 className="text-lg font-semibold text-black sm:text-xl">
                            Escalated Tickets
                        </h1>

                        <p className="mt-0.5 text-sm text-gray-500">
                            Tickets requiring Supervisor attention
                        </p>
                    </div>

                    <Link
                        to="/supervisor/escalated-tickets"
                        className="group inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-[#2563EB] px-5 text-sm font-medium text-white transition hover:bg-[#1D4ED8] sm:w-auto"
                    >
                        View All

                        <ArrowRight
                            size={16}
                            className="transition-transform group-hover:translate-x-0.5"
                        />
                    </Link>
                </div>

                {/* TABLE */}
                <div className="bg-white">
                    <SupervisorEscalatedTicketTable
                        ticketList={ticketList}
                        loading={loading}
                    />
                </div>
            </section>
        </div>
    );
}