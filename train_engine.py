import yfinance as yf
import pandas as pd
import numpy as np
import pickle
import os
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout, Bidirectional
from tensorflow.keras.optimizers import Adam
from datetime import datetime

# --- CONFIGURATION ---
# Add your NIFTY 50 list here
NIFTY_50 = [
    'ADANIENT.NS', 'ADANIPORTS.NS', 'APOLLOHOSP.NS', 'ASIANPAINT.NS', 'AXISBANK.NS', 
    'BAJAJ-AUTO.NS', 'BAJFINANCE.NS', 'BAJAJFINSV.NS', 'BPCL.NS', 'BHARTIARTL.NS', 
    'BRITANNIA.NS', 'CIPLA.NS', 'COALINDIA.NS', 'DIVISLAB.NS', 'DRREDDY.NS', 
    'EICHERMOT.NS', 'GRASIM.NS', 'HCLTECH.NS', 'HDFCBANK.NS', 'HDFCLIFE.NS', 
    'HEROMOTOCO.NS', 'HINDALCO.NS', 'HINDUNILVR.NS', 'ICICIBANK.NS', 'ITC.NS', 
    'INDUSINDBK.NS', 'INFY.NS', 'JSWSTEEL.NS', 'KOTAKBANK.NS', 'LTIM.NS', 
    'LT.NS', 'M&M.NS', 'MARUTI.NS', 'NTPC.NS', 'NESTLEIND.NS', 'ONGC.NS', 
    'POWERGRID.NS', 'RELIANCE.NS', 'SBILIFE.NS', 'SBIN.NS', 'SUNPHARMA.NS', 
    'TCS.NS', 'TATACONSUM.NS', 'TATAMOTORS.NS', 'TATASTEEL.NS', 'TECHM.NS', 
    'TITAN.NS', 'UPL.NS', 'ULTRACEMCO.NS', 'WIPRO.NS'
] 

def train_and_save(ticker):
    print(f"\nTraining: {ticker}")
    
    # 1. Fetch & Clean
    df = yf.download(ticker, start="2018-01-01", end=datetime.now().strftime('%Y-%m-%d'), auto_adjust=True)
    if df.empty: return
    if isinstance(df.columns, pd.MultiIndex): df.columns = df.columns.get_level_values(0)

    df['MA20'] = df['Close'].rolling(20).mean()
    df['MA50'] = df['Close'].rolling(50).mean()
    df.dropna(inplace=True)
    
    # 2. Features (Close, MA20, MA50, Volume)
    features = df[['Close', 'MA20', 'MA50', 'Volume']].values
    scaler = MinMaxScaler(feature_range=(0, 1))
    scaled_data = scaler.fit_transform(features)
    
    # Save Sc
    with open(f"{ticker}_scaler.pkl", 'wb') as f:
        pickle.dump(scaler, f)

    # 3. Create Windows
    X, y = [], []
    for i in range(60, len(scaled_data)):
        X.append(scaled_data[i-60:i])
        y.append(scaled_data[i, 0])
    X, y = np.array(X), np.array(y)

    # 4. Model Building
    model = Sequential([
        Bidirectional(LSTM(64, return_sequences=True, input_shape=(X.shape[1], X.shape[2]))),
        Dropout(0.2),
        LSTM(64),
        Dense(25),
        Dense(1)
    ])
    model.compile(optimizer=Adam(learning_rate=0.001), loss='mse')
    
    # 5. Train & Save
    model.fit(X, y, epochs=30, batch_size=32, verbose=0)
    model.save(f"{ticker}_model.keras")
    print(f"Model Saved for {ticker}")

# Run the loop
for stock in NIFTY_50:
    train_and_save(stock)
print("\nALL NIFTY 50 MODELS READY!")