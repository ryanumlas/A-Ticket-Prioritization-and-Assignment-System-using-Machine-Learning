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
        <div className="border-gray-300 border w-150 rounded-xl p-5 m-5 items-center justify-center mx-auto shadow-md">
            <div className=" text-green-600 rounded-full border-gray-300 border w-fit p-2 shadow-md">
            <Check size={30} />
            </div>
            <h1 className="text-3xl font-bold mt-4">
                {state?.message || "Ticket submitted successfully."}
            </h1>

            <p className="mt-3 text-gray-600">
                Redirecting to dashboard...
            </p>
        </div>
    );
}