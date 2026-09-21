import { useMemo, useState, useEffect } from "react";
import {
    Search,
    X,
    Check,
    Tag,
} from "lucide-react";
import api from "/src/api";
import { motion, AnimatePresence } from "motion/react";

export default function SymptomCodeSheet({
    open,
    onClose,
    onSelect,
    excludeDepartment,
}) {
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");
    const [selectedSymptom, setSelectedSymptom] = useState(null);
    const [symptomCodes, setSymptomCodes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSymptomCodeList = async () => {
            try {
                setLoading(true);

                const response = await api.get(
                    "/tickets/symptom-code/list/"
                );

                setSymptomCodes(response.data);
            } finally {
                setLoading(false);
            }
        };

        fetchSymptomCodeList();
    }, []);

    useEffect(() => {
        if (!open) {
            setSearch("");
            setCategory("All");
            setSelectedSymptom(null);
        }
    }, [open]);

    const categories = [
        "All",
        ...new Set(
            symptomCodes
                .map((item) => item.category)
                .filter(Boolean)
        ),
    ];

    const normalizedExcludeDepartment =
        typeof excludeDepartment === "string"
            ? excludeDepartment.trim().toLowerCase()
            : "";

    const filteredSymptoms = useMemo(() => {
        const query = search.trim().toLowerCase();

        return symptomCodes.filter((symptom) => {
            const code =
                symptom.code?.trim().toLowerCase() || "";

            const description =
                symptom.description?.toLowerCase() || "";

            const symptomCategory =
                symptom.category?.toLowerCase() || "";

            const department =
                symptom.department?.trim().toLowerCase() || "";

            const belongsToCurrentDepartment =
                normalizedExcludeDepartment &&
                department === normalizedExcludeDepartment;

            const matchesSearch =
                !query ||
                code.includes(query) ||
                description.includes(query) ||
                symptomCategory.includes(query) ||
                department.includes(query);

            const matchesCategory =
                category === "All" ||
                symptom.category === category;

            return (
                !belongsToCurrentDepartment &&
                matchesSearch &&
                matchesCategory
            );
        });
    }, [
        search,
        category,
        normalizedExcludeDepartment,
        symptomCodes,
    ]);

    const handleUseSelected = () => {
        if (!selectedSymptom) return;

        onSelect(selectedSymptom);
        onClose();
    };

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="fixed inset-0 z-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{
                        duration: 0.25,
                    }}
                >
                    <motion.button
                        type="button"
                        aria-label="Close symptom selector"
                        onClick={onClose}
                        initial={{
                            opacity: 0,
                        }}
                        animate={{
                            opacity: 1,
                        }}
                        exit={{
                            opacity: 0,
                        }}
                        transition={{
                            duration: 0.3,
                        }}
                        className="absolute inset-0 cursor-default bg-black/30"
                    />

                    <motion.div
                        initial={{
                            x: "100%",
                            opacity: 0,
                        }}
                        animate={{
                            x: 0,
                            opacity: 1,
                        }}
                        exit={{
                            x: "100%",
                            opacity: 0,
                        }}
                        transition={{
                            duration: 0.5,
                            ease: "easeOut",
                        }}
                        className="absolute right-0 top-0 flex h-full w-full max-w-[520px] flex-col border-l border-gray-300 bg-white"
                    >
                        <div className="flex items-start justify-between border-b border-gray-300 px-6 py-5">
                            <div>
                                <h2 className="text-lg font-semibold text-black">
                                    Select Symptom Code
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Search and select the correct symptom
                                    classification for this ticket.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={onClose}
                                className="flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 text-black transition hover:bg-gray-100"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="space-y-4 border-b border-gray-300 px-6 py-5">
                            <div>
                                <label className="mb-2 block text-xs font-semibold uppercase text-gray-500">
                                    Search
                                </label>

                                <div className="flex items-center rounded-md border border-gray-300 bg-white px-3 focus-within:border-[#4C4CF9]">
                                    <Search
                                        size={18}
                                        className="shrink-0 text-gray-500"
                                    />

                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
                                        placeholder="Search code, symptom, or category..."
                                        className="w-full bg-transparent px-3 py-3 text-sm text-black outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-xs font-semibold uppercase text-gray-500">
                                    Category
                                </label>

                                <select
                                    value={category}
                                    onChange={(e) =>
                                        setCategory(e.target.value)
                                    }
                                    className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-sm text-black outline-none focus:border-[#4C4CF9]"
                                >
                                    {categories.map((item) => (
                                        <option
                                            key={item}
                                            value={item}
                                        >
                                            {item === "All"
                                                ? "All Categories"
                                                : item}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
                            <div className="mb-3 flex items-center justify-between">
                                <p className="text-xs font-semibold uppercase text-gray-500">
                                    Symptom Codes
                                </p>

                                <p className="text-xs text-gray-500">
                                    {filteredSymptoms.length} result
                                    {filteredSymptoms.length !== 1 &&
                                        "s"}
                                </p>
                            </div>

                            <div className="space-y-2">
                                {loading ? (
                                    <div className="rounded-md border border-gray-300 px-4 py-10 text-center">
                                        <p className="text-sm text-gray-500">
                                            Loading symptom codes...
                                        </p>
                                    </div>
                                ) : filteredSymptoms.length > 0 ? (
                                    filteredSymptoms.map((symptom) => {
                                        const isSelected =
                                            selectedSymptom?.code ===
                                            symptom.code;

                                        return (
                                            <button
                                                key={symptom.id}
                                                type="button"
                                                onClick={() =>
                                                    setSelectedSymptom(
                                                        symptom
                                                    )
                                                }
                                                className={`w-full rounded-md border p-4 text-left transition ${
                                                    isSelected
                                                        ? "border-[#4C4CF9] bg-[#4C4CF9]/5"
                                                        : "border-gray-300 bg-white hover:bg-gray-50"
                                                }`}
                                            >
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-sm font-semibold text-black">
                                                                {
                                                                    symptom.code
                                                                }
                                                            </p>

                                                            {isSelected && (
                                                                <Check
                                                                    size={
                                                                        16
                                                                    }
                                                                    className="text-[#4C4CF9]"
                                                                />
                                                            )}
                                                        </div>

                                                        <p className="mt-1 text-sm text-black">
                                                            {
                                                                symptom.description
                                                            }
                                                        </p>

                                                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5">
                                                            <div className="flex items-center gap-1.5">
                                                                <Tag
                                                                    size={
                                                                        13
                                                                    }
                                                                    className="text-gray-500"
                                                                />

                                                                <p className="text-xs text-gray-500">
                                                                    {
                                                                        symptom.category
                                                                    }
                                                                </p>
                                                            </div>

                                                            {symptom.department && (
                                                                <p className="text-xs text-gray-500">
                                                                    IT
                                                                    Department:{" "}
                                                                    <span className="font-medium text-gray-700">
                                                                        {
                                                                            symptom.department
                                                                        }
                                                                    </span>
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })
                                ) : (
                                    <div className="rounded-md border border-gray-300 px-4 py-10 text-center">
                                        <p className="text-sm font-medium text-black">
                                            No symptom codes found.
                                        </p>

                                        <p className="mt-1 text-xs text-gray-500">
                                            Try changing your search or
                                            category.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="border-t border-gray-300 bg-white px-6 py-4">
                            {selectedSymptom && (
                                <div className="mb-4 rounded-md border border-gray-300 bg-gray-50 px-4 py-3">
                                    <p className="text-xs font-semibold uppercase text-gray-500">
                                        Selected Symptom
                                    </p>

                                    <p className="mt-1 text-sm font-semibold text-black">
                                        {selectedSymptom.code}
                                    </p>

                                    {selectedSymptom.department && (
                                        <p className="mt-1 text-xs text-gray-500">
                                            IT Department:{" "}
                                            <span className="font-medium text-gray-700">
                                                {
                                                    selectedSymptom.department
                                                }
                                            </span>
                                        </p>
                                    )}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="rounded-md border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-gray-100"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    disabled={!selectedSymptom}
                                    onClick={handleUseSelected}
                                    className={`rounded-md border px-4 py-3 text-sm font-semibold transition ${
                                        selectedSymptom
                                            ? "cursor-pointer border-[#4C4CF9] bg-[#4C4CF9] text-white hover:bg-[#4242e8]"
                                            : "cursor-not-allowed border-gray-300 bg-gray-100 text-gray-400"
                                    }`}
                                >
                                    Use Selected Code
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}