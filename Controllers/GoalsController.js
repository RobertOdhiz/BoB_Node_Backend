const dbClient = require('../Utils/db');
const GeminiTextAI = require('../Utils/geminiText');

const DBClient = new dbClient();

class GoalsController {
    static async authenticateUser(req, res, next) {
        const token = req.headers['x-token'];
        if (!token || !token.startsWith('auth_')) {
            return res.status(401).json({ "error": 'Unauthorized' });
        }
        // console.log('Token: ', token);
        const docID = token.substring(5);
        // console.log("Document ID: ", docID);

        try {
            const userSnapshot = await DBClient.get('authenticatedUsers', docID);
            // console.log('User snapshot: ', userSnapshot);
            if (!userSnapshot || !userSnapshot.loggedIn) {
                return res.status(401).json({ "error": 'Unauthorized' });
            }

            console.log('Auth in Goals');

            req.user = userSnapshot;
            next();
        } catch (error) {
            console.error('Error authenticating user:', error);
            res.status(500).json({ "error": 'authentication-failed' });
        }
    }

    static async updateGoal(req, res) {
        const goalId = req.params.id;
        const userId = req.user.uid;
        const { achieved } = req.body;

        try {
            const goalDoc = await DBClient.get('goals', goalId);
            if (!goalDoc || goalDoc.userId !== userId) {
                return res.status(404).json({ "error": 'Goal Not Found' });
            }

            await DBClient.set('goals', goalId, { ...goalDoc, achieved });
            res.json({ message: 'Goal updated successfully' });
        } catch (error) {
            console.error('Error updating goal:', error);
            res.status(500).json({ "error": 'Updating goal status failed' });
        }
    }

    static async setGoal(req, res) {
        const { title, description, dueDate } = req.body;
        const userId = req.user.uid;
        const setDate = new Date(); // Current date and time

        try {
            if (!title) {
                return res.status(400).json({ "error": 'Goal Title is required' });
            }
            if (!description) {
                return res.status(400).json({ "error": 'Goal Description is required' });
            }
            if (!dueDate) {
                return res.status(400).json({ "error": 'Due Date is required' });
            }

            // Directly assign properties to goal object
            const goal = { title, description, dueDate, setDate };
            const advice = await GeminiTextAI.getGoalAdvice(goal, req.user);
            // console.log("AI Advice in Set Goal: ", advice);
            await DBClient.post('goals', { userId, ...goal, achieved: false, advice });
            res.status(201).json({ message: 'Goal set successfully' });
        } catch (error) {
            console.error('Error setting goal:', error);
            res.status(500).json({ "error": 'Goal setting failed' });
        }
    }

    static async getGoals(req, res) {
        const userId = req.user.uid;

        try {
            const goalsSnapshot = await DBClient.db.collection('goals').where('userId', '==', userId).get();
            const goals = goalsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            res.json({ goals });
        } catch (error) {
            console.error('Error getting goals:', error);
            res.status(500).json({ "error": 'get-goals-failed' });
        }
    }

    static async getGoal(req, res) {
        const goalId = req.params.id;
        const userId = req.user.uid;

        try {
            const goalDoc = await DBClient.get('goals', goalId);
            if (!goalDoc || goalDoc.userId !== userId) {
                return res.status(404).json({ "error": 'goal-not-found' });
            }

            res.json({ goal: goalDoc });
        } catch (error) {
            console.error('Error getting goal:', error);
            res.status(500).json({ "error": 'get-goal-failed' });
        }
    }

    static async updateGoal(req, res) {
        const goalId = req.params.id;
        const userId = req.user.uid;
        const { achieved } = req.body;

        try {
            const goalDoc = await DBClient.get('goals', goalId);
            if (!goalDoc || goalDoc.userId !== userId) {
                return res.status(404).json({ "error": 'Goal Not Found' });
            }

            await DBClient.set('goals', goalId, { ...goalDoc, achieved });
            res.json({ message: 'Goal updated successfully' });
        } catch (error) {
            console.error('Error updating goal:', error);
            res.status(500).json({ "error": 'Updating goal status failed' });
        }
    }

    static async deleteGoal(req, res) {
        const goalId = req.params.id;
        const userId = req.user.uid;

        try {
            const goalDoc = await DBClient.get('goals', goalId);
            if (!goalDoc || goalDoc.userId !== userId) {
                return res.status(404).json({ "error": 'goal-not-found' });
            }

            await DBClient.delete('goals', goalId);
            res.json({ message: 'Goal deleted successfully' });
        } catch (error) {
            console.error('Error deleting goal:', error);
            res.status(500).json({ "error": 'delete-goal-failed' });
        }
    }
}

module.exports = GoalsController;
