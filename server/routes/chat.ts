import { RequestHandler } from "express";

interface ChatRequest {
  message: string;
  context?: string;
  forecast?: any;
}

interface ChatResponse {
  success: boolean;
  response: string;
  error?: string;
}

function generateFallbackResponse(message: string): string {
  const lowerMessage = message.toLowerCase();

  // Handle forecasting requests
  if (lowerMessage.includes("forecast")) {
    if (lowerMessage.includes("chat")) {
      return "📈 **Chat Support Forecast Analysis**\n\nBased on the current trend showing 18% growth rate, I would expect Chat support to continue its upward trajectory. The channel is performing exceptionally well with only 1.8 hours average resolution time.\n\n**Key Insights:**\n• **Current Volume**: 2,156 cases (highest among all LoBs)\n• **Trend**: Rapidly growing (+18% growth rate)\n• **Efficiency**: Fastest resolution time at 1.8 hours\n• **Recommendation**: This channel should be prioritized for expansion\n\n*Note: To get AI-powered forecasts with advanced models, please configure your Gemini API key.*";
    } else if (lowerMessage.includes("case type 1")) {
      return "📊 **Case Type 1 Forecast Analysis**\n\nCase Type 1 shows steady growth with a 5% increase trend. This represents customer complaints and service issues.\n\n**Current Status:**\n• **Volume**: 1,245 cases\n• **Resolution Time**: 4.2 hours average\n• **Trend**: Growing steadily (+15% last quarter)\n• **Pattern**: Consistent upward movement\n\n**Forecast Outlook**: Expect continued growth requiring additional resource allocation.\n\n*Configure Gemini API for detailed forecasting models and confidence intervals.*";
    } else {
      return "🔮 **Forecasting Available**\n\nI can help analyze trends for these Lines of Business:\n\n• **Case Type 1-6** (Various support categories)\n• **Chat Support** (2,156 cases - fastest growing)\n• **Phone Support** (1,834 cases - declining trend)\n\nPlease specify which LoB you'd like me to forecast, or ask about specific trends.\n\n*For AI-powered forecasting with ARIMA, Prophet, and LSTM models, configure your Gemini API key.*";
    }
  }

  // Handle trend analysis
  if (lowerMessage.includes("trend")) {
    return "📈 **Current Trend Analysis - Premium Order Services**\n\n**Growing Channels:**\n• Chat Support (+18% growth) - 2,156 cases\n• Case Type 1 (+5% growth) - 1,245 cases\n• Case Type 4 (+8% growth) - 623 cases\n• Case Type 6 (+12% growth) - 298 cases\n\n**Stable Channels:**\n• Case Type 2 (+2% growth) - 987 cases\n• Case Type 5 (+1% growth) - 432 cases\n\n**Declining Channels:**\n• Phone Support (-5% decline) - 1,834 cases\n• Case Type 3 (-3% decline) - 756 cases\n\n**Key Insight**: Digital channels (Chat) are growing while traditional channels (Phone) are declining.";
  }

  // Handle model comparisons
  if (
    lowerMessage.includes("arima") ||
    lowerMessage.includes("prophet") ||
    lowerMessage.includes("model")
  ) {
    return "🔬 **Forecasting Models Comparison**\n\n**ARIMA (AutoRegressive Integrated Moving Average)**\n• Best for: Stationary time series with clear patterns\n• Strengths: Statistical foundation, good for short-term\n• Use case: Stable business metrics like Case Type 2\n\n**Prophet (Facebook's Model)**\n• Best for: Business time series with seasonality\n• Strengths: Handles holidays, missing data, growth trends\n• Use case: Growing channels like Chat Support\n\n**LSTM (Deep Learning)**\n• Best for: Complex patterns, large datasets\n• Strengths: Captures non-linear relationships\n• Use case: Multi-variate forecasting across all LoBs\n\n**Recommendation**: Start with Prophet for business forecasting.";
  }

  // Handle explanations
  if (lowerMessage.includes("explain") || lowerMessage.includes("what is")) {
    return "💡 **I'm here to help explain forecasting concepts!**\n\nI can explain:\n• **Time Series Analysis** - Understanding patterns over time\n• **Forecasting Models** - ARIMA, Prophet, LSTM approaches\n• **Business Metrics** - MAPE, RMSE, MAE accuracy measures\n• **Trend Analysis** - Growth, decline, and seasonal patterns\n• **Data Interpretation** - How to read and act on forecasts\n\nWhat specific concept would you like me to explain?\n\n*For detailed AI explanations, configure your Gemini API key.*";
  }

  // Handle summaries
  if (lowerMessage.includes("summary")) {
    return "📋 **Premium Order Services - Data Summary**\n\n**Total Volume**: 8,231 cases across 8 Lines of Business\n**Average Resolution**: 4.9 hours\n\n**Top Performers:**\n1. **Chat Support** - 2,156 cases (26% of total)\n2. **Phone Support** - 1,834 cases (22% of total)\n3. **Case Type 1** - 1,245 cases (15% of total)\n\n**Efficiency Leaders:**\n• Chat: 1.8h (fastest resolution)\n• Case Type 5: 2.9h\n• Case Type 2: 3.8h\n\n**Growth Opportunities:**\n• Chat Support expanding rapidly\n• Case Type 4 & 6 showing strong growth\n• Phone Support needs attention (declining)\n\n**Strategic Focus**: Invest in digital channels, optimize traditional support.";
  }

  // API key setup message
  if (
    lowerMessage.includes("api") ||
    lowerMessage.includes("key") ||
    lowerMessage.includes("setup")
  ) {
    return "🔧 **Gemini API Setup Instructions**\n\nTo unlock full AI capabilities:\n\n1. **Get API Key**: Visit [Google AI Studio](https://aistudio.google.com/)\n2. **Set Environment Variable**: \n   ```\n   GEMINI_API_KEY=your_actual_api_key_here\n   ```\n3. **Restart Server**: Restart the development server\n\n**With API configured, you'll get:**\n• Advanced AI conversations\n• Detailed explanations\n• Context-aware responses\n• Natural language understanding\n\n**Current Status**: Using fallback responses (basic functionality)";
  }

  // Default response
  return '🤖 **ForecastGPT - Forecasting Assistant**\n\nI\'m specialized in time series forecasting for your Premium Order Services data. I can help with:\n\n• **Generate Forecasts** for any Line of Business\n• **Analyze Trends** and patterns\n• **Compare Models** (ARIMA, Prophet, LSTM)\n• **Explain Concepts** about forecasting\n• **Provide Summaries** of your data\n\nTry asking:\n• "Forecast Chat support trends"\n• "What\'s trending up?"\n• "Explain Prophet model"\n• "Give me a data summary"\n\n*For advanced AI responses, configure your Gemini API key.*';
}

