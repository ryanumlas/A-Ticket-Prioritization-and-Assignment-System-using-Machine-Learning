    import { useState } from "react";
    import {
        Contact,
        CircleAlert,
        ClipboardCheck,
        Ticket,
        TrendingUp,
        CheckCircle2,
        Pencil,
    } from "lucide-react";

    export default function LowConfidenceReview({ flag }) {
        const [selectedSymptom, setSelectedSymptom] = useState("");

        const confidence =
            flag.confidence != null
                ? (flag.confidence * 100).toFixed(2)
                : "0.00";

        const secondConfidence =
            flag.second_confidence != null
                ? (flag.second_confidence * 100).toFixed(2)
                : "0.00";

        const confidenceMargin =
            flag.confidence_margin != null
                ? (flag.confidence_margin * 100).toFixed(2)
                : "0.00";

        // Static for now
        // Later we can fetch these from the backend
        const symptomCodes = [
            { code: "AC-001", name: "Password Reset" },
            { code: "AC-002", name: "Account Locked" },
            { code: "AC-003", name: "System Access" },
            { code: "AC-004", name: "Account Issue" },
            { code: "AC-005", name: "Authentication Issue" },
            { code: "AC-006", name: "Permission / Access Issue" },
        ];

        const canOverride =
            selectedSymptom &&
            selectedSymptom !== flag.predicted_symptom_code;

        return (
            <div className="space-y-5">
                <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.35fr_1fr]">
                    <div className="overflow-hidden rounded-md border border-gray-300 bg-white">
                        <div className="flex items-center gap-3 border-b border-gray-300 px-6 py-4">

                            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-gray-100">
                                <Ticket
                                    size={19}
                                    className="text-black"
                                />
                            </div>

                            <div>
                                <h2 className="font-semibold text-black">
                                    Ticket Information
                                </h2>

                                <p className="mt-0.5 text-xs text-gray-500">
                                    Information submitted by the employee.
                                </p>
                            </div>

                        </div>

                        <div className="grid grid-cols-1 border-b border-gray-300 sm:grid-cols-2">

                            <div className="border-b border-gray-300 px-6 py-4 sm:border-b-0 sm:border-r">
                                <p className="text-xs font-semibold uppercase text-gray-500">
                                    Ticket Code
                                </p>

                                <p className="mt-2 text-sm font-medium text-black">
                                    {flag.ticket_code || "-"}
                                </p>
                            </div>

                            <div className="px-6 py-4">
                                <p className="text-xs font-semibold uppercase text-gray-500">
                                    Affected Scope
                                </p>

                                <p className="mt-2 text-sm font-medium text-black">
                                    {flag.affected_scope || "-"}
                                </p>
                            </div>

                        </div>

                        <div className="border-b border-gray-300 px-6 py-4">
                            <p className="text-xs font-semibold uppercase text-gray-500">
                                Subject
                            </p>

                            <p className="mt-2 text-sm font-medium text-black">
                                {flag.subject || "-"}
                            </p>
                        </div>

                        <div className="border-b border-gray-300 px-6 py-4">
                            <p className="text-xs font-semibold uppercase text-gray-500">
                                Description
                            </p>

                            <p className="mt-2 text-sm leading-6 text-black">
                                {flag.description || "-"}
                            </p>
                        </div>

                        <div className="px-6 py-4">
                            <p className="text-xs font-semibold uppercase text-gray-500">
                                Business Impact
                            </p>

                            <p className="mt-2 text-sm leading-6 text-black">
                                {flag.business_impact || "-"}
                            </p>
                        </div>
                        <div className="border-t border-gray-300 px-6 py-5">

                            <div className="mb-5 flex items-center gap-2">
                                <Contact
                                    size={18}
                                    className="text-black"
                                />

                                <h3 className="font-semibold text-black">
                                    Requester Information
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 gap-x-10 gap-y-4 sm:grid-cols-2">

                                <div className="flex items-center">
                                    <p className="w-32 shrink-0 text-xs text-gray-500 uppercase font-semibold">
                                        Name
                                    </p>

                                    <p className="text-sm font-medium text-black">
                                        Bryan Roxas
                                    </p>
                                </div>

                                <div className="flex items-center">
                                    <p className="w-32 shrink-0 text-xs text-gray-500 uppercase font-semibold">
                                        Employee ID
                                    </p>

                                    <p className="text-sm font-medium text-black">
                                        EMP-0005
                                    </p>
                                </div>

                                <div className="flex items-center">
                                    <p className="w-32 shrink-0 text-xs text-gray-500 uppercase font-semibold">
                                        Department
                                    </p>

                                    <p className="text-sm font-medium text-black">
                                        Human Resources
                                    </p>
                                </div>


                                <div className="flex items-center">
                                    <p className="w-32 shrink-0 text-xs text-gray-500 uppercase font-semibold">
                                        Office Location
                                    </p>

                                    <p className="text-sm font-medium text-black">
                                        3rd Floor
                                    </p>
                                </div>

                                <div className="flex items-center">
                                    <p className="w-32 shrink-0 text-xs text-gray-500 uppercase font-semibold">
                                        Workstation
                                    </p>

                                    <p className="text-sm font-medium text-black">
                                        HR-024
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    

                    <div className="overflow-hidden rounded-md border border-gray-300 bg-white">
                        <div className="flex items-start gap-3 border-b border-gray-300 px-6 py-4">

                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-gray-100">
                                <ClipboardCheck
                                    size={19}
                                    className="text-black"
                                />
                            </div>

                            <div>
                                <h2 className="font-semibold text-black">
                                    Review Classification
                                </h2>

                                <p className="mt-0.5 text-xs text-gray-500">
                                    Review the Model recommendation and decide the
                                    final symptom classification.
                                </p>
                            </div>
                        </div>

                        <div className="p-6">

                            <div className="mb-5 rounded-md border border-gray-300 bg-gray-50 px-4 py-3">
                                <p className="text-xs font-semibold uppercase text-gray-500">
                                    Review Reason
                                </p>
                                <div className="mt-2 flex items-center gap-2">
                                    <CircleAlert
                                        size={17}
                                        className="shrink-0 text-red-700"
                                    />

                                    <p className="text-sm font-semibold text-black">
                                        {flag.reason || "Low Confidence"}
                                    </p>
                                </div>
                            </div>

                            <div className="rounded-md border border-gray-300 bg-gray-50 p-5">
                                <div className="flex items-center justify-between gap-3">
                                    <p className="text-xs font-semibold uppercase text-gray-500">
                                        Model Recommended
                                    </p>

                                    <span className="rounded-md bg-[#4C4CF9] px-2.5 py-1 text-xs font-semibold text-white">
                                        {confidence}%
                                    </span>

                                </div>

                                <p className="mt-3 text-2xl font-semibold text-black">
                                    {flag.predicted_symptom_code || "-"}
                                </p>

                                <p className="mt-1 text-xs text-gray-500">
                                    Primary recommended symptom code
                                </p>
                            </div>

                            <div className="mt-6">
                                <label
                                    htmlFor="symptom-code"
                                    className="mb-2 block text-xs font-semibold uppercase text-gray-500"
                                >
                                    Override Symptom Code
                                </label>

                                <select
                                    id="symptom-code"
                                    value={selectedSymptom}
                                    onChange={(e) =>
                                        setSelectedSymptom(e.target.value)
                                    }
                                    className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-[#4C4CF9]"
                                >
                                    <option value="">
                                        Select a different symptom code
                                    </option>

                                    {symptomCodes.map((symptom) => (
                                        <option
                                            key={symptom.code}
                                            value={symptom.code}
                                        >
                                            {symptom.code} - {symptom.name}
                                        </option>
                                    ))}

                                </select>

                            </div>

                            {selectedSymptom && (
                                <div className="mt-4 rounded-md border border-gray-300 px-4 py-3">

                                    <p className="text-xs font-semibold uppercase text-gray-500">
                                        Selected Classification
                                    </p>

                                    <div className="mt-2 flex items-center gap-2">

                                        <Pencil
                                            size={15}
                                            className={
                                                canOverride
                                                    ? "text-black"
                                                    : "text-gray-400"
                                            }
                                        />

                                        <p className="text-sm font-semibold text-black">
                                            {selectedSymptom}
                                        </p>

                                    </div>

                                    {!canOverride && (
                                        <p className="mt-2 text-xs text-gray-500">
                                            This is already the AI recommended
                                            symptom code. Use Accept Predicted
                                            instead.
                                        </p>
                                    )}

                                </div>
                            )}


                            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">

                                <button
                                    type="button"
                                    disabled={!canOverride}
                                    className={`flex items-center justify-center gap-2 rounded-md border px-4 py-3 text-sm font-semibold transition ${
                                        canOverride
                                            ? "cursor-pointer border-[#4C4CF9] bg-white text-[#4C4CF9] hover:bg-gray-50"
                                            : "cursor-not-allowed border-gray-300 bg-gray-100 text-gray-400"
                                    }`}
                                >
                                    <Pencil size={16} />

                                    Approve Override
                                </button>

                                <button
                                    type="button"
                                    className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-[#4C4CF9] bg-[#4C4CF9] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#4242e8]"
                                >
                                    <CheckCircle2 size={17} />

                                    Accept Recommended
                                </button>

                            </div>
                        </div>
                    </div>
                </div>


                <div className="overflow-hidden rounded-md border border-gray-300 bg-white">
                    <div className="flex items-start gap-3 border-b border-gray-300 px-6 py-4">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-gray-100">
                            <TrendingUp
                                size={19}
                                className="text-black"
                            />
                        </div>

                        <div>
                            <h2 className="font-semibold text-black">
                                Model Recommendation Result
                            </h2>

                            <p className="mt-0.5 text-xs text-gray-500">
                                The model returned a low-confidence recommendation and
                                requires manual verification.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-3">

                        <div className="rounded-md border border-gray-300 p-5">
                            <div className="flex items-center justify-between gap-3">
                                <p className="text-xs font-semibold uppercase text-gray-500">
                                    Primary Recommended
                                </p>

                                <span className="rounded-md bg-gray-100 px-2 py-1 text-[11px] font-medium text-black">
                                    Model Recommended
                                </span>
                            </div>

                            <div className="mt-5 flex items-end justify-between gap-4">
                                <p className="text-2xl font-semibold text-black">
                                    {flag.predicted_symptom_code || "-"}
                                </p>

                                <p className="text-xl font-semibold text-[#4C4CF9]">
                                    {confidence}%
                                </p>
                            </div>

                            <p className="mt-3 text-xs leading-5 text-gray-500">
                                Primary confidence recommended by the model.
                            </p>
                        </div>

                        <div className="rounded-md border border-gray-300 p-5">
                            <p className="text-xs font-semibold uppercase text-gray-500">
                                Secondary Recommended
                            </p>

                            <div className="mt-5 flex items-end justify-between gap-4">
                                <p className="text-2xl font-semibold text-black">
                                    {flag.second_predicted_symptom_code || "-"}
                                </p>

                                <p className="text-xl font-semibold text-amber-600">
                                    {secondConfidence}%
                                </p>
                            </div>

                            <p className="mt-3 text-xs leading-5 text-gray-500">
                                Secondary confidence recommended by the model.
                            </p>
                        </div>

                        <div className="rounded-md border border-gray-300 p-5">
                            <p className="text-xs font-semibold uppercase text-gray-500">
                                Confidence Margin
                            </p>

                            <p className="mt-5 text-3xl font-semibold text-green-600">
                                {confidenceMargin}%
                            </p>

                            <p className="mt-3 text-xs leading-5 text-gray-500">
                                Difference between the primary and secondary
                                recommendation confidence.
                            </p>
                        </div>
                    </div>

                    <div className="mx-6 mb-6 flex items-center gap-3 rounded-md border border-gray-300 bg-gray-50 px-4 py-3">
                        <CircleAlert
                            size={18}
                            className="shrink-0 text-red-600"
                        />

                        <p className="text-xs leading-5 text-black">
                            This ticket was flagged because the Model recommendation did
                            not meet the required confidence threshold. Manual
                            verification is required before the ticket can continue.
                        </p>
                    </div>
                </div>
            </div>
        );
    }