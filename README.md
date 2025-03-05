# MenuMacro - Food Nutrition Analyzer

MenuMacro is a web application that helps users analyze restaurant menus by taking photos or uploading images. It categorizes food items based on their macronutrient content (protein, carbohydrates, and fats) and identifies the most balanced and healthy options.

## Features

- **Image Upload**: Upload menu photos from your device
- **Camera Capture**: Take photos of menus directly using your device camera
- **Nutritional Analysis**: Categorize menu items by macronutrient content
- **Healthy Recommendations**: Get suggestions for the most balanced food options
- **Responsive Design**: Works on desktop and mobile devices

## Technology Stack

- HTML5
- CSS3
- JavaScript (Vanilla)
- Device Camera API

## Local Development Setup

1. Clone this repository to your local machine:
   ```
   git clone https://github.com/yourusername/menumacro.git
   cd menumacro
   ```

2. Open the project in your favorite code editor

3. Launch the application using a local server:
   - You can use the Live Server extension in VS Code
   - Or run a simple Python server:
     ```
     python -m http.server 8000
     ```
   - Or use any other local development server

4. Open your browser and navigate to `http://localhost:8000`

## Project Structure

```
├── index.html          # Main HTML file
├── styles.css          # CSS styles
├── script.js           # JavaScript functionality
└── README.md           # Project documentation
```

## Future Enhancements

- **Backend Integration**: Connect to a real API for menu analysis
- **User Accounts**: Save favorite menus and analysis results
- **Custom Dietary Filters**: Allow filtering for dietary restrictions (vegetarian, gluten-free, etc.)
- **Restaurant Database**: Build a database of pre-analyzed restaurant menus
- **Nutritional Goals**: Personalize recommendations based on user's dietary goals

## Notes for Further Development

In a production version of this application, you would need to implement:

1. **Backend API**: Create or use an existing API to process menu images and extract text
2. **Machine Learning**: Implement computer vision and NLP algorithms to identify menu items and their ingredients
3. **Nutritional Database**: Connect to a database of food items and their nutritional values
4. **Authentication**: Add user authentication for personalized features

## License

MIT License