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
    TicketPlus,
    Tickets,
    TicketX,
    Undo2,
    Flag,
    ArrowUpDown
} from "lucide-react";

export const sidebarItems = {
    Employee: [
        {   
            type: "link",
            name: "Dashboard",
            path: "/dashboard",
            icon: LayoutDashboard
        },
        {
            type: "link",
            name: "My Tickets",
            path: "/tickets",
            icon: Ticket
        },
        {
            type: "link",
            name: "Submit Ticket",
            path: "/submit/ticket",
            icon: Send
        },
        {
            type: "link",
            name: "Notifications",
            path: "/notifications",
            icon: Bell
        }
    ],
    "IT Support Specialist": [
        {
            type: "link",
            name: "Dashboard",
            path: "/dashboard",
            icon: LayoutDashboard
        },
        {
            type: "link",
            name: "Ticket Queue",
            path: "/ticket-queue",
            icon: ListTodo
        },
        {
            type: "link",
            name: "Assigned Tickets",
            path: "/tickets",
            icon: ClipboardCheck
        },
        {
            type: "link",
            name: "Create Ticket",
            path: "/",
            icon: TicketPlus
        },
        {
            type: "link",
            name: "Notifications",
            path: "/notifications",
            icon: Bell
        }
    ],
    "IT Service Desk": [
        {
            type: "link",
            name: "Dashboard",
            path: "/dashboard",
            icon: LayoutDashboard
        },
        {
            type: "section",
            title: "Tickets",
        },
        // {
        //     type: "link",
        //     name: "Ticket Queue",
        //     path: "/ticket-queue",
        //     icon: ListTodo
        // },
        // {
        //     type: "link",
        //     name: "Assigned Tickets",
        //     path: "/tickets",
        //     icon: ClipboardCheck
        // },
        {
            type: "link",
            name: "Flagged Tickets",
            path: "/flagged-tickets",
            icon: Flag
        },
        {
            type: "link",
            name: "Returned Tickets",
            path: "/returned-tickets",
            icon: Undo2
        },
        {
            type: "link",
            name: "Priority Requests",
            path: "/priority-requests",
            icon: ArrowUpDown
        },
        {
            name: "Network Team",
            path: "/"
        },
        {
            name: "Software Team",
            path: "/"
        },
        {
            name: "Hardware Team",
            path: "/"
        },
    ]
};