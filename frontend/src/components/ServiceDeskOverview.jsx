import {
    FolderOpen,
    Bot,
    Flag,
    Undo2,
} from "lucide-react";

export default function ServiceDeskOverview() {
    return (
        <div className="w-full bg-white border border-gray-300 rounded-xl p-6">
            <h1 className="text-xl font-semibold mb-6">Overview</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

                <div className="border border-gray-300 rounded-xl p-5 hover:shadow-md transition">
                    <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <FolderOpen className="text-blue-600" size={18} />
                        </div>

                        <span className="text-xs text-blue-600 border border-blue-300 font-semibold bg-blue-50 px-2 py-1 rounded-lg">
                            Active
                        </span>
                    </div>

                    <p className="text-sm text-gray-500 mt-5">
                        Open Tickets
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-1">
                        12
                    </h2>

                    <p className="text-xs text-gray-400 mt-2">
                        Waiting for assignment
                    </p>
                </div>

                <div className="border border-gray-300 rounded-xl p-5 hover:shadow-md transition">
                    <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                            <Bot className="text-purple-600" size={18} />
                        </div>

                        <span className="text-xs text-purple-600 border border-purple-300 font-semibold bg-purple-50 px-2 py-1 rounded-lg">
                            Artificial Intelligence
                        </span>
                    </div>

                    <p className="text-sm text-gray-500 mt-5">
                        Auto Classified
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-1">
                        92%
                    </h2>

                    <p className="text-xs text-gray-400 mt-2">
                        Classified automatically
                    </p>
                </div>

                <div className="border border-gray-300  rounded-xl p-5 hover:shadow-md transition">
                    <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                            <Flag className="text-red-600" size={18} />
                        </div>

                        <span className="text-xs text-red-600 font-semibold border border-red-300 bg-red-50 px-2 py-1 rounded-lg">
                            Review
                        </span>
                    </div>

                    <p className="text-sm text-gray-500 mt-5">
                        Flagged Tickets
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-1">
                        5
                    </h2>

                    <p className="text-xs text-gray-400 mt-2">
                        Requires manual review
                    </p>
                </div>

                <div className="border border-gray-300 rounded-xl p-5 hover:shadow-md transition">
                    <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                            <Undo2 className="text-amber-600" size={18} />
                        </div>

                        <span className="text-xs text-amber-600 font-semibold border border-amber-300 bg-amber-50 px-2 py-1 rounded-lg">
                            Returned
                        </span>
                    </div>

                    <p className="text-sm text-gray-500 mt-5">
                        Returned Tickets
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-1">
                        3
                    </h2>

                    <p className="text-xs text-gray-400 mt-2">
                        Waiting for employee update
                    </p>
                </div>

            </div>
        </div>
    );
}