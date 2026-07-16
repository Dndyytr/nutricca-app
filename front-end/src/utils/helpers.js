// Utility functions untuk kalkulasi kesehatan

export const calculateBMI = (weight, height) => {
  // height dalam cm, weight dalam kg
  const heightInM = height / 100
  return (weight / (heightInM * heightInM)).toFixed(1)
}

export const getBMICategory = (bmi) => {
  const bmiNum = parseFloat(bmi)
  if (bmiNum < 18.5) return 'Underweight'
  if (bmiNum < 25) return 'Normal'
  if (bmiNum < 30) return 'Overweight'
  return 'Obese'
}

export const calculateCalorieNeeds = (weight, height, age, gender, activityLevel) => {
  // Harris-Benedict Formula
  let bmr
  if (gender === 'Laki-laki') {
    bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age)
  } else {
    bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age)
  }

  const activityMultiplier = {
    'Sedentary': 1.2,
    'Lightly active': 1.375,
    'Moderately active': 1.55,
    'Very active': 1.725
  }

  return Math.round(bmr * (activityMultiplier[activityLevel] || 1.375))
}

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export const formatTime = (time) => {
  return new Date(`2000-01-01 ${time}`).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const getPercentage = (value, total) => {
  return Math.min(Math.round((value / total) * 100), 100)
}

export const getDayFromDate = (date) => {
  const d = new Date(date)
  return d.toLocaleDateString('id-ID', { weekday: 'short' })
}

export const generateMockData = () => {
  const days = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']
  const today = new Date()
  const weekData = []

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const day = date.getDate()
    const month = date.getMonth() + 1

    weekData.push({
      day: `${day}/${month}`,
      weight: 72 - (Math.random() * 4),
      calories: 1400 + Math.random() * 400,
      steps: 4000 + Math.random() * 3000
    })
  }

  return weekData
}
