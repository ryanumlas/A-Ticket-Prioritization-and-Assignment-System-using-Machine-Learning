export const formatDate = (date) => {
    if (!date) return "-";

    const formattedDate = new Date(date);

    const datePart = formattedDate.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    });

    const timePart = formattedDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });

    return `${datePart} • ${timePart}`;
};