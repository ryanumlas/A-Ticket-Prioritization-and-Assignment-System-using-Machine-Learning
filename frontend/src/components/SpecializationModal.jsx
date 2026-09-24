import { useEffect, useMemo, useState } from "react";
import { Check, Search, X } from "lucide-react";

export default function SpecializationModal({
    open,
    specializations,
    selectedSpecializations,
    onClose,
    onDone,
}) {
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState([]);

    useEffect(() => {
        if (open) {
            setSearch("");
            setSelected(selectedSpecializations || []);
        }
    }, [open, selectedSpecializations]);

    const filteredSpecializations = useMemo(() => {
        const searchValue = search.trim().toLowerCase();

        if (!searchValue) {
            return specializations;
        }

        return specializations.filter((specialization) =>
            specialization.name
                .toLowerCase()
                .includes(searchValue)
        );
    }, [search, specializations]);

    const toggleSpecialization = (id) => {
        setSelected((previous) => {
            if (previous.includes(id)) {
                return previous.filter(
                    (specializationId) =>
                        specializationId !== id
                );
            }

            return [...previous, id];
        });
    };

    const handleDone = () => {
        onDone(selected);
    };

    if (!open) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <button
                type="button"
                aria-label="Close specialization modal"
                onClick={onClose}
                className="absolute inset-0 cursor-default bg-black/30"
            />

            <div className="relative z-10 flex w-full max-w-lg flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl">
                <div className="flex items-start justify-between border-b border-gray-200 px-5 py-4">
                    <div>
                        <h2 className="text-base font-semibold text-black">
                            Select Specializations
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Select one or more specializations for this IT Support Specialist.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-black"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="border-b border-gray-200 p-4">
                    <div className="relative">
                        <Search
                            size={17}
                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />

                        <input
                            type="text"
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                            placeholder="Search specializations..."
                            className="h-10 w-full rounded-md border border-gray-300 bg-white pl-9 pr-3 text-sm outline-none focus:border-[#4C4CF9]"
                        />
                    </div>
                </div>

                <div className="max-h-[320px] overflow-y-auto p-2">
                    {filteredSpecializations.length === 0 ? (
                        <div className="px-4 py-10 text-center">
                            <p className="text-sm text-gray-500">
                                No specializations found.
                            </p>
                        </div>
                    ) : (
                        filteredSpecializations.map(
                            (specialization) => {
                                const isSelected =
                                    selected.includes(
                                        specialization.id
                                    );

                                return (
                                    <button
                                        key={
                                            specialization.id
                                        }
                                        type="button"
                                        onClick={() =>
                                            toggleSpecialization(
                                                specialization.id
                                            )
                                        }
                                        className={`flex w-full cursor-pointer items-center gap-3 rounded-md px-3 py-3 text-left transition-colors ${
                                            isSelected
                                                ? "bg-[#4C4CF9]/5"
                                                : "hover:bg-gray-50"
                                        }`}
                                    >
                                        <span
                                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                                                isSelected
                                                    ? "border-[#4C4CF9] bg-[#4C4CF9] text-white"
                                                    : "border-gray-300 bg-white"
                                            }`}
                                        >
                                            {isSelected && (
                                                <Check
                                                    size={14}
                                                    strokeWidth={
                                                        2.5
                                                    }
                                                />
                                            )}
                                        </span>

                                        <span className="min-w-0 flex-1 text-sm text-gray-800">
                                            {
                                                specialization.name
                                            }
                                        </span>
                                    </button>
                                );
                            }
                        )
                    )}
                </div>

                <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-5 py-4">
                    <p className="text-sm text-gray-500">
                        {selected.length}{" "}
                        {selected.length === 1
                            ? "specialization"
                            : "specializations"}{" "}
                        selected
                    </p>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="h-9 cursor-pointer rounded-md border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            onClick={handleDone}
                            className="h-9 cursor-pointer rounded-md bg-[#4C4CF9] px-4 text-sm font-medium text-white transition-colors hover:bg-[#3f3fe8]"
                        >
                            Done
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}