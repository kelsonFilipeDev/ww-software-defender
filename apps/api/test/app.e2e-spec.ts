import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

/* eslint-disable @typescript-eslint/no-unsafe-argument */
interface TokenResponse {
  accessToken: string;
}
interface EventResponse {
  id: string;
  type: string;
  entityId: string;
}
interface RiskResponse {
  entityId: string;
  score: number;
}
interface StateResponse {
  entityId: string;
  state: string;
}
interface DecisionResponse {
  entityId: string;
  action: string;
}
interface ActionResponse {
  entityId: string;
  action: string;
  status: string;
  executedAt: string;
}
interface AuditResponse {
  entityId: string;
}

describe('WW Defender — E2E Flow', () => {
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/auth/token', () => {
    it('should generate a JWT token', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/token')
        .send({ clientId: 'e2e-test-client' })
        .expect(201);
      const body = res.body as TokenResponse;
      expect(body.accessToken).toBeDefined();
      token = body.accessToken;
    });

    it('should reject empty clientId', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/token')
        .send({ clientId: '' })
        .expect(400);
    });
  });

  describe('POST /api/events', () => {
    it('should reject request without token', async () => {
      await request(app.getHttpServer())
        .post('/api/events')
        .send({ type: 'LoginFailed', entityId: 'e2e-user' })
        .expect(401);
    });

    it('should create an event with valid token', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/events')
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: 'LoginFailed',
          entityId: 'e2e-user',
          payload: { ip: '10.0.0.1' },
        })
        .expect(201);
      const body = res.body as EventResponse;
      expect(body.id).toBeDefined();
      expect(body.type).toBe('LoginFailed');
      expect(body.entityId).toBe('e2e-user');
    });

    it('should reject invalid payload', async () => {
      await request(app.getHttpServer())
        .post('/api/events')
        .set('Authorization', `Bearer ${token}`)
        .send({ type: '', entityId: '' })
        .expect(400);
    });
  });

  describe('GET /api/risk/:entityId', () => {
    it('should calculate risk score for entity', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/risk/e2e-user')
        .expect(200);
      const body = res.body as RiskResponse;
      expect(body.entityId).toBe('e2e-user');
      expect(body.score).toBeGreaterThanOrEqual(5);
    });
  });

  describe('GET /api/state/:entityId', () => {
    it('should return state based on risk score', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/state/e2e-user')
        .expect(200);
      const body = res.body as StateResponse;
      expect(body.entityId).toBe('e2e-user');
      expect([
        'NORMAL',
        'SUSPEITO',
        'ALERTA',
        'CRITICO',
        'BLOQUEADO',
      ]).toContain(body.state);
    });
  });

  describe('GET /api/decision/:entityId', () => {
    it('should return decision based on state', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/decision/e2e-user')
        .expect(200);
      const body = res.body as DecisionResponse;
      expect(body.entityId).toBe('e2e-user');
      expect(['ALLOW', 'THROTTLE', 'CHALLENGE', 'BLOCK']).toContain(
        body.action,
      );
    });
  });

  describe('POST /api/action/:entityId', () => {
    it('should reject request without token', async () => {
      await request(app.getHttpServer())
        .post('/api/action/e2e-user')
        .expect(401);
    });

    it('should execute action and create audit log', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/action/e2e-user')
        .set('Authorization', `Bearer ${token}`)
        .expect(201);
      const body = res.body as ActionResponse;
      expect(body.entityId).toBe('e2e-user');
      expect(body.action).toBeDefined();
      expect(body.status).toBe('EXECUTED');
      expect(body.executedAt).toBeDefined();
    });
  });

  describe('GET /api/audit/:entityId', () => {
    it('should reject request without token', async () => {
      await request(app.getHttpServer()).get('/api/audit/e2e-user').expect(401);
    });

    it('should return audit logs for entity', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/audit/e2e-user')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      const body = res.body as AuditResponse[];
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBeGreaterThan(0);
      expect(body[0].entityId).toBe('e2e-user');
    });
  });
});
