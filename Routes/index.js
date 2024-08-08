const express = require('express');
const AppController = require('../Controllers/AppController');
const AssessmentController = require('../Controllers/AssementsController');
const UsersController = require('../Controllers/UsersController');
const GoalsController = require('../Controllers/GoalsController');
const ChatsController = require('../Controllers/ChatsController');
const SavingsController = require('../Controllers/SavingsController');
const ModulesController = require('../Controllers/ModulesController');

const router = express.Router();

// Health Check Route
router.get('/', AppController.getStatus);

// User Routes
router.post('/users/register', UsersController.registerUser);
router.post('/users/login', UsersController.loginUser);
router.post('/users/logout', UsersController.logoutUser);
router.get('/users/me', UsersController.getMe);

// Assessment Routes
router.post('/assessments/questions', AssessmentController.authenticateUser, AssessmentController.setQuestions);
router.get('/assessments/questions', AssessmentController.getQuestions);
router.post('/assessments/answers', AssessmentController.authenticateUser, AssessmentController.answerQuestions);
router.get('/assessments/answers', AssessmentController.authenticateUser, AssessmentController.getAnswerQuestions);

// Goals Routes (Requires Authentication)
router.post('/goals', GoalsController.authenticateUser, GoalsController.setGoal);
router.get('/goals', GoalsController.authenticateUser, GoalsController.getGoals);
router.get('/goals/:id', GoalsController.authenticateUser, GoalsController.getGoal);
router.put('/goals/:id', GoalsController.authenticateUser, GoalsController.updateGoal);
router.delete('/goals/:id', GoalsController.authenticateUser, GoalsController.deleteGoal);

// Chats Routes (Requires Authentication)
router.post('/chats', ChatsController.authenticateUser, ChatsController.startChat);
router.post('/chats/:chatId/messages', ChatsController.authenticateUser, ChatsController.sendMessage);
router.get('/chats/:chatId', ChatsController.authenticateUser, ChatsController.getChat);
router.get('/chats', ChatsController.authenticateUser, ChatsController.getAllChats);
router.delete('/chats/:chatId/messages/:messageId', ChatsController.authenticateUser, ChatsController.deleteMessage);

// Savings Routes (Requires Authentication)
router.post('/savings', SavingsController.authenticateUser, SavingsController.postSavings);
router.get('/savings/:savingsId', SavingsController.authenticateUser, SavingsController.getSavings);
router.get('/savings', SavingsController.authenticateUser, SavingsController.getAllSavings);
router.post('/savings/remove', SavingsController.authenticateUser, SavingsController.removeAmount); // New route for removing amount

// Modules Routes (Requires Authentication)
router.post('/modules', ModulesController.authenticateUser, ModulesController.createModule);
router.get('/modules', ModulesController.authenticateUser, ModulesController.getModule);
router.put('/modules/:moduleId/helpful', ModulesController.authenticateUser, async (req, res) => {
    const { moduleId } = req.params;
    const { helpful } = req.body;
    try {
        await ModulesController.updateHelpfulField(moduleId, helpful);
        res.status(200).json({ message: 'Helpful field updated successfully.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update helpful field.' });
    }
});
router.get('/users/modules', ModulesController.authenticateUser, ModulesController.getAllModulesForUser);

module.exports = router;
