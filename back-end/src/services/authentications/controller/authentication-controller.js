import UserRepository from '../../users/repositories/user-repositories.js';
import TokenManager from '../../../security/token-manager.js';
import AuthenticationRepository from '../repositories/authentication-repositories.js';
import AuthenticationError from '../../../exceptions/authentication-error.js';
import InvariantError from '../../../exceptions/invariant-error.js';
import response from '../../../utils/response.js';

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
