import Sidebar from "../components/Sidebar";
import { getCurrentUser } from "../utils/auth";
import { ArrowRight } from "lucide-react";
import api from "../api";
import { Link } from "react-router-dom";
import OverviewEmployee from "../components/OverviewEmployee";
import TicketTableEmployee from "../components/TicketTableEmployee";
import CurrentTicket from "../components/CurrentTicket";
import foundever_cover from "../assets/foundever-cover_upscaled.jpg";
import foundever_hero from "../assets/foundever-hero_upscaled.jpg";
import { useEffect, useState } from "react";

export default function EmployeeDashboard() {
    const user = getCurrentUser();

    const [overview, setOverview] = useState(null);
    const [ticketList, setTicketList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [overviewRes, ticketsRes] = await Promise.all([
                    api.get("/users/employee/list/overview/"),
                    api.get("/tickets/employee/list/"),
                ]);

                setOverview(overviewRes.data);
                setTicketList(ticketsRes.data.results);
            } catch {
                setError(
                    "Unable to load dashboard data right now."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
                <p className="text-sm text-gray-500">
                    Loading...
                </p>
            </div>
        );
    }

    if (error || !overview) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
                <p className="text-sm text-gray-500">
                    {error || "No dashboard data available yet."}
                </p>
            </div>
        );
    }

    const displayName =
        user?.first_name || user?.username || "there";

    return (
        <div className="grid w-full grid-cols-12 gap-4 sm:gap-5 lg:gap-6">
            {/* Hero */}
            <div className="col-span-12">
                <div className="relative h-56 w-full overflow-hidden rounded-xl sm:h-64 sm:rounded-2xl">
                    <img
                        src={foundever_cover}
                        alt="Foundever"
                        className="absolute inset-0 h-full w-full object-cover"
                    />

                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />

                    <div className="relative z-10 flex h-full flex-col justify-center px-5 py-6 text-white sm:px-8 lg:px-10">
                        <p className="mb-1.5 text-xs font-medium text-white/80 sm:mb-2 sm:text-sm">
                            Employee Portal
                        </p>

                        <h1 className="max-w-2xl text-2xl font-semibold tracking-tight sm:text-3xl">
                            Welcome back, {displayName}!
                        </h1>

                        <p className="mt-2 max-w-md text-xs leading-relaxed text-white/80 sm:text-sm">
                            Manage your IT support requests, check
                            your active tickets, and keep track of
                            your recent requests.
                        </p>

                        <Link
                            to="/submit/ticket"
                            className="mt-4 flex w-fit items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-xs font-medium text-gray-900 transition hover:bg-gray-100 sm:mt-5 sm:px-5 sm:text-sm"
                        >
                            Submit a Ticket
                            <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Current Ticket */}
            <div className="col-span-12 lg:col-span-4">
                <CurrentTicket />
            </div>

            {/* My Tickets */}
            <div className="col-span-12 lg:col-span-8">
                <div className="overflow-hidden rounded-xl border border-gray-300 bg-white">
                    <div className="flex flex-col gap-3 border-b border-gray-300 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                            <h1 className="text-lg font-semibold text-gray-900 sm:text-xl">
                                My Tickets
                            </h1>

                            <p className="text-xs text-gray-500 sm:text-sm">
                                Recently submitted tickets
                            </p>
                        </div>

                        <Link
                            to="/tickets"
                            className="group flex w-fit shrink-0 items-center gap-2 rounded-md bg-[#2563EB] px-4 py-2 text-xs font-medium text-white transition hover:bg-[#1D4ED8] sm:px-6 sm:text-sm"
                        >
                            View All
                            <ArrowRight
                                size={16}
                                className="transition-transform group-hover:translate-x-0.5"
                            />
                        </Link>
                    </div>

                    <div className="w-full overflow-x-auto">
                        <div className="min-w-[700px]">
                            <TicketTableEmployee
                                dashboard={true}
                                maxRows={5}
                                ticketList={ticketList}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}