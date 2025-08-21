import * as XLSX from "xlsx";
import fs from "fs";
import path from "path";
import { DataPoint, ProcessedData } from "@shared/api";

export class DataService {
  private static instance: DataService;
  private cachedData: ProcessedData | null = null;

  private constructor() {}

  public static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  /**
   * Load and parse Excel data from the uploaded file
   */
  public async loadExcelData(): Promise<ProcessedData> {
    if (this.cachedData) {
      return this.cachedData;
    }

    try {
      const excelPath = path.join(process.cwd(), "new_df_eval.xlsx");

      if (!fs.existsSync(excelPath)) {
        throw new Error(
          "Excel file not found. Please ensure new_df_eval.xlsx is in the project root.",
        );
      }

      const workbook = XLSX.readFile(excelPath);
      const sheetName = workbook.SheetNames[0]; // Use first sheet
      const worksheet = workbook.Sheets[sheetName];

      // Convert to JSON array
      const rawData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
      }) as any[][];

      return this.processRawData(rawData);
    } catch (error) {
      console.error("Error loading Excel data:", error);
      // Return mock data as fallback
      return this.generateMockData();
    }
  }

  /**
   * Process raw Excel data into structured format
   */
  private processRawData(rawData: any[][]): ProcessedData {
    const processed: ProcessedData = {};

    if (rawData.length < 2) {
      return this.generateMockData();
    }

    // Assume first row contains headers
    const headers = rawData[0] as string[];

    // Find date column (look for common date headers)
    const dateColIndex = headers.findIndex(
      (header) =>
        header &&
        typeof header === "string" &&
        (header.toLowerCase().includes("date") ||
          header.toLowerCase().includes("time") ||
          header.toLowerCase().includes("period")),
    );

    if (dateColIndex === -1) {
      console.warn("No date column found, using row indices as dates");
    }

    // Process each data row
    for (let rowIndex = 1; rowIndex < rawData.length; rowIndex++) {
      const row = rawData[rowIndex];
      if (!row || row.length === 0) continue;

      // Extract date
      let dateValue: string;
      if (dateColIndex >= 0 && row[dateColIndex]) {
        dateValue = this.parseDate(row[dateColIndex]);
      } else {
        // Generate dates if no date column found
        const baseDate = new Date("2022-01-01");
        baseDate.setMonth(baseDate.getMonth() + (rowIndex - 1));
        dateValue = baseDate.toISOString().split("T")[0];
      }

      // Process each column as potential LOB data
      for (let colIndex = 0; colIndex < headers.length; colIndex++) {
        if (colIndex === dateColIndex) continue; // Skip date column

        const lobName = headers[colIndex];
        if (!lobName || typeof lobName !== "string") continue;

        const value = row[colIndex];
        if (typeof value === "number" && !isNaN(value)) {
          if (!processed[lobName]) {
            processed[lobName] = [];
          }

          processed[lobName].push({
            date: dateValue,
            value: value,
            lob: lobName,
          });
        }
      }
    }

    // Sort data by date for each LOB
    Object.keys(processed).forEach((lob) => {
      processed[lob].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );
    });

    this.cachedData = processed;
    return processed;
  }

  /**
   * Parse date from various formats
   */
  private parseDate(dateValue: any): string {
    if (typeof dateValue === "number") {
      // Excel date serial number
      const date = XLSX.SSF.parse_date_code(dateValue);
      return new Date(date.y, date.m - 1, date.d).toISOString().split("T")[0];
    } else if (typeof dateValue === "string") {
      const parsed = new Date(dateValue);
      if (!isNaN(parsed.getTime())) {
        return parsed.toISOString().split("T")[0];
      }
    }

    // Fallback: use current date
    return new Date().toISOString().split("T")[0];
  }

  /**
   * Generate mock data as fallback
   */
  private generateMockData(): ProcessedData {
    const lobs = [
      "Case Type 1",
      "Case Type 2",
      "Case Type 3",
      "Case Type 4",
      "Case Type 5",
      "Case Type 6",
      "Chat Support",
      "Phone Support",
    ];

    const processed: ProcessedData = {};
    const baseDate = new Date("2022-01-01");

    lobs.forEach((lob) => {
      processed[lob] = [];

      // Generate 24 months of historical data
      for (let i = 0; i < 24; i++) {
        const date = new Date(baseDate);
        date.setMonth(date.getMonth() + i);

        // Base values for each LOB
        const baseValues: { [key: string]: number } = {
          "Case Type 1": 1245,
          "Case Type 2": 987,
          "Case Type 3": 756,
          "Case Type 4": 623,
          "Case Type 5": 432,
          "Case Type 6": 298,
          "Chat Support": 2156,
          "Phone Support": 1834,
        };

        const baseValue = baseValues[lob] || 1000;
        const seasonality =
          Math.sin((i * 2 * Math.PI) / 12) * (baseValue * 0.1);
        const trend = i * (Math.random() * 20 - 10);
        const noise = (Math.random() - 0.5) * (baseValue * 0.05);

        const value = Math.max(
          0,
          Math.round(baseValue + seasonality + trend + noise),
        );

        processed[lob].push({
          date: date.toISOString().split("T")[0],
          value: value,
          lob: lob,
        });
      }
    });

    return processed;
  }

  /**
   * Get available LOBs
   */
  public async getLOBs(): Promise<string[]> {
    const data = await this.loadExcelData();
    return Object.keys(data);
  }

  /**
   * Get historical data for a specific LOB
   */
  public async getHistoricalData(lob: string): Promise<DataPoint[]> {
    const data = await this.loadExcelData();
    return data[lob] || [];
  }

  /**
   * Get all historical data
   */
  public async getAllData(): Promise<ProcessedData> {
    return await this.loadExcelData();
  }

  /**
   * Clear cache to force reload
   */
  public clearCache(): void {
    this.cachedData = null;
  }
}
