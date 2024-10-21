const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('Frontend')); // Serve static files from 'Frontend' folder

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/nftMarketplace', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// NFT Listing schema
const nftSchema = new mongoose.Schema({
    title: String,
    description: String,
    price: Number,
    royalties: Number,
    listingType: String,
    image: String,
    category: String
});

const Nft = mongoose.model('Nft', nftSchema);

// API routes to create, fetch, update, and delete NFTs

// Create an NFT
app.post('/api/nfts', async (req, res) => {
    try {
        const newNft = new Nft(req.body);
        await newNft.save();
        res.status(201).json(newNft);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Fetch all NFTs (For listing in the frontend)
app.get('/api/nfts', async (req, res) => {
    try {
        const nfts = await Nft.find(); // Fetch from MongoDB instead of using sample data
        res.json(nfts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Fetch a specific NFT by ID
app.get('/api/nfts/:id', async (req, res) => {
    try {
        const nft = await Nft.findById(req.params.id);
        if (!nft) return res.status(404).json({ message: 'NFT not found' });
        res.json(nft);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update an NFT listing
app.put('/api/nfts/:id', async (req, res) => {
    try {
        const updatedNft = await Nft.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedNft) return res.status(404).json({ message: 'NFT not found' });
        res.json(updatedNft);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete an NFT listing
app.delete('/api/nfts/:id', async (req, res) => {
    try {
        const deletedNft = await Nft.findByIdAndDelete(req.params.id);
        if (!deletedNft) return res.status(404).json({ message: 'NFT not found' });
        res.json({ message: 'NFT deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});



// Endpoint to handle purchase and update NFT status
app.post('/api/nfts/buy/:id', async (req, res) => {
    try {
      const nftId = req.params.id;
      const { transactionHash } = req.body;
  
      // Find the NFT and mark it as sold (or update its status)
      const nft = await Nft.findById(nftId);
      if (!nft) return res.status(404).json({ message: 'NFT not found' });
  
      // Assuming you have a "sold" field or similar in your schema to mark it as sold
      nft.sold = true;
      nft.transactionHash = transactionHash;
  
      await nft.save();
      res.json({ message: 'NFT purchase successful', nft });
    } catch (error) {
      res.status(500).json({ message: 'Error processing the purchase', error: error.message });
    }
  });
  

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
