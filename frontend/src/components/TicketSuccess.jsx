import { Check } from "lucide-react" 
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function TicketSuccess() {
    const { state } = useLocation();
        const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate("/dashboard");
        }, 5000);
        return () => clearTimeout(timer);
    }, []);

    return(
        <div>
            <Check size={30}/>
            <h1 className="text-3xl font-bold mt-4">
                {state?.message || "Ticket submitted successfully."}
            </h1>

            <p className="mt-3 text-gray-600">
                Redirecting to dashboard...
            </p>
        </div>
    );
}