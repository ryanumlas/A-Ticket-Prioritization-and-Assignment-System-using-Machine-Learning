import { useEffect, useState } from "react";
import { toast } from "sonner";
import api from "../api";

const roles = [
    { label: "Employee", value: "Employee" },
    { label: "IT Support Specialist", value: "IT Support Specialist" },
    { label: "IT Service Desk", value: "IT Service Desk" },
    { label: "IT Supervisor", value: "Supervisor" },
    { label: "System Administrator", value: "System Administrator" },
];

export default function SystemAdUserCreateForm({ onSuccess, onCancel }) {
    const [loading, setLoading] = useState(false);
    const [optionsLoading, setOptionsLoading] = useState(true);

    const [employeeDepartments, setEmployeeDepartments] = useState([]);
    const [itDepartments, setItDepartments] = useState([]);
    const [officeLocations, setOfficeLocations] = useState([]);

    const [form, setForm] = useState({
        user_code: "",
        username: "",
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        role: "",
        employee_department: "",
        it_department: "",
        office_location: "",
        workload_limit: 5,
    });

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                setOptionsLoading(true);

                const [
                    employeeDepartmentsResponse,
                    itDepartmentsResponse,
                    officeLocationsResponse,
                ] = await Promise.all([
                    api.get(
                        "/users/admin/create-options/employee-departments/"
                    ),
                    api.get(
                        "/users/admin/create-options/it-departments/"
                    ),
                    api.get(
                        "/users/admin/create-options/office-locations/"
                    ),
                ]);

                setEmployeeDepartments(
                    employeeDepartmentsResponse.data || []
                );

                setItDepartments(
                    itDepartmentsResponse.data || []
                );

                setOfficeLocations(
                    officeLocationsResponse.data || []
                );
            } catch {
                setEmployeeDepartments([]);
                setItDepartments([]);
                setOfficeLocations([]);

                toast.error(
                    "Failed to load departments and office locations."
                );
            } finally {
                setOptionsLoading(false);
            }
        };

        fetchOptions();
    }, []);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleRoleChange = (event) => {
        const { value } = event.target;

        setForm((previous) => ({
            ...previous,
            role: value,
            employee_department: "",
            it_department: "",
            office_location: "",
            workload_limit:
                value === "IT Support Specialist"
                    ? previous.workload_limit || 5
                    : 5,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!form.user_code.trim()) {
            toast.error("User code is required.");
            return;
        }

        if (!form.username.trim()) {
            toast.error("Username is required.");
            return;
        }

        if (!form.first_name.trim()) {
            toast.error("First name is required.");
            return;
        }

        if (!form.last_name.trim()) {
            toast.error("Last name is required.");
            return;
        }

        if (!form.password) {
            toast.error("Password is required.");
            return;
        }

        if (!form.role) {
            toast.error("Please select a role.");
            return;
        }

        if (
            form.role === "Employee" &&
            !form.employee_department
        ) {
            toast.error("Employee department is required.");
            return;
        }

        if (!form.office_location) {
            toast.error("Office location is required.");
            return;
        }

        if (
            form.role !== "Employee" &&
            !form.it_department
        ) {
            toast.error("IT department is required.");
            return;
        }

        if (
            form.role === "IT Support Specialist" &&
            Number(form.workload_limit) < 1
        ) {
            toast.error("Workload limit must be at least 1.");
            return;
        }

        try {
            setLoading(true);

            const payload = {
                user_code: form.user_code.trim(),
                username: form.username.trim(),
                first_name: form.first_name.trim(),
                last_name: form.last_name.trim(),
                email: form.email.trim(),
                password: form.password,
                role: form.role,
                employee_department:
                    form.role === "Employee"
                        ? Number(form.employee_department)
                        : null,
                it_department:
                    form.role !== "Employee"
                        ? Number(form.it_department)
                        : null,
                office_location:
                    Number(form.office_location),
                workload_limit:
                    form.role === "IT Support Specialist"
                        ? Number(form.workload_limit)
                        : null,
            };

            await api.post(
                "/users/admin/create/",
                payload
            );

            toast.success("User created successfully.");

            onSuccess();
        } catch (error) {
            const errors = error?.response?.data;

            if (errors) {
                const firstError = Object.values(errors).flat()[0];

                toast.error(
                    firstError || "Failed to create user."
                );
            } else {
                toast.error("Failed to create user.");
            }
        } finally {
            setLoading(false);
        }
    };

    const isEmployee = form.role === "Employee";

    const isITRole =
        form.role === "IT Support Specialist" ||
        form.role === "IT Service Desk" ||
        form.role === "Supervisor" ||
        form.role === "System Administrator";

    const isITSupport =
        form.role === "IT Support Specialist";

    return (
        <form
            onSubmit={handleSubmit}
            className="overflow-hidden border border-gray-300 bg-white"
        >
            <div className="flex items-start justify-between border-b border-gray-300 px-6 py-5">
                <div>
                    <h2 className="text-base font-semibold text-black">
                        Basic Information
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Enter the user's account and personal information.
                    </p>
                </div>

                <p className="text-xs text-gray-500">
                    <span className="text-red-500">*</span> Required fields
                </p>
            </div>

            <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">
                <div>
                    <label className="mb-1.5 block text-sm font-medium text-black">
                        User Code{" "}
                        <span className="text-red-500">*</span>
                    </label>

                    <input
                        type="text"
                        name="user_code"
                        value={form.user_code}
                        onChange={handleChange}
                        placeholder="e.g. EMP-0001"
                        required
                        className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-[#4C4CF9]"
                    />
                </div>

                <div>
                    <label className="mb-1.5 block text-sm font-medium text-black">
                        Username{" "}
                        <span className="text-red-500">*</span>
                    </label>

                    <input
                        type="text"
                        name="username"
                        value={form.username}
                        onChange={handleChange}
                        placeholder="Enter username"
                        required
                        className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-[#4C4CF9]"
                    />
                </div>

                <div>
                    <label className="mb-1.5 block text-sm font-medium text-black">
                        First Name{" "}
                        <span className="text-red-500">*</span>
                    </label>

                    <input
                        type="text"
                        name="first_name"
                        value={form.first_name}
                        onChange={handleChange}
                        placeholder="Enter first name"
                        required
                        className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-[#4C4CF9]"
                    />
                </div>

                <div>
                    <label className="mb-1.5 block text-sm font-medium text-black">
                        Last Name{" "}
                        <span className="text-red-500">*</span>
                    </label>

                    <input
                        type="text"
                        name="last_name"
                        value={form.last_name}
                        onChange={handleChange}
                        placeholder="Enter last name"
                        required
                        className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-[#4C4CF9]"
                    />
                </div>

                <div>
                    <label className="mb-1.5 block text-sm font-medium text-black">
                        Email
                    </label>

                    <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="Enter email address"
                        className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-[#4C4CF9]"
                    />
                </div>

                <div>
                    <label className="mb-1.5 block text-sm font-medium text-black">
                        Password{" "}
                        <span className="text-red-500">*</span>
                    </label>

                    <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Enter password"
                        required
                        className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-[#4C4CF9]"
                    />
                </div>
            </div>

            <div className="flex items-start justify-between border-t border-b border-gray-300 px-6 py-5">
                <div>
                    <h2 className="text-base font-semibold text-black">
                        Role & Assignment
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Select the user's role and assignment details.
                    </p>
                </div>

                <p className="text-xs text-gray-500">
                    <span className="text-red-500">*</span> Required fields
                </p>
            </div>

            <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">
                <div>
                    <label className="mb-1.5 block text-sm font-medium text-black">
                        Role{" "}
                        <span className="text-red-500">*</span>
                    </label>

                    <select
                        name="role"
                        value={form.role}
                        onChange={handleRoleChange}
                        required
                        disabled={optionsLoading}
                        className="h-10 w-full cursor-pointer rounded-md border border-gray-300 bg-white px-3 text-sm outline-none focus:border-[#4C4CF9] disabled:cursor-not-allowed disabled:bg-gray-100"
                    >
                        <option value="">
                            Select role
                        </option>

                        {roles.map((role) => (
                            <option
                                key={role.value}
                                value={role.value}
                            >
                                {role.label}
                            </option>
                        ))}
                    </select>
                </div>

                {isEmployee && (
                    <>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-black">
                                Employee Department{" "}
                                <span className="text-red-500">*</span>
                            </label>

                            <select
                                name="employee_department"
                                value={form.employee_department}
                                onChange={handleChange}
                                required
                                disabled={optionsLoading}
                                className="h-10 w-full cursor-pointer rounded-md border border-gray-300 bg-white px-3 text-sm outline-none focus:border-[#4C4CF9] disabled:cursor-not-allowed disabled:bg-gray-100"
                            >
                                <option value="">
                                    {optionsLoading
                                        ? "Loading departments..."
                                        : "Select employee department"}
                                </option>

                                {employeeDepartments.map(
                                    (department) => (
                                        <option
                                            key={department.id}
                                            value={department.id}
                                        >
                                            {department.name}
                                        </option>
                                    )
                                )}
                            </select>
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-black">
                                Office Location{" "}
                                <span className="text-red-500">*</span>
                            </label>

                            <select
                                name="office_location"
                                value={form.office_location}
                                onChange={handleChange}
                                required
                                disabled={optionsLoading}
                                className="h-10 w-full cursor-pointer rounded-md border border-gray-300 bg-white px-3 text-sm outline-none focus:border-[#4C4CF9] disabled:cursor-not-allowed disabled:bg-gray-100"
                            >
                                <option value="">
                                    {optionsLoading
                                        ? "Loading locations..."
                                        : "Select office location"}
                                </option>

                                {officeLocations.map(
                                    (location) => (
                                        <option
                                            key={location.id}
                                            value={location.id}
                                        >
                                            {location.name}
                                        </option>
                                    )
                                )}
                            </select>
                        </div>
                    </>
                )}

                {isITRole && (
                    <>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-black">
                                IT Department{" "}
                                <span className="text-red-500">*</span>
                            </label>

                            <select
                                name="it_department"
                                value={form.it_department}
                                onChange={handleChange}
                                required
                                disabled={optionsLoading}
                                className="h-10 w-full cursor-pointer rounded-md border border-gray-300 bg-white px-3 text-sm outline-none focus:border-[#4C4CF9] disabled:cursor-not-allowed disabled:bg-gray-100"
                            >
                                <option value="">
                                    {optionsLoading
                                        ? "Loading departments..."
                                        : "Select IT department"}
                                </option>

                                {itDepartments.map(
                                    (department) => (
                                        <option
                                            key={department.id}
                                            value={department.id}
                                        >
                                            {department.name}
                                        </option>
                                    )
                                )}
                            </select>
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-black">
                                Office Location{" "}
                                <span className="text-red-500">*</span>
                            </label>

                            <select
                                name="office_location"
                                value={form.office_location}
                                onChange={handleChange}
                                required
                                disabled={optionsLoading}
                                className="h-10 w-full cursor-pointer rounded-md border border-gray-300 bg-white px-3 text-sm outline-none focus:border-[#4C4CF9] disabled:cursor-not-allowed disabled:bg-gray-100"
                            >
                                <option value="">
                                    {optionsLoading
                                        ? "Loading locations..."
                                        : "Select office location"}
                                </option>

                                {officeLocations.map(
                                    (location) => (
                                        <option
                                            key={location.id}
                                            value={location.id}
                                        >
                                            {location.name}
                                        </option>
                                    )
                                )}
                            </select>
                        </div>
                    </>
                )}

                {isITSupport && (
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-black">
                            Workload Limit{" "}
                            <span className="text-red-500">*</span>
                        </label>

                        <input
                            type="number"
                            name="workload_limit"
                            min="1"
                            value={form.workload_limit}
                            onChange={handleChange}
                            required
                            className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-[#4C4CF9]"
                        />
                    </div>
                )}
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-gray-300 bg-gray-50 px-6 py-4">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={loading}
                    className="h-10 cursor-pointer rounded-md border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Cancel
                </button>

                <button
                    type="submit"
                    disabled={loading || optionsLoading}
                    className="h-10 cursor-pointer rounded-md bg-[#4C4CF9] px-5 text-sm font-medium text-white transition-colors hover:bg-[#3f3fe8] disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {loading ? "Creating..." : "Create User"}
                </button>
            </div>
        </form>
    );
}