import {
    Gauge,
    MessageSquareReply,
    CircleCheckBig,
} from "lucide-react";

export default function SLAOverviewSupport() {
    const responseSLA = 94;
    const resolutionSLA = 88;

    const overallSLA = Math.round(
        (responseSLA + resolutionSLA) / 2
    );

    return (
        <div className="h-full rounded-xl border border-gray-300 bg-white p-6">

            <div className="mb-6 flex items-start justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-black">
                        Overall SLA Performance
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        SLA performance across your assigned tickets.
                    </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                    <Gauge
                        size={20}
                        className="text-black"
                    />
                </div>
            </div>

            {/* OVERALL */}
            <div className="rounded-lg border border-gray-300 bg-gray-50 px-5 py-5">
                <p className="text-xs font-semibold uppercase text-gray-500">
                    Overall Compliance
                </p>

                <div className="mt-3 flex items-end gap-3">
                    <p className="text-4xl font-semibold text-black">
                        {overallSLA}%
                    </p>

                    <span className="mb-1 rounded-md bg-green-50 px-2 py-1 text-xs font-semibold text-green-700">
                        Within SLA
                    </span>
                </div>

                <p className="mt-2 text-xs text-gray-500">
                    Combined response and resolution performance.
                </p>
            </div>

            {/* BREAKDOWN */}
            <div className="mt-4 grid grid-cols-2 gap-4">

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

                    <p className="mt-1 text-xs text-gray-500">
                        Responses completed within SLA.
                    </p>
                </div>

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

                    <p className="mt-1 text-xs text-gray-500">
                        Resolutions completed within SLA.
                    </p>
                </div>

            </div>
        </div>
    );
}