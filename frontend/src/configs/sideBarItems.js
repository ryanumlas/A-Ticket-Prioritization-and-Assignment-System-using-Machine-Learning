import {
    LayoutDashboard,
    Ticket,
    User,
    Users,
    ClipboardList,
    Send,
    Bell,
    ListTodo,
    ClipboardCheck,
    TicketPlus
} from "lucide-react";

export const sidebarItems = {
    Employee: [
        {
            name: "Dashboard",
            path: "/dashboard",
            icon: LayoutDashboard
        },
        {
            name: "My Tickets",
            path: "/tickets",
            icon: Ticket
        },
        {
            name: "Submit Ticket",
            path: "/submit/ticket",
            icon: Send
        },
        {
            name: "Notifications",
            path: "/notifications",
            icon: Bell
        }
    ],
    "IT Support Specialist": [
        {
            name: "Dashboard",
            path: "/dashboard",
            icon: LayoutDashboard
        },
        {
            name: "Ticket Queue",
            path: "/tickets",
            icon: ListTodo
        },
        {
            name: "Assigned Tickets",
            path: "/",
            icon: ClipboardCheck
        },
        {
            name: "Create Ticket",
            path: "/",
            icon: TicketPlus
        },
        {
            name: "Notifications",
            path: "/notifications",
            icon: Bell
        }
    ]
};