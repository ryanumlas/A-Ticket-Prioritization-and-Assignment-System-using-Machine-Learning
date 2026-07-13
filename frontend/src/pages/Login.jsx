import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constant";
import foundever_logo from "../assets/foundever_logo.png";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [usernameError, setUsernameError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [loginError, setLoginError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await api.post("/user/token/", {
                username,
                password,
            })

            localStorage.setItem(ACCESS_TOKEN, response.data.access);
            localStorage.setItem(REFRESH_TOKEN, response.data.refresh);

            setLoading(false);

            navigate("/dashboard");
        } catch (error) {
            if(error.response?.data.username) {
                setUsernameError(error.response.data.username);
            }
            if(error.response?.data.password) {
                setPasswordError(error.response.data.password);
            }
            if(error.response?.data.account) {
                setLoginError(error.response.data.account);
            }
            console.error(error);
            setLoading(false);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex justify-center items-center min-h-screen">
            <form onSubmit={handleSubmit} className="flex flex-col gap-2 w-75">
                <img src={foundever_logo} alt="Foundever Logo" className="mx-auto mb-4 min-w-50 max-w-75" />
                <p className="">Username</p>
                <input type="text" value={username} onChange={(e) => {setUsername(e.target.value); setUsernameError("");}} placeholder="Username" className="border border-gray-600 p-2 rounded-sm"/>
                <p className="text-red-500">{usernameError}</p>
                <p className="">Password</p>
                <input type="password" value={password} onChange={(e) => {setPassword(e.target.value); setPasswordError("");}} placeholder="Password" className="border border-gray-600 p-2 rounded-sm"/>
                <p className="text-red-500">{passwordError}</p>
                <button type="submit" className="bg-blue-500 w-100% text-white p-2 rounded-sm font-semibold cursor-pointer">Enter to login</button>
                <p>Having trouble signing in? Contact Support</p>
            </form>
        </div>
    )
}