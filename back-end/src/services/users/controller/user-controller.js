import UserRepository from '../repositories/user-repositories.js';
import GamificationRepository from '../../gamifications/repositories/gamification-repositories.js';
import BasicIdentityRepository from '../../basic_identity/repositories/basic_identity-repositories.js';

import InvariantError from '../../../exceptions/invariant-error.js';
import NotFoundError from '../../../exceptions/not-found-error.js';
import response from '../../../utils/response.js';

export const addNewUser = async (req, res, next) => {
  const { fullname, email, password } = req.validated;

  // The repository now returns a boolean (true/false)
  const isEmailExist = await UserRepository.verifyEmail(email);

  if (isEmailExist) {
    return next(
      new InvariantError('Failed to add user. Email is already in use.'),
    );
  }

  // Use camelCase to match the updated repository method
  const user = await UserRepository.createUser({
    fullname,
    email,
    password,
  });

  if (!user) {
    return next(new InvariantError('Failed to add user.'));
  }

  const gamification = await GamificationRepository.createGamificationProfile(
    user.id,
  );

  if (!gamification) {
    return next(
      new InvariantError('Failed to create gamification profile for the user.'),
    );
  }

  return response(res, 201, 'User successfully added', {
    id: user.id,
  });
};

export const getUserById = async (req, res, next) => {
  const id = req.user?.id || req.params.id;

  const user = await UserRepository.getUserById(id);

  if (!user) {
    return next(new NotFoundError('User not found.'));
  }

  return response(res, 200, 'User successfully retrieved', { user });
};

// ... import lainnya ...

export const updateUserById = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) return next(new InvariantError('User ID not found in token.'));

    const { fullname } = req.validated || req.body;
    if (!fullname) return next(new InvariantError('Fullname is required.'));

    const updatedUser = await UserRepository.editFullnameByUserId(userId, { fullname });
    if (!updatedUser) return next(new InvariantError('Failed to update user profile.'));

    return response(res, 200, 'User profile successfully updated', { user: updatedUser });
  } catch (error) {
    next(error);
  }
};

export const addUserBasicIdentity = async (req, res, next) => {
  // Map snake_case from the request body to camelCase for the repository
  const {
    user_id: userId,
    age,
    gender,
    weight,
    height,
    activity_level: activityLevel,
  } = req.validated;

  // Using the boolean check from our previous revision
  const isUserExist = await UserRepository.verifyUserById(userId);

  if (!isUserExist) {
    return next(new NotFoundError('User not found.'));
  }

  // Use BasicIdentityRepository, NOT UserRepository
  const userBasicIdentity = await BasicIdentityRepository.addUserBasicIdentity({
    userId,
    age,
    gender,
    weight,
    height,
    activityLevel,
  });

  if (!userBasicIdentity) {
    return next(new InvariantError('Failed to add user basic identity data.'));
  }

  return response(res, 201, 'Basic identity data successfully added', {
    id: userBasicIdentity.id,
    userId: userId,
  });
};

export const updateOnboardingStatus = async (req, res, next) => {
  const userId = req.user?.id;

  if (!userId) {
    return next(new InvariantError('User ID not found in token.'));
  }

  // setOnboardingCompleted adalah nama method yang benar di repository
  const updatedUser = await UserRepository.setOnboardingCompleted(userId);

  if (!updatedUser) {
    return next(new InvariantError('Failed to update onboarding status.'));
  }

  return response(res, 200, 'Onboarding status successfully updated', {
    user: updatedUser,
  });
};
