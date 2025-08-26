/*
  Usage examples:
  - node scripts/seedTestUser.js --email=user@example.com --password=secret123 --role=member --fullName="Test User" --userID=TEST_UID_1
*/

const bcrypt = require('bcryptjs');
const { db } = require('../src/config/firebase');

function parseArgs(argv) {
  const args = {};
  argv.slice(2).forEach((part) => {
    const [key, ...rest] = part.replace(/^--/, '').split('=');
    args[key] = rest.join('=');
  });
  return args;
}

async function main() {
  const args = parseArgs(process.argv);
  const email = args.email;
  const password = args.password;
  const role = args.role || 'member';
  const fullName = args.fullName || null;
  const userID = args.userID || null;

  if (!email || !password || !role) {
    console.error('Missing required args. Use --email, --password, --role');
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const userData = {
    email,
    role,
    fullName,
    passwordHash
  };

  if (userID) {
    userData.userID = userID;
    await db.collection('user').doc(userID).set(userData, { merge: true });
    console.log(`User seeded with fixed id: ${userID}`);
  } else {
    const ref = await db.collection('users').add(userData);
    console.log(`User seeded with generated id: ${ref.id}`);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


