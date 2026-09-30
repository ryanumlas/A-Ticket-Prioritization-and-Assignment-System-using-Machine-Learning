import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
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

import { formatDate } from "../utils/formatDate";

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
        <div className="flex flex-col items-start gap-0.5">
            <AnimatePresence initial={false}>
                {visibleSpecializations.map(
                    (specialization, index) => (
                        <motion.span
                            key={specialization}
                            initial={{
                                opacity: 0,
                                y: 4,
                            }}
                            animate={{
                                opacity: 1,
                                y: 0,
                            }}
                            exit={{
                                opacity: 0,
                                y: -4,
                            }}
                            transition={{
                                duration: 0.16,
                                delay: index * 0.02,
                            }}
                            className="block max-w-full break-words rounded-md bg-blue-50 px-2 py-1 text-xs font-medium leading-4 text-blue-700"
                        >
                            {specialization}
                        </motion.span>
                    )
                )}
            </AnimatePresence>

            {remainingCount > 0 && (
                <motion.button
                    type="button"
                    onClick={onToggle}
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex cursor-pointer items-center gap-0.5 rounded-md border border-gray-200 bg-gray-50 px-1.5 py-1 text-[10px] font-medium text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:text-gray-800"
                >
                    <AnimatePresence
                        mode="wait"
                        initial={false}
                    >
                        {expanded ? (
                            <motion.span
                                key="less"
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
                                className="inline-flex items-center gap-0.5"
                            >
                                <ChevronUp size={11} />
                                Show less
                            </motion.span>
                        ) : (
                            <motion.span
                                key="more"
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
                                className="inline-flex items-center gap-0.5"
                            >
                                <ChevronDown size={11} />
                                +{remainingCount} more
                            </motion.span>
                        )}
                    </AnimatePresence>
                </motion.button>
            )}
        </div>
    );
}

