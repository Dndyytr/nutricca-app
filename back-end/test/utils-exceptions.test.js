import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import ClientError from '../src/exceptions/client-error.js';
import InvariantError from '../src/exceptions/invariant-error.js';
import NotFoundError from '../src/exceptions/not-found-error.js';
import AuthenticationError from '../src/exceptions/authentication-error.js';

describe('Custom Exceptions Unit Tests', () => {
  test('ClientError should correctly set statusCode and name', () => {
    const error = new ClientError('Bad Request', 400);
    assert.equal(error.message, 'Bad Request');
    assert.equal(error.statusCode, 400);
    assert.equal(error.name, 'ClientError');
    assert.ok(error instanceof Error);
  });

  test('InvariantError should default to 400 statusCode and correct name', () => {
    const error = new InvariantError('Invalid Payload');
    assert.equal(error.message, 'Invalid Payload');
    assert.equal(error.statusCode, 400);
    assert.equal(error.name, 'InvariantError');
    assert.ok(error instanceof ClientError);
  });

  test('NotFoundError should default to 404 statusCode', () => {
    const error = new NotFoundError('Resource Not Found');
    assert.equal(error.message, 'Resource Not Found');
    assert.equal(error.statusCode, 404);
    assert.equal(error.name, 'NotFoundError');
    assert.ok(error instanceof ClientError);
  });

  test('AuthenticationError should default to 401 statusCode', () => {
    const error = new AuthenticationError('Unauthorized Access');
    assert.equal(error.message, 'Unauthorized Access');
    assert.equal(error.statusCode, 401);
    assert.equal(error.name, 'AuthenticationError');
    assert.ok(error instanceof ClientError);
  });
});
