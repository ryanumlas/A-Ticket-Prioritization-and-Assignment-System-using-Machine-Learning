import { useEffect, useState } from "react";
import {
    Workflow,
    X,
    CheckCircle2,
    AlertCircle,
    Users,
    UserCheck,
    Clock3,
    BriefcaseBusiness,
    ChevronDown,
    ChevronUp,
} from "lucide-react";

const technicians = [
    {
        id: 5,
        name: "Janine Adores",
        profileId: 1,
        availability: "available",
        workload: 2,
        workloadLimit: 5,
        lastAssigned: "September 21, 2026, 2:06 PM",
        specializations: ["Network Infrastructure"],
        specializationMatch: false,
    },
    {
        id: 17,
        name: "Janine Adore",
        profileId: 3,
        availability: "available",
        workload: 0,
        workloadLimit: 5,
        lastAssigned: null,
        specializations: [],
        specializationMatch: false,
    },
    {
        id: 20,
        name: "Tristan Espiritu",
        profileId: 6,
        availability: "available",
        workload: 0,
        workloadLimit: 5,
        lastAssigned: "September 22, 2026, 3:48 PM",
        specializations: [
            "Network Infrastructure",
            "Operating Systems",
            "Remote Access Support",
            "Hardware Support",
            "Business Applications",
        ],
        specializationMatch: false,
    },
    {
        id: 21,
        name: "Mark Alcorin",
        profileId: 7,
        availability: "available",
        workload: 1,
        workloadLimit: 5,
        lastAssigned: "September 19, 2026, 3:17 PM",
        specializations: [
            "Network Infrastructure",
            "Operating Systems",
            "Remote Access Support",
            "Hardware Support",
            "Database Support",
        ],
        specializationMatch: false,
    },
    {
        id: 22,
        name: "Jhunty Noze",
        profileId: 8,
        availability: "available",
        workload: 1,
        workloadLimit: 5,
        lastAssigned: "September 21, 2026, 9:38 PM",
        specializations: [
            "Network Infrastructure",
            "Operating Systems",
        ],
        specializationMatch: false,
    },
    {
        id: 23,
        name: "Christian Moon",
        profileId: 9,
        availability: "available",
        workload: 0,
        workloadLimit: 5,
        lastAssigned: null,
        specializations: ["Operating Systems"],
        specializationMatch: false,
    },
];

