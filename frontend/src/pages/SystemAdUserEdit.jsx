import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import SystemAdUserEditForm from "../components/SystemAdUserEditForm";

export default function SystemAdUserEdit() {
    const navigate = useNavigate();
    const { id } = useParams();

    const returnToUserList = () => navigate("/user-management");

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-gray-50">
            <Sidebar />
            <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                <Topbar />
                <main className="flex-1 overflow-y-auto">
                    <div className="flex items-center gap-3 border-b border-gray-200 bg-white px-5 py-4">
                        <button
                            type="button"
                            onClick={returnToUserList}
                            aria-label="Back to users"
                            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border border-gray-300 text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
                        >
                            <ArrowLeft size={17} />
                        </button>
                        <div>
                            <h1 className="text-xl font-semibold text-gray-900">
                                Edit User
                            </h1>
                            <p className="mt-0.5 text-sm text-gray-500">
                                Update account details and role assignments.
                            </p>
                        </div>
                    </div>

                    <div className="p-5 sm:p-6">
                        <div className="mx-auto max-w-5xl border border-gray-200 bg-white p-5 sm:p-6">
                            <SystemAdUserEditForm
                                userId={id}
                                onSuccess={returnToUserList}
                                onCancel={returnToUserList}
                            />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}