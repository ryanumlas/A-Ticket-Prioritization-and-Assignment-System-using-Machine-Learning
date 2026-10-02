import { useEffect, useState } from "react";
import { Plus, Search, X } from "lucide-react";
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
                crud: {
                    label: "Department",
                    createEndpoint: "/departments/create/",
                    updateEndpoint: (row) => `/departments/update/${row.id}/`,
                    fields: [
                        { key: "name", label: "Department name", required: true, maxLength: 100 },
                        { key: "description", label: "Description", type: "textarea" },
                    ],
                },
                columns: [
                    { key: "name", label: "Department" },
                    { key: "description", label: "Description" },
                    { key: "created_at", label: "Created", format: "date" },
                ],
            },
            {
                label: "Employee Departments",
                endpoint: "/departments/employee/list/",
                crud: {
                    label: "Employee Department",
                    createEndpoint: "/departments/employee/create/",
                    fields: [
                        { key: "name", label: "Department name", required: true, maxLength: 100 },
                    ],
                },
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
                crud: {
                    label: "Category",
                    createEndpoint: "/tickets/categories/create/",
                    updateEndpoint: (row) => `/tickets/categories/update/${row.id}/`,
                    fields: [
                        { key: "name", label: "Category name", required: true, maxLength: 100 },
                        {
                            key: "it_department",
                            label: "IT Department",
                            type: "select",
                            required: true,
                            optionsEndpoint: "/departments/list/",
                            optionValue: "id",
                            optionLabel: "name",
                        },
                    ],
                },
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
                crud: {
                    label: "Symptom Code",
                    createEndpoint: "/tickets/symptom-code/create/",
                    updateEndpoint: (row) => `/tickets/symptom-codes/update/${row.id}/`,
                    fields: [
                        { key: "code", label: "Code", required: true, maxLength: 50 },
                        {
                            key: "category",
                            rowKey: "category_id",
                            label: "Category",
                            type: "select",
                            required: true,
                            optionsEndpoint: "/tickets/categories/list/",
                            optionValue: "id",
                            optionLabel: "name",
                        },
                        { key: "description", label: "Description", type: "textarea" },
                        {
                            key: "based_priority",
                            label: "Base Priority",
                            type: "select",
                            options: ["P1", "P2", "P3", "P4", "P5"],
                        },
                    ],
                },
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
                crud: {
                    label: "Specialization",
                    createEndpoint: "/users/specializations/create/",
                    updateEndpoint: (row) => `/users/specializations/update/${row.id}/`,
                    fields: [
                        { key: "name", label: "Specialization name", required: true, maxLength: 100 },
                    ],
                },
                columns: [
                    { key: "name", label: "Specialization" },
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
    const [configDialog, setConfigDialog] = useState(null);
    const [configForm, setConfigForm] = useState({});
    const [configOptions, setConfigOptions] = useState({});
    const [savingConfig, setSavingConfig] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

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
    }, [section, refreshKey]);

    const dataset = section.datasets[selectedDataset];
    const crud = dataset.crud;
    const hasRowActions = Boolean(crud?.updateEndpoint);
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

    const openConfigDialog = (mode, row = null) => {
        setConfigForm(
            Object.fromEntries(
                crud.fields.map((field) => [
                    field.key,
                    row?.[field.rowKey || field.key] ?? field.defaultValue ?? "",
                ])
            )
        );
        setConfigDialog({ mode, row });
    };

    useEffect(() => {
        if (!configDialog) {
            return undefined;
        }

        let active = true;
        const optionFields = crud.fields.filter((field) => field.optionsEndpoint);

        Promise.all(
            optionFields.map(async (field) => {
                const response = await api.get(field.optionsEndpoint);
                const data = response.data;
                return [field.key, Array.isArray(data) ? data : data?.results || []];
            })
        )
            .then((entries) => {
                if (active) {
                    setConfigOptions(Object.fromEntries(entries));
                }
            })
            .catch(() => {
                if (active) {
                    setConfigOptions({});
                    toast.error("Failed to load form options.");
                }
            });

        return () => {
            active = false;
        };
    }, [configDialog, crud]);

    const saveConfig = async (event) => {
        event.preventDefault();
        setSavingConfig(true);
        const isEditing = configDialog.mode === "edit";
        const endpoint = isEditing
            ? crud.updateEndpoint(configDialog.row)
            : crud.createEndpoint;
        const payload = Object.fromEntries(
            crud.fields.map((field) => [
                field.apiKey || field.key,
                field.type === "select" && configForm[field.key] === ""
                    ? null
                    : configForm[field.key],
            ])
        );

        try {
            if (isEditing) {
                await api.put(endpoint, payload);
            } else {
                await api.post(endpoint, payload);
            }

            toast.success(`${crud.label} ${isEditing ? "updated" : "added"} successfully.`);
            setConfigDialog(null);
            setRefreshKey((current) => current + 1);
        } catch {
            toast.error(`Failed to save ${crud.label.toLowerCase()}. Check that the name or code is unique.`);
        } finally {
            setSavingConfig(false);
        }
    };

    return (
        <div className="min-h-full overflow-y-auto bg-gray-50">
            <div className="flex items-center justify-between gap-4 border-b border-gray-200 bg-white px-5 py-4">
                <div>
                    <h1 className="text-xl font-semibold text-gray-900">{section.title}</h1>
                    <p className="mt-0.5 text-sm text-gray-500">{section.description}</p>
                </div>
                {crud && (
                    <button
                        type="button"
                        onClick={() => openConfigDialog("add")}
                        className="inline-flex h-10 shrink-0 items-center gap-2 rounded-md bg-[#2563EB] px-4 text-sm font-medium text-white transition hover:bg-[#1D4ED8]"
                    >
                        <Plus size={16} />
                        Add {crud.label}
                    </button>
                )}
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
                            {hasRowActions && (
                                <th className="w-20 px-4 py-3 text-right font-semibold text-gray-900">Actions</th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={dataset.columns.length + (hasRowActions ? 1 : 0)} className="px-6 py-16 text-center text-gray-500">
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
                                    {hasRowActions && (
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                type="button"
                                                onClick={() => openConfigDialog("edit", row)}
                                                className="rounded-md bg-[#2563EB] px-3 py-1.5 text-sm font-medium text-white transition hover:bg-[#1D4ED8]"
                                            >
                                                Edit
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={dataset.columns.length + (hasRowActions ? 1 : 0)} className="px-6 py-16 text-center">
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

            {configDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <form
                        onSubmit={saveConfig}
                        className="w-full max-w-lg rounded-lg border border-gray-200 bg-white shadow-xl"
                    >
                        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
                            <h2 className="text-lg font-semibold text-gray-900">
                                {configDialog.mode === "edit" ? `Edit ${crud.label}` : `Add ${crud.label}`}
                            </h2>
                            <button
                                type="button"
                                onClick={() => setConfigDialog(null)}
                                aria-label="Close dialog"
                                className="rounded-md p-1.5 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <div className="space-y-4 p-5">
                            {crud.fields.map((field, index) => (
                                <label key={field.key} className="block text-sm font-medium text-gray-700">
                                    {field.label}
                                    {field.type === "textarea" ? (
                                        <textarea
                                            autoFocus={index === 0}
                                            rows={4}
                                            required={field.required}
                                            value={configForm[field.key]}
                                            onChange={(event) =>
                                                setConfigForm((current) => ({ ...current, [field.key]: event.target.value }))
                                            }
                                            className="mt-1.5 w-full resize-y rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                        />
                                    ) : field.type === "select" ? (
                                        <select
                                            autoFocus={index === 0}
                                            required={field.required}
                                            value={configForm[field.key]}
                                            onChange={(event) =>
                                                setConfigForm((current) => ({ ...current, [field.key]: event.target.value }))
                                            }
                                            className="mt-1.5 h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                        >
                                            <option value="">Select {field.label.toLowerCase()}</option>
                                            {(field.optionsEndpoint ? configOptions[field.key] || [] : field.options || []).map((option) => {
                                                const value = field.optionsEndpoint ? option[field.optionValue] : option;
                                                const label = field.optionsEndpoint ? option[field.optionLabel] : option;
                                                return <option key={value} value={value}>{label}</option>;
                                            })}
                                        </select>
                                    ) : (
                                        <input
                                            autoFocus={index === 0}
                                            required={field.required}
                                            maxLength={field.maxLength}
                                            value={configForm[field.key]}
                                            onChange={(event) =>
                                                setConfigForm((current) => ({ ...current, [field.key]: event.target.value }))
                                            }
                                            className="mt-1.5 h-10 w-full rounded-md border border-gray-300 px-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                        />
                                    )}
                                </label>
                            ))}
                        </div>
                        <div className="flex justify-end gap-2 border-t border-gray-200 px-5 py-4">
                            <button
                                type="button"
                                onClick={() => setConfigDialog(null)}
                                className="h-9 rounded-md border border-gray-300 px-4 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={savingConfig}
                                className="h-9 rounded-md bg-[#2563EB] px-4 text-sm font-medium text-white transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {savingConfig ? "Saving..." : `Save ${crud.label}`}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}