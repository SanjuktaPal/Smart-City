//Code for Backend Server 

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost/waste_collection', { useNewUrlParser: true, useUnifiedTopology: true });

// Define WasteBin schema
const WasteBinSchema = new mongoose.Schema({
  binId: String,
  fillLevel: Number,
  latitude: Number,
  longitude: Number,
  timestamp: { type: Date, default: Date.now }
});

const WasteBin = mongoose.model('WasteBin', WasteBinSchema);

app.use(bodyParser.json());

// API endpoint to receive data from IoT devices
app.post('/api/wastebin', async (req, res) => {
  const { binId, fillLevel, latitude, longitude } = req.body;

  try {
    const wasteBin = new WasteBin({
      binId,
      fillLevel,
      latitude,
      longitude
    });

    await wasteBin.save();
    res.status(201).json({ message: 'Data received successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error saving data' });
  }
});

// API endpoint to get waste bin data
app.get('/api/wastebins', async (req, res) => {
  try {
    const wasteBins = await WasteBin.find().sort({ timestamp: -1 });
    res.json(wasteBins);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving data' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
