import { RequestHandler } from "express";
import { ForecastRequest, ForecastResponse } from "@shared/api";
import { DataService } from "../services/dataService";
import { ForecastingService } from "../services/forecastingService";

export const handleForecast: RequestHandler = async (req, res) => {
  try {
    const { lob, months, model = "prophet" }: ForecastRequest = req.body;

    if (!lob || !months) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameters: lob and months",
      });
    }

    // Get data service instance
    const dataService = DataService.getInstance();

    // Validate LOB exists
    const availableLOBs = await dataService.getLOBs();
    if (!availableLOBs.includes(lob)) {
      return res.status(400).json({
        success: false,
        message: `Invalid LOB. Available LOBs: ${availableLOBs.join(", ")}`,
      });
    }

    // Get historical data for the specified LOB
    const historicalData = await dataService.getHistoricalData(lob);

    if (historicalData.length === 0) {
      return res.status(400).json({
        success: false,
        message: `No historical data found for LOB: ${lob}`,
      });
    }

    console.log(
      `Generating ${model} forecast for ${lob} with ${historicalData.length} historical data points`,
    );

    // Generate forecast using the specified model
    const forecastResult = await ForecastingService.generateForecast(
      historicalData,
      months,
      model,
    );

    // Prepare response
    const historicalDates = historicalData.map((d) => d.date);
    const historicalValues = historicalData.map((d) => d.value);

    const response: ForecastResponse = {
      success: true,
      lob,
      forecastPeriod: months,
      model,
      dates: [...historicalDates, ...forecastResult.dates],
      historical: {
        dates: historicalDates,
        values: historicalValues,
      },
      forecast: {
        dates: forecastResult.dates,
        values: forecastResult.values,
        confidenceUpper: forecastResult.confidenceUpper,
        confidenceLower: forecastResult.confidenceLower,
      },
      metrics: forecastResult.metrics,
    };

    res.json(response);
  } catch (error) {
    console.error("Forecast error:", error);
    res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Error generating forecast. Please try again.",
    });
  }
};
