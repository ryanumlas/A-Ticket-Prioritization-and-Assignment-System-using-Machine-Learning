import './App.css'
import react from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
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
import ActiveTicketSLA from './components/ActiveTicketSLA'
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
import { User } from 'lucide-react'


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
