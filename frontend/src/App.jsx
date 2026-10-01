import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Sidebar from './components/Sidebar'
import Dashboard from "./pages/Dashboard";
import Tickets from "./pages/Tickets";
import TicketSuccess from './components/TicketSuccess'
import FlaggedTicketDetails from "./pages/FlaggedTicketDetails"
import SubmitTicket from './pages/SubmitTicket'
import NotFound from './pages/NotFound'
import ProtectedRoute from './components/ProtectedRoute'
import FlaggedTickets from './pages/FlaggedTickets'
import AuditLogs from './pages/AuditLogs'
import EscalatedTicket from './pages/EscalatedTicket'
import { Toaster } from "sonner";
import TicketQueue from './pages/TicketQueue'
import TicketDetails from './pages/TicketDetails'
import PriorityRequest from './pages/PriorityRequest'
import PriorityRequestDetails from './pages/PriorityRequestDetails'
import TicketReturn from './pages/TicketReturn'
import TicketReturnedDetail from './pages/TicketReturnedDetail'
import Notification from './pages/Notification'
import UserList from './pages/UserList'
import SystemAdUserCreate from "./pages/SystemAdUserCreate";
import SystemUserDetails from './pages/SystemUserDetails'
import ServiceDeskDepartmentQueue from './pages/ServiceDeskDepartmentQueue'
import SystemAdUserEdit from './pages/SystemAdUserEdit'
import SystemAdDepartments from './pages/SystemAdDepartments'
import SystemAdCategories from './pages/SystemAdCategories'
import SystemAdSymptomCodes from './pages/SystemAdSymptomCodes'
import SystemAdSpecializations from './pages/SystemAdSpecializations'
import SystemAdSLARules from './pages/SystemAdSLARules'
import AssistanceQueue from './pages/AssistanceQueue';
import AssistanceTicket from './pages/AssistanceTicket'
import ReopenRequest from './pages/ReopenRequest'
import TeamWorkload from './pages/TeamWorkload'

// function Logout() {
//   localStorage.clear()
//   return <Navigate to="/login" />
// }

function App() {
  return (
    <>
        <Toaster
            position="top-right"
            richColors
            closeButton
        />

        <Routes>

            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/notifications"
                element={
                    <ProtectedRoute>
                        <Notification />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/tickets"
                element={
                    <ProtectedRoute>
                        <Tickets />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/submit/ticket"
                element={
                    <ProtectedRoute allowedRoles={["Employee"]}>
                        <SubmitTicket />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/ticket/:ticketId"
                element={
                    <ProtectedRoute>
                        <TicketDetails />
                    </ProtectedRoute>
                }
            />

                
            {/* FOR IT SUPPORT AND SERVICE */}
            <Route path="/ticket-queue" 
                element={
                    <ProtectedRoute>
                        <TicketQueue/>
                    </ProtectedRoute>
            }
            />

            <Route path="/assistance-queue" 
                element={
                    <ProtectedRoute>
                        <AssistanceQueue/>
                    </ProtectedRoute>
            }
            />
            <Route path="/assisted-tickets" 
                element={
                    <ProtectedRoute>
                        <AssistanceTicket/>
                    </ProtectedRoute>
            }
            />
            <Route path="/team-workload" 
                element={
                    <ProtectedRoute>
                        <TeamWorkload/>
                    </ProtectedRoute>
                }
            />
            <Route path="/reopen-requests" 
                element={
                    <ProtectedRoute>
                        <ReopenRequest/>
                    </ProtectedRoute>
                }
            />
            {/* IT SERVICE DESK ONLY */}
            <Route
                path="/flagged-ticket/:id"
                element={
                    <ProtectedRoute
                        allowedRoles={["IT Service Desk"]}
                    >
                        <FlaggedTicketDetails />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/service-desk/department/:departmentId"
                element={
                    <ProtectedRoute
                        allowedRoles={["IT Service Desk"]}
                    >
                        <ServiceDeskDepartmentQueue />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/returned-tickets"
                element={
                    <ProtectedRoute
                        allowedRoles={["IT Service Desk"]}
                    >
                        <TicketReturn/>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/returned-ticket/:ticketId"
                element={
                    <ProtectedRoute
                        allowedRoles={["IT Service Desk"]}
                    >
                        <TicketReturnedDetail/>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/flagged-tickets"
                element={
                    <ProtectedRoute
                        allowedRoles={["IT Service Desk"]}
                    >
                        <FlaggedTickets />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/ticket-success"
                element={<TicketSuccess />}
            />

            <Route 
                path="/priority-request/:id"
                element={
                    <ProtectedRoute
                        allowedRoles={["IT Service Desk"]}
                    >
                        <PriorityRequestDetails />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/priority-requests"
                element={
                    <ProtectedRoute
                        allowedRoles={["IT Service Desk"]}
                    >
                        <PriorityRequest />
                    </ProtectedRoute>
                }
            />
            {/* System Admin */}
            <Route
                path="/user-management"
                element={
                    <ProtectedRoute
                        allowedRoles={["System Administrator"]}
                    >
                        <UserList />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/audit-logs"
                element={
                    <ProtectedRoute
                        allowedRoles={["System Administrator"]}
                    >
                        <AuditLogs/>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/departments"
                element={
                    <ProtectedRoute
                        allowedRoles={["System Administrator"]}
                    >
                        <SystemAdDepartments />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/categories"
                element={
                    <ProtectedRoute
                        allowedRoles={["System Administrator"]}
                    >
                        <SystemAdCategories />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/symptom-codes"
                element={
                    <ProtectedRoute
                        allowedRoles={["System Administrator"]}
                    >
                        <SystemAdSymptomCodes />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/specializations"
                element={
                    <ProtectedRoute
                        allowedRoles={["System Administrator"]}
                    >
                        <SystemAdSpecializations />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/sla-rules"
                element={
                    <ProtectedRoute
                        allowedRoles={["System Administrator"]}
                    >
                        <SystemAdSLARules />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/user-management/create"
                element={
                    <ProtectedRoute
                        allowedRoles={["System Administrator"]}
                    >
                        <SystemAdUserCreate />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/user-management/:id"
                element={
                    <ProtectedRoute
                        allowedRoles={["System Administrator"]}
                    >
                        <SystemUserDetails />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/user-management/:id/edit"
                element={
                    <ProtectedRoute
                        allowedRoles={["System Administrator"]}
                    >
                        <SystemAdUserEdit />
                    </ProtectedRoute>
                }
            />

            {/* Supervisor */}
            <Route
                path="/supervisor/escalated-tickets"
                element={
                    <ProtectedRoute
                        allowedRoles={["IT Supervisor"]}
                    >
                        <EscalatedTicket />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/sidebar"
                element={<Sidebar />}
            />

            <Route
                path="/login"
                element={<Login />}
            />

            {/* <Route
                path="/logout"
                element={<Logout />}
            /> */}

            <Route
                path="/"
                element={
                    <Navigate
                        to="/login"
                        replace
                    />
                }
            />

            <Route
                path="*"
                element={<NotFound />}
            />

        </Routes>
    </>
  )
}

export default App
