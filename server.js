// Import required modules
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;

// Configure middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configure file storage for uploaded images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, 'uploads');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Helper function to read image file as base64
async function fileToGenerativePart(filePath) {
  const mimeType = 'image/jpeg'; // Adjust based on your file type
  const fileBuffer = fs.readFileSync(filePath);
  return {
    inlineData: {
      data: fileBuffer.toString('base64'),
      mimeType: mimeType
    }
  };
}

// API endpoint for analyzing menu image
app.post('/analyze-menu', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    const imagePath = req.file.path;
    
    // Get the image as a generative part
    const imagePart = await fileToGenerativePart(imagePath);
    
    // Configure Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    // Prepare prompt to analyze menu items and categorize them
    const prompt = `
      Analyze this menu image and extract all food items. For each item, estimate its macronutrient content 
      (protein, carbs, and fat in grams) based on your knowledge of food composition.
      
      Then categorize each item into one of these groups:
      1. High Protein (items where protein is the dominant macronutrient)
      2. High Carbs (items where carbs are the dominant macronutrient)
      3. High Fats (items where fat is the dominant macronutrient)
      4. Balanced (items with a relatively even distribution of macronutrients)
      
      Return the results as a JSON object with this structure:
      {
        "highProtein": [{"name": "item name", "protein": X, "carbs": Y, "fats": Z}],
        "highCarbs": [{"name": "item name", "protein": X, "carbs": Y, "fats": Z}],
        "highFats": [{"name": "item name", "protein": X, "carbs": Y, "fats": Z}],
        "balanced": [{"name": "item name", "protein": X, "carbs": Y, "fats": Z}],
        "allItems": [{"name": "item name", "protein": X, "carbs": Y, "fats": Z}]
      }
    `;

    // Generate content with Gemini
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();
    
    // Try to parse the response as JSON
    try {
      // Extract JSON from the response if it's wrapped in markdown code blocks
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || 
                        text.match(/```\n([\s\S]*?)\n```/) || 
                        [null, text];
      const jsonStr = jsonMatch[1];
      const analysisData = JSON.parse(jsonStr);
      
      // Clean up the uploaded file
      fs.unlinkSync(imagePath);
      
      return res.json(analysisData);
    } catch (parseError) {
      console.error('Error parsing JSON response:', parseError);
      return res.status(500).json({ 
        error: 'Error parsing analysis results', 
        rawResponse: text 
      });
    }
  } catch (error) {
    console.error('Error analyzing menu:', error);
    return res.status(500).json({ error: 'Error analyzing menu' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`MenuMacro server running on port ${port}`);
});