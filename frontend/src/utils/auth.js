import { jwtDecode } from "jwt-decode";
import { ACCESS_TOKEN } from "../constant";

export function getCurrentUser() {
    const token = localStorage.getItem(ACCESS_TOKEN);

    if (!token) {
        return null
    }

    return jwtDecode(token);
}