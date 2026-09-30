const transactionForm = document.getElementById("transactionForm");
const transactionList = document.getElementById("transactionList");

const filterType = document.getElementById("filterType");
const filterCategory = document.getElementById("filterCategory");

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

let editingTransactionId = null;
let currentPage = 1;
const transactionsPerPage = 5;

// Set today's date by default
document.getElementById("date").value =
    new Date().toISOString().split("T")[0];


// ========================================
// Add / Update Transaction
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


    // Update existing transaction
    if (editingTransactionId !== null) {

        const transaction = transactions.find(function (item) {

            return item.id === editingTransactionId;

        });


        if (transaction) {

            transaction.type = type;
            transaction.amount = amount;
            transaction.category = category;
            transaction.date = date;
            transaction.description = description;

        }


        editingTransactionId = null;


        const submitButton =
            transactionForm.querySelector("button[type='submit']");

        submitButton.textContent = "Add Transaction";

    }

    // Add new transaction
    else {

        const transaction = {

            id: Date.now(),
            type: type,
            amount: amount,
            category: category,
            date: date,
            description: description

        };


        transactions.push(transaction);

    }


    saveTransactions();

    renderTransactions();
    updateSummary();
    updateMonthlySummary();
    updateExpenseChart();


    transactionForm.reset();


    // Set today's date again after reset
    document.getElementById("date").value =
        new Date().toISOString().split("T")[0];

});


// ========================================
// Display Transactions
// ========================================

// ========================================
// Display Transactions with Pagination
// ========================================

function renderTransactions() {

    transactionList.innerHTML = `
        <div class="transaction-list"></div>
    `;

    const transactionListContainer =
        transactionList.querySelector(".transaction-list");

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


    // No transactions found
    if (filteredTransactions.length === 0) {

        transactionList.innerHTML = `
            <div class="empty-state">

                <h3>No transactions found</h3>

                <p>
                    Try changing your filters or add a new transaction.
                </p>

            </div>
        `;

        renderPagination(0);

        return;
    }


    // Calculate total pages
    const totalPages =
        Math.ceil(
            filteredTransactions.length /
            transactionsPerPage
        );


    // Make sure current page is valid
    if (currentPage > totalPages) {
        currentPage = totalPages;
    }


    // Calculate starting and ending transaction
    const startIndex =
        (currentPage - 1) *
        transactionsPerPage;

    const endIndex =
        startIndex +
        transactionsPerPage;


    const pageTransactions =
        filteredTransactions.slice(
            startIndex,
            endIndex
        );


    // Display transactions for current page
    pageTransactions.forEach(function (transaction) {

        const transactionItem =
            document.createElement("div");

        transactionItem.className =
            "transaction-item";

        transactionItem.innerHTML = `

            <div class="transaction-info">

                <div>

                    <h3>
                        ${transaction.category}
                    </h3>

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

        transactionListContainer.appendChild(
            transactionItem
        );

    });


    // Update pagination buttons
    renderPagination(totalPages);
}
// ========================================
// Render Pagination
// ========================================

function renderPagination(totalPages) {

    const pagination =
        document.getElementById("pagination");

    pagination.innerHTML = "";


    // Don't show pagination if only one page
    if (totalPages <= 1) {
        return;
    }


    // Previous button
    const previousButton =
        document.createElement("button");

    previousButton.textContent = "←";

    previousButton.disabled =
        currentPage === 1;

    previousButton.addEventListener(
        "click",
        function () {

            if (currentPage > 1) {

                currentPage--;

                renderTransactions();

            }

        }
    );

    pagination.appendChild(previousButton);


    // Page number buttons
    for (
        let page = 1;
        page <= totalPages;
        page++
    ) {

        const pageButton =
            document.createElement("button");

        pageButton.textContent = page;

        if (page === currentPage) {
            pageButton.classList.add("active");
        }


        pageButton.addEventListener(
            "click",
            function () {

                currentPage = page;

                renderTransactions();

            }
        );


        pagination.appendChild(pageButton);

    }


    // Next button
    const nextButton =
        document.createElement("button");

    nextButton.textContent = "→";

    nextButton.disabled =
        currentPage === totalPages;

    nextButton.addEventListener(
        "click",
        function () {

            if (currentPage < totalPages) {

                currentPage++;

                renderTransactions();

            }

        }
    );

    pagination.appendChild(nextButton);
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

        }

        else {

            totalExpenses += transaction.amount;

        }

    });


    const balance =
        totalIncome - totalExpenses;


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


    editingTransactionId = id;


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


    const submitButton =
        transactionForm.querySelector("button[type='submit']");


    submitButton.textContent =
        "Update Transaction";


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

    const currentYear =
        today.getFullYear();

    const currentMonth =
        today.getMonth();


    const monthName =
        today.toLocaleString("default", {
            month: "long"
        });


    document.getElementById("monthTitle").textContent =
        `${monthName} ${currentYear}`;


    let monthlyExpenses = 0;
    let monthlyCount = 0;


    transactions.forEach(function (transaction) {

        const transactionDate =
            new Date(transaction.date);


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


    const categories =
        Object.keys(categoryTotals);


    if (categories.length === 0) {

        expenseChart.innerHTML = `

            <div class="chart-empty">

                <p>
                    No expense data available yet.
                </p>

            </div>

        `;

        return;

    }


    const maxAmount =
        Math.max(...Object.values(categoryTotals));


    categories.forEach(function (category) {

        const amount =
            categoryTotals[category];


        const percentage =
            (amount / maxAmount) * 100;


        const chartItem =
            document.createElement("div");


        chartItem.className =
            "chart-item";


        chartItem.innerHTML = `

            <div class="chart-label">

                <span>
                    ${category}
                </span>

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
    function () {

        currentPage = 1;

        renderTransactions();

    }
);


filterCategory.addEventListener(
    "change",
    function () {

        currentPage = 1;

        renderTransactions();

    }
);