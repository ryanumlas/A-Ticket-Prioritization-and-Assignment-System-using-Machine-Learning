import {
    useState,
} from "react";

import {
    Activity,
    BriefcaseBusiness,
    Building2,
    Check,
    CircleDot,
    LoaderCircle,
    Mail,
    MapPin,
    ShieldCheck,
    Tags,
    User,
    UserRound,
    Users,
} from "lucide-react";

import api from "/src/api";


export default function ITSupportProfile({
    profile,
    onProfileUpdated,
}) {
    const [
        availability,
        setAvailability,
    ] = useState(
        profile.availability_status || "available"
    );

    const [
        updatingAvailability,
        setUpdatingAvailability,
    ] = useState(false);

    const [
        availabilityError,
        setAvailabilityError,
    ] = useState("");

    const [
        availabilitySuccess,
        setAvailabilitySuccess,
    ] = useState("");


    const fullName = [
        profile.first_name,
        profile.last_name,
    ]
        .filter(Boolean)
        .join(" ");


    const workload = profile.workload || {};

    const inProgress =
        workload.in_progress ?? 0;

    const assisting =
        workload.assisting ?? 0;

    const currentWorkload =
        workload.current ??
        (inProgress + assisting);

    const workloadLimit =
        workload.limit ??
        profile.workload_limit ??
        0;


    const handleAvailabilityChange = async (
        event
    ) => {
        const newStatus = event.target.value;

        if (
            newStatus === availability ||
            updatingAvailability
        ) {
            return;
        }

        const previousStatus = availability;

        try {
            setUpdatingAvailability(true);
            setAvailabilityError("");
            setAvailabilitySuccess("");

            setAvailability(newStatus);

            const response = await api.patch(
                "/users/profile/availability/",
                {
                    availability_status: newStatus,
                }
            );

            setAvailability(
                response.data?.availability_status ||
                newStatus
            );

            setAvailabilitySuccess(
                response.data?.message ||
                "Availability updated successfully."
            );

            if (onProfileUpdated) {
                await onProfileUpdated();
            }
        } catch (error) {
            setAvailability(previousStatus);

            setAvailabilityError(
                error?.response?.data?.error ||
                error?.response?.data?.detail ||
                "Unable to update availability."
            );
        } finally {
            setUpdatingAvailability(false);
        }
    };


    return (
        <div className="w-full">
            <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6 lg:p-8">

                {/* Header */}

                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <div className="h-24 bg-gradient-to-r from-[#4C4CF9] to-[#7474FF]" />

                    <div className="px-6 pb-6">
                        <div className="-mt-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                            <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end">
                                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-4 border-white bg-[#EEEEFF] shadow-sm">
                                    <UserRound
                                        size={34}
                                        className="text-[#4C4CF9]"
                                    />
                                </div>

                                <div className="min-w-0 pb-1">
                                    <h1 className="truncate text-2xl font-bold text-gray-900">
                                        {fullName ||
                                            profile.username}
                                    </h1>

                                    <div className="mt-1 flex flex-wrap items-center gap-2">
                                        <span className="rounded-full bg-[#EEEEFF] px-3 py-1 text-xs font-semibold text-[#4C4CF9]">
                                            {profile.role}
                                        </span>

                                        {profile.user_code && (
                                            <span className="text-sm text-gray-500">
                                                {
                                                    profile.user_code
                                                }
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <AvailabilityBadge
                                status={availability}
                            />
                        </div>
                    </div>
                </div>


                {/* Account Information */}

                <ProfileSection
                    title="Account Information"
                    description="Your account and personal information."
                >
                    <ProfileField
                        icon={User}
                        label="Username"
                        value={profile.username}
                    />

                    <ProfileField
                        icon={Mail}
                        label="Email"
                        value={profile.email}
                    />

                    <ProfileField
                        icon={UserRound}
                        label="First Name"
                        value={profile.first_name}
                    />

                    <ProfileField
                        icon={UserRound}
                        label="Last Name"
                        value={profile.last_name}
                    />

                    <ProfileField
                        icon={ShieldCheck}
                        label="Role"
                        value={profile.role}
                    />

                    <ProfileField
                        icon={ShieldCheck}
                        label="User Code"
                        value={profile.user_code}
                    />
                </ProfileSection>


                {/* IT Information */}

                <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="border-b border-gray-100 pb-4">
                        <h2 className="text-base font-semibold text-gray-900">
                            IT Information
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Your IT assignment and technical
                            specializations.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-x-8 gap-y-6 pt-6 md:grid-cols-2">
                        <ProfileField
                            icon={Building2}
                            label="IT Department"
                            value={
                                profile.it_department
                            }
                        />

                        <ProfileField
                            icon={MapPin}
                            label="Office Location"
                            value={
                                profile.office_location
                            }
                        />
                    </div>

                    <div className="mt-6 border-t border-gray-100 pt-6">
                        <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                                <Tags
                                    size={18}
                                    className="text-gray-600"
                                />
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                    Specializations
                                </p>

                                {profile.specializations?.length ? (
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {profile.specializations.map(
                                            (
                                                specialization
                                            ) => (
                                                <span
                                                    key={
                                                        specialization
                                                    }
                                                    className="rounded-full border border-[#DADAFF] bg-[#F4F4FF] px-3 py-1.5 text-xs font-medium text-[#4C4CF9]"
                                                >
                                                    {
                                                        specialization
                                                    }
                                                </span>
                                            )
                                        )}
                                    </div>
                                ) : (
                                    <p className="mt-1 text-sm font-medium text-gray-900">
                                        -
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </section>


                {/* Workload */}

                <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="border-b border-gray-100 pb-4">
                        <h2 className="text-base font-semibold text-gray-900">
                            Current Workload
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Tickets currently assigned to you
                            or being assisted by you.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 pt-6 sm:grid-cols-2 lg:grid-cols-4">
                        <WorkloadCard
                            icon={CircleDot}
                            label="In Progress"
                            value={inProgress}
                        />

                        <WorkloadCard
                            icon={Users}
                            label="Assisting"
                            value={assisting}
                        />

                        <WorkloadCard
                            icon={Activity}
                            label="Current"
                            value={currentWorkload}
                        />

                        <WorkloadCard
                            icon={BriefcaseBusiness}
                            label="Workload Limit"
                            value={workloadLimit}
                        />
                    </div>

                    <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-5">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <p className="text-sm font-semibold text-gray-900">
                                    Workload Capacity
                                </p>

                                <p className="mt-1 text-xs text-gray-500">
                                    In Progress + Assisting
                                </p>
                            </div>

                            <p className="text-xl font-bold text-gray-900">
                                {currentWorkload}
                                <span className="mx-1 text-gray-400">
                                    /
                                </span>
                                {workloadLimit}
                            </p>
                        </div>

                        <WorkloadProgress
                            current={currentWorkload}
                            limit={workloadLimit}
                        />
                    </div>
                </section>


                {/* Availability */}

                <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="border-b border-gray-100 pb-4">
                        <h2 className="text-base font-semibold text-gray-900">
                            Availability
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Control your current support
                            availability.
                        </p>
                    </div>

                    <div className="pt-6">
                        <div className="flex flex-col gap-5 rounded-xl border border-gray-200 bg-gray-50 p-5 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                    Current Status
                                </p>

                                <div className="mt-2">
                                    <AvailabilityBadge
                                        status={
                                            availability
                                        }
                                    />
                                </div>
                            </div>

                            <div className="w-full sm:w-64">
                                <label
                                    htmlFor="availability-status"
                                    className="mb-2 block text-xs font-medium uppercase tracking-wide text-gray-400"
                                >
                                    Change Availability
                                </label>

                                <div className="relative">
                                    <select
                                        id="availability-status"
                                        value={
                                            availability
                                        }
                                        onChange={
                                            handleAvailabilityChange
                                        }
                                        disabled={
                                            updatingAvailability
                                        }
                                        className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-10 text-sm font-medium text-gray-900 outline-none transition focus:border-[#4C4CF9] focus:ring-2 focus:ring-[#4C4CF9]/10 disabled:cursor-not-allowed disabled:bg-gray-100"
                                    >
                                        <option value="available">
                                            Available
                                        </option>

                                        <option value="unavailable">
                                            Unavailable
                                        </option>

                                        <option value="offline">
                                            Offline
                                        </option>
                                    </select>

                                    {updatingAvailability && (
                                        <LoaderCircle
                                            size={17}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-[#4C4CF9]"
                                        />
                                    )}
                                </div>
                            </div>
                        </div>


                        {availabilityError && (
                            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                                <p className="text-sm text-red-600">
                                    {availabilityError}
                                </p>
                            </div>
                        )}


                        {availabilitySuccess && (
                            <div className="mt-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
                                <Check
                                    size={17}
                                    className="shrink-0 text-green-600"
                                />

                                <p className="text-sm text-green-700">
                                    {availabilitySuccess}
                                </p>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}


function ProfileSection({
    title,
    description,
    children,
}) {
    return (
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="border-b border-gray-100 pb-4">
                <h2 className="text-base font-semibold text-gray-900">
                    {title}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                    {description}
                </p>
            </div>

            <div className="grid grid-cols-1 gap-x-8 gap-y-6 pt-6 md:grid-cols-2">
                {children}
            </div>
        </section>
    );
}


function ProfileField({
    icon: Icon,
    label,
    value,
}) {
    return (
        <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                <Icon
                    size={18}
                    className="text-gray-600"
                />
            </div>

            <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    {label}
                </p>

                <p className="mt-1 break-words text-sm font-medium text-gray-900">
                    {value || "-"}
                </p>
            </div>
        </div>
    );
}


function WorkloadCard({
    icon: Icon,
    label,
    value,
}) {
    return (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center justify-between gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-sm">
                    <Icon
                        size={17}
                        className="text-[#4C4CF9]"
                    />
                </div>

                <span className="text-2xl font-bold text-gray-900">
                    {value}
                </span>
            </div>

            <p className="mt-4 text-xs font-medium uppercase tracking-wide text-gray-500">
                {label}
            </p>
        </div>
    );
}


function WorkloadProgress({
    current,
    limit,
}) {
    const safeCurrent = Number(current) || 0;
    const safeLimit = Number(limit) || 0;

    const percentage =
        safeLimit > 0
            ? Math.min(
                  (safeCurrent / safeLimit) * 100,
                  100
              )
            : 0;

    return (
        <div className="mt-4">
            <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                <div
                    className="h-full rounded-full bg-[#4C4CF9] transition-all duration-300"
                    style={{
                        width: `${percentage}%`,
                    }}
                />
            </div>

            <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                <span>
                    {safeCurrent} active
                </span>

                <span>
                    {Math.round(percentage)}%
                </span>
            </div>
        </div>
    );
}


function AvailabilityBadge({
    status,
}) {
    const normalizedStatus = String(
        status || ""
    ).toLowerCase();

    const config = {
        available: {
            label: "Available",
            dot: "bg-green-500",
            className:
                "border-green-200 bg-green-50 text-green-700",
        },

        unavailable: {
            label: "Unavailable",
            dot: "bg-amber-500",
            className:
                "border-amber-200 bg-amber-50 text-amber-700",
        },

        offline: {
            label: "Offline",
            dot: "bg-gray-400",
            className:
                "border-gray-200 bg-gray-100 text-gray-600",
        },
    };


    const current =
        config[normalizedStatus] ||
        config.offline;


    return (
        <span
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${current.className}`}
        >
            <span
                className={`h-2 w-2 rounded-full ${current.dot}`}
            />

            {current.label}
        </span>
    );
}