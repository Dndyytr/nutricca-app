export const MEAL_SLOTS = [
  { key: 'breakfast', label: 'Breakfast', placeholder: 'e.g. Oatmeal + Banana' },
  { key: 'lunch', label: 'Lunch', placeholder: 'e.g. Rice + Grilled chicken' },
  { key: 'dinner', label: 'Dinner', placeholder: 'e.g. Tofu soup + Tempeh' },
];

export const ACTIVITY_TYPES = ['Walking', 'Running', 'Cycling', 'Swimming', 'Gym', 'Yoga'];

export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const LEVEL_CONFIG = {
  beginner: {
    label: '🌱 Beginner',
    desc: 'Start light and build consistency. Focus on form over volume.',
    pillBg: '#FEF3C7',
    pillColor: '#92400E',
    runTarget: 12,
    groups: [
      { section: 'Dips', items: [{ id: 'dips', name: 'Dips', reps: 15, sets: 3, days: 5 }] },
      {
        section: 'Pull Up',
        items: [
          { id: 'pu_wide', name: 'Pull Up — Wide/Chest', reps: 10, sets: 2, days: 5 },
          { id: 'pu_norm', name: 'Pull Up — Normal', reps: 10, sets: 2, days: 5 },
          { id: 'pu_close', name: 'Pull Up — Close', reps: 10, sets: 2, days: 5 },
          { id: 'pu_chin', name: 'Chin Up', reps: 10, sets: 2, days: 5 },
        ],
      },
      {
        section: 'Push Up',
        items: [
          { id: 'push_norm', name: 'Push Up — Normal', reps: 15, sets: 2, days: 5 },
          { id: 'push_dec', name: 'Push Up — Decline', reps: 8, sets: 2, days: 5 },
          { id: 'push_inc', name: 'Push Up — Incline', reps: 8, sets: 2, days: 5 },
          { id: 'push_dia', name: 'Push Up — Diamond', reps: 8, sets: 2, days: 5 },
        ],
      },
      {
        section: 'Core',
        items: [
          { id: 'situp', name: 'Sit Up', reps: 15, sets: 3, days: 5 },
          { id: 'riseup', name: 'Rise Up', reps: 15, sets: 3, days: 5 },
          { id: 'climb', name: 'Mountain Climbing', reps: 20, sets: 3, days: 5, unit: 'sec' },
          { id: 'plank', name: 'Plank', reps: 1, sets: 3, days: 5, unit: 'min' },
        ],
      },
      {
        section: 'Squat',
        items: [
          { id: 'sqjump', name: 'Squat Jump', reps: 10, sets: 3, days: 5 },
          { id: 'lunge', name: 'Lunges', reps: 10, sets: 3, days: 5, unit: 'steps' },
        ],
      },
    ],
  },
  intermediate: {
    label: '⚡ Intermediate',
    desc: 'Increase volume and intensity. Push past your comfort zone.',
    pillBg: '#D1FAE5',
    pillColor: '#065F46',
    runTarget: 20,
    groups: [
      { section: 'Dips', items: [{ id: 'dips', name: 'Dips', reps: 20, sets: 4, days: 5 }] },
      {
        section: 'Pull Up',
        items: [
          { id: 'pu_wide', name: 'Pull Up — Wide/Chest', reps: 12, sets: 3, days: 5 },
          { id: 'pu_norm', name: 'Pull Up — Normal', reps: 12, sets: 3, days: 5 },
          { id: 'pu_close', name: 'Pull Up — Close', reps: 12, sets: 3, days: 5 },
          { id: 'pu_chin', name: 'Chin Up', reps: 12, sets: 3, days: 5 },
        ],
      },
      {
        section: 'Push Up',
        items: [
          { id: 'push_norm', name: 'Push Up — Normal', reps: 20, sets: 3, days: 5 },
          { id: 'push_dec', name: 'Push Up — Decline', reps: 12, sets: 3, days: 5 },
          { id: 'push_inc', name: 'Push Up — Incline', reps: 12, sets: 3, days: 5 },
          { id: 'push_dia', name: 'Push Up — Diamond', reps: 12, sets: 3, days: 5 },
        ],
      },
      {
        section: 'Core',
        items: [
          { id: 'situp', name: 'Sit Up', reps: 20, sets: 4, days: 5 },
          { id: 'riseup', name: 'Rise Up', reps: 20, sets: 4, days: 5 },
          { id: 'climb', name: 'Mountain Climbing', reps: 30, sets: 4, days: 5, unit: 'sec' },
          { id: 'plank', name: 'Plank', reps: 2, sets: 3, days: 5, unit: 'min' },
        ],
      },
      {
        section: 'Squat',
        items: [
          { id: 'sqjump', name: 'Squat Jump', reps: 15, sets: 4, days: 5 },
          { id: 'lunge', name: 'Lunges', reps: 15, sets: 4, days: 5, unit: 'steps' },
        ],
      },
    ],
  },
  advanced: {
    label: '🔥 Advanced',
    desc: 'Maximum output. Elite volume, short rest, high intensity.',
    pillBg: '#FEE2E2',
    pillColor: '#7F1D1D',
    runTarget: 30,
    groups: [
      { section: 'Dips', items: [{ id: 'dips', name: 'Dips', reps: 25, sets: 5, days: 5 }] },
      {
        section: 'Pull Up',
        items: [
          { id: 'pu_wide', name: 'Pull Up — Wide/Chest', reps: 15, sets: 4, days: 5 },
          { id: 'pu_norm', name: 'Pull Up — Normal', reps: 15, sets: 4, days: 5 },
          { id: 'pu_close', name: 'Pull Up — Close', reps: 15, sets: 4, days: 5 },
          { id: 'pu_chin', name: 'Chin Up', reps: 15, sets: 4, days: 5 },
        ],
      },
      {
        section: 'Push Up',
        items: [
          { id: 'push_norm', name: 'Push Up — Normal', reps: 25, sets: 4, days: 5 },
          { id: 'push_dec', name: 'Push Up — Decline', reps: 15, sets: 4, days: 5 },
          { id: 'push_inc', name: 'Push Up — Incline', reps: 15, sets: 4, days: 5 },
          { id: 'push_dia', name: 'Push Up — Diamond', reps: 15, sets: 4, days: 5 },
        ],
      },
      {
        section: 'Core',
        items: [
          { id: 'situp', name: 'Sit Up', reps: 25, sets: 5, days: 5 },
          { id: 'riseup', name: 'Rise Up', reps: 25, sets: 5, days: 5 },
          { id: 'climb', name: 'Mountain Climbing', reps: 45, sets: 5, days: 5, unit: 'sec' },
          { id: 'plank', name: 'Plank', reps: 3, sets: 3, days: 5, unit: 'min' },
        ],
      },
      {
        section: 'Squat',
        items: [
          { id: 'sqjump', name: 'Squat Jump', reps: 20, sets: 5, days: 5 },
          { id: 'lunge', name: 'Lunges', reps: 20, sets: 5, days: 5, unit: 'steps' },
        ],
      },
    ],
  },
};

// Level string → integer mapping untuk backend
export const LEVEL_TO_INT = { beginner: 1, intermediate: 2, advanced: 3 };
export const INT_TO_LEVEL = { 1: 'beginner', 2: 'intermediate', 3: 'advanced' };

export const S = {
  card: { background: '#FFFFFF', border: '1px solid #F0F0F0', borderRadius: 12, padding: '16px 18px' },
  sectionLbl: { fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: 14 },
  input: { width: '100%', padding: '8px 10px', border: '1px solid #E5E7EB', borderRadius: 7, fontSize: 13, color: '#1A1A1A', background: '#FAFAFA', outline: 'none' },
  dot: { width: 8, height: 8, borderRadius: '50%', background: '#F97316', flexShrink: 0, marginTop: 22 },
};

export const fmtSets = (ex) => `${ex.reps} ${ex.unit || 'reps'} × ${ex.sets} sets × ${ex.days} days`;

export const calcSleepDuration = (start, end) => {
  if (!start || !end) return null;
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  let diff = eh * 60 + em - (sh * 60 + sm);
  if (diff < 0) diff += 24 * 60;
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  return m > 0 ? `${h}h ${m}m` : `${h} hours`;
};

export const formatToHHMM = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }).replace('.', ':');
};
