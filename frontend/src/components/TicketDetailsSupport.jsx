import { getCurrentUser } from "../utils/auth";
import AssignedTicketDetails from "../components/AssignedTicketDetails";
import QueueTicketDetails from "../components/QueueTicketDetails";

export default function TicketDetailsSupport({ ticketDetails }) {
    const user = getCurrentUser();


    const isAssignedToMe =
        Number(ticketDetails?.assigned_to?.id) ===
        Number(user?.user_id);

    if (isAssignedToMe) {
        return (
            <AssignedTicketDetails
                ticketDetails={ticketDetails}
            />
        );
    }

    return (
        <QueueTicketDetails
            ticketDetails={ticketDetails}
        />
    );
}