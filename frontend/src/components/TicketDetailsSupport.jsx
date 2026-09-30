import { getCurrentUser } from "../utils/auth";
import AssignedTicketDetails from "../components/AssignedTicketDetails";
import QueueTicketDetails from "../components/QueueTicketDetails";

export default function TicketDetailsSupport({
    ticketDetails,
    onTicketUpdated,
    isAssisting = false,
    onAssistanceAccepted,
}) {
    const user = getCurrentUser();

    const isAssignedToMe =
        Number(ticketDetails?.assigned_to?.id) ===
        Number(user?.user_id);

    const hasMyAssistance =
        ticketDetails?.my_assistance != null;

    const shouldShowAssignedDetails =
        isAssignedToMe ||
        isAssisting ||
        hasMyAssistance;

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
        />
    );
}