import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SystemAdUserCreateForm from "../components/SystemAdUserCreateForm";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

export default function SystemAdUserCreate() {
    const navigate = useNavigate();

    const handleSuccess = () => {
        navigate("/user-management");
    };

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
            <Sidebar />

            <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                <Topbar />

                <main className="flex-1 overflow-y-auto">
                    <div className="flex items-center gap-3 p-6">
                        <button
                            type="button"
                            onClick={() =>
                                navigate("/user-management")
                            }
                            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border border-gray-300 bg-white text-gray-600 transition-colors hover:bg-gray-50 hover:text-black"
                        >
                            <ArrowLeft size={17} />
                        </button>

                        <div>
                            <h1 className="text-2xl font-semibold text-black">
                                Create User
                            </h1>

                            <p className="mt-1 text-sm text-gray-500">
                                Create a new system user account.
                            </p>
                        </div>
                    </div>

                    <div className="px-6 pb-6">
                        <SystemAdUserCreateForm
                            onSuccess={handleSuccess}
                            onCancel={() =>
                                navigate("/user-management")
                            }
                        />
                    </div>
                </main>
            </div>
        </div>
    );
}