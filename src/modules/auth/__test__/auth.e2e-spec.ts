import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';

describe('[E2E] Auth', () => {
  let app: INestApplication;
  let accessToken: string;
  let refreshToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await Promise.all([app.close()]);
  });

  it('should be not authenticated with wrong credentials', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'wrong@email.com',
        password: 'wrongpassword',
      })
      .expect(400);
  });

  it('should be unauthorized if access_token not given', () => {
    return request(app.getHttpServer()).get('/auth/me').expect(401);
  });

  it('should be authenticated and get access_token', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@admin.com',
        password: 'password',
      })
      .expect(201)
      .expect((res) => {
        accessToken = res.body.access_token;
        refreshToken = res.body.refresh_token;
        expect(res.body.email).toBeDefined();
        expect(res.body.access_token).toBeDefined();
        expect(res.body.refresh_token).toBeDefined();
      });
  });

  it('should be authorized to get current auth user', () => {
    return request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', 'Bearer ' + accessToken)
      .expect(200)
      .expect((res) => {
        expect(res.body.email).toBeDefined();
      });
  });

  it('should be authorized to refresh access_token', () => {
    return request(app.getHttpServer())
      .post('/auth/refresh')
      .send({
        refresh_token: refreshToken,
      })
      .expect(201)
      .expect((res) => {
        accessToken = res.body.access_token;
        refreshToken = res.body.refresh_token;
        expect(res.body.access_token).toBeDefined();
        expect(res.body.refresh_token).toBeDefined();
      });
  });

  it('should be authorized to get current auth user after refresh', () => {
    return request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', 'Bearer ' + accessToken)
      .expect(200)
      .expect((res) => {
        expect(res.body.email).toBeDefined();
      });
  });

  it('should be able to logout', () => {
    return request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', 'Bearer ' + accessToken)
      .expect(201);
  });
});
