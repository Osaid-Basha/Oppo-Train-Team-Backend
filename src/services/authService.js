const { admin, db } = require('../config/firebase');
const bcrypt = require('bcryptjs');

/**
 * Verifies a Firebase ID token, ensures a user document with role exists,
 * and returns user profile with role.
 * Default role is 'member' if not set.
 */
async function loginWithIdToken(idToken) {
  if (!idToken || !idToken.toString().trim()) {
    const error = new Error('idToken is required');
    error.code = 'MISSING_ID_TOKEN';
    throw error;
  }

  const decoded = await admin.auth().verifyIdToken(idToken);
  const { uid, email, name, picture } = decoded;

  const userDocRef = db.collection('user').doc(uid);
  const userSnap = await userDocRef.get();

  let role = 'member';
  if (userSnap.exists) {
    const data = userSnap.data() || {};
    role = data.role || role;
  } else {
    await userDocRef.set({
      uid,
      email: email || null,
      fullName: name || null,
      avatarUrl: picture || null,
      role,
      status: 'active',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  }

  return {
    user: {
      uid,
      email: email || null,
      role,
      profile: {
        fullName: name || null,
        avatarUrl: picture || null
      }
    }
  };
}

module.exports = {
  loginWithIdToken,
  async loginWithEmailPasswordRole(email, password, role) {
    if (!email || !password || !role) {
      const err = new Error('email, password and role are required');
      err.code = 'MISSING_FIELDS';
      throw err;
    }

    const q = await db.collection('user').where('email', '==', email).limit(1).get();
    if (q.empty) {
      const err = new Error('Invalid credentials');
      err.code = 'INVALID_CREDENTIALS';
      throw err;
    }

    const doc = q.docs[0];
    const user = doc.data() || {};

    if (!user.passwordHash) {
      const err = new Error('Password not set for this user');
      err.code = 'PASSWORD_NOT_SET';
      throw err;
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      const err = new Error('Invalid credentials');
      err.code = 'INVALID_CREDENTIALS';
      throw err;
    }

    const userRole = user.role || 'member';
    if (userRole !== role) {
      const err = new Error('Insufficient role');
      err.code = 'ROLE_MISMATCH';
      throw err;
    }

    return {
      user: {
        uid: user.userID || doc.id,
        email: user.email || null,
        role: userRole,
        profile: {
          fullName: user.fullName || null,
          avatarUrl: user.avatarUrl || null
        }
      }
    };
  }
};


