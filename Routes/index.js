const express = require('express');
const AppController = require('../Controllers/AppController');
const UsersController = require('../Controllers/UsersController');
const GoalsController = require('../Controllers/GoalsController');
const AssessmentController = require('../Controllers/AssementsController');

const router = express.Router();

router.get('/', AppController.getStatus);
router.post('/users/register', UsersController.registerUser);
router.post('/users/login', UsersController.loginUser);
router.post('/users/logout', UsersController.logoutUser);
router.get('/users/me', UsersController.getMe);
router.post('/assessments/questions', AssessmentController.setQuestions);
router.get('/assessments/questions', AssessmentController.getQuestions);

// Apply authentication middleware for goal-related routes
router.post('/goals', GoalsController.authenticateUser, GoalsController.setGoal);
router.get('/goals', GoalsController.authenticateUser, GoalsController.getGoals);
router.get('/goals/:id', GoalsController.authenticateUser, GoalsController.getGoal);
router.put('/goals/:id', GoalsController.authenticateUser, GoalsController.updateGoal);
router.delete('/goals/:id', GoalsController.authenticateUser, GoalsController.deleteGoal);

// Apply authentication middleware for assessment-related routes
router.post('/assessments/answers', AssessmentController.authenticateUser, AssessmentController.answerQuestions);
router.get('/assessments/answers', AssessmentController.authenticateUser, AssessmentController.getAnswerQuestions);

module.exports = router;
