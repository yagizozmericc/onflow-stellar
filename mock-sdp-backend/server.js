const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.post("/mock-sdp/send", (req, res) => {
  const { destination, amount } = req.body;
  console.log(`Sending ${amount} to ${destination} via SDP...`);
  // Simulate delay and return mock response
  setTimeout(() => {
    res.json({
      success: true,
      txHash: "MOCK_TX_HASH_" + Math.random().toString(36).substring(2, 10).toUpperCase(),
    });
  }, 1000);
});

app.listen(PORT, () => {
  console.log(`🟢 Mock SDP Backend running at http://localhost:${PORT}`);
}); 