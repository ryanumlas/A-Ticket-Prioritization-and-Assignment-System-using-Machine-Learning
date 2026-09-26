import {
    Users,
    X,
    Info,
    Ticket,
} from "lucide-react";

export default function RequestAssistanceModal({
    open,
    onClose,
    ticketDetails,
}) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 px-4">

            <div className="w-full max-w-[500px] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">

                {/* HEADER */}
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
                        className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                    >
                        <X size={18} />
                    </button>

                </div>

                {/* BODY */}
                <div className="space-y-5 px-5 py-5">

                    {/* TICKET INFORMATION */}
                    <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3.5">

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white">
                            <Ticket
                                size={18}
                                className="text-gray-500"
                            />
                        </div>

                        <div className="min-w-0">
                            <p className="text-xs font-medium text-gray-500">
                                Ticket
                            </p>

                            <p className="mt-0.5 text-sm font-semibold text-black">
                                {ticketDetails?.ticket_code || "-"}
                            </p>

                            <p
                                className="mt-0.5 truncate text-sm text-gray-600"
                                title={ticketDetails?.subject}
                            >
                                {ticketDetails?.subject || "-"}
                            </p>
                        </div>

                    </div>

                    {/* ASSISTANCE DEPARTMENT */}
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
                            defaultValue={ticketDetails?.it_department?.id || ""}
                            className="h-11 w-full cursor-pointer rounded-lg border border-gray-300 bg-white px-3 text-sm text-black outline-none transition focus:border-[#4C4CF9] focus:ring-2 focus:ring-[#4C4CF9]/10"
                        >
                            <option value="" disabled>
                                Select assistance department
                            </option>

                            {/* TEMPORARY STATIC OPTIONS */}
                            <option value="1">
                                Network
                            </option>

                            <option value="2">
                                Software
                            </option>

                            <option value="3">
                                Hardware
                            </option>

                            <option value="4">
                                Account & Access
                            </option>
                        </select>

                        <p className="mt-1.5 text-xs text-gray-500">
                            Select the IT department you need assistance from.
                        </p>
                    </div>

                    {/* ASSISTANCE DETAILS */}
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
                            rows={4}
                            maxLength={500}
                            placeholder="Describe what you need assistance with..."
                            className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-black outline-none transition placeholder:text-gray-400 focus:border-[#4C4CF9] focus:ring-2 focus:ring-[#4C4CF9]/10"
                        />
                    </div>

                    {/* INFO */}
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

                {/* FOOTER */}
                <div className="flex items-center justify-end gap-2 border-t border-gray-200 bg-gray-50/50 px-5 py-4">

                    <button
                        type="button"
                        onClick={onClose}
                        className="h-9 cursor-pointer rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium transition-colors hover:bg-gray-50"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        className="h-9 cursor-pointer rounded-lg bg-[#4C4CF9] px-4 text-sm font-medium text-white transition-colors hover:bg-[#3a3ae0]"
                    >
                        Request Assistance
                    </button>

                </div>

            </div>
        </div>
    );
}