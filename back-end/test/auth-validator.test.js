import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  postAuthenticationPayloadSchema,
  postAuthenticationGooglePayloadSchema,
  putAuthenticationPayloadSchema,
  deleteAuthenticationPayloadSchema,
  otpValidationPayloadSchema,
} from '../src/services/authentications/validator/schema.js';

describe('Authentication Schemas Unit Tests', () => {
  describe('postAuthenticationPayloadSchema', () => {
    test('should pass validation with valid email and password', () => {
      const payload = { email: 'user@example.com', password: 'secretPassword123' };
      const { error, value } = postAuthenticationPayloadSchema.validate(payload);
      assert.equal(error, undefined);
      assert.deepEqual(value, payload);
    });

    test('should fail validation with invalid email format', () => {
      const payload = { email: 'invalid-email', password: 'password123' };
      const { error } = postAuthenticationPayloadSchema.validate(payload);
      assert.notEqual(error, undefined);
      assert.match(error.message, /"email" must be a valid email/);
    });

    test('should fail validation when password is missing', () => {
      const payload = { email: 'user@example.com' };
      const { error } = postAuthenticationPayloadSchema.validate(payload);
      assert.notEqual(error, undefined);
      assert.match(error.message, /"password" is required/);
    });
  });

  describe('otpValidationPayloadSchema', () => {
    test('should pass validation with valid email', () => {
      const payload = { email: 'test@domain.com' };
      const { error, value } = otpValidationPayloadSchema.validate(payload);
      assert.equal(error, undefined);
      assert.equal(value.email, 'test@domain.com');
    });

    test('should fail validation when email is missing', () => {
      const payload = {};
      const { error } = otpValidationPayloadSchema.validate(payload);
      assert.notEqual(error, undefined);
      assert.match(error.message, /"email" is required/);
    });

    test('should fail validation when email format is invalid', () => {
      const payload = { email: 'plainaddress' };
      const { error } = otpValidationPayloadSchema.validate(payload);
      assert.notEqual(error, undefined);
      assert.match(error.message, /"email" must be a valid email/);
    });
  });

  describe('putAuthenticationPayloadSchema & deleteAuthenticationPayloadSchema', () => {
    test('should pass PUT validation with refreshToken', () => {
      const payload = { refreshToken: 'valid.jwt.token' };
      const { error } = putAuthenticationPayloadSchema.validate(payload);
      assert.equal(error, undefined);
    });

    test('should fail PUT validation without refreshToken', () => {
      const payload = {};
      const { error } = putAuthenticationPayloadSchema.validate(payload);
      assert.notEqual(error, undefined);
    });

    test('should pass DELETE validation with refreshToken', () => {
      const payload = { refreshToken: 'valid.jwt.token' };
      const { error } = deleteAuthenticationPayloadSchema.validate(payload);
      assert.equal(error, undefined);
    });
  });

  describe('postAuthenticationGooglePayloadSchema', () => {
    test('should pass validation with valid google token', () => {
      const payload = { token: 'google_id_token_123' };
      const { error } = postAuthenticationGooglePayloadSchema.validate(payload);
      assert.equal(error, undefined);
    });
  });
});
