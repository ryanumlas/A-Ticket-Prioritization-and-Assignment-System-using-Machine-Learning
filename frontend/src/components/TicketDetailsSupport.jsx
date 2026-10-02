
import { getCurrentUser } from "../utils/auth";
import AssignedTicketDetails from "../components/AssignedTicketDetails";
import QueueTicketDetails from "../components/QueueTicketDetails";

export default function TicketDetailsSupport({
    ticketDetails,
    onTicketUpdated,
    isAssisting = false,
    onAssistanceAccepted,
    onAssignToMe,
}) {
    const user = getCurrentUser();

    const currentUserId = user?.id ?? user?.user_id;

    const assignedUserId =
        ticketDetails?.assigned_to?.id ??
        ticketDetails?.assigned_to?.user_id ??
        ticketDetails?.assigned_to_id;

    const isAssignedToMe =
        currentUserId != null &&
        assignedUserId != null &&
        String(currentUserId) === String(assignedUserId);

    const hasMyAssistance = ticketDetails?.my_assistance != null;
    

    const shouldShowAssignedDetails =
        isAssignedToMe || isAssisting || hasMyAssistance;


    if (shouldShowAssignedDetails) {
        return (
            <AssignedTicketDetails
                ticketDetails={ticketDetails}
                onTicketUpdated={onTicketUpdated}
            />
        );
    }

    return (
        <QueueTicketDetails
            ticketDetails={ticketDetails}
            user={user}
            onTicketUpdated={onTicketUpdated}
            onAssistanceAccepted={onAssistanceAccepted}
            onAssignToMe={onAssignToMe}
        />
    );
}