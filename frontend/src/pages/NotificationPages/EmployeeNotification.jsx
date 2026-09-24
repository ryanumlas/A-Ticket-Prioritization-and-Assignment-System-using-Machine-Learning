import EmployeeNotificationContent from "../../components/NotificationContents/EmployeeNotificationContent";

export default function EmployeeNotification() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="border-b border-gray-200 bg-white px-5 py-4">
                <h1 className="text-xl font-semibold text-gray-900">
                    Notifications
                </h1>

                <p className="mt-0.5 text-sm text-gray-500">
                    Stay updated with your ticket activity and requests.
                </p>
            </div>

            <EmployeeNotificationContent />
        </div>
    );
}