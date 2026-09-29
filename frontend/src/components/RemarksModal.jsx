export default function RemarksModal({
    open,
    title = "Complete Ticket Review",
    description,
    remarks,
    setRemarks,
    onCancel,
    onConfirm,
    loading = false,
    confirmText = "Confirm Review",
}) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 px-4">
            <div className="w-full max-w-[430px] rounded-xl bg-white p-5 shadow-xl">
                <p className="text-base font-semibold text-black">{title}</p>

                {description && (
                    <p className="mt-2 text-sm leading-6 text-gray-500">
                        {description}
                    </p>
                )}

                <div className="mt-4">
                    <label className="mb-1.5 block text-sm font-medium text-black">
                        Review Remarks
                    </label>

                    <textarea
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        disabled={loading}
                        rows={4}
                        maxLength={1000}
                        placeholder="Add review remarks..."
                        className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-black outline-none transition-colors placeholder:text-gray-400 focus:border-[#4C4CF9] focus:ring-2 focus:ring-[#4C4CF9]/10 disabled:bg-gray-100"
                    />

                    <div className="mt-1 flex justify-between text-xs text-gray-400">
                        <span>Add additional context if needed.</span>
                        <span>{remarks.length}/1000</span>
                    </div>
                </div>

                <div className="mt-5 flex justify-end gap-2">
                    <button
                        type="button"
                        disabled={loading}
                        onClick={onCancel}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        disabled={loading}
                        onClick={onConfirm}
                        className="rounded-lg bg-[#4C4CF9] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#3f3fe0] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading ? "Processing..." : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}