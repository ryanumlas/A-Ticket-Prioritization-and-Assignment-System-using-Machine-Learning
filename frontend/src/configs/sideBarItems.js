import {
    LayoutDashboard,
    Ticket,
    Send,
    Bell,
    ListTodo,
    ClipboardCheck,
    TicketPlus,
    Undo2,
    Flag,
    ArrowUpDown,
    Users,
    UserCog,
    Settings,
    Building2,
    Tags,
    Stethoscope,
    ShieldCheck,
    FileClock,
Handshake,
    FileText,
    BarChart3,
    HandHelping, 
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
            icon: LayoutDashboard,
        },
        {
            type: "link",
            name: "Ticket Queue",
            path: "/ticket-queue",
            icon: ListTodo,
        },
        {
            type: "link",
            name: "Assigned Tickets",
            path: "/tickets",
            icon: ClipboardCheck,
        },
        {
            type: "link",
            name: "Assistance Queue",
            path: "/assistance-queue",
            icon: HandHelping,
        },
        {
            type: "link",
            name: "Assisted Tickets",
            path: "/assisted-tickets",
            icon: Handshake,
        },
        {
            type: "link",
            name: "Create Ticket",
            path: "/",
            icon: TicketPlus,
        },
        {
            type: "link",
            name: "Notifications",
            path: "/notifications",
            icon: Bell,
        },
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
            type: "link",
            name: "Notifications",
            path: "/notifications",
            icon: Bell
        },
                {
            type: "section",
            title: "TEAMS",
        },
    ],

    "System Administrator": [
        {
            type: "link",
            name: "Dashboard",
            path: "/dashboard",
            icon: LayoutDashboard
        },

        {
            type: "section",
            title: "Administration",
        },
        {
            type: "link",
            name: "User Management",
            path: "/user-management",
            icon: Users
        },
        {
            type: "link",
            name: "IT Support",
            path: "/it-support",
            icon: UserCog
        },

        {
            type: "section",
            title: "Configuration",
        },
        {
            type: "link",
            name: "Departments",
            path: "/departments",
            icon: Building2
        },
        {
            type: "link",
            name: "Categories",
            path: "/categories",
            icon: Tags
        },
        {
            type: "link",
            name: "Symptom Codes",
            path: "/symptom-codes",
            icon: Stethoscope
        },
        {
            type: "link",
            name: "Specializations",
            path: "/specializations",
            icon: ShieldCheck
        },
        {
            type: "link",
            name: "SLA Rules",
            path: "/sla-rules",
            icon: Settings
        },

        {
            type: "section",
            title: "System",
        },
        {
            type: "link",
            name: "Audit Logs",
            path: "/audit-logs",
            icon: FileClock
        },
        {
            type: "link",
            name: "Notifications",
            path: "/notifications",
            icon: Bell
        }
    ],
    "IT Supervisor": [
        {
            type: "link",
            name: "Dashboard",
            path: "/dashboard",
            icon: LayoutDashboard,
        },

        {
            type: "section",
            title: "Tickets",
        },
        {
            type: "link",
            name: "Escalated Tickets",
            path: "/supervisor/escalated-tickets",
            icon: Flag,
        },

        {
            type: "section",
            title: "Monitoring",
        },
        {
            type: "link",
            name: "SLA Monitoring",
            path: "/sla-monitoring",
            icon: FileClock,
        },
        {
            type: "link",
            name: "Team Workload",
            path: "/team-workload",
            icon: Users,
        },

        {
            type: "section",
            title: "Reports",
        },
        {
            type: "link",
            name: "Ticket Reports",
            path: "/ticket-reports",
            icon: FileText,
        },
        {
            type: "link",
            name: "SLA Reports",
            path: "/sla-reports",
            icon: BarChart3,
        },

        {
            type: "section",
            title: "System",
        },
        {
            type: "link",
            name: "Notifications",
            path: "/notifications",
            icon: Bell,
        },
    ],
};