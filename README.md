
# Bob - Financial Literacy Platform Backend

Bob is a financial literacy platform designed to educate users on goal setting and savings using Gemini AI technology. This repository contains the backend server for Bob, built with Node.js, SQLite3, and Express.js.

## Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
  - [Logging In and Obtaining the Token](#logging-in-and-obtaining-the-token)
  - [Registering a User](#registering-a-user)
  - [Example Usage with cURL](#example-usage-with-curl)
    - [PowerShell](#powershell)
    - [Bash](#bash)
- [API Endpoints](#api-endpoints)
  - [Health Check Route](#health-check-route)
  - [User Routes](#user-routes)
  - [Assessment Routes](#assessment-routes)
  - [Goals Routes (Requires Authentication)](#goals-routes-requires-authentication)
  - [Chats Routes (Requires Authentication)](#chats-routes-requires-authentication)
  - [Savings Routes (Requires Authentication)](#savings-routes-requires-authentication)
  - [Modules Routes (Requires Authentication)](#modules-routes-requires-authentication)
- [Authors](#authors)
- [Contributing](#contributing)
- [License](#license)

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
   npm run start-server
   ```

5. Access the server at `https://alxrob.tech`.

## Usage

To use the API, you need to first login to obtain an authorization token. This token will be required for accessing protected routes.

### Logging In and Obtaining the Token

You can login using the following credentials:

- **Email**: `<your email>`
- **Password**: `<your password>`

The login endpoint will respond with a token in the format `auth_<token>`. You need to include this token in the `x-token` header to access protected routes.

### Registering a User

You can register a new user with the following fields:

- **Mandatory**: `email`, `password`
- **Optional but Recommended**: `displayName`, `phoneNumber`

### Example Usage with cURL
---
#### PowerShell

1. **Login and Get Token**
   ```powershell
   $baseUrl = "https://alxrob.tech"
   $email = "your_email@example.com"
   $password = "your_password"

   $body = @{
       email = $email
       password = $password
   } | ConvertTo-Json

   $response = Invoke-RestMethod -Uri "$baseUrl/users/login" -Body $body -ContentType "application/json" -Method Post
   $token = $response.token
   ```

2. **Access Protected Routes**
   ```powershell
   $headers = @{
       "x-token" = $token
   }

   # Example: Get All Savings Records
   $savingsUrl = "$baseUrl/savings"
   $savingsResponse = Invoke-RestMethod -Uri $savingsUrl -Headers $headers -Method Get -ContentType "application/json"
   Write-Host "All savings records: $($savingsResponse | ConvertTo-Json)"
   ```

#### Bash

1. **Login and Get Token**
   ```bash
   baseUrl="https://alxrob.tech"
   email="your_email@example.com"
   password="your_password"

   response=$(curl -s -X POST "$baseUrl/users/login" -H "Content-Type: application/json" -d "{\"email\":\"$email\", \"password\":\"$password\"}")
   token=$(echo $response | jq -r '.token')
   ```

2. **Access Protected Routes**
   ```bash
   headers="-H \"x-token: $token\""

   # Example: Get All Savings Records
   savingsResponse=$(curl -s -X GET "$baseUrl/savings" $headers)
   echo "All savings records: $savingsResponse"
   ```
---
## API Endpoints

### Health Check Route
- **GET `/`**: Home route to verify server status.

### User Routes
- **POST `/users/register`**: Register a new user.
- **POST `/users/login`**: Login a user.
- **POST `/users/logout`**: Logout a user.
- **GET `/users/me`**: Get current logged in user's information.

### Assessment Routes
- **POST `/assessments/questions`**: Set assessment questions (requires authentication).
- **GET `/assessments/questions`**: Get assessment questions.
- **POST `/assessments/answers`**: Answer assessment questions (requires authentication).
- **GET `/assessments/answers`**: Get answers to assessment questions (requires authentication).

### Goals Routes (Requires Authentication)
- **POST `/goals`**: Set a new goal.
- **GET `/goals`**: Get all goals.
- **GET `/goals/:id`**: Get a specific goal.
- **PUT `/goals/:id`**: Update a specific goal.
- **DELETE `/goals/:id`**: Delete a specific goal.

### Chats Routes (Requires Authentication)
- **POST `/chats`**: Start a new chat.
- **POST `/chats/:chatId/messages`**: Send a message in a chat.
- **GET `/chats/:chatId`**: Get a specific chat.
- **GET `/chats`**: Get all chats.
- **DELETE `/chats/:chatId/messages/:messageId`**: Delete a message in a chat.

### Savings Routes (Requires Authentication)
- **POST `/savings`**: Post a new savings record.
- **GET `/savings/:savingsId`**: Get a specific savings record.
- **GET `/savings`**: Get all savings records.

### Modules Routes (Requires Authentication)
- **POST `/modules`**: Create a new module.
- **GET `/modules`**: Get a specific module.
- **PUT `/modules/:moduleId/helpful`**: Update the helpful field of a module.
- **GET `/users/modules`**: Get all modules for the user.

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
