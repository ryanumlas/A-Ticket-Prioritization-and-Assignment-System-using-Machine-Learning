import Sidebar from "../components/Sidebar"
import { getCurrentUser } from "../utils/auth";
import api from "../api";
import OverviewEmployee from "../components/OverviewEmployee";
import TicketTableEmployee from "../components/TicketTableEmployee";
import { useEffect, useState } from "react";

export default function EmployeeDashboard() {
    const user = getCurrentUser();  
    const [overview, setOverview] = useState(null);
    const [ticketList, setTicketList] = useState([]);
    const [loading, setLoading] = useState(true);
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
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (!overview) {
        return <div>Loading...</div>;
    }


    return(
        <div>
            <h1 className="text-3xl font-semibold mb-6">Welcome back, {user.first_name}!</h1>
            <div className="flex">
                <OverviewEmployee overview={overview}/>
                <TicketTableEmployee ticketList={ticketList}/>
            </div>
        </div>

        
    );
}