import LeftSidePanel from "../components/TicketDetailPanels/LeftSidePanel";
import RightSidePanel from "../components/TicketDetailPanels/RightSidePanel";

export default function TicketDetailsEmployee({
    ticketDetails,
}) {
    return (
        <div className="flex h-[830px] w-full overflow-hidden rounded-xl border border-gray-300 bg-white">

            <LeftSidePanel
                ticketDetails={ticketDetails}
            />

            <div className="min-w-0 flex-1 bg-white">
                {/* Conversation will go here */}
            </div>

            <div className="w-[350px] shrink-0 border-l border-gray-300 bg-white">

                <RightSidePanel
                    ticketDetails={ticketDetails}
                />

            </div>

        </div>
    );
}