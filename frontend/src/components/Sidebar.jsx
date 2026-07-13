import { getCurrentUser } from "../utils/auth"
import { NavLink } from "react-router-dom";
import foundever_logo from "../assets/foundever_logo.png";
import foundever_blue from "../assets/foundever_blue.jpeg";
import { sidebarItems } from "../configs/sideBarItems";

export default function Sidebar({ role }) {
    const user = getCurrentUser()
    
    const menus = sidebarItems[user.role];
    return(
        <aside className="shadow-lg w-72 h-screen bg-[#4C4CF9] text-white p-4">
            <img src={foundever_blue} className="mb-10 p-2"/>
            <nav className="flex flex-col gap-4 ">
                {menus.map((item) => {
                    const Icon = item.icon;
                    return(
                    <NavLink key={item.name} to={item.path} className="p-2 rounded-md hover:bg-white hover:text-black flex items-center gap-3 transition duration-500 ease-in-out">
                        <Icon size={20}/>{item.name}
                    </NavLink>
                    );
                })}
            </nav>
        </aside>
    );

}