// Get elements
const incomeInput = document.getElementById("income");
const setIncomeBtn = document.getElementById("set-income");
const balanceDisplay = document.getElementById("balance");
const incomeAmountDisplay = document.getElementById("income-amount");
const expenseAmountDisplay = document.getElementById("expense-amount");
const descInput = document.getElementById("desc");
const amountInput = document.getElementById("amount");
const addTransactionBtn = document.getElementById("add-btn");
const transactionList = document.getElementById("transaction-list");
const showHistoryBtn = document.getElementById("show-history");
const clearTransactionsBtn = document.getElementById("clear-transactions");

let income = localStorage.getItem("income") ? parseFloat(localStorage.getItem("income")) : 0;

// Display stored values on page load
window.onload = async () => {
    updateUI();
    await fetchTransactions();
};

// Set income function
setIncomeBtn.addEventListener("click", () => {
    income = parseFloat(incomeInput.value) || 0;
    localStorage.setItem("income", income);
    updateUI();
});

// Add transaction function
addTransactionBtn.addEventListener("click", async () => {
    const name = descInput.value.trim();
    const amount = parseFloat(amountInput.value);

    if (!name || isNaN(amount) || amount <= 0) {
        alert("Please enter a valid transaction.");
        return;
    }

    try {
        const response = await fetch("http://localhost:5000/api/transactions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, amount }),
        });

        if (!response.ok) {
            throw new Error("Failed to add transaction.");
        }

        descInput.value = "";
        amountInput.value = "";

        alert("Transaction Added!");
        await fetchTransactions(); // Refresh transaction list
        updateUI(); // Update balance
    } catch (error) {
        console.error("Error:", error);
        alert("Transaction could not be added. Please check your server.");
    }
});

// Fetch transactions from MongoDB
async function fetchTransactions() {
    try {
        const response = await fetch("http://localhost:5000/api/transactions");
        if (!response.ok) throw new Error("Failed to fetch transactions");

        const transactions = await response.json();
        transactionList.innerHTML = "";

        if (transactions.length === 0) {
            transactionList.innerHTML = "<p>No transactions found.</p>";
            return;
        }

        let totalExpenses = 0;

        transactions.forEach(transaction => {
            totalExpenses += transaction.amount;

            const listItem = document.createElement("li");
            listItem.textContent = `${transaction.name} - $${transaction.amount} - ${new Date(transaction.date).toLocaleDateString()}`;

            // Delete button
            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "❌";
            deleteBtn.onclick = () => deleteTransaction(transaction._id);

            listItem.appendChild(deleteBtn);
            transactionList.appendChild(listItem);
        });

        localStorage.setItem("expenses", totalExpenses);
        updateUI();
    } catch (error) {
        console.error("Error fetching transactions:", error);
        alert("Error fetching transactions. Check the console for details.");
    }
}

// Delete a transaction
async function deleteTransaction(id) {
    if (!confirm("Are you sure you want to delete this transaction?")) return;

    try {
        const response = await fetch(`http://localhost:5000/api/transactions/${id}`, { method: "DELETE" });

        if (!response.ok) {
            throw new Error("Failed to delete transaction.");
        }

        await fetchTransactions();
    } catch (error) {
        console.error("Error:", error);
        alert("Could not delete transaction.");
    }
}

// Clear all transactions
clearTransactionsBtn.addEventListener("click", async () => {
    if (!confirm("Are you sure you want to clear all transactions?")) return;

    try {
        await fetch("http://localhost:5000/api/transactions", { method: "DELETE" });

        localStorage.removeItem("expenses");
        await fetchTransactions();
    } catch (error) {
        console.error("Error:", error);
        alert("Failed to clear transactions.");
    }
});

// Update UI function
function updateUI() {
    let expenses = localStorage.getItem("expenses") ? parseFloat(localStorage.getItem("expenses")) : 0;
    let balance = income - expenses;

    balanceDisplay.textContent = `$${balance}`;
    incomeAmountDisplay.textContent = `$${income}`;
    expenseAmountDisplay.textContent = `$${expenses}`;
}

// Show Transaction History button event
showHistoryBtn.addEventListener("click", fetchTransactions);
