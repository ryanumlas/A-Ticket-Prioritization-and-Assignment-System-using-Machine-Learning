import {
    Gauge,
    MessageSquareReply,
    CircleCheckBig,
} from "lucide-react";

export default function SLAOverview() {
    const responseSLA = 94;
    const resolutionSLA = 88;

    const overallSLA = Math.round(
        (responseSLA + resolutionSLA) / 2
    );

    return (
        <div className="h-full rounded-xl border border-gray-300 bg-white p-6">

            {/* HEADER */}
            <div className="mb-6 flex items-start justify-between">

                <div>
                    <h2 className="text-xl font-semibold text-black">
                        Overall SLA Performance
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        SLA compliance across your assigned tickets
                    </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                    <Gauge
                        size={20}
                        className="text-black"
                    />
                </div>

            </div>

            {/* MAIN COMPLIANCE */}
            <div className="rounded-lg border border-gray-300 bg-gray-50 px-5 py-6">

                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Overall Compliance
                </p>

                <div className="mt-3 flex items-end gap-2">

                    <h3 className="text-4xl font-semibold text-black">
                        {overallSLA}%
                    </h3>

                    <span className="mb-1 rounded-md bg-green-50 px-2 py-1 text-xs font-semibold text-green-700">
                        Within SLA
                    </span>

                </div>

                <p className="mt-2 text-xs leading-5 text-gray-500">
                    Overall response and resolution SLA performance.
                </p>

            </div>

            {/* SLA BREAKDOWN */}
            <div className="mt-4 grid grid-cols-2 gap-4">

                {/* RESPONSE SLA */}
                <div className="rounded-lg border border-gray-300 p-4">

                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gray-100">
                            <MessageSquareReply
                                size={16}
                                className="text-black"
                            />
                        </div>

                        <p className="text-sm font-medium text-black">
                            Response SLA
                        </p>
                    </div>

                    <p className="mt-4 text-2xl font-semibold text-[#4C4CF9]">
                        {responseSLA}%
                    </p>

                    <p className="mt-1 text-xs leading-5 text-gray-500">
                        Tickets responded to within the required time.
                    </p>

                </div>

                {/* RESOLUTION SLA */}
                <div className="rounded-lg border border-gray-300 p-4">

                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gray-100">
                            <CircleCheckBig
                                size={16}
                                className="text-black"
                            />
                        </div>

                        <p className="text-sm font-medium text-black">
                            Resolution SLA
                        </p>
                    </div>

                    <p className="mt-4 text-2xl font-semibold text-[#4C4CF9]">
                        {resolutionSLA}%
                    </p>

                    <p className="mt-1 text-xs leading-5 text-gray-500">
                        Tickets resolved within the required time.
                    </p>

                </div>

            </div>

        </div>
    );
}