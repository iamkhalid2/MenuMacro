# MenuMacro - Food Nutrition Analyzer

MenuMacro is a web application that helps users analyze restaurant menus by taking photos or uploading images. It leverages Google's Gemini AI to categorize food items based on their macronutrient content (protein, carbohydrates, and fats) and identifies the most balanced and healthy options.

## Features

- **Image Upload**: Upload menu photos from your device
- **Camera Capture**: Take photos of menus directly using your device camera
- **AI-Powered Analysis**: Uses Google Gemini 2.0 Flash model for menu analysis
- **Nutritional Analysis**: Categorizes menu items by macronutrient content
- **Healthy Recommendations**: Get suggestions for the most balanced food options
- **Responsive Design**: Works on desktop and mobile devices
- **Demo Mode**: Falls back to demo data when API is not available

## Technology Stack

- **Frontend**:
  - HTML5
  - CSS3
  - JavaScript (Vanilla)
  - Device Camera API
  
- **Backend**:
  - Node.js
  - Express.js
  - Google Gemini API (2.0 Flash model)
  - Multer (for file uploads)

## Prerequisites

- Node.js (v14 or higher)
- Google Gemini API key - [Get one here](https://aistudio.google.com/apikey)

## Setup Instructions

1. Clone this repository to your local machine:
   ```
   git clone https://github.com/iamkhalid2/menumacro.git
   cd menumacro
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory and add your Google Gemini API key:
   ```
   GOOGLE_API_KEY=your_gemini_api_key_here
   PORT=3000
   ```

4. Start the application:
   ```
   npm start
   ```
   For development with auto-restart:
   ```
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000`

## Project Structure

```
├── index.html          # Main HTML file
├── styles.css          # CSS styles
├── script.js           # Frontend JavaScript functionality
├── server.js           # Node.js/Express backend server
├── package.json        # Project configuration
├── .env                # Environment variables (API keys)
├── uploads/            # Temporary storage for uploaded images
└── README.md           # Project documentation
```

## How It Works

1. Users upload or capture a menu image through the web interface
2. The image is sent to the backend server
3. The server processes the image using Google's Gemini AI model
4. The AI analyzes the menu items and estimates their macronutrient content
5. Results are categorized into high protein, high carbs, high fats, and balanced options
6. The categorized results are displayed to the user

## Future Enhancements

- **User Accounts**: Save favorite menus and analysis results
- **Custom Dietary Filters**: Allow filtering for dietary restrictions (vegetarian, gluten-free, etc.)
- **Restaurant Database**: Build a database of pre-analyzed restaurant menus
- **Nutritional Goals**: Personalize recommendations based on user's dietary goals
- **Mobile App**: Create native mobile applications

## Troubleshooting

- If you receive an API unavailability notice, check that your `.env` file is properly configured with a valid Gemini API key
- The application will fall back to demo mode if the API is not available, allowing you to test functionality

## License

MIT License