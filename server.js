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

// Serve static files from the root directory
app.use(express.static(__dirname));

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
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const MODEL_ID = "gemini-2.0-flash"; // Using Gemini 2.0 Flash model
let genAI;

try {
  if (!GOOGLE_API_KEY || GOOGLE_API_KEY === 'your_gemini_api_key_here') {
    console.warn('Invalid or missing API key. Some features will be unavailable.');
  } else {
    genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
    console.log('Gemini API initialized successfully with model:', MODEL_ID);
  }
} catch (error) {
  console.error('Error initializing Gemini API:', error);
}

// Health check endpoint
app.get('/health', (req, res) => {
  if (genAI) {
    res.json({ status: 'ok', message: 'API is available', model: MODEL_ID });
  } else {
    res.status(503).json({ 
      status: 'unavailable', 
      message: 'API is not properly configured. Please set your GOOGLE_API_KEY in .env file.' 
    });
  }
});

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
  let imagePath = null;
  
  try {
    if (!genAI) {
      return res.status(503).json({ error: 'Gemini API is not properly configured' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    imagePath = req.file.path;
    
    // Get the image as a generative part
    const imagePart = await fileToGenerativePart(imagePath);
    
    // Configure Gemini model
    const model = genAI.getGenerativeModel({ model: MODEL_ID });
    
    // Prepare prompt to analyze menu items and categorize them
    const prompt = `
      Analyze this menu image and extract all food items. For each item, estimate its macronutrient content 
      (protein, carbs, and fat in grams) based on your knowledge of food composition.
      
      Then categorize each item into one of these groups:
      1. High Protein (items where protein is the dominant macronutrient)
      2. High Carbs (items where carbs are the dominant macronutrient)
      3. High Fats (items where fat is the dominant macronutrient)
      4. Balanced (items with a relatively even distribution of macronutrients)
      
      Return the results as a valid JSON object without any markdown formatting or code blocks, with this structure:
      {
        "highProtein": [{"name": "item name", "protein": X, "carbs": Y, "fats": Z}],
        "highCarbs": [{"name": "item name", "protein": X, "carbs": Y, "fats": Z}],
        "highFats": [{"name": "item name", "protein": X, "carbs": Y, "fats": Z}],
        "balanced": [{"name": "item name", "protein": X, "carbs": Y, "fats": Z}],
        "allItems": [{"name": "item name", "protein": X, "carbs": Y, "fats": Z}]
      }
    `;

    // Generate content with Gemini 2.0
    // Note: We removed the responseMimeType that was causing the error
    const result = await model.generateContent({
      contents: [
        { role: "user", parts: [{ text: prompt }, imagePart] }
      ],
      generationConfig: {
        temperature: 0.2,  // Lower temperature for more focused and accurate responses
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 8192,  // Increased token limit for more detailed analysis
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_ONLY_HIGH"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_ONLY_HIGH"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_ONLY_HIGH"
        },
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_ONLY_HIGH"
        }
      ]
    });
    
    const response = await result.response;
    const text = response.text();
    
    // Try to parse the response as JSON
    try {
      // Extract JSON from the response if it's wrapped in markdown code blocks
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || 
                        text.match(/```\n([\s\S]*?)\n```/) || 
                        [null, text];
      const jsonStr = jsonMatch[1] || text;
      
      console.log("Response text:", text.substring(0, 200) + "...");
      console.log("Extracted JSON string:", jsonStr.substring(0, 200) + "...");
      
      const analysisData = JSON.parse(jsonStr);
      
      // Clean up the uploaded file
      fs.unlinkSync(imagePath);
      
      return res.json(analysisData);
    } catch (parseError) {
      console.error('Error parsing JSON response:', parseError);
      
      // Clean up the uploaded file even if JSON parsing fails
      if (imagePath && fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
      
      return res.status(500).json({ 
        error: 'Error parsing analysis results', 
        rawResponse: text 
      });
    }
  } catch (error) {
    console.error('Error analyzing menu:', error);
    
    // Clean up the uploaded file even if analysis fails
    if (imagePath && fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
    
    return res.status(500).json({ error: 'Error analyzing menu: ' + error.message });
  }
});

// Catch-all route to serve the main index.html for any route not matched
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`MenuMacro server running on port ${port}`);
  console.log(`Access the application at http://localhost:${port}`);
  console.log(`Using Gemini model: ${MODEL_ID}`);
});