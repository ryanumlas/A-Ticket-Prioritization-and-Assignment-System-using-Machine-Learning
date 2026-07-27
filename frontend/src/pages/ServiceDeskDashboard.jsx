import { getCurrentUser } from "../utils/auth";
import ServiceDeskOverview from "../components/ServiceDeskOverview";

export default function ServiceDeskDashboard() {
    const user = getCurrentUser();

    const displayName = user?.first_name || user?.username || "there";
    return(
        <div>
            <h1>Welcome back, {displayName}</h1>
            <ServiceDeskOverview/>
        </div>
    );
}