import SupportOverview from "../components/SupportOverview";
import TicketTableSupport from "../components/TicketTableSupport";
import SLAOverviewSupport from "../components/SLAOverviewSupport";
import TicketNeedingAttention from "../components/TicketNeedingAttention";

import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function SupportDashboard() {
    return (
        <div className="space-y-4">

            {/* OVERVIEW CARDS */}
            <SupportOverview />

            <div className="grid grid-cols-12 gap-4">

                {/* MY ACTIVE TICKETS */}
                <div className="col-span-7">
                    <div className="overflow-hidden rounded-xl border border-gray-300 bg-white">

                        <div className="flex items-center justify-between border-b border-gray-300 px-4 py-4">

                            <div>
                                <h1 className="text-xl font-semibold text-black">
                                    My Active Tickets
                                </h1>

                                <p className="text-sm text-gray-500">
                                    Recently assigned tickets
                                </p>
                            </div>

                            <Link
                                to="/tickets"
                                className="group flex cursor-pointer items-center gap-2 rounded-md bg-[#4C4CF9] px-6 py-2 text-sm text-white transition hover:bg-[#3f3fe6]"
                            >
                                View All
                                <ArrowRight size={16} />
                            </Link>

                        </div>

                        <TicketTableSupport
                            dashboard={true}
                            maxRows={5}
                        />

                    </div>
                </div>

                {/* SLA OVERVIEW */}
                <div className="col-span-5">
                    <SLAOverviewSupport />
                </div>

                {/* TICKETS NEEDING ATTENTION */}
                <div className="col-span-12">
                    <TicketNeedingAttention />
                </div>

            </div>
        </div>
    );
}