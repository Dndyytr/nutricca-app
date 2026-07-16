import HealthSecurityRepository from '../repositories/health_security-repositories.js';
import InvariantError from '../../../exceptions/invariant-error.js';
import NotFoundError from '../../../exceptions/not-found-error.js';
import response from '../../../utils/response.js';

export const addHealthSecurity = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const {
      medical_history: medicalHistory,
      physical_injuries: physicalInjuries,
      current_medication: currentMedication,
      blood_pressure: bloodPressure,
      heart_rate: heartRate,
      allergy,
    } = req.validated;

    const isUserExist =
      await HealthSecurityRepository.getHealthSecurityByUserId(userId);

    if (isUserExist) {
      return next(
        new InvariantError(
          'Failed to add health security data. User already has health security data.',
        ),
      );
    }

    const healthSecurityId = await HealthSecurityRepository.addHealthSecurity({
      userId,
      medicalHistory,
      physicalInjuries,
      currentMedication,
      bloodPressure,
      heartRate,
      allergy,
    });

    if (!healthSecurityId) {
      return next(new InvariantError('Failed to add health security data.'));
    }

    return response(res, 201, 'Health security data successfully added', {
      id: healthSecurityId,
    });
  } catch (error) {
    next(error);
  }
};

export const getHealthSecurityByUserId = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const healthSecurity =
      await HealthSecurityRepository.getHealthSecurityByUserId(userId);

    if (!healthSecurity) {
      return next(new NotFoundError('Health security data not found.'));
    }

    return response(res, 200, 'Health security data successfully retrieved', {
      healthSecurity,
    });
  } catch (error) {
    next(error);
  }
};

export const editHealthSecurityByUserId = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Map parameters to camelCase
    const {
      medical_history: medicalHistory,
      physical_injuries: physicalInjuries,
      current_medication: currentMedication,
      blood_pressure: bloodPressure,
      heart_rate: heartRate,
      allergy,
    } = req.validated;

    // Fetch the existing record first to get its Primary Key (id)
    const existingSecurityData =
      await HealthSecurityRepository.getHealthSecurityByUserId(userId);

    if (!existingSecurityData) {
      return next(new NotFoundError('Health security data not found.'));
    }

    // Use the ID from the existing record to perform the update
    const healthSecurityId =
      await HealthSecurityRepository.updateHealthSecurityById(
        existingSecurityData.id,
        {
          medicalHistory,
          physicalInjuries,
          currentMedication,
          bloodPressure,
          heartRate,
          allergy,
        },
      );

    if (!healthSecurityId) {
      return next(new InvariantError('Failed to update health security data.'));
    }

    return response(res, 200, 'Health security data successfully updated', {
      id: healthSecurityId,
    });
  } catch (error) {
    next(error);
  }
};
