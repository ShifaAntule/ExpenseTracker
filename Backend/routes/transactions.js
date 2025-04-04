const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');

// GET all transactions
router.get('/', async (req, res) => {
    try {
        const transactions = await Transaction.find();
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET a single transaction by ID
router.get('/:id', async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);
        if (!transaction) return res.status(404).json({ message: "Transaction not found" });
        res.json(transaction);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST a new transaction with validation
router.post('/', async (req, res) => {
    console.log("Incoming POST request:", req.body);  // Debug log

    const { amount, category } = req.body;

    // Validate input
    if (!amount || !category) {
        return res.status(400).json({ message: "Amount and category are required" });
    }

    const newTransaction = new Transaction({ amount, category });

    try {
        const savedTransaction = await newTransaction.save();
        console.log("Transaction saved:", savedTransaction); // Debug log
        res.status(201).json(savedTransaction);
    } catch (error) {
        console.error("Error saving transaction:", error);
        res.status(400).json({ message: error.message });
    }
});

// UPDATE a transaction with validation
router.put('/:id', async (req, res) => {
    try {
        const { amount, category } = req.body;
        
        // Validate input
        if (!amount || !category) {
            return res.status(400).json({ message: "Amount and category are required" });
        }

        const updatedTransaction = await Transaction.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true } // Ensure validation rules apply
        );

        if (!updatedTransaction) return res.status(404).json({ message: "Transaction not found" });
        res.json(updatedTransaction);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE a transaction by ID
router.delete('/:id', async (req, res) => {
    try {
        const deletedTransaction = await Transaction.findByIdAndDelete(req.params.id);
        if (!deletedTransaction) return res.status(404).json({ message: "Transaction not found" });
        res.json({ message: "Transaction deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
