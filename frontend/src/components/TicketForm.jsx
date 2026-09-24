import { getCurrentUser } from "../utils/auth";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FileText,
    Send,
    Monitor,
    ChevronDown,
    SquareUserRound,
    Sparkles,
    ChartNoAxesColumnIncreasing,
    LockKeyhole,
} from "lucide-react";

import api from "../api";

const priorityLabel = {
    P1: "Critical (P1)",
    P2: "High (P2)",
    P3: "Medium (P3)",
    P4: "Low (P4)",
    P5: "Very Low (P5)",
};

const priorityColor = {
    P1: "bg-red-100 text-red-700 border border-red-300",
    P2: "bg-orange-100 text-orange-700 border border-orange-300",
    P3: "bg-yellow-100 text-yellow-700 border border-yellow-300",
    P4: "bg-green-100 text-green-700 border border-green-300",
    P5: "bg-blue-100 text-blue-700 border border-blue-300",
};

export default function TicketForm() {
    const user = getCurrentUser();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        subject: "",
        description: "",
        affected_scope: "",
        business_impact: "",
        workstation: "",
    });

    const [loading, setLoading] = useState(false);

    const affectedScopeChoices = [
        { value: "individual", label: "Individual" },
        { value: "group", label: "Group" },
        { value: "department", label: "Department" },
        { value: "organization_wide", label: "Organization Wide" },
    ];

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await api.post(
                "/tickets/create/",
                formData
            );

            navigate("/ticket-success", {
                state: {
                    message: response.data.message,
                },
            });
        } catch {
            setLoading(false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="mx-auto w-full max-w-[1500px] space-y-4"
        >
            <section className="overflow-hidden rounded-lg border border-gray-300 bg-white">
                <div className="flex items-center justify-between gap-4 border-b border-gray-200 px-5 py-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <SquareUserRound
                                size={19}
                                className="text-[#2563EB]"
                            />

                            <h1 className="font-semibold text-black">
                                Requester Information
                            </h1>
                        </div>

                        <p className="mt-1 text-xs text-gray-500">
                            Your account information is automatically
                            included with this ticket.
                        </p>
                    </div>

                    <div className="hidden items-center gap-2 text-xs text-gray-500 lg:flex">
                        <LockKeyhole
                            size={14}
                            className="text-gray-400"
                        />

                        <span>
                            Account details cannot be edited
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 px-5 py-4 sm:grid-cols-2 lg:grid-cols-5">
                    <FormField label="Full Name">
                        <input
                            type="text"
                            readOnly
                            value={
                                `${user.first_name || ""} ${
                                    user.last_name || ""
                                }`.trim() || "-"
                            }
                            className="h-10 w-full cursor-default rounded-md border border-gray-300 bg-gray-50 px-3 text-sm text-gray-600 outline-none"
                        />
                    </FormField>

                    <FormField label="Employee ID">
                        <input
                            type="text"
                            readOnly
                            value={user.user_code || "-"}
                            className="h-10 w-full cursor-default rounded-md border border-gray-300 bg-gray-50 px-3 text-sm text-gray-600 outline-none"
                        />
                    </FormField>

                    <FormField label="Department">
                        <input
                            type="text"
                            readOnly
                            value={
                                user.employee_department || "-"
                            }
                            className="h-10 w-full cursor-default rounded-md border border-gray-300 bg-gray-50 px-3 text-sm text-gray-600 outline-none"
                        />
                    </FormField>

                    <FormField label="Office Location">
                        <input
                            type="text"
                            readOnly
                            value={user.office_location || "-"}
                            className="h-10 w-full cursor-default rounded-md border border-gray-300 bg-gray-50 px-3 text-sm text-gray-600 outline-none"
                        />
                    </FormField>

                    <FormField label="Workstation" optional>
                        <div className="relative">
                            <Monitor
                                size={16}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />

                            <input
                                type="text"
                                maxLength={9}
                                value={formData.workstation}
                                name="workstation"
                                onChange={handleChange}
                                placeholder="e.g. WS-001"
                                className="h-10 w-full rounded-md border border-gray-300 bg-white pl-9 pr-3 text-sm text-black outline-none transition placeholder:text-gray-400 focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        <div className="mt-1 flex items-center justify-between gap-3">
                            <p className="text-xs text-gray-500">
                                Enter your workstation ID if
                                applicable.
                            </p>

                            <p className="shrink-0 text-xs text-gray-400">
                                {formData.workstation.length}/9
                            </p>
                        </div>
                    </FormField>
                </div>
            </section>

            <div className="grid grid-cols-1 items-stretch gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
                <section className="h-full overflow-hidden rounded-lg border border-gray-300 bg-white">
                    <div className="border-b border-gray-200 px-5 py-4">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <div className="flex items-center gap-2">
                                    <FileText
                                        size={19}
                                        className="text-[#2563EB]"
                                    />

                                    <h2 className="font-semibold text-black">
                                        Issue Details
                                    </h2>
                                </div>

                                <p className="mt-1 text-xs text-gray-500">
                                    Provide as much information as
                                    possible to help IT understand
                                    and resolve your issue.
                                </p>
                            </div>

                            <p className="shrink-0 text-xs text-gray-500 sm:self-start">
                                Fields marked with{" "}
                                <span className="font-medium text-red-500">
                                    *
                                </span>{" "}
                                are required.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4 px-5 py-4">
                        <FormField label="Subject" required>
                            <input
                                type="text"
                                maxLength={100}
                                value={formData.subject}
                                onChange={handleChange}
                                placeholder="Briefly summarize the issue"
                                name="subject"
                                required
                                className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-black outline-none transition placeholder:text-gray-400 focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100"
                            />

                            <div className="mt-1 flex items-center justify-between gap-3">
                                <p className="text-xs text-gray-500">
                                    Keep the subject short and
                                    specific.
                                </p>

                                <p className="shrink-0 text-xs text-gray-400">
                                    {formData.subject.length}/100
                                </p>
                            </div>
                        </FormField>

                        <FormField
                            label="Affected Scope"
                            required
                        >
                            <div className="relative w-full max-w-[620px]">
                                <select
                                    name="affected_scope"
                                    value={
                                        formData.affected_scope
                                    }
                                    onChange={handleChange}
                                    required
                                    className="h-10 w-full cursor-pointer appearance-none rounded-md border border-gray-300 bg-white px-3 pr-9 text-sm text-black outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100"
                                >
                                    <option value="">
                                        Select affected scope
                                    </option>

                                    {affectedScopeChoices.map(
                                        (choice) => (
                                            <option
                                                key={choice.value}
                                                value={choice.value}
                                            >
                                                {choice.label}
                                            </option>
                                        )
                                    )}
                                </select>

                                <ChevronDown
                                    size={16}
                                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                                />
                            </div>

                            <p className="mt-1 text-xs text-gray-500">
                                Select how many users are affected
                                by the issue.
                            </p>
                        </FormField>

                        <FormField label="Description" required>
                            <textarea
                                rows={4}
                                value={formData.description}
                                maxLength={750}
                                onChange={handleChange}
                                name="description"
                                required
                                placeholder="Describe what happened, what you were trying to do, and any error messages you encountered."
                                className="w-full resize-none rounded-md border border-gray-300 bg-white p-3 text-sm leading-5 text-black outline-none transition placeholder:text-gray-400 focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100"
                            />

                            <div className="mt-1 flex items-center justify-between gap-3">
                                <p className="text-xs text-gray-500">
                                    Include error messages or
                                    steps that led to the issue.
                                </p>

                                <p className="shrink-0 text-xs text-gray-400">
                                    {formData.description.length}/750
                                </p>
                            </div>
                        </FormField>

                        <FormField
                            label="Business Impact"
                            required
                        >
                            <textarea
                                rows={3}
                                value={formData.business_impact}
                                maxLength={500}
                                onChange={handleChange}
                                name="business_impact"
                                required
                                placeholder="Explain how this issue is affecting your work or business operations."
                                className="w-full resize-none rounded-md border border-gray-300 bg-white p-3 text-sm leading-5 text-black outline-none transition placeholder:text-gray-400 focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100"
                            />

                            <div className="mt-1 flex items-center justify-between gap-3">
                                <p className="text-xs text-gray-500">
                                    Describe what work is blocked,
                                    delayed, or affected. This
                                    helps determine the appropriate
                                    ticket priority.
                                </p>

                                <p className="shrink-0 text-xs text-gray-400">
                                    {formData.business_impact.length}
                                    /500
                                </p>
                            </div>
                        </FormField>
                    </div>

                    <div className="border-t border-gray-200 px-5 py-4">
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`inline-flex min-w-[220px] items-center justify-center gap-2 rounded-md px-8 py-2.5 text-sm font-semibold text-white transition ${
                                    loading
                                        ? "cursor-not-allowed bg-gray-400"
                                        : "cursor-pointer bg-[#2563EB] hover:bg-[#1D4ED8]"
                                }`}
                            >
                                <Send size={16} />

                                {loading
                                    ? "Submitting..."
                                    : "Submit Ticket"}
                            </button>
                        </div>
                    </div>
                </section>

                <aside className="grid h-full grid-rows-[auto_1fr] gap-4">
                    <div className="rounded-lg border border-[#2563EB]/20 bg-[#2563EB]/5 p-5">
                        <div className="flex items-start gap-3">
                            <Sparkles
                                size={20}
                                className="mt-0.5 shrink-0 text-[#2563EB]"
                            />

                            <div>
                                <h3 className="font-semibold text-[#2563EB]">
                                    What happens after you submit?
                                </h3>

                                <p className="mt-2 text-xs leading-5 text-gray-600">
                                    The system analyzes your ticket
                                    to determine its classification
                                    and appropriate priority based
                                    on the issue details you provide.
                                </p>

                                <p className="mt-2 text-xs leading-5 text-gray-600">
                                    Tickets that require additional
                                    review may be checked by the IT
                                    Service Desk before being
                                    assigned to IT Support.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="h-full rounded-lg border border-gray-300 bg-white p-5">
                        <div className="flex items-start gap-3">
                            <ChartNoAxesColumnIncreasing
                                size={20}
                                className="mt-0.5 shrink-0 text-[#2563EB]"
                            />

                            <div>
                                <h3 className="font-semibold text-black">
                                    Priority Reference
                                </h3>

                                <p className="mt-1 text-xs leading-5 text-gray-500">
                                    Priority is automatically
                                    assigned by the system based on
                                    the ticket details.
                                </p>
                            </div>
                        </div>

                        <div className="mt-4 space-y-2.5">
                            <PriorityItem
                                level="P1"
                                description="Critical or major business impact"
                            />

                            <PriorityItem
                                level="P2"
                                description="High impact requiring prompt attention"
                            />

                            <PriorityItem
                                level="P3"
                                description="Moderate business impact"
                            />

                            <PriorityItem
                                level="P4"
                                description="Limited or minor impact"
                            />

                            <PriorityItem
                                level="P5"
                                description="Low urgency or planned request"
                            />
                        </div>

                        <div className="mt-4 border-t border-gray-200 pt-4">
                            <p className="text-xs leading-5 text-gray-600">
                                Priority is determined using multiple
                                ticket details such as the issue
                                classification, business impact,
                                affected scope, and other relevant
                                factors.
                            </p>
                        </div>
                    </div>
                </aside>
            </div>
        </form>
    );
}

function FormField({
    label,
    children,
    required = false,
    optional = false,
}) {
    return (
        <div>
            <div className="mb-1.5 flex items-center gap-1.5">
                <label className="text-sm font-medium text-black">
                    {label}
                </label>

                {required && (
                    <span className="text-red-500">*</span>
                )}

                {optional && (
                    <span className="text-xs font-normal text-gray-400">
                        (Optional)
                    </span>
                )}
            </div>

            {children}
        </div>
    );
}

function PriorityItem({ level, description }) {
    return (
        <div className="flex items-start gap-3">
            <div
                className={`flex h-7 min-w-[42px] items-center justify-center rounded-md px-2 text-xs font-semibold ${priorityColor[level]}`}
            >
                {level}
            </div>

            <div className="min-w-0 pt-0.5">
                <p className="text-sm font-semibold text-black">
                    {priorityLabel[level]}
                </p>

                <p className="mt-0.5 text-xs leading-4 text-gray-500">
                    {description}
                </p>
            </div>
        </div>
    );
}