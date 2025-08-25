import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Send,
  TrendingUp,
  Bot,
  User,
  Target,
  Sparkles,
  AlertCircle,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ChatRequest,
  ChatResponse,
  ForecastRequest,
  ForecastResponse,
} from "@shared/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

interface Message {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
  forecast?: ForecastData;
  isError?: boolean;
}

interface ForecastData {
  lob: string;
  model: string;
  historical: Array<{ date: string; value: number }>;
  pastForecast: Array<{
    date: string;
    value: number;
    upper: number;
    lower: number;
  }>;
  forecast: Array<{
    date: string;
    value: number;
    upper: number;
    lower: number;
  }>;
  metrics: { mape: number; rmse: number; mae: number };
}

const Index: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "bot",
      content:
        '👋 Hello! I\'m **ForecastGPT**, your AI-powered time series forecasting assistant.\n\nI can help you with:\n• **Generate forecasts** for any Line of Business using real historical data\n• **Analyze trends** and patterns from your Excel data\n• **Explain concepts** about forecasting and data analysis\n• **Answer questions** about your business data\n• **Provide summaries** and insights\n\nI have access to real historical data from your Excel file.\n\n💡 **Tip**: Try asking "Give me a data summary" or "What LOBs are available?" to see what data I have access to.\n\nWhat would you like to explore?',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [currentForecast, setCurrentForecast] = useState<ForecastData | null>(
    null,
  );
  const [availableLOBs, setAvailableLOBs] = useState<string[]>([]);
  const [selectedLOB, setSelectedLOB] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<
    "arima" | "prophet" | "lstm"
  >("prophet");
  const [forecastPeriods, setForecastPeriods] = useState<number>(12);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load available LOBs on component mount
  useEffect(() => {
    loadAvailableLOBs();
  }, []);

  const loadAvailableLOBs = async () => {
    try {
      // Try to get LOBs by calling the chat API with a summary request
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "What LOBs are available?",
        }),
      });

      if (response.ok) {
        const data: ChatResponse = await response.json();
        // Parse LOBs from response if available
        // For now, we'll use a fallback approach by trying to generate a forecast
        setAvailableLOBs([
          "Case Type 1",
          "Case Type 2",
          "Chat Support",
          "Phone Support",
        ]);
      }
    } catch (error) {
      console.error("Failed to load LOBs:", error);
      // Set some default LOBs
      setAvailableLOBs([
        "Case Type 1",
        "Case Type 2",
        "Chat Support",
        "Phone Support",
      ]);
    }
  };

  const ForecastChart = ({ data }: { data: ForecastData }) => {
    // Prepare data for Recharts - combine all data points by date
    const allDates = new Set([
      ...data.historical.map(p => p.date),
      ...data.pastForecast.map(p => p.date),
      ...data.forecast.map(p => p.date)
    ]);

    const chartData = Array.from(allDates).sort().map((date) => {
      const historical = data.historical.find(p => p.date === date);
      const pastForecast = data.pastForecast.find(p => p.date === date);
      const forecast = data.forecast.find(p => p.date === date);

      return {
        date: new Date(date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        actual: historical?.value || null,
        pastForecast: pastForecast?.value || null,
        forecast: forecast?.value || null,
        upper: forecast?.upper || null,
        lower: forecast?.lower || null,
        type: historical ? "historical" : forecast ? "forecast" : "past",
      };
    });

    return (
      <Card className="mt-4 bg-gradient-to-br from-slate-50 to-blue-50 border-blue-200">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg text-slate-800">
              {data.lob} - Forecast Analysis
            </CardTitle>
            <Badge variant="secondary" className="text-xs">
              {data.model.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="date"
                  stroke="#64748b"
                  fontSize={12}
                  tick={{ fill: "#64748b" }}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={12}
                  tick={{ fill: "#64748b" }}
                  tickFormatter={(value) => value.toLocaleString()}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                  formatter={(value: any, name: string) => [
                    value ? value.toLocaleString() : "N/A",
                    name === "historical"
                      ? "Historical"
                      : name === "forecast"
                        ? "Forecast"
                        : name === "upper"
                          ? "Upper Bound"
                          : "Lower Bound",
                  ]}
                />
                <Legend />

                {/* Confidence interval area */}
                <Area
                  type="monotone"
                  dataKey="upper"
                  stroke="none"
                  fill="rgba(59, 130, 246, 0.1)"
                  fillOpacity={1}
                  connectNulls={false}
                />
                <Area
                  type="monotone"
                  dataKey="lower"
                  stroke="none"
                  fill="white"
                  fillOpacity={1}
                  connectNulls={false}
                />

                {/* Actual data line */}
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="#1f2937"
                  strokeWidth={3}
                  dot={{ fill: "#1f2937", strokeWidth: 2, r: 4 }}
                  connectNulls={false}
                  name="Actual"
                />

                {/* Past Forecast line */}
                <Line
                  type="monotone"
                  dataKey="pastForecast"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: "#3b82f6", strokeWidth: 1, r: 3 }}
                  connectNulls={false}
                  name="Past Forecast"
                />

                {/* Future Forecast line */}
                <Line
                  type="monotone"
                  dataKey="forecast"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  strokeDasharray="8 4"
                  dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                  connectNulls={false}
                  name="Future Forecast"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-slate-700">Model Accuracy</h4>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">MAPE:</span>
                  <span className="font-semibold text-slate-700">
                    {data.metrics.mape.toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">RMSE:</span>
                  <span className="font-semibold text-slate-700">
                    {data.metrics.rmse.toFixed(0)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">MAE:</span>
                  <span className="font-semibold text-slate-700">
                    {data.metrics.mae.toFixed(0)}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-slate-700">Data Points</h4>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Historical:</span>
                  <span className="font-semibold text-slate-700">
                    {data.historical.length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Forecast:</span>
                  <span className="font-semibold text-slate-700">
                    {data.forecast.length}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-slate-700">Latest Values</h4>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Current:</span>
                  <span className="font-semibold text-slate-700">
                    {data.historical[
                      data.historical.length - 1
                    ]?.value.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Next Period:</span>
                  <span className="font-semibold text-slate-700">
                    {data.forecast[0]?.value.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const generateForecastFromAPI = async (
    lob: string,
    model: string,
    periods: number,
  ): Promise<ForecastData | null> => {
    try {
      const forecastRequest: ForecastRequest = {
        lob,
        weeks: periods,
        model: model as "arima" | "prophet" | "lstm",
      };

      const response = await fetch("/api/forecast", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(forecastRequest),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ForecastResponse = await response.json();

      if (!data.success) {
        throw new Error("Failed to generate forecast");
      }

      return {
        lob: data.lob,
        model: data.model,
        historical: data.historical.dates.map((date, i) => ({
          date,
          value: data.historical.values[i],
        })),
        pastForecast: data.pastForecast.dates.map((date, i) => ({
          date,
          value: data.pastForecast.values[i],
          upper: data.pastForecast.confidenceUpper[i],
          lower: data.pastForecast.confidenceLower[i],
        })),
        forecast: data.forecast.dates.map((date, i) => ({
          date,
          value: data.forecast.values[i],
          upper: data.forecast.confidenceUpper[i],
          lower: data.forecast.confidenceLower[i],
        })),
        metrics: data.metrics,
      };
    } catch (error) {
      console.error("Forecast API error:", error);
      return null;
    }
  };

  const callChatAPI = async (
    message: string,
    context?: string,
    forecast?: ForecastData,
  ) => {
    try {
      const chatRequest: ChatRequest = {
        message,
        context,
        forecast,
      };

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(chatRequest),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ChatResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to get response");
      }

      return data.response;
    } catch (error) {
      console.error("API call error:", error);
      throw error;
    }
  };

  const checkForForecastRequest = (
    message: string,
  ): { shouldGenerateForecast: boolean; lob?: string; model?: string } => {
    const lowerMessage = message.toLowerCase();

    if (!lowerMessage.includes("forecast")) {
      return { shouldGenerateForecast: false };
    }

    // Check for LOB mention
    const lobMatch = availableLOBs.find(
      (lob) =>
        lowerMessage.includes(lob.toLowerCase()) ||
        lowerMessage.includes(lob.replace(/\s+/g, "").toLowerCase()),
    );

    if (lobMatch) {
      const modelMatch = lowerMessage.match(/arima|prophet|lstm/) || [
        "prophet",
      ];
      return {
        shouldGenerateForecast: true,
        lob: lobMatch,
        model: modelMatch[0],
      };
    }

    return { shouldGenerateForecast: false };
  };

  const handleGenerateForecast = async () => {
    if (!selectedLOB) return;

    setIsLoading(true);
    try {
      const forecast = await generateForecastFromAPI(
        selectedLOB,
        selectedModel,
        forecastPeriods,
      );
      if (forecast) {
        setCurrentForecast(forecast);

        const forecastMessage: Message = {
          id: Date.now().toString(),
          type: "bot",
          content: `📈 **Forecast Generated Successfully**\n\nI've generated a ${selectedModel.toUpperCase()} forecast for **${selectedLOB}** for the next ${forecastPeriods} months.\n\n**Model Performance:**\n• MAPE: ${forecast.metrics.mape.toFixed(2)}%\n• RMSE: ${forecast.metrics.rmse.toFixed(0)}\n• MAE: ${forecast.metrics.mae.toFixed(0)}\n\nThe chart below shows the historical data (green line) and forecast predictions (blue dashed line) with confidence intervals (shaded area).`,
          timestamp: new Date(),
          forecast,
        };

        setMessages((prev) => [...prev, forecastMessage]);
      }
    } catch (error) {
      console.error("Forecast generation error:", error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: "bot",
        content:
          "❌ **Forecast Generation Failed**\n\nI encountered an error while generating the forecast. This could be due to:\n\n• Invalid or missing data for the selected LOB\n• Server connectivity issues\n• Data processing errors\n\nPlease try again or select a different LOB.",
        timestamp: new Date(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageToProcess = inputValue;
    setInputValue("");
    setIsLoading(true);
    setIsTyping(true);

    try {
      // Check if this is a forecast request that needs chart generation
      const forecastCheck = checkForForecastRequest(messageToProcess);
      let generatedForecast: ForecastData | null = null;

      if (
        forecastCheck.shouldGenerateForecast &&
        forecastCheck.lob &&
        forecastCheck.model
      ) {
        generatedForecast = await generateForecastFromAPI(
          forecastCheck.lob,
          forecastCheck.model,
          12, // Default 12 weeks
        );
        if (generatedForecast) {
          setCurrentForecast(generatedForecast);
        }
      }

      // Build context for the AI
      const contextInfo = `Current data context: Real historical data loaded from Excel file. Available forecasting models: ARIMA, Prophet, LSTM.`;

      // Call Chat API for the response
      const aiResponse = await callChatAPI(
        messageToProcess,
        contextInfo,
        generatedForecast || currentForecast,
      );

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: aiResponse,
        timestamp: new Date(),
        forecast: generatedForecast,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Chat error:", error);

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content:
          '⚠️ I\'m having trouble connecting to my AI service. This usually means:\n\n🔧 **Gemini API key needs setup**\n• Ask me "how to setup API key" for instructions\n• Basic forecasting still works without it\n\n🔄 **Temporary network issue**\n• Try your question again in a moment\n\nI can still help with forecasting analysis using the forecast generator below!',
        timestamp: new Date(),
        isError: true,
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Focus input on load
    inputRef.current?.focus();
  }, []);

  const suggestedPrompts = [
    "Give me a data summary",
    "What trends are you seeing in the data?",
    "Explain the Prophet forecasting model",
    "What LOBs are available for forecasting?",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">ForecastGPT</h1>
              <p className="text-sm text-slate-600">
                AI-Powered Time Series Forecasting with Real Data
              </p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Real Data
              </Badge>
              <Badge variant="outline" className="text-xs">
                Excel Integration
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 p-4">
        {/* Forecast Generator Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Generate Forecast
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Line of Business
                </label>
                <Select value={selectedLOB} onValueChange={setSelectedLOB}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select LOB..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableLOBs.map((lob) => (
                      <SelectItem key={lob} value={lob}>
                        {lob}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Forecasting Model
                </label>
                <Select
                  value={selectedModel}
                  onValueChange={(value: "arima" | "prophet" | "lstm") =>
                    setSelectedModel(value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prophet">
                      Prophet (Recommended)
                    </SelectItem>
                    <SelectItem value="arima">ARIMA</SelectItem>
                    <SelectItem value="lstm">LSTM (Neural Network)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Forecast Periods (Weeks)
                </label>
                <Select
                  value={forecastPeriods.toString()}
                  onValueChange={(value) => setForecastPeriods(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4">4 Weeks</SelectItem>
                    <SelectItem value="8">8 Weeks</SelectItem>
                    <SelectItem value="12">12 Weeks</SelectItem>
                    <SelectItem value="24">24 Weeks</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleGenerateForecast}
                disabled={!selectedLOB || isLoading}
                className="w-full"
              >
                {isLoading ? "Generating..." : "Generate Forecast"}
              </Button>

              <div className="text-xs text-slate-500 space-y-1">
                <p>
                  <strong>Prophet:</strong> Best for business data with
                  seasonality
                </p>
                <p>
                  <strong>ARIMA:</strong> Statistical model for time series
                </p>
                <p>
                  <strong>LSTM:</strong> Deep learning for complex patterns
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Container */}
        <div className="lg:col-span-2">
          <div className="h-[calc(100vh-10rem)] flex flex-col">
            {/* Messages */}
            <ScrollArea className="flex-1">
              <div className="py-6 space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-4",
                      message.type === "user" ? "justify-end" : "justify-start",
                    )}
                  >
                    {message.type === "bot" && (
                      <div className="flex items-start justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg mt-1">
                        {message.isError ? (
                          <AlertCircle className="h-4 w-4 text-white mt-2" />
                        ) : (
                          <Bot className="h-4 w-4 text-white mt-2" />
                        )}
                      </div>
                    )}

                    <div
                      className={cn(
                        "max-w-[85%] group",
                        message.type === "user" ? "order-first" : "",
                      )}
                    >
                      <div
                        className={cn(
                          "rounded-2xl px-4 py-3 shadow-sm",
                          message.type === "user"
                            ? "bg-blue-500 text-white ml-auto"
                            : message.isError
                              ? "bg-red-50 border border-red-200"
                              : "bg-white border border-slate-200",
                        )}
                      >
                        <div
                          className={cn(
                            "text-sm leading-relaxed whitespace-pre-line",
                            message.type === "user"
                              ? "text-white"
                              : message.isError
                                ? "text-red-800"
                                : "text-slate-800",
                          )}
                        >
                          {message.content
                            .split("**")
                            .map((part, i) =>
                              i % 2 === 0 ? (
                                part
                              ) : (
                                <strong key={i}>{part}</strong>
                              ),
                            )}
                        </div>
                      </div>

                      {message.forecast && (
                        <ForecastChart data={message.forecast} />
                      )}

                      <div
                        className={cn(
                          "text-xs text-slate-400 mt-1 px-1",
                          message.type === "user" ? "text-right" : "text-left",
                        )}
                      >
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>

                    {message.type === "user" && (
                      <div className="flex items-start justify-center w-8 h-8 rounded-full bg-slate-600 shadow-lg mt-1">
                        <User className="h-4 w-4 text-white mt-2" />
                      </div>
                    )}
                  </div>
                ))}

                {isTyping && (
                  <div className="flex gap-4 justify-start">
                    <div className="flex items-start justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg mt-1">
                      <Bot className="h-4 w-4 text-white mt-2" />
                    </div>
                    <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Suggested Prompts */}
            {messages.length === 1 && (
              <div className="py-2">
                <div className="flex flex-wrap gap-2 justify-center">
                  {suggestedPrompts.map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => setInputValue(prompt)}
                      className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-full hover:bg-slate-50 transition-colors text-slate-700 hover:border-blue-300"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 border-t bg-white/50 backdrop-blur-sm">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me about trends, generate forecasts, or analyze your data..."
                    className="pr-12 py-3 rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                    disabled={isLoading}
                  />
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  size="icon"
                  className="h-12 w-12 rounded-xl bg-blue-500 hover:bg-blue-600 shadow-lg"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-center mt-2">
                <p className="text-xs text-slate-500">
                  ForecastGPT uses real historical data from your Excel file for
                  accurate predictions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
