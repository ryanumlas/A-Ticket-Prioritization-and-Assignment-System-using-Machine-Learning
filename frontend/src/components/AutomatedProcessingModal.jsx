import {
    Workflow,
    CheckCircle2,
    Network,
    Tag,
    Flag,
    Building2,
    Clock3,
    CalendarDays,
    X,
} from "lucide-react";

export default function AutomatedProcessingModal({
    open,
    onClose,
}) {
    if (!open) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
        >
            <div className="w-full max-w-2xl overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-gray-200 px-5 py-4">
                    <div className="flex min-w-0 items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                            <Workflow
                                size={19}
                                className="text-[#2563EB]"
                            />
                        </div>

                        <div className="min-w-0">
                            <h2 className="text-base font-semibold text-gray-900">
                                Automated Processing
                            </h2>

                            <p className="mt-0.5 text-sm text-gray-500">
                                System-generated ticket processing details.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close automated processing"
                        className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Content */}
                <div className="max-h-[70vh] overflow-y-auto px-5 py-5">
                    {/* Automation Status */}
                    <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
                        <div className="flex items-start gap-3">
                            <CheckCircle2
                                size={19}
                                className="mt-0.5 shrink-0 text-green-600"
                            />

                            <div>
                                <p className="text-sm font-semibold text-green-800">
                                    Automatically Processed
                                </p>

                                <p className="mt-0.5 text-xs text-green-700">
                                    Ticket processing completed successfully.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Processing Details */}
                    <div>
                        <h3 className="mb-3 text-sm font-semibold text-gray-900">
                            Processing Details
                        </h3>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {/* Symptom Classification */}
                            <div className="rounded-lg border border-gray-200 bg-white p-4">
                                <div className="flex items-center gap-2">
                                    <Network
                                        size={16}
                                        className="text-[#2563EB]"
                                    />

                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                        Symptom Classification
                                    </p>
                                </div>

                                <p className="mt-2 text-sm font-semibold text-gray-900">
                                    Network Connectivity
                                </p>
                            </div>

                            {/* Category */}
                            <div className="rounded-lg border border-gray-200 bg-white p-4">
                                <div className="flex items-center gap-2">
                                    <Tag
                                        size={16}
                                        className="text-[#2563EB]"
                                    />

                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                        Category
                                    </p>
                                </div>

                                <p className="mt-2 text-sm font-semibold text-gray-900">
                                    Network & Infrastructure
                                </p>
                            </div>

                            {/* Priority */}
                            <div className="rounded-lg border border-gray-200 bg-white p-4">
                                <div className="flex items-center gap-2">
                                    <Flag
                                        size={16}
                                        className="text-orange-500"
                                    />

                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                        Priority
                                    </p>
                                </div>

                                <div className="mt-2 flex items-center gap-2">
                                    <span className="inline-flex rounded-md border border-orange-200 bg-orange-50 px-2 py-1 text-xs font-semibold text-orange-700">
                                        P2
                                    </span>

                                    <span className="text-sm font-medium text-gray-900">
                                        High
                                    </span>
                                </div>
                            </div>

                            {/* Department Routing */}
                            <div className="rounded-lg border border-gray-200 bg-white p-4">
                                <div className="flex items-center gap-2">
                                    <Building2
                                        size={16}
                                        className="text-[#2563EB]"
                                    />

                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                        Department Routing
                                    </p>
                                </div>

                                <p className="mt-2 text-sm font-semibold text-gray-900">
                                    Network & Infrastructure Support
                                </p>
                            </div>

                            {/* Processing Time */}
                            <div className="rounded-lg border border-gray-200 bg-white p-4">
                                <div className="flex items-center gap-2">
                                    <Clock3
                                        size={16}
                                        className="text-[#2563EB]"
                                    />

                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                        Processing Time
                                    </p>
                                </div>

                                <p className="mt-2 text-sm font-semibold text-gray-900">
                                    1.8 seconds
                                </p>
                            </div>

                            {/* Processed At */}
                            <div className="rounded-lg border border-gray-200 bg-white p-4">
                                <div className="flex items-center gap-2">
                                    <CalendarDays
                                        size={16}
                                        className="text-[#2563EB]"
                                    />

                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                        Processed At
                                    </p>
                                </div>

                                <p className="mt-2 text-sm font-semibold text-gray-900">
                                    September 25, 2026
                                </p>

                                <p className="mt-0.5 text-xs text-gray-500">
                                    10:42 AM
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Processing Summary */}
                    <div className="mt-5">
                        <h3 className="mb-3 text-sm font-semibold text-gray-900">
                            Processing Summary
                        </h3>

                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                            <p className="text-sm leading-6 text-gray-600">
                                The ticket was automatically analyzed and
                                classified based on the submitted issue.
                                The system identified the reported symptom,
                                assigned a priority level, and routed the
                                ticket to the appropriate IT department.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end border-t border-gray-200 px-5 py-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-9 cursor-pointer rounded-md bg-[#2563EB] px-4 text-sm font-medium text-white transition-colors hover:bg-[#1D4ED8]"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}