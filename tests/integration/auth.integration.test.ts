import { Role } from '@prisma/client';
import { app, request, seedUser, asStudent, bearer } from './helpers';

describe('Auth routes', () => {
  describe('POST /api/auth/admin/login', () => {
    it('should return 200 with a token and password-free user for valid credentials', async () => {
      await seedUser(Role.ADMIN, { email: 'admin@example.com', password: 'Admin@123' });

      const res = await request(app)
        .post('/api/auth/admin/login')
        .send({ email: 'admin@example.com', password: 'Admin@123' });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ success: true, message: 'Admin logged in successfully' });
      expect(res.body.data.token).toEqual(expect.any(String));
      expect(res.body.data.user).not.toHaveProperty('password');
      expect(res.body.data.user.role).toBe('ADMIN');
    });

    it('should return 401 when the password is incorrect', async () => {
      await seedUser(Role.ADMIN, { email: 'admin@example.com', password: 'Admin@123' });

      const res = await request(app)
        .post('/api/auth/admin/login')
        .send({ email: 'admin@example.com', password: 'wrong' });

      expect(res.status).toBe(401);
      expect(res.body).toMatchObject({ success: false, message: 'Invalid credentials' });
    });

    it('should return 401 when a student tries the admin endpoint (role-scoped)', async () => {
      await seedUser(Role.STUDENT, { email: 'student@example.com', password: 'Student@123' });

      const res = await request(app)
        .post('/api/auth/admin/login')
        .send({ email: 'student@example.com', password: 'Student@123' });

      expect(res.status).toBe(401);
    });

    it('should return 400 when the body fails validation', async () => {
      const res = await request(app).post('/api/auth/admin/login').send({ email: 'not-an-email' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(Array.isArray(res.body.errors)).toBe(true);
    });
  });

  describe('POST /api/auth/student/login', () => {
    it('should return 200 for valid student credentials', async () => {
      await seedUser(Role.STUDENT, { email: 'student@example.com', password: 'Student@123' });

      const res = await request(app)
        .post('/api/auth/student/login')
        .send({ email: 'student@example.com', password: 'Student@123' });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Student logged in successfully');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return the authenticated profile with a valid token', async () => {
      const { token, user } = await asStudent();

      const res = await request(app).get('/api/auth/me').set('Authorization', bearer(token));

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(user.id);
      expect(res.body.data).not.toHaveProperty('password');
    });

    it('should return 401 without a token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });
  });
});
