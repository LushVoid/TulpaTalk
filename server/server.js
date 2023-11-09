// server/server.js
const express = require('express');
const fs = require('fs').promises; // Use the promise-based functions of fs
const path = require('path');
const axios = require('axios');
const cors = require('cors'); // Import cors module
const app = express();

app.use(cors()); // Use cors middleware to enable CORS
app.use(express.json());


app.post('/api/build-model', async (req, res) => {
  const modelFileContent = req.body.modelfile;
  const modelName = req.body.name;
  const filename = path.resolve('modelfile-tmp');
  console.log(`Current working directory: ${process.cwd()}`);
  console.log(`Attempting to write to: ${filename}`);

  try {
    // Use the promise version of writeFile and await it
    await fs.writeFile(filename, modelFileContent);

    // Now the file is created, let's make the subsequent POST request
    const response = await axios.post('http://localhost:11434/api/create', {
      name: modelName,
      path: filename // Send the absolute path
    });

    // Send back the response from the second POST request
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Failed to process:', error);
    res.status(500).json({ error: 'Failed to process' });
  } finally {
    // Cleanup the temp model file
    try {
      await fs.unlink(filename); // Await the unlink operation
    } catch (unlinkErr) {
      console.error('Failed to delete temporary model file:', unlinkErr);
    }
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
