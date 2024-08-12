const dbClient = require('../Utils/db');
const { v4: uuidv4 } = require('uuid');

const DBClient = new dbClient();

class AssessmentController {
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

            req.user = userSnapshot;
            next();
        } catch (error) {
            console.error('Error authenticating user:', error);
            res.status(500).json({ error: 'authentication-failed' });
        }
    }

    static async setQuestions(req, res) {
        const { questions } = req.body;
        if (!questions || !Array.isArray(questions)) {
            return res.status(400).json({ error: 'Invalid input, expected an array of questions' });
        }

        try {
            for (const question of questions) {
                question.id = uuidv4();
                await DBClient.set('AssessmentQuestions', question.id, question);
            }
            res.status(200).json({ message: 'Questions saved successfully', questions });
        } catch (error) {
            console.error('Error saving questions:', error);
            res.status(500).json({ error: 'failed-to-save-questions' });
        }
    }

    static async getQuestions(req, res) {
        try {
            const questionsSnapshot = await DBClient.getAll('AssessmentQuestions');
            if (questionsSnapshot.empty) {
                return res.status(404).json({ error: 'No questions found' });
            }
            const questions = questionsSnapshot.docs.map(doc => doc.data());
            res.status(200).json(questions);
        } catch (error) {
            console.error('Error retrieving questions:', error);
            res.status(500).json({ error: 'failed-to-retrieve-questions' });
        }
    }

    static async answerQuestions(req, res) {
        const { answers } = req.body;
        const userId = req.user.uid;

        if (!answers || !Array.isArray(answers)) {
            return res.status(400).json({ error: 'Invalid input, expected an array of answers' });
        }

        try {
            const answersData = answers.map(answer => ({
                questionId: answer.questionId,
                answer: answer.answer
            }));

            await DBClient.post('AssessmentAnswers', { userId, answers: answersData });

            res.status(200).json({ message: 'Answers saved successfully', data: { userId, answers: answersData } });
        } catch (error) {
            console.error('Error saving answers:', error);
            res.status(500).json({ error: 'failed-to-save-answers' });
        }
    }

    static async getAnswerQuestions(req, res) {
        const userId = req.user.uid;

        try {
            const answersSnapshot = await DBClient.collection('AssessmentAnswers')
                .where('userId', '==', userId)
                .get();

            if (answersSnapshot.empty) {
                return res.status(404).json({ error: `No answers found for the user uid: ${userId}` });
            }

            const answers = answersSnapshot.docs.map(doc => doc.data());
            res.status(200).json(answers);
        } catch (error) {
            console.error('Error retrieving answers:', error);
            res.status(500).json({ error: 'failed-to-retrieve-answers' });
        }
    }
}

module.exports = AssessmentController;
