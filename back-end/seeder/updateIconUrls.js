import { Pool } from 'pg';
import 'dotenv/config';

const pool = new Pool();

// Update icon URLs untuk master exercises
const exerciseIconUpdates = [
  { name: 'Push up', icon_url: 'https://your-domain.com/icons/push-up.png' },
  { name: 'Pull up', icon_url: 'https://your-domain.com/icons/pull-up.png' },
  { name: 'Plank', icon_url: 'https://your-domain.com/icons/plank.png' },
  { name: 'Squats', icon_url: 'https://your-domain.com/icons/squats.png' },
  { name: 'Dips', icon_url: 'https://your-domain.com/icons/dips.png' },
];

// Update icon URLs untuk master cardios
const cardioIconUpdates = [
  { name: 'Running', icon_url: 'https://your-domain.com/icons/running.png' },
  { name: 'Walking', icon_url: 'https://your-domain.com/icons/walking.png' },
  { name: 'Mountain Climbing', icon_url: 'https://your-domain.com/icons/mountain-climbing.png' },
  { name: 'Cycling', icon_url: 'https://your-domain.com/icons/cycling.png' },
  { name: 'Swimming', icon_url: 'https://your-domain.com/icons/swimming.png' },
];

const updateIconUrls = async () => {
  console.log('🎨 Mulai update icon URLs...');

  try {
    // Update exercise icons
    console.log('\n📝 Updating Exercise Icons...');
    for (const update of exerciseIconUpdates) {
      const query = `
        UPDATE master_exercises
        SET icon_url = $1
        WHERE name = $2
        RETURNING id, name, icon_url
      `;
      const result = await pool.query(query, [update.icon_url, update.name]);

      if (result.rows.length > 0) {
        console.log(`✅ Exercise [${result.rows[0].name}] icon updated`);
      }
    }

    // Update cardio icons
    console.log('\n🏃 Updating Cardio Icons...');
    for (const update of cardioIconUpdates) {
      const query = `
        UPDATE master_cardios
        SET icon_url = $1
        WHERE name = $2
        RETURNING id, name, icon_url
      `;
      const result = await pool.query(query, [update.icon_url, update.name]);

      if (result.rows.length > 0) {
        console.log(`✅ Cardio [${result.rows[0].name}] icon updated`);
      }
    }

    console.log('\n✨ Icon URL update selesai!');
  } catch (error) {
    console.error('❌ Terjadi kesalahan saat update:', error.message);
  } finally {
    await pool.end();
  }
};

updateIconUrls();
