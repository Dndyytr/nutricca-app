import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { UserPayloadSchema, updateUserPayloadSchema } from '../src/services/users/validator/schema.js';

describe('User Schemas Unit Tests', () => {
  describe('UserPayloadSchema (Registration)', () => {
    test('should pass validation with complete valid payload', () => {
      const payload = {
        fullname: 'Budi Santoso',
        email: 'budi@mail.com',
        password: 'Password123',
        otp: '123456',
      };
      const { error, value } = UserPayloadSchema.validate(payload);
      assert.equal(error, undefined);
      assert.deepEqual(value, payload);
    });

    test('should fail validation when OTP is not 6 digits', () => {
      const payload = {
        fullname: 'Budi Santoso',
        email: 'budi@mail.com',
        password: 'Password123',
        otp: '12345',
      };
      const { error } = UserPayloadSchema.validate(payload);
      assert.notEqual(error, undefined);
      assert.equal(error.message, 'OTP harus persis 6 digit.');
    });

    test('should fail validation when OTP contains non-numeric characters', () => {
      const payload = {
        fullname: 'Budi Santoso',
        email: 'budi@mail.com',
        password: 'Password123',
        otp: '12345a',
      };
      const { error } = UserPayloadSchema.validate(payload);
      assert.notEqual(error, undefined);
      assert.equal(error.message, 'OTP hanya boleh berisi angka.');
    });

    test('should fail validation when fullname is too short (< 3 chars)', () => {
      const payload = {
        fullname: 'Bu',
        email: 'budi@mail.com',
        password: 'Password123',
        otp: '123456',
      };
      const { error } = UserPayloadSchema.validate(payload);
      assert.notEqual(error, undefined);
      assert.match(error.message, /"fullname" length must be at least 3 characters long/);
    });

    test('should fail validation when password is too short (< 6 chars)', () => {
      const payload = {
        fullname: 'Budi Santoso',
        email: 'budi@mail.com',
        password: '12345',
        otp: '123456',
      };
      const { error } = UserPayloadSchema.validate(payload);
      assert.notEqual(error, undefined);
      assert.match(error.message, /"password" length must be at least 6 characters long/);
    });
  });

  describe('updateUserPayloadSchema', () => {
    test('should pass validation with valid fullname', () => {
      const payload = { fullname: 'Nama Baru' };
      const { error } = updateUserPayloadSchema.validate(payload);
      assert.equal(error, undefined);
    });
  });
});
