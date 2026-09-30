const transactionForm = document.getElementById("transactionForm");
const transactionList = document.getElementById("transactionList");

const filterType = document.getElementById("filterType");
const filterCategory = document.getElementById("filterCategory");

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

document.getElementById("date").value =
    new Date().toISOString().split("T")[0];
// ========================================
// Add Transaction
// ========================================

transactionForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const type = document.getElementById("type").value;
    const amount = Number(document.getElementById("amount").value);
    const category = document.getElementById("category").value;
    const date = document.getElementById("date").value;
    const description = document.getElementById("description").value.trim();


    if (amount <= 0) {
        alert("Please enter a valid amount.");
        return;
    }

    if (!category) {
        alert("Please select a category.");
        return;
    }

    if (!date) {
        alert("Please select a date.");
        return;
    }


    const transaction = {
        id: Date.now(),
        type: type,
        amount: amount,
        category: category,
        date: date,
        description: description
    };


    transactions.push(transaction);

    saveTransactions();

    renderTransactions();
    updateSummary();
    updateMonthlySummary();
    updateExpenseChart();

    transactionForm.reset();
});


// ========================================
// Display Transactions
// ========================================

function renderTransactions() {

    transactionList.innerHTML = "";

    const selectedType = filterType.value;
    const selectedCategory = filterCategory.value;


    const filteredTransactions = transactions.filter(function (transaction) {

        const matchesType =
            selectedType === "all" ||
            transaction.type === selectedType;

        const matchesCategory =
            selectedCategory === "all" ||
            transaction.category === selectedCategory;

        return matchesType && matchesCategory;
    });


    if (filteredTransactions.length === 0) {

        transactionList.innerHTML = `
            <div class="empty-state">
                <h3>No transactions found</h3>
                <p>Try changing your filters or add a new transaction.</p>
            </div>
        `;

        return;
    }


    filteredTransactions.forEach(function (transaction) {

        const transactionItem = document.createElement("div");

        transactionItem.className = "transaction-item";


        transactionItem.innerHTML = `
            <div class="transaction-info">

                <div>
                    <h3>${transaction.category}</h3>

                    <p>
                        ${transaction.description || "No description"}
                    </p>

                    <small>
                        ${transaction.date}
                    </small>
                </div>

                <strong class="${transaction.type}">
                    ${transaction.type === "income" ? "+" : "-"}₹${transaction.amount.toFixed(2)}
                </strong>

            </div>


            <div class="transaction-actions">

                <button
                    class="edit-btn"
                    onclick="editTransaction(${transaction.id})"
                >
                    Edit
                </button>

                <button
                    class="delete-btn"
                    onclick="deleteTransaction(${transaction.id})"
                >
                    Delete
                </button>

            </div>
        `;


        transactionList.appendChild(transactionItem);
    });
}


// ========================================
// Update Summary
// ========================================

function updateSummary() {

    let totalIncome = 0;
    let totalExpenses = 0;


    transactions.forEach(function (transaction) {

        if (transaction.type === "income") {

            totalIncome += transaction.amount;

        } else {

            totalExpenses += transaction.amount;

        }

    });


    const balance = totalIncome - totalExpenses;


    document.getElementById("income").textContent =
        `₹${totalIncome.toFixed(2)}`;

    document.getElementById("expenses").textContent =
        `₹${totalExpenses.toFixed(2)}`;

    document.getElementById("balance").textContent =
        `₹${balance.toFixed(2)}`;
}


// ========================================
// Delete Transaction
// ========================================

function deleteTransaction(id) {

    const confirmed = confirm(
        "Are you sure you want to delete this transaction?"
    );


    if (!confirmed) {
        return;
    }


    transactions = transactions.filter(function (transaction) {

        return transaction.id !== id;

    });


    saveTransactions();

    renderTransactions();
    updateSummary();
    updateMonthlySummary();
    updateExpenseChart();
}


// ========================================
// Edit Transaction
// ========================================

function editTransaction(id) {

    const transaction = transactions.find(function (item) {

        return item.id === id;

    });


    if (!transaction) {
        return;
    }


    document.getElementById("type").value =
        transaction.type;

    document.getElementById("amount").value =
        transaction.amount;

    document.getElementById("category").value =
        transaction.category;

    document.getElementById("date").value =
        transaction.date;

    document.getElementById("description").value =
        transaction.description;


    transactions = transactions.filter(function (item) {

        return item.id !== id;

    });


    saveTransactions();

    renderTransactions();
    updateSummary();
    updateMonthlySummary();
    updateExpenseChart();


    document.getElementById("amount").focus();
}


// ========================================
// Save Transactions
// ========================================

function saveTransactions() {

    localStorage.setItem(
        "transactions",
        JSON.stringify(transactions)
    );
}


// ========================================
// Monthly Summary
// ========================================

function updateMonthlySummary() {

    const today = new Date();

    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();


    const monthName = today.toLocaleString("default", {
        month: "long"
    });


    document.getElementById("monthTitle").textContent =
        `${monthName} ${currentYear}`;


    let monthlyExpenses = 0;
    let monthlyCount = 0;


    transactions.forEach(function (transaction) {

        const transactionDate = new Date(transaction.date);


        if (
            transaction.type === "expense" &&
            transactionDate.getFullYear() === currentYear &&
            transactionDate.getMonth() === currentMonth
        ) {

            monthlyExpenses += transaction.amount;

            monthlyCount++;
        }

    });


    document.getElementById("monthlyExpenses").textContent =
        `₹${monthlyExpenses.toFixed(2)}`;

    document.getElementById("monthlyCount").textContent =
        monthlyCount;
}


// ========================================
// Expense Chart
// ========================================

function updateExpenseChart() {

    const expenseChart =
        document.getElementById("expenseChart");


    const categoryTotals = {};


    transactions.forEach(function (transaction) {

        if (transaction.type === "expense") {

            if (!categoryTotals[transaction.category]) {

                categoryTotals[transaction.category] = 0;

            }

            categoryTotals[transaction.category] +=
                transaction.amount;
        }

    });


    expenseChart.innerHTML = "";


    const categories = Object.keys(categoryTotals);


    if (categories.length === 0) {

        expenseChart.innerHTML = `
            <div class="chart-empty">
                <p>No expense data available yet.</p>
            </div>
        `;

        return;
    }


    const maxAmount =
        Math.max(...Object.values(categoryTotals));


    categories.forEach(function (category) {

        const amount = categoryTotals[category];


        const percentage =
            (amount / maxAmount) * 100;


        const chartItem =
            document.createElement("div");


        chartItem.className = "chart-item";


        chartItem.innerHTML = `
            <div class="chart-label">

                <span>${category}</span>

                <strong>
                    ₹${amount.toFixed(2)}
                </strong>

            </div>

            <div class="chart-bar-background">

                <div
                    class="chart-bar"
                    style="width: ${percentage}%"
                ></div>

            </div>
        `;


        expenseChart.appendChild(chartItem);

    });
}


// ========================================
// Initial Page Load
// ========================================

renderTransactions();

updateSummary();

updateMonthlySummary();

updateExpenseChart();


// ========================================
// Filters
// ========================================

filterType.addEventListener(
    "change",
    renderTransactions
);

filterCategory.addEventListener(
    "change",
    renderTransactions
);