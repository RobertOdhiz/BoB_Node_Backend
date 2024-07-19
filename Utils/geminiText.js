const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const dbClient = require('./db');
const dayjs = require('dayjs');

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GENAI_API_KEY);
const DBClient = new dbClient();

class GeminiTextGenerationAI {
    async generatePrompt(goalObj, assessmentQuestions, answers) {
        try {
            const questions = assessmentQuestions.map(doc => doc.question).join(', ');
            const answersText = answers.map(answer => answer.answer).join(', ');

            return `Given the goal: ${goalObj.title} and description: "${goalObj.description}" to be achieved by ${goalObj.dueDate} and today being ${new Date().toLocaleDateString()}, and the assessment answers: ${answersText} for questions: ${questions}, provide advice. The advice should be short and concise maximum 200 words.
            Do not mentiona ny previous goals set. Focus on this single one unless explicitly asked to include the ones mentioned above. Be clear and elaborate what is importatnt.
            Example output: You have a good income and achieving your goal is fairly easy. You can reduce your expenses on Non-essential things such as (an example) then Increase your savings by 14%-20% to be a ble to buy a car in the expected period.`;
        } catch (error) {
            console.error('Error generating prompt:', error);
            throw new Error('Failed to generate prompt.');
        }
    }

    async fetchAssessmentData(userId) {
        try {
            const assessmentAnswers = await DBClient.getAll('AssessmentAnswers');

            if (assessmentAnswers.count === 0) {
                console.log(`No assessment answers found for user ${userId}.`);
                return [null, null]; // Return null for both answers and questions
            }

            const assessmentAnswersData = assessmentAnswers.AssessmentAnswers;
            const assessmentQuestions = await DBClient.getAll('AssessmentQuestions');
            const assessmentQuestionsData = assessmentQuestions.AssessmentQuestions;

            return [assessmentAnswersData, assessmentQuestionsData];
        } catch (error) {
            console.error('Error fetching assessment data:', error);
            throw new Error('Failed to fetch assessment data.');
        }
    }

    async getGoalAdvice(goalObj, usr) {
        try {
            const [assessmentAnswersData, assessmentQuestionsSnapshot] = await this.fetchAssessmentData(usr.id);

            if (!assessmentAnswersData || !assessmentAnswersData.answers || !Array.isArray(assessmentAnswersData.answers)) {
                return `No assessment data found for the user with id: ${usr.id}.`;
            }

            const prompt = await this.generatePrompt(goalObj, assessmentQuestionsSnapshot, assessmentAnswersData.answers);
            const result = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" }).generateContent(prompt);
            const response = result.response;
            const text = response.text();
            console.log("Generated Advice: ", text);

            return text;
        } catch (error) {
            console.error('Error generating advice:', error);
            throw new Error('Failed to generate advice.');
        }
    }

    async generateModuleContent(answers, questions) {
        try {
            // Construct a prompt for generating advice based on answers and questions
            const prompt = `
                Based on the following answers and questions, generate a unique and helpful financial advice statement. 
                The statement should be about 3 sentences long and provide actionable insights.
                
                Answers: ${JSON.stringify(answers)}
                Questions: ${JSON.stringify(questions)}
            `;

            const result = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" }).generateContent(prompt);

            if (!result) {
                throw new Error('Failed to generate result from AI.');
            }

            console.log("Gemini generated module: ", result.response.text());

            return result.response.text();
        } catch (error) {
            console.error('Error generating module content:', error);
            throw new Error('Failed to generate module content.');
        }
    }

    async createModule(userId) {
        try {
            const [assessmentAnswersData, assessmentQuestionsData] = await this.fetchAssessmentData(userId);

            console.log("Data: ", [assessmentAnswersData, assessmentQuestionsData])

            if (!assessmentAnswersData || !assessmentQuestionsData) {
                throw new Error('Insufficient data to generate module.');
            }

            const advice = await this.generateModuleContent(assessmentAnswersData, assessmentQuestionsData);

            console.log("Gemini advice in Module: ", advice)

            const moduleDoc = {
                userId,
                advice,
                expired: false,
                helpful: false,
                createdAt: dayjs().toDate(),
                expiresAt: dayjs().add(1, 'day').endOf('day').toDate(),
            };

            const docRefId = await DBClient.post('modules', moduleDoc);
            return docRefId;
        } catch (error) {
            console.error('Error creating module:', error);
            throw new Error('Failed to create module.');
        }
    }

    
    static async updateHelpfulField(moduleId, helpful) {
        try {
            const moduleRef = DBClient.db.collection('Modules').doc(moduleId);
            await moduleRef.update({ helpful });

            if (helpful) {
                // Send  module to all users (assuming you have a method for )
                // await .sendModuleToAllUsers(moduleId);
            } else {
                // Schedule deletion of the module after a week if not helpful
                setTimeout(async () => {
                    try {
                        const moduleDoc = await moduleRef.get();
                        if (moduleDoc.exists && !moduleDoc.data().helpful) {
                            await moduleRef.delete();
                        }
                    } catch (error) {
                        console.error('Error deleting module:', error);
                    }
                }, 7 * 24 * 60 * 60 * 1000);
            }
        } catch (error) {
            console.error('Error updating helpful field:', error);
            throw new Error('Failed to update helpful field.');
        }
    }
}

const GeminiTextAI = new GeminiTextGenerationAI();
module.exports = GeminiTextAI;
