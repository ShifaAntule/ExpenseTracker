require("dotenv").config(); // Load environment variables
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors()); // Allow frontend requests

// ✅ Connect to MongoDB
if (!process.env.MONGO_URI) {
    console.error("❌ MONGO_URI not found in environment variables.");
    process.exit(1);
}

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB Connected Successfully"))
.catch((err) => {
    console.error("❌ MongoDB Connection Failed:", err.message);
    process.exit(1);
});

// ✅ Transaction Schema & Model
const TransactionSchema = new mongoose.Schema({
    name: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now }
});

const Transaction = mongoose.model("Transaction", TransactionSchema);

// ✅ Route to Add a Transaction
app.post("/api/transactions", async (req, res) => {
    try {
        const { name, amount } = req.body;
        if (!name || !amount) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const newTransaction = new Transaction({ name, amount });
        await newTransaction.save();
        res.status(201).json({ message: "Transaction saved successfully", transaction: newTransaction });
    } catch (error) {
        console.error("Error saving transaction:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// ✅ Route to Get All Transactions
app.get("/api/transactions", async (req, res) => {
    try {
        const transactions = await Transaction.find().sort({ date: -1 });
        res.json(transactions);
    } catch (error) {
        console.error("Error fetching transactions:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// ✅ Route to Delete a Single Transaction
app.delete("/api/transactions/:id", async (req, res) => {
    try {
        const transaction = await Transaction.findByIdAndDelete(req.params.id);
        if (!transaction) {
            return res.status(404).json({ message: "Transaction not found" });
        }
        res.json({ message: "Transaction deleted" });
    } catch (error) {
        console.error("Error deleting transaction:", error);
        res.status(500).json({ message: "Error deleting transaction" });
    }
});

// ✅ Route to Clear All Transactions
app.delete("/api/transactions", async (req, res) => {
    try {
        await Transaction.deleteMany({});
        res.json({ message: "All transactions deleted" });
    } catch (error) {
        console.error("Error deleting transactions:", error);
        res.status(500).json({ message: "Error deleting transactions" });
    }
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
