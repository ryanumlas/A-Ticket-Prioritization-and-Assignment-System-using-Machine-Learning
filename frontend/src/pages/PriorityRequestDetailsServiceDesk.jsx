import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import PriorityRequestDetailsContent from "../components/PriorityRequestDetailsContent";

export default function PriorityRequestDetailsServiceDesk() {
    const navigate = useNavigate();

    return (
        <div className="h-full overflow-y-auto px-8 py-7">

            {/* PAGE HEADER */}
            <div className="mb-6 flex items-start justify-between">

                <div>
                    <h1 className="text-2xl font-semibold text-black">
                        Priority Request Details
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Review the priority change request and take the necessary action.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => navigate("/priority-requests")}
                    className="flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-black transition-colors hover:bg-gray-50"
                >
                    <ArrowLeft size={16} />

                    Back to Priority Requests
                </button>

            </div>

            <PriorityRequestDetailsContent />

        </div>
    );
}