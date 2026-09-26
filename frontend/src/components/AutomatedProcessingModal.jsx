import { useEffect, useMemo, useState } from "react";
import {
    Workflow,
    X,
    CheckCircle2,
    AlertCircle,
    Users,
    UserCheck,
    BriefcaseBusiness,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import {
    priorityLabel,
    priorityColor,
} from "../utils/priority";

function SpecializationList({
    specializations = [],
    expanded,
    onToggle,
}) {
    if (specializations.length === 0) {
        return (
            <span className="text-sm text-gray-400">
                No specializations
            </span>
        );
    }

    const visibleSpecializations = expanded
        ? specializations
        : specializations.slice(0, 2);

    const remainingCount = Math.max(
        specializations.length - 2,
        0
    );

    return (
        <div className="flex flex-col items-start gap-1">
            {visibleSpecializations.map((specialization) => (
                <span
                    key={specialization}
                    className="block max-w-full break-words rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium leading-4 text-blue-700"
                >
                    {specialization}
                </span>
            ))}

            {remainingCount > 0 && (
                <button
                    type="button"
                    onClick={onToggle}
                    className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:text-gray-800"
                >
                    {expanded ? (
                        <>
                            <ChevronUp size={13} />
                            Show less
                        </>
                    ) : (
                        <>
                            <ChevronDown size={13} />
                            +{remainingCount} more
                        </>
                    )}
                </button>
            )}
        </div>
    );
}

function normalizeTechnician(technician) {
    return {
        id: technician.id,
        name: technician.name || "-",
        profileId:
            technician.profileId ??
            technician.profile_id ??
            technician.id ??
            "-",
        availability:
            technician.availability || "Unavailable",
        workload:
            technician.workload ??
            technician.current_workload ??
            0,
        workloadLimit:
            technician.workloadLimit ??
            technician.workload_limit ??
            0,
        lastAssigned:
            technician.lastAssigned ??
            technician.last_assigned ??
            technician.last_assigned_at ??
            null,
        specializations:
            technician.specializations || [],
        specializationMatch:
            technician.specializationMatch ??
            technician.specialization_match ??
            false,
        workloadAvailable:
            technician.workloadAvailable ??
            technician.workload_available ??
            false,
        eligible: technician.eligible ?? false,
        selected: technician.selected ?? false,
    };
}

function formatAvailability(value) {
    if (!value) {
        return "Unavailable";
    }

    const normalized = String(value)
        .replaceAll("_", " ")
        .trim();

    return (
        normalized.charAt(0).toUpperCase() +
        normalized.slice(1)
    );
}

function formatLastAssigned(value) {
    if (!value) {
        return "Never assigned";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Never assigned";
    }

    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function formatWorkload(technician) {
    const workload = Number(technician.workload) || 0;
    const limit = Number(technician.workloadLimit) || 0;

    if (limit > 0) {
        return `${workload} / ${limit}`;
    }

    return `${workload}`;
}

function getAvailabilityClasses(availability) {
    const normalized = String(availability || "")
        .toLowerCase()
        .replaceAll("_", " ")
        .trim();

    if (normalized === "available") {
        return "border border-green-200 bg-green-50 text-green-700";
    }

    if (
        normalized === "busy" ||
        normalized === "unavailable"
    ) {
        return "border border-amber-200 bg-amber-50 text-amber-700";
    }

    return "border border-gray-200 bg-gray-100 text-gray-600";
}

function getEvaluationClasses(technician) {
    if (technician.selected) {
        return "bg-green-50 text-green-700";
    }

    if (technician.eligible) {
        return "bg-blue-50 text-blue-700";
    }

    return "bg-gray-100 text-gray-600";
}

function getStaticClassificationValue(method) {
    if (method === "machine_learning") {
        return {
            label: "Confidence",
            value: "92%",
        };
    }

    if (method === "rule_based") {
        return {
            label: "Score",
            value: "4 / 5",
        };
    }

    if (method === "manual_override") {
        return {
            label: "Review",
            value: "Reviewed",
        };
    }

    if (method === "ai_assisted") {
        return {
            label: "Confidence",
            value: "92%",
        };
    }

    return {
        label: "Evaluation",
        value: "Completed",
    };
}

export default function AutomatedProcessingModal({
    open,
    onClose,
    automation,
}) {
    const [
        expandedSpecializations,
        setExpandedSpecializations,
    ] = useState({});

    useEffect(() => {
        if (!open) {
            setExpandedSpecializations({});
        }
    }, [open]);

    const technicians = useMemo(() => {
        return (
            automation?.technicians_considered ||
            automation?.technicians ||
            []
        ).map(normalizeTechnician);
    }, [automation]);

    const toggleSpecializations = (technicianId) => {
        setExpandedSpecializations((current) => ({
            ...current,
            [technicianId]: !current[technicianId],
        }));
    };

    if (!open) {
        return null;
    }

    const processingStatus =
        automation?.status || "completed";

    const processingMethod =
        automation?.method || "rule_based";

    const statusLabel =
        processingStatus === "review_required"
            ? "Review Required"
            : "Completed";

    const methodLabel =
        processingMethod === "machine_learning"
            ? "Machine Learning"
            : processingMethod === "manual_override"
            ? "Manual Override"
            : processingMethod === "ai_assisted"
            ? "AI Assisted"
            : "Rule-Based";

    const classificationValue =
        getStaticClassificationValue(processingMethod);

    const assignment = automation?.assignment;

    const selectedTechnician =
        technicians.find(
            (technician) => technician.selected
        ) || null;

    const assignmentTechnician =
        assignment?.technician || selectedTechnician;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-5">
            <div className="flex max-h-[92vh] w-full max-w-7xl flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
                <div className="flex shrink-0 items-start justify-between border-b border-gray-200 px-4 py-4 sm:px-6">
                    <div className="flex min-w-0 items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#2563EB]">
                            <Workflow size={21} />
                        </div>

                        <div className="min-w-0">
                            <h2 className="text-base font-semibold text-gray-900 sm:text-lg">
                                Automated Processing
                            </h2>

                            <p className="mt-0.5 text-sm text-gray-500">
                                Review the automated classification,
                                priority, and technician assignment.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="ml-3 inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-md text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
                        aria-label="Close automated processing"
                    >
                        <X size={19} />
                    </button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto">
                    <div className="space-y-5 p-4 sm:p-6">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="rounded-lg border border-gray-200 bg-white p-4">
                                <div className="mb-2 flex items-center gap-2">
                                    <Workflow
                                        size={16}
                                        className="text-[#2563EB]"
                                    />

                                    <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                        Processing Status
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    {processingStatus ===
                                    "review_required" ? (
                                        <AlertCircle
                                            size={17}
                                            className="text-amber-600"
                                        />
                                    ) : (
                                        <CheckCircle2
                                            size={17}
                                            className="text-green-600"
                                        />
                                    )}

                                    <span
                                        className={`text-sm font-semibold ${
                                            processingStatus ===
                                            "review_required"
                                                ? "text-amber-700"
                                                : "text-green-700"
                                        }`}
                                    >
                                        {statusLabel}
                                    </span>
                                </div>
                            </div>

                            <div className="rounded-lg border border-gray-200 bg-white p-4">
                                <div className="mb-2 flex items-center gap-2">
                                    <BriefcaseBusiness
                                        size={16}
                                        className="text-[#2563EB]"
                                    />

                                    <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                        Processing Method
                                    </span>
                                </div>

                                <p className="text-sm font-semibold text-gray-900">
                                    {methodLabel}
                                </p>
                            </div>

                            <div className="rounded-lg border border-gray-200 bg-white p-4">
                                <div className="mb-2 flex items-center gap-2">
                                    <Workflow
                                        size={16}
                                        className="text-[#2563EB]"
                                    />

                                    <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                        Symptom Code
                                    </span>
                                </div>

                                <p className="break-words text-sm font-semibold text-gray-900">
                                    {automation?.symptom_code || "-"}
                                </p>
                            </div>

                            <div className="rounded-lg border border-gray-200 bg-white p-4">
                                <div className="mb-2 flex items-center gap-2">
                                    <BriefcaseBusiness
                                        size={16}
                                        className="text-[#2563EB]"
                                    />

                                    <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                        Department
                                    </span>
                                </div>

                                <p className="break-words text-sm font-semibold text-gray-900">
                                    {automation?.department || "-"}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                                <div className="flex items-center gap-2">
                                    <Users
                                        size={18}
                                        className="text-[#2563EB]"
                                    />

                                    <span className="text-sm font-medium text-gray-600">
                                        Department Candidates
                                    </span>
                                </div>

                                <p className="mt-2 text-2xl font-semibold text-gray-900">
                                    {automation?.department_candidates ??
                                        0}
                                </p>
                            </div>

                            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                                <div className="flex items-center gap-2">
                                    <UserCheck
                                        size={18}
                                        className="text-green-600"
                                    />

                                    <span className="text-sm font-medium text-gray-600">
                                        Available Candidates
                                    </span>
                                </div>

                                <p className="mt-2 text-2xl font-semibold text-gray-900">
                                    {automation?.available_candidates ??
                                        0}
                                </p>
                            </div>

                            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                                <div className="flex items-center gap-2">
                                    <BriefcaseBusiness
                                        size={18}
                                        className="text-[#2563EB]"
                                    />

                                    <span className="text-sm font-medium text-gray-600">
                                        Specialization Matches
                                    </span>
                                </div>

                                <p className="mt-2 text-2xl font-semibold text-gray-900">
                                    {automation?.exact_specialization_matches ??
                                        0}
                                </p>
                            </div>
                        </div>

                        <div className="rounded-lg border border-gray-200 bg-white">
                            <div className="border-b border-gray-200 px-4 py-4 sm:px-5">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                    <div>
                                        <h3 className="text-base font-semibold text-gray-900">
                                            Classification & Priority
                                        </h3>

                                        <p className="mt-0.5 text-sm text-gray-500">
                                            Values determined during
                                            automated ticket processing.
                                        </p>
                                    </div>

                                    {automation?.priority && (
                                        <span
                                            className={`inline-flex w-fit items-center rounded-md px-2.5 py-1 text-xs font-semibold ${
                                                priorityColor[
                                                    automation.priority
                                                ] ||
                                                "border border-gray-300 bg-gray-100 text-gray-700"
                                            }`}
                                        >
                                            {priorityLabel[
                                                automation.priority
                                            ] ||
                                                automation.priority}
                                        </span>
                                    )}
                                </div>

                                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                                    <div>
                                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                            Classification Method
                                        </p>

                                        <p className="mt-1 text-sm font-semibold text-gray-900">
                                            {methodLabel}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                            {
                                                classificationValue.label
                                            }
                                        </p>

                                        <p
                                            className={`mt-1 text-sm font-semibold ${
                                                processingMethod ===
                                                "machine_learning"
                                                    ? "text-[#2563EB]"
                                                    : processingMethod ===
                                                      "rule_based"
                                                    ? "text-gray-900"
                                                    : "text-gray-900"
                                            }`}
                                        >
                                            {
                                                classificationValue.value
                                            }
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                            Required Specialization
                                        </p>

                                        <p className="mt-1 break-words text-sm font-semibold text-gray-900">
                                            {automation?.required_specialization ||
                                                "-"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg border border-gray-200 bg-white">
                            <div className="flex flex-col gap-2 border-b border-gray-200 px-4 py-4 sm:px-5">
                                <h3 className="text-base font-semibold text-gray-900">
                                    Technician Evaluation
                                </h3>

                                <p className="text-sm text-gray-500">
                                    Technicians considered for the ticket
                                    based on department, specialization,
                                    availability, and workload.
                                </p>
                            </div>

                            {technicians.length === 0 ? (
                                <div className="flex min-h-[180px] items-center justify-center px-5 py-8">
                                    <div className="text-center">
                                        <Users
                                            size={30}
                                            className="mx-auto text-gray-300"
                                        />

                                        <p className="mt-3 text-sm font-medium text-gray-600">
                                            No technicians were considered.
                                        </p>

                                        <p className="mt-1 text-xs text-gray-400">
                                            There are no technician records
                                            available for this department.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="hidden overflow-hidden rounded-b-lg md:block">
                                        <div className="w-full overflow-x-auto">
                                            <table className="w-full min-w-[1000px] border-collapse">
                                                <thead>
                                                    <tr className="border-b border-gray-200 bg-gray-50">
                                                        <th className="w-[180px] min-w-[180px] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                            Technician
                                                        </th>

                                                        <th className="w-[260px] min-w-[260px] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                            Specializations
                                                        </th>

                                                        <th className="w-[100px] min-w-[100px] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                            Workload
                                                        </th>

                                                        <th className="w-[125px] min-w-[125px] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                            Last Assigned
                                                        </th>

                                                        <th className="w-[120px] min-w-[120px] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                            Availability
                                                        </th>

                                                        <th className="w-[180px] min-w-[180px] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                            Evaluation
                                                        </th>
                                                    </tr>
                                                </thead>

                                                <tbody className="divide-y divide-gray-200">
                                                    {technicians.map(
                                                        (technician) => (
                                                            <tr
                                                                key={
                                                                    technician.id
                                                                }
                                                                className={`align-top ${
                                                                    technician.selected
                                                                        ? "bg-green-50/50"
                                                                        : ""
                                                                }`}
                                                            >
                                                                <td className="px-4 py-3">
                                                                    <div className="min-w-[140px]">
                                                                        <p className="break-words text-sm font-medium text-gray-900">
                                                                            {
                                                                                technician.name
                                                                            }
                                                                        </p>

                                                                        <p className="mt-1 text-xs text-gray-500">
                                                                            Profile #
                                                                            {
                                                                                technician.profileId
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                </td>

                                                                <td className="w-[260px] min-w-[260px] px-4 py-3">
                                                                    <SpecializationList
                                                                        specializations={
                                                                            technician.specializations
                                                                        }
                                                                        expanded={
                                                                            !!expandedSpecializations[
                                                                                technician
                                                                                    .id
                                                                            ]
                                                                        }
                                                                        onToggle={() =>
                                                                            toggleSpecializations(
                                                                                technician.id
                                                                            )
                                                                        }
                                                                    />
                                                                </td>

                                                                <td className="px-4 py-3">
                                                                    <span className="whitespace-nowrap text-sm font-medium text-gray-900">
                                                                        {formatWorkload(
                                                                            technician
                                                                        )}
                                                                    </span>
                                                                </td>

                                                                <td className="px-4 py-3">
                                                                    <span className="whitespace-nowrap text-sm font-medium text-gray-900">
                                                                        {formatLastAssigned(
                                                                            technician.lastAssigned
                                                                        )}
                                                                    </span>
                                                                </td>

                                                                <td className="px-4 py-3">
                                                                    <span
                                                                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getAvailabilityClasses(
                                                                            technician.availability
                                                                        )}`}
                                                                    >
                                                                        {formatAvailability(
                                                                            technician.availability
                                                                        )}
                                                                    </span>
                                                                </td>

                                                                <td className="px-4 py-3">
                                                                    <span
                                                                        className={`inline-flex rounded-md px-2.5 py-1 text-xs font-medium ${getEvaluationClasses(
                                                                            technician
                                                                        )}`}
                                                                    >
                                                                        {technician.selected
                                                                            ? "Selected"
                                                                            : technician.eligible
                                                                            ? "Eligible"
                                                                            : technician.specializationMatch
                                                                            ? "Specialization match"
                                                                            : "Not eligible"}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        )
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    <div className="space-y-3 p-4 md:hidden">
                                        {technicians.map(
                                            (technician) => (
                                                <div
                                                    key={technician.id}
                                                    className={`rounded-lg border p-4 ${
                                                        technician.selected
                                                            ? "border-green-200 bg-green-50/50"
                                                            : "border-gray-200 bg-white"
                                                    }`}
                                                >
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="min-w-0">
                                                            <p className="break-words text-sm font-semibold text-gray-900">
                                                                {
                                                                    technician.name
                                                                }
                                                            </p>

                                                            <p className="mt-1 text-xs text-gray-500">
                                                                Profile #
                                                                {
                                                                    technician.profileId
                                                                }
                                                            </p>
                                                        </div>

                                                        <span
                                                            className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-medium ${getAvailabilityClasses(
                                                                technician.availability
                                                            )}`}
                                                        >
                                                            {formatAvailability(
                                                                technician.availability
                                                            )}
                                                        </span>
                                                    </div>

                                                    <div className="mt-4">
                                                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                            Specializations
                                                        </p>

                                                        <SpecializationList
                                                            specializations={
                                                                technician.specializations
                                                            }
                                                            expanded={
                                                                !!expandedSpecializations[
                                                                    technician
                                                                        .id
                                                                ]
                                                            }
                                                            onToggle={() =>
                                                                toggleSpecializations(
                                                                    technician.id
                                                                )
                                                            }
                                                        />
                                                    </div>

                                                    <div className="mt-4 grid grid-cols-2 gap-3 border-t border-gray-200 pt-4">
                                                        <div>
                                                            <p className="text-xs text-gray-500">
                                                                Workload
                                                            </p>

                                                            <p className="mt-1 text-sm font-medium text-gray-900">
                                                                {formatWorkload(
                                                                    technician
                                                                )}
                                                            </p>
                                                        </div>

                                                        <div>
                                                            <p className="text-xs text-gray-500">
                                                                Last Assigned
                                                            </p>

                                                            <p className="mt-1 break-words text-sm font-medium text-gray-900">
                                                                {formatLastAssigned(
                                                                    technician.lastAssigned
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="mt-4">
                                                        <p className="text-xs text-gray-500">
                                                            Evaluation
                                                        </p>

                                                        <span
                                                            className={`mt-1 inline-flex rounded-md px-2.5 py-1 text-xs font-medium ${getEvaluationClasses(
                                                                technician
                                                            )}`}
                                                        >
                                                            {technician.selected
                                                                ? "Selected"
                                                                : technician.eligible
                                                                ? "Eligible"
                                                                : technician.specializationMatch
                                                                ? "Specialization match"
                                                                : "Not eligible"}
                                                        </span>
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="rounded-lg border border-gray-200 bg-white">
                            <div className="border-b border-gray-200 px-4 py-4 sm:px-5">
                                <div className="flex items-center gap-2">
                                    <UserCheck
                                        size={18}
                                        className="text-[#2563EB]"
                                    />

                                    <h3 className="text-base font-semibold text-gray-900">
                                        Assignment Result
                                    </h3>
                                </div>
                            </div>

                            <div className="p-4 sm:p-5">
                                {assignment?.status === "assigned" &&
                                assignmentTechnician ? (
                                    <div className="flex flex-col gap-4 rounded-lg border border-green-200 bg-green-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex min-w-0 items-start gap-3">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700">
                                                <CheckCircle2
                                                    size={18}
                                                />
                                            </div>

                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-green-800">
                                                    Automatically Assigned
                                                </p>

                                                <p className="mt-1 break-words text-sm text-green-700">
                                                    {
                                                        assignmentTechnician.name
                                                    }
                                                </p>

                                                <p className="mt-1 text-xs text-green-600">
                                                    Workload:{" "}
                                                    {
                                                        assignmentTechnician.current_workload
                                                    }{" "}
                                                    /{" "}
                                                    {
                                                        assignmentTechnician.workload_limit
                                                    }
                                                </p>
                                            </div>
                                        </div>

                                        <span className="inline-flex w-fit shrink-0 rounded-md border border-green-200 bg-white px-2.5 py-1 text-xs font-medium text-green-700">
                                            Assigned
                                        </span>
                                    </div>
                                ) : (
                                    <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
                                        <AlertCircle
                                            size={19}
                                            className="mt-0.5 shrink-0 text-amber-600"
                                        />

                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-amber-800">
                                                No Technician Assigned
                                            </p>

                                            <p className="mt-1 break-words text-sm text-amber-700">
                                                {assignment?.reason ||
                                                    "No technician was assigned to this ticket."}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex shrink-0 justify-end border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex h-10 cursor-pointer items-center justify-center rounded-md bg-[#2563EB] px-5 text-sm font-medium text-white transition-colors hover:bg-[#1D4ED8]"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}