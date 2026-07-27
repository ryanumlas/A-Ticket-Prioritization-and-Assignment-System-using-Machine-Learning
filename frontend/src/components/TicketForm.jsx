import { getCurrentUser } from "../utils/auth";
import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom";
import api from '../api';

export default function TicketForm() {
    const user = getCurrentUser()
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        subject: "",
        description: "",
        affected_scope: "",
        business_impact: "",
        workstation: "",
    })
    // const [departments, setDepartments] = useState([]);
    // const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(false);
    const affectedScopeChoices = [
        { value: "individual", label: "Individual" },
        { value: "group", label: "Group" },
        { value: "department", label: "Department" },
        { value: "organization_wide", label: "Organization Wide" }
    ];

    // useEffect(() => {
    //     const fetchDropdownOptions = async () => {
    //         try {
    //             const [deptResponse, locResponse] = await Promise.all([
    //                 api.get("/departments/employee/list/"),
    //                 api.get("/departments/office/list/")
    //             ]) 
    //             setDepartments(deptResponse.data || []);
    //             setLocations(locResponse.data || []);
    //         } catch (error) {
    //             console.error(error);
    //         }
    //     };
        
    //     fetchDropdownOptions();
    // }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        setLoading(true);
        try {
            const response = await api.post("/tickets/create/", formData);
            navigate("/ticket-success", {
                state: {
                    message: response.data.message,
                },
            });
        } catch (error) {
            if (error.response) {
                console.log(error.response.data);
            } else {
                console.error(error);
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <form className="mx-auto w-full max-w-5xl  bg-white border border-gray-300 rounded-lg p-6 text-sm" onSubmit={handleSubmit}>

            <h1 className="text-lg font-semibold mb-3">User Information</h1>

            <div className="grid grid-cols-2 gap-x-10 gap-y-5">

                <div className="flex flex-col">
                    <label className="mb-2 font-medium">Full Name</label>
                    <input
                        type="text" readOnly value={`${user.first_name} ${user.last_name || "-"}`}
                        className="border border-gray-300 rounded-md p-2"
                    />
                </div>

                <div className="flex flex-col">
                    <label className="mb-2 font-medium">User ID</label>
                    <input
                        type="text" readOnly value={`${user.user_code || "null"}`}
                        className="border border-gray-300 rounded-md p-2"
                    />
                </div>

                <div className="flex flex-col">
                    <label className="mb-2 font-medium">Department</label>
                    {/* <select className="border border-gray-300 rounded-md p-2" name="employee_department" value={formData.employee_department} onChange={handleChange}>
                        <option value="">Select Department</option>
                        {departments.map((dept) => (
                            <option key={dept.id} value={dept.id}>
                                {dept.name}
                            </option>
                        ))}
                    </select> */}
                    <input type="text" readOnly value={user.employee_department || "null"} className="border border-gray-300 rounded-md p-2"/>
                </div>

                <div className="flex flex-col">
                    <label className="mb-2 font-medium">Office Location</label>
                    {/* <select className="border border-gray-300 rounded-md p-2" name="office_location" value={formData.office_location} onChange={handleChange}>
                        <option value="">Select Office</option>
                        {locations.map((loc) => (
                            <option key={loc.id} value={loc.id}>
                                {loc.name}
                            </option>
                        ))}
                    </select> */}
                    <input type="text" readOnly value={user.office_location || "null"} className="border border-gray-300 rounded-md p-2"/>
                </div>

                <div className="flex flex-col">
                    <label className="mb-2 font-medium">Workstation</label>
                    <input
                        type="text" value={formData.workstation} name="workstation" onChange={handleChange}
                        className="border border-gray-300 rounded-md p-2"
                    />
                </div>

            </div>

            <hr className="my-8 border-gray-300" />

            <h1 className="text-lg font-semibold mb-3">Issue Details</h1>

            <div className="flex flex-col gap-5">

                <div>
                    <label className="block mb-2 font-medium">Subject</label>
                    <input
                        type="text" value={formData.subject} onChange={handleChange}
                        placeholder="Input 1–2 sentence summary" name="subject"
                        className="w-full border border-gray-300 rounded-md p-2"
                    />
                </div>

                <div className="w-60">
                    <label className="block mb-2 font-medium">Affected Scope</label>
                    <select className="w-full border border-gray-300 rounded-md p-2" name="affected_scope" value={formData.affected_scope} onChange={handleChange}>
                        <option value="">Select Scope</option>
                        {affectedScopeChoices.map((choice) => (
                            <option key={choice.value} value={choice.value}>
                                {choice.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block mb-2 font-medium">Description</label>
                    <textarea
                        rows={6} value={formData.description} onChange={handleChange} name="description"
                        placeholder="Describe your issue..."
                        className="w-full border border-gray-300 rounded-md p-3 resize-none"
                    />
                </div>

                <div>
                    <label className="block mb-2 font-medium">Business Impact</label>
                    <textarea
                        rows={4} value={formData.business_impact} onChange={handleChange} name="business_impact"
                        placeholder="Describe how this issue affects your work or business operations."
                        className="w-full border border-gray-300 rounded-md p-3 resize-none"
                    />
                </div>

                <button
                    type="submit"
                    className="mt-2 w-full bg-[#4C4CF9] text-white rounded-md py-3 font-semibold hover:bg-[#3d3de8] transition cursor-pointer"
                >
                    Submit Ticket
                </button>

            </div>

        </form>
    );
}