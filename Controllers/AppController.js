const dbClient = require('../Utils/db');

class AppController {
  static async getStatus(req, res) {
    try {
      const client = new dbClient();
      const dbStatus = await client.isAlive();

      return res.status(200).json({ "APIStatus" : "OK", "DBStatus" : dbStatus });
    } catch (error) {
      console.error('Error checking DB status:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = AppController;
