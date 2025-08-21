# Requirements Document

## Introduction

This feature will transform the existing forecasting chatbot from using mock data to utilizing real historical time series data from an Excel file (new_df_eval.xlsx). The system will implement proper forecasting algorithms (Prophet, ARIMA, LSTM) and provide accurate metrics including MAPE calculations. The chatbot will maintain its agentic approach while delivering real-time forecasting analysis with progress indicators.

## Requirements

### Requirement 1

**User Story:** As a business analyst, I want the system to read and process real Excel data with Date, Value, and LoB columns, so that I can perform forecasting on actual historical data instead of mock data.

#### Acceptance Criteria

1. WHEN the system starts THEN it SHALL automatically load and parse the new_df_eval.xlsx file
2. WHEN parsing the Excel file THEN the system SHALL extract Date, Value, and LoB columns correctly
3. WHEN processing the data THEN the system SHALL validate date formats and numeric values
4. IF data validation fails THEN the system SHALL log errors and continue with valid data points
5. WHEN data is loaded THEN the system SHALL organize data by unique LoB values for time series analysis

### Requirement 2

**User Story:** As a data scientist, I want the system to implement real forecasting algorithms (Prophet, ARIMA, LSTM), so that I can generate accurate predictions instead of random data.

#### Acceptance Criteria

1. WHEN a user requests a forecast THEN the system SHALL use the specified algorithm (Prophet, ARIMA, or LSTM)
2. WHEN Prophet model is selected THEN the system SHALL handle seasonality, trends, and holidays appropriately
3. WHEN ARIMA model is selected THEN the system SHALL perform stationarity tests and parameter optimization
4. WHEN LSTM model is selected THEN the system SHALL implement proper sequence preparation and neural network training
5. WHEN no model is specified THEN the system SHALL default to Prophet algorithm
6. WHEN forecasting THEN the system SHALL generate confidence intervals for predictions

### Requirement 3

**User Story:** As a business user, I want to see real-time progress indicators during forecasting, so that I understand what the system is doing when processing takes time.

#### Acceptance Criteria

1. WHEN a forecast request is initiated THEN the system SHALL display "Analyzing historical data..." message
2. WHEN model training begins THEN the system SHALL show "Training [model_name] model..." progress indicator
3. WHEN generating predictions THEN the system SHALL display "Generating forecasts..." message
4. WHEN calculating metrics THEN the system SHALL show "Calculating accuracy metrics..." indicator
5. WHEN forecast is complete THEN the system SHALL display the final chart and metrics

### Requirement 4

**User Story:** As an analyst, I want the system to calculate accurate MAPE (Mean Absolute Percentage Error) and other metrics, so that I can assess forecast quality objectively.

#### Acceptance Criteria

1. WHEN generating forecasts THEN the system SHALL calculate MAPE using actual vs predicted values from historical data
2. WHEN calculating MAPE THEN the system SHALL handle zero values appropriately to avoid division errors
3. WHEN displaying metrics THEN the system SHALL show MAPE, RMSE, and MAE with appropriate precision
4. WHEN MAPE is calculated THEN the system SHALL use cross-validation or holdout validation for accuracy
5. WHEN metrics are poor (MAPE > 20%) THEN the system SHALL suggest alternative models or data preprocessing

### Requirement 5

**User Story:** As a business user, I want the chatbot to derive LoB information and statistics from the Excel data, so that responses are based on actual data rather than hardcoded values.

#### Acceptance Criteria

1. WHEN the chatbot provides LoB summaries THEN it SHALL use actual case counts from the Excel data
2. WHEN displaying trends THEN the system SHALL calculate real growth rates from historical data
3. WHEN showing total cases THEN the system SHALL sum actual values from the Excel file
4. WHEN providing LoB comparisons THEN the system SHALL use real data for rankings and percentages
5. WHEN data is updated THEN the chatbot responses SHALL reflect the new information automatically

### Requirement 6

**User Story:** As a user, I want forecasts to default to 12 weeks horizon with actual vs forecast visualization, so that I can see meaningful predictions in a standard business timeframe.

#### Acceptance Criteria

1. WHEN no forecast horizon is specified THEN the system SHALL default to 12 weeks
2. WHEN displaying forecasts THEN the system SHALL show both actual historical data and predicted values
3. WHEN rendering charts THEN the system SHALL clearly distinguish between actual and forecast data with different colors/styles
4. WHEN showing confidence intervals THEN the system SHALL display upper and lower bounds as shaded areas
5. WHEN forecast period extends beyond available data THEN the system SHALL clearly mark the prediction boundary

### Requirement 7

**User Story:** As a developer, I want the system to handle Excel file processing efficiently with proper error handling, so that the application remains stable and performant.

#### Acceptance Criteria

1. WHEN loading Excel files THEN the system SHALL use streaming or chunked processing for large files
2. WHEN Excel parsing fails THEN the system SHALL provide meaningful error messages to users
3. WHEN data is missing or corrupted THEN the system SHALL continue processing valid records
4. WHEN memory usage is high THEN the system SHALL implement data pagination or lazy loading
5. WHEN file format is incorrect THEN the system SHALL validate and reject unsupported formats gracefully