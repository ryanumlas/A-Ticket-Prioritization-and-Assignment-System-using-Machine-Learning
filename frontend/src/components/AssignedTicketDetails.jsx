import LeftSidePanel from "./TicketDetailPanels/LeftSidePanel";
import RightSidePanel from "./TicketDetailPanels/RightSidePanel";
import CenterPanel from "./TicketDetailPanels/CenterPanel";

export default function AssignedTicketDetails({
    ticketDetails,
    onTicketUpdated,
}) {
    const isTicketLocked =
        ticketDetails?.is_under_review === true;

    return (
        <div className="flex h-[810px] w-full overflow-hidden rounded-xl border border-gray-300 bg-white">

            <LeftSidePanel
                ticketDetails={ticketDetails}
            />

            <div className="min-w-0 flex-1 flex flex-col bg-white">

                <div className="min-h-0 flex-1">

                    <CenterPanel
                        ticketId={ticketDetails?.id}
                        canSend={!isTicketLocked}
                        isUnderReview={isTicketLocked}
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