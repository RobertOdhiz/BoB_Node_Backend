const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const dbClient = require('../Utils/db');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GENAI_API_KEY);
const DBClient = new dbClient();

const algorithm = 'aes-256-cbc';
const secretKey = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);

function encryptMessage(message) {
    const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
    let encrypted = cipher.update(message, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
}

function decryptMessage(encryptedMessage) {
    const [ivHex, encrypted] = encryptedMessage.split(':');
    const ivBuffer = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(algorithm, secretKey, ivBuffer);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

class ChatsController {
    static async authenticateUser(req, res, next) {
        const token = req.headers['x-token'];
        if (!token || !token.startsWith('auth_')) {
            return res.status(401).json({ "error": 'Unauthorized' });
        }
        const docID = token.substring(5);

        try {
            const userSnapshot = await DBClient.get('authenticatedUsers', docID);
            if (!userSnapshot || !userSnapshot.loggedIn) {
                return res.status(401).json({ "error": 'Unauthorized' });
            }

            console.log('Auth in Chats');

            req.user = userSnapshot;
            next();
        } catch (error) {
            console.error('Error authenticating user:', error);
            res.status(500).json({ "error": 'authentication-failed' });
        }
    }

    static async startChat(req, res) {
        const { message } = req.body;
        const userId = req.user.uid;
        const timestamp = new Date().toISOString();
        const encryptedMessage = encryptMessage(message);

        const sessionId = uuidv4();

        const chatDoc = {
            userId,
            sessionId,
            messages: [{ message: encryptedMessage, timestamp }]
        };

        try {
            const ChatDocRefId = await DBClient.post('chats', chatDoc);

            res.status(201).json({ message: 'Chat started successfully', chatId: ChatDocRefId });
        } catch (error) {
            console.error('Error starting chat:', error);
            res.status(500).json({ "error": 'Failed to start chat' });
        }
    }

    static async sendMessage(req, res) {
        const { chatId, message } = req.body;
        const userId = req.user.uid;
        const timestamp = new Date().toISOString();
        const encryptedMessage = encryptMessage(message);
    
        if (!chatId || !message) {
            return res.status(400).json({ "error": 'chatId and message are required' });
        }
    
        try {
            // Check if the chat document exists
            const chatDocSnapshot = await DBClient.db.collection('chats').doc(chatId).get();
            if (!chatDocSnapshot.exists) {
                // If chat does not exist, create a new one
                const sessionId = uuidv4();
                const newChatDoc = {
                    userId,
                    sessionId,
                    messages: [{ message: encryptedMessage, timestamp }]
                };
                await DBClient.set('chats', chatId, newChatDoc);
            }

            const chatDoc = chatDocSnapshot.data();
            if (!chatDoc) {
                return res.status(404).json({ "error": 'Chat not found' });
            }

            // Check if the authenticated user is the owner of the chat
            if (chatDoc.userId !== userId) {
                return res.status(403).json({ "error": 'Forbidden' });
            }

            // Get the entire chat history
            const history = chatDoc.messages.map((msg) => ({
                role: "user",
                parts: [{ text: decryptMessage(msg.message) }]
            }));

            history.push({ role: "user", parts: [{ text: message }] });

            const geminiResponse = await ChatsController.getGeminiResponse({ id: chatId, userId, history });

            // Encrypt the AI's response
            const encryptedResponse = encryptMessage(geminiResponse);

            // Update chat document with new messages
            chatDoc.messages.push({ message: encryptedMessage, timestamp });
            chatDoc.messages.push({ message: encryptedResponse, timestamp: new Date().toISOString() });

            await DBClient.set('chats', chatId, chatDoc);

            return res.status(200).json({ message: 'Message sent successfully', aiResponse: geminiResponse });
        } catch (error) {
            console.error('Error sending message:', error);
            return res.status(500).json({ "error": 'Failed to send message' });
        }
    }

    static async getGeminiResponse(chatObj) {
        const { id, userId, history } = chatObj;
    
        try {
            let chatDoc = await DBClient.get('chats', id);
            if (!chatDoc) {
                return null;
            }
            if (chatDoc.userId !== userId) {
                return null;
            }

            console.log("Chat Document: ", chatDoc)
    
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const chat = model.startChat({ sessionId: chatDoc.sessionId });

            console.log("Chat :", chat);
    
            // Ensure `history` is formatted correctly
            const formattedHistory = history.map(entry => ({
                role: entry.role,
                content: entry.parts.map(part => part.text).join(' ')
            }));
    
            // Send the message
            const result = await chat.sendMessage({ history: formattedHistory });
    
            console.log('Gemini Response: ', result.response.text());
    
            // Encrypt the AI's response
            const encryptedResponse = encryptMessage(result.response.text());
            chatDoc.messages.push({ message: encryptedResponse, timestamp: new Date().toISOString() });
    
            await DBClient.set('chats', id, chatDoc);
    
            return result.response.text();
        } catch (error) {
            console.error('Error getting Gemini response:', error);
            throw new Error('Failed to get Gemini response');
        }
    }    

    static async deleteMessage(req, res) {
        const { chatId, messageId } = req.params;
        const userId = req.user.uid;

        try {
            const chatDoc = await DBClient.get('chats', chatId);
            if (!chatDoc) {
                return res.status(404).json({ "error": 'Chat not found' });
            }
            if (chatDoc.userId !== userId) {
                return res.status(403).json({ "error": 'Forbidden' });
            }

            chatDoc.messages = chatDoc.messages.filter((msg, index) => index !== parseInt(messageId));
            await DBClient.set('chats', chatId, chatDoc);
            res.status(200).json({ message: 'Message deleted successfully' });
        } catch (error) {
            console.error('Error deleting message:', error);
            res.status(500).json({ "error": 'Failed to delete message' });
        }
    }

    static async getChat(req, res) {
        const { chatId } = req.params;
        const userId = req.user.uid;
    
        try {
            const chatDoc = await DBClient.get('chats', chatId);
            if (!chatDoc) {
                return res.status(404).json({ "error": 'Chat not found' });
            }
            if (chatDoc.userId !== userId) {
                return res.status(403).json({ "error": 'Forbidden' });
            }
    
            res.status(200).json(chatDoc);
        } catch (error) {
            console.error('Error retrieving chat:', error);
            res.status(500).json({ "error": 'Failed to retrieve chat' });
        }
    }
    
    static async getAllChats(req, res) {
        const userId = req.user.uid;
    
        try {
            const chatsSnapshot = await DBClient.db.collection('chats').where('userId', '==', userId).get();
            if (chatsSnapshot.empty) {
                return res.status(404).json({ "error": 'No chats found' });
            }
    
            const chats = chatsSnapshot.docs.map(doc => doc.data());
            res.status(200).json(chats);
        } catch (error) {
            console.error('Error retrieving all chats:', error);
            res.status(500).json({ "error": 'Failed to retrieve all chats' });
        }
    }
}

module.exports = ChatsController;
