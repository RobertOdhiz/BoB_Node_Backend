Here's an updated version of your README to reflect the use of Firebase Firestore and configuration via a `.env` file:

---

# Bob - Financial Literacy Platform Backend

Bob is a financial literacy platform designed to educate users on goal setting and savings using Gemini AI technology. This repository contains the backend server for Bob, built with Node.js, SQLite3, and Express.js.

## Features

- **Express Server**: Backend server using Express.js for handling HTTP requests.
- **Firebase Firestore**: Integration with Firebase Firestore for scalable and real-time data storage.
- **Gemini AI Integration**: Integration with Gemini AI for financial literacy insights.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/RobertOdhiz/BoB_Node_Backend
   cd BoB_Node_Backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env` file in the root directory with the following configurations:
   ```dotenv
   # Firebase Configuration
   PROJECT_ID=your_project_id
   ADM_PRIVATE_KEY_ID=your_private_key_id
   ADM_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n
   ADM_CLIENT_EMAIL=your_client_email
   ADM_CLIENT_ID=your_client_id
   ADM_AUTH_URI=https://accounts.google.com/o/oauth2/auth
   ADM_TOKEN_URI=https://oauth2.googleapis.com/token
   ADM_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
   ADM_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/your_client_email
   ADM_UNIVERSE_DOMAIN=googleapis.com
   ```

   Replace placeholders (`your_project_id`, `your_private_key_id`, `your_private_key`, `your_client_email`, `your_client_id`) with your actual Firebase service account details.

4. Start the server:
   ```bash
   npm start
   ```

5. Access the server at `http://localhost:5000`.

## Usage

- **Endpoints**: Explore the API endpoints provided by the backend.
- **Integration**: Integrate Gemini AI for financial literacy features.
- **Contributors**: View and acknowledge contributors in the `AUTHORS` file.

## API Endpoints

- **GET `/`:** Home route to verify server status.

## Authors

This project follows the Git commit history to update the `AUTHORS` file with contributors' details automatically.

To update the `AUTHORS` file manually, run:
```bash
npm run update-authors
```

## Contributing

1. Fork the repository and clone it locally.
2. Create a new branch for your feature or bug fix.
3. Commit your changes and push to your fork.
4. Submit a pull request with a description of your changes.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.