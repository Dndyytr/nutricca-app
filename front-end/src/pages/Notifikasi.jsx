import { useApp } from '../hooks/useApp'
import { NotificationItem } from '../components/index'

export const Notifikasi = () => {
  const { notifications } = useApp()

  return (
    <div className="p-8 max-w-2xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Notifications</h1>
          <p className="text-gray-400">{notifications.filter(n => !n.read).length} new notifications</p>
        </div>
        <button className="btn-secondary text-sm">Mark all as read</button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.map(notification => (
          <NotificationItem key={notification.id} notification={notification} />
        ))}
      </div>

      {/* Empty State */}
      {notifications.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-5xl mb-4">🔔</p>
          <p className="text-gray-400">No notifications</p>
        </div>
      )}
    </div>
  )
}
