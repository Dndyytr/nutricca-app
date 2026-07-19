import { useApp } from "../hooks/useApp";
import { NotificationItem } from "../components/index";
import { useLocale } from "../i18n/locale-context";

export const Notifications = () => {
  const { notifications } = useApp();
  const { t } = useLocale();
  const unreadCount = notifications.filter(
    (notification) => !notification.read,
  ).length;

  return (
    <div className="p-8 max-w-2xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="t-size9 font-bold mb-2">{t("notifications.title")}</h1>
          <p className="t-size3 font-medium text-gray-400">
            {t("notifications.newCount", { count: unreadCount })}
          </p>
        </div>
        <button className="btn-secondary t-size3 font-medium">
          {t("notifications.markAllRead")}
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.map((notification) => (
          <NotificationItem key={notification.id} notification={notification} />
        ))}
      </div>

      {/* Empty State */}
      {notifications.length === 0 && (
        <div className="card text-center py-12">
          <p className="t-size10 mb-4 font-medium">🔔</p>
          <p className="t-size3 font-medium text-gray-400">
            {t("notifications.empty")}
          </p>
        </div>
      )}
    </div>
  );
};
