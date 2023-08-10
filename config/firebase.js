// Initialize firebase admin
import { cert, initializeApp } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
import dotenv from "dotenv";

dotenv.config();

// Declare firebase admin credentials
const {
  FIREBASE_TYPE,
  FIREBASE_PROJECT_ID,
  FIREBASE_PRIVATE_KEY_ID,
  FIREBASE_PRIVATE_KEY,
  FIREBASE_CLIENT_EMAIL,
  FIREBASE_CLIENT_ID,
  FIREBASE_CLIENT_X509_CERT_URL,
  FIREBASE_STORAGE_BUCKET,
} = process.env;

initializeApp({
  credential: cert({
    type: FIREBASE_TYPE,
    project_id: FIREBASE_PROJECT_ID,
    private_key_id: FIREBASE_PRIVATE_KEY_ID,
    private_key: FIREBASE_PRIVATE_KEY,
    client_email: FIREBASE_CLIENT_EMAIL,
    client_id: FIREBASE_CLIENT_ID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: FIREBASE_CLIENT_X509_CERT_URL,
  }),
  storageBucket: FIREBASE_STORAGE_BUCKET,
});

const storage = getStorage().bucket();

export default storage;
