import {
    Ticket,
    ArrowUpDown,
    UserRound,
    MessageSquareText,
    ClipboardCheck,
    Check,
    X,
    ArrowRight,
} from "lucide-react";

export default function PriorityRequestDetailsContent() {
    return (
        <div className="space-y-4">

            {/* TOP GRID */}
            <div className="grid grid-cols-[1.1fr_0.9fr] gap-4">

                {/* TICKET INFORMATION */}
                <div className="rounded-xl border border-gray-300 bg-white p-5">

                    <div className="mb-4 flex items-center gap-2 border-b border-gray-200 pb-3">
                        <Ticket
                            size={19}
                            className="text-gray-600"
                        />

                        <h2 className="text-base font-semibold text-black">
                            Ticket Information
                        </h2>
                    </div>

                    <div className="divide-y divide-gray-200">

                        <DetailRow
                            label="Ticket Code"
                            value="TKT-000001"
                        />

                        <DetailRow
                            label="Subject"
                            value="Unable to log in to company account"
                        />

                        <div className="grid grid-cols-[145px_1fr] gap-4 py-3">
                            <span className="text-sm text-gray-500">
                                Description
                            </span>

                            <p className="text-sm leading-6 text-black">
                                I am unable to log in to my company account
                                since this morning. I already tried resetting
                                my password but it still shows an invalid
                                credentials error. I need access urgently
                                because I have pending tasks for today.
                            </p>
                        </div>

                        <DetailRow
                            label="Employee Department"
                            value="Customer Service"
                        />

                        <DetailRow
                            label="Office Location"
                            value="Main Office - Makati"
                        />

                        <DetailRow
                            label="Created At"
                            value="September 15, 2026 • 10:43 AM"
                        />

                    </div>

                </div>

                {/* RIGHT SIDE */}
                <div className="space-y-4">

                    {/* PRIORITY CHANGE */}
                    <div className="rounded-xl border border-gray-300 bg-white p-5">

                        <div className="mb-4 flex items-center gap-2 border-b border-gray-200 pb-3">
                            <ArrowUpDown
                                size={19}
                                className="text-gray-600"
                            />

                            <h2 className="text-base font-semibold text-black">
                                Priority Change
                            </h2>
                        </div>

                        <div className="flex items-center justify-center gap-5">

                            {/* CURRENT */}
                            <div className="flex min-w-[180px] flex-1 flex-col items-center rounded-xl border border-amber-200 bg-amber-50 px-4 py-5">

                                <p className="text-xs font-medium text-amber-700">
                                    Current Priority
                                </p>

                                <p className="mt-2 text-3xl font-semibold text-amber-700">
                                    P3
                                </p>

                                <p className="mt-1 text-sm font-medium text-amber-700">
                                    Medium
                                </p>

                            </div>

                            <ArrowRight
                                size={22}
                                className="shrink-0 text-gray-500"
                            />

                            {/* REQUESTED */}
                            <div className="flex min-w-[180px] flex-1 flex-col items-center rounded-xl border border-orange-200 bg-orange-50 px-4 py-5">

                                <p className="text-xs font-medium text-orange-700">
                                    Requested Priority
                                </p>

                                <p className="mt-2 text-3xl font-semibold text-orange-700">
                                    P2
                                </p>

                                <p className="mt-1 text-sm font-medium text-orange-700">
                                    High
                                </p>

                            </div>

                        </div>

                    </div>

                    {/* REQUEST INFORMATION */}
                    <div className="rounded-xl border border-gray-300 bg-white p-5">

                        <div className="mb-3 flex items-center gap-2 border-b border-gray-200 pb-3">
                            <UserRound
                                size={19}
                                className="text-gray-600"
                            />

                            <h2 className="text-base font-semibold text-black">
                                Request Information
                            </h2>
                        </div>

                        <div className="divide-y divide-gray-200">

                            <DetailRow
                                label="Requested By"
                                value="Nicole Garcia"
                            />

                            <DetailRow
                                label="IT Department"
                                value="Help Desk"
                            />

                            <DetailRow
                                label="Request Type"
                                value="Priority Change"
                            />

                            <DetailRow
                                label="Requested At"
                                value="September 15, 2026 • 11:29 PM"
                            />

                            <div className="grid grid-cols-[145px_1fr] items-center gap-4 py-3">

                                <span className="text-sm text-gray-500">
                                    Status
                                </span>

                                <div>
                                    <span className="inline-flex rounded-md border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                                        Pending
                                    </span>
                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

            {/* REASON */}
            <div className="rounded-xl border border-gray-300 bg-white p-5">

                <div className="mb-3 flex items-center gap-2">
                    <MessageSquareText
                        size={19}
                        className="text-gray-600"
                    />

                    <h2 className="text-base font-semibold text-black">
                        Reason for Request
                    </h2>
                </div>

                <div className="rounded-lg bg-gray-50 px-4 py-3">
                    <p className="text-sm leading-6 text-black">
                        Cannot access the company account to complete my
                        tasks. This needs to be prioritized because it is
                        affecting our team's deliverables for today.
                    </p>
                </div>

            </div>

            {/* REVIEW ACTION */}
            <div className="rounded-xl border border-gray-300 bg-white">

                {/* ACTION HEADER */}
                <div className="flex items-center justify-between gap-6 border-b border-gray-200 px-5 py-4">

                    <div className="flex items-start gap-3">

                        <ClipboardCheck
                            size={20}
                            className="mt-0.5 text-gray-600"
                        />

                        <div>
                            <h2 className="text-base font-semibold text-black">
                                Review Action
                            </h2>

                            <p className="mt-0.5 text-sm text-gray-500">
                                Review this priority change request and take the appropriate action.
                            </p>
                        </div>

                    </div>

                    <div className="flex shrink-0 items-center gap-2">

                        <button
                            type="button"
                            className="flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-green-500 bg-white px-4 text-sm font-medium text-green-700 transition-colors hover:bg-green-50"
                        >
                            <Check size={17} />
                            Approve Request
                        </button>

                        <button
                            type="button"
                            className="flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-red-400 bg-white px-4 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                        >
                            <X size={17} />
                            Reject Request
                        </button>

                    </div>

                </div>

                {/* REMARKS */}
                <div className="px-5 py-4">

                    <label
                        htmlFor="review-remarks"
                        className="mb-2 block text-sm font-medium text-black"
                    >
                        Review Remarks
                        <span className="ml-1 font-normal text-gray-500">
                            (Optional)
                        </span>
                    </label>

                    <textarea
                        id="review-remarks"
                        rows={4}
                        maxLength={500}
                        placeholder="Add your remarks here..."
                        className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-black outline-none transition placeholder:text-gray-400 focus:border-[#4C4CF9] focus:ring-2 focus:ring-[#4C4CF9]/10"
                    />

                    <div className="mt-1 text-right text-xs text-gray-400">
                        0/500
                    </div>

                </div>

            </div>

        </div>
    );
}

function DetailRow({
    label,
    value,
}) {
    return (
        <div className="grid grid-cols-[145px_1fr] items-center gap-4 py-3">

            <span className="text-sm text-gray-500">
                {label}
            </span>

            <span className="text-sm font-medium text-black">
                {value}
            </span>

        </div>
    );
}