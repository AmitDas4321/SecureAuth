import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'node:path';
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import axios from 'axios';
import { UAParser } from 'ua-parser-js';
import { firebaseDb } from './src/server/firebase.ts';
import { encrypt, decrypt } from './src/server/encryption.ts';
import { z } from 'zod';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'fallback_key';
const APP_NAME = process.env.APP_NAME || 'SecureAuth';
const TEXTSNAP_API_URL = 'https://textsnap.in/api/send';
const TEXTSNAP_INSTANCE_ID = process.env.TEXTSNAP_INSTANCE_ID;
const TEXTSNAP_ACCESS_TOKEN = process.env.TEXTSNAP_ACCESS_TOKEN;

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT || 3000);

  app.set('trust proxy', 1);

  app.use(express.json());
  app.use(cookieParser());
  app.use(
    helmet({
      contentSecurityPolicy: false,
    })
  );
  app.use(cors());

  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
  });
  app.use('/api/', apiLimiter);

  const authenticateToken = async (req: any, res: any, next: any) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);

      if (decoded.sessionId) {
        try {
          const session: any = await firebaseDb.get(`authenticator_sessions/${decoded.sessionId}`);
          if (!session || session.revoked) {
            res.clearCookie('token');
            return res.status(401).json({ error: 'Session expired or revoked' });
          }

          if (Date.now() - session.lastActiveAt > 60000) {
            firebaseDb
              .patch(`authenticator_sessions/${decoded.sessionId}`, {
                lastActiveAt: Date.now(),
              })
              .catch(console.error);
          }
        } catch (dbErr) {
          console.error('DB Error in authenticateToken:', dbErr);
          throw dbErr;
        }
      }

      req.user = decoded;
      next();
    } catch (err) {
      console.error('Auth Error:', err);
      res.clearCookie('token');
      return res.status(403).json({
        error: 'Forbidden',
        details: err instanceof Error ? err.message : String(err),
      });
    }
  };

  app.post('/api/auth/send-otp', async (req, res) => {
    try {
      const { phoneNumber } = req.body;
      if (!phoneNumber) return res.status(400).json({ error: 'Phone number required' });

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
      const expiresAt = Date.now() + 5 * 60 * 1000;
      const verificationId = crypto.randomUUID();

      await firebaseDb.put(`otp_verifications/${verificationId}`, {
        phoneNumber,
        otpHash,
        expiresAt,
        createdAt: Date.now(),
      });

      try {
        await axios.post(TEXTSNAP_API_URL, {
          number: phoneNumber.startsWith('+') ? phoneNumber.substring(1) : phoneNumber,
          type: 'text',
          message: `Your ${APP_NAME} OTP is ${otp}. Valid for 5 minutes.`,
          instance_id: TEXTSNAP_INSTANCE_ID,
          access_token: TEXTSNAP_ACCESS_TOKEN,
        });

        res.json({ verificationId, message: 'OTP sent successfully' });
      } catch (error) {
        console.error('TextSnap Error:', error);
        res.status(500).json({ error: 'Failed to send OTP' });
      }
    } catch (error) {
      console.error('Send OTP Error:', error);
      res.status(500).json({
        error: 'Failed to create OTP verification',
        details: error instanceof Error ? error.message : String(error),
      });
    }
  });

  app.post('/api/auth/verify-otp', async (req, res) => {
    const { verificationId, otp } = req.body;
    if (!verificationId || !otp) return res.status(400).json({ error: 'Data missing' });

    const verification: any = await firebaseDb.get(`otp_verifications/${verificationId}`);
    if (!verification) return res.status(404).json({ error: 'Invalid verification' });

    if (Date.now() > verification.expiresAt) {
      return res.status(400).json({ error: 'OTP expired' });
    }

    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
    if (otpHash !== verification.otpHash) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    await firebaseDb.delete(`otp_verifications/${verificationId}`);

    const phoneNumber = verification.phoneNumber;
    const users: any = await firebaseDb.get('users');
    let userId = Object.keys(users || {}).find((id) => users[id].phoneNumber === phoneNumber);
    let isNewUser = false;

    if (!userId) {
      isNewUser = true;
      const newUser = await firebaseDb.post('users', {
        phoneNumber,
        displayName: '',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      userId = newUser.name;
    } else {
      isNewUser = !users[userId].displayName;
    }

    const parser = new UAParser(req.headers['user-agent']);
    const ua = parser.getResult();
    const sessionId = crypto.randomUUID();

    const sessionData = {
      userId,
      userAgent: req.headers['user-agent'] || 'Unknown',
      browser: `${ua.browser.name || 'Unknown'} ${ua.browser.version || ''}`.trim(),
      os: `${ua.os.name || 'Unknown'} ${ua.os.version || ''}`.trim(),
      device: ua.device.type || 'desktop',
      ip: req.ip || req.headers['x-forwarded-for'] || 'Unknown',
      createdAt: Date.now(),
      lastActiveAt: Date.now(),
      revoked: false,
    };

    await firebaseDb.put(`authenticator_sessions/${sessionId}`, sessionData);

    const userData = {
      userId,
      phoneNumber,
      displayName: users?.[userId]?.displayName || '',
      sessionId,
    };

    const token = jwt.sign(userData, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ token, user: userData, isNewUser });
  });

  app.post('/api/auth/complete-profile', authenticateToken, async (req: any, res) => {
    const { displayName } = req.body;
    if (!displayName || displayName.trim().length < 2) {
      return res.status(400).json({ error: 'Display name must be at least 2 characters' });
    }

    await firebaseDb.patch(`users/${req.user.userId}`, {
      displayName: displayName.trim(),
      updatedAt: Date.now(),
    });

    const { iat, exp, ...cleanUser } = req.user;
    const userData = { ...cleanUser, displayName: displayName.trim() };
    const token = jwt.sign(userData, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ user: userData });
  });

  app.post('/api/auth/app-lock/setup', authenticateToken, async (req: any, res) => {
    const { pin, enabled, autoLockTimeout } = req.body;
    if (!pin || (pin.length !== 4 && pin.length !== 6)) {
      return res.status(400).json({ error: 'PIN must be 4 or 6 digits' });
    }

    const hashedPin = crypto.createHash('sha256').update(pin + JWT_SECRET).digest('hex');

    await firebaseDb.patch(`users/${req.user.userId}`, {
      appLockPin: hashedPin,
      pinLength: pin.length,
      isAppLockEnabled: enabled ?? true,
      autoLockTimeout: autoLockTimeout ?? 300000,
      updatedAt: Date.now(),
    });

    res.json({
      success: true,
      isAppLockEnabled: enabled ?? true,
      pinLength: pin.length,
      autoLockTimeout: autoLockTimeout ?? 300000,
    });
  });

  app.post('/api/auth/app-lock/settings', authenticateToken, async (req: any, res) => {
    const { autoLockTimeout } = req.body;

    if (autoLockTimeout !== undefined && typeof autoLockTimeout !== 'number') {
      return res.status(400).json({ error: 'Invalid timeout value' });
    }

    await firebaseDb.patch(`users/${req.user.userId}`, {
      autoLockTimeout,
      updatedAt: Date.now(),
    });

    res.json({ success: true, autoLockTimeout });
  });

  app.post('/api/auth/app-lock/toggle', authenticateToken, async (req: any, res) => {
    const { enabled } = req.body;

    await firebaseDb.patch(`users/${req.user.userId}`, {
      isAppLockEnabled: !!enabled,
      updatedAt: Date.now(),
    });

    res.json({ success: true, isAppLockEnabled: !!enabled });
  });

  app.post('/api/auth/app-lock/verify', authenticateToken, async (req: any, res) => {
    const { pin } = req.body;
    const user: any = await firebaseDb.get(`users/${req.user.userId}`);

    if (!user || !user.appLockPin) {
      return res.status(400).json({ error: 'App Lock not configured' });
    }

    const hashedPin = crypto.createHash('sha256').update(pin + JWT_SECRET).digest('hex');

    if (hashedPin === user.appLockPin) {
      res.json({ success: true });
    } else {
      res.status(401).json({ error: 'Incorrect PIN' });
    }
  });

  app.get('/api/auth/me', authenticateToken, async (req: any, res) => {
    const user: any = await firebaseDb.get(`users/${req.user.userId}`);
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
      user: {
        userId: req.user.userId,
        phoneNumber: user.phoneNumber,
        displayName: user.displayName,
        sessionId: req.user.sessionId,
        isAppLockEnabled: !!user.isAppLockEnabled,
        pinLength: user.pinLength || 6,
        autoLockTimeout: user.autoLockTimeout || 300000,
      },
    });
  });

  app.post('/api/auth/logout', authenticateToken, async (req: any, res) => {
    if (req.user.sessionId) {
      await firebaseDb.patch(`authenticator_sessions/${req.user.sessionId}`, {
        revoked: true,
        updatedAt: Date.now(),
      });
    }
    res.clearCookie('token');
    res.json({ success: true });
  });

  app.get('/api/auth/sessions', authenticateToken, async (req: any, res) => {
    const sessions: any = await firebaseDb.get('authenticator_sessions');
    const userSessions = Object.entries(sessions || {})
      .filter(([_, s]: [string, any]) => s.userId === req.user.userId && !s.revoked)
      .map(([id, s]: [string, any]) => ({
        id,
        ...s,
        isCurrent: id === req.user.sessionId,
      }))
      .sort((a, b) => b.lastActiveAt - a.lastActiveAt);

    res.json(userSessions);
  });

  app.delete('/api/auth/sessions/others', authenticateToken, async (req: any, res) => {
    try {
      const sessions: any = await firebaseDb.get('authenticator_sessions');
      if (!sessions) return res.json({ success: true, count: 0 });

      const toRevoke = Object.entries(sessions).filter(
        ([id, s]: [string, any]) =>
          s && s.userId === req.user.userId && !s.revoked && id !== req.user.sessionId
      );

      if (toRevoke.length > 0) {
        const updates: any = {};
        const now = Date.now();

        toRevoke.forEach(([id]) => {
          updates[`${id}/revoked`] = true;
          updates[`${id}/updatedAt`] = now;
        });

        await firebaseDb.patch('authenticator_sessions', updates);
      }

      res.json({ success: true, count: toRevoke.length });
    } catch (error) {
      console.error('Failed to revoke other sessions:', error);
      res.status(500).json({
        error: 'Failed to revoke other sessions',
        details: error instanceof Error ? error.message : String(error),
      });
    }
  });

  app.delete('/api/auth/sessions/:sessionId', authenticateToken, async (req: any, res) => {
    const { sessionId } = req.params;
    const session: any = await firebaseDb.get(`authenticator_sessions/${sessionId}`);

    if (!session || session.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await firebaseDb.patch(`authenticator_sessions/${sessionId}`, {
      revoked: true,
      updatedAt: Date.now(),
    });

    if (sessionId === req.user.sessionId) {
      res.clearCookie('token');
    }

    res.json({ success: true });
  });

  const oracleMetadataSchema = z.object({
    deviceId: z.string().optional(),
    domainName: z.string().optional(),
    tenantName: z.string().optional(),
    cloudAccountName: z.string().optional(),
    loginUrl: z.string().optional(),
    otp: z.string().optional(),
    rsa: z.string().optional(),
    requestId: z.string().optional(),
    keyPairLength: z.string().optional(),
    serviceType: z.string().optional(),
    sse: z.string().optional(),
  });

  const accountSchema = z.object({
    issuer: z.string().min(1),
    label: z.string().min(1),
    customName: z.string().optional(),
    secret: z.string().default(''),
    digits: z.number().default(6),
    period: z.number().default(30),
    algorithm: z.string().default('SHA1'),
    provider: z.enum(['totp', 'oracle_mobile_authenticator']).optional().default('totp'),
    rawQrData: z.string().optional(),
    oracleMetadata: oracleMetadataSchema.optional(),
  });

  app.get('/api/accounts', authenticateToken, async (req: any, res) => {
    const accountsData: any = await firebaseDb.get('authenticator_accounts');
    const userAccounts = Object.entries(accountsData || {})
      .filter(([_, acc]: [string, any]) => acc.userId === req.user.userId)
      .map(([id, acc]: [string, any]) => ({
        id,
        ...acc,
        secret: acc.encryptedSecret ? decrypt(acc.encryptedSecret, ENCRYPTION_KEY) : '',
      }));
    res.json(userAccounts);
  });

  app.post('/api/accounts', authenticateToken, async (req: any, res) => {
    const validation = accountSchema.safeParse(req.body);
    if (!validation.success) return res.status(400).json({ error: validation.error.format() });

    const { issuer, label, secret, digits, period, algorithm, provider, rawQrData, oracleMetadata } =
      validation.data;
    const encryptedSecret = secret ? encrypt(secret, ENCRYPTION_KEY) : null;

    const newAcc = await firebaseDb.post('authenticator_accounts', {
      userId: req.user.userId,
      issuer,
      label,
      encryptedSecret,
      digits,
      period,
      algorithm,
      provider,
      rawQrData,
      oracleMetadata,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    res.json({ id: newAcc.name, message: 'Account added' });
  });

  app.put('/api/accounts/:id', authenticateToken, async (req: any, res) => {
    const { id } = req.params;
    const updateData = req.body;

    const existing: any = await firebaseDb.get(`authenticator_accounts/${id}`);
    if (!existing || existing.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    if (updateData.secret) {
      updateData.encryptedSecret = encrypt(updateData.secret, ENCRYPTION_KEY);
      delete updateData.secret;
    }

    await firebaseDb.patch(`authenticator_accounts/${id}`, {
      ...updateData,
      updatedAt: Date.now(),
    });
    res.json({ success: true });
  });

  app.patch('/api/accounts/:id/rename', authenticateToken, async (req: any, res) => {
    const { id } = req.params;
    const { customName } = req.body;

    if (typeof customName !== 'string') return res.status(400).json({ error: 'customName must be a string' });

    const existing: any = await firebaseDb.get(`authenticator_accounts/${id}`);
    if (!existing || existing.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    await firebaseDb.patch(`authenticator_accounts/${id}`, {
      customName,
      updatedAt: Date.now(),
    });
    res.json({ success: true, customName });
  });

  app.delete('/api/accounts/:id', authenticateToken, async (req: any, res) => {
    const { id } = req.params;
    const existing: any = await firebaseDb.get(`authenticator_accounts/${id}`);
    if (!existing || existing.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    await firebaseDb.delete(`authenticator_accounts/${id}`);
    res.json({ success: true });
  });

  app.post('/api/backup/export', authenticateToken, async (req: any, res) => {
    const accountsData: any = await firebaseDb.get('authenticator_accounts');
    const userAccounts = Object.entries(accountsData || {})
      .filter(([_, acc]: [string, any]) => acc.userId === req.user.userId)
      .map(([_, acc]: [string, any]) => ({
        ...acc,
        secret: acc.encryptedSecret ? decrypt(acc.encryptedSecret, ENCRYPTION_KEY) : '',
      }));

    const backupData = JSON.stringify(userAccounts);
    const encryptedBackup = encrypt(backupData, req.body.password || ENCRYPTION_KEY);
    res.json({ backup: encryptedBackup });
  });

  app.post('/api/backup/import', authenticateToken, async (req: any, res) => {
    try {
      const { backup, password } = req.body;
      const decryptedBackup = decrypt(backup, password || ENCRYPTION_KEY);
      const accounts = JSON.parse(decryptedBackup);

      for (const acc of accounts) {
        await firebaseDb.post('authenticator_accounts', {
          userId: req.user.userId,
          issuer: acc.issuer,
          label: acc.label,
          encryptedSecret: encrypt(acc.secret, ENCRYPTION_KEY),
          digits: acc.digits || 6,
          period: acc.period || 30,
          algorithm: acc.algorithm || 'SHA1',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }
      res.json({ success: true, message: `${accounts.length} accounts imported` });
    } catch (err) {
      res.status(400).json({ error: 'Failed to import backup' });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
