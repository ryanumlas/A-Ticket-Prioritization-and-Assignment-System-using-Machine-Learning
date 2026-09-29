import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";
import api from "../api";

const sections = {
    departments: {
        title: "Departments",
        description: "View IT and employee departments.",
        datasets: [
            {
                label: "IT Departments",
                endpoint: "/departments/list/",
                columns: [
                    { key: "name", label: "Department" },
                    { key: "description", label: "Description" },
                    { key: "created_at", label: "Created", format: "date" },
                ],
            },
            {
                label: "Employee Departments",
                endpoint: "/departments/employee/list/",
                columns: [
                    { key: "name", label: "Department" },
                    { key: "created_at", label: "Created", format: "date" },
                ],
            },
        ],
    },
    categories: {
        title: "Categories",
        description: "View ticket categories and their assigned IT departments.",
        datasets: [
            {
                label: "Categories",
                endpoint: "/tickets/categories/list/",
                columns: [
                    { key: "name", label: "Category" },
                    { key: "it_department_name", label: "IT Department" },
                    { key: "created_at", label: "Created", format: "date" },
                ],
            },
        ],
    },
    symptomCodes: {
        title: "Symptom Codes",
        description: "View symptom codes used to classify tickets.",
        datasets: [
            {
                label: "Symptom Codes",
                endpoint: "/tickets/symptom-code/list/",
                columns: [
                    { key: "code", label: "Code" },
                    { key: "description", label: "Description" },
                    { key: "category", label: "Category" },
                    { key: "department", label: "IT Department" },
                    { key: "based_priority", label: "Base Priority" },
                    { key: "created_at", label: "Created", format: "date" },
                ],
            },
        ],
    },
    specializations: {
        title: "Specializations",
        description: "View the specializations available to IT Support Specialists.",
        datasets: [
            {
                label: "Specializations",
                endpoint: "/users/admin/create-options/specializations/",
                columns: [
                    { key: "name", label: "Specialization" },
                    { key: "created_at_formatted", label: "Created" },
                ],
            },
        ],
    },
    slaRules: {
        title: "SLA Rules",
        description: "View response and resolution targets by priority.",
        datasets: [
            {
                label: "SLA Rules",
                endpoint: "/tickets/sla-rules/list/",
                columns: [
                    { key: "priority_level", label: "Priority" },
                    { key: "response_time", label: "Response Time" },
                    { key: "resolution_time", label: "Resolution Time" },
                    { key: "created_at", label: "Created", format: "date" },
                    { key: "updated_at", label: "Last Updated", format: "date" },
                ],
            },
        ],
    },
};

function formatCell(value, format) {
    if (value === null || value === undefined || value === "") {
        return "-";
    }

    if (format === "date") {
        const date = new Date(value);
        return Number.isNaN(date.getTime())
            ? "-"
            : date.toLocaleDateString([], {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
              });
    }

    return String(value);
}

