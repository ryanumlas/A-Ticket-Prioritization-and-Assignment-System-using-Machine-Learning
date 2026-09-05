import {
    ChevronDown,
} from "lucide-react";

import LeftSidePanel from "./TicketDetailPanels/LeftSidePanel";
import RightSidePanel from "./TicketDetailPanels/RightSidePanel";

export default function AssignedTicketDetails({ ticketDetails }) {
    return (
        <div className="relative h-full min-h-0">
            <div className="flex h-full w-full overflow-hidden rounded-xl border border-gray-300 bg-white">
                <LeftSidePanel
                    ticketDetails={ticketDetails}
                />

                <div className="min-w-0 flex-1 bg-white">
                    {/* Conversation panel goes here */}
                </div>

                <div className="w-[350px] shrink-0 border-l border-gray-300 bg-white">
                    <RightSidePanel
                        ticketDetails={ticketDetails}
                    />
                </div>

            </div>

        </div>
    );
}