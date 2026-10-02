import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    LoaderCircle,
    TriangleAlert,
} from "lucide-react";

import api from "/src/api";

import EmployeeProfile from "./UserProfiles/EmployeeProfile";
import ITSupportProfile from "./UserProfiles/ITSupportProfile";
import ITStaffProfile from "./UserProfiles/ITStaffProfile";

// CHANGE THESE TWO IMPORT PATHS TO YOUR EXISTING COMPONENT PATHS
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";


export default function UserProfile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    const fetchProfile = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                "/users/profile/"
            );

            setProfile(response.data);
        } catch (error) {
            const message =
                error?.response?.data?.error ||
                error?.response?.data?.detail ||
                "Unable to load your profile.";

            setError(message);
        } finally {
            setLoading(false);
        }
    }, []);


    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);


    const renderProfileContent = () => {
        if (loading) {
            return (
                <div className="flex min-h-[400px] items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <LoaderCircle
                            size={28}
                            className="animate-spin text-[#4C4CF9]"
                        />

                        <p className="text-sm text-gray-500">
                            Loading profile...
                        </p>
                    </div>
                </div>
            );
        }


        if (error) {
            return (
                <div className="flex min-h-[400px] items-center justify-center px-4">
                    <div className="w-full max-w-md rounded-xl border border-red-200 bg-red-50 p-5">
                        <div className="flex items-start gap-3">
                            <TriangleAlert
                                size={20}
                                className="mt-0.5 shrink-0 text-red-500"
                            />

                            <div>
                                <p className="text-sm font-semibold text-red-700">
                                    Unable to load profile
                                </p>

                                <p className="mt-1 text-sm text-red-600">
                                    {error}
                                </p>

                                <button
                                    type="button"
                                    onClick={fetchProfile}
                                    className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
                                >
                                    Try Again
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }


        if (!profile) {
            return null;
        }


        const role = String(
            profile.role || ""
        )
            .trim()
            .toLowerCase();


        if (role === "employee") {
            return (
                <EmployeeProfile
                    profile={profile}
                />
            );
        }


        if (role === "it support specialist") {
            return (
                <ITSupportProfile
                    profile={profile}
                    onProfileUpdated={fetchProfile}
                />
            );
        }


        if (
            role === "it supervisor" ||
            role === "it service desk" ||
            role === "system administrator"
        ) {
            return (
                <ITStaffProfile
                    profile={profile}
                />
            );
        }


        return (
            <div className="flex min-h-[400px] items-center justify-center px-4">
                <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
                    <TriangleAlert
                        size={26}
                        className="mx-auto text-amber-500"
                    />

                    <p className="mt-3 text-sm font-semibold text-gray-900">
                        Profile unavailable
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                        No profile layout is configured for{" "}
                        {profile.role || "this role"}.
                    </p>
                </div>
            </div>
        );
    };


    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Area */}
            <div className="flex min-w-0 flex-1 flex-col">
                {/* Topbar */}
                <Topbar />

                {/* Page Content */}
                <main className="min-w-0 flex-1 overflow-y-auto">
                    {renderProfileContent()}
                </main>
            </div>
        </div>
    );
}