const requiredSpecialization = "Remote Access Support";

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
        : specializations.slice(0, 3);

    const remainingCount = Math.max(
        specializations.length - 3,
        0
    );

    return (
        <div className="flex flex-wrap items-center gap-1.5">
            {visibleSpecializations.map(
                (specialization) => (
                    <span
                        key={specialization}
                        className="max-w-full break-words rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700"
                    >
                        {specialization}
                    </span>
                )
            )}

            {remainingCount > 0 && (
                <button
                    type="button"
                    onClick={onToggle}
                    className="inline-flex cursor-pointer items-center gap-1 rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-800"
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

export default function AutomatedProcessingModal({
    open,
    onClose,
}) {
    const [showAllTechnicians, setShowAllTechnicians] =
        useState(false);

    const [
        expandedSpecializations,
        setExpandedSpecializations,
    ] = useState({});

    useEffect(() => {
        if (!open) {
            setShowAllTechnicians(false);
            setExpandedSpecializations({});
            return;
        }

        const handleEscape = (event) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        document.addEventListener(
            "keydown",
            handleEscape
        );

        return () =>
            document.removeEventListener(
                "keydown",
                handleEscape
            );
    }, [open, onClose]);

    useEffect(() => {
        document.body.style.overflow = open
            ? "hidden"
            : "";

        return () => {
            document.body.style.overflow = "";
        };
    }, [open]);

    if (!open) {
        return null;
    }

    const departmentCandidates =
        technicians.length;

    const availableCandidates =
        technicians.filter(
            (technician) =>
                technician.availability ===
                "available"
        ).length;

    const exactSpecializationMatches =
        technicians.filter(
            (technician) =>
                technician.specializationMatch
        ).length;

    const eligibleCandidates =
        technicians.filter(
            (technician) =>
                technician.availability ===
                    "available" &&
                technician.specializationMatch &&
                technician.workload <
                    technician.workloadLimit
        ).length;

    const visibleTechnicians =
        showAllTechnicians
            ? technicians
            : technicians.filter(
                  (technician) =>
                      technician.specializationMatch
              );

    const toggleSpecializations = (
        technicianId
    ) => {
        setExpandedSpecializations(
            (current) => ({
                ...current,
                [technicianId]:
                    !current[technicianId],
            })
        );
    };

    const getAvailabilityClasses = (
        availability
    ) => {
        if (availability === "available") {
            return "bg-green-50 text-green-700";
        }

        if (availability === "busy") {
            return "bg-amber-50 text-amber-700";
        }

        return "bg-gray-100 text-gray-600";
    };

    const getMatchClasses = (isMatch) => {
        if (isMatch) {
            return "bg-green-50 text-green-700";
        }

        return "bg-gray-100 text-gray-600";
    };

    const formatWorkload = (technician) => {
        return `${technician.workload} / ${technician.workloadLimit}`;
    };

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 p-3 sm:p-5">
            <div
                className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
                role="dialog"
                aria-modal="true"
                aria-labelledby="automated-processing-title"
            >
                {/* Header */}
                <div className="flex shrink-0 items-start justify-between gap-4 border-b border-gray-200 px-4 py-4 sm:px-6">
                    <div className="flex min-w-0 items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                            <Workflow
                                size={20}
                                className="text-[#2563EB]"
                            />
                        </div>

                        <div className="min-w-0">
                            <h2
                                id="automated-processing-title"
                                className="text-base font-semibold text-gray-900 sm:text-lg"
                            >
                                Automated Processing
                            </h2>

                            <div className="mt-1 flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                                    <CheckCircle2
                                        size={13}
                                    />
                                    Automatically
                                    Processed
                                </span>
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close modal"
                        className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="min-h-0 flex-1 overflow-y-auto">
                    <div className="space-y-6 p-4 sm:p-6">
                        {/* Processing Details */}
                        <section>
                            <div className="mb-3">
                                <h1 className="text-lg font-semibold text-gray-900 sm:text-lg">
                                    Processing Details
                                </h1>

                                <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                                    Information produced by
                                    the automated ticket
                                    processing workflow.
                                </p>

                                <div className="mt-4 flex flex-col gap-2 rounded-lg border border-blue-200 bg-blue-50/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-xs font-medium uppercase tracking-wide text-blue-700">
                                            Automation Method
                                        </p>

                                        <p className="mt-1 text-sm font-semibold text-gray-900 sm:text-base">
                                            Automated
                                            Rule-Based
                                            Processing
                                        </p>
                                    </div>

                                    <div className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-200">
                                        <CheckCircle2
                                            size={14}
                                        />
                                        Automated
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-hidden rounded-lg border border-gray-200">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                                    <div className="border-b border-gray-200 bg-white p-4 sm:border-r">
                                        <p className="text-xs text-gray-500">
                                            Symptom Classification
                                        </p>

                                        <p className="mt-1 text-sm font-medium text-gray-900">
                                            Network Connectivity
                                        </p>
                                    </div>

                                    <div className="border-b border-gray-200 bg-white p-4 lg:border-r">
                                        <p className="text-xs text-gray-500">
                                            Category
                                        </p>

                                        <p className="mt-1 text-sm font-medium text-gray-900">
                                            Network &
                                            Infrastructure
                                        </p>
                                    </div>

                                    <div className="border-b border-gray-200 bg-white p-4 sm:border-r lg:border-r-0">
                                        <p className="text-xs text-gray-500">
                                            Priority
                                        </p>

                                        <div className="mt-1 flex items-center gap-2">
                                            <span className="rounded-md bg-orange-50 px-2 py-1 text-xs font-semibold text-orange-700">
                                                P2
                                            </span>

                                            <span className="text-sm font-medium text-gray-900">
                                                High
                                            </span>
                                        </div>
                                    </div>

                                    <div className="border-b border-gray-200 bg-white p-4 sm:border-r lg:border-b-0">
                                        <p className="text-xs text-gray-500">
                                            Department Routing
                                        </p>

                                        <p className="mt-1 text-sm font-medium text-gray-900">
                                            Network &
                                            Infrastructure
                                            Support
                                        </p>
                                    </div>

                                    <div className="border-b border-gray-200 bg-white p-4 lg:border-b-0 lg:border-r">
                                        <p className="text-xs text-gray-500">
                                            Processing Time
                                        </p>

                                        <div className="mt-1 flex items-center gap-2">
                                            <Clock3
                                                size={15}
                                                className="text-gray-400"
                                            />

                                            <span className="text-sm font-medium text-gray-900">
                                                1.8 seconds
                                            </span>
                                        </div>
                                    </div>

                                    <div className="bg-white p-4">
                                        <p className="text-xs text-gray-500">
                                            Processed At
                                        </p>

                                        <p className="mt-1 text-sm font-medium text-gray-900">
                                            September 25,
                                            2026 10:42 AM
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Processing Summary */}
                        <section className="rounded-lg border border-blue-100 bg-blue-50/60 p-4">
                            <div className="flex items-start gap-3">
                                <Workflow
                                    size={18}
                                    className="mt-0.5 shrink-0 text-[#2563EB]"
                                />

                                <div className="min-w-0">
                                    <h3 className="text-sm font-semibold text-gray-900">
                                        Processing Summary
                                    </h3>

                                    <p className="mt-1 text-sm leading-6 text-gray-600">
                                        The ticket was
                                        automatically
                                        classified and
                                        routed to the
                                        Network &
                                        Infrastructure
                                        Support
                                        department.
                                        Technician
                                        assignment was
                                        evaluated using
                                        the configured
                                        availability,
                                        workload, and
                                        specialization
                                        rules.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Assignment Evaluation */}
                        <section>
                            <div className="mb-3">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Assignment Evaluation
                                </h3>

                                <p className="mt-1 text-xs text-gray-500">
                                    Technician eligibility
                                    was evaluated against
                                    the ticket's required
                                    specialization.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                                <div className="rounded-lg border border-gray-200 bg-white p-4">
                                    <div className="flex items-center gap-2">
                                        <Users
                                            size={16}
                                            className="text-[#2563EB]"
                                        />

                                        <span className="text-xs text-gray-500">
                                            Department
                                            Candidates
                                        </span>
                                    </div>

                                    <p className="mt-2 text-xl font-semibold text-gray-900">
                                        {
                                            departmentCandidates
                                        }
                                    </p>
                                </div>

                                <div className="rounded-lg border border-gray-200 bg-white p-4">
                                    <div className="flex items-center gap-2">
                                        <UserCheck
                                            size={16}
                                            className="text-green-600"
                                        />

                                        <span className="text-xs text-gray-500">
                                            Available
                                        </span>
                                    </div>

                                    <p className="mt-2 text-xl font-semibold text-gray-900">
                                        {
                                            availableCandidates
                                        }
                                    </p>
                                </div>

                                <div className="rounded-lg border border-gray-200 bg-white p-4">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2
                                            size={16}
                                            className="text-green-600"
                                        />

                                        <span className="text-xs text-gray-500">
                                            Exact
                                            Specialization
                                        </span>
                                    </div>

                                    <p className="mt-2 text-xl font-semibold text-gray-900">
                                        {
                                            exactSpecializationMatches
                                        }
                                    </p>
                                </div>

                                <div className="rounded-lg border border-gray-200 bg-white p-4">
                                    <div className="flex items-center gap-2">
                                        <BriefcaseBusiness
                                            size={16}
                                            className="text-[#2563EB]"
                                        />

                                        <span className="text-xs text-gray-500">
                                            Eligible
                                        </span>
                                    </div>

                                    <p className="mt-2 text-xl font-semibold text-gray-900">
                                        {
                                            eligibleCandidates
                                        }
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Technicians Considered */}
                        <section>
                            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900">
                                        Technicians
                                        Considered
                                    </h3>

                                    <p className="mt-1 text-xs text-gray-500">
                                        {showAllTechnicians
                                            ? `Showing all ${technicians.length} evaluated technicians.`
                                            : exactSpecializationMatches >
                                              0
                                            ? `Showing ${exactSpecializationMatches} eligible specialization match${
                                                  exactSpecializationMatches ===
                                                  1
                                                      ? ""
                                                      : "es"
                                              }.`
                                            : "No eligible technicians found."}
                                    </p>
                                </div>

                                {technicians.length >
                                    0 && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowAllTechnicians(
                                                (current) =>
                                                    !current
                                            )
                                        }
                                        className="inline-flex h-9 w-fit shrink-0 cursor-pointer items-center gap-2 rounded-md border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                                    >
                                        {showAllTechnicians ? (
                                            <>
                                                <ChevronUp
                                                    size={
                                                        16
                                                    }
                                                />
                                                Hide evaluated
                                                technicians
                                            </>
                                        ) : (
                                            <>
                                                <ChevronDown
                                                    size={
                                                        16
                                                    }
                                                />
                                                View all
                                                evaluated
                                                technicians
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>

                            {exactSpecializationMatches ===
                                0 &&
                                !showAllTechnicians && (
                                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                                        <div className="flex items-start gap-3">
                                            <AlertCircle
                                                size={19}
                                                className="mt-0.5 shrink-0 text-amber-600"
                                            />

                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-amber-900">
                                                    No eligible
                                                    technicians
                                                    found.
                                                </p>

                                                <p className="mt-1 text-sm leading-5 text-amber-800">
                                                    No
                                                    technician
                                                    matched
                                                    the
                                                    required
                                                    specialization:
                                                </p>

                                                <span className="mt-2 inline-flex max-w-full break-words rounded-md bg-white px-2.5 py-1.5 text-xs font-semibold text-amber-800 ring-1 ring-inset ring-amber-200">
                                                    {
                                                        requiredSpecialization
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                            {/* Desktop / Tablet */}
                            {showAllTechnicians &&
                                visibleTechnicians.length >
                                    0 && (
                                    <div className="hidden overflow-hidden rounded-lg border border-gray-200 md:block">
                                        <div className="w-full overflow-x-auto">
                                            <table className="w-full min-w-[950px] border-collapse">
                                                <thead>
                                                    <tr className="border-b border-gray-200 bg-gray-50">
                                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                            Technician
                                                        </th>

                                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                            Specializations
                                                        </th>

                                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                            Workload
                                                        </th>

                                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                            Availability
                                                        </th>

                                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                            Last Assigned
                                                        </th>

                                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                            Evaluation
                                                        </th>
                                                    </tr>
                                                </thead>

                                                <tbody className="divide-y divide-gray-200">
                                                    {visibleTechnicians.map(
                                                        (
                                                            technician
                                                        ) => (
                                                            <tr
                                                                key={
                                                                    technician.id
                                                                }
                                                                className="align-top"
                                                            >
                                                                <td className="px-4 py-4">
                                                                    <div className="min-w-[150px]">
                                                                        <p className="text-sm font-medium text-gray-900">
                                                                            {
                                                                                technician.name
                                                                            }
                                                                        </p>

                                                                        <p className="mt-1 text-xs text-gray-500">
                                                                            Profile
                                                                            #
                                                                            {
                                                                                technician.profileId
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                </td>

                                                                <td className="px-4 py-4">
                                                                    <div className="max-w-[340px]">
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
                                                                </td>

                                                                <td className="px-4 py-4">
                                                                    <span className="text-sm font-medium text-gray-900">
                                                                        {formatWorkload(
                                                                            technician
                                                                        )}
                                                                    </span>
                                                                </td>

                                                                <td className="px-4 py-4">
                                                                    <span
                                                                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getAvailabilityClasses(
                                                                            technician.availability
                                                                        )}`}
                                                                    >
                                                                        {technician.availability
                                                                            .charAt(
                                                                                0
                                                                            )
                                                                            .toUpperCase() +
                                                                            technician.availability.slice(
                                                                                1
                                                                            )}
                                                                    </span>
                                                                </td>

                                                                <td className="px-4 py-4">
                                                                    <span className="whitespace-nowrap text-sm text-gray-600">
                                                                        {technician.lastAssigned ||
                                                                            "Never"}
                                                                    </span>
                                                                </td>

                                                                <td className="px-4 py-4">
                                                                    <span
                                                                        className={`inline-flex rounded-md px-2.5 py-1 text-xs font-medium ${getMatchClasses(
                                                                            technician.specializationMatch
                                                                        )}`}
                                                                    >
                                                                        {technician.specializationMatch
                                                                            ? "Exact match"
                                                                            : "Not an exact match"}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        )
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                            {/* Mobile */}
                            {showAllTechnicians &&
                                visibleTechnicians.length >
                                    0 && (
                                    <div className="space-y-3 md:hidden">
                                        {visibleTechnicians.map(
                                            (
                                                technician
                                            ) => (
                                                <div
                                                    key={
                                                        technician.id
                                                    }
                                                    className="rounded-lg border border-gray-200 bg-white p-4"
                                                >
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="min-w-0">
                                                            <h4 className="break-words text-sm font-semibold text-gray-900">
                                                                {
                                                                    technician.name
                                                                }
                                                            </h4>

                                                            <p className="mt-1 text-xs text-gray-500">
                                                                Profile
                                                                #
                                                                {
                                                                    technician.profileId
                                                                }
                                                            </p>
                                                        </div>

                                                        <span
                                                            className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${getAvailabilityClasses(
                                                                technician.availability
                                                            )}`}
                                                        >
                                                            {technician.availability
                                                                .charAt(
                                                                    0
                                                                )
                                                                .toUpperCase() +
                                                                technician.availability.slice(
                                                                    1
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

                                                    <div className="mt-4 grid grid-cols-1 gap-3 border-t border-gray-100 pt-3 sm:grid-cols-2">
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
                                                                {technician.lastAssigned ||
                                                                    "Never"}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="mt-3">
                                                        <span
                                                            className={`inline-flex max-w-full rounded-md px-2.5 py-1 text-xs font-medium ${getMatchClasses(
                                                                technician.specializationMatch
                                                            )}`}
                                                        >
                                                            {technician.specializationMatch
                                                                ? "✓ Exact specialization match"
                                                                : "Not an exact match"}
                                                        </span>
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>
                                )}
                        </section>

                        {/* Assignment Result */}
                        <section>
                            <div className="mb-3">
                                <h3 className="text-sm font-semibold text-gray-900">
                                    Assignment Result
                                </h3>
                            </div>

                            {eligibleCandidates > 0 ? (
                                <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                                    <div className="flex items-start gap-3">
                                        <CheckCircle2
                                            size={20}
                                            className="mt-0.5 shrink-0 text-green-600"
                                        />

                                        <div>
                                            <p className="text-sm font-semibold text-green-900">
                                                Technician assignment
                                                completed.
                                            </p>

                                            <p className="mt-1 text-sm text-green-800">
                                                An eligible technician
                                                was found using the
                                                configured assignment
                                                rules.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle
                                            size={20}
                                            className="mt-0.5 shrink-0 text-red-600"
                                        />

                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-red-900">
                                                No Technician Assigned
                                            </p>

                                            <p className="mt-1 text-sm leading-5 text-red-800">
                                                No eligible technician
                                                was found for the
                                                required specialization.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </section>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-gray-200 bg-gray-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-end sm:px-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-10 w-full cursor-pointer items-center justify-center rounded-md bg-[#2563EB] px-4 text-sm font-medium text-white transition-colors hover:bg-[#1D4ED8] sm:w-auto"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}