import UserRepository from '../../users/repositories/user-repositories.js';
import TokenManager from '../../../security/token-manager.js';
import AuthenticationRepository from '../repositories/authentication-repositories.js';
import AuthenticationError from '../../../exceptions/authentication-error.js';
import InvariantError from '../../../exceptions/invariant-error.js';
import response from '../../../utils/response.js';
import { OAuth2Client } from 'google-auth-library';
import { sendOtpEmail } from '../../../utils/mailer.js';
import GamificationRepository from '../../gamifications/repositories/gamification-repositories.js';
import OtpRepository from '../repositories/otp-repositories.js';
import crypto from 'crypto';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const loginWithGoogle = async (req, res, next) => {
  const { token } = req.validated;

  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  const email = payload.email;
  const fullname = payload.name;

  let user = await UserRepository.getUserByEmail(email);
  let isNewUser = false;

  if (!user) {
    isNewUser = true;
    const randomPassword = `SSO_${crypto.randomBytes(16).toString('hex')}`;
    user = await UserRepository.createUser({
      fullname,
      email,
      password: randomPassword,
    });
  }

  if (isNewUser) {
    const gamification = await GamificationRepository.createGamificationProfile(
      user.id,
    );

    if (!gamification) {
      return next(
        new InvariantError(
          'Failed to create gamification profile for the user.',
        ),
      );
    }
  }

  const accessToken = TokenManager.generateAccessToken({ id: user.id });
  const refreshToken = TokenManager.generateRefreshToken({ id: user.id });

  await AuthenticationRepository.addRefreshToken(refreshToken);

  return response(res, 200, 'Authentication successful', {
    accessToken,
    refreshToken,
  });
};
export const login = async (req, res, next) => {
  const { email, password } = req.validated;

  // verifyUserCredential is now properly called from UserRepository
  const userId = await UserRepository.verifyUserCredential(email, password);

  if (!userId) {
    return next(new AuthenticationError('Invalid credentials provided.'));
  }

  const accessToken = TokenManager.generateAccessToken({ id: userId });
  const refreshToken = TokenManager.generateRefreshToken({ id: userId });

  await AuthenticationRepository.addRefreshToken(refreshToken);

  return response(res, 200, 'Authentication successful', {
    accessToken,
    refreshToken,
  });
};

export const refreshToken = async (req, res, next) => {
  const { refreshToken } = req.validated;

  const result =
    await AuthenticationRepository.verifyRefreshToken(refreshToken);

  if (!result) {
    return next(new InvariantError('Invalid refresh token.'));
  }

  const { id } = TokenManager.verifyRefreshToken(refreshToken);
  const accessToken = TokenManager.generateAccessToken({ id });

  return response(res, 200, 'Access token successfully updated', {
    accessToken,
  });
};

export const logout = async (req, res, next) => {
  const { refreshToken } = req.validated;

  const result =
    await AuthenticationRepository.verifyRefreshToken(refreshToken);

  if (!result) {
    return next(new InvariantError('Invalid refresh token.'));
  }

  await AuthenticationRepository.deleteRefreshToken(refreshToken);

  return response(res, 200, 'Logout successful');
};

export const requestOtp = async (req, res, next) => {
  const { email } = req.validated;
  const isEmailExist = await UserRepository.verifyEmail(email);

  if (isEmailExist) {
    return next(
      new InvariantError(
        'Email sudah terdaftar, silakan login atau gunakan email lain.',
      ),
    );
  }

  const otp = crypto.randomInt(100000, 999999).toString();

  const expiredAt = new Date(Date.now() + 5 * 60 * 1000);
  await OtpRepository.addOtp({ email, otp, expiredAt });

  try {
    await sendOtpEmail(email, otp);

    return response(
      res,
      200,
      'Kode OTP berhasil dikirim! Silakan cek email kamu.',
    );
  } catch (error) {
    console.error('Gagal mengirim email:', error);
    return next(new Error('Gagal mengirim email OTP, silakan coba lagi.'));
  }
};
