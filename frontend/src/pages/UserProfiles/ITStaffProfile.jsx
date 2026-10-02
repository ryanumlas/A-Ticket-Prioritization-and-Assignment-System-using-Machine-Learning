import {
    Building2,
    Mail,
    MapPin,
    ShieldCheck,
    User,
    UserRound,
} from "lucide-react";


export default function ITStaffProfile({
    profile,
}) {
    const fullName = [
        profile.first_name,
        profile.last_name,
    ]
        .filter(Boolean)
        .join(" ");


    return (
        <div className="w-full">
            <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6 lg:p-8">

                {/* Header */}

                <div className="rounded-xl border border-gray-300 bg-white p-5 sm:p-6">
                    <div className="min-w-0">
                        <h1 className="break-words text-2xl font-bold text-black">
                            {fullName || profile.username}
                        </h1>

                        <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span className="rounded-md bg-[#EEEEFF] px-3 py-1 text-xs font-semibold text-[#4C4CF9]">
                                {profile.role || "IT Staff"}
                            </span>

                            {profile.user_code && (
                                <span className="text-sm text-gray-500">
                                    {profile.user_code}
                                </span>
                            )}
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

                <ProfileSection
                    title="IT Information"
                    description="Your assigned IT department and office location."
                >
                    <ProfileField
                        icon={Building2}
                        label="IT Department"
                        value={profile.it_department}
                    />

                    <ProfileField
                        icon={MapPin}
                        label="Office Location"
                        value={profile.office_location}
                    />
                </ProfileSection>
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
        <section className="rounded-xl border border-gray-300 bg-white p-5 sm:p-6">
            <div className="border-b border-gray-200 pb-4">
                <h2 className="text-base font-semibold text-black">
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

                <p className="mt-1 break-words text-sm font-medium text-black">
                    {value || "-"}
                </p>
            </div>
        </div>
    );
}