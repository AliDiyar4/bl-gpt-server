const express = require('express');
const axios = require('axios');
const path = require('path'); // ✅ Bu eksikti
const app = express();
const PORT = process.env.PORT || 3000; // ✅ Render uyumu için process.env.PORT

// ✅ Public klasörü servis et (OpenAPI dosyası burada olmalı)
app.use(express.static(path.join(__dirname, 'public')));

// 🔥 BL-GPT API Endpointleri 🔥

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
app.get('/rsi/:symbol', (req, res) => {
    const symbol = req.params.symbol.toUpperCase();
    res.json({ coin: symbol, rsi: 58.2 });
});

// MACD
app.get('/macd/:symbol', (req, res) => {
    const symbol = req.params.symbol.toUpperCase();
    res.json({ coin: symbol, macd: 'Pozitif kesişim' });
});

// EMA (9/21)
app.get('/ema/:symbol', (req, res) => {
    const symbol = req.params.symbol.toUpperCase();
    res.json({ coin: symbol, ema9: 124.5, ema21: 122.3 });
});

// Bollinger Band
app.get('/bollinger/:symbol', (req, res) => {
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
app.get('/atr/:symbol', (req, res) => {
    const symbol = req.params.symbol.toUpperCase();
    res.json({ coin: symbol, atr: 3.28 });
});

// Order Book
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
app.get('/volatility/:symbol', (req, res) => {
    const symbol = req.params.symbol.toUpperCase();
    res.json({ coin: symbol, volatility: 'Orta' });
});

// Risk Skoru
app.get('/risk/:symbol', (req, res) => {
    const symbol = req.params.symbol.toUpperCase();
    res.json({ coin: symbol, riskScore: 3.7 });
});

// Temel Analiz
app.get('/fundamentals/:symbol', (req, res) => {
    const symbol = req.params.symbol.toUpperCase();
    res.json({
        coin: symbol,
        summary: 'Proje aktif, son dönemde yüksek hacim ve ortaklık duyuruları var.'
    });
});

// On-Chain Analiz
app.get('/onchain/:symbol', (req, res) => {
    const symbol = req.params.symbol.toUpperCase();
    res.json({
        coin: symbol,
        activeAddresses: 153200,
        whaleHoldingPercent: 42.5
    });
});
// Uygun Coinleri Getir (En güçlü long sinyali olan)
app.get('/analyze/top', async (req, res) => {
    const symbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'LINKUSDT', 'AVAXUSDT', 'MATICUSDT', 'INJUSDT', 'ARUSDT', 'BNBUSDT', 'NEARUSDT']; // örnek liste
    const results = [];

    for (const symbol of symbols) {
        try {
            const [rsiRes, macdRes, emaRes, bollingerRes, fundRes] = await Promise.all([
                axios.get(`http://localhost:${PORT}/rsi/${symbol}`),
                axios.get(`http://localhost:${PORT}/macd/${symbol}`),
                axios.get(`http://localhost:${PORT}/ema/${symbol}`),
                axios.get(`http://localhost:${PORT}/bollinger/${symbol}`),
                axios.get(`http://localhost:${PORT}/fundamentals/${symbol}`)
            ]);

            // Basit skor sistemi
            let score = 0;
            if (rsiRes.data.rsi > 55 && rsiRes.data.rsi < 70) score++;
            if (macdRes.data.macd.toLowerCase().includes('pozitif')) score++;
            if (emaRes.data.ema9 > emaRes.data.ema21) score++;
            if (bollingerRes.data.breakout.toLowerCase().includes('yukarı')) score++;
            if (fundRes.data.summary.toLowerCase().includes('yüksek hacim')) score++;

            results.push({ coin: symbol, score });
        } catch (err) {
            console.error(`❌ ${symbol} analiz edilemedi`, err.message);
        }
    }

    // Skora göre sırala
    results.sort((a, b) => b.score - a.score);
    res.json(results.slice(0, 3)); // ilk 3 öneriyi döndür
});
// 🔥 Gelişmiş Çoklu Gösterge Analizi (12 Göstergeden Geçenler)
app.get('/analyze/full', async (req, res) => {
    const symbols = [
        'BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'AVAXUSDT', 'MATICUSDT',
        'INJUSDT', 'ARUSDT', 'BNBUSDT', 'NEARUSDT', 'LINKUSDT'
    ];

    const results = [];

    for (const symbol of symbols) {
        try {
            const [
                rsiRes, macdRes, emaRes, bollingerRes, atrRes,
                fundingRes, orderRes, volumeRes, volRes,
                riskRes, fundamentalRes, onchainRes
            ] = await Promise.all([
                axios.get(`${req.protocol}://${req.get('host')}/rsi/${symbol}`),
                axios.get(`${req.protocol}://${req.get('host')}/macd/${symbol}`),
                axios.get(`${req.protocol}://${req.get('host')}/ema/${symbol}`),
                axios.get(`${req.protocol}://${req.get('host')}/bollinger/${symbol}`),
                axios.get(`${req.protocol}://${req.get('host')}/atr/${symbol}`),
                axios.get(`${req.protocol}://${req.get('host')}/funding/${symbol}`),
                axios.get(`${req.protocol}://${req.get('host')}/orderbook/${symbol}`),
                axios.get(`${req.protocol}://${req.get('host')}/volume/${symbol}`),
                axios.get(`${req.protocol}://${req.get('host')}/volatility/${symbol}`),
                axios.get(`${req.protocol}://${req.get('host')}/risk/${symbol}`),
                axios.get(`${req.protocol}://${req.get('host')}/fundamentals/${symbol}`),
                axios.get(`${req.protocol}://${req.get('host')}/onchain/${symbol}`)
            ]);

            let longScore = 0;
            let shortScore = 0;
            const reasons = [];

            // RSI
            const rsi = rsiRes.data.rsi;
            if (rsi < 30) { shortScore++; reasons.push('RSI oversold'); }
            else if (rsi > 70) { shortScore++; reasons.push('RSI overbought'); }
            else if (rsi > 55) { longScore++; reasons.push('RSI trend strong'); }

            // MACD
            const macd = macdRes.data.macd.toLowerCase();
            if (macd.includes('pozitif')) { longScore++; reasons.push('MACD pozitif'); }
            else if (macd.includes('negatif')) { shortScore++; reasons.push('MACD negatif'); }

            // EMA
            if (emaRes.data.ema9 > emaRes.data.ema21) { longScore++; reasons.push('EMA 9 > 21'); }
            else { shortScore++; reasons.push('EMA 9 < 21'); }

            // Bollinger
            const breakout = bollingerRes.data.breakout.toLowerCase();
            if (breakout.includes('yukarı')) { longScore++; reasons.push('Bollinger breakout ↑'); }
            else if (breakout.includes('aşağı')) { shortScore++; reasons.push('Bollinger breakout ↓'); }

            // ATR
            if (atrRes.data.atr > 2) { longScore++; reasons.push('ATR volatilite yüksek'); }

            // Funding Rate
            const funding = parseFloat(fundingRes.data.fundingRate);
            if (funding < 0) { longScore++; reasons.push('Funding negatife dönmüş'); }
            else if (funding > 0.02) { shortScore++; reasons.push('Funding çok pozitif'); }

            // Order Book
            if (orderRes.data.bids.length > orderRes.data.asks.length) {
                longScore++; reasons.push('Alış baskısı');
            } else {
                shortScore++; reasons.push('Satış baskısı');
            }

            // Volume
            if (parseFloat(volumeRes.data.volume) > 5000000) {
                longScore++; reasons.push('Yüksek hacim');
            }

            // Volatility
            if (volRes.data.volatility.toLowerCase().includes('yüksek')) {
                longScore++; reasons.push('Volatilite yüksek');
            }

            // Risk Skoru
            const risk = riskRes.data.riskScore;
            if (risk < 3) { longScore++; reasons.push('Risk düşük'); }
            else if (risk > 7) { shortScore++; reasons.push('Risk çok yüksek'); }

            // Temel Analiz
            const summary = fundamentalRes.data.summary.toLowerCase();
            if (summary.includes('yüksek hacim')) { longScore++; reasons.push('Temel analiz pozitif'); }

            // Onchain
            const whale = onchainRes.data.whaleHoldingPercent;
            if (whale > 40) { longScore++; reasons.push('Whale birikimi yüksek'); }

            const totalScore = longScore - shortScore;
            results.push({
                coin: symbol,
                direction: totalScore >= 1 ? 'long' : 'short',
                score: Math.abs(totalScore),
                reasons
            });

        } catch (e) {
            console.error(`❌ ${symbol} hata:`, e.message);
        }
    }

    results.sort((a, b) => b.score - a.score);
    res.json(results.slice(0, 5));
});

app.listen(PORT, () => {
    console.log(`✅ Sunucu çalışıyor: http://localhost:${PORT}`);
});
