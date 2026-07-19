/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
    pgm.addColumns('master_exercises', {
        level: {
            type: 'varchar(50)',
            notNull: true,
            default: 'beginner',
        },
    });

    pgm.addColumns('master_cardios', {
        level: {
            type: 'varchar(50)',
            notNull: true,
            default: 'beginner',
        },
    });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
    pgm.dropColumns('master_exercises', ['level']);
    pgm.dropColumns('master_cardios', ['level']);
};
