import { CircleDot, Info, Flag, CircleAlert, Users, CalendarDays, User, History, Ticket, TriangleAlert, Clock, Wrench, SquareUserRound} from "lucide-react"
import { statusColor } from "../utils/statusColor";
import { priorityColor, priorityLabel } from "../utils/priority";
import { formatDate } from "../utils/formatDate";

export default function TicketDetailsEmployee({ ticketDetails }) {
    const priority = ticketDetails.priority;

    return(
        <div className="w-full h-full border border-gray-300 rounded-xl flex flex-col">
            <div className="h-12 border-b border-gray-300 w-full px-4 flex items-center gap-2">
                <Ticket size={18} className="text-gray-500"/>
                <p className="text-sm font-medium text-gray-500">#{ticketDetails.ticket_code}</p>
            </div>

            <div className="border-r border-gray-300 w-[30%] h-full">
                <div className="p-4">
                    <h1 className="font-semibold text-xl mb-2">{ticketDetails.subject}</h1>
                    <p className="text-sm mb-2 text-gray-600">{ticketDetails.description}</p>

                    <p className="text-sm text-gray-600">{ticketDetails.business_impact}</p>
                </div>
                <div className="flex flex-col gap-2 w-full px-4">
                    <div className="flex items-center">
                        <div className="flex items-center gap-2 w-44">
                            <CircleDot size={18} className="text-gray-600" />
                            <p className="text-gray-600 text-sm">Status</p>
                        </div>

                        <p className={`px-2 py-1 rounded-md font-semibold text-sm ${statusColor[ticketDetails.status]}`}>
                            {ticketDetails.status}
                        </p>
                    </div>

                    <div className="flex items-center">
                        <div className="flex items-center gap-2 w-44">
                            <CircleAlert size={18} className="text-gray-600" />
                            <p className="text-gray-600 text-sm">Priority</p>
                        </div>

                        <p className={`px-2 py-1 rounded-md text-sm font-semibold ${priorityColor[priority]}`}>{priorityLabel[priority]}</p>
                    </div>

                    <div className="flex items-center">
                        <div className="flex items-center gap-2 w-44">
                            <Users size={18} className="text-gray-600" />
                            <p className="text-gray-600 text-sm">Affected Scope</p>
                        </div>

                        <p className="px-2 py-1 rounded-md text-sm font-medium">{ticketDetails.affected_scope}</p>
                    </div>

                    <div className="flex items-center">
                        <div className="flex items-center gap-2 w-44">
                            <History size={18} className="text-gray-600" />
                            <p className="text-gray-600 text-sm">Last Updated</p>
                        </div>

                        <p className="px-2 py-1 rounded-md text-sm font-medium">{formatDate(ticketDetails.updated_at)}</p>
                    </div>

                    <div className="flex items-center">
                        <div className="flex items-center gap-2 w-44">
                            <CalendarDays size={18} className="text-gray-600" />
                            <p className="text-gray-600 text-sm">Created at</p>
                        </div>

                        <p className="px-2 py-1 rounded-md text-sm font-medium">{formatDate(ticketDetails.created_at)}</p>
                    </div>

                    <div className="flex items-center">
                        <div className="flex items-center gap-2 w-44">
                            <User size={18} className="text-gray-600" />
                            <p className="text-gray-600 text-sm">Assigned to</p>
                        </div>

                        <p className="px-2 py-1 rounded-md text-sm font-medium">{ticketDetails.assigned_to || "-"}</p>
                    </div>
                    <div className="flex items-center">
                        <div className="flex items-center gap-2 w-44">
                            <Clock size={18} className="text-gray-600" />
                            <p className="text-gray-600 text-sm">Expected Response</p>
                        </div>
                        <p className="px-2 py-1 rounded-md text-sm font-medium">{formatDate(ticketDetails.response_deadline)}</p>
                    </div>
                    <div className="flex items-center">
                        <div className="flex items-center gap-2 w-44">
                            <Wrench size={18} className="text-gray-600" />
                            <p className="text-gray-600 text-sm">Expected Resolution</p>
                        </div>
                        <p className="px-2 py-1 rounded-md text-sm font-medium">{formatDate(ticketDetails.resolution_deadline)}</p>
                    </div>
                </div>
                <div className="border-t border-gray-300 my-4"></div>
                    <div className="flex flex-col gap-3 w-full px-4">
                        <div className="flex items-center gap-2">
                            <SquareUserRound size={24} className="text-gray-600" />
                            <p className="text-gray-600 font-medium">
                                Requester Information
                            </p>
                        </div>

                        <div className="flex items-center">
                            <p className="text-gray-600 text-sm w-32">
                                Name
                            </p>

                            <p className="text-sm font-medium">
                                {ticketDetails.first_name} {ticketDetails.last_name}
                            </p>
                        </div>

                        <div className="flex items-center">
                            <p className="text-gray-600 text-sm w-32">
                                Employee ID
                            </p>

                            <p className="text-sm font-medium">
                                {ticketDetails.user_code || "-"}
                            </p>
                        </div>

                        <div className="flex items-center">
                            <p className="text-gray-600 text-sm w-32">
                                Department
                            </p>

                            <p className="text-sm font-medium">
                                {ticketDetails.employee_department || "-"}
                            </p>
                        </div>

                        <div className="flex items-center">
                            <p className="text-gray-600 text-sm w-32">
                                Office Location
                            </p>

                            <p className="text-sm font-medium">
                                {ticketDetails.office_location || "-"}
                            </p>
                        </div>

                        <div className="flex items-center">
                            <p className="text-gray-600 text-sm w-32">
                                Workstation
                            </p>

                            <p className="text-sm font-medium">
                                {ticketDetails.workstation || "-"}
                            </p>
                        </div>
                    </div>
            </div>
        </div>
    );
}