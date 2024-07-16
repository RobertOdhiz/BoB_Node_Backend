// Import necessary modules
const { initializeApp } = require("firebase/app");
const dotenv = require("dotenv");

// Load environment variables from .env file
dotenv.config();

// Firebase configuration based on environment variables
const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID,
  measurementId: process.env.MEASUREMENT_ID
};

const serviceAccount = {
    type: "service_account",
    project_id: process.env.PROJECT_ID,
    private_key_id: process.env.ADM_PRIVATE_KEY_ID,
    private_key: process.env.ADM_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.ADM_CLIENT_EMAIL,
    client_id: process.env.ADM_CLIENT_ID,
    auth_uri: process.env.ADM_AUTH_URI,
    token_uri: process.env.ADM_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.ADM_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.ADM_CLIENT_X509_CERT_URL,
    universe_domain: process.env.ADM_UNIVERSE_DOMAIN
  };

const app = initializeApp(firebaseConfig);
module.exports = serviceAccount;
