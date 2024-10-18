const express = require('express');
const multer = require('multer');
const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');
const cors = require('cors'); // Import cors middleware

const app = express();
const upload = multer({ dest: 'uploads/' });

// Enable CORS for all origins
app.use(cors());

// Paths for input and output files
const INPUT_FILE = path.join(__dirname, 'inputtext.txt');
const OUTPUT_FILE = path.join(__dirname, 'outputtext.txt');

// Route to handle file upload
app.post('/save-file', upload.single('file'), (req, res) => {
    const tempPath = req.file.path;
  
    // Move the uploaded file to inputtext.txt
    fs.rename(tempPath, INPUT_FILE, (err) => {
      if (err) {
        console.error('Error saving input file:', err);
        return res.status(500).send('Error saving file.');
      }
  
      // Run the Python script
      exec('python gemini.py', (error) => {
        if (error) {
          console.error('Error running Python script:', error);
          return res.status(500).send('Error processing file.');
        }
  
        // Only after Python script finishes, send the response
        res.sendStatus(200);  // Send success response
      });
    });
  });
  

// Route to check if output is ready
app.get('/check-output', (req, res) => {
  // Check if outputtext.txt exists and if the Python script has finished writing to it
  if (fs.existsSync(OUTPUT_FILE)) {
    fs.readFile(OUTPUT_FILE, 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading output file:', err);
        return res.status(500).send('Error reading output.');
      }

      // Send the output back to the client
      res.json({ isComplete: true, answer: data });
    });
  } else {
    // If the file does not exist yet, send a response indicating that the script has not finished
    res.json({ isComplete: false });
  }
});

app.listen(5001, () => {
  console.log('Server is running on port 5001');
});
