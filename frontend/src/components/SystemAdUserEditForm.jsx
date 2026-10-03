import { useEffect, useState } from "react";
import { toast } from "sonner";
import api from "../api";

const emptyOptions = {
    roles: [],
    employeeDepartments: [],
    itDepartments: [],
    officeLocations: [],
    specializations: [],
};

const emptyForm = {
    username: "",
    user_code: "",
    first_name: "",
    last_name: "",
    email: "",
    role: "",
    employee_department: "",
    it_department: "",
    office_location: "",
    specializations: [],
};

function getErrorMessage(error) {
    const data = error.response?.data;
    if (typeof data?.detail === "string") {
        return data.detail;
    }
    if (data && typeof data === "object") {
        const messages = Object.values(data).flatMap((value) =>
            Array.isArray(value) ? value : [value]
        );
        const firstMessage = messages.find(
            (message) => typeof message === "string"
        );
        if (firstMessage) {
            return firstMessage;
        }
    }
    return "Unable to save user changes.";
}

export default function SystemAdUserEditForm({
    userId,
    onSuccess,
    onCancel,
}) {
    const [options, setOptions] = useState(emptyOptions);
    const [form, setForm] = useState(emptyForm);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        let active = true;

        const loadFormData = async () => {
            setLoading(true);

            try {
                const [
                    userResponse,
                    rolesResponse,
                    employeeDepartmentsResponse,
                    itDepartmentsResponse,
                    officeLocationsResponse,
                    specializationsResponse,
                ] = await Promise.all([
                    api.get(`/users/admin/${userId}/`),
                    api.get("/users/admin/create-options/roles/"),
                    api.get("/users/admin/create-options/employee-departments/"),
                    api.get("/users/admin/create-options/it-departments/"),
                    api.get("/users/admin/create-options/office-locations/"),
                    api.get("/users/admin/create-options/specializations/"),
                ]);

                if (!active) {
                    return;
                }

                const user = userResponse.data;
                const loadedOptions = {
                    roles: rolesResponse.data || [],
                    employeeDepartments: employeeDepartmentsResponse.data || [],
                    itDepartments: itDepartmentsResponse.data || [],
                    officeLocations: officeLocationsResponse.data || [],
                    specializations: specializationsResponse.data || [],
                };

                setOptions(loadedOptions);
                setForm({
                    username: user.username || "",
                    user_code: user.user_code || "",
                    first_name: user.first_name || "",
                    last_name: user.last_name || "",
                    email: user.email || "",
                    role: String(user.role_id || ""),
                    employee_department: String(
                        user.employee_department?.id || ""
                    ),
                    it_department: String(user.it_department_id || ""),
                    office_location: String(user.office_location_id || ""),
                    specializations: (user.specializations || []).map(
                        (item) => item.id
                    ),
                });
            } catch {
                if (active) {
                    toast.error("Failed to load user details and edit options.");
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        loadFormData();

        return () => {
            active = false;
        };
    }, [userId]);

    const selectedRole = options.roles.find(
        (role) => String(role.id) === form.role
    );
    const isEmployee = selectedRole?.name === "Employee";
    const isSupport = selectedRole?.name === "IT Support Specialist";

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const handleRoleChange = (event) => {
        setForm((current) => ({
            ...current,
            role: event.target.value,
            employee_department: "",
            it_department: "",
            specializations: [],
        }));
    };

    const handleSpecializationToggle = (specializationId) => {
        setForm((current) => ({
            ...current,
            specializations: current.specializations.includes(specializationId)
                ? current.specializations.filter(
                      (id) => id !== specializationId
                  )
                : [...current.specializations, specializationId],
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!form.username.trim() || !form.first_name.trim() || !form.last_name.trim() || !form.role) {
            toast.error("Complete the required user fields.");
            return;
        }
        if (isEmployee && !form.employee_department) {
            toast.error("Select an employee department.");
            return;
        }
        if (!isEmployee && !form.it_department) {
            toast.error("Select an IT department.");
            return;
        }
        if (!form.office_location) {
            toast.error("Select an office location.");
            return;
        }

        setSaving(true);
        try {
            await api.patch(`/users/admin/${userId}/update/`, {
                username: form.username.trim(),
                first_name: form.first_name.trim(),
                last_name: form.last_name.trim(),
                email: form.email.trim(),
                role: Number(form.role),
                employee_department: isEmployee
                    ? Number(form.employee_department)
                    : null,
                it_department: isEmployee
                    ? null
                    : Number(form.it_department),
                office_location: Number(form.office_location),
                specializations: isSupport
                    ? form.specializations
                    : [],
            });

            toast.success("User updated successfully.");
            onSuccess();
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setSaving(false);
        }
    };

    const inputClassName = "mt-1 h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100";
    const labelClassName = "block text-sm font-medium text-gray-700";

    if (loading) {
        return (
            <div className="flex min-h-[360px] items-center justify-center text-sm text-gray-500">
                Loading user details...
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <section className="border-b border-gray-200 pb-6">
                <h2 className="text-base font-semibold text-gray-900">
                    Account
                </h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <label className={labelClassName}>
                        User Code
                        <input
                            value={form.user_code}
                            readOnly
                            className={`${inputClassName} bg-gray-50 text-gray-500`}
                        />
                    </label>
                    <label className={labelClassName}>
                        Username
                        <input
                            name="username"
                            value={form.username}
                            onChange={handleChange}
                            required
                            autoComplete="username"
                            className={inputClassName}
                        />
                    </label>
                    <label className={labelClassName}>
                        First Name
                        <input
                            name="first_name"
                            value={form.first_name}
                            onChange={handleChange}
                            required
                            autoComplete="given-name"
                            className={inputClassName}
                        />
                    </label>
                    <label className={labelClassName}>
                        Last Name
                        <input
                            name="last_name"
                            value={form.last_name}
                            onChange={handleChange}
                            required
                            autoComplete="family-name"
                            className={inputClassName}
                        />
                    </label>
                    <label className={labelClassName}>
                        Email
                        <input
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            autoComplete="email"
                            className={inputClassName}
                        />
                    </label>
                    <label className={labelClassName}>
                        Role
                        <select
                            name="role"
                            value={form.role}
                            onChange={handleRoleChange}
                            required
                            className={inputClassName}
                        >
                            <option value="">Select a role</option>
                            {options.roles.map((role) => (
                                <option key={role.id} value={role.id}>
                                    {role.name}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>
            </section>

            <section className="border-b border-gray-200 pb-6">
                <h2 className="text-base font-semibold text-gray-900">
                    Assignment
                </h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    {isEmployee ? (
                        <label className={labelClassName}>
                            Employee Department
                            <select
                                name="employee_department"
                                value={form.employee_department}
                                onChange={handleChange}
                                required
                                className={inputClassName}
                            >
                                <option value="">Select department</option>
                                {options.employeeDepartments.map((department) => (
                                    <option key={department.id} value={department.id}>
                                        {department.name}
                                    </option>
                                ))}
                            </select>
                        </label>
                    ) : form.role ? (
                        <label className={labelClassName}>
                            IT Department
                            <select
                                name="it_department"
                                value={form.it_department}
                                onChange={handleChange}
                                required
                                className={inputClassName}
                            >
                                <option value="">Select IT department</option>
                                {options.itDepartments.map((department) => (
                                    <option key={department.id} value={department.id}>
                                        {department.name}
                                    </option>
                                ))}
                            </select>
                        </label>
                    ) : null}
                    <label className={labelClassName}>
                        Office Location
                        <select
                            name="office_location"
                            value={form.office_location}
                            onChange={handleChange}
                            required
                            className={inputClassName}
                        >
                            <option value="">Select office location</option>
                            {options.officeLocations.map((location) => (
                                <option key={location.id} value={location.id}>
                                    {location.name}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>

                {isSupport && (
                    <fieldset className="mt-5">
                        <legend className={labelClassName}>
                            Specializations
                        </legend>
                        <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                            {options.specializations.map((specialization) => (
                                <label
                                    key={specialization.id}
                                    className="flex min-h-10 cursor-pointer items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                    <input
                                        type="checkbox"
                                        checked={form.specializations.includes(
                                            specialization.id
                                        )}
                                        onChange={() =>
                                            handleSpecializationToggle(
                                                specialization.id
                                            )
                                        }
                                        className="h-4 w-4 accent-[#4C4CF9]"
                                    />
                                    <span>{specialization.name}</span>
                                </label>
                            ))}
                        </div>
                    </fieldset>
                )}
            </section>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={saving}
                    className="min-h-10 cursor-pointer rounded-md border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={saving}
                    className="min-h-10 cursor-pointer rounded-md bg-[#2563EB] px-4 text-sm font-medium text-white transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {saving ? "Saving..." : "Save Changes"}
                </button>
            </div>
        </form>
    );
}