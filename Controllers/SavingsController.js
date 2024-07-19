const dbClient = require('../Utils/db');

const DBClient = new dbClient();

class SavingsController {
    static async authenticateUser(req, res, next) {
        const token = req.headers['x-token'];
        if (!token || !token.startsWith('auth_')) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        // console.log('Token: ', token);
        const docID = token.substring(5);
        // console.log("Document ID: ", docID);

        try {
            const userSnapshot = await DBClient.get('authenticatedUsers', docID);
            // console.log('User snapshot: ', userSnapshot);
            if (!userSnapshot || !userSnapshot.loggedIn) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            console.log('Auth in Savings');

            req.user = userSnapshot;
            next();
        } catch (error) {
            console.error('Error authenticating user:', error);
            res.status(500).json({ error: 'Authentication failed' });
        }
    }

    static async postSavings(req, res) {
        const { savings } = req.body;
        const userId = req.user.uid;

        if (!savings) {
            return res.status(400).json({ error: 'Savings is required' });
        }

        const savingsDoc = {
            userId,
            savings
        };

        try {
            const savingsDocRefId = await DBClient.post('savings', savingsDoc);

            return res.status(201).json({ message: 'Savings record created successfully', id: savingsDocRefId });
        } catch (err) {
            console.error('Error creating savings record: ', err);
            res.status(500).json({ error: 'Internal server error while creating savings record' });
        }
    }

    static async getSavings(req, res) {
        const { savingsId } = req.params;
        const userId = req.user.uid;

        if (!savingsId) {
            return res.status(400).json({ error: 'Savings ID is required' });
        }

        try {
            const savingsDoc = await DBClient.get('savings', savingsId);

            if (!savingsDoc) {
                return res.status(404).json({ error: 'Savings record not found' });
            }
            if (savingsDoc.userId !== userId) {
                return res.status(403).json({ error: 'Forbidden' });
            }

            res.status(200).json({ message: 'Savings record retrieved successfully', data: savingsDoc });
        } catch (error) {
            console.error('Error retrieving savings record: ', error);
            res.status(500).json({ error: 'Internal server error while fetching savings record' });
        }
    }

    static async getAllSavings(req, res) {
        const userId = req.user.uid;

        try {
            const savingsObj = await DBClient.getAll('savings', userId);

            return res.status(200).json({ message: 'All records retrieved successfully', data: savingsObj });
        } catch (error) {
            console.error('Error retrieving savings records: ', error);
            res.status(500).json({ error: 'Internal server error while fetching all savings records' });
        }
    }
}

module.exports = SavingsController;
