// src/services/otp.service.js
const { firestore } = require('./firebase');

const COLL = 'password_reset_codes';
const MAX_ATTEMPTS = 5;

async function saveOtp({ email, code, ttlMinutes = 10 }) {
  const expiresAt = Date.now() + ttlMinutes * 60 * 1000;
  await firestore.collection(COLL).doc(email).set({
    code,
    expiresAt,
    attempts: 0,
    createdAt: Date.now(),
    verifiedToken: null,
    verifiedAt: null,
  });
}

async function verifyOtp({ email, code }) {
  const ref = firestore.collection(COLL).doc(email);
  const snap = await ref.get();
  if (!snap.exists) return { ok: false, reason: 'not_found' };

  const data = snap.data();
  if ((data.attempts ?? 0) >= MAX_ATTEMPTS) return { ok: false, reason: 'too_many_attempts' };
  if (Date.now() > data.expiresAt) return { ok: false, reason: 'expired' };

  const ok = data.code === code;
  await ref.update({ attempts: (data.attempts ?? 0) + 1 });
  if (!ok) return { ok: false, reason: 'invalid' };

  const verifiedToken = Math.random().toString(36).slice(2);
  await ref.update({ verifiedToken, verifiedAt: Date.now() });

  return { ok: true, verifiedToken };
}

async function consumeVerified({ email, verifiedToken }) {
  const ref = firestore.collection(COLL).doc(email);
  const snap = await ref.get();
  if (!snap.exists) return false;

  const data = snap.data();
  if (data.verifiedToken !== verifiedToken) return false;

  await ref.delete(); // حماية إضافية
  return true;
}

module.exports = { saveOtp, verifyOtp, consumeVerified };
