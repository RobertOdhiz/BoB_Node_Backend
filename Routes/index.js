const express = require('express')
const AppController = require('../Controllers/AppController');


const router = express.Router();


router.get('/', AppController.getStatus);


module.exports = router;
