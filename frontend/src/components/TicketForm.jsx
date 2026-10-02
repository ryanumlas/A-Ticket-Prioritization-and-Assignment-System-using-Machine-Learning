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
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

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

    // Stores validation errors returned by the backend
    const [errors, setErrors] = useState({});

    // Clarification request confirmation modal
    const [showClarificationModal, setShowClarificationModal] = useState(false);
    const [pendingTicket, setPendingTicket] = useState(null);
    const [checkingClarification, setCheckingClarification] = useState(false);

    const affectedScopeChoices = [
        { value: "individual", label: "Individual" },
        { value: "group", label: "Group" },
        { value: "department", label: "Department" },
        { value: "organization_wide", label: "Organization Wide" },
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value,
        });

        // Clear the error for this field when the user edits it
        setErrors((prev) => ({
            ...prev,
            [name]: "",
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setCheckingClarification(true);
        setErrors({});

        try {
            // Check whether the logged-in employee has a pending clarification request.
            const clarificationResponse = await api.get(
                "/tickets/clarification-requests/pending/"
            );

            const clarificationData = clarificationResponse.data;

            if (clarificationData.pending && clarificationData.ticket?.id) {
                setPendingTicket(clarificationData.ticket);
                setShowClarificationModal(true);
                return;
            }

            // No pending clarification: proceed with normal ticket creation.
            await api.post("/tickets/create/", formData);

            toast.success("Ticket submitted successfully!", {
                description:
                    "Your ticket has been submitted and is now being processed.",
            });

            navigate("/dashboard");
        } catch (error) {
            const responseErrors = error.response?.data;

            if (responseErrors) {
                setErrors(responseErrors);
            } else {
                setErrors({
                    non_field_errors: [
                        "Something went wrong while submitting the ticket.",
                    ],
                });
            }
        } finally {
            setLoading(false);
            setCheckingClarification(false);
        }
    };

    const handleCancelClarification = () => {
        setShowClarificationModal(false);
        setPendingTicket(null);
    };

    const handleResubmitClarification = () => {
        if (!pendingTicket?.id) {
            return;
        }

        setShowClarificationModal(false);

        // Navigate to the existing ticket's clarification page.
        // Change this path if your React router uses a different route.
        navigate(`/tickets/clarification/${pendingTicket.id}`);
    };

    return (
        <>
            <motion.form
                onSubmit={handleSubmit}
                className="mx-auto w-full max-w-[1500px] space-y-4"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                    duration: 0.4,
                    ease: "easeOut",
                }}
            >
                {/* General / Non-field Errors */}
                <AnimatePresence>
                    {errors.non_field_errors && (
                        <motion.div
                            initial={{
                                opacity: 0,
                                y: -8,
                                height: 0,
                            }}
                            animate={{
                                opacity: 1,
                                y: 0,
                                height: "auto",
                            }}
                            exit={{
                                opacity: 0,
                                y: -8,
                                height: 0,
                            }}
                            transition={{
                                duration: 0.25,
                                ease: "easeOut",
                            }}
                            className="overflow-hidden rounded-lg border border-red-200 bg-red-50 px-4 py-3"
                        >
                            {Array.isArray(errors.non_field_errors) ? (
                                errors.non_field_errors.map((error, index) => (
                                    <motion.p
                                        key={index}
                                        initial={{
                                            opacity: 0,
                                            x: -6,
                                        }}
                                        animate={{
                                            opacity: 1,
                                            x: 0,
                                        }}
                                        transition={{
                                            duration: 0.2,
                                            delay: index * 0.04,
                                        }}
                                        className="text-sm text-red-600"
                                    >
                                        {error}
                                    </motion.p>
                                ))
                            ) : (
                                <p className="text-sm text-red-600">
                                    {errors.non_field_errors}
                                </p>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Requester Information */}
                <motion.section
                    className="overflow-hidden rounded-lg border border-gray-300 bg-white"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        duration: 0.35,
                        delay: 0.05,
                        ease: "easeOut",
                    }}
                >
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

                    <motion.div
                        className="grid grid-cols-1 gap-4 px-5 py-4 sm:grid-cols-2 lg:grid-cols-5"
                        initial="hidden"
                        animate="visible"
                        variants={{
                            hidden: {},
                            visible: {
                                transition: {
                                    staggerChildren: 0.05,
                                },
                            },
                        }}
                    >
                        <AnimatedField>
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
                        </AnimatedField>

                        <AnimatedField>
                            <FormField label="Employee ID">
                                <input
                                    type="text"
                                    readOnly
                                    value={user.user_code || "-"}
                                    className="h-10 w-full cursor-default rounded-md border border-gray-300 bg-gray-50 px-3 text-sm text-gray-600 outline-none"
                                />
                            </FormField>
                        </AnimatedField>

                        <AnimatedField>
                            <FormField label="Department">
                                <input
                                    type="text"
                                    readOnly
                                    value={user.employee_department || "-"}
                                    className="h-10 w-full cursor-default rounded-md border border-gray-300 bg-gray-50 px-3 text-sm text-gray-600 outline-none"
                                />
                            </FormField>
                        </AnimatedField>

                        <AnimatedField>
                            <FormField label="Office Location">
                                <input
                                    type="text"
                                    readOnly
                                    value={user.office_location || "-"}
                                    className="h-10 w-full cursor-default rounded-md border border-gray-300 bg-gray-50 px-3 text-sm text-gray-600 outline-none"
                                />
                            </FormField>
                        </AnimatedField>

                        <AnimatedField>
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
                        </AnimatedField>
                    </motion.div>
                </motion.section>

                <div className="grid grid-cols-1 items-stretch gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
                    {/* Issue Details */}
                    <motion.section
                        className="h-full overflow-hidden rounded-lg border border-gray-300 bg-white"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: 0.35,
                            delay: 0.12,
                            ease: "easeOut",
                        }}
                    >
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

                        <motion.div
                            className="space-y-4 px-5 py-4"
                            initial="hidden"
                            animate="visible"
                            variants={{
                                hidden: {},
                                visible: {
                                    transition: {
                                        staggerChildren: 0.06,
                                        delayChildren: 0.18,
                                    },
                                },
                            }}
                        >
                            {/* Subject */}
                            <AnimatedField>
                                <FormField label="Subject" required>
                                    <input
                                        type="text"
                                        maxLength={100}
                                        value={formData.subject}
                                        onChange={handleChange}
                                        placeholder="Briefly summarize the issue"
                                        name="subject"
                                        required
                                        className={`h-10 w-full rounded-md border bg-white px-3 text-sm text-black outline-none transition placeholder:text-gray-400 focus:ring-2 ${
                                            errors.subject
                                                ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                                                : "border-gray-300 focus:border-[#2563EB] focus:ring-blue-100"
                                        }`}
                                    />

                                    <div className="mt-1 flex items-center justify-between gap-3">
                                        <div>
                                            <AnimatePresence mode="wait">
                                                {errors.subject ? (
                                                    <motion.p
                                                        key="error"
                                                        initial={{
                                                            opacity: 0,
                                                            y: -3,
                                                        }}
                                                        animate={{
                                                            opacity: 1,
                                                            y: 0,
                                                        }}
                                                        exit={{
                                                            opacity: 0,
                                                            y: -3,
                                                        }}
                                                        className="text-xs text-red-500"
                                                    >
                                                        {Array.isArray(
                                                            errors.subject
                                                        )
                                                            ? errors.subject[0]
                                                            : errors.subject}
                                                    </motion.p>
                                                ) : (
                                                    <motion.p
                                                        key="helper"
                                                        initial={{
                                                            opacity: 0,
                                                        }}
                                                        animate={{
                                                            opacity: 1,
                                                        }}
                                                        className="text-xs text-gray-500"
                                                    >
                                                        Keep the subject short
                                                        and specific.
                                                    </motion.p>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        <p className="shrink-0 text-xs text-gray-400">
                                            {formData.subject.length}/100
                                        </p>
                                    </div>
                                </FormField>
                            </AnimatedField>

                            {/* Affected Scope */}
                            <AnimatedField>
                                <FormField
                                    label="Affected Scope"
                                    required
                                >
                                    <div className="relative w-full max-w-[620px]">
                                        <select
                                            name="affected_scope"
                                            value={formData.affected_scope}
                                            onChange={handleChange}
                                            required
                                            className={`h-10 w-full cursor-pointer appearance-none rounded-md border bg-white px-3 pr-9 text-sm text-black outline-none transition focus:ring-2 ${
                                                errors.affected_scope
                                                    ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                                                    : "border-gray-300 focus:border-[#2563EB] focus:ring-blue-100"
                                            }`}
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

                                    <AnimatePresence mode="wait">
                                        {errors.affected_scope ? (
                                            <motion.p
                                                key="error"
                                                initial={{
                                                    opacity: 0,
                                                    y: -3,
                                                }}
                                                animate={{
                                                    opacity: 1,
                                                    y: 0,
                                                }}
                                                exit={{
                                                    opacity: 0,
                                                    y: -3,
                                                }}
                                                className="mt-1 text-xs text-red-500"
                                            >
                                                {Array.isArray(
                                                    errors.affected_scope
                                                )
                                                    ? errors.affected_scope[0]
                                                    : errors.affected_scope}
                                            </motion.p>
                                        ) : (
                                            <motion.p
                                                key="helper"
                                                initial={{
                                                    opacity: 0,
                                                }}
                                                animate={{
                                                    opacity: 1,
                                                }}
                                                className="mt-1 text-xs text-gray-500"
                                            >
                                                Select how many users are
                                                affected by the issue.
                                            </motion.p>
                                        )}
                                    </AnimatePresence>
                                </FormField>
                            </AnimatedField>

                            {/* Description */}
                            <AnimatedField>
                                <FormField label="Description" required>
                                    <textarea
                                        rows={4}
                                        value={formData.description}
                                        maxLength={750}
                                        onChange={handleChange}
                                        name="description"
                                        required
                                        placeholder="Describe what happened, what you were trying to do, and any error messages you encountered."
                                        className={`w-full resize-none rounded-md border bg-white p-3 text-sm leading-5 text-black outline-none transition placeholder:text-gray-400 focus:ring-2 ${
                                            errors.description
                                                ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                                                : "border-gray-300 focus:border-[#2563EB] focus:ring-blue-100"
                                        }`}
                                    />

                                    <div className="mt-1 flex items-center justify-between gap-3">
                                        <div>
                                            <AnimatePresence mode="wait">
                                                {errors.description ? (
                                                    <motion.p
                                                        key="error"
                                                        initial={{
                                                            opacity: 0,
                                                            y: -3,
                                                        }}
                                                        animate={{
                                                            opacity: 1,
                                                            y: 0,
                                                        }}
                                                        exit={{
                                                            opacity: 0,
                                                            y: -3,
                                                        }}
                                                        className="text-xs text-red-500"
                                                    >
                                                        {Array.isArray(
                                                            errors.description
                                                        )
                                                            ? errors.description[0]
                                                            : errors.description}
                                                    </motion.p>
                                                ) : (
                                                    <motion.p
                                                        key="helper"
                                                        initial={{
                                                            opacity: 0,
                                                        }}
                                                        animate={{
                                                            opacity: 1,
                                                        }}
                                                        className="text-xs text-gray-500"
                                                    >
                                                        Include error messages
                                                        or steps that led to
                                                        the issue.
                                                    </motion.p>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        <p className="shrink-0 text-xs text-gray-400">
                                            {formData.description.length}/750
                                        </p>
                                    </div>
                                </FormField>
                            </AnimatedField>

                            {/* Business Impact */}
                            <AnimatedField>
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
                                        className={`w-full resize-none rounded-md border bg-white p-3 text-sm leading-5 text-black outline-none transition placeholder:text-gray-400 focus:ring-2 ${
                                            errors.business_impact
                                                ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                                                : "border-gray-300 focus:border-[#2563EB] focus:ring-blue-100"
                                        }`}
                                    />

                                    <div className="mt-1 flex items-center justify-between gap-3">
                                        <div>
                                            <AnimatePresence mode="wait">
                                                {errors.business_impact ? (
                                                    <motion.p
                                                        key="error"
                                                        initial={{
                                                            opacity: 0,
                                                            y: -3,
                                                        }}
                                                        animate={{
                                                            opacity: 1,
                                                            y: 0,
                                                        }}
                                                        exit={{
                                                            opacity: 0,
                                                            y: -3,
                                                        }}
                                                        className="text-xs text-red-500"
                                                    >
                                                        {Array.isArray(
                                                            errors.business_impact
                                                        )
                                                            ? errors.business_impact[0]
                                                            : errors.business_impact}
                                                    </motion.p>
                                                ) : (
                                                    <motion.p
                                                        key="helper"
                                                        initial={{
                                                            opacity: 0,
                                                        }}
                                                        animate={{
                                                            opacity: 1,
                                                        }}
                                                        className="text-xs text-gray-500"
                                                    >
                                                        Describe what work is
                                                        blocked, delayed, or
                                                        affected. This helps
                                                        determine the
                                                        appropriate ticket
                                                        priority.
                                                    </motion.p>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        <p className="shrink-0 text-xs text-gray-400">
                                            {formData.business_impact.length}
                                            /500
                                        </p>
                                    </div>
                                </FormField>
                            </AnimatedField>
                        </motion.div>

                        {/* Submit */}
                        <div className="border-t border-gray-200 px-5 py-4">
                            <div className="flex justify-end">
                                <motion.button
                                    type="submit"
                                    disabled={loading || checkingClarification}
                                    whileHover={
                                        !loading && !checkingClarification
                                            ? {
                                                  y: -1,
                                              }
                                            : undefined
                                    }
                                    whileTap={
                                        !loading && !checkingClarification
                                            ? {
                                                  scale: 0.98,
                                              }
                                            : undefined
                                    }
                                    transition={{
                                        duration: 0.15,
                                    }}
                                    className={`inline-flex min-w-[220px] items-center justify-center gap-2 rounded-md px-8 py-2.5 text-sm font-semibold text-white transition ${
                                        loading || checkingClarification
                                            ? "cursor-not-allowed bg-gray-400"
                                            : "cursor-pointer bg-[#2563EB] hover:bg-[#1D4ED8]"
                                    }`}
                                >
                                    <motion.span
                                        animate={
                                            loading || checkingClarification
                                                ? {
                                                      rotate: 360,
                                                  }
                                                : {
                                                      rotate: 0,
                                                  }
                                        }
                                        transition={
                                            loading || checkingClarification
                                                ? {
                                                      duration: 1,
                                                      repeat: Infinity,
                                                      ease: "linear",
                                                  }
                                                : {
                                                      duration: 0.2,
                                                  }
                                        }
                                    >
                                        <Send size={16} />
                                    </motion.span>

                                    <AnimatePresence mode="wait">
                                        <motion.span
                                            key={
                                                checkingClarification
                                                    ? "checking"
                                                    : loading
                                                      ? "submitting"
                                                      : "submit"
                                            }
                                            initial={{
                                                opacity: 0,
                                                y: 3,
                                            }}
                                            animate={{
                                                opacity: 1,
                                                y: 0,
                                            }}
                                            exit={{
                                                opacity: 0,
                                                y: -3,
                                            }}
                                            transition={{
                                                duration: 0.15,
                                            }}
                                        >
                                            {checkingClarification
                                                ? "Checking..."
                                                : loading
                                                  ? "Submitting..."
                                                  : "Submit Ticket"}
                                        </motion.span>
                                    </AnimatePresence>
                                </motion.button>
                            </div>
                        </div>
                    </motion.section>

                    {/* Right Sidebar */}
                    <motion.aside
                        className="grid h-full grid-rows-[auto_1fr] gap-4"
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                            duration: 0.35,
                            delay: 0.2,
                            ease: "easeOut",
                        }}
                    >
                        {/* What Happens */}
                        <motion.div
                            className="rounded-lg border border-[#2563EB]/20 bg-[#2563EB]/5 p-5"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: 0.3,
                                delay: 0.25,
                            }}
                        >
                            <div className="flex items-start gap-3">
                                <motion.div
                                    animate={{
                                        y: [0, -2, 0],
                                    }}
                                    transition={{
                                        duration: 2.5,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                    }}
                                >
                                    <Sparkles
                                        size={20}
                                        className="mt-0.5 shrink-0 text-[#2563EB]"
                                    />
                                </motion.div>

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
                        </motion.div>

                        {/* Priority Reference */}
                        <motion.div
                            className="h-full rounded-lg border border-gray-300 bg-white p-5"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: 0.3,
                                delay: 0.3,
                            }}
                        >
                            <div className="flex items-start gap-3">
                                <motion.div
                                    animate={{
                                        y: [0, -2, 0],
                                    }}
                                    transition={{
                                        duration: 2.8,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                    }}
                                >
                                    <ChartNoAxesColumnIncreasing
                                        size={20}
                                        className="mt-0.5 shrink-0 text-[#2563EB]"
                                    />
                                </motion.div>

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

                            <motion.div
                                className="mt-4 space-y-2.5"
                                initial="hidden"
                                animate="visible"
                                variants={{
                                    hidden: {},
                                    visible: {
                                        transition: {
                                            staggerChildren: 0.07,
                                            delayChildren: 0.35,
                                        },
                                    },
                                }}
                            >
                                <AnimatedPriorityItem>
                                    <PriorityItem
                                        level="P1"
                                        description="Critical or major business impact"
                                    />
                                </AnimatedPriorityItem>

                                <AnimatedPriorityItem>
                                    <PriorityItem
                                        level="P2"
                                        description="High impact requiring prompt attention"
                                    />
                                </AnimatedPriorityItem>

                                <AnimatedPriorityItem>
                                    <PriorityItem
                                        level="P3"
                                        description="Moderate business impact"
                                    />
                                </AnimatedPriorityItem>

                                <AnimatedPriorityItem>
                                    <PriorityItem
                                        level="P4"
                                        description="Limited or minor impact"
                                    />
                                </AnimatedPriorityItem>

                                <AnimatedPriorityItem>
                                    <PriorityItem
                                        level="P5"
                                        description="Low urgency or planned request"
                                    />
                                </AnimatedPriorityItem>
                            </motion.div>

                            <motion.div
                                className="mt-4 border-t border-gray-200 pt-4"
                                initial={{
                                    opacity: 0,
                                }}
                                animate={{
                                    opacity: 1,
                                }}
                                transition={{
                                    duration: 0.3,
                                    delay: 0.7,
                                }}
                            >
                                <p className="text-xs leading-5 text-gray-600">
                                    Priority is determined using multiple
                                    ticket details such as the issue
                                    classification, business impact,
                                    affected scope, and other relevant
                                    factors.
                                </p>
                            </motion.div>
                        </motion.div>
                    </motion.aside>
                </div>
            </motion.form>

            {/* Pending Clarification Confirmation Modal */}
            <AnimatePresence>
                {showClarificationModal && (
                    <motion.div
                        key="clarification-confirmation"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    >
                        <motion.div
                            initial={{
                                opacity: 0,
                                y: 12,
                                scale: 0.98,
                            }}
                            animate={{
                                opacity: 1,
                                y: 0,
                                scale: 1,
                            }}
                            exit={{
                                opacity: 0,
                                y: 8,
                                scale: 0.98,
                            }}
                            transition={{
                                duration: 0.2,
                                ease: "easeOut",
                            }}
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="clarification-modal-title"
                            className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-xl"
                        >
                            <h2
                                id="clarification-modal-title"
                                className="text-lg font-semibold text-gray-900"
                            >
                                Confirmation
                            </h2>

                            <p className="mt-3 text-sm leading-6 text-gray-600">
                                You have a ticket that requires additional
                                information. Please clarify your existing
                                ticket before submitting a new one.
                            </p>

                            {pendingTicket && (
                                <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 p-3">
                                    {pendingTicket.ticket_code && (
                                        <p className="text-xs font-medium text-blue-700">
                                            Ticket: {pendingTicket.ticket_code}
                                        </p>
                                    )}

                                    {pendingTicket.subject && (
                                        <p className="mt-1 text-sm font-medium text-gray-800">
                                            {pendingTicket.subject}
                                        </p>
                                    )}
                                </div>
                            )}

                            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={handleCancelClarification}
                                    className="rounded-md border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={handleResubmitClarification}
                                    className="rounded-md bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1D4ED8]"
                                >
                                    Resubmit Ticket
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

function AnimatedField({ children }) {
    return (
        <motion.div
            variants={{
                hidden: {
                    opacity: 0,
                    y: 6,
                },
                visible: {
                    opacity: 1,
                    y: 0,
                    transition: {
                        duration: 0.25,
                        ease: "easeOut",
                    },
                },
            }}
        >
            {children}
        </motion.div>
    );
}

function AnimatedPriorityItem({ children }) {
    return (
        <motion.div
            variants={{
                hidden: {
                    opacity: 0,
                    x: -8,
                },
                visible: {
                    opacity: 1,
                    x: 0,
                    transition: {
                        duration: 0.25,
                        ease: "easeOut",
                    },
                },
            }}
        >
            {children}
        </motion.div>
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
            <motion.div
                whileHover={{
                    scale: 1.04,
                }}
                transition={{
                    duration: 0.15,
                }}
                className={`flex h-7 min-w-[42px] items-center justify-center rounded-md px-2 text-xs font-semibold ${priorityColor[level]}`}
            >
                {level}
            </motion.div>

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