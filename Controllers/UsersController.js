const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile } = require('firebase/auth');
const dbClient = require('../Utils/db');
const { v4: uuidv4 } = require('uuid');

const DBClient = new dbClient();

class UsersController {
    static async registerUser(req, res) {
        const { email, password, displayName } = req.body;

        try {
            const auth = getAuth();
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);

            if (displayName) {
                await updateProfile(userCredential.user, { displayName });
            }

            const user = userCredential.user;
    
            // Check if there's an existing session for the user
            const sessionSnapshot = await DBClient.db.collection('authenticatedUsers')
                .where('uid', '==', user.uid)
                .where('loggedIn', '==', true)
                .get();
    
            if (sessionSnapshot.empty) {
                const sessionId = uuidv4();
                const sessionData = { uid: user.uid, email: user.email, loggedIn: true, sessionId };
    
                const docRefId = await DBClient.post('authenticatedUsers', sessionData);
                res.json({ message: 'Registration successfull', user, token: `auth_${docRefId}` });
            } else {
                // Extract the ID of the first document from the snapshot
                const existingSessionId = sessionSnapshot.docs[0].id;
                console.log("Existing Session ID: ", existingSessionId);
                res.json({ message: 'Login Successfull', user, token: `auth_${existingSessionId}` });
            }
        } catch (error) {
            let errorCode = 'An error occurred';

            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorCode = 'Email already exists';
                    break;
                case 'auth/invalid-email':
                    errorCode = 'Invalid email address';
                    break;
                case 'auth/weak-password':
                    errorCode = 'Weak password, should be 6 characters and above';
                    break;
                default:
                    console.error('Error registering user:', error);
            }

            res.status(500).json({ "error": errorCode });
        }
    }

    static async loginUser(req, res) {
        const { email, password } = req.body;
    
        try {
            const auth = getAuth();
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
    
            // Check if there's an existing session for the user
            const sessionSnapshot = await DBClient.db.collection('authenticatedUsers')
                .where('uid', '==', user.uid)
                .where('loggedIn', '==', true)
                .get();
    
            if (sessionSnapshot.empty) {
                const sessionId = uuidv4();
                const sessionData = { uid: user.uid, email: user.email, loggedIn: true, sessionId };
    
                const docRefId = await DBClient.post('authenticatedUsers', sessionData);
                res.json({ message: 'You have been logged in successfully', user, token: `auth_${docRefId}` });
            } else {
                // Extract the ID of the first document from the snapshot
                const existingSessionId = sessionSnapshot.docs[0].id;
                console.log("Existing Session ID: ", existingSessionId);
                res.json({ message: 'You are already logged in', user, token: `auth_${existingSessionId}` });
            }
        } catch (error) {
            let errorCode = 'unknown-error';
    
            switch (error.code) {
                case 'auth/user-not-found':
                    errorCode = 'No account Found';
                    break;
                case 'auth/wrong-password':
                    errorCode = 'Incorrect password';
                    break;
                case 'auth/invalid-email':
                    errorCode = 'Invalid email';
                    break;
                default:
                    console.error('Error logging in user:', error);
            }
    
            res.status(401).json({ "error": errorCode });
        }
    }
    
    static async logoutUser(req, res) {
        const token = req.headers['x-token'];
        if (!token || !token.startsWith('auth_')) {
            return res.status(401).json({ "error": 'Unauthorized' });
        }

        const docID = token.substring(5);

        try {
            const userSnapshot = await DBClient.get('authenticatedUsers', docID);
            if (!userSnapshot.empty) {
                const userDoc = userSnapshot;
                await DBClient.set('authenticatedUsers', userDoc.id, { ...userDoc, loggedIn: false });
            }

            const auth = getAuth();
            await signOut(auth);

            res.json({ message: 'User logged out successfully' });
        } catch (error) {
            console.error('Error logging out user:', error);
            res.status(500).json({ "error": 'Logout failed' });
        }
    }

    static async getMe(req, res) {
        const token = req.headers['x-token'];
        if (!token || !token.startsWith('auth_')) {
            return res.status(401).json({ "error": 'Unauthorized' });
        }

        const docID = token.substring(5);

        try {
            const userSnapshot = await DBClient.get('authenticatedUsers', docID);
            if (!userSnapshot.empty) {
                const userDoc = userSnapshot;
                await DBClient.set('authenticatedUsers', userDoc.id, { ...userDoc, loggedIn: false });
            }

            const user = userSnapshot;
            res.json({ user });
        } catch (error) {
            console.error('Error fetching current user:', error);
            res.status(500).json({ "error": 'Unable to get user' });
        }
    }
}

module.exports = UsersController;
