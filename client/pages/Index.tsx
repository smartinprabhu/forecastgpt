import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  TrendingUp,
  Bot,
  User,
  Target,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatRequest, ChatResponse } from "@shared/api";

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
  forecast: Array<{
    date: string;
    value: number;
    upper: number;
    lower: number;
  }>;
  metrics: { mape: number; rmse: number; mae: number };
}

interface LoBData {
  name: string;
  totalCases: number;
  avgResolutionTime: number;
  trendDirection: "up" | "down" | "stable";
  monthlyData: Array<{ month: string; value: number; date: string }>;
  summary: string;
}

function generateMonthlyData(
  baseValue: number,
  trendRate: number,
): Array<{ month: string; value: number; date: string }> {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const data = [];

  for (let i = 0; i < 12; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() - (11 - i));
    const trend = baseValue * (1 + trendRate * i);
    const seasonal = baseValue * 0.1 * Math.sin((i * 2 * Math.PI) / 12);
    const noise = (Math.random() - 0.5) * baseValue * 0.05;
    const value = Math.round(Math.max(trend + seasonal + noise, 0));

    data.push({
      month: months[i],
      value,
      date: date.toISOString().split("T")[0],
    });
  }
  return data;
}

const Index: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "bot",
      content:
        '👋 Hello! I\'m **ForecastGPT**, your AI-powered time series forecasting assistant.\n\nI can help you with:\n• **Generate forecasts** for any Line of Business\n• **Analyze trends** and patterns in your data\n• **Explain concepts** about forecasting and data analysis\n• **Answer questions** about your Premium Order Services data\n• **Provide summaries** and insights\n\nI have access to data from 8 Lines of Business with over 8,000 total cases. \n\n💡 **Tip**: For full AI capabilities, ask me "how to setup API key" to configure Gemini integration.\n\nWhat would you like to explore?',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [currentForecast, setCurrentForecast] = useState<ForecastData | null>(
    null,
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Premium Order Services data
  const loBsData: LoBData[] = [
    {
      name: "Case Type 1",
      totalCases: 1245,
      avgResolutionTime: 4.2,
      trendDirection: "up",
      monthlyData: generateMonthlyData(1200, 0.05),
      summary:
        "Customer complaints and service issues. Showing steady growth with 15% increase over last quarter.",
    },
    {
      name: "Case Type 2",
      totalCases: 987,
      avgResolutionTime: 3.8,
      trendDirection: "stable",
      summary:
        "Product inquiries and technical support. Stable volume with seasonal variations.",
      monthlyData: generateMonthlyData(950, 0.02),
    },
    {
      name: "Case Type 3",
      totalCases: 756,
      avgResolutionTime: 5.1,
      trendDirection: "down",
      summary:
        "Billing and payment related cases. Declining trend due to automated payment systems.",
      monthlyData: generateMonthlyData(800, -0.03),
    },
    {
      name: "Case Type 4",
      totalCases: 623,
      avgResolutionTime: 6.3,
      trendDirection: "up",
      summary:
        "Account management and modifications. Increasing complexity requiring more resolution time.",
      monthlyData: generateMonthlyData(580, 0.08),
    },
    {
      name: "Case Type 5",
      totalCases: 432,
      avgResolutionTime: 2.9,
      trendDirection: "stable",
      summary:
        "General information requests. Consistent volume with quick resolution times.",
      monthlyData: generateMonthlyData(420, 0.01),
    },
    {
      name: "Case Type 6",
      totalCases: 298,
      avgResolutionTime: 7.4,
      trendDirection: "up",
      summary:
        "Escalated cases requiring specialist attention. Growing due to product complexity.",
      monthlyData: generateMonthlyData(250, 0.12),
    },
    {
      name: "Chat",
      totalCases: 2156,
      avgResolutionTime: 1.8,
      trendDirection: "up",
      summary:
        "Real-time chat support. Fastest growing channel with excellent customer satisfaction.",
      monthlyData: generateMonthlyData(1800, 0.18),
    },
    {
      name: "Phone",
      totalCases: 1834,
      avgResolutionTime: 8.2,
      trendDirection: "down",
      summary:
        "Traditional phone support. Declining as customers prefer digital channels.",
      monthlyData: generateMonthlyData(2000, -0.05),
    },
  ];

  const ForecastChart = ({ data }: { data: ForecastData }) => {
    const allValues = [
      ...data.historical.map((d) => d.value),
      ...data.forecast.map((d) => d.value),
      ...data.forecast.map((d) => d.upper),
    ];
    const maxValue = Math.max(...allValues);
    const minValue = Math.min(...allValues);
    const range = maxValue - minValue || 1;
    const totalPoints = data.historical.length + data.forecast.length;

    return (
      <div className="mt-4 p-4 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border">
        <div className="flex items-center gap-2 mb-3">
          <Target className="h-4 w-4 text-blue-600" />
          <h4 className="font-semibold text-slate-800">
            {data.lob} - Forecast Analysis
          </h4>
          <Badge variant="secondary" className="text-xs">
            {data.model.toUpperCase()}
          </Badge>
        </div>

        <div className="h-64 relative bg-white rounded-lg border shadow-sm">
          <svg className="w-full h-full" viewBox="0 0 500 200">
            {/* Grid lines */}
            {[0, 1, 2, 3, 4].map((i) => (
              <line
                key={i}
                x1="0"
                y1={40 * i}
                x2="500"
                y2={40 * i}
                stroke="#e2e8f0"
                strokeWidth="1"
              />
            ))}

            {/* Confidence interval */}
            <path
              d={`M ${data.forecast
                .map((d, i) => {
                  const x =
                    ((data.historical.length + i) / (totalPoints - 1)) * 480 +
                    10;
                  const y = 200 - ((d.upper - minValue) / range) * 160 - 20;
                  return `${x},${y}`;
                })
                .join(" L ")} L ${data.forecast
                .map((d, i) => {
                  const x =
                    ((data.historical.length + data.forecast.length - 1 - i) /
                      (totalPoints - 1)) *
                      480 +
                    10;
                  const y =
                    200 -
                    ((data.forecast[data.forecast.length - 1 - i].lower -
                      minValue) /
                      range) *
                      160 -
                    20;
                  return `${x},${y}`;
                })
                .join(" L ")} Z`}
              fill="rgba(59, 130, 246, 0.1)"
              stroke="none"
            />

            {/* Historical line */}
            <path
              d={`M ${data.historical
                .map(
                  (d, i) =>
                    `${(i / (totalPoints - 1)) * 480 + 10},${200 - ((d.value - minValue) / range) * 160 - 20}`,
                )
                .join(" L ")}`}
              fill="none"
              stroke="#10b981"
              strokeWidth="3"
            />

            {/* Forecast line */}
            <path
              d={`M ${data.forecast
                .map(
                  (d, i) =>
                    `${((data.historical.length + i) / (totalPoints - 1)) * 480 + 10},${200 - ((d.value - minValue) / range) * 160 - 20}`,
                )
                .join(" L ")}`}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="3"
              strokeDasharray="8,4"
            />

            {/* Separation line */}
            <line
              x1={((data.historical.length - 1) / (totalPoints - 1)) * 480 + 10}
              y1="20"
              x2={((data.historical.length - 1) / (totalPoints - 1)) * 480 + 10}
              y2="180"
              stroke="#6b7280"
              strokeWidth="2"
              strokeDasharray="4,4"
            />
          </svg>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-4 h-1 bg-green-500 rounded"></div>
              <span className="text-slate-600">Historical Data</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-4 h-1 bg-blue-500 rounded border-dashed border border-blue-300"></div>
              <span className="text-slate-600">Forecast</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-4 h-2 bg-blue-100 border border-blue-300 rounded"></div>
              <span className="text-slate-600">Confidence Interval</span>
            </div>
          </div>

          <div className="space-y-1 text-right">
            <div className="text-sm">
              <span className="text-slate-500">MAPE:</span>
              <span className="font-semibold text-slate-700 ml-1">
                {data.metrics.mape.toFixed(2)}%
              </span>
            </div>
            <div className="text-sm">
              <span className="text-slate-500">RMSE:</span>
              <span className="font-semibold text-slate-700 ml-1">
                {data.metrics.rmse.toFixed(0)}
              </span>
            </div>
            <div className="text-sm">
              <span className="text-slate-500">MAE:</span>
              <span className="font-semibold text-slate-700 ml-1">
                {data.metrics.mae.toFixed(0)}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const generateForecast = (lob: string, model: string): ForecastData => {
    const lobData = loBsData.find(
      (l) =>
        l.name.toLowerCase().includes(lob.toLowerCase()) ||
        lob.toLowerCase().includes(l.name.toLowerCase()),
    )!;
    const historical = lobData.monthlyData.map((d) => ({
      date: d.date,
      value: d.value,
    }));

    // Generate 6 months forecast
    const forecast = [];
    const lastValue = historical[historical.length - 1].value;
    const trend =
      lobData.trendDirection === "up"
        ? 0.05
        : lobData.trendDirection === "down"
          ? -0.03
          : 0.01;

    for (let i = 1; i <= 6; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() + i);
      const forecastValue =
        lastValue * (1 + trend * i) + (Math.random() - 0.5) * lastValue * 0.05;
      const uncertainty = forecastValue * (0.1 + i * 0.02);

      forecast.push({
        date: date.toISOString().split("T")[0],
        value: Math.round(Math.max(forecastValue, 0)),
        upper: Math.round(Math.max(forecastValue + uncertainty, 0)),
        lower: Math.round(Math.max(forecastValue - uncertainty, 0)),
      });
    }

    return {
      lob: lobData.name,
      model,
      historical,
      forecast,
      metrics: {
        mape: Math.random() * 8 + 2,
        rmse: Math.random() * 50 + 20,
        mae: Math.random() * 30 + 10,
      },
    };
  };

  const callGeminiAPI = async (
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

    const lobMatch = loBsData.find(
      (lob) =>
        lowerMessage.includes(lob.name.toLowerCase()) ||
        lowerMessage.includes(lob.name.replace(/\s+/g, "").toLowerCase()),
    );

    if (lobMatch) {
      const modelMatch = lowerMessage.match(/arima|prophet|lstm/) || [
        "prophet",
      ];
      return {
        shouldGenerateForecast: true,
        lob: lobMatch.name,
        model: modelMatch[0],
      };
    }

    return { shouldGenerateForecast: false };
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
      let generatedForecast: ForecastData | undefined;

      if (
        forecastCheck.shouldGenerateForecast &&
        forecastCheck.lob &&
        forecastCheck.model
      ) {
        generatedForecast = generateForecast(
          forecastCheck.lob,
          forecastCheck.model,
        );
        setCurrentForecast(generatedForecast);
      }

      // Build context for the AI
      const contextInfo = `Current data context: Premium Order Services with ${loBsData.length} Lines of Business. Total cases: ${loBsData.reduce((sum, lob) => sum + lob.totalCases, 0).toLocaleString()}.`;

      // Call Gemini API for the response
      const aiResponse = await callGeminiAPI(
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
          '⚠️ I\'m having trouble with my AI connection. This usually means:\n\n🔧 **Gemini API key needs setup**\n• Ask me "how to setup API key" for instructions\n• Basic forecasting still works without it\n\n🔄 **Temporary network issue**\n• Try your question again in a moment\n\nI can still help with forecasting analysis using my built-in knowledge!',
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
    "Forecast Chat support for next 6 months",
    "Give me a summary of all Lines of Business",
    "What trends are you seeing in the data?",
    "How to setup API key for full AI features",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">ForecastGPT</h1>
              <p className="text-sm text-slate-600">
                AI-Powered Time Series Forecasting Assistant
              </p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Gemini Powered
              </Badge>
              <Badge variant="outline" className="text-xs">
                Premium Order Services
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="max-w-4xl mx-auto">
        <div className="h-[calc(100vh-10rem)] flex flex-col">
          {/* Messages */}
          <ScrollArea className="flex-1 px-4">
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

          {/* Suggested Prompts (only show when no messages beyond initial) */}
          {messages.length === 1 && (
            <div className="px-4 py-2">
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
            <div className="flex gap-3 max-w-4xl mx-auto">
              <div className="flex-1 relative">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about forecasting, trends, or data analysis..."
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
                ForecastGPT can make mistakes. Consider verifying important
                information.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
