import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import PriorityRequestDetailsContent from "../components/PriorityRequestDetailsContent";

export default function PriorityRequestDetailsServiceDesk() {
    const navigate = useNavigate();

    return (
        <div
            className="
                h-full
                overflow-y-auto
                px-8
                py-7
                [&::-webkit-scrollbar]:w-px
                [&::-webkit-scrollbar-track]:bg-transparent
                [&::-webkit-scrollbar-thumb]:bg-transparent
                hover:[&::-webkit-scrollbar-thumb]:bg-gray-300
                [&::-webkit-scrollbar-thumb]:rounded-full
                min-[1280px]:max-[1365px]:px-5
                min-[1280px]:max-[1365px]:py-5
                min-[1366px]:max-[1537px]:px-6
                min-[1366px]:max-[1537px]:py-6
            "
        >
            {/* PAGE HEADER */}
            <div
                className="
                    mb-6
                    flex
                    items-start
                    justify-between
                    min-[1280px]:max-[1365px]:mb-4
                    min-[1366px]:max-[1537px]:mb-5
                "
            >
                <div>
                    <h1
                        className="
                            text-2xl
                            font-semibold
                            text-black
                            min-[1280px]:max-[1365px]:text-lg
                            min-[1366px]:max-[1537px]:text-xl
                        "
                    >
                        Priority Request Details
                    </h1>

                    <p
                        className="
                            mt-1
                            text-sm
                            text-gray-500
                            min-[1280px]:max-[1365px]:text-[11px]
                            min-[1366px]:max-[1537px]:text-xs
                        "
                    >
                        Review the priority change request and take the
                        necessary action.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => navigate("/priority-requests")}
                    className="
                        flex
                        h-10
                        cursor-pointer
                        items-center
                        gap-2
                        rounded-lg
                        border
                        border-gray-300
                        bg-white
                        px-4
                        text-sm
                        font-medium
                        text-black
                        transition-colors
                        hover:bg-gray-50
                        min-[1280px]:max-[1365px]:h-9
                        min-[1280px]:max-[1365px]:gap-1.5
                        min-[1280px]:max-[1365px]:px-3
                        min-[1280px]:max-[1365px]:text-[11px]
                        min-[1366px]:max-[1537px]:h-9
                        min-[1366px]:max-[1537px]:gap-1.5
                        min-[1366px]:max-[1537px]:px-3.5
                        min-[1366px]:max-[1537px]:text-xs
                    "
                >
                    <ArrowLeft
                        size={16}
                        className="
                            min-[1280px]:max-[1365px]:size-3.5
                            min-[1366px]:max-[1537px]:size-3.5
                        "
                    />

                    Back to Priority Requests
                </button>
            </div>

            <PriorityRequestDetailsContent />
        </div>
    );
}