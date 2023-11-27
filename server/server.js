const express = require('express');
const fs = require('fs');
const fsPromises = fs.promises;
const readline = require('readline');
const path = require('path');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Function to append logs to a file
async function logToFile(message) {
    const logFilePath = path.join(__dirname, 'server.log'); // Log file in the current directory
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} - ${message}\n`;

    try {
        await fsPromises.appendFile(logFilePath, logEntry);
    } catch (err) {
        console.error('Error writing to log file:', err);
    }
}

app.get('/', (req, res) => {
    res.send('Welcome to the server!');
    logToFile('Received GET request at /');
});

app.post('/api/build-model', async (req, res) => {
    const modelFileContent = req.body.modelfile;
    const modelName = req.body.name;
    const filename = path.resolve('modelfile-tmp');
    logToFile(`Received POST request at /api/build-model with model name: ${modelName}`);

    try {
        await fsPromises.writeFile(filename, modelFileContent);
        logToFile(`Model file written to ${filename}`);

        const response = await axios.post('http://localhost:11434/api/create', {
            name: modelName,
            path: filename
        });

        res.status(200).json(response.data);
        logToFile('Successfully processed /api/build-model request');
    } catch (error) {
        console.error('Failed to process:', error);
        logToFile(`Error in /api/build-model: ${error.message}`);
        res.status(500).json({ error: 'Failed to process' });
    } finally {
        try {
            await fsPromises.unlink(filename);
            logToFile(`Temporary model file ${filename} deleted`);
        } catch (unlinkErr) {
            console.error('Failed to delete temporary model file:', unlinkErr);
            logToFile(`Error deleting temporary file ${filename}: ${unlinkErr.message}`);
        }
    }
});

app.get('/api/fetch-data', async (req, res) => {
    const filePath = path.join(__dirname, 'smooth_band_powers.csv');
    let errorMessages = [];

    try {
        const lines = await readLastLines(filePath, 100);
        res.status(200).json({ data: lines });
        logToFile('Successfully fetched data in /api/fetch-data');
    } catch (error) {
        errorMessages.push(`Failed to read CSV file: ${error.message}`);
        logToFile(`Error in /api/fetch-data: ${error.message}`);
    }

    if (errorMessages.length > 0) {
        res.status(500).json({ errors: errorMessages });
    }
});

// Helper function to read the last N lines of a file
async function readLastLines(filePath, numLines) {
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    const allLines = [];
    for await (const line of rl) {
        allLines.push(line);
        if (allLines.length > numLines) {
            allLines.shift(); // Keep only the last 'numLines' lines
        }
    }

    return allLines;
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
    logToFile(`Server started on port ${PORT}`);
});
