const dbClient = require('../Utils/db');
const GeminiTextAI = require('../Utils/geminiText')

const DBClient = new dbClient();
const AIClient = GeminiTextAI;

class ModulesController {
    static async authenticateUser(req, res, next) {
        const token = req.headers['x-token'];
        if (!token || !token.startsWith('auth_')) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const docID = token.substring(5);

        try {
            const userSnapshot = await DBClient.get('authenticatedUsers', docID);
            if (!userSnapshot || !userSnapshot.loggedIn) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            console.log('Auth in Modules');

            req.user = userSnapshot;
            next();
        } catch (error) {
            console.error('Error authenticating user:', error);
            res.status(500).json({ error: 'authentication-failed' });
        }
    }

    static async createModule (req, res) {
        const userId = req.user.uid;

        try {
            const moduleId = await AIClient.createModule(userId);

            if (!moduleId) {
                return res.status(403).json({ "error": "Forbidden" })
            }

            const moduleObj = await DBClient.get('modules', moduleId);

            if (!moduleObj) {
                return res.status(404).json({ "error": "Not Found" })
            }

            return res.status(201).json({ "message": "Successfully Created Module", "data": moduleObj })
        } catch (error) {
            console.error("Error Creating Module: ", error);
            res.status(500).json({ "error": "Internal server error while creating New Module"})
        }
    }

    static async getModule(req, res) {
        const userId = req.user.uid;

        try {
            const modulesSnapshot = await DBClient.db.collection('Modules')
                .where('userId', '==', userId)
                .where('expired', '==', false)
                .get();

            const modules = modulesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            res.status(200).json({ modules });
        } catch (error) {
            console.error('Error fetching modules:', error);
            res.status(500).json({ error: 'Internal server error while fetching modules.' });
        }
    }

    static async getAllModulesForUser(req, res) {
        const userId = req.user.uid;

        try {
            const modulesObj = await DBClient.getAll('modules', userId)

            res.status(200).json({ modulesObj });
        } catch (error) {
            console.error('Error retrieving all modules for user:', error);
            res.status(500).json({ error: 'Internal server error while retrieving all modules.' });
        }
    }
}

module.exports = ModulesController;
