export const StatCard = ({ icon, title, value, unit, subtitle, color = 'primary' }) => {
  const colorClasses = {
    primary: 'border-primary',
    success: 'border-success',
    warning: 'border-warning',
    danger: 'border-danger'
  }

  return (
    <div className={`card border-l-4 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm mb-2">{title}</p>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold">{value}</span>
            <span className="text-gray-400">{unit}</span>
          </div>
          {subtitle && <p className="text-xs text-gray-500 mt-2">{subtitle}</p>}
        </div>
        <span className="text-4xl">{icon}</span>
      </div>
    </div>
  )
}

export const ProgressBar = ({ label, value, target, color = 'bg-primary' }) => {
  const percentage = (value / target) * 100

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span className="text-gray-400">{percentage.toFixed(0)}%</span>
      </div>
      <div className="w-full bg-dark-input rounded-full h-2 overflow-hidden">
        <div 
          className={`h-full ${color} transition-all duration-300`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  )
}

export const HabitCheckbox = ({ habit, onToggle }) => {
  return (
    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-dark-input transition">
      <input
        type="checkbox"
        checked={habit.completed}
        onChange={() => onToggle(habit.id)}
        className="w-5 h-5 rounded cursor-pointer"
      />
      <div className="flex-1">
        <p className={habit.completed ? 'line-through text-gray-500' : 'text-white'}>
          {habit.name}
        </p>
        <p className="text-xs text-gray-400">{habit.time}</p>
      </div>
      <span className={`px-2 py-1 rounded text-xs ${
        habit.category === 'Makanan' ? 'bg-yellow-900 text-yellow-200' :
        habit.category === 'Air' ? 'bg-blue-900 text-blue-200' :
        habit.category === 'Olahraga' ? 'bg-orange-900 text-orange-200' :
        'bg-purple-900 text-purple-200'
      }`}>
        {habit.category}
      </span>
    </div>
  )
}

export const RecommendationCard = ({ recommendation, onAccept }) => {
  return (
    <div className="card">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3">
          <span className="text-4xl">{recommendation.icon || '🍛'}</span>
          <div>
            <p className="font-semibold">{recommendation.title}</p>
            <p className="text-sm text-gray-400">{recommendation.time}</p>
          </div>
        </div>
        <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
          {recommendation.category}
        </span>
      </div>
      
      <div className="grid grid-cols-4 gap-2 mb-4 p-3 bg-dark-input rounded">
        <div className="text-center">
          <p className="text-sm text-gray-400">Kalori</p>
          <p className="font-semibold">{recommendation.calories}</p>
          <p className="text-xs text-gray-500">kcal</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-400">Protein</p>
          <p className="font-semibold">{recommendation.protein}g</p>
          <p className="text-xs text-gray-500">protein</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-400">Karbo</p>
          <p className="font-semibold">{recommendation.carbs}g</p>
          <p className="text-xs text-gray-500">karbo</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-400">Lemak</p>
          <p className="font-semibold">{recommendation.fat}g</p>
          <p className="text-xs text-gray-500">lemak</p>
        </div>
      </div>

      <button 
        onClick={() => onAccept && onAccept(recommendation)}
        className="btn-primary w-full"
      >
        Direkomensdasikan
      </button>
    </div>
  )
}

export const NotificationItem = ({ notification }) => {
  const iconMap = {
    reminder: '⏰',
    achievement: '🏆',
    warning: '⚠️',
    info: 'ℹ️'
  }

  return (
    <div className="flex items-start space-x-3 p-3 rounded-lg bg-dark-input">
      <span className="text-xl">{iconMap[notification.type] || '📢'}</span>
      <div className="flex-1">
        <p className="text-sm font-medium">{notification.title}</p>
        <p className="text-xs text-gray-400">{notification.time}</p>
      </div>
      {!notification.read && (
        <div className="w-2 h-2 bg-primary rounded-full"></div>
      )}
    </div>
  )
}
