const addBtn = document.getElementById("addBtn");
const expenseList = document.getElementById("expenseList");
const totalText = document.getElementById("totalText");

async function renderExpenses() {

    const transactions =
        await loadTransactions();

    expenseList.innerHTML = "";

    let total = 0;

    transactions.forEach((transaction) => {

        if(transaction.type === "income"){

    total += transaction.amount;

} else {

    total -= transaction.amount;
}

        const li = document.createElement("li");

      const color =
    transaction.type === "income"
        ? "green"
        : "red";

li.innerHTML = `
    <span style="color:${color}; font-weight:bold;">
        ${transaction.category} |
        ${transaction.description} |
        ${transaction.amount} ₹
    </span>

    <button
        class="deleteBtn"
        data-id="${transaction._id}">
        Delete
    </button>
`;


const deleteBtn =
    li.querySelector(".deleteBtn");

deleteBtn.addEventListener(
    "click",
    async () => {

        const token =
            localStorage.getItem("token");

        await fetch(
            `${API_URL}/transactions/${transaction._id}`,
            {
                method: "DELETE",

                headers: {
                    Authorization:
                        `Bearer ${token}`
                }
            }
        );

        await renderExpenses();
    }
);

        expenseList.appendChild(li);

    });

   totalText.textContent =
    `Current Balance: ${total} ₹`
}

addBtn.addEventListener("click", async () => {

    const name =
        document.getElementById("expenseName").value;

    const amount =
        Number(
            document.getElementById("expenseAmount").value
        );

    const category =
        document.getElementById("expenseCategory").value;

        const type =
    document.getElementById(
        "transactionType"
    ).value;


    if (name === "" || amount <= 0) {

        alert("Enter valid data");

        return;
    }

    await createTransaction(
        name,
        amount,
        category,
        type
    );

    document.getElementById("expenseName").value = "";
    document.getElementById("expenseAmount").value = "";

    await renderExpenses();
});

renderExpenses();