# OpenAI API Setup Instructions

## Step 1: Create Environment File

Create a new file called `.env` in your project root directory (same level as package.json) with the following content:

```env
# Alpha Vantage API Key (for stock market data)
VITE_ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key_here

# OpenAI API Key (for AI chat functionality)
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

## Step 2: Restart Development Server

After creating the .env file, stop your current development server (Ctrl+C) and restart it:

```bash
npm run dev
```

## Step 3: Test AI Chat

1. Open your browser to the development server URL (likely http://localhost:3003)
2. Navigate to the Dashboard page
3. Look for the AI Investment Advisor chat component
4. Try asking questions like:
   - "How is the market doing today?"
   - "What should I know about diversification?"
   - "Can you analyze Tesla stock for me?"

## How It Works

The AI chat system:
- Uses GPT-3.5-turbo model for responses
- Provides educational investment advice
- Always emphasizes risk disclaimers
- Includes current market context in responses
- Falls back to mock responses if API key is missing

## Security Note

The .env file should be added to your .gitignore file to prevent accidentally committing your API keys to version control.

## Troubleshooting

If the AI chat still shows "Demo Mode" in responses:
1. Verify the .env file is in the correct location (project root)
2. Check that the variable name is exactly `VITE_OPENAI_API_KEY`
3. Restart the development server completely
4. Check browser console for any error messages 