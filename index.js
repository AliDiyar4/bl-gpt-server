const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 3000;

app.use(require('cors')());

// Fiyat Verisi
app.get('/price/:symbol', async (req, res) => {
    const symbol = req.params.symbol.toUpperCase();
    try {
        const response = await axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`);
        res.json({ coin: symbol, price: response.data.price });
    } catch {
        res.status(500).json({ error: 'Coin bulunamadı veya Binance API hatası.' });
    }
});

// RSI
app.get('/rsi/:symbol', async (req, res) => {
    const symbol = req.params.symbol.toUpperCase();
    // Sahte değer (örnek), gerçek RSI hesaplaması için veri çekimi gerekir
    res.json({ coin: symbol, rsi: 58.2 });
});

// MACD
app.get('/macd/:symbol', async (req, res) => {
    const symbol = req.params.symbol.toUpperCase();
    res.json({ coin: symbol, macd: 'Pozitif kesişim' });
});

// EMA (9/21)
app.get('/ema/:symbol', async (req, res) => {
    const symbol = req.params.symbol.toUpperCase();
    res.json({ coin: symbol, ema9: 124.5, ema21: 122.3 });
});

// Bollinger Band
app.get('/bollinger/:symbol', async (req, res) => {
    const symbol = req.params.symbol.toUpperCase();
    res.json({
        coin: symbol,
        upper: 130.0,
        middle: 125.0,
        lower: 120.0,
        breakout: 'yukarı'
    });
});

// ATR
app.get('/atr/:symbol', async (req, res) => {
    const symbol = req.params.symbol.toUpperCase();
    res.json({ coin: symbol, atr: 3.28 });
});

// Order Book (Örnek veri)
app.get('/orderbook/:symbol', async (req, res) => {
    const symbol = req.params.symbol.toUpperCase();
    try {
        const response = await axios.get(`https://api.binance.com/api/v3/depth?symbol=${symbol}&limit=5`);
        res.json({ coin: symbol, bids: response.data.bids, asks: response.data.asks });
    } catch {
        res.status(500).json({ error: 'Order book verisi alınamadı.' });
    }
});

// Funding Rate
app.get('/funding/:symbol', async (req, res) => {
    const symbol = req.params.symbol.toUpperCase();
    try {
        const response = await axios.get(`https://fapi.binance.com/fapi/v1/premiumIndex?symbol=${symbol}`);
        res.json({ coin: symbol, fundingRate: response.data.lastFundingRate });
    } catch {
        res.status(500).json({ error: 'Funding rate alınamadı.' });
    }
});

// Hacim
app.get('/volume/:symbol', async (req, res) => {
    const symbol = req.params.symbol.toUpperCase();
    try {
        const response = await axios.get(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`);
        res.json({ coin: symbol, volume: response.data.quoteVolume });
    } catch {
        res.status(500).json({ error: 'Hacim verisi alınamadı.' });
    }
});

// Volatilite
app.get('/volatility/:symbol', async (req, res) => {
    const symbol = req.params.symbol.toUpperCase();
    res.json({ coin: symbol, volatility: 'Orta' }); // Gerçek hesaplama ayrı yapılır
});

// Risk Skoru
app.get('/risk/:symbol', async (req, res) => {
    const symbol = req.params.symbol.toUpperCase();
    res.json({ coin: symbol, riskScore: 3.7 });
});

// Temel Analiz (Örnek veri)
app.get('/fundamentals/:symbol', async (req, res) => {
    const symbol = req.params.symbol.toUpperCase();
    res.json({
        coin: symbol,
        summary: 'Proje aktif, son dönemde yüksek hacim ve ortaklık duyuruları var.'
    });
});

// On-Chain Analiz (Örnek veri)
app.get('/onchain/:symbol', async (req, res) => {
    const symbol = req.params.symbol.toUpperCase();
    res.json({
        coin: symbol,
        activeAddresses: 153200,
        whaleHoldingPercent: 42.5
    });
});

app.listen(PORT, () => {
    console.log(`✅ Sunucu çalışıyor: http://localhost:${PORT}`);
});
