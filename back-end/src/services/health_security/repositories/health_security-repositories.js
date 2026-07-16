import { Pool } from 'pg';
import { nanoid } from 'nanoid';

class HealthSecurityRepository {
  constructor() {
    this.pool = new Pool();
  }

  async addHealthSecurity({
    userId,
    medicalHistory,
    physicalInjuries,
    currentMedication,
    bloodPressure,
    heartRate,
    allergy,
  }) {
    const id = `health-${nanoid(16)}`;

    const query = {
      text: `
        INSERT INTO health_securities (
          id,
          user_id,
          medical_history,
          physical_injuries,
          current_medication,
          blood_pressure,
          heart_rate,
          allergy
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8
        )
        RETURNING id
      `,
      values: [
        id,
        userId,
        medicalHistory,
        physicalInjuries,
        currentMedication,
        bloodPressure,
        heartRate,
        allergy,
      ],
    };

    const result = await this.pool.query(query);
    return result.rows[0].id;
  }

  async getHealthSecurityByUserId(userId) {
    const query = {
      text: `
        SELECT
          id,
          user_id,
          medical_history,
          physical_injuries,
          current_medication,
          blood_pressure,
          heart_rate,
          allergy,
          created_at,
          updated_at
        FROM health_securities
        WHERE user_id = $1
      `,
      values: [userId],
    };

    const result = await this.pool.query(query);
    // Mengembalikan objek tunggal, bukan array
    return result.rows[0];
  }

  async getHealthSecurityById(id) {
    const query = {
      text: `
        SELECT
          id,
          user_id,
          medical_history,
          physical_injuries,
          current_medication,
          blood_pressure,
          heart_rate,
          allergy,
          created_at,
          updated_at
        FROM health_securities
        WHERE id = $1
      `,
      values: [id],
    };

    const result = await this.pool.query(query);
    return result.rows[0];
  }

  async updateHealthSecurityById(
    id,
    {
      medicalHistory,
      physicalInjuries,
      currentMedication,
      bloodPressure,
      heartRate,
      allergy,
    },
  ) {
    const query = {
      text: `
        UPDATE health_securities
        SET
          medical_history = $1,
          physical_injuries = $2,
          current_medication = $3,
          blood_pressure = $4,
          heart_rate = $5,
          allergy = $6,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $7
        RETURNING id
      `,
      values: [
        medicalHistory,
        physicalInjuries,
        currentMedication,
        bloodPressure,
        heartRate,
        allergy,
        id,
      ],
    };

    const result = await this.pool.query(query);
    return result.rows[0];
  }
}

export default new HealthSecurityRepository();
