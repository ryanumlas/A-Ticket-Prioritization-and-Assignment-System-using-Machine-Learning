import LeftSidePanel from "../components/TicketDetailPanels/LeftSidePanel";
import RightSidePanel from "../components/TicketDetailPanels/RightSidePanel";
import CenterPanel from "../components/TicketDetailPanels/CenterPanel";

export default function SupervisorTicketDetails({
    ticketDetails,
    onTicketUpdated,
}) {
    return (
        <div className="flex h-[810px] w-full overflow-hidden rounded-xl border border-gray-300 bg-white">
            <LeftSidePanel
                ticketDetails={ticketDetails}
            />

            <div className="min-w-0 flex-1 flex flex-col bg-white">
                <div className="min-h-0 flex-1">
                    <CenterPanel
                        ticketId={ticketDetails?.id}
                        canSend={true}
                        isUnderReview={false}
                    />
                </div>
            </div>

            <div className="w-[350px] shrink-0 border-l border-gray-300 bg-white">
                <RightSidePanel
                    ticketDetails={ticketDetails}
                    onTicketUpdated={onTicketUpdated}
                />
            </div>
        </div>
    );
}