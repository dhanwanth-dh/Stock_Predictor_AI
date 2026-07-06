import streamlit as st
import yfinance as yf
import pandas as pd
import numpy as np
import plotly.graph_objects as go
import os
import pickle
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import Sequential, load_model
from tensorflow.keras.layers import LSTM, Dense, Dropout, Bidirectional
from tensorflow.keras.optimizers import Adam
from datetime import datetime, timedelta

st.set_page_config(page_title="AI Stock Genius Pro", layout="wide")
st.title("🤖 AI Stock Genius: Smart Persistent Prediction")

# --- SIDEBAR ---
ticker = st.sidebar.text_input("Enter Ticker (e.g., RELIANCE.NS, TSLA)", "RELIANCE.NS")
force_train = st.sidebar.checkbox("Force Retrain Brain")

def get_clean_data(symbol):
    df = yf.download(symbol, start="2018-01-01", end=datetime.now().strftime('%Y-%m-%d'), auto_adjust=True)
    if df.empty: return None
    if isinstance(df.columns, pd.MultiIndex): df.columns = df.columns.get_level_values(0)
    df['MA20'] = df['Close'].rolling(20).mean()
    df['MA50'] = df['Close'].rolling(50).mean()
    df.dropna(inplace=True)
    return df

# --- MAIN ENGINE ---
if st.sidebar.button("Show Forecast 🚀"):
    df = get_clean_data(ticker)
    
    if df is not None:
        m_file = f"{ticker}_model.keras"
        s_file = f"{ticker}_scaler.pkl"
        
        # FEATURE LIST
        feat_list = ['Close', 'MA20', 'MA50', 'Volume']
        data_vals = df[feat_list].values
        
        # CHECK IF PRE-TRAINED FILE EXISTS
        if os.path.exists(m_file) and not force_train:
            st.success(f"✅ Loaded pre-trained brain for {ticker}")
            model = load_model(m_file)
            with open(s_file, 'rb') as f:
                scaler = pickle.load(f)
            scaled_data = scaler.transform(data_vals)
        else:
            with st.status(f"🧠 New stock/Retrain: Learning {ticker}...", expanded=True) as status:
                scaler = MinMaxScaler(feature_range=(0, 1))
                scaled_data = scaler.fit_transform(data_vals)
                
                X, y = [], []
                for i in range(60, len(scaled_data)):
                    X.append(scaled_data[i-60:i])
                    y.append(scaled_data[i, 0])
                X, y = np.array(X), np.array(y)
                
                model = Sequential([
                    Bidirectional(LSTM(64, return_sequences=True, input_shape=(X.shape[1], X.shape[2]))),
                    Dropout(0.2),
                    LSTM(64),
                    Dense(25),
                    Dense(1)
                ])
                model.compile(optimizer=Adam(learning_rate=0.001), loss='mse')
                model.fit(X, y, epochs=30, batch_size=32, verbose=0)
                
                model.save(m_file)
                with open(s_file, 'wb') as f:
                    pickle.dump(scaler, f)
                status.update(label="Training Complete & Brain Saved!", state="complete")

        # --- PREDICTION ---
        last_60 = scaled_data[-60:].reshape(1, 60, 4)
        future_outputs = []
        for _ in range(7):
            next_val = model.predict(last_60, verbose=0)
            future_outputs.append(next_val[0, 0])
            new_row = last_60[0, -1, :].copy()
            new_row[0] = next_val[0, 0]
            last_60 = np.append(last_60[:, 1:, :], new_row.reshape(1, 1, 4), axis=1)

        dummy = np.zeros((7, 4))
        dummy[:, 0] = future_outputs
        final_preds = scaler.inverse_transform(dummy)[:, 0]

        # --- VISUALS ---
        pred_dates = [df.index[-1] + timedelta(days=i+1) for i in range(7)]
        fig = go.Figure()
        fig.add_trace(go.Scatter(x=df.index[-100:], y=df['Close'].tail(100).values.flatten(), name="History"))
        fig.add_trace(go.Scatter(x=pred_dates, y=final_preds, name="AI Prediction", line=dict(color='orange', width=4)))
        st.plotly_chart(fig, use_container_width=True)
        
        c1, c2 = st.columns(2)
        c1.metric("Current Price", f"₹{float(df['Close'].iloc[-1]):.2f}")
        c2.metric("Predicted (7th Day)", f"₹{float(final_preds[-1]):.2f}")
        
        st.table(pd.DataFrame({'Date': [d.strftime('%Y-%m-%d') for d in pred_dates], 'Price': final_preds}))
    else:
        st.error("Ticker not found!")