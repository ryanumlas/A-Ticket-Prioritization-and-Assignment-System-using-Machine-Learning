import { useEffect, useState } from "react";
import {
    Users,
    X,
    Info,
} from "lucide-react";
import { toast } from "sonner";
import api from '/src/api';

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
    const [departmentId, setDepartmentId] = useState("");
    const [details, setDetails] = useState("");

    const [loadingDepartments, setLoadingDepartments] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [errors, setErrors] = useState({
        department: "",
        details: "",
    });

    useEffect(() => {
        if (!open) {
            setDepartmentId("");
            setDetails("");
            setErrors({
                department: "",
                details: "",
            });
            return;
        }

        setDepartmentId("");
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

                setDepartments(departmentData);
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
                        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
                    },
                });
            } finally {
                setLoadingDepartments(false);
            }
        };

        fetchDepartments();
    }, [open]);

    const handleSubmit = async () => {
        const trimmedDetails = details.trim();

        const newErrors = {
            department: "",
            details: "",
        };

        if (!departmentId) {
            newErrors.department =
                "Please select an assistance department.";
        }

        if (!trimmedDetails) {
            newErrors.details =
                "Assistance details are required.";
        } else if (trimmedDetails.length < MIN_DETAILS_LENGTH) {
            newErrors.details =
                `Assistance details must be at least ${MIN_DETAILS_LENGTH} characters.`;
        }

        setErrors(newErrors);

        if (newErrors.department || newErrors.details) {
            return;
        }

        if (!ticketDetails?.id) {
            toast.error("Unable to request assistance", {
                description: "Ticket information is unavailable.",
                duration: 5000,
                style: {
                    background: "#ffffff",
                    color: "#000000",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    padding: "16px 18px",
                    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
                },
            });

            return;
        }

        try {
            setSubmitting(true);

            const response = await api.post(
                `/tickets/assistance/${ticketDetails.id}/request/`,
                {
                    requested_department: Number(departmentId),
                    reason: trimmedDetails,
                }
            );

            toast.success("Assistance requested", {
                description:
                    response.data?.message ||
                    "Your assistance request has been sent to the selected department.",
                duration: 5000,
                style: {
                    background: "#ffffff",
                    color: "#000000",
                    border: "1px solid #e5e7eb",
                    borderRadius: "10px",
                    padding: "16px",
                    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
                },
            });

            if (onSuccess) {
                onSuccess(response.data?.assistance_request);
            }

            onClose();
        } catch (error) {
            const responseData = error.response?.data;

            let errorMessage =
                responseData?.message ||
                responseData?.detail ||
                "Something went wrong while submitting the assistance request.";

            if (
                responseData?.reason &&
                Array.isArray(responseData.reason)
            ) {
                errorMessage = responseData.reason[0];
            }

            if (
                responseData?.requested_department &&
                Array.isArray(responseData.requested_department)
            ) {
                errorMessage = responseData.requested_department[0];
            }

            toast.error("Unable to request assistance", {
                description: errorMessage,
                duration: 5000,
                style: {
                    background: "#ffffff",
                    color: "#000000",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    padding: "16px 18px",
                    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
                },
            });
        } finally {
            setSubmitting(false);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 px-4">
            <div className="w-full max-w-[500px] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">

                <div className="flex items-start justify-between border-b border-gray-200 px-5 py-4">
                    <div className="flex items-start gap-3">

                        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                            <Users
                                size={18}
                                className="text-blue-500"
                            />
                        </div>

                        <div>
                            <h2 className="text-base font-semibold text-black">
                                Request Assistance
                            </h2>

                            <p className="mt-0.5 text-sm text-gray-500">
                                Request help from another support specialist.
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
                        <label
                            htmlFor="assistance-department"
                            className="mb-2 block text-sm font-medium text-black"
                        >
                            Assistance Department
                            <span className="ml-1 text-red-500">*</span>
                        </label>

                        <select
                            id="assistance-department"
                            value={departmentId}
                            onChange={(event) => {
                                setDepartmentId(event.target.value);

                                setErrors((prev) => ({
                                    ...prev,
                                    department: "",
                                }));
                            }}
                            disabled={
                                loadingDepartments ||
                                submitting
                            }
                            className={`h-11 w-full cursor-pointer rounded-lg border bg-white px-3 text-sm text-black outline-none transition focus:ring-2 focus:ring-[#4C4CF9]/10 disabled:cursor-not-allowed disabled:bg-gray-100 ${
                                errors.department
                                    ? "border-red-300 focus:border-red-400"
                                    : "border-gray-300 focus:border-[#4C4CF9]"
                            }`}
                        >
                            <option value="">
                                {loadingDepartments
                                    ? "Loading departments..."
                                    : "Select assistance department"}
                            </option>

                            {departments.map((department) => (
                                <option
                                    key={department.id}
                                    value={department.id}
                                >
                                    {department.name}
                                </option>
                            ))}
                        </select>

                        {errors.department ? (
                            <p className="mt-1.5 text-xs text-red-600">
                                {errors.department}
                            </p>
                        ) : (
                            <p className="mt-1.5 text-xs text-gray-500">
                                Select the IT department you need assistance from.
                            </p>
                        )}
                    </div>

                    <div>
                        <label
                            htmlFor="assistance-details"
                            className="mb-2 block text-sm font-medium text-black"
                        >
                            Assistance Details
                            <span className="ml-1 text-red-500">*</span>
                        </label>

                        <textarea
                            id="assistance-details"
                            value={details}
                            onChange={(event) => {
                                setDetails(event.target.value);

                                setErrors((prev) => ({
                                    ...prev,
                                    details: "",
                                }));
                            }}
                            disabled={submitting}
                            rows={4}
                            minLength={MIN_DETAILS_LENGTH}
                            maxLength={MAX_DETAILS_LENGTH}
                            placeholder="Describe what you need assistance with..."
                            className={`w-full resize-none rounded-lg border bg-white px-3 py-2.5 text-sm text-black outline-none transition placeholder:text-gray-400 focus:ring-2 focus:ring-[#4C4CF9]/10 disabled:cursor-not-allowed disabled:bg-gray-100 ${
                                errors.details
                                    ? "border-red-300 focus:border-red-400"
                                    : "border-gray-300 focus:border-[#4C4CF9]"
                            }`}
                        />

                        <div className="mt-1.5 flex items-start justify-between gap-3">
                            <div>
                                {errors.details ? (
                                    <p className="text-xs text-red-600">
                                        {errors.details}
                                    </p>
                                ) : (
                                    <p className="text-xs text-gray-500">
                                        Minimum {MIN_DETAILS_LENGTH} characters required.
                                    </p>
                                )}
                            </div>

                            <span
                                className={`shrink-0 text-xs ${
                                    details.trim().length <
                                    MIN_DETAILS_LENGTH
                                        ? "text-gray-400"
                                        : "text-green-600"
                                }`}
                            >
                                {details.length}/{MAX_DETAILS_LENGTH}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-start gap-2.5 rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-3">
                        <Info
                            size={17}
                            className="mt-0.5 shrink-0 text-gray-500"
                        />

                        <p className="text-xs leading-5 text-gray-500">
                            Your ticket assignment and department will not change.
                            This request will be available to eligible IT Support
                            Specialists in the selected department until another
                            technician accepts it.
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