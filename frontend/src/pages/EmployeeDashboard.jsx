import Sidebar from "../components/Sidebar"
import { getCurrentUser } from "../utils/auth";
import api from "../api";
import OverviewEmployee from "../components/OverviewEmployee";
import TicketTableEmployee from "../components/TicketTableEmployee";
import CurrentTicket from "../components/CurrentTicket";
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
        <div className="">
            <h1>Welcome back, {displayName}</h1>
            <div className="grid grid-cols-12 gap-6">
                <div className="col-span-4">
                    {/* <OverviewEmployee overview={overview} /> */}
                    <CurrentTicket/>
                </div>

                <div className="col-span-8">
                    <TicketTableEmployee ticketList={ticketList} />
                </div>
            </div>
        </div>
    );
}