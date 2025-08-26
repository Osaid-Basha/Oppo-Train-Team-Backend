
// src/config/firebase.js
const admin = require('firebase-admin');


const serviceAccount = require("./serviceAccountKey.json");
// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
});

const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };