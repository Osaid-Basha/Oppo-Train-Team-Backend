// src/services/firebase.js
const admin = require('firebase-admin');
const path = require('path');

// المسار المباشر لملف حساب الخدمة (serviceAccount.json)
const serviceAccount = require(path.join(__dirname, '../../serviceAccount.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const firestore = admin.firestore();
const auth = admin.auth();

module.exports = { firestore, auth, default: admin };
