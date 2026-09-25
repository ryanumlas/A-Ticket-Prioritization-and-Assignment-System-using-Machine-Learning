export const historyColor = {
    green: "border-green-500 bg-green-500 text-white",
    blue: "border-blue-500 bg-[#4C4CF9] text-white",
    amber: "border-amber-500 bg-amber-500 text-white",
    purple: "border-purple-500 bg-purple-500 text-white",
    orange: "border-orange-500 bg-orange-500 text-white",
    red: "border-red-500 bg-red-500 text-white",
    gray: "border-gray-500 bg-gray-500 text-white",
};

export const getHistoryColor = (item) => {
    if (item.event_type === "CREATED") {
        return historyColor.green;
    }

    if (
        item.event_type === "ASSIGNED" ||
        item.event_type === "REASSIGNED"
    ) {
        return historyColor.blue;
    }

    if (item.event_type === "RETURNED") {
        return historyColor.orange;
    }

    if (
        item.event_type === "RETURN_APPROVED" ||
        item.event_type === "REVIEW_COMPLETED"
    ) {
        return historyColor.green;
    }

    if (
        item.event_type === "RETURN_REJECTED" ||
        item.event_type === "PRIORITY_REJECTED" ||
        item.event_type === "ESCALATED"
    ) {
        return historyColor.red;
    }

    if (
        item.event_type === "PRIORITY_REVIEW" ||
        item.event_type === "PRIORITY_REVIEW_REQUESTED"
    ) {
        return historyColor.amber;
    }

    if (item.event_type === "PRIORITY_CHANGED") {
        return historyColor.blue;
    }

    if (item.event_type === "STATUS_CHANGED") {
        const status = normalizeStatus(item.new_value);

        switch (status) {
            case "open":
                return historyColor.blue;

            case "under_review":
                return historyColor.purple;

            case "in_progress":
                return historyColor.amber;

            case "returned":
                return historyColor.orange;

            case "resolved":
                return historyColor.green;

            case "closed":
                return historyColor.gray;

            case "reopened":
                return historyColor.blue;

            case "cancelled":
                return historyColor.red;

            default:
                return historyColor.blue;
        }
    }

    return historyColor.blue;
};

function normalizeStatus(value) {
    if (!value) return "";

    return String(value)
        .trim()
        .toLowerCase()
        .replaceAll(" ", "_");
}