import { getCurrentUser } from "../utils/auth";
import { NavLink } from "react-router-dom";
import foundever_blue from "../assets/foundever_blue.jpeg";
import { sidebarItems } from "../configs/sideBarItems";

export default function Sidebar() {
    const user = getCurrentUser();

    const menus = sidebarItems[user.role];

    return (
        <aside className="shadow-lg w-67 h-screen bg-[#4C4CF9] text-white p-4">
            <img
                src={foundever_blue}
                alt="Foundever"
                className="mb-10 p-2"
            />

            <nav className="flex flex-col gap-2">
                {menus.map((item) => {
                    if (item.type === "section") {
                        return (
                            <div key={item.title} className="mt-4">
                                <p className="text-xs uppercase text-white font-semibold mb-2">
                                    {item.title}
                                </p>
                            </div>
                        );
                    }

                    const Icon = item.icon;

                    return (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 p-2 rounded-md text-sm transition-all ${
                                    isActive
                                        ? "bg-white text-black"
                                        : "hover:bg-white hover:text-black"
                                }`
                            }
                        >
                            {Icon && <Icon size={18} />}
                            <span>{item.name}</span>
                        </NavLink>
                    );
                })}
            </nav>
        </aside>
    );
}