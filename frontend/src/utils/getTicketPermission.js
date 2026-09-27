export function getTicketPermissions(user) {
    const role = user?.role;

    return {
        canEditStatus:
            role === "IT Support Specialist" ||
            role === "IT Supervisor",

        canEditSymptomCode:
            role === "IT Support Specialist" ||
            role === "IT Supervisor",

        canEditPriority:
            role === "IT Support Specialist" ||
            role === "IT Supervisor",

        canRequestPriorityChange:
            role === "IT Support Specialist" ||
            role === "IT Supervisor",

        canAcknowledgeEscalation:
            role === "IT Supervisor",

        canEscalate:
            role === "IT Support Specialist",

        canSendMessages:
            role === "IT Support Specialist" ||
            role === "IT Supervisor",

        canUseInternalNotes:
            role === "IT Support Specialist" ||
            role === "IT Supervisor",
        canCompleteEscalation :
            role === "IT Supervisor",
    };
}