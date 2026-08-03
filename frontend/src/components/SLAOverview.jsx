export default function SLAOverview() {
    const responseSLA = 88;
    const resolutionSLA = 74;

    return (
        <div className="bg-white border border-gray-300 rounded-xl p-6 h-full">
            <div className="mb-6">
                <h2 className="text-xl font-semibold">SLA Overview</h2>
                <p className="text-sm text-gray-500">
                    Monitor service level agreement performance
                </p>
            </div>

            <div className="space-y-6">

                <div>
                    <div className="flex justify-between items-center mb-2">
                        <p className="font-medium text-gray-700">
                            Response SLA
                        </p>
                        <span className="font-semibold text-black">
                            {responseSLA}%
                        </span>
                    </div>

                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-[#4C4CF9] rounded-full"
                            style={{ width: `${responseSLA}%` }}
                        />
                    </div>

                    <p className="text-xs text-gray-500 mt-2">
                        Tickets responded to within SLA
                    </p>
                </div>

                <div>
                    <div className="flex justify-between items-center mb-2">
                        <p className="font-medium text-gray-700">
                            Resolution SLA
                        </p>
                        <span className="font-semibold text-black">
                            {resolutionSLA}%
                        </span>
                    </div>

                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-[#4C4CF9] rounded-full"
                            style={{ width: `${resolutionSLA}%` }}
                        />
                    </div>

                    <p className="text-xs text-gray-500 mt-2">
                        Tickets resolved within SLA
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">

                    <div className="border border-red-200 bg-red-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600">
                            Breached
                        </p>
                        <h3 className="text-2xl font-bold text-red-600">
                            3
                        </h3>
                    </div>

                    <div className="border border-orange-200 bg-orange-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600">
                            At Risk
                        </p>
                        <h3 className="text-2xl font-bold text-orange-600">
                            6
                        </h3>
                    </div>

                </div>
            </div>
        </div>
    );
}