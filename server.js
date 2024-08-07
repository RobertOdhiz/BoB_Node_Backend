const express = require('express');
const routes = require('./Routes');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());

app.use(cors());

app.use('/', routes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
