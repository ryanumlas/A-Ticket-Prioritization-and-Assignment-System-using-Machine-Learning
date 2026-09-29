import { useEffect, useMemo, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import api from "../api";
import SpecializationModal from "./SpecializationModal";

export default function SystemAdUserCreateForm({
    onSuccess,
    onCancel,
}) {
    const [roles, setRoles] = useState([]);
    const [employeeDepartments, setEmployeeDepartments] =
        useState([]);
    const [itDepartments, setItDepartments] = useState([]);
    const [officeLocations, setOfficeLocations] = useState([]);
    const [specializations, setSpecializations] = useState([]);

    const [loadingOptions, setLoadingOptions] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [showPassword, setShowPassword] = useState(false);
    const [specializationModalOpen, setSpecializationModalOpen] =
        useState(false);

    const [form, setForm] = useState({
        username: "",
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        role: "",
        employee_department: "",
        it_department: "",
        office_location: "",
        specializations: [],
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        const fetchOptions = async () => {
            setLoadingOptions(true);

            try {
                const [
                    rolesResponse,
                    employeeDepartmentsResponse,
                    itDepartmentsResponse,
                    officeLocationsResponse,
                    specializationsResponse,
                ] = await Promise.all([
                    api.get(
                        "/users/admin/create-options/roles/"
                    ),
                    api.get(
                        "/users/admin/create-options/employee-departments/"
                    ),
                    api.get(
                        "/users/admin/create-options/it-departments/"
                    ),
                    api.get(
                        "/users/admin/create-options/office-locations/"
                    ),
                    api.get(
                        "/users/admin/create-options/specializations/"
                    ),
                ]);

                setRoles(rolesResponse.data || []);
                setEmployeeDepartments(
                    employeeDepartmentsResponse.data || []
                );
                setItDepartments(
                    itDepartmentsResponse.data || []
                );
                setOfficeLocations(
                    officeLocationsResponse.data || []
                );
                setSpecializations(
                    specializationsResponse.data || []
                );
            } catch {
                toast.error(
                    "Failed to load user creation options."
                );
            } finally {
                setLoadingOptions(false);
            }
        };

        fetchOptions();
    }, []);

    const selectedRole = useMemo(() => {
        return roles.find(
            (role) => String(role.id) === String(form.role)
        );
    }, [roles, form.role]);

    const isEmployee = selectedRole?.name === "Employee";
    const isITSupport =
        selectedRole?.name === "IT Support Specialist";

    const selectedSpecializationNames =
        specializations.filter((specialization) =>
            form.specializations.includes(specialization.id)
        );

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));

        setErrors((previous) => ({
            ...previous,
            [name]: "",
        }));
    };

    const handleRoleChange = (event) => {
        const value = event.target.value;

        setForm((previous) => ({
            ...previous,
            role: value,
            employee_department: "",
            it_department: "",
            specializations: [],
        }));

        setErrors({});
    };

    const validate = () => {
        const newErrors = {};

        if (!form.username.trim()) {
            newErrors.username = "Username is required.";
        }

        if (!form.first_name.trim()) {
            newErrors.first_name = "First name is required.";
        }

        if (!form.last_name.trim()) {
            newErrors.last_name = "Last name is required.";
        }

        if (!form.password) {
            newErrors.password = "Password is required.";
        }

        if (!form.role) {
            newErrors.role = "Role is required.";
        }

        if (isEmployee) {
            if (!form.employee_department) {
                newErrors.employee_department =
                    "Employee department is required.";
            }
        } else if (form.role) {
            if (!form.it_department) {
                newErrors.it_department =
                    "IT department is required.";
            }
        }

        if (!form.office_location) {
            newErrors.office_location =
                "Office location is required.";
        }

        if (isITSupport) {
            if (form.specializations.length === 0) {
                newErrors.specializations =
                    "At least one specialization is required.";
            }
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!validate()) {
            toast.error(
                "Please complete the required fields."
            );

            return;
        }

        setSubmitting(true);

        try {
            const payload = {
                username: form.username.trim(),
                first_name: form.first_name.trim(),
                last_name: form.last_name.trim(),
                email: form.email.trim(),
                password: form.password,
                role: Number(form.role),
                employee_department: isEmployee
                    ? Number(form.employee_department)
                    : null,
                it_department: !isEmployee
                    ? Number(form.it_department)
                    : null,
                office_location: Number(
                    form.office_location
                ),
                specializations: isITSupport
                    ? form.specializations
                    : [],
            };

            await api.post(
                "/users/admin/create/",
                payload
            );

            toast.success(
                "User created successfully."
            );

            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            const responseData = error?.response?.data;

            if (
                responseData &&
                typeof responseData === "object"
            ) {
                const backendErrors = {};

                Object.entries(responseData).forEach(
                    ([field, message]) => {
                        if (Array.isArray(message)) {
                            backendErrors[field] =
                                message.join(" ");
                        } else if (
                            typeof message === "string"
                        ) {
                            backendErrors[field] = message;
                        }
                    }
                );

                if (
                    Object.keys(backendErrors).length > 0
                ) {
                    setErrors(backendErrors);

                    toast.error(
                        "Please check the highlighted fields."
                    );
                } else {
                    toast.error(
                        "Failed to create user."
                    );
                }
            } else {
                toast.error(
                    "Failed to create user."
                );
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loadingOptions) {
        return (
            <div
                className="
                    rounded-lg border border-gray-200 bg-white p-6
                    min-[1280px]:max-[1365px]:p-5
                    min-[1366px]:max-[1537px]:p-5
                "
            >
                <p
                    className="
                        text-sm text-gray-500
                        min-[1280px]:max-[1365px]:text-[11px]
                        min-[1366px]:max-[1537px]:text-xs
                    "
                >
                    Loading form options...
                </p>
            </div>
        );
    }

    return (
        <>
            <form
                onSubmit={handleSubmit}
                className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
            >
                <div
                    className="
                        border-b border-gray-200 px-5 py-5 sm:px-7
                        min-[1280px]:max-[1365px]:px-5
                        min-[1280px]:max-[1365px]:py-4
                        min-[1366px]:max-[1537px]:px-6
                        min-[1366px]:max-[1537px]:py-4
                    "
                >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <h2
                                className="
                                    text-lg font-semibold text-gray-900
                                    min-[1280px]:max-[1365px]:text-base
                                    min-[1366px]:max-[1537px]:text-base
                                "
                            >
                                Create User
                            </h2>

                            <p
                                className="
                                    mt-1 text-sm text-gray-500
                                    min-[1280px]:max-[1365px]:text-[11px]
                                    min-[1366px]:max-[1537px]:text-xs
                                "
                            >
                                Create and configure a new
                                system user account.
                            </p>
                        </div>

                        <p
                            className="
                                text-xs text-gray-500 sm:pt-1
                                min-[1280px]:max-[1365px]:text-[10px]
                                min-[1366px]:max-[1537px]:text-[11px]
                            "
                        >
                            Fields marked with{" "}
                            <span className="text-red-500">
                                *
                            </span>{" "}
                            are required.
                        </p>
                    </div>
                </div>

                <div
                    className="
                        px-5 py-6 sm:px-7 sm:py-7
                        min-[1280px]:max-[1365px]:px-5
                        min-[1280px]:max-[1365px]:py-5
                        min-[1366px]:max-[1537px]:px-6
                        min-[1366px]:max-[1537px]:py-6
                    "
                >
                    <section>
                        <div
                            className="
                                mb-5
                                min-[1280px]:max-[1365px]:mb-4
                                min-[1366px]:max-[1537px]:mb-4
                            "
                        >
                            <h3
                                className="
                                    text-lg font-semibold text-gray-900
                                    min-[1280px]:max-[1365px]:text-xs
                                    min-[1366px]:max-[1537px]:text-xs
                                "
                            >
                                Account Details
                            </h3>

                            <p
                                className="
                                    mt-1 text-xs text-gray-500
                                    min-[1280px]:max-[1365px]:text-[10px]
                                    min-[1366px]:max-[1537px]:text-[11px]
                                "
                            >
                                Enter the user's basic account
                                information.
                            </p>
                        </div>

                        <div
                            className="
                                grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2
                                min-[1280px]:max-[1365px]:gap-x-6
                                min-[1280px]:max-[1365px]:gap-y-4
                                min-[1366px]:max-[1537px]:gap-x-7
                                min-[1366px]:max-[1537px]:gap-y-4
                            "
                        >
                            <div>
                                <label
                                    className="
                                        mb-1.5 block text-sm font-medium text-gray-700
                                        min-[1280px]:max-[1365px]:mb-1
                                        min-[1280px]:max-[1365px]:text-[11px]
                                        min-[1366px]:max-[1537px]:mb-1
                                        min-[1366px]:max-[1537px]:text-xs
                                    "
                                >
                                    Username{" "}
                                    <span className="text-red-500">
                                        *
                                    </span>
                                </label>

                                <input
                                    type="text"
                                    name="username"
                                    value={form.username}
                                    onChange={handleChange}
                                    placeholder="e.g. juan.delacruz"
                                    className={`h-10 w-full rounded-md border bg-white px-3 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-[#4C4CF9] focus:ring-2 focus:ring-[#4C4CF9]/10 min-[1280px]:max-[1365px]:h-9 min-[1280px]:max-[1365px]:px-2.5 min-[1280px]:max-[1365px]:text-[11px] min-[1366px]:max-[1537px]:h-9 min-[1366px]:max-[1537px]:px-3 min-[1366px]:max-[1537px]:text-xs ${
                                        errors.username
                                            ? "border-red-400"
                                            : "border-gray-300"
                                    }`}
                                />

                                {errors.username && (
                                    <p
                                        className="
                                            mt-1.5 text-xs text-red-500
                                            min-[1280px]:max-[1365px]:mt-1
                                            min-[1280px]:max-[1365px]:text-[10px]
                                            min-[1366px]:max-[1537px]:mt-1
                                            min-[1366px]:max-[1537px]:text-[11px]
                                        "
                                    >
                                        {errors.username}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    className="
                                        mb-1.5 block text-sm font-medium text-gray-700
                                        min-[1280px]:max-[1365px]:mb-1
                                        min-[1280px]:max-[1365px]:text-[11px]
                                        min-[1366px]:max-[1537px]:mb-1
                                        min-[1366px]:max-[1537px]:text-xs
                                    "
                                >
                                    Email Address
                                </label>

                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="e.g. juan.delacruz@company.com"
                                    className="
                                        h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-[#4C4CF9] focus:ring-2 focus:ring-[#4C4CF9]/10
                                        min-[1280px]:max-[1365px]:h-9
                                        min-[1280px]:max-[1365px]:px-2.5
                                        min-[1280px]:max-[1365px]:text-[11px]
                                        min-[1366px]:max-[1537px]:h-9
                                        min-[1366px]:max-[1537px]:px-3
                                        min-[1366px]:max-[1537px]:text-xs
                                    "
                                />
                            </div>

                            <div>
                                <label
                                    className="
                                        mb-1.5 block text-sm font-medium text-gray-700
                                        min-[1280px]:max-[1365px]:mb-1
                                        min-[1280px]:max-[1365px]:text-[11px]
                                        min-[1366px]:max-[1537px]:mb-1
                                        min-[1366px]:max-[1537px]:text-xs
                                    "
                                >
                                    First Name{" "}
                                    <span className="text-red-500">
                                        *
                                    </span>
                                </label>

                                <input
                                    type="text"
                                    name="first_name"
                                    value={form.first_name}
                                    onChange={handleChange}
                                    placeholder="e.g. Juan"
                                    className={`h-10 w-full rounded-md border bg-white px-3 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-[#4C4CF9] focus:ring-2 focus:ring-[#4C4CF9]/10 min-[1280px]:max-[1365px]:h-9 min-[1280px]:max-[1365px]:px-2.5 min-[1280px]:max-[1365px]:text-[11px] min-[1366px]:max-[1537px]:h-9 min-[1366px]:max-[1537px]:px-3 min-[1366px]:max-[1537px]:text-xs ${
                                        errors.first_name
                                            ? "border-red-400"
                                            : "border-gray-300"
                                    }`}
                                />

                                {errors.first_name && (
                                    <p
                                        className="
                                            mt-1.5 text-xs text-red-500
                                            min-[1280px]:max-[1365px]:mt-1
                                            min-[1280px]:max-[1365px]:text-[10px]
                                            min-[1366px]:max-[1537px]:mt-1
                                            min-[1366px]:max-[1537px]:text-[11px]
                                        "
                                    >
                                        {errors.first_name}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    className="
                                        mb-1.5 block text-sm font-medium text-gray-700
                                        min-[1280px]:max-[1365px]:mb-1
                                        min-[1280px]:max-[1365px]:text-[11px]
                                        min-[1366px]:max-[1537px]:mb-1
                                        min-[1366px]:max-[1537px]:text-xs
                                    "
                                >
                                    Last Name{" "}
                                    <span className="text-red-500">
                                        *
                                    </span>
                                </label>

                                <input
                                    type="text"
                                    name="last_name"
                                    value={form.last_name}
                                    onChange={handleChange}
                                    placeholder="e.g. Dela Cruz"
                                    className={`h-10 w-full rounded-md border bg-white px-3 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-[#4C4CF9] focus:ring-2 focus:ring-[#4C4CF9]/10 min-[1280px]:max-[1365px]:h-9 min-[1280px]:max-[1365px]:px-2.5 min-[1280px]:max-[1365px]:text-[11px] min-[1366px]:max-[1537px]:h-9 min-[1366px]:max-[1537px]:px-3 min-[1366px]:max-[1537px]:text-xs ${
                                        errors.last_name
                                            ? "border-red-400"
                                            : "border-gray-300"
                                    }`}
                                />

                                {errors.last_name && (
                                    <p
                                        className="
                                            mt-1.5 text-xs text-red-500
                                            min-[1280px]:max-[1365px]:mt-1
                                            min-[1280px]:max-[1365px]:text-[10px]
                                            min-[1366px]:max-[1537px]:mt-1
                                            min-[1366px]:max-[1537px]:text-[11px]
                                        "
                                    >
                                        {errors.last_name}
                                    </p>
                                )}
                            </div>

                            <div className="md:col-span-2">
                                <label
                                    className="
                                        mb-1.5 block text-sm font-medium text-gray-700
                                        min-[1280px]:max-[1365px]:mb-1
                                        min-[1280px]:max-[1365px]:text-[11px]
                                        min-[1366px]:max-[1537px]:mb-1
                                        min-[1366px]:max-[1537px]:text-xs
                                    "
                                >
                                    Password{" "}
                                    <span className="text-red-500">
                                        *
                                    </span>
                                </label>

                                <div className="relative max-w-md">
                                    <input
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        name="password"
                                        value={form.password}
                                        onChange={handleChange}
                                        placeholder="e.g. *********"
                                        className={`h-10 w-full rounded-md border bg-white px-3 pr-10 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-[#4C4CF9] focus:ring-2 focus:ring-[#4C4CF9]/10 min-[1280px]:max-[1365px]:h-9 min-[1280px]:max-[1365px]:px-2.5 min-[1280px]:max-[1365px]:pr-9 min-[1280px]:max-[1365px]:text-[11px] min-[1366px]:max-[1537px]:h-9 min-[1366px]:max-[1537px]:px-3 min-[1366px]:max-[1537px]:pr-9 min-[1366px]:max-[1537px]:text-xs ${
                                            errors.password
                                                ? "border-red-400"
                                                : "border-gray-300"
                                        }`}
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(
                                                (previous) =>
                                                    !previous
                                            )
                                        }
                                        className="
                                            absolute right-0 top-0 flex h-10 w-10 cursor-pointer items-center justify-center text-gray-400 transition-colors hover:text-gray-700
                                            min-[1280px]:max-[1365px]:h-9
                                            min-[1280px]:max-[1365px]:w-9
                                            min-[1366px]:max-[1537px]:h-9
                                            min-[1366px]:max-[1537px]:w-9
                                        "
                                        aria-label={
                                            showPassword
                                                ? "Hide password"
                                                : "Show password"
                                        }
                                    >
                                        {showPassword ? (
                                            <EyeOff
                                                size={17}
                                                className="
                                                    min-[1280px]:max-[1365px]:size-3.5
                                                    min-[1366px]:max-[1537px]:size-3.5
                                                "
                                            />
                                        ) : (
                                            <Eye
                                                size={17}
                                                className="
                                                    min-[1280px]:max-[1365px]:size-3.5
                                                    min-[1366px]:max-[1537px]:size-3.5
                                                "
                                            />
                                        )}
                                    </button>
                                </div>

                                {errors.password && (
                                    <p
                                        className="
                                            mt-1.5 text-xs text-red-500
                                            min-[1280px]:max-[1365px]:mt-1
                                            min-[1280px]:max-[1365px]:text-[10px]
                                            min-[1366px]:max-[1537px]:mt-1
                                            min-[1366px]:max-[1537px]:text-[11px]
                                        "
                                    >
                                        {errors.password}
                                    </p>
                                )}
                            </div>
                        </div>
                    </section>

                    <div
                        className="
                            my-8 border-t border-gray-200
                            min-[1280px]:max-[1365px]:my-6
                            min-[1366px]:max-[1537px]:my-7
                        "
                    />

                    <section>
                        <div
                            className="
                                mb-5
                                min-[1280px]:max-[1365px]:mb-4
                                min-[1366px]:max-[1537px]:mb-4
                            "
                        >
                            <h3
                                className="
                                    text-lg font-semibold text-gray-900
                                    min-[1280px]:max-[1365px]:text-xs
                                    min-[1366px]:max-[1537px]:text-xs
                                "
                            >
                                Role & Organization
                            </h3>

                            <p
                                className="
                                    mt-1 text-xs text-gray-500
                                    min-[1280px]:max-[1365px]:text-[10px]
                                    min-[1366px]:max-[1537px]:text-[11px]
                                "
                            >
                                Assign the user's role,
                                department, and office location.
                            </p>
                        </div>

                        <div
                            className="
                                grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2
                                min-[1280px]:max-[1365px]:gap-x-6
                                min-[1280px]:max-[1365px]:gap-y-4
                                min-[1366px]:max-[1537px]:gap-x-7
                                min-[1366px]:max-[1537px]:gap-y-4
                            "
                        >
                            <div>
                                <label
                                    className="
                                        mb-1.5 block text-sm font-medium text-gray-700
                                        min-[1280px]:max-[1365px]:mb-1
                                        min-[1280px]:max-[1365px]:text-[11px]
                                        min-[1366px]:max-[1537px]:mb-1
                                        min-[1366px]:max-[1537px]:text-xs
                                    "
                                >
                                    Role{" "}
                                    <span className="text-red-500">
                                        *
                                    </span>
                                </label>

                                <select
                                    name="role"
                                    value={form.role}
                                    onChange={handleRoleChange}
                                    className={`h-10 w-full cursor-pointer rounded-md border bg-white px-3 text-sm text-gray-900 outline-none transition-all focus:border-[#4C4CF9] focus:ring-2 focus:ring-[#4C4CF9]/10 min-[1280px]:max-[1365px]:h-9 min-[1280px]:max-[1365px]:px-2.5 min-[1280px]:max-[1365px]:text-[11px] min-[1366px]:max-[1537px]:h-9 min-[1366px]:max-[1537px]:px-3 min-[1366px]:max-[1537px]:text-xs ${
                                        errors.role
                                            ? "border-red-400"
                                            : "border-gray-300"
                                    }`}
                                >
                                    <option value="">
                                        Select role
                                    </option>

                                    {roles.map((role) => (
                                        <option
                                            key={role.id}
                                            value={role.id}
                                        >
                                            {role.name}
                                        </option>
                                    ))}
                                </select>

                                {errors.role && (
                                    <p
                                        className="
                                            mt-1.5 text-xs text-red-500
                                            min-[1280px]:max-[1365px]:mt-1
                                            min-[1280px]:max-[1365px]:text-[10px]
                                            min-[1366px]:max-[1537px]:mt-1
                                            min-[1366px]:max-[1537px]:text-[11px]
                                        "
                                    >
                                        {errors.role}
                                    </p>
                                )}
                            </div>

                            {isEmployee ? (
                                <div>
                                    <label
                                        className="
                                            mb-1.5 block text-sm font-medium text-gray-700
                                            min-[1280px]:max-[1365px]:mb-1
                                            min-[1280px]:max-[1365px]:text-[11px]
                                            min-[1366px]:max-[1537px]:mb-1
                                            min-[1366px]:max-[1537px]:text-xs
                                        "
                                    >
                                        Employee Department{" "}
                                        <span className="text-red-500">
                                            *
                                        </span>
                                    </label>

                                    <select
                                        name="employee_department"
                                        value={
                                            form.employee_department
                                        }
                                        onChange={handleChange}
                                        className={`h-10 w-full cursor-pointer rounded-md border bg-white px-3 text-sm text-gray-900 outline-none transition-all focus:border-[#4C4CF9] focus:ring-2 focus:ring-[#4C4CF9]/10 min-[1280px]:max-[1365px]:h-9 min-[1280px]:max-[1365px]:px-2.5 min-[1280px]:max-[1365px]:text-[11px] min-[1366px]:max-[1537px]:h-9 min-[1366px]:max-[1537px]:px-3 min-[1366px]:max-[1537px]:text-xs ${
                                            errors.employee_department
                                                ? "border-red-400"
                                                : "border-gray-300"
                                        }`}
                                    >
                                        <option value="">
                                            Select employee department
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

                                    {errors.employee_department && (
                                        <p
                                            className="
                                                mt-1.5 text-xs text-red-500
                                                min-[1280px]:max-[1365px]:mt-1
                                                min-[1280px]:max-[1365px]:text-[10px]
                                                min-[1366px]:max-[1537px]:mt-1
                                                min-[1366px]:max-[1537px]:text-[11px]
                                            "
                                        >
                                            {
                                                errors.employee_department
                                            }
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <div>
                                    <label
                                        className="
                                            mb-1.5 block text-sm font-medium text-gray-700
                                            min-[1280px]:max-[1365px]:mb-1
                                            min-[1280px]:max-[1365px]:text-[11px]
                                            min-[1366px]:max-[1537px]:mb-1
                                            min-[1366px]:max-[1537px]:text-xs
                                        "
                                    >
                                        IT Department{" "}
                                        <span className="text-red-500">
                                            *
                                        </span>
                                    </label>

                                    <select
                                        name="it_department"
                                        value={form.it_department}
                                        onChange={handleChange}
                                        className={`h-10 w-full cursor-pointer rounded-md border bg-white px-3 text-sm text-gray-900 outline-none transition-all focus:border-[#4C4CF9] focus:ring-2 focus:ring-[#4C4CF9]/10 min-[1280px]:max-[1365px]:h-9 min-[1280px]:max-[1365px]:px-2.5 min-[1280px]:max-[1365px]:text-[11px] min-[1366px]:max-[1537px]:h-9 min-[1366px]:max-[1537px]:px-3 min-[1366px]:max-[1537px]:text-xs ${
                                            errors.it_department
                                                ? "border-red-400"
                                                : "border-gray-300"
                                        }`}
                                    >
                                        <option value="">
                                            Select IT department
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

                                    {errors.it_department && (
                                        <p
                                            className="
                                                mt-1.5 text-xs text-red-500
                                                min-[1280px]:max-[1365px]:mt-1
                                                min-[1280px]:max-[1365px]:text-[10px]
                                                min-[1366px]:max-[1537px]:mt-1
                                                min-[1366px]:max-[1537px]:text-[11px]
                                            "
                                        >
                                            {errors.it_department}
                                        </p>
                                    )}
                                </div>
                            )}

                            <div>
                                <label
                                    className="
                                        mb-1.5 block text-sm font-medium text-gray-700
                                        min-[1280px]:max-[1365px]:mb-1
                                        min-[1280px]:max-[1365px]:text-[11px]
                                        min-[1366px]:max-[1537px]:mb-1
                                        min-[1366px]:max-[1537px]:text-xs
                                    "
                                >
                                    Office Location{" "}
                                    <span className="text-red-500">
                                        *
                                    </span>
                                </label>

                                <select
                                    name="office_location"
                                    value={form.office_location}
                                    onChange={handleChange}
                                    className={`h-10 w-full cursor-pointer rounded-md border bg-white px-3 text-sm text-gray-900 outline-none transition-all focus:border-[#4C4CF9] focus:ring-2 focus:ring-[#4C4CF9]/10 min-[1280px]:max-[1365px]:h-9 min-[1280px]:max-[1365px]:px-2.5 min-[1280px]:max-[1365px]:text-[11px] min-[1366px]:max-[1537px]:h-9 min-[1366px]:max-[1537px]:px-3 min-[1366px]:max-[1537px]:text-xs ${
                                        errors.office_location
                                            ? "border-red-400"
                                            : "border-gray-300"
                                    }`}
                                >
                                    <option value="">
                                        Select office location
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

                                {errors.office_location && (
                                    <p
                                        className="
                                            mt-1.5 text-xs text-red-500
                                            min-[1280px]:max-[1365px]:mt-1
                                            min-[1280px]:max-[1365px]:text-[10px]
                                            min-[1366px]:max-[1537px]:mt-1
                                            min-[1366px]:max-[1537px]:text-[11px]
                                        "
                                    >
                                        {errors.office_location}
                                    </p>
                                )}
                            </div>
                        </div>
                    </section>

                    {isITSupport && (
                        <>
                            <div
                                className="
                                    my-8 border-t border-gray-200
                                    min-[1280px]:max-[1365px]:my-6
                                    min-[1366px]:max-[1537px]:my-7
                                "
                            />

                            <section>
                                <div
                                    className="
                                        mb-5
                                        min-[1280px]:max-[1365px]:mb-4
                                        min-[1366px]:max-[1537px]:mb-4
                                    "
                                >
                                    <h3
                                        className="
                                            text-sm font-semibold text-gray-900
                                            min-[1280px]:max-[1365px]:text-xs
                                            min-[1366px]:max-[1537px]:text-xs
                                        "
                                    >
                                        IT Support Details
                                    </h3>

                                    <p
                                        className="
                                            mt-1 text-xs text-gray-500
                                            min-[1280px]:max-[1365px]:text-[10px]
                                            min-[1366px]:max-[1537px]:text-[11px]
                                        "
                                    >
                                        Configure technical
                                        specializations for this
                                        support specialist.
                                    </p>
                                </div>

                                <div>
                                    <label
                                        className="
                                            mb-1.5 block text-sm font-medium text-gray-700
                                            min-[1280px]:max-[1365px]:mb-1
                                            min-[1280px]:max-[1365px]:text-[11px]
                                            min-[1366px]:max-[1537px]:mb-1
                                            min-[1366px]:max-[1537px]:text-xs
                                        "
                                    >
                                        Specializations{" "}
                                        <span className="text-red-500">
                                            *
                                        </span>
                                    </label>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setSpecializationModalOpen(
                                                true
                                            )
                                        }
                                        className={`flex min-h-10 w-full cursor-pointer items-center justify-between rounded-md border bg-white px-3 py-2 text-left text-sm outline-none transition-all hover:bg-gray-50 focus:border-[#4C4CF9] focus:ring-2 focus:ring-[#4C4CF9]/10 min-[1280px]:max-[1365px]:min-h-9 min-[1280px]:max-[1365px]:px-2.5 min-[1280px]:max-[1365px]:py-1.5 min-[1280px]:max-[1365px]:text-[11px] min-[1366px]:max-[1537px]:min-h-9 min-[1366px]:max-[1537px]:px-3 min-[1366px]:max-[1537px]:py-1.5 min-[1366px]:max-[1537px]:text-xs ${
                                            errors.specializations
                                                ? "border-red-400"
                                                : "border-gray-300"
                                        }`}
                                    >
                                        <span
                                            className={
                                                selectedSpecializationNames.length >
                                                0
                                                    ? "text-gray-900"
                                                    : "text-gray-400"
                                            }
                                        >
                                            {selectedSpecializationNames.length >
                                            0
                                                ? `${selectedSpecializationNames.length} selected`
                                                : "Select specializations"}
                                        </span>

                                        <span
                                            className="
                                                text-xs font-medium text-gray-500
                                                min-[1280px]:max-[1365px]:text-[10px]
                                                min-[1366px]:max-[1537px]:text-[11px]
                                            "
                                        >
                                            Choose
                                        </span>
                                    </button>

                                    {selectedSpecializationNames.length >
                                        0 && (
                                        <div
                                            className="
                                                mt-2 flex flex-wrap gap-2
                                                min-[1280px]:max-[1365px]:mt-1.5
                                                min-[1280px]:max-[1365px]:gap-1.5
                                                min-[1366px]:max-[1537px]:mt-1.5
                                                min-[1366px]:max-[1537px]:gap-1.5
                                            "
                                        >
                                            {selectedSpecializationNames.map(
                                                (specialization) => (
                                                    <span
                                                        key={
                                                            specialization.id
                                                        }
                                                        className="
                                                            rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs text-gray-700
                                                            min-[1280px]:max-[1365px]:px-2
                                                            min-[1280px]:max-[1365px]:py-0.5
                                                            min-[1280px]:max-[1365px]:text-[10px]
                                                            min-[1366px]:max-[1537px]:px-2
                                                            min-[1366px]:max-[1537px]:py-0.5
                                                            min-[1366px]:max-[1537px]:text-[11px]
                                                        "
                                                    >
                                                        {
                                                            specialization.name
                                                        }
                                                    </span>
                                                )
                                            )}
                                        </div>
                                    )}

                                    {errors.specializations && (
                                        <p
                                            className="
                                                mt-1.5 text-xs text-red-500
                                                min-[1280px]:max-[1365px]:mt-1
                                                min-[1280px]:max-[1365px]:text-[10px]
                                                min-[1366px]:max-[1537px]:mt-1
                                                min-[1366px]:max-[1537px]:text-[11px]
                                            "
                                        >
                                            {errors.specializations}
                                        </p>
                                    )}
                                </div>
                            </section>
                        </>
                    )}
                </div>

                <div
                    className="
                        flex flex-col-reverse gap-2 border-t border-gray-200 bg-gray-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-7
                        min-[1280px]:max-[1365px]:gap-1.5
                        min-[1280px]:max-[1365px]:px-5
                        min-[1280px]:max-[1365px]:py-3
                        min-[1366px]:max-[1537px]:gap-1.5
                        min-[1366px]:max-[1537px]:px-6
                        min-[1366px]:max-[1537px]:py-3.5
                    "
                >
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={submitting}
                        className="
                            h-10 w-full cursor-pointer rounded-md border border-gray-300 bg-white px-5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto
                            min-[1280px]:max-[1365px]:h-9
                            min-[1280px]:max-[1365px]:px-4
                            min-[1280px]:max-[1365px]:text-[11px]
                            min-[1366px]:max-[1537px]:h-9
                            min-[1366px]:max-[1537px]:px-4
                            min-[1366px]:max-[1537px]:text-xs
                        "
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="
                            h-10 w-full cursor-pointer rounded-md bg-[#4C4CF9] px-5 text-sm font-medium text-white transition-colors hover:bg-[#3f3fe8] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto
                            min-[1280px]:max-[1365px]:h-9
                            min-[1280px]:max-[1365px]:px-4
                            min-[1280px]:max-[1365px]:text-[11px]
                            min-[1366px]:max-[1537px]:h-9
                            min-[1366px]:max-[1537px]:px-4
                            min-[1366px]:max-[1537px]:text-xs
                        "
                    >
                        {submitting
                            ? "Creating..."
                            : "Create User"}
                    </button>
                </div>
            </form>

            <SpecializationModal
                open={specializationModalOpen}
                specializations={specializations}
                selectedSpecializations={
                    form.specializations
                }
                onClose={() =>
                    setSpecializationModalOpen(false)
                }
                onDone={(selected) => {
                    setForm((previous) => ({
                        ...previous,
                        specializations: selected,
                    }));

                    setErrors((previous) => ({
                        ...previous,
                        specializations: "",
                    }));

                    setSpecializationModalOpen(false);
                }}
            />
        </>
    );
}