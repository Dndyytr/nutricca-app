/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * master_activities sudah tidak dipakai lagi (dihapus). activity_logs sekarang
 * hanya untuk aktivitas cardio, jadi activity_id diarahkan ke master_cardios.
 * master_cardios.id bertipe SERIAL (integer), jadi kolom activity_id ikut
 * diubah dari VARCHAR ke INTEGER.
 *
 * Catatan: aman dijalankan karena tabel activity_logs saat ini masih kosong (0 baris).
 *
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  // Ubah tipe kolom activity_id dari VARCHAR(50) -> INTEGER
  pgm.sql(`
    ALTER TABLE activity_logs
    ALTER COLUMN activity_id TYPE INTEGER USING activity_id::integer
  `);

  // Pasang FK baru ke master_cardios
  pgm.addConstraint('activity_logs', 'activity_logs_activity_id_fkey', {
    foreignKeys: {
      columns: 'activity_id',
      references: 'master_cardios(id)',
      onDelete: 'RESTRICT',
    },
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropConstraint('activity_logs', 'activity_logs_activity_id_fkey');
  pgm.sql(`
    ALTER TABLE activity_logs
    ALTER COLUMN activity_id TYPE VARCHAR(50) USING activity_id::varchar
  `);
};
