import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await api.post("user/token/", {
                username,
                password,
            })

            localStorage.setItem(ACCESS_TOKEN, response.data.access);
            localStorage.setItem(REFRESH_TOKEN, response.data.refresh);

            setLoading(false);

            navigate("/dashboard");
        } catch (error) {
            console.error(error);
            setLoading(false);
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <h1>Login</h1>
            <p>Username</p>
            <input type="text" value={username} onChange={(e) => setUsername(e.targetget.value)} placeholder="Username"/>
            <p>Password</p>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password"/>
            <button type="submit">Login</button>
        </form>
    )
}