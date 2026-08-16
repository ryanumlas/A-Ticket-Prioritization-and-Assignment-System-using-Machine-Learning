import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constant";
import foundever_logo from "../assets/foundever_logo.png";
import api from "../api";
import {
    CircleX,
    LockKeyhole,
    Eye,
    EyeOff,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [usernameError, setUsernameError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [loginError, setLoginError] = useState("");

    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        setUsernameError("");
        setPasswordError("");
        setLoginError("");
        setLoading(true);

        try {
            const response = await api.post("user/token/", {
                username,
                password,
            });

            localStorage.setItem(
                ACCESS_TOKEN,
                response.data.access
            );

            localStorage.setItem(
                REFRESH_TOKEN,
                response.data.refresh
            );

            navigate("/dashboard", { replace: true });

        } catch (error) {
            if (error.response?.data?.username) {
                setUsernameError(
                    error.response.data.username
                );
            }

            if (error.response?.data?.password) {
                setPasswordError(
                    error.response.data.password
                );
            }

            if (error.response?.data?.account) {
                setLoginError(
                    error.response.data.account
                );
            }

            console.error(error);

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">

            <div className="w-full max-w-sm">

                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <img
                        src={foundever_logo}
                        alt="Foundever Logo"
                        className="w-52 object-contain"
                    />
                </div>


                {/* Login Card */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-7">

                    {/* Header */}
                    <div className="text-center mb-7">

                        <div className="mx-auto w-11 h-11 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                            <LockKeyhole
                                className="text-[#4C4CF9]"
                                size={20}
                            />
                        </div>

                        <h1 className="text-2xl font-semibold text-gray-900">
                            Welcome back
                        </h1>

                        <p className="text-sm text-gray-500 mt-2">
                            Sign in to your account
                        </p>

                    </div>


                    {loginError && (
                        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 mb-5">

                            <CircleX
                                className="text-red-500 shrink-0 mt-0.5"
                                size={16}
                            />

                            <p className="text-xs text-red-600">
                                {loginError}
                            </p>

                        </div>
                    )}


                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5"
                    >

                        <div>

                            <label className="block text-sm font-medium  mb-2">
                                Username
                            </label>

                            <input
                                type="text"
                                value={username}
                                onChange={(e) => {
                                    setUsername(e.target.value);
                                    setUsernameError("");
                                    setLoginError("");
                                }}
                                placeholder="Enter your username"
                                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none transition
                                    ${
                                        usernameError
                                            ? "border-red-400 focus:ring-2 focus:ring-red-100"
                                            : "border-gray-300 focus:border-[#4C4CF9] focus:ring-2 focus:ring-indigo-100"
                                    }`}
                            />

                            {usernameError && (
                                <div className="flex items-center gap-2 mt-2">

                                    <CircleX
                                        className="text-red-500 shrink-0"
                                        size={15}
                                    />

                                    <p className="text-xs text-red-500">
                                        {usernameError}
                                    </p>

                                </div>
                            )}

                        </div>


                        <div>

                            <label className="block text-sm font-medium mb-2">
                                Password
                            </label>

                            <div className="relative">

                                <input
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        setPasswordError("");
                                        setLoginError("");
                                    }}
                                    placeholder="Enter your password"
                                    className={`w-full px-3.5 py-2.5 pr-11 rounded-lg border text-sm outline-none transition
                                        ${
                                            passwordError
                                                ? "border-red-400 focus:ring-2 focus:ring-red-100"
                                                : "border-gray-300 focus:border-[#4C4CF9] focus:ring-2 focus:ring-indigo-100"
                                        }`}
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(
                                            !showPassword
                                        )
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                                >
                                    {showPassword ? (
                                        <EyeOff size={17} />
                                    ) : (
                                        <Eye size={17} />
                                    )}
                                </button>

                            </div>

                            {passwordError && (
                                <div className="flex items-center gap-2 mt-2">

                                    <CircleX
                                        className="text-red-500 shrink-0"
                                        size={15}
                                    />

                                    <p className="text-xs text-red-500">
                                        {passwordError}
                                    </p>

                                </div>
                            )}

                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#4C4CF9] hover:bg-[#3F3FE6] disabled:bg-indigo-300 text-white py-2.5 rounded-lg font-semibold text-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                "Sign in"
                            )}
                        </button>

                    </form>

                    <div className="mt-6 text-center">

                        <p className="text-xs text-gray-400">
                            Having trouble signing in?
                        </p>

                        <p className="text-xs text-gray-500 mt-1">
                            Contact IT Service Desk.
                        </p>

                    </div>

                </div>
            </div>

        </div>
    );
}