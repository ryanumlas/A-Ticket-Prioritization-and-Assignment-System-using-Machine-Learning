import Sidebar from "../components/Sidebar"
import { getCurrentUser } from "../utils/auth";
import api from "../api";
import OverviewEmployee from "../components/OverviewEmployee";
import { useEffect, useState } from "react";

export default function EmployeeDashboard() {
    const user = getCurrentUser();  
    const [overview, setOverview] = useState(null);

    useEffect(() => {
        const fetchOverview = async () => {
            try {
                const response = await api.get("/users/employee/list/overview/");
                setOverview(response.data);
                console.log(response.data);
            } catch (error) {
                console.error(error);
            }
        };

        fetchOverview();
    }, []);

    if (!overview) {
        return <div>Loading...</div>;
    }


    return(
        <div>
            <h1 className="text-3xl font-semibold mb-6">Welcome back, {user.first_name}!</h1>
            <OverviewEmployee overview={overview}/>
        </div>

        
    );
}