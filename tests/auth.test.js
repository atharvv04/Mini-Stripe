const request = require('supertest');
const app = require('../src/server');
const { query } = require('../src/database/connection');

describe('Authentication Routes', () => {
  const testUser = {
    email: 'test@example.com',
    password: 'TestPass123',
    firstName: 'Test',
    lastName: 'User',
  };

  beforeEach(async () => {
    // Clean up test data
    await query('DELETE FROM users WHERE email = $1', [testUser.email]);
  });

  afterAll(async () => {
    // Clean up after all tests
    await query('DELETE FROM users WHERE email = $1', [testUser.email]);
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data.user.firstName).toBe(testUser.firstName);
      expect(response.body.data.user.lastName).toBe(testUser.lastName);
      expect(response.body.data).toHaveProperty('token');
    });

    it('should return error for invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          ...testUser,
          email: 'invalid-email',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });

    it('should return error for weak password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          ...testUser,
          password: 'weak',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });

    it('should return error for duplicate email', async () => {
      // Register user first
      await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      // Try to register again with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('User with this email already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Register a test user
      await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);
    });

    it('should login successfully with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data).toHaveProperty('token');
    });

    it('should return error for invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: testUser.password,
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid email or password');
    });

    it('should return error for invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid email or password');
    });

    it('should return error for invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid-email',
          password: testUser.password,
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });
  });
}); 