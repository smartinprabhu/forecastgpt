import { RequestHandler } from "express";
import { DataService } from "../services/dataService";

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

async function generateFallbackResponse(message: string): Promise<string> {
  const lowerMessage = message.toLowerCase();
  const dataService = DataService.getInstance();

  try {
    // Get real data
    const allData = await dataService.getAllData();
    const lobs = Object.keys(allData);

    // Calculate current volumes and trends for each LOB
    const lobStats: {
      [key: string]: { volume: number; trend: string; latestValue: number };
    } = {};

    for (const lob of lobs) {
      const data = allData[lob];
      if (data.length > 0) {
        const latestValue = data[data.length - 1].value;
        const previousValue =
          data.length > 1 ? data[data.length - 2].value : latestValue;
        const trendPercent =
          previousValue > 0
            ? (((latestValue - previousValue) / previousValue) * 100).toFixed(1)
            : "0.0";
        const trendDirection =
          latestValue > previousValue
            ? "growing"
            : latestValue < previousValue
              ? "declining"
              : "stable";

        lobStats[lob] = {
          volume: latestValue,
          trend: `${trendDirection} (${trendPercent}%)`,
          latestValue,
        };
      }
    }

    // Handle forecasting requests
    if (lowerMessage.includes("forecast")) {
      const matchedLob = lobs.find((lob) =>
        lowerMessage.includes(lob.toLowerCase()),
      );

      if (matchedLob && lobStats[matchedLob]) {
        const stats = lobStats[matchedLob];
        return `📈 **${matchedLob} Forecast Analysis**\n\nBased on historical data analysis for ${matchedLob}.\n\n**Current Status:**\n• **Volume**: ${stats.latestValue.toLocaleString()} cases\n• **Trend**: ${stats.trend}\n• **Data Points**: ${allData[matchedLob].length} historical records\n\n**Forecast Available**: Use the forecast feature to generate predictions with ARIMA, Prophet, or LSTM models.\n\n*Note: To get AI-powered forecasts with advanced models, please configure your Gemini API key.*`;
      } else {
        const lobList = lobs
          .map(
            (lob) =>
              `• **${lob}** (${lobStats[lob]?.latestValue.toLocaleString() || "N/A"} cases - ${lobStats[lob]?.trend || "trend unknown"})`,
          )
          .join("\n");
        return `🔮 **Forecasting Available**\n\nI can help analyze trends for these Lines of Business:\n\n${lobList}\n\nPlease specify which LoB you'd like me to forecast, or ask about specific trends.\n\n*For AI-powered forecasting with ARIMA, Prophet, and LSTM models, configure your Gemini API key.*`;
      }
    }

    // Handle trend analysis
    if (lowerMessage.includes("trend")) {
      const growingLobs = Object.entries(lobStats)
        .filter(([_, stats]) => stats.trend.includes("growing"))
        .map(
          ([lob, stats]) =>
            `• ${lob} (${stats.trend}) - ${stats.latestValue.toLocaleString()} cases`,
        )
        .join("\n");

      const decliningLobs = Object.entries(lobStats)
        .filter(([_, stats]) => stats.trend.includes("declining"))
        .map(
          ([lob, stats]) =>
            `• ${lob} (${stats.trend}) - ${stats.latestValue.toLocaleString()} cases`,
        )
        .join("\n");

      const stableLobs = Object.entries(lobStats)
        .filter(([_, stats]) => stats.trend.includes("stable"))
        .map(
          ([lob, stats]) =>
            `• ${lob} (${stats.trend}) - ${stats.latestValue.toLocaleString()} cases`,
        )
        .join("\n");

      let trendAnalysis = `📈 **Current Trend Analysis - Historical Data**\n\n`;

      if (growingLobs) {
        trendAnalysis += `**Growing Channels:**\n${growingLobs}\n\n`;
      }

      if (stableLobs) {
        trendAnalysis += `**Stable Channels:**\n${stableLobs}\n\n`;
      }

      if (decliningLobs) {
        trendAnalysis += `**Declining Channels:**\n${decliningLobs}\n\n`;
      }

      trendAnalysis += `**Analysis based on ${lobs.length} LOBs with real historical data**`;

      return trendAnalysis;
    }

    // Handle model comparisons
    if (
      lowerMessage.includes("arima") ||
      lowerMessage.includes("prophet") ||
      lowerMessage.includes("model")
    ) {
      return "🔬 **Forecasting Models Comparison**\n\n**ARIMA (AutoRegressive Integrated Moving Average)**\n• Best for: Stationary time series with clear patterns\n• Strengths: Statistical foundation, good for short-term\n• Use case: Stable business metrics\n\n**Prophet (Facebook's Model)**\n• Best for: Business time series with seasonality\n• Strengths: Handles holidays, missing data, growth trends\n• Use case: Growing channels with seasonal patterns\n\n**LSTM (Deep Learning)**\n• Best for: Complex patterns, large datasets\n• Strengths: Captures non-linear relationships\n• Use case: Multi-variate forecasting across all LoBs\n\n**Recommendation**: Start with Prophet for business forecasting with real historical data.";
    }

    // Handle explanations
    if (lowerMessage.includes("explain") || lowerMessage.includes("what is")) {
      return "💡 **I'm here to help explain forecasting concepts!**\n\nI can explain:\n• **Time Series Analysis** - Understanding patterns over time\n• **Forecasting Models** - ARIMA, Prophet, LSTM approaches\n• **Business Metrics** - MAPE, RMSE, MAE accuracy measures\n• **Trend Analysis** - Growth, decline, and seasonal patterns\n• **Data Interpretation** - How to read and act on forecasts\n\nWhat specific concept would you like me to explain?\n\n*For detailed AI explanations, configure your Gemini API key.*";
    }

    // Handle summaries
    if (lowerMessage.includes("summary")) {
      const totalVolume = Object.values(allData).reduce(
        (sum, lobData) => sum + (lobData[lobData.length - 1]?.value || 0),
        0,
      );

      const topPerformers = Object.entries(allData)
        .map(([lob, data]) => ({
          lob,
          volume: data[data.length - 1]?.value || 0,
        }))
        .sort((a, b) => b.volume - a.volume)
        .slice(0, 3)
        .map(
          (item, index) =>
            `${index + 1}. **${item.lob}** - ${item.volume.toLocaleString()} cases`,
        )
        .join("\n");

      return `📋 **Data Summary - Historical Analysis**\n\n**Total Current Volume**: ${totalVolume.toLocaleString()} cases across ${lobs.length} Lines of Business\n\n**Top Performers:**\n${topPerformers}\n\n**Data Coverage**: Real historical data from Excel file\n**Available Models**: ARIMA, Prophet, LSTM forecasting\n\n**Strategic Focus**: Use forecasting models to predict future trends and optimize resource allocation.`;
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
    const lobList = lobs.slice(0, 5).join('", "');
    const moreCount = lobs.length > 5 ? ` and ${lobs.length - 5} more` : "";

    return `🤖 **ForecastGPT - Forecasting Assistant**\n\nI'm specialized in time series forecasting using your Excel historical data. I can help with:\n\n• **Generate Forecasts** for any Line of Business\n• **Analyze Trends** and patterns\n• **Compare Models** (ARIMA, Prophet, LSTM)\n• **Explain Concepts** about forecasting\n• **Provide Summaries** of your data\n\n**Available LOBs**: "${lobList}"${moreCount}\n\nTry asking:\n• "Forecast [LOB name] trends"\n• "What's trending up?"\n• "Explain Prophet model"\n• "Give me a data summary"\n\n*For advanced AI responses, configure your Gemini API key.*`;
  } catch (error) {
    console.error("Error generating fallback response:", error);
    // Fall back to basic response if data loading fails
    return "🤖 **ForecastGPT - Forecasting Assistant**\n\nI'm specialized in time series forecasting. Please ensure your Excel data file is available and try again.\n\n*For advanced AI responses, configure your Gemini API key.*";
  }
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
      const fallbackResponse = await generateFallbackResponse(message);
      return res.json({
        success: true,
        response: fallbackResponse,
      });
    }

    // Get real data for system prompt
    let dataDescription = "various Lines of Business with historical data";
    try {
      const dataService = DataService.getInstance();
      const allData = await dataService.getAllData();
      const lobs = Object.keys(allData);

      const lobDescriptions = lobs
        .map((lob) => {
          const data = allData[lob];
          if (data.length > 0) {
            const latestValue = data[data.length - 1].value;
            const dataPoints = data.length;
            return `• ${lob} (${latestValue.toLocaleString()} current cases, ${dataPoints} historical data points)`;
          }
          return `• ${lob} (data available)`;
        })
        .join("\n");

      dataDescription = `these Lines of Business loaded from Excel data:\n\n${lobDescriptions}`;
    } catch (error) {
      console.error("Error loading data for system prompt:", error);
    }

    // Build the system prompt for the forecasting expert
    const systemPrompt = `You are ForecastGPT, an expert AI assistant specialized in time series forecasting and business data analysis. You have access to real historical data for ${dataDescription}

You can:
1. Generate forecasts using ARIMA, Prophet, or LSTM models
2. Analyze trends and provide business insights based on real historical data
3. Explain forecasting concepts and methodologies
4. Answer general questions while maintaining your forecasting expertise
5. Provide summaries and explanations related to the actual data

The data comes from an Excel file with real historical values. Always be helpful, professional, and focus on actionable insights. Use emojis sparingly but appropriately. Keep responses concise but informative.`;

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
