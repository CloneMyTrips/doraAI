const express = require('express');
const { spawn } = require('child_process');
const path = require('path');

const app = express();
const PORT = 3000;

function transcribeInstagramReels(reelsUrl) {
    return new Promise((resolve, reject) => {
        // Spawn Python process
        const python = spawn('python3', [
            path.join(__dirname, 'insta.py'),
            reelsUrl
        ]);

        let output = '';
        let errorOutput = '';

        // Capture stdout
        python.stdout.on('data', (data) => {
            output += data.toString();
        });

        // Capture stderr for logging
        python.stderr.on('data', (data) => {
            console.error(data.toString());
            errorOutput += data.toString();
        });

        // Handle process completion
        python.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(`Python process failed with code ${code}. Error: ${errorOutput}`));
            } else {
                resolve(output.trim());
            }
        });
    });
}

// Route to handle transcription
app.get('/transcribe-reels', async (req, res) => {
    try {
        const reelsUrl = req.query.url;
        
        if (!reelsUrl) {
            return res.status(400).json({ error: 'Reel URL is required' });
        }

        const transcription = await transcribeInstagramReels(reelsUrl);
        res.json({ transcription });
    } catch (error) {
        console.error('Transcription error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});