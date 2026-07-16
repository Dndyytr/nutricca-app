import BasicIdentityRepository from '../repositories/basic_identity-repositories.js';
import InvariantError from '../../../exceptions/invariant-error.js';
import NotFoundError from '../../../exceptions/not-found-error.js';
import response from '../../../utils/response.js';

export const addUserBasicIdentity = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const {
      age,
      gender,
      weight,
      height,
      activity_level: activityLevel,
    } = req.validated;

    const isUserExist =
      await BasicIdentityRepository.getUserBasicIdentityByUserId(userId);

    if (isUserExist) {
      return next(
        new InvariantError(
          'Failed to add basic identity. User already has a basic identity profile.',
        ),
      );
    }

    const userBasicIdentity =
      await BasicIdentityRepository.addUserBasicIdentity({
        userId,
        age,
        gender,
        weight,
        height,
        activityLevel,
      });

    if (!userBasicIdentity) {
      return next(new InvariantError('Failed to add basic identity.'));
    }

    return response(res, 201, 'Basic identity successfully added', {
      id: userBasicIdentity.id,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserBasicIdentityByUserId = async (req, res, next) => {
  try {
    // 1. Ambil ID langsung dari Token rahasia, BUKAN dari URL params
    const userId = req.user.id;

    const userBasicIdentity =
      await BasicIdentityRepository.getUserBasicIdentityByUserId(userId);

    if (!userBasicIdentity) {
      return next(new NotFoundError('Basic identity not found.'));
    }

    return response(res, 200, 'Basic identity successfully retrieved', {
      userBasicIdentity,
    });
  } catch (error) {
    next(error);
  }
};

export const editUserBasicIdentityByUserId = async (req, res, next) => {
  try {
    // 1. Ambil ID dari Token
    const userId = req.user.id;

    // 2. Ambil data dari body
    const {
      age,
      gender,
      weight,
      height,
      activity_level: activityLevel,
    } = req.validated;

    const isUserBasicIdentityExist =
      await BasicIdentityRepository.getUserBasicIdentityByUserId(userId);

    if (!isUserBasicIdentityExist) {
      return next(new NotFoundError('Basic identity not found.'));
    }

    const userBasicIdentity =
      await BasicIdentityRepository.editUserBasicIdentityByUserId(userId, {
        age,
        gender,
        weight,
        height,
        activityLevel,
      });

    if (!userBasicIdentity) {
      return next(new InvariantError('Failed to update basic identity.'));
    }

    return response(res, 200, 'Basic identity successfully updated', {
      userBasicIdentity,
    });
  } catch (error) {
    next(error);
  }
};
