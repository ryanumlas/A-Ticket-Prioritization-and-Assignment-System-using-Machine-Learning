import { useNavigate } from "react-router-dom";
import { HandHelping } from "lucide-react";

import {
    priorityColor,
    priorityLabel,
} from "../utils/priority";
import { formatDate } from "../utils/formatDate";

export default function AssistanceQueueTable({
    requestList = [],
    loading = false,
}) {
    const navigate = useNavigate();

    const requestStatusLabel = {
        pending: "Pending",
        accepted: "Accepted",
    };

    const requestStatusColor = {
        pending:
            "border border-yellow-300 bg-yellow-100 text-yellow-700",
        accepted:
            "border border-green-300 bg-green-100 text-green-700",
    };

    if (loading) {
        return (
            <div className="flex min-h-[300px] items-center justify-center bg-white px-4 py-12 md:h-[637px] min-[1280px]:max-[1365px]:h-[450px] min-[1366px]:max-[1537px]:h-[500px]">
                <p className="text-sm text-gray-500">
                    Loading assistance requests...
                </p>
            </div>
        );
    }

    if (requestList.length === 0) {
        return (
            <div className="bg-white">
                <div className="px-6 py-16 text-center">
                    <HandHelping
                        size={32}
                        className="mx-auto text-gray-300"
                    />

                    <p className="mt-3 font-medium text-black">
                        No assistance requests found
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                        There are currently no pending assistance requests.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="overflow-hidden bg-white">

            {/* Desktop / Tablet */}
            <div className="hidden h-[637px] overflow-y-auto md:block min-[1280px]:max-[1365px]:h-[450px] min-[1366px]:max-[1537px]:h-[500px] [&::-webkit-scrollbar]:w-px [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full">
                <table className="w-full table-fixed text-sm min-[1366px]:max-[1537px]:text-xs">
                    <thead className="sticky top-0 z-10 bg-gray-50">
                        <tr className="border-b border-gray-300 text-left">

                            <th className="w-[8%] px-6 py-3.5 font-semibold text-black min-[1366px]:max-[1537px]:px-4 min-[1366px]:max-[1537px]:py-3">
                                Ticket ID
                            </th>

                            <th className="w-[13%] px-6 py-3.5 font-semibold text-black min-[1366px]:max-[1537px]:px-4 min-[1366px]:max-[1537px]:py-3">
                                Subject
                            </th>

                            <th className="w-[11%] px-4 py-3.5 font-semibold text-black min-[1366px]:max-[1537px]:px-3 min-[1366px]:max-[1537px]:py-3">
                                Requested By
                            </th>

                            <th className="w-[12%] px-4 py-3.5 font-semibold text-black min-[1366px]:max-[1537px]:px-3 min-[1366px]:max-[1537px]:py-3">
                                Assistance Department
                            </th>

                            <th className="w-[8%] px-4 py-3.5 font-semibold text-black min-[1366px]:max-[1537px]:px-3 min-[1366px]:max-[1537px]:py-3">
                                Symptom Code
                            </th>

                            <th className="w-[8%] px-4 py-3.5 font-semibold text-black min-[1366px]:max-[1537px]:px-3 min-[1366px]:max-[1537px]:py-3">
                                Priority
                            </th>

                            <th className="w-[9%] px-4 py-3.5 font-semibold text-black min-[1366px]:max-[1537px]:px-3 min-[1366px]:max-[1537px]:py-3">
                                Status
                            </th>

                            <th className="w-[19%] px-4 py-3.5 font-semibold text-black min-[1366px]:max-[1537px]:px-3 min-[1366px]:max-[1537px]:py-3">
                                Assistance Details
                            </th>

                            <th className="w-[12%] px-4 py-3.5 font-semibold text-black min-[1366px]:max-[1537px]:px-3 min-[1366px]:max-[1537px]:py-3">
                                Requested At
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {requestList.map((request) => (
                            <tr
                                key={request.id}
                                onClick={() => {
                                    if (request.ticket) {
                                        navigate(
                                            `/ticket/${request.ticket}`
                                        );
                                    }
                                }}
                                className={`border-b border-gray-200 transition-colors last:border-b-0 ${
                                    request.ticket
                                        ? "cursor-pointer hover:bg-gray-50"
                                        : ""
                                }`}
                            >
                                {/* Ticket ID */}
                                <td className="min-w-0 overflow-hidden whitespace-nowrap px-6 py-4 min-[1366px]:max-[1537px]:px-4 min-[1366px]:max-[1537px]:py-3">
                                    <span
                                        className="font-semibold text-black"
                                        title={request.ticket_code}
                                    >
                                        {request.ticket_code || "-"}
                                    </span>
                                </td>

                                {/* Subject */}
                                <td className="min-w-0 overflow-hidden px-6 py-4 min-[1366px]:max-[1537px]:px-4 min-[1366px]:max-[1537px]:py-3">
                                    <p
                                        className="truncate font-medium text-black"
                                        title={request.subject}
                                    >
                                        {request.subject || "-"}
                                    </p>
                                </td>

                                {/* Requested By */}
                                <td className="min-w-0 overflow-hidden px-4 py-4 min-[1366px]:max-[1537px]:px-3 min-[1366px]:max-[1537px]:py-3">
                                    <p
                                        className="truncate font-medium text-black"
                                        title={
                                            request.requested_by_name
                                        }
                                    >
                                        {request.requested_by_name || "-"}
                                    </p>
                                </td>

                                {/* Assistance Department */}
                                <td className="min-w-0 overflow-hidden px-4 py-4 min-[1366px]:max-[1537px]:px-3 min-[1366px]:max-[1537px]:py-3">
                                    <span
                                        className="inline-flex max-w-full truncate rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700"
                                        title={
                                            request.requested_department_name
                                        }
                                    >
                                        {request.requested_department_name ||
                                            "-"}
                                    </span>
                                </td>

                                {/* Symptom Code */}
                                <td className="min-w-0 overflow-hidden px-4 py-4 min-[1366px]:max-[1537px]:px-3 min-[1366px]:max-[1537px]:py-3">
                                    <span
                                        className="block truncate font-medium text-black"
                                        title={request.symptom_code}
                                    >
                                        {request.symptom_code || "-"}
                                    </span>
                                </td>

                                {/* Priority */}
                                <td className="min-w-0 overflow-hidden px-4 py-4 min-[1366px]:max-[1537px]:px-3 min-[1366px]:max-[1537px]:py-3">
                                    <span
                                        className={`inline-flex max-w-full whitespace-nowrap rounded-md border px-2 py-1 text-xs font-semibold min-[1366px]:max-[1537px]:px-1.5 min-[1366px]:max-[1537px]:py-0.5 ${
                                            priorityColor[
                                                request.priority
                                            ] ||
                                            "border-gray-300 bg-gray-100 text-gray-600"
                                        }`}
                                    >
                                        {priorityLabel[
                                            request.priority
                                        ] ||
                                            request.priority ||
                                            "-"}
                                    </span>
                                </td>

                                {/* Status */}
                                <td className="min-w-0 overflow-hidden px-4 py-4 min-[1366px]:max-[1537px]:px-3 min-[1366px]:max-[1537px]:py-3">
                                    <span
                                        className={`inline-flex max-w-full whitespace-nowrap rounded-md px-2 py-1 text-xs font-medium min-[1366px]:max-[1537px]:px-1.5 min-[1366px]:max-[1537px]:py-0.5 ${
                                            requestStatusColor[
                                                request.status
                                            ] ||
                                            "border border-gray-300 bg-gray-100 text-gray-700"
                                        }`}
                                    >
                                        {requestStatusLabel[request.status] ||
                                            request.status ||
                                            "-"}
                                    </span>
                                </td>

                                {/* Assistance Details */}
                                <td className="min-w-0 overflow-hidden px-4 py-4 min-[1366px]:max-[1537px]:px-3 min-[1366px]:max-[1537px]:py-3">
                                    <p
                                        className="line-clamp-2 text-sm leading-5 text-gray-700 min-[1366px]:max-[1537px]:text-xs"
                                        title={request.reason}
                                    >
                                        {request.reason || "-"}
                                    </p>
                                </td>

                                {/* Requested At */}
                                <td className="min-w-0 overflow-hidden px-4 py-4 min-[1366px]:max-[1537px]:px-3 min-[1366px]:max-[1537px]:py-3">
                                    <span
                                        className="block truncate whitespace-nowrap font-medium text-black"
                                        title={
                                            request.requested_at
                                                ? formatDate(
                                                      request.requested_at
                                                  )
                                                : "-"
                                        }
                                    >
                                        {request.requested_at
                                            ? formatDate(
                                                  request.requested_at
                                              )
                                            : "-"}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile */}
            <div className="h-[450px] overflow-y-auto md:hidden [&::-webkit-scrollbar]:w-px [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full">
                {requestList.map((request) => (
                    <div
                        key={request.id}
                        onClick={() => {
                            if (request.ticket) {
                                navigate(
                                    `/ticket/${request.ticket}`
                                );
                            }
                        }}
                        className={`border-b border-gray-300 transition-colors ${
                            request.ticket
                                ? "cursor-pointer bg-white hover:bg-gray-50"
                                : "bg-white"
                        }`}
                    >
                        <table className="w-full table-fixed text-xs">
                            <tbody>

                                <tr className="bg-gray-100">
                                    <th className="w-[40%] border-r border-gray-300 px-3 py-2 text-left font-semibold text-gray-700">
                                        Ticket ID
                                    </th>

                                    <td className="px-3 py-2 font-semibold text-[#2563EB]">
                                        {request.ticket_code || "-"}
                                    </td>
                                </tr>

                                <tr>
                                    <th className="border-r border-gray-200 px-3 py-2 text-left font-medium text-gray-600">
                                        Subject
                                    </th>

                                    <td
                                        className="truncate px-3 py-2 font-medium text-gray-900"
                                        title={request.subject}
                                    >
                                        {request.subject || "-"}
                                    </td>
                                </tr>

                                <tr className="bg-gray-100">
                                    <th className="border-r border-gray-300 px-3 py-2 text-left font-medium text-gray-700">
                                        Requested By
                                    </th>

                                    <td
                                        className="truncate px-3 py-2 text-gray-900"
                                        title={
                                            request.requested_by_name
                                        }
                                    >
                                        {request.requested_by_name ||
                                            "-"}
                                    </td>
                                </tr>

                                <tr>
                                    <th className="border-r border-gray-200 px-3 py-2 text-left font-medium text-gray-600">
                                        Assistance Department
                                    </th>

                                    <td
                                        className="truncate px-3 py-2 text-gray-900"
                                        title={
                                            request.requested_department_name
                                        }
                                    >
                                        {request.requested_department_name ||
                                            "-"}
                                    </td>
                                </tr>

                                <tr className="bg-gray-100">
                                    <th className="border-r border-gray-300 px-3 py-2 text-left font-medium text-gray-700">
                                        Symptom Code
                                    </th>

                                    <td
                                        className="truncate px-3 py-2 text-gray-900"
                                        title={request.symptom_code}
                                    >
                                        {request.symptom_code || "-"}
                                    </td>
                                </tr>

                                <tr>
                                    <th className="border-r border-gray-200 px-3 py-2 text-left font-medium text-gray-600">
                                        Priority
                                    </th>

                                    <td className="px-3 py-2">
                                        <span
                                            className={`inline-flex rounded-md border px-2 py-1 text-[10px] font-semibold ${
                                                priorityColor[
                                                    request.priority
                                                ] ||
                                                "border-gray-300 bg-gray-100 text-gray-600"
                                            }`}
                                        >
                                            {priorityLabel[
                                                request.priority
                                            ] ||
                                                request.priority ||
                                                "-"}
                                        </span>
                                    </td>
                                </tr>

                                <tr className="bg-gray-100">
                                    <th className="border-r border-gray-300 px-3 py-2 text-left font-medium text-gray-700">
                                        Status
                                    </th>

                                    <td className="px-3 py-2">
                                        <span
                                            className={`inline-flex rounded-md px-2 py-1 text-[10px] font-medium ${
                                                requestStatusColor[
                                                    request.status
                                                ] ||
                                                "border border-gray-300 bg-gray-100 text-gray-700"
                                            }`}
                                        >
                                            {requestStatusLabel[request.status] ||
                                                request.status ||
                                                "-"}
                                        </span>
                                    </td>
                                </tr>

                                <tr>
                                    <th className="border-r border-gray-200 px-3 py-2 text-left font-medium text-gray-600">
                                        Requested At
                                    </th>

                                    <td className="px-3 py-2 font-medium text-gray-900">
                                        {request.requested_at
                                            ? formatDate(
                                                  request.requested_at
                                              )
                                            : "-"}
                                    </td>
                                </tr>

                                <tr className="bg-gray-100">
                                    <th className="border-r border-gray-300 px-3 py-2 align-top text-left font-medium text-gray-700">
                                        Assistance Details
                                    </th>

                                    <td className="px-3 py-2">
                                        <p className="whitespace-pre-wrap break-words leading-5 text-gray-900">
                                            {request.reason || "-"}
                                        </p>
                                    </td>
                                </tr>

                            </tbody>
                        </table>
                    </div>
                ))}
            </div>
        </div>
    );
}