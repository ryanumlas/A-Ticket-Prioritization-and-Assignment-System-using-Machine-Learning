import { ArrowLeft, Headphones, Home, SearchX } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
            <div className="w-full max-w-2xl text-center">
                {/* Corporate Icon */}
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
                    <Headphones
                        size={30}
                        strokeWidth={1.8}
                        className="text-[#2563EB]"
                    />
                </div>

                {/* Error Code */}
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#2563EB]">
                    Error 404
                </p>

                {/* Title */}
                <h1 className="mt-3 text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
                    Page not found
                </h1>

                {/* Description */}
                <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-gray-500 sm:text-base">
                    The page you are looking for may have been moved,
                    removed, or is temporarily unavailable. Please
                    check the URL or return to your workspace.
                </p>

                {/* Actions */}
                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="inline-flex min-h-[42px] cursor-pointer items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                    >
                        <ArrowLeft size={17} />
                        Go Back
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate("/")}
                        className="inline-flex min-h-[42px] cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#1D4ED8]"
                    >
                        <Home size={17} />
                        Go to Dashboard
                    </button>
                </div>

                {/* Support Reference */}
                <div className="mx-auto mt-12 flex max-w-md items-center gap-3 border-t border-gray-200 pt-5 text-left">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                        <SearchX
                            size={17}
                            className="text-gray-500"
                        />
                    </div>

                    <div>
                        <p className="text-xs font-medium text-gray-700">
                            Need assistance?
                        </p>

                        <p className="mt-0.5 text-xs text-gray-500">
                            Contact your service desk if you believe
                            this page should be available.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}