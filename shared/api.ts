export interface DemoResponse {
  message: string;
}

export interface FileUploadResponse {
  success: boolean;
  message: string;
  lobs: string[];
  dataPoints: number;
}

export interface ForecastRequest {
  lob: string;
  weeks: number;
  model?: "arima" | "prophet" | "lstm";
}

export interface ForecastResponse {
  success: boolean;
  lob: string;
  forecastPeriod: number;
  model: string;
  dates: string[];
  historical: {
    dates: string[];
    values: number[];
  };
  pastForecast: {
    dates: string[];
    values: number[];
    confidenceUpper: number[];
    confidenceLower: number[];
  };
  forecast: {
    dates: string[];
    values: number[];
    confidenceUpper: number[];
    confidenceLower: number[];
  };
  metrics: {
    mape: number;
    rmse: number;
    mae: number;
  };
}

export interface DataPoint {
  date: string;
  value: number;
  lob: string;
}

export interface ProcessedData {
  [lob: string]: DataPoint[];
}

export interface ChatRequest {
  message: string;
  context?: string;
  forecast?: any;
}

export interface ChatResponse {
  success: boolean;
  response: string;
  error?: string;
}
