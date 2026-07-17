import TicketForm from '../components/TicketForm'
import Sidebar from "../components/Sidebar";

export default function SubmitTicket() {
    return(
        <div className="flex w-screen h-screen overflow-hidden bg-gray-50">
            <Sidebar/>
            <div className="flex-1 h-screen flex flex-col">
                <div className="h-20 border-b border-gray-300 bg-white shrink-0">
                </div>

            <main className="p-6 overflow-y-auto">
                <TicketForm />
            </main>
            </div>
        </div>
    );
}