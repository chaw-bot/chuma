import { existsSync, readFileSync } from 'node:fs';
import process from 'node:process';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const email = process.argv[2];

if (!email) {
  console.error('Usage: npm run make-admin -- admin@example.com');
  process.exit(1);
}

const serviceAccountPath =
  process.env.GOOGLE_APPLICATION_CREDENTIALS ||
  process.env.FIREBASE_SERVICE_ACCOUNT ||
  './service-account.json';

if (!existsSync(serviceAccountPath)) {
  console.error(`Missing service account file: ${serviceAccountPath}`);
  console.error('Create one in Firebase Console: Project settings > Service accounts > Generate new private key.');
  console.error('Then run: GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json npm run make-admin -- admin@example.com');
  process.exit(1);
}

const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

if (getApps().length === 0) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

const auth = getAuth();
const user = await auth.getUserByEmail(email);
const existingClaims = user.customClaims ?? {};
const nextClaims = {
  ...existingClaims,
  admin: true,
};

await auth.setCustomUserClaims(user.uid, nextClaims);

console.log(`Admin claim added for ${email}`);
console.log(`UID: ${user.uid}`);
console.log('The user must sign out and sign back in to refresh the token.');
