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
            <div>
                <h3>${transaction.category}</h3>
                <p>${transaction.description || "No description"}</p>
                <small>${transaction.date}</small>
            </div>

            <strong class="${transaction.type}">
                ${transaction.type === "income" ? "+" : "-"}₹${transaction.amount.toFixed(2)}
            </strong>
        `;

        transactionList.appendChild(transactionItem);
    });
}