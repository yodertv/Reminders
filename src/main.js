// main.js made to load the todoServer module so that one can do:
// node main.js when you want to run outside of the Vercel hosting scheme.

const _env = require('dotenv').config({ debug: true });
const app = require('./api/todoServer.js');

// Start a server to run my api directly with node.
// This file is ignored when using Vercel tooling.
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
