import { useEffect, useState } from "react";
import {
    Users,
    X,
    Info,
    Check,
    ChevronDown,
    Search,
} from "lucide-react";
import { toast } from "sonner";
import api from "/src/api";

const MIN_DETAILS_LENGTH = 30;
const MAX_DETAILS_LENGTH = 500;

export default function RequestAssistanceModal({
    open,
    onClose,
    ticketDetails,
    ticketId,
    onSuccess,
}) {
    const [departments, setDepartments] = useState([]);
    const [selectedDepartmentIds, setSelectedDepartmentIds] =
        useState([]);

    const [departmentSearch, setDepartmentSearch] =
        useState("");

    const [departmentDropdownOpen, setDepartmentDropdownOpen] =
        useState(false);

    const [details, setDetails] = useState("");

    const [loadingDepartments, setLoadingDepartments] =
        useState(false);

    const [submitting, setSubmitting] =
        useState(false);

    const [errors, setErrors] = useState({
        department: "",
        details: "",
    });

    useEffect(() => {
        if (!open) {
            setSelectedDepartmentIds([]);
            setDepartmentSearch("");
            setDepartmentDropdownOpen(false);
            setDetails("");

            setErrors({
                department: "",
                details: "",
            });

            return;
        }

        setSelectedDepartmentIds([]);
        setDepartmentSearch("");
        setDepartmentDropdownOpen(false);
        setDetails("");

        setErrors({
            department: "",
            details: "",
        });

        const fetchDepartments = async () => {
            try {
                setLoadingDepartments(true);

                const response = await api.get(
                    "/departments/list/"
                );

                const departmentData =
                    Array.isArray(response.data)
                        ? response.data
                        : response.data?.results ||
                          response.data?.departments ||
                          [];

                const filteredDepartments = departmentData.filter(
                    (department) => {
                        const departmentName = String(
                            department?.name || ""
                        )
                            .trim()
                            .toLowerCase();

                        return departmentName !== "service desk";
                    }
                );
                setDepartments(
                    filteredDepartments
                );
            } catch (error) {
                setDepartments([]);

                toast.error("Unable to load departments", {
                    description:
                        error.response?.data?.message ||
                        "The assistance departments could not be loaded.",
                    duration: 5000,
                    style: {
                        background: "#ffffff",
                        color: "#000000",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        padding: "16px 18px",
                        boxShadow:
                            "0 10px 30px rgba(0, 0, 0, 0.08)",
                    },
                });
            } finally {
                setLoadingDepartments(false);
            }
        };

        fetchDepartments();
    }, [open]);

    const handleDepartmentToggle = (departmentId) => {
        const numericId = Number(
            departmentId
        );

        setSelectedDepartmentIds((current) => {
            if (current.includes(numericId)) {
                return current.filter(
                    (id) => id !== numericId
                );
            }

            return [
                ...current,
                numericId,
            ];
        });

        setErrors((prev) => ({
            ...prev,
            department: "",
        }));
    };

    const handleSubmit = async () => {
        const trimmedDetails = details.trim();

        const newErrors = {
            department: "",
            details: "",
        };

        if (
            selectedDepartmentIds.length === 0
        ) {
            newErrors.department =
                "Please select at least one assistance department.";
        }

        if (!trimmedDetails) {
            newErrors.details =
                "Assistance details are required.";
        } else if (
            trimmedDetails.length <
            MIN_DETAILS_LENGTH
        ) {
            newErrors.details =
                `Assistance details must be at least ${MIN_DETAILS_LENGTH} characters.`;
        }

        setErrors(newErrors);

        if (
            newErrors.department ||
            newErrors.details
        ) {
            return;
        }

        if (!ticketDetails?.id) {
            toast.error(
                "Unable to request assistance",
                {
                    description:
                        "Ticket information is unavailable.",
                    duration: 5000,
                    style: {
                        background: "#ffffff",
                        color: "#000000",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        padding: "16px 18px",
                        boxShadow:
                            "0 10px 30px rgba(0, 0, 0, 0.08)",
                    },
                }
            );

            return;
        }

        try {
            setSubmitting(true);

            const response = await api.post(
                `/tickets/assistance/${ticketDetails.id}/request/`,
                {
                    requested_departments:
                        selectedDepartmentIds,
                    reason: trimmedDetails,
                }
            );

            toast.success(
                "Assistance requested",
                {
                    description:
                        response.data?.message ||
                        "Your assistance request has been sent to the selected departments.",
                    duration: 5000,
                    style: {
                        background: "#ffffff",
                        color: "#000000",
                        border: "1px solid #e5e7eb",
                        borderRadius: "10px",
                        padding: "16px",
                        boxShadow:
                            "0 8px 24px rgba(0, 0, 0, 0.08)",
                    },
                }
            );

            if (onSuccess) {
                onSuccess(
                    response.data?.assistance_requests ||
                        response.data?.assistance_request ||
                        []
                );
            }

            onClose();
        } catch (error) {
            const responseData =
                error.response?.data;

            let errorMessage =
                responseData?.message ||
                responseData?.detail ||
                "Something went wrong while submitting the assistance request.";

            if (
                responseData?.reason &&
                Array.isArray(
                    responseData.reason
                )
            ) {
                errorMessage =
                    responseData.reason[0];
            }

            if (
                responseData?.requested_departments &&
                Array.isArray(
                    responseData.requested_departments
                )
            ) {
                errorMessage =
                    responseData
                        .requested_departments[0];
            }

            if (
                responseData?.departments &&
                Array.isArray(
                    responseData.departments
                )
            ) {
                errorMessage =
                    responseData.departments[0];
            }

            toast.error(
                "Unable to request assistance",
                {
                    description:
                        errorMessage,
                    duration: 5000,
                    style: {
                        background: "#ffffff",
                        color: "#000000",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        padding: "16px 18px",
                        boxShadow:
                            "0 10px 30px rgba(0, 0, 0, 0.08)",
                    },
                }
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (!open) {
        return null;
    }

    const filteredDepartments =
        departments.filter(
            (department) =>
                String(
                    department?.name || ""
                )
                    .toLowerCase()
                    .includes(
                        departmentSearch
                            .trim()
                            .toLowerCase()
                    )
        );

    const selectedDepartments =
        departments.filter(
            (department) =>
                selectedDepartmentIds.includes(
                    Number(department.id)
                )
        );

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 px-4 py-6">
            <div className="w-full max-w-[600px] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">

                <div className="flex items-start justify-between border-b border-gray-200 px-5 py-4">
                    <div className="flex min-w-0 items-start gap-3">

                        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                            <Users
                                size={18}
                                className="text-blue-500"
                            />
                        </div>

                        <div className="min-w-0">
                            <h2 className="text-base font-semibold text-black">
                                Request Assistance
                            </h2>

                            <p className="mt-0.5 text-sm text-gray-500">
                                Request help from one or more IT Support departments.
                            </p>
                        </div>

                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={submitting}
                        className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <X size={18} />
                    </button>

                </div>

                <div className="space-y-5 px-5 py-5">

                    <div>
                        <label className="mb-2 block text-sm font-medium text-black">
                            Assistance Departments
                            <span className="ml-1 text-red-500">
                                *
                            </span>
                        </label>

                        <div className="relative">
                            <button
                                type="button"
                                onClick={() =>
                                    setDepartmentDropdownOpen(
                                        (current) =>
                                            !current
                                    )
                                }
                                disabled={
                                    loadingDepartments ||
                                    submitting
                                }
                                className={`
                                    flex
                                    min-h-11
                                    w-full
                                    cursor-pointer
                                    items-center
                                    justify-between
                                    gap-3
                                    rounded-lg
                                    border
                                    bg-white
                                    px-3
                                    py-2
                                    text-left
                                    text-sm
                                    outline-none
                                    transition
                                    disabled:cursor-not-allowed
                                    disabled:bg-gray-100
                                    ${
                                        errors.department
                                            ? "border-red-300"
                                            : "border-gray-300"
                                    }
                                `}
                            >
                                <div className="min-w-0 flex-1">
                                    {loadingDepartments ? (
                                        <span className="text-gray-400">
                                            Loading departments...
                                        </span>
                                    ) : selectedDepartments.length ===
                                      0 ? (
                                        <span className="text-gray-400">
                                            Select assistance departments
                                        </span>
                                    ) : (
                                        <div className="flex flex-wrap gap-1.5">
                                            {selectedDepartments
                                                .slice(0, 2)
                                                .map(
                                                    (
                                                        department
                                                    ) => (
                                                        <span
                                                            key={
                                                                department.id
                                                            }
                                                            className="inline-flex max-w-full items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700"
                                                        >
                                                            <span className="truncate">
                                                                {
                                                                    department.name
                                                                }
                                                            </span>
                                                        </span>
                                                    )
                                                )}

                                            {selectedDepartments.length >
                                                2 && (
                                                <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                                                    +
                                                    {selectedDepartments.length -
                                                        2}{" "}
                                                    more
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <ChevronDown
                                    size={17}
                                    className={`
                                        shrink-0
                                        text-gray-400
                                        transition-transform
                                        ${
                                            departmentDropdownOpen
                                                ? "rotate-180"
                                                : ""
                                        }
                                    `}
                                />
                            </button>

                            {departmentDropdownOpen &&
                                !loadingDepartments && (
                                    <div
                                        className="
                                            absolute
                                            left-0
                                            right-0
                                            top-full
                                            z-20
                                            mt-2
                                            overflow-hidden
                                            rounded-lg
                                            border
                                            border-gray-200
                                            bg-white
                                            shadow-lg
                                        "
                                    >
                                        <div className="border-b border-gray-200 p-3">
                                            <div className="relative">
                                                <Search
                                                    size={16}
                                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                                />

                                                <input
                                                    type="text"
                                                    value={
                                                        departmentSearch
                                                    }
                                                    onChange={(
                                                        event
                                                    ) =>
                                                        setDepartmentSearch(
                                                            event
                                                                .target
                                                                .value
                                                        )
                                                    }
                                                    placeholder="Search departments..."
                                                    className="
                                                        h-10
                                                        w-full
                                                        rounded-lg
                                                        border
                                                        border-gray-300
                                                        bg-white
                                                        pl-9
                                                        pr-3
                                                        text-sm
                                                        text-gray-900
                                                        outline-none
                                                        placeholder:text-gray-400
                                                        focus:border-[#4C4CF9]
                                                        focus:ring-2
                                                        focus:ring-[#4C4CF9]/10
                                                    "
                                                />
                                            </div>
                                        </div>

                                        <div className="max-h-[240px] overflow-y-auto [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300">
                                            {filteredDepartments.length >
                                            0 ? (
                                                <div className="divide-y divide-gray-100">
                                                    {filteredDepartments.map(
                                                        (
                                                            department
                                                        ) => {
                                                            const departmentId =
                                                                Number(
                                                                    department.id
                                                                );

                                                            const isSelected =
                                                                selectedDepartmentIds.includes(
                                                                    departmentId
                                                                );

                                                            return (
                                                                <button
                                                                    key={
                                                                        department.id
                                                                    }
                                                                    type="button"
                                                                    disabled={
                                                                        submitting
                                                                    }
                                                                    onClick={() =>
                                                                        handleDepartmentToggle(
                                                                            department.id
                                                                        )
                                                                    }
                                                                    className={`
                                                                        flex
                                                                        w-full
                                                                        cursor-pointer
                                                                        items-center
                                                                        gap-3
                                                                        px-4
                                                                        py-3
                                                                        text-left
                                                                        transition-colors
                                                                        disabled:cursor-not-allowed
                                                                        disabled:opacity-60
                                                                        ${
                                                                            isSelected
                                                                                ? "bg-blue-50"
                                                                                : "bg-white hover:bg-gray-50"
                                                                        }
                                                                    `}
                                                                >
                                                                    <span
                                                                        className={`
                                                                            flex
                                                                            h-5
                                                                            w-5
                                                                            shrink-0
                                                                            items-center
                                                                            justify-center
                                                                            rounded
                                                                            border
                                                                            transition-colors
                                                                            ${
                                                                                isSelected
                                                                                    ? "border-[#4C4CF9] bg-[#4C4CF9]"
                                                                                    : "border-gray-300 bg-white"
                                                                            }
                                                                        `}
                                                                    >
                                                                        {isSelected && (
                                                                            <Check
                                                                                size={
                                                                                    13
                                                                                }
                                                                                className="text-white"
                                                                            />
                                                                        )}
                                                                    </span>

                                                                    <span
                                                                        className={`
                                                                            min-w-0
                                                                            text-sm
                                                                            ${
                                                                                isSelected
                                                                                    ? "font-medium text-[#4C4CF9]"
                                                                                    : "text-gray-700"
                                                                            }
                                                                        `}
                                                                    >
                                                                        {
                                                                            department.name
                                                                        }
                                                                    </span>
                                                                </button>
                                                            );
                                                        }
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="px-4 py-6 text-center">
                                                    <p className="text-sm text-gray-500">
                                                        No departments found.
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-3 py-2.5">
                                            <span className="text-xs font-medium text-gray-500">
                                                {selectedDepartmentIds.length}{" "}
                                                {selectedDepartmentIds.length ===
                                                1
                                                    ? "department"
                                                    : "departments"}{" "}
                                                selected
                                            </span>

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setDepartmentDropdownOpen(
                                                        false
                                                    );
                                                    setDepartmentSearch(
                                                        ""
                                                    );
                                                }}
                                                className="text-xs font-semibold text-[#4C4CF9] hover:text-[#3a3ae0]"
                                            >
                                                Done
                                            </button>
                                        </div>
                                    </div>
                                )}
                        </div>

                        {errors.department ? (
                            <p className="mt-1.5 text-xs text-red-600">
                                {errors.department}
                            </p>
                        ) : (
                            <p className="mt-1.5 text-xs text-gray-500">
                                Select one or more IT Support departments that you need help from.
                            </p>
                        )}

                        {selectedDepartmentIds.length >
                            0 && (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                                {selectedDepartments.map(
                                    (department) => (
                                        <span
                                            key={
                                                department.id
                                            }
                                            className="inline-flex items-center rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700"
                                        >
                                            {
                                                department.name
                                            }
                                        </span>
                                    )
                                )}
                            </div>
                        )}
                    </div>

                    <div>
                        <div className="mb-2 flex items-center justify-between gap-3">
                            <label
                                htmlFor="assistance-details"
                                className="block text-sm font-medium text-black"
                            >
                                Assistance Details
                                <span className="ml-1 text-red-500">
                                    *
                                </span>
                            </label>

                            <span
                                className={`shrink-0 text-xs ${
                                    details.trim().length <
                                    MIN_DETAILS_LENGTH
                                        ? "text-gray-400"
                                        : "text-green-600"
                                }`}
                            >
                                {details.length}/
                                {MAX_DETAILS_LENGTH}
                            </span>
                        </div>

                        <textarea
                            id="assistance-details"
                            value={details}
                            onChange={(event) => {
                                setDetails(
                                    event.target.value
                                );

                                setErrors((prev) => ({
                                    ...prev,
                                    details: "",
                                }));
                            }}
                            disabled={submitting}
                            rows={4}
                            minLength={
                                MIN_DETAILS_LENGTH
                            }
                            maxLength={
                                MAX_DETAILS_LENGTH
                            }
                            placeholder="Describe what you need assistance with..."
                            className={`
                                w-full
                                resize-none
                                rounded-lg
                                border
                                bg-white
                                px-3
                                py-2.5
                                text-sm
                                text-black
                                outline-none
                                transition
                                placeholder:text-gray-400
                                focus:ring-2
                                focus:ring-[#4C4CF9]/10
                                disabled:cursor-not-allowed
                                disabled:bg-gray-100
                                ${
                                    errors.details
                                        ? "border-red-300 focus:border-red-400"
                                        : "border-gray-300 focus:border-[#4C4CF9]"
                                }
                            `}
                        />

                        <div className="mt-1.5">
                            {errors.details ? (
                                <p className="text-xs text-red-600">
                                    {errors.details}
                                </p>
                            ) : (
                                <p className="text-xs text-gray-500">
                                    Minimum{" "}
                                    {
                                        MIN_DETAILS_LENGTH
                                    }{" "}
                                    characters required.
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-start gap-2.5 rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-3">
                        <Info
                            size={17}
                            className="mt-0.5 shrink-0 text-gray-500"
                        />

                        <p className="text-xs leading-5 text-gray-500">
                            Your ticket assignment and department
                            will not change. Each selected department
                            will receive its own assistance request
                            and can respond independently.
                        </p>
                    </div>

                </div>

                <div className="flex items-center justify-end gap-2 border-t border-gray-200 bg-gray-50/50 px-5 py-4">

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={submitting}
                        className="h-9 cursor-pointer rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={
                            submitting ||
                            loadingDepartments
                        }
                        className="h-9 cursor-pointer rounded-lg bg-[#4C4CF9] px-4 text-sm font-medium text-white transition-colors hover:bg-[#3a3ae0] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {submitting
                            ? "Requesting..."
                            : "Request Assistance"}
                    </button>

                </div>

            </div>
        </div>
    );
}