export default function SystemAdConfigList({ sectionKey }) {
    const section = sections[sectionKey];
    const [rowsByDataset, setRowsByDataset] = useState([]);
    const [selectedDataset, setSelectedDataset] = useState(0);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(15);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;

        const loadDatasets = async () => {
            setLoading(true);

            try {
                const responses = await Promise.all(
                    section.datasets.map((dataset) =>
                        api.get(dataset.endpoint)
                    )
                );

                if (active) {
                    setRowsByDataset(
                        responses.map((response) => {
                            const data = response.data;
                            return Array.isArray(data)
                                ? data
                                : data?.results || [];
                        })
                    );
                }
            } catch {
                if (active) {
                    setRowsByDataset(section.datasets.map(() => []));
                    toast.error(`Failed to load ${section.title.toLowerCase()}.`);
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        loadDatasets();

        return () => {
            active = false;
        };
    }, [section]);

    const dataset = section.datasets[selectedDataset];
    const rows = rowsByDataset[selectedDataset] || [];
    const normalizedSearch = search.trim().toLowerCase();
    const filteredRows = rows.filter((row) =>
        dataset.columns.some((column) =>
            String(row[column.key] ?? "")
                .toLowerCase()
                .includes(normalizedSearch)
        )
    );
    const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
    const visibleRows = filteredRows.slice((page - 1) * pageSize, page * pageSize);

    const changeDataset = (index) => {
        setSelectedDataset(index);
        setSearch("");
        setPage(1);
    };

    return (
        <div className="min-h-full overflow-y-auto bg-gray-50">
            <div className="border-b border-gray-200 bg-white px-5 py-4">
                <h1 className="text-xl font-semibold text-gray-900">{section.title}</h1>
                <p className="mt-0.5 text-sm text-gray-500">{section.description}</p>
            </div>

            {section.datasets.length > 1 && (
                <div className="border-b border-gray-200 bg-white px-5 py-3">
                    <div className="flex w-fit flex-wrap gap-1 rounded-lg bg-gray-100 p-1">
                        {section.datasets.map((item, index) => (
                            <button
                                key={item.label}
                                type="button"
                                onClick={() => changeDataset(index)}
                                className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                                    selectedDataset === index
                                        ? "bg-[#4C4CF9] text-white shadow-sm"
                                        : "text-gray-600 hover:bg-white hover:text-gray-900"
                                }`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-3 border-b border-gray-200 bg-white px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full sm:max-w-md">
                    <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="search"
                        value={search}
                        onChange={(event) => {
                            setSearch(event.target.value);
                            setPage(1);
                        }}
                        placeholder={`Search ${dataset.label.toLowerCase()}...`}
                        className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100"
                    />
                </div>
                <select
                    value={pageSize}
                    onChange={(event) => {
                        setPageSize(Number(event.target.value));
                        setPage(1);
                    }}
                    className="h-10 cursor-pointer rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none focus:border-[#2563EB]"
                >
                    <option value={15}>15 / page</option>
                    <option value={25}>25 / page</option>
                    <option value={50}>50 / page</option>
                    <option value={100}>100 / page</option>
                </select>
            </div>

            <div className="max-h-[calc(100vh-290px)] min-h-[320px] overflow-auto bg-white">
                <table className="w-full min-w-[700px] table-auto text-left text-sm">
                    <thead className="sticky top-0 z-10 bg-gray-50">
                        <tr className="border-b border-gray-300">
                            {dataset.columns.map((column) => (
                                <th key={column.key} className="px-4 py-3 font-semibold text-gray-900">
                                    {column.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={dataset.columns.length} className="px-6 py-16 text-center text-gray-500">
                                    Loading {dataset.label.toLowerCase()}...
                                </td>
                            </tr>
                        ) : visibleRows.length ? (
                            visibleRows.map((row) => (
                                <tr key={row.id} className="border-b border-gray-100 last:border-0">
                                    {dataset.columns.map((column) => (
                                        <td key={column.key} className="max-w-[420px] px-4 py-4 text-gray-700">
                                            <span className="block truncate" title={formatCell(row[column.key], column.format)}>
                                                {formatCell(row[column.key], column.format)}
                                            </span>
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={dataset.columns.length} className="px-6 py-16 text-center">
                                    <p className="font-medium text-gray-900">No {dataset.label.toLowerCase()} found</p>
                                    <p className="mt-1 text-sm text-gray-500">There are no records matching your search.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-gray-200 bg-white px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-gray-500">
                    Showing {loading ? 0 : visibleRows.length} of {loading ? 0 : filteredRows.length} {dataset.label.toLowerCase()}
                </p>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        disabled={page <= 1 || loading}
                        onClick={() => setPage((current) => Math.max(current - 1, 1))}
                        className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                            page <= 1 || loading
                                ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                                : "cursor-pointer border-[#2563EB] bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
                        }`}
                    >
                        Previous
                    </button>
                    <span className="min-w-[100px] text-center text-sm text-gray-600">
                        Page {page} of {totalPages}
                    </span>
                    <button
                        type="button"
                        disabled={page >= totalPages || loading}
                        onClick={() => setPage((current) => Math.min(current + 1, totalPages))}
                        className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                            page >= totalPages || loading
                                ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                                : "cursor-pointer border-[#2563EB] bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
                        }`}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}