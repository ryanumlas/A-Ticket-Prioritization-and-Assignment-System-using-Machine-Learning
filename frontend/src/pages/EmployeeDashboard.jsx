import Sidebar from "../components/Sidebar"
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
                    api.get("/tickets/employee/list/")
                ]);
                setOverview(overviewRes.data);
                setTicketList(ticketsRes.data);
            } catch (error) {
                console.error(error);
                setError("Unable to load dashboard data right now.");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return <div className="p-6">Loading...</div>;
    }

    if (error || !overview) {
        return <div className="p-6">{error || "No dashboard data available yet."}</div>;
    }

    const displayName = user?.first_name || user?.username || "there";

    return(
        <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12">
                <div className="relative w-full h-64 rounded-2xl overflow-hidden">
                    <img
                        src={foundever_cover}
                        alt="Foundever"
                        className="absolute inset-0 w-full h-full object-cover"
                    />

                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />

                    <div className="relative z-10 h-full flex flex-col justify-center px-10 text-white">
                        <p className="text-sm font-medium text-white/80 mb-2">
                            Employee Portal
                        </p>

                        <h1 className="text-3xl font-semibold tracking-tight">
                            Welcome back, {displayName}!
                        </h1>

                        <p className="mt-2 text-sm text-white/80 max-w-md">
                            Manage your IT support requests, check your active tickets,
                            and keep track of your recent requests.
                        </p>

                        <Link
                            to="/submit/ticket"
                            className="mt-5 w-fit flex items-center gap-2 bg-white text-gray-900 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-100 transition"
                        >
                            Submit a Ticket
                            <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            </div>

            <div className="col-span-4">
                <CurrentTicket />
            </div>

            <div className="col-span-8">
                <div className="bg-white border border-gray-300 rounded-xl overflow-hidden">
                    <div className="px-4 py-4 border-b border-gray-300 flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-semibold">
                                My Tickets
                            </h1>

                            <p className="text-sm text-gray-500">
                                Recently assigned tickets
                            </p>
                        </div>

                        <Link
                            to="/tickets"
                            className="group flex items-center gap-2 bg-[#4C4CF9] px-6 py-2 text-white text-sm rounded-md hover:bg-[#3f3fe6] transition"
                        >
                            View All
                            <ArrowRight size={16} />
                        </Link>
                    </div>

                    <TicketTableEmployee
                        dashboard={true}
                        maxRows={5}
                        ticketList={ticketList}
                    />
                </div>
            </div>
        </div>
    );
}