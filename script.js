const transactionForm = document.getElementById("transactionForm");
const transactionList = document.getElementById("transactionList");

let transactions = [];

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

    renderTransactions();
    updateSummary();

transactionForm.reset();
});

function renderTransactions() {

    transactionList.innerHTML = "";

    if (transactions.length === 0) {
        transactionList.innerHTML = `
            <div class="empty-state">
                <h3>No transactions yet</h3>
                <p>Your transactions will appear here.</p>
            </div>
        `;

        return;
    }

    transactions.forEach(function (transaction) {

        const transactionItem = document.createElement("div");

        transactionItem.className = "transaction-item";

        transactionItem.innerHTML = `
    <div class="transaction-info">

        <div>
            <h3>${transaction.category}</h3>
            <p>${transaction.description || "No description"}</p>
            <small>${transaction.date}</small>
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

    renderTransactions();
    updateSummary();
}

function editTransaction(id) {

    const transaction = transactions.find(function (item) {
        return item.id === id;
    });

    if (!transaction) {
        return;
    }

    document.getElementById("type").value = transaction.type;
    document.getElementById("amount").value = transaction.amount;
    document.getElementById("category").value = transaction.category;
    document.getElementById("date").value = transaction.date;
    document.getElementById("description").value = transaction.description;

    transactions = transactions.filter(function (item) {
        return item.id !== id;
    });

    renderTransactions();
    updateSummary();

    document.getElementById("amount").focus();
}