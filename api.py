import os
import pickle
from datetime import datetime, timedelta
from functools import lru_cache

import numpy as np
import pandas as pd
import yfinance as yf
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.layers import Bidirectional, Dense, Dropout, LSTM
from tensorflow.keras.models import Sequential, load_model
from tensorflow.keras.optimizers import Adam


app = FastAPI(title="Stock Predictor Pro API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

TRAIN_START_DATE = "2018-01-01"
LOOKBACK_STEPS = 60
FORECAST_DAYS = 7
FEATURE_COLUMNS = ["Close", "MA20", "MA50", "Volume"]
DEFAULT_TICKERS = [
    "ADANIENT.NS",
    "ADANIPORTS.NS",
    "APOLLOHOSP.NS",
    "ASIANPAINT.NS",
    "AXISBANK.NS",
    "BAJAJ-AUTO.NS",
    "BAJFINANCE.NS",
    "BAJAJFINSV.NS",
    "BPCL.NS",
    "BHARTIARTL.NS",
    "BRITANNIA.NS",
    "CIPLA.NS",
    "COALINDIA.NS",
    "DIVISLAB.NS",
    "DRREDDY.NS",
    "EICHERMOT.NS",
    "GRASIM.NS",
    "HCLTECH.NS",
    "HDFCBANK.NS",
    "HDFCLIFE.NS",
    "HEROMOTOCO.NS",
    "HINDALCO.NS",
    "HINDUNILVR.NS",
    "ICICIBANK.NS",
    "INDUSINDBK.NS",
    "INFY.NS",
    "ITC.NS",
    "JSWSTEEL.NS",
    "KOTAKBANK.NS",
    "LT.NS",
    "LTIM.NS",
    "M&M.NS",
    "MARUTI.NS",
    "NESTLEIND.NS",
    "NTPC.NS",
    "ONGC.NS",
    "POWERGRID.NS",
    "RELIANCE.NS",
    "SBILIFE.NS",
    "SBIN.NS",
    "SUNPHARMA.NS",
    "TATACONSUM.NS",
    "TATASTEEL.NS",
    "TCS.NS",
    "TECHM.NS",
    "TITAN.NS",
    "ULTRACEMCO.NS",
    "UPL.NS",
    "WIPRO.NS",
    "AAPL",
]


def list_available_tickers():
    model_tickers = {
        filename.replace("_model.keras", "")
        for filename in os.listdir(".")
        if filename.endswith("_model.keras")
    }
    return sorted(model_tickers.union(DEFAULT_TICKERS))


def normalize_ticker(ticker: str):
    available = list_available_tickers()
    requested = ticker.strip().upper()
    if requested in available:
        return requested
    if f"{requested}.NS" in available:
        return f"{requested}.NS"
    return requested


def get_clean_data(symbol: str):
    df = yf.download(
        symbol,
        start=TRAIN_START_DATE,
        end=datetime.now().strftime("%Y-%m-%d"),
        auto_adjust=True,
        progress=False,
    )
    if df.empty:
        return None
    if isinstance(df.columns, pd.MultiIndex):
        df.columns = df.columns.get_level_values(0)
    df = df[["Open", "High", "Low", "Close", "Volume"]].copy()
    df["MA20"] = df["Close"].rolling(20).mean()
    df["MA50"] = df["Close"].rolling(50).mean()
    df.dropna(inplace=True)
    return df


def build_training_set(scaled_data: np.ndarray):
    x_train, y_train = [], []
    for index in range(LOOKBACK_STEPS, len(scaled_data)):
        x_train.append(scaled_data[index - LOOKBACK_STEPS : index])
        y_train.append(scaled_data[index, 0])
    return np.array(x_train), np.array(y_train)


def build_model(input_shape):
    model = Sequential(
        [
            Bidirectional(LSTM(64, return_sequences=True, input_shape=input_shape)),
            Dropout(0.2),
            LSTM(64),
            Dense(25),
            Dense(1),
        ]
    )
    model.compile(optimizer=Adam(learning_rate=0.001), loss="mse")
    return model


def train_and_save(symbol: str, df: pd.DataFrame):
    features = df[FEATURE_COLUMNS].values
    scaler = MinMaxScaler(feature_range=(0, 1))
    scaled_data = scaler.fit_transform(features)
    x_train, y_train = build_training_set(scaled_data)

    if len(x_train) == 0:
        raise HTTPException(status_code=400, detail="Not enough data to train the model.")

    model = build_model((x_train.shape[1], x_train.shape[2]))
    model.fit(x_train, y_train, epochs=30, batch_size=32, verbose=0)

    model_path = f"{symbol}_model.keras"
    scaler_path = f"{symbol}_scaler.pkl"
    model.save(model_path)
    with open(scaler_path, "wb") as scaler_file:
        pickle.dump(scaler, scaler_file)

    load_trained_model.cache_clear()
    load_scaler.cache_clear()
    return model, scaler


@lru_cache(maxsize=64)
def load_trained_model(model_path: str):
    return load_model(model_path)


@lru_cache(maxsize=64)
def load_scaler(scaler_path: str):
    with open(scaler_path, "rb") as scaler_file:
        return pickle.load(scaler_file)


def get_or_train_model(symbol: str, df: pd.DataFrame, force_train: bool):
    model_path = f"{symbol}_model.keras"
    scaler_path = f"{symbol}_scaler.pkl"

    if force_train or not (os.path.exists(model_path) and os.path.exists(scaler_path)):
        return train_and_save(symbol, df)

    return load_trained_model(model_path), load_scaler(scaler_path)


def generate_forecast(df: pd.DataFrame, model, scaler):
    scaled_data = scaler.transform(df[FEATURE_COLUMNS].values)
    last_window = scaled_data[-LOOKBACK_STEPS:].reshape(1, LOOKBACK_STEPS, len(FEATURE_COLUMNS))
    predicted_values = []

    for _ in range(FORECAST_DAYS):
        next_value = model.predict(last_window, verbose=0)
        predicted_values.append(next_value[0, 0])
        next_row = last_window[0, -1, :].copy()
        next_row[0] = next_value[0, 0]
        last_window = np.append(last_window[:, 1:, :], next_row.reshape(1, 1, -1), axis=1)

    placeholder = np.zeros((FORECAST_DAYS, len(FEATURE_COLUMNS)))
    placeholder[:, 0] = predicted_values
    forecast_close = scaler.inverse_transform(placeholder)[:, 0]
    forecast_dates = [df.index[-1] + timedelta(days=offset + 1) for offset in range(FORECAST_DAYS)]

    return [
        {"date": forecast_date.strftime("%Y-%m-%d"), "predictedClose": round(float(price), 2)}
        for forecast_date, price in zip(forecast_dates, forecast_close)
    ]


def serialize_frame(df: pd.DataFrame):
    safe_frame = df.replace([np.inf, -np.inf], np.nan).fillna(0)
    rows = []
    for index, row in safe_frame.iterrows():
        rows.append(
            {
                "date": index.strftime("%Y-%m-%d"),
                "open": round(float(row.get("Open", 0)), 2),
                "high": round(float(row.get("High", 0)), 2),
                "low": round(float(row.get("Low", 0)), 2),
                "close": round(float(row.get("Close", 0)), 2),
                "volume": int(float(row.get("Volume", 0))),
                "ma20": round(float(row.get("MA20", 0)), 2),
                "ma50": round(float(row.get("MA50", 0)), 2),
            }
        )
    return rows


def aggregate_history(df: pd.DataFrame, rule: str):
    aggregated = (
        df.resample(rule)
        .agg(
            {
                "Open": "first",
                "High": "max",
                "Low": "min",
                "Close": "last",
                "Volume": "sum",
            }
        )
        .dropna()
    )
    aggregated["MA20"] = aggregated["Close"].rolling(20).mean()
    aggregated["MA50"] = aggregated["Close"].rolling(50).mean()
    return aggregated


def build_timeframe_payload(df: pd.DataFrame):
    five_year_cutoff = pd.Timestamp(datetime.now() - timedelta(days=365 * 5))
    five_year_frame = df[df.index >= five_year_cutoff].copy()

    frames = {
        "daily": df.tail(30).copy(),
        "weekly": aggregate_history(df, "W").tail(52).copy(),
        "monthly": aggregate_history(df, "ME").tail(36).copy(),
        "yearly": aggregate_history(df, "YE").copy(),
        "fiveYears": five_year_frame.copy(),
    }
    return {name: serialize_frame(frame) for name, frame in frames.items()}


def build_summary(df: pd.DataFrame, forecast_rows):
    current_price = float(df["Close"].iloc[-1])
    predicted_price = float(forecast_rows[-1]["predictedClose"])
    price_change = predicted_price - current_price
    yearly_slice = df[df.index >= (df.index.max() - pd.DateOffset(years=1))]

    return {
        "currentPrice": round(current_price, 2),
        "predictedPriceDay7": round(predicted_price, 2),
        "predictedChange": round(price_change, 2),
        "predictedChangePercent": round((price_change / current_price) * 100, 2) if current_price else 0,
        "latestVolume": int(df["Volume"].iloc[-1]),
        "ma20": round(float(df["MA20"].iloc[-1]), 2),
        "ma50": round(float(df["MA50"].iloc[-1]), 2),
        "high52Week": round(float(yearly_slice["High"].max()), 2),
        "low52Week": round(float(yearly_slice["Low"].min()), 2),
        "records": int(len(df)),
    }


@app.get("/")
def root():
    return {
        "message": "Stock Predictor Pro API is running.",
        "docs": "/docs",
        "routes": ["/api/health", "/api/tickers", "/api/stocks/{ticker}"],
    }


@app.get("/api/health")
def health_check():
    return {"status": "ok", "timestamp": datetime.now().isoformat()}


@app.get("/api/tickers")
def get_tickers():
    tickers = list_available_tickers()
    return {
        "count": len(tickers),
        "tickers": tickers,
        "defaultTicker": "RELIANCE.NS" if "RELIANCE.NS" in tickers else tickers[0],
    }


@app.get("/api/stocks/{ticker}")
def get_stock_dashboard(
    ticker: str,
    force_train: bool = Query(default=False, description="Retrain the model before forecasting."),
):
    symbol = normalize_ticker(ticker)
    df = get_clean_data(symbol)
    if df is None or df.empty:
        raise HTTPException(status_code=404, detail=f"No stock data found for {symbol}.")

    model, scaler = get_or_train_model(symbol, df, force_train)
    forecast_rows = generate_forecast(df, model, scaler)

    return {
        "ticker": symbol,
        "generatedAt": datetime.now().isoformat(),
        "summary": build_summary(df, forecast_rows),
        "forecast": forecast_rows,
        "timeframes": build_timeframe_payload(df),
    }
