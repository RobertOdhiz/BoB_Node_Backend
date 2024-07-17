const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const dbClient = require('./db');

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GENAI_API_KEYText);
const DBClient = new dbClient();

class GeminiTextGenerationAI {
    constructor() {
        this.model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    }

    generatePrompt(goalObj, assessmentQuestions, assessmentAnswers) {
        const questions = assessmentQuestions.docs.map(doc => doc.data().question).join(', ');
        const answers = assessmentAnswers.docs.map(doc => doc.data().answer).join(', ');

        return `Given the goal: ${goalObj.title} and description: "${goalObj.description}" to be achieved by ${goalObj.dueDate} and today being ${new Date().toLocaleDateString()}, and the assessment answers: ${answers} for questions: ${questions}, provide advice. 
        The advice should be short and concise with details that are relevant.
        Output Example: "You can try and reduce your expenses on groceries then increase your savings to between 15%-20% of your salary. With these measures, your goal of buying a car with your current income will align to ensure you can still manage your basic expenses."`;
    }

    async getGoalAdvice(goalObj, usr) {
        if (!goalObj || !usr) {
            throw new Error('Invalid goal object or user.');
        }

        try {
            const [assessmentAnswers, assessmentQuestions] = await Promise.all([
                DBClient.db.collection('AssessmentAnswers').where('userId', '==', usr.id).get(),
                DBClient.db.collection('AssessmentQuestions').where('userId', '==', usr.id).get()
            ]);

            if (assessmentAnswers.empty) {
                console.log(`No assessment answers found for user ${usr.id}.`);
                return `No assessment data found for the user with id: ${usr.id}.`;
            }

            if (assessmentQuestions.empty) {
                console.log('No assessment questions found in the database.');
                return 'No assessment questions provided.';
            }

            const prompt = this.generatePrompt(goalObj, assessmentQuestions, assessmentAnswers);
            const response = await this.model.generate({ prompt });

            return response.data;
        } catch (error) {
            console.error('Error fetching assessment data or generating response:', error);
            throw new Error('Failed to fetch assessment data or generate AI response.');
        }
    }
}

const GeminiTextAI = new GeminiTextGenerationAI();
module.exports = GeminiTextAI;
