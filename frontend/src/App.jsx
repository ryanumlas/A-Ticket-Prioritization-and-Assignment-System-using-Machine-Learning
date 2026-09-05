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

function Logout() {
  localStorage.clear()
  return <Navigate to="/login" />
}

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
            {/* IT SUPPORT ONLY */}
            <Route
                path="/sidebar"
                element={<Sidebar />}
            />

            <Route
                path="/login"
                element={<Login />}
            />

            <Route
                path="/logout"
                element={<Logout />}
            />

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