function MatchedKeywordList({
    matchedKeywords = [],
    expanded,
    onToggle,
}) {
    const visibleKeywords = expanded
        ? matchedKeywords
        : matchedKeywords.slice(0, 5);

    const remainingCount = Math.max(
        matchedKeywords.length - 5,
        0
    );

    return (
        <div className="mt-4">
            <div className="hidden overflow-hidden rounded-lg border border-gray-200 sm:block">
                <div className="grid grid-cols-[minmax(0,1fr)_140px_80px] border-b border-gray-200 bg-gray-50 px-3 py-2.5 lg:grid-cols-[minmax(0,1fr)_160px_100px]">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                        Matched Keyword
                    </p>

                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                        Symptom Code
                    </p>

                    <p className="text-right text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                        Weight
                    </p>
                </div>

                <div
                    className={`divide-y divide-gray-200 ${
                        expanded && matchedKeywords.length > 10
                            ? "max-h-[360px] overflow-y-auto"
                            : ""
                    } [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-gray-300`}
                >
                    <AnimatePresence initial={false}>
                        {visibleKeywords.map(
                            (match, index) => (
                                <motion.div
                                    key={`${match.keyword}-${match.symptom_code}-${index}`}
                                    initial={{
                                        opacity: 0,
                                        y: 6,
                                    }}
                                    animate={{
                                        opacity: 1,
                                        y: 0,
                                    }}
                                    exit={{
                                        opacity: 0,
                                        y: -6,
                                    }}
                                    transition={{
                                        duration: 0.18,
                                        delay:
                                            index * 0.015,
                                    }}
                                    className="grid grid-cols-[minmax(0,1fr)_140px_80px] items-center gap-2 px-3 py-3 lg:grid-cols-[minmax(0,1fr)_160px_100px]"
                                >
                                    <div className="min-w-0">
                                        <p
                                            className="break-words text-sm font-medium text-gray-900"
                                            title={match.keyword}
                                        >
                                            {match.keyword}
                                        </p>
                                    </div>

                                    <div className="min-w-0">
                                        <span className="inline-flex max-w-full break-all rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                                            {match.symptom_code ||
                                                "-"}
                                        </span>
                                    </div>

                                    <div className="text-right">
                                        <span className="text-sm font-semibold text-gray-900">
                                            +
                                            {Number(
                                                match.weight
                                            ) || 0}
                                        </span>
                                    </div>
                                </motion.div>
                            )
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <div className="space-y-2 sm:hidden">
                <div
                    className={`space-y-2 ${
                        expanded &&
                        matchedKeywords.length > 10
                            ? "max-h-[360px] overflow-y-auto pr-1"
                            : ""
                    } [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-gray-300`}
                >
                    <AnimatePresence initial={false}>
                        {visibleKeywords.map(
                            (match, index) => (
                                <motion.div
                                    key={`${match.keyword}-${match.symptom_code}-${index}`}
                                    initial={{
                                        opacity: 0,
                                        y: 6,
                                    }}
                                    animate={{
                                        opacity: 1,
                                        y: 0,
                                    }}
                                    exit={{
                                        opacity: 0,
                                        y: -6,
                                    }}
                                    transition={{
                                        duration: 0.18,
                                        delay:
                                            index * 0.015,
                                    }}
                                    className="rounded-lg border border-gray-200 bg-white p-3"
                                >
                                    <div className="flex min-w-0 items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="break-words text-sm font-medium text-gray-900">
                                                {match.keyword}
                                            </p>
                                        </div>

                                        <span className="shrink-0 text-sm font-semibold text-gray-900">
                                            +
                                            {Number(
                                                match.weight
                                            ) || 0}
                                        </span>
                                    </div>

                                    <div className="mt-2">
                                        <span className="inline-flex max-w-full break-all rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                                            {match.symptom_code ||
                                                "-"}
                                        </span>
                                    </div>
                                </motion.div>
                            )
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {remainingCount > 0 && (
                <motion.div
                    className="mt-3 flex justify-center"
                    initial={{
                        opacity: 0,
                    }}
                    animate={{
                        opacity: 1,
                    }}
                >
                    <motion.button
                        type="button"
                        onClick={onToggle}
                        whileHover={{ y: -1 }}
                        whileTap={{ scale: 0.97 }}
                        className="inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800"
                    >
                        <AnimatePresence
                            mode="wait"
                            initial={false}
                        >
                            {expanded ? (
                                <motion.span
                                    key="less"
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
                                    className="inline-flex items-center gap-1.5"
                                >
                                    <ChevronUp size={14} />
                                    Show less
                                </motion.span>
                            ) : (
                                <motion.span
                                    key="more"
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
                                    className="inline-flex items-center gap-1.5"
                                >
                                    <ChevronDown size={14} />
                                    +{remainingCount} more keywords
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </motion.button>
                </motion.div>
            )}
        </div>
    );
}

function normalizeTechnician(technician) {
    return {
        id: technician.id,
        name: technician.name || "-",

        availability:
            technician.availability ||
            "Unavailable",

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

        eligible:
            technician.eligible ?? false,

        selected:
            technician.selected ?? false,
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

function formatWorkload(technician) {
    const workload =
        Number(technician.workload) || 0;

    const limit =
        Number(technician.workloadLimit) || 0;

    if (limit > 0) {
        return `${workload} / ${limit}`;
    }

    return `${workload}`;
}

function getAvailabilityClasses(availability) {
    const normalized = String(
        availability || ""
    )
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
        return "border border-green-200 bg-green-50 text-green-700";
    }

    if (technician.eligible) {
        return "border border-blue-200 bg-blue-50 text-blue-700";
    }

    return "border border-gray-200 bg-gray-100 text-gray-600";
}

function getClassificationValue(
    method,
    classification
) {
    if (method === "machine_learning") {
        const confidence = Number(
            classification?.confidence
        );

        return {
            label: "Confidence",
            value: Number.isFinite(confidence)
                ? `${(confidence * 100).toFixed(0)}%`
                : "-",
        };
    }

    if (method === "rule_based") {
        const score = Number(
            classification?.rule_based_score
        );

        return {
            label: "Match Score",
            value: Number.isFinite(score)
                ? score
                : "-",
        };
    }

    if (method === "manual_override") {
        return {
            label: "Review",
            value: "Reviewed",
        };
    }

    if (method === "ai_assisted") {
        const confidence = Number(
            classification?.confidence
        );

        return {
            label: "Confidence",
            value: Number.isFinite(confidence)
                ? `${(confidence * 100).toFixed(0)}%`
                : "-",
        };
    }

    return {
        label: "Evaluation",
        value: "Completed",
    };
}

function formatAffectedScope(value) {
    if (!value) {
        return "-";
    }

    const labels = {
        individual: "Individual",
        group: "Group",
        department: "Department",
        organization_wide: "Organization Wide",
    };

    return (
        labels[value] ||
        String(value)
            .replaceAll("_", " ")
            .replace(/\b\w/g, (letter) =>
                letter.toUpperCase()
            )
    );
}

function formatBoolean(value) {
    if (value === true) {
        return "Yes";
    }

    if (value === false) {
        return "No";
    }

    return "-";
}

function getBooleanBadgeClasses(value) {
    if (value === true) {
        return "border border-amber-200 bg-amber-50 text-amber-700";
    }

    if (value === false) {
        return "border border-gray-200 bg-gray-50 text-gray-600";
    }

    return "border border-gray-200 bg-gray-100 text-gray-500";
}

function getPriorityBadgeClasses(priority) {
    return (
        priorityColor[priority] ||
        "border border-gray-300 bg-gray-100 text-gray-700"
    );
}

function getPriorityLabel(priority) {
    return (
        priorityLabel[priority] ||
        priority ||
        "-"
    );
}

function getBusinessCriticalExplanation(value) {
    if (value === true) {
        return "The ticket affects a business-critical service or process and is flagged as an important operational consideration.";
    }

    if (value === false) {
        return "The ticket was not identified as affecting a business-critical service or process.";
    }

    return "Business criticality was not available in the automated assessment.";
}

function getTimeCriticalExplanation(value) {
    if (value === true) {
        return "The ticket has a time-sensitive condition and is flagged as requiring prompt attention.";
    }

    if (value === false) {
        return "The ticket was not identified as having a time-critical condition.";
    }

    return "Time criticality was not available in the automated assessment.";
}

function getPriorityDecisionText(
    basePriority,
    affectedScope,
    contextualPriority,
    finalPriority
) {
    if (!finalPriority) {
        return "The final priority could not be determined.";
    }

    if (
        basePriority &&
        contextualPriority &&
        basePriority === contextualPriority
    ) {
        return `The ${formatAffectedScope(
            affectedScope
        ).toLowerCase()} scope results in the same priority as the symptom's base priority.`;
    }

    if (
        basePriority &&
        contextualPriority &&
        finalPriority === contextualPriority
    ) {
        return "The affected scope requires a more urgent priority, so the contextual priority becomes the final priority.";
    }

    if (
        basePriority &&
        contextualPriority &&
        finalPriority === basePriority
    ) {
        return "The symptom's base priority remains more urgent than the contextual priority, so the base priority is retained.";
    }

    return "The final priority is determined by comparing the symptom's base priority with the contextual priority.";
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

    const [
        expandedKeywords,
        setExpandedKeywords,
    ] = useState(false);

    useEffect(() => {
        if (!open) {
            setExpandedSpecializations({});
            setExpandedKeywords(false);
        }
    }, [open]);

    const technicians = useMemo(() => {
        return (
            automation?.technicians_considered ||
            automation?.technicians ||
            []
        ).map(normalizeTechnician);
    }, [automation]);

    const matchedKeywords = useMemo(() => {
        return Array.isArray(
            automation?.classification?.matched_keywords
        )
            ? automation.classification.matched_keywords
            : [];
    }, [automation]);

    const ruleBasedThreshold = 15;

    const calculatedRuleBasedScore = Number(
        automation?.classification?.rule_based_score
    );

    const ruleBasedScore = Number.isFinite(
        calculatedRuleBasedScore
    )
        ? calculatedRuleBasedScore
        : 0;

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

    const toggleKeywords = () => {
        setExpandedKeywords(
            (current) => !current
        );
    };

    const processingStatus =
        automation?.status || "completed";

    const processingMethod =
        automation?.method || "rule_based";

    const statusLabel =
        processingStatus === "review_required"
            ? "Review Required"
            : "Completed";

    const methodLabel =
        processingMethod ===
        "machine_learning"
            ? "Machine Learning"
            : processingMethod ===
              "manual_override"
            ? "Manual Override"
            : processingMethod ===
              "ai_assisted"
            ? "AI Assisted"
            : "Rule-Based";

    const classificationValue =
        getClassificationValue(
            processingMethod,
            automation?.classification
        );

    const assignment =
        automation?.assignment;

    const selectedTechnician =
        technicians.find(
            (technician) =>
                technician.selected
        ) || null;

    const assignmentTechnician =
        assignment?.technician ||
        selectedTechnician;

    const priorityAssessment =
        automation?.priority_assessment || null;

    const basePriority =
        priorityAssessment?.base_priority ||
        null;

    const affectedScope =
        priorityAssessment?.affected_scope ||
        null;

    const businessCritical =
        priorityAssessment?.business_critical ??
        automation?.business_critical ??
        automation?.ai_analysis?.business_critical ??
        null;

    const timeCritical =
        priorityAssessment?.time_critical ??
        automation?.time_critical ??
        automation?.ai_analysis?.is_time_critical ??
        null;

    const contextualPriority =
        priorityAssessment?.contextual_priority ||
        null;

    const finalPriority =
        priorityAssessment?.final_priority ||
        automation?.priority ||
        null;

    const priorityDecisionText =
        getPriorityDecisionText(
            basePriority,
            affectedScope,
            contextualPriority,
            finalPriority
        );

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-2 sm:p-4"
                >
                    <motion.div
                        initial={{
                            opacity: 0,
                            y: 14,
                            scale: 0.985,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                            scale: 1,
                        }}
                        exit={{
                            opacity: 0,
                            y: 8,
                            scale: 0.985,
                        }}
                        transition={{
                            duration: 0.22,
                            ease: "easeOut",
                        }}
                        className="flex max-h-[94vh] w-full max-w-7xl flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl"
                    >
                        {/* HEADER */}
                        <motion.div
                            initial={{
                                opacity: 0,
                                y: -5,
                            }}
                            animate={{
                                opacity: 1,
                                y: 0,
                            }}
                            transition={{
                                duration: 0.2,
                                delay: 0.05,
                            }}
                            className="flex shrink-0 items-start justify-between border-b border-gray-200 px-4 py-4 sm:px-6"
                        >
                            <div className="flex min-w-0 items-start gap-3">
                                <motion.div
                                    initial={{
                                        opacity: 0,
                                        scale: 0.9,
                                    }}
                                    animate={{
                                        opacity: 1,
                                        scale: 1,
                                    }}
                                    transition={{
                                        duration: 0.2,
                                        delay: 0.08,
                                    }}
                                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#2563EB]"
                                >
                                    <Workflow size={21} />
                                </motion.div>

                                <div className="min-w-0">
                                    <h2 className="text-base font-semibold text-gray-900 sm:text-lg">
                                        Automated Processing
                                    </h2>

                                    <p className="mt-0.5 max-w-2xl text-sm text-gray-500">
                                        Review the automated
                                        classification, priority,
                                        and technician assignment.
                                    </p>
                                </div>
                            </div>

                            <motion.button
                                type="button"
                                onClick={onClose}
                                whileHover={{
                                    scale: 1.04,
                                }}
                                whileTap={{
                                    scale: 0.94,
                                }}
                                className="ml-3 inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-md text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
                                aria-label="Close automated processing"
                            >
                                <X size={19} />
                            </motion.button>
                        </motion.div>

                        {/* CONTENT */}
                        <div className="min-h-0 flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-gray-300">
                            <div className="space-y-5 p-3 sm:p-5 lg:p-6">

                                {/* SUMMARY CARDS */}
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">

                                    {[
                                        {
                                            icon: Workflow,
                                            title: "Processing Status",
                                            content: (
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
                                            ),
                                        },
                                        {
                                            icon: BriefcaseBusiness,
                                            title: "Processing Method",
                                            content: (
                                                <p className="break-words text-sm font-semibold text-gray-900">
                                                    {methodLabel}
                                                </p>
                                            ),
                                        },
                                        {
                                            icon: Workflow,
                                            title: "Symptom Code",
                                            content: (
                                                <p className="break-words text-sm font-semibold text-gray-900">
                                                    {automation?.symptom_code ||
                                                        "-"}
                                                </p>
                                            ),
                                        },
                                        {
                                            icon: BriefcaseBusiness,
                                            title: "Department",
                                            content: (
                                                <p className="break-words text-sm font-semibold text-gray-900">
                                                    {automation?.department ||
                                                        "-"}
                                                </p>
                                            ),
                                        },
                                    ].map(
                                        (
                                            card,
                                            index
                                        ) => {
                                            const Icon =
                                                card.icon;

                                            return (
                                                <motion.div
                                                    key={
                                                        card.title
                                                    }
                                                    initial={{
                                                        opacity: 0,
                                                        y: 8,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        y: 0,
                                                    }}
                                                    transition={{
                                                        duration: 0.2,
                                                        delay:
                                                            0.08 +
                                                            index *
                                                                0.04,
                                                    }}
                                                    className="rounded-lg border border-gray-200 bg-white p-4"
                                                >
                                                    <div className="mb-2 flex items-center gap-2">
                                                        <Icon
                                                            size={
                                                                16
                                                            }
                                                            className="text-[#2563EB]"
                                                        />

                                                        <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                                            {
                                                                card.title
                                                            }
                                                        </span>
                                                    </div>

                                                    {
                                                        card.content
                                                    }
                                                </motion.div>
                                            );
                                        }
                                    )}
                                </div>

                                {/* ASSIGNMENT COUNTS */}
                                <motion.div
                                    initial={{
                                        opacity: 0,
                                        y: 8,
                                    }}
                                    animate={{
                                        opacity: 1,
                                        y: 0,
                                    }}
                                    transition={{
                                        duration: 0.2,
                                        delay: 0.18,
                                    }}
                                    className="grid grid-cols-1 gap-4 lg:grid-cols-3"
                                >
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
                                </motion.div>

                                {/* CLASSIFICATION & PRIORITY */}
                                <motion.div
                                    initial={{
                                        opacity: 0,
                                        y: 8,
                                    }}
                                    animate={{
                                        opacity: 1,
                                        y: 0,
                                    }}
                                    transition={{
                                        duration: 0.22,
                                        delay: 0.22,
                                    }}
                                    className="rounded-lg border border-gray-200 bg-white"
                                >
                                    <div className="border-b border-gray-200 px-4 py-4 sm:px-5">
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                            <div className="min-w-0">
                                                <h3 className="text-base font-semibold text-gray-900">
                                                    Classification & Priority
                                                </h3>

                                                <p className="mt-0.5 text-sm text-gray-500">
                                                    Values determined
                                                    during automated
                                                    ticket processing.
                                                </p>
                                            </div>

                                            {finalPriority && (
                                                <span
                                                    className={`inline-flex w-fit shrink-0 items-center rounded-md px-2.5 py-1 text-xs font-semibold ${getPriorityBadgeClasses(
                                                        finalPriority
                                                    )}`}
                                                >
                                                    {getPriorityLabel(
                                                        finalPriority
                                                    )}
                                                </span>
                                            )}
                                        </div>

                                        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                            <div>
                                                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                                    Classification
                                                    Method
                                                </p>

                                                <p className="mt-1 break-words text-sm font-semibold text-gray-900">
                                                    {methodLabel}
                                                </p>
                                            </div>

                                            {processingMethod ===
                                            "machine_learning" ? (
                                                <div>
                                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                                        Confidence
                                                    </p>

                                                    <p className="mt-1 text-sm font-semibold text-[#2563EB]">
                                                        {
                                                            classificationValue.value
                                                        }
                                                    </p>
                                                </div>
                                            ) : processingMethod ===
                                              "rule_based" ? (
                                                <div>
                                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                                        Total Match Score
                                                    </p>

                                                    <p className="mt-1 text-sm font-semibold text-gray-900">
                                                        {
                                                            ruleBasedScore
                                                        }
                                                    </p>
                                                </div>
                                            ) : (
                                                <div>
                                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                                        {
                                                            classificationValue.label
                                                        }
                                                    </p>

                                                    <p className="mt-1 text-sm font-semibold text-gray-900">
                                                        {
                                                            classificationValue.value
                                                        }
                                                    </p>
                                                </div>
                                            )}

                                            <div>
                                                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                                    Required
                                                    Specialization
                                                </p>

                                                <p className="mt-1 break-words text-sm font-semibold text-gray-900">
                                                    {automation?.required_specialization ||
                                                        "-"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* PRIORITY CALCULATION */}
                                    <div className="border-t border-gray-200 px-4 py-4 sm:px-5">
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                            <div className="min-w-0">
                                                <h4 className="text-sm font-semibold text-gray-900">
                                                    Priority Calculation
                                                </h4>

                                                <p className="mt-0.5 max-w-3xl text-xs leading-5 text-gray-500">
                                                    The system starts with
                                                    the symptom&apos;s base
                                                    priority, evaluates
                                                    the affected scope,
                                                    and determines the
                                                    contextual priority.
                                                    Business and time
                                                    criticality are also
                                                    displayed as automated
                                                    risk indicators.
                                                </p>
                                            </div>

                                            {finalPriority && (
                                                <span
                                                    className={`inline-flex w-fit shrink-0 items-center rounded-md px-2.5 py-1 text-xs font-semibold ${getPriorityBadgeClasses(
                                                        finalPriority
                                                    )}`}
                                                >
                                                    {getPriorityLabel(
                                                        finalPriority
                                                    )}
                                                </span>
                                            )}
                                        </div>

                                        {!priorityAssessment ? (
                                            <motion.div
                                                initial={{
                                                    opacity: 0,
                                                }}
                                                animate={{
                                                    opacity: 1,
                                                }}
                                                className="mt-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-5"
                                            >
                                                <p className="text-sm font-medium text-gray-600">
                                                    Priority assessment details are not available.
                                                </p>

                                                <p className="mt-1 text-xs leading-5 text-gray-400">
                                                    The ticket priority was not calculated in the current automated processing result.
                                                </p>
                                            </motion.div>
                                        ) : (
                                            <>
                                                {/* DESKTOP PRIORITY TABLE */}
                                                <div className="mt-4 hidden overflow-hidden rounded-lg border border-gray-200 sm:block">
                                                    <div className="grid grid-cols-[minmax(0,1fr)_180px_180px] border-b border-gray-200 bg-gray-50 px-3 py-2.5 lg:grid-cols-[minmax(0,1fr)_200px_200px]">
                                                        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                                                            Factor
                                                        </p>

                                                        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                                                            Detected Value
                                                        </p>

                                                        <p className="text-right text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                                                            Assessment
                                                        </p>
                                                    </div>

                                                    <div className="divide-y divide-gray-200">
                                                        {/* BASE PRIORITY */}
                                                        <div className="grid grid-cols-[minmax(0,1fr)_180px_180px] items-center gap-2 px-3 py-3 lg:grid-cols-[minmax(0,1fr)_200px_200px]">
                                                            <div className="min-w-0">
                                                                <p className="text-sm font-medium text-gray-900">
                                                                    Base Priority
                                                                </p>

                                                                <p className="mt-0.5 text-xs text-gray-500">
                                                                    Priority assigned
                                                                    from the
                                                                    detected
                                                                    symptom.
                                                                </p>
                                                            </div>

                                                            <span
                                                                className={`inline-flex w-fit rounded-md px-2 py-1 text-xs font-semibold ${getPriorityBadgeClasses(
                                                                    basePriority
                                                                )}`}
                                                            >
                                                                {getPriorityLabel(
                                                                    basePriority
                                                                )}
                                                            </span>

                                                            <p className="text-right text-xs font-medium text-gray-500">
                                                                Starting priority
                                                            </p>
                                                        </div>

                                                        {/* BUSINESS CRITICAL */}
                                                        <div className="grid grid-cols-[minmax(0,1fr)_180px_180px] items-center gap-2 px-3 py-3 lg:grid-cols-[minmax(0,1fr)_200px_200px]">
                                                            <div className="min-w-0">
                                                                <p className="text-sm font-medium text-gray-900">
                                                                    Business Critical
                                                                </p>

                                                                <p className="mt-0.5 text-xs text-gray-500">
                                                                    Indicates whether
                                                                    the ticket affects
                                                                    a business-critical
                                                                    service or process.
                                                                </p>
                                                            </div>

                                                            <span
                                                                className={`inline-flex w-fit rounded-md px-2 py-1 text-xs font-semibold ${getBooleanBadgeClasses(
                                                                    businessCritical
                                                                )}`}
                                                            >
                                                                {formatBoolean(
                                                                    businessCritical
                                                                )}
                                                            </span>

                                                            <p className="text-right text-xs font-medium text-gray-500">
                                                                {businessCritical ===
                                                                true
                                                                    ? "Business risk identified"
                                                                    : businessCritical ===
                                                                      false
                                                                    ? "No business-critical impact"
                                                                    : "Not available"}
                                                            </p>
                                                        </div>

                                                        {/* TIME CRITICAL */}
                                                        <div className="grid grid-cols-[minmax(0,1fr)_180px_180px] items-center gap-2 px-3 py-3 lg:grid-cols-[minmax(0,1fr)_200px_200px]">
                                                            <div className="min-w-0">
                                                                <p className="text-sm font-medium text-gray-900">
                                                                    Time Critical
                                                                </p>

                                                                <p className="mt-0.5 text-xs text-gray-500">
                                                                    Indicates whether
                                                                    the ticket contains
                                                                    a time-sensitive
                                                                    condition.
                                                                </p>
                                                            </div>

                                                            <span
                                                                className={`inline-flex w-fit rounded-md px-2 py-1 text-xs font-semibold ${getBooleanBadgeClasses(
                                                                    timeCritical
                                                                )}`}
                                                            >
                                                                {formatBoolean(
                                                                    timeCritical
                                                                )}
                                                            </span>

                                                            <p className="text-right text-xs font-medium text-gray-500">
                                                                {timeCritical ===
                                                                true
                                                                    ? "Time-sensitive condition"
                                                                    : timeCritical ===
                                                                      false
                                                                    ? "No time-critical condition"
                                                                    : "Not available"}
                                                            </p>
                                                        </div>

                                                        {/* AFFECTED SCOPE */}
                                                        <div className="grid grid-cols-[minmax(0,1fr)_180px_180px] items-center gap-2 px-3 py-3 lg:grid-cols-[minmax(0,1fr)_200px_200px]">
                                                            <div className="min-w-0">
                                                                <p className="text-sm font-medium text-gray-900">
                                                                    Affected Scope
                                                                </p>

                                                                <p className="mt-0.5 text-xs text-gray-500">
                                                                    Scope of users
                                                                    or
                                                                    organizational
                                                                    area
                                                                    affected.
                                                                </p>
                                                            </div>

                                                            <span className="inline-flex w-fit rounded-md border border-orange-200 bg-orange-50 px-2 py-1 text-xs font-medium text-orange-700">
                                                                {formatAffectedScope(
                                                                    affectedScope
                                                                )}
                                                            </span>

                                                            <p className="text-right text-xs font-medium text-gray-500">
                                                                Determines contextual priority
                                                            </p>
                                                        </div>

                                                        {/* CONTEXTUAL PRIORITY */}
                                                        <div className="grid grid-cols-[minmax(0,1fr)_180px_180px] items-center gap-2 bg-gray-50 px-3 py-3 lg:grid-cols-[minmax(0,1fr)_200px_200px]">
                                                            <div className="min-w-0">
                                                                <p className="text-sm font-medium text-gray-900">
                                                                    Contextual
                                                                    Priority
                                                                </p>

                                                                <p className="mt-0.5 text-xs text-gray-500">
                                                                    Priority determined
                                                                    from the affected
                                                                    scope.
                                                                </p>
                                                            </div>

                                                            <span
                                                                className={`inline-flex w-fit rounded-md px-2 py-1 text-xs font-semibold ${getPriorityBadgeClasses(
                                                                    contextualPriority
                                                                )}`}
                                                            >
                                                                {getPriorityLabel(
                                                                    contextualPriority
                                                                )}
                                                            </span>

                                                            <p className="text-right text-xs font-medium text-gray-500">
                                                                Scope adjustment
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* MOBILE PRIORITY */}
                                                <div className="mt-4 space-y-2 sm:hidden">
                                                    {/* BASE */}
                                                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                                                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                            Base Priority
                                                        </p>

                                                        <div className="mt-2 flex items-center justify-between gap-3">
                                                            <span className="text-sm text-gray-600">
                                                                Symptom priority
                                                            </span>

                                                            <span
                                                                className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold ${getPriorityBadgeClasses(
                                                                    basePriority
                                                                )}`}
                                                            >
                                                                {getPriorityLabel(
                                                                    basePriority
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* BUSINESS CRITICAL */}
                                                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                                                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                            Business Critical
                                                        </p>

                                                        <div className="mt-2 flex items-center justify-between gap-3">
                                                            <span className="text-sm text-gray-600">
                                                                Detected condition
                                                            </span>

                                                            <span
                                                                className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold ${getBooleanBadgeClasses(
                                                                    businessCritical
                                                                )}`}
                                                            >
                                                                {formatBoolean(
                                                                    businessCritical
                                                                )}
                                                            </span>
                                                        </div>

                                                        <p className="mt-2 text-xs leading-5 text-gray-500">
                                                            {getBusinessCriticalExplanation(
                                                                businessCritical
                                                            )}
                                                        </p>
                                                    </div>

                                                    {/* TIME CRITICAL */}
                                                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                                                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                            Time Critical
                                                        </p>

                                                        <div className="mt-2 flex items-center justify-between gap-3">
                                                            <span className="text-sm text-gray-600">
                                                                Detected condition
                                                            </span>

                                                            <span
                                                                className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold ${getBooleanBadgeClasses(
                                                                    timeCritical
                                                                )}`}
                                                            >
                                                                {formatBoolean(
                                                                    timeCritical
                                                                )}
                                                            </span>
                                                        </div>

                                                        <p className="mt-2 text-xs leading-5 text-gray-500">
                                                            {getTimeCriticalExplanation(
                                                                timeCritical
                                                            )}
                                                        </p>
                                                    </div>

                                                    {/* SCOPE */}
                                                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                                                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                            Affected Scope
                                                        </p>

                                                        <div className="mt-2 flex items-center justify-between gap-3">
                                                            <span className="text-sm text-gray-600">
                                                                Scope
                                                            </span>

                                                            <span className="text-right text-sm font-semibold text-gray-900">
                                                                {formatAffectedScope(
                                                                    affectedScope
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* CONTEXTUAL */}
                                                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                                                        <div className="flex items-center justify-between gap-3">
                                                            <div>
                                                                <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                                                                    Contextual
                                                                    Priority
                                                                </p>

                                                                <p className="mt-0.5 text-xs text-blue-600">
                                                                    Based on
                                                                    affected
                                                                    scope
                                                                </p>
                                                            </div>

                                                            <span
                                                                className={`inline-flex shrink-0 rounded-md px-2 py-1 text-xs font-semibold ${getPriorityBadgeClasses(
                                                                    contextualPriority
                                                                )}`}
                                                            >
                                                                {getPriorityLabel(
                                                                    contextualPriority
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* FINAL PRIORITY */}
                                                <motion.div
                                                    initial={{
                                                        opacity: 0,
                                                        y: 6,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        y: 0,
                                                    }}
                                                    transition={{
                                                        duration: 0.2,
                                                    }}
                                                    className={`mt-4 flex flex-col gap-3 rounded-lg border-2 px-4 py-4 sm:flex-row sm:items-center sm:justify-between ${
                                                        finalPriority === "P1"
                                                            ? "border-red-200 bg-red-50"
                                                            : finalPriority === "P2"
                                                            ? "border-orange-200 bg-orange-50"
                                                            : "border-blue-200 bg-blue-50"
                                                    }`}
                                                >
                                                    <div className="min-w-0">
                                                        <p
                                                            className={`text-xs font-semibold uppercase tracking-wide ${
                                                                finalPriority ===
                                                                "P1"
                                                                    ? "text-red-700"
                                                                    : finalPriority ===
                                                                      "P2"
                                                                    ? "text-orange-700"
                                                                    : "text-blue-700"
                                                            }`}
                                                        >
                                                            Final Priority
                                                        </p>

                                                        <p className="mt-1 text-lg font-bold text-gray-900">
                                                            {getPriorityLabel(
                                                                finalPriority
                                                            )}
                                                        </p>

                                                        <p
                                                            className={`mt-1 text-xs leading-5 ${
                                                                finalPriority ===
                                                                "P1"
                                                                    ? "text-red-800"
                                                                    : finalPriority ===
                                                                      "P2"
                                                                    ? "text-orange-800"
                                                                    : "text-blue-800"
                                                            }`}
                                                        >
                                                            {
                                                                priorityDecisionText
                                                            }
                                                        </p>
                                                    </div>

                                                    <motion.div
                                                        whileHover={{
                                                            scale: 1.04,
                                                        }}
                                                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border bg-white text-sm font-bold ${
                                                            finalPriority ===
                                                            "P1"
                                                                ? "border-red-300 text-red-700"
                                                                : finalPriority ===
                                                                  "P2"
                                                                ? "border-orange-300 text-orange-700"
                                                                : "border-blue-300 text-blue-700"
                                                        }`}
                                                    >
                                                        {finalPriority ||
                                                            "-"}
                                                    </motion.div>
                                                </motion.div>

                                                {/* EXPLANATION */}
                                                <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50 px-3 py-3">
                                                    <p className="text-xs leading-5 text-blue-800">
                                                        The automated process
                                                        first determines the
                                                        symptom&apos;s base
                                                        priority. It also
                                                        evaluates whether the
                                                        ticket is business
                                                        critical or time
                                                        critical as additional
                                                        risk indicators. The
                                                        affected scope is then
                                                        used to determine the
                                                        contextual priority.
                                                        The final priority is
                                                        the more urgent result
                                                        between the base
                                                        priority and the
                                                        contextual priority.
                                                    </p>

                                                    {(businessCritical ===
                                                        true ||
                                                        timeCritical ===
                                                            true) && (
                                                        <div className="mt-3 border-t border-blue-200 pt-3">
                                                            <p className="text-xs font-semibold text-blue-900">
                                                                Additional
                                                                Automated
                                                                Indicators
                                                            </p>

                                                            <div className="mt-2 space-y-1.5">
                                                                {businessCritical ===
                                                                    true && (
                                                                    <p className="text-xs leading-5 text-blue-800">
                                                                        <span className="font-semibold">
                                                                            Business
                                                                            Critical:
                                                                        </span>{" "}
                                                                        The ticket
                                                                        affects a
                                                                        business-critical
                                                                        service or
                                                                        process and is
                                                                        flagged for
                                                                        operational
                                                                        attention.
                                                                    </p>
                                                                )}

                                                                {timeCritical ===
                                                                    true && (
                                                                    <p className="text-xs leading-5 text-blue-800">
                                                                        <span className="font-semibold">
                                                                            Time
                                                                            Critical:
                                                                        </span>{" "}
                                                                        The ticket
                                                                        contains a
                                                                        time-sensitive
                                                                        condition and
                                                                        is flagged for
                                                                        prompt
                                                                        attention.
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {/* RULE-BASED KEYWORDS */}
                                    {processingMethod ===
                                        "rule_based" && (
                                        <motion.div
                                            initial={{
                                                opacity: 0,
                                            }}
                                            animate={{
                                                opacity: 1,
                                            }}
                                            transition={{
                                                duration: 0.2,
                                            }}
                                            className="border-t border-gray-200 px-4 py-4 sm:px-5"
                                        >
                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                                <div className="min-w-0">
                                                    <h4 className="text-sm font-semibold text-gray-900">
                                                        Rule-Based Keyword Matching
                                                    </h4>

                                                    <p className="mt-0.5 max-w-3xl text-xs leading-5 text-gray-500">
                                                        Database keywords
                                                        matched against
                                                        the ticket content
                                                        and their
                                                        contribution to
                                                        the classification
                                                        score.
                                                    </p>
                                                </div>

                                                <div className="flex shrink-0 items-center gap-2">
                                                    <span className="text-xs font-medium text-gray-500">
                                                        Minimum required
                                                    </span>

                                                    <span className="inline-flex items-center rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 text-xl font-semibold text-blue-700">
                                                        {
                                                            ruleBasedThreshold
                                                        }
                                                    </span>
                                                </div>
                                            </div>

                                            {matchedKeywords.length ===
                                            0 ? (
                                                <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-5 text-center">
                                                    <p className="text-sm font-medium text-gray-600">
                                                        No database keyword
                                                        matches found.
                                                    </p>

                                                    <p className="mt-1 text-xs text-gray-400">
                                                        The rule-based
                                                        classifier did not
                                                        find any matching
                                                        keywords for this
                                                        ticket.
                                                    </p>
                                                </div>
                                            ) : (
                                                <MatchedKeywordList
                                                    matchedKeywords={
                                                        matchedKeywords
                                                    }
                                                    expanded={
                                                        expandedKeywords
                                                    }
                                                    onToggle={
                                                        toggleKeywords
                                                    }
                                                />
                                            )}

                                            {matchedKeywords.length >
                                                0 && (
                                                <div className="mt-3 flex flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                            Total Match
                                                            Score
                                                        </p>

                                                        <p className="mt-0.5 text-xs text-gray-400">
                                                            Minimum required
                                                            score:{" "}
                                                            {
                                                                ruleBasedThreshold
                                                            }
                                                        </p>
                                                    </div>

                                                    <span className="text-xl font-bold text-gray-900">
                                                        {
                                                            ruleBasedScore
                                                        }
                                                    </span>
                                                </div>
                                            )}

                                            <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50 px-3 py-3">
                                                <p className="text-xs leading-5 text-blue-800">
                                                    The match score is the
                                                    combined weight of the
                                                    matched database
                                                    keywords. Keywords found
                                                    in the ticket subject
                                                    receive stronger
                                                    weighting. A score of{" "}
                                                    {
                                                        ruleBasedThreshold
                                                    }{" "}
                                                    or higher meets the
                                                    rule-based classification
                                                    threshold.
                                                </p>
                                            </div>
                                        </motion.div>
                                    )}
                                </motion.div>

                                {/* IT SUPPORT EVALUATION */}
                                <motion.div
                                    initial={{
                                        opacity: 0,
                                        y: 8,
                                    }}
                                    animate={{
                                        opacity: 1,
                                        y: 0,
                                    }}
                                    transition={{
                                        duration: 0.22,
                                        delay: 0.28,
                                    }}
                                    className="rounded-lg border border-gray-200 bg-white"
                                >
                                    <div className="flex flex-col gap-2 border-b border-gray-200 px-4 py-4 sm:px-5">
                                        <h3 className="text-base font-semibold text-gray-900">
                                            IT Support Evaluation
                                        </h3>

                                        <p className="text-sm text-gray-500">
                                            IT Support considered for
                                            the ticket based on
                                            department,
                                            specialization,
                                            availability, and
                                            workload.
                                        </p>
                                    </div>

                                    {technicians.length ===
                                    0 ? (
                                        <div className="flex min-h-[180px] items-center justify-center px-5 py-8">
                                            <div className="text-center">
                                                <Users
                                                    size={30}
                                                    className="mx-auto text-gray-300"
                                                />

                                                <p className="mt-3 text-sm font-medium text-gray-600">
                                                    No IT Support
                                                    were considered.
                                                </p>

                                                <p className="mt-1 text-xs text-gray-400">
                                                    There are no IT Support
                                                    records available
                                                    for this department.
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            {/* DESKTOP TABLE */}
                                            <div className="hidden overflow-hidden rounded-b-lg md:block">
                                                <div className="w-full overflow-x-auto [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-gray-300">
                                                    <table className="w-full min-w-[960px] border-collapse">
                                                        <thead>
                                                            <tr className="border-b border-gray-200 bg-gray-50">
                                                                <th className="w-[180px] min-w-[180px] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                                    Support
                                                                </th>

                                                                <th className="w-[200px] min-w-[200px] px-2 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                                    Specializations
                                                                </th>

                                                                <th className="w-[100px] min-w-[100px] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                                    Workload
                                                                </th>

                                                                <th className="w-[150px] min-w-[150px] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
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
                                                                (
                                                                    technician
                                                                ) => (
                                                                    <motion.tr
                                                                        key={
                                                                            technician.id
                                                                        }
                                                                        initial={{
                                                                            opacity: 0,
                                                                        }}
                                                                        animate={{
                                                                            opacity: 1,
                                                                        }}
                                                                        transition={{
                                                                            duration: 0.18,
                                                                        }}
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
                                                                            </div>
                                                                        </td>

                                                                        <td className="w-[200px] min-w-[200px] px-2 py-2">
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
                                                                                {technician.lastAssigned
                                                                                    ? formatDate(
                                                                                          technician.lastAssigned
                                                                                      )
                                                                                    : "Never assigned"}
                                                                            </span>
                                                                        </td>

                                                                        <td className="px-4 py-3">
                                                                            <span
                                                                                className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ${getAvailabilityClasses(
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
                                                                    </motion.tr>
                                                                )
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>

                                            {/* MOBILE */}
                                            <div className="space-y-3 p-4 md:hidden">
                                                {technicians.map(
                                                    (
                                                        technician
                                                    ) => (
                                                        <motion.div
                                                            key={
                                                                technician.id
                                                            }
                                                            initial={{
                                                                opacity: 0,
                                                                y: 6,
                                                            }}
                                                            animate={{
                                                                opacity: 1,
                                                                y: 0,
                                                            }}
                                                            transition={{
                                                                duration: 0.18,
                                                            }}
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
                                                                        {technician.lastAssigned
                                                                            ? formatDate(
                                                                                  technician.lastAssigned
                                                                              )
                                                                            : "Never assigned"}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <div className="mt-4 border-t border-gray-200 pt-4">
                                                                <p className="text-xs font-medium text-gray-500">
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
                                                        </motion.div>
                                                    )
                                                )}
                                            </div>
                                        </>
                                    )}
                                </motion.div>

                                {/* ASSIGNMENT RESULT */}
                                <motion.div
                                    initial={{
                                        opacity: 0,
                                        y: 8,
                                    }}
                                    animate={{
                                        opacity: 1,
                                        y: 0,
                                    }}
                                    transition={{
                                        duration: 0.22,
                                        delay: 0.32,
                                    }}
                                    className="rounded-lg border border-gray-200 bg-white"
                                >
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
                                        {assignment?.status ===
                                            "assigned" &&
                                        assignmentTechnician ? (
                                            <motion.div
                                                initial={{
                                                    opacity: 0,
                                                    scale: 0.99,
                                                }}
                                                animate={{
                                                    opacity: 1,
                                                    scale: 1,
                                                }}
                                                transition={{
                                                    duration: 0.2,
                                                }}
                                                className="flex flex-col gap-4 rounded-lg border border-green-200 bg-green-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                                            >
                                                <div className="flex min-w-0 items-start gap-3">
                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700">
                                                        <CheckCircle2
                                                            size={18}
                                                        />
                                                    </div>

                                                    <div className="min-w-0">
                                                        <p className="text-sm font-semibold text-green-800">
                                                            Automatically
                                                            Assigned
                                                        </p>

                                                        <p className="mt-1 break-words text-sm text-green-700">
                                                            {
                                                                assignmentTechnician.name
                                                            }
                                                        </p>

                                                        <p className="mt-1 text-xs text-green-600">
                                                            Workload:{" "}
                                                            {assignmentTechnician.current_workload ??
                                                                assignmentTechnician.workload ??
                                                                0}{" "}
                                                            /{" "}
                                                            {assignmentTechnician.workload_limit ??
                                                                assignmentTechnician.workloadLimit ??
                                                                0}
                                                        </p>
                                                    </div>
                                                </div>

                                                <span className="inline-flex w-fit shrink-0 rounded-md border border-green-200 bg-white px-2.5 py-1 text-xs font-medium text-green-700">
                                                    Assigned
                                                </span>
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                initial={{
                                                    opacity: 0,
                                                    y: 5,
                                                }}
                                                animate={{
                                                    opacity: 1,
                                                    y: 0,
                                                }}
                                                className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4"
                                            >
                                                <AlertCircle
                                                    size={19}
                                                    className="mt-0.5 shrink-0 text-amber-600"
                                                />

                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-amber-800">
                                                        No Technician
                                                        Assigned
                                                    </p>

                                                    <p className="mt-1 break-words text-sm text-amber-700">
                                                        {assignment?.reason ||
                                                            "No technician was assigned to this ticket."}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>
                                </motion.div>
                            </div>
                        </div>

                        {/* FOOTER */}
                        <div className="flex shrink-0 justify-end border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                            <motion.button
                                type="button"
                                onClick={onClose}
                                whileHover={{
                                    y: -1,
                                }}
                                whileTap={{
                                    scale: 0.97,
                                }}
                                className="inline-flex h-10 w-full cursor-pointer items-center justify-center rounded-md bg-[#2563EB] px-5 text-sm font-medium text-white transition-colors hover:bg-[#1D4ED8] sm:w-auto"
                            >
                                Close
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}