export const handleChat: RequestHandler = async (req, res) => {
  try {
    const { message, context, forecast }: ChatRequest = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: "Message is required",
      });
    }

    // Get Gemini API key from environment
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === "YOUR_GEMINI_API_KEY_HERE") {
      // Fallback response when API key is not configured
      const fallbackResponse = generateFallbackResponse(message);
      return res.json({
        success: true,
        response: fallbackResponse,
      });
    }

    // Build the system prompt for the forecasting expert
    const systemPrompt = `You are ForecastGPT, an expert AI assistant specialized in time series forecasting and business data analysis. You have access to Premium Order Services data with these Lines of Business:

• Case Type 1 (1,245 cases, 4.2h avg resolution, growing trend)
• Case Type 2 (987 cases, 3.8h avg resolution, stable trend)  
• Case Type 3 (756 cases, 5.1h avg resolution, declining trend)
• Case Type 4 (623 cases, 6.3h avg resolution, growing trend)
• Case Type 5 (432 cases, 2.9h avg resolution, stable trend)
• Case Type 6 (298 cases, 7.4h avg resolution, growing trend)
• Chat Support (2,156 cases, 1.8h avg resolution, rapidly growing)
• Phone Support (1,834 cases, 8.2h avg resolution, declining)

You can:
1. Generate forecasts using ARIMA, Prophet, or LSTM models
2. Analyze trends and provide business insights
3. Explain forecasting concepts and methodologies
4. Answer general questions while maintaining your forecasting expertise
5. Provide summaries and explanations related to the data

Always be helpful, professional, and focus on actionable insights. Use emojis sparingly but appropriately. Keep responses concise but informative.`;

    // Add context if there's forecast data
    let contextMessage = context || "";
    if (forecast) {
      contextMessage += `\n\nCurrent forecast context: User is viewing a ${forecast.model} forecast for ${forecast.lob} showing ${forecast.forecast?.length || 0} periods ahead.`;
    }

    const fullPrompt = `${systemPrompt}\n\nContext: ${contextMessage}\n\nUser message: ${message}\n\nRespond as ForecastGPT:`;

    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: fullPrompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Gemini API error:", errorData);
      return res.status(500).json({
        success: false,
        error: "Failed to get response from AI service",
      });
    }

    const data = await response.json();

    if (
      !data.candidates ||
      !data.candidates[0] ||
      !data.candidates[0].content
    ) {
      return res.status(500).json({
        success: false,
        error: "Invalid response from AI service",
      });
    }

    const aiResponse = data.candidates[0].content.parts[0].text;

    const chatResponse: ChatResponse = {
      success: true,
      response: aiResponse,
    };

    res.json(chatResponse);
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};
