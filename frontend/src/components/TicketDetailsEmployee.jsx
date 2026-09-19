import { Lock } from "lucide-react";

import LeftSidePanel from "../components/TicketDetailPanels/LeftSidePanel";
import RightSidePanel from "../components/TicketDetailPanels/RightSidePanel";
import CenterPanel from "../components/TicketDetailPanels/CenterPanel";

export default function TicketDetailsEmployee({
    ticketDetails,
}) {
    const isTicketLocked =
        ticketDetails?.is_under_review === true;

    return (
        <div className="flex h-[810px] w-full overflow-hidden rounded-xl border border-gray-300 bg-white">

            <LeftSidePanel
                ticketDetails={ticketDetails}
            />

            <CenterPanel
                ticketId={ticketDetails.id}
                isUnderReview={isTicketLocked}
                canSend={!isTicketLocked}
            />

            <div className="w-[350px] shrink-0 border-gray-300 bg-white">
                <RightSidePanel
                    ticketDetails={ticketDetails}
                />
            </div>

        </div>
    );
}