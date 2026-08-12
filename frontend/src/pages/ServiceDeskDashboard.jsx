import { getCurrentUser } from "../utils/auth";
import { ArrowRight } from "lucide-react";
import ServiceDeskOverview from "../components/ServiceDeskOverview";
import TicketTableServiceDesk from "../components/TicketTableServiceDesk";
import { Link } from "react-router-dom";
import SLAOverview from "../components/SLAOverview";
import TicketsByCategoryChart from "../components/TicketsByCategoryChart";
import AIResultPieChart from "../components/AIResultPieChart";

export default function ServiceDeskDashboard() {
    const user = getCurrentUser();

    const displayName = user?.first_name || user?.username || "there";
    return(
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold">IT Service Desk</h1>
            <ServiceDeskOverview/>
            <div className="grid grid-cols-12 gap-6">
                <div className="col-span-7">
                    <div className="bg-white border border-gray-300 rounded-xl overflow-hidden">
                        <div className="px-4 py-4 border-b border-gray-300 flex items-center justify-between">
                            <div>
                                <h1 className="text-xl font-semibold">My Tickets</h1>
                                <p className="text-sm text-gray-500">Recently submitted tickets</p>
                            </div>
                            <Link to="/tickets" className="group flex items-center gap-2 bg-[#4C4CF9] px-6 py-2 text-white text-sm rounded-md hover:bg-[#3f3fe6] cursor-pointer">View All <ArrowRight size={16}/></Link>
                        </div>
                        <TicketTableServiceDesk dashboard={true} maxRows={5}/>
                    </div>
                </div>

                <div className="col-span-5">
                    <AIResultPieChart />
                </div>

                <div className="col-span-5">
                    <SLAOverview/>
                </div>

                <div className="col-span-7">
                    <TicketsByCategoryChart/>
                </div>
            </div>
        </div>
    );
}