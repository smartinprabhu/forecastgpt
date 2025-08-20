# ForecastGPT - Gemini API Setup

## Quick Setup Instructions

### 1. Get Your Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Click "Get API Key"
4. Copy your API key

### 2. Configure the API Key

**Option A: Using DevServerControl (Recommended)**

```bash
# Set the environment variable (replace with your actual key)
GEMINI_API_KEY=your_actual_api_key_here
```

**Option B: Manual Setup**

1. Create or edit `.env` file in the project root
2. Add: `GEMINI_API_KEY=AIzaSyAM1q_xYUqOaw5UqGv4a09CPr81cnJmkwI`
3. Restart the development server

### 3. Restart the Server

```bash
npm run dev
```

## What You Get With API Configured

### Without API (Current - Fallback Mode)

- ✅ Basic forecasting responses
- ✅ Trend analysis
- ✅ Model explanations
- ✅ Data summaries
- ✅ Forecast chart generation

### With API (Full AI Mode)

- 🚀 Advanced AI conversations
- 🧠 Contextual understanding
- 💡 Detailed explanations
- 🔍 Natural language processing
- 📊 Intelligent data insights

## Testing

Ask the chatbot: "How to setup API key" for built-in instructions.

## Troubleshooting

- **500 Error**: API key not configured or invalid
- **Rate Limits**: Gemini has usage limits - check your quota
- **Network Issues**: Check internet connection and firewall

## Current Status

The app works perfectly in **fallback mode** with intelligent responses for all forecasting needs. The Gemini API adds enhanced conversational AI capabilities.
