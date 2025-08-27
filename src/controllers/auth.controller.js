// src/controllers/auth.controller.js
const { auth } = require('../services/firebase');
const { saveOtp, verifyOtp, consumeVerified } = require('../services/otp.service');

const genCode = () => '' + Math.floor(100000 + Math.random() * 900000);

// POST /auth/forgot-password
async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ ok: false, error: 'email_required' });

    try { await auth.getUserByEmail(email); }
    catch { return res.status(404).json({ ok: false, error: 'user_not_found' }); }

    const code = genCode();
    await saveOtp({ email, code, ttlMinutes: 10 });

    // مبدئيًا رجّعي الكود بالرد للتجربة (لازم لاحقًا يتبعت بالإيميل/SMS)
    return res.json({ ok: true, message: 'code_sent', devOnlyCode: code });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: 'server_error' });
  }
}

// POST /auth/verify-code
async function verifyCode(req, res) {
  try {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ ok: false, error: 'email_and_code_required' });

    const result = await verifyOtp({ email, code });
    if (!result.ok) return res.status(400).json({ ok: false, error: result.reason });

    res.json({ ok: true, verifiedToken: result.verifiedToken });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: 'server_error' });
  }
}

// POST /auth/reset-password
async function resetPassword(req, res) {
  try {
    const { email, newPassword, verifiedToken } = req.body;
    if (!email || !newPassword || !verifiedToken)
      return res.status(400).json({ ok: false, error: 'missing_fields' });

    const ok = await consumeVerified({ email, verifiedToken });
    if (!ok) return res.status(400).json({ ok: false, error: 'not_verified' });

    const user = await auth.getUserByEmail(email);
    await auth.updateUser(user.uid, { password: newPassword });

    res.json({ ok: true, message: 'password_updated' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: 'server_error' });
  }
}

module.exports = { forgotPassword, verifyCode, resetPassword };
