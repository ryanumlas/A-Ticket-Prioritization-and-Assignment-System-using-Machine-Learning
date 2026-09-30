import LeftSidePanel from "./TicketDetailPanels/LeftSidePanel";
import RightSidePanel from "./TicketDetailPanels/RightSidePanel";
import CenterPanel from "./TicketDetailPanels/CenterPanel";
import { getCurrentUser } from "../utils/auth";

export default function AssignedTicketDetails({
    ticketDetails,
    onTicketUpdated,
}) {
    const user = getCurrentUser();

    const isTicketLocked =
        ticketDetails?.is_under_review === true;

    const isPrimaryTechnician =
        user?.role === "IT Support Specialist" &&
        Number(ticketDetails?.assigned_to?.id) ===
            Number(user?.user_id);

    return (
        <div className="flex h-full min-h-0 w-full min-w-0 items-stretch overflow-hidden rounded-xl border border-gray-300 bg-white">
            <div className="h-full min-h-0 w-[450px] min-w-[450px] shrink-0 overflow-hidden min-[1280px]:max-[1535px]:w-[320px] min-[1280px]:max-[1535px]:min-w-[320px]">
                <LeftSidePanel
                    ticketDetails={ticketDetails}
                />
            </div>

            <div className="h-full min-h-0 min-w-0 flex-1 overflow-hidden bg-white">
                <CenterPanel
                    ticketId={ticketDetails?.id}
                    canSend={!isTicketLocked}
                    isUnderReview={isTicketLocked}
                />
            </div>

            <div className="h-full min-h-0 w-[350px] min-w-[350px] shrink-0 overflow-hidden border-l border-gray-300 bg-white min-[1280px]:max-[1535px]:w-[280px] min-[1280px]:max-[1535px]:min-w-[280px]">
                <RightSidePanel
                    ticketDetails={ticketDetails}
                    onTicketUpdated={onTicketUpdated}
                    canEditStatus={isPrimaryTechnician}
                />
            </div>
        </div>
    );
}