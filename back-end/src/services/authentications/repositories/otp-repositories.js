import { Pool } from 'pg';

class OtpRepository {
  constructor() {
    this.pool = new Pool();
  }

  async addOtp({ email, otp, expiredAt }) {
    const query = {
      text: 'INSERT INTO otp_codes (email, otp, expired_at) VALUES ($1, $2, $3)',
      values: [email, otp, expiredAt],
    };
    await this.pool.query(query);
  }

  async checkValidOtp(email, otp) {
    const query = {
      text: `
        SELECT * FROM otp_codes 
        WHERE email = $1 AND otp = $2 AND expired_at > CURRENT_TIMESTAMP
      `,
      values: [email, otp],
    };

    const result = await this.pool.query(query);

    return result.rowCount > 0;
  }

  async deleteOtpByEmail(email) {
    const query = {
      text: 'DELETE FROM otp_codes WHERE email = $1',
      values: [email],
    };
    await this.pool.query(query);
  }
}

export default new OtpRepository();
