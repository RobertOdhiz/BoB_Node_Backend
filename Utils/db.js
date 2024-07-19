const admin = require('firebase-admin');
const serviceAccount = require('../Providers/firebase'); // Path to your Firebase credentials JSON

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

class dbClient {
  constructor() {
    this.db = admin.firestore();
    this.connected = false; // Initialize connection status
  }

  // Method to check if the connection is alive
  async isAlive() {
    try {
      await this.db.listCollections(); // Attempt to list collections to check connection
      console.log('DB connection successful');
      return true;
    } catch (error) {
      console.error('Error connecting to DB:', error);
      return false;
    }
  }

  // Function to get data
  async get(collection, documentId) {
    try {
      const docRef = this.db.collection(collection).doc(documentId);
      const doc = await docRef.get();
      if (!doc.exists) {
        console.log('No such document!');
        return null;
      } else {
        return { id: doc.id, ...doc.data() };
      }
    } catch (error) {
      console.error('Error getting document:', error);
      throw error;
    }
  }

  // Function to set data
  async set(collection, documentId, data) {
    try {
      const docRef = this.db.collection(collection).doc(documentId);
      await docRef.set(data);
      console.log('Document successfully written!');
    } catch (error) {
      console.error('Error writing document:', error);
      throw error;
    }
  }

  // Function to delete data
  async delete(collection, documentId) {
    try {
      const docRef = this.db.collection(collection).doc(documentId);
      await docRef.delete();
      console.log('Document successfully deleted!');
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }

  // Function to post (create) data
  async post(collection, data) {
    try {
      const docRef = await this.db.collection(collection).add(data);
      console.log('Document successfully added with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error adding document:', error);
      throw error;
    }
  }

  async getAll(collection, userId = null) {
    try {
        let query = this.db.collection(collection);

        if (userId) {
            query = query.where('userId', '==', userId);
        }

        const snapshot = await query.get();
        const count = snapshot.size;
        const data = {};

        snapshot.forEach(doc => {
            data[doc.id] = doc.data();
        });

        return { count, [collection]: data };
    } catch (error) {
        console.error(`Error getting all documents in ${collection}:`, error);
        throw error;
    }
  }
}

module.exports = dbClient;
