const token = localStorage.getItem("token");

if (!token) {
    window.location = "login.html";
}

const filterCategory =

    document.getElementById(
        "filterCategory"
    );

const addBtn = document.getElementById("addBtn");

const undoBtn =
    document.getElementById(
        "undoBtn"
    );

const redoBtn =
    document.getElementById(
        "redoBtn"
    );

let editingTransactionId = null;

let undoStack = [];

let redoStack = [];

const expenseList = document.getElementById("expenseList");

const totalText = document.getElementById("totalText");

const budgetInput =
    document.getElementById(
        "budgetInput"
    );

const saveBudgetBtn =
    document.getElementById(
        "saveBudgetBtn"
    );

    async function renderExpenses() {

    const transactions =
        await loadTransactions();

    const filterCategory =
        document.getElementById(
            "filterCategory"
        );

    const expenseCategory =
    document.getElementById(
        "expenseCategory"
    );

const uniqueCategories =
    [...expenseCategory.options]
        .map(
            option => option.value
        );

        console.log(uniqueCategories);

    const currentSelection =
    filterCategory.value || "All";

filterCategory.innerHTML =
    `
    <option value="All">
        All Categories
    </option>
    `;

uniqueCategories.forEach(
    category => {

        filterCategory.innerHTML +=
        `
        <option value="${category}">
            ${category}
        </option>
        `;
    }
);

filterCategory.value =
    currentSelection;

    expenseList.innerHTML = "";

    let total = 0;

    let income = 0;

let expenses = 0;

let largestExpense = null;

let recentTransaction = null;

let monthlyIncome = 0;

let monthlyExpenses = 0;

const currentDate =
    new Date();

const currentMonth =
    currentDate.getMonth();

const currentYear =
    currentDate.getFullYear();

const categoryTotals = {};

const monthNames = [
    "Jan","Feb","Mar",
    "Apr","May","Jun",
    "Jul","Aug","Sep",
    "Oct","Nov","Dec"
];

const trendIncome =
    [0,0,0,0,0,0];

const trendExpenses =
    [0,0,0,0,0,0];

const trendLabels = [];

for(let i = 5; i >= 0; i--) {

    const d = new Date();

    d.setMonth(
        d.getMonth() - i
    );

    trendLabels.push(
        monthNames[
            d.getMonth()
        ]
    );
}

    transactions.forEach((transaction) => {

        const selectedCategory =
    document.getElementById(
        "filterCategory"
    ).value;

const selectedType =
    document.getElementById(
        "filterType"
    ).value;

if(

    selectedCategory !== "All"

    &&

    transaction.category !==
    selectedCategory

) {

    return;
}

if(

    selectedType !== "All"

    &&

    transaction.type !==
    selectedType

) {

    return;
}

        const transactionDate =
    new Date(transaction.date);

const monthsDifference =

    (currentYear -
        transactionDate.getFullYear()) * 12

    +

    (currentMonth -
        transactionDate.getMonth());

if(
    monthsDifference >= 0 &&
    monthsDifference < 6
) {

    const index =
        5 - monthsDifference;

    if(
        transaction.type ===
        "income"
    ) {

        trendIncome[index] +=
            transaction.amount;

    } else {

        trendExpenses[index] +=
            transaction.amount;
    }
}

        if(
    !recentTransaction ||

    new Date(transaction.date) >
    new Date(recentTransaction.date)
) {

    recentTransaction =
        transaction;
}

const transactionMonth =
    transactionDate.getMonth();

const transactionYear =
    transactionDate.getFullYear();

const isCurrentMonth =
    transactionMonth === currentMonth &&
    transactionYear === currentYear;

        if(transaction.type === "income") {

    income += transaction.amount;

    total += transaction.amount;

    if(isCurrentMonth) {

        monthlyIncome +=
            transaction.amount;
    }

} else {

    expenses += transaction.amount;

    if(
    !largestExpense ||
    transaction.amount >
    largestExpense.amount
) {

    largestExpense = transaction;
}

    total -= transaction.amount;

    if(isCurrentMonth) {

        monthlyExpenses +=
            transaction.amount;
    }

    if(!categoryTotals[transaction.category]) {

        categoryTotals[transaction.category] = 0;
    }

    categoryTotals[transaction.category] +=
        transaction.amount;
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

    <div class="actionButtons">

    <button
        class="editBtn"
        data-id="${transaction._id}">
        Edit
    </button>

    <button
        class="deleteBtn"
        data-id="${transaction._id}">
        Delete
    </button>

</div>
`;

const editBtn =
    li.querySelector(".editBtn");

editBtn.addEventListener(
    "click",
    () => {

        console.log("EDIT CLICKED");
        console.log(transaction._id);

        editingTransactionId =
            transaction._id;

        document.getElementById(
            "expenseName"
        ).value =
            transaction.description;

        document.getElementById(
            "expenseAmount"
        ).value =
            transaction.amount;

        document.getElementById(
            "expenseCategory"
        ).value =
            transaction.category;

        document.getElementById(
            "transactionType"
        ).value =
            transaction.type;

        addBtn.textContent =
            "Save Changes";
    }
);

const deleteBtn =
    li.querySelector(".deleteBtn");

deleteBtn.addEventListener(
    "click",
    async () => {

        const token =
            localStorage.getItem("token");

            undoStack.push({

    action: "delete",

    transaction: transaction
});

console.log(
    "UNDO PUSHED",
    undoStack
);

redoStack = [];

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

        expenseList.prepend(li);

    });

   totalText.textContent =
    `Current Balance: ${total} ₹`

    let topCategory = "-";
let highestAmount = 0;

for(const category in categoryTotals) {

    if(categoryTotals[category] > highestAmount) {

        highestAmount =
            categoryTotals[category];

        topCategory =
            category;
    }
}

document.getElementById(
    "topCategoryText"
).textContent =
    `Top Category: ${topCategory}`;

    document.getElementById(
    "transactionCountText"
).textContent =
    `Transactions: ${transactions.length}`;

    document.getElementById(
    "largestExpenseText"
).textContent =

largestExpense

? `Largest Expense: ${largestExpense.description} (${largestExpense.amount} ₹)`

: "Largest Expense: -";

document.getElementById(
    "recentTransactionText"
).textContent =

recentTransaction

? `Recent: ${recentTransaction.description}`

: "Recent Transaction: -";

    drawChart(transactions);

    document.getElementById(
    "incomeText"
).textContent =
    `Income: ${income} ₹`;

document.getElementById(
    "expenseText"
).textContent =
    `Expenses: ${expenses} ₹`;

document.getElementById(
    "savingsText"
).textContent =
    `Savings: ${income - expenses} ₹`;

    document.getElementById(
    "monthlyIncomeText"
).textContent =
    `This Month Income: ${monthlyIncome} ₹`;

document.getElementById(
    "monthlyExpenseText"
).textContent =
    `This Month Expenses: ${monthlyExpenses} ₹`;

document.getElementById(
    "monthlySavingsText"
).textContent =
    `This Month Savings: ${
        monthlyIncome - monthlyExpenses
    } ₹`;

    const savingsRate =

    monthlyIncome > 0

        ? Math.round(
            (
                (monthlyIncome - monthlyExpenses)
                / monthlyIncome
            ) * 100
        )

        : 0;

document.getElementById(
    "monthlySavingsRateText"
).textContent =
    `Savings Rate: ${savingsRate}%`;

    const budget = Number(
    localStorage.getItem(
        "monthlyBudget"
    )
) || 0;

const remainingBudget =
    budget - monthlyExpenses;

const budgetUsed =

    budget > 0

        ? Math.round(
            (
                monthlyExpenses /
                budget
            ) * 100
        )

        : 0;

document.getElementById(
    "budgetText"
).textContent =
    `Budget: ${budget} ₹`;

document.getElementById(
    "remainingBudgetText"
).textContent =
    `Remaining: ${remainingBudget} ₹`;

document.getElementById(
    "budgetUsageText"
).textContent =
    `Used: ${budgetUsed}%`;

    const progressBar =

    document.getElementById(
        "budgetProgress"
    );

progressBar.style.width =
    `${Math.min(
        budgetUsed,
        100
    )}%`;

    const budgetStatus =

    document.getElementById(
        "budgetStatus"
    );

if(budgetUsed >= 100) {

    progressBar.style.background =
        "#ef4444";

    budgetStatus.textContent =
        "🚨 Budget Exceeded";

} else if(budgetUsed >= 80) {

    progressBar.style.background =
        "#f59e0b";

    budgetStatus.textContent =
        "⚠ Approaching Budget Limit";

} else {

    progressBar.style.background =
        "#22c55e";

    budgetStatus.textContent =
        "✓ Budget On Track";
}

    drawMonthlyChart(
    monthlyIncome,
    monthlyExpenses
);

drawTrendChart(
    trendLabels,
    trendIncome,
    trendExpenses
);

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

    console.log("editingTransactionId =", editingTransactionId);
   if(editingTransactionId) {

    console.log("UPDATE MODE");

    const transactions =
    await loadTransactions();

const oldTransaction =
    transactions.find(
        t =>
        t._id ===
        editingTransactionId
    );

undoStack.push({

    action: "edit",

    oldTransaction:
        oldTransaction
});

redoStack = [];

    await updateTransaction(
        editingTransactionId,
        name,
        amount,
        category,
        type
    );

    console.log("UPDATE FINISHED");

    editingTransactionId = null;

    addBtn.textContent = "Add Transaction";

} else {

    console.log("CREATE MODE");

    const createdTransaction =
    await createTransaction(
        name,
        amount,
        category,
        type
    );

undoStack.push({

    action: "add",

    transaction:
        createdTransaction
});

redoStack = [];
}

    document.getElementById("expenseName").value = "";
    document.getElementById("expenseAmount").value = "";

    await renderExpenses();
});

renderExpenses();

const logoutBtn =
    document.getElementById("logoutBtn");

logoutBtn.addEventListener("click", () => {

    localStorage.removeItem("token");

    window.location = "home.html";

});

let chart;

function drawChart(transactions) {

    const categoryTotals = {};

    transactions.forEach(transaction => {

        if(transaction.type === "expense") {

            if(!categoryTotals[transaction.category]) {

                categoryTotals[transaction.category] = 0;

            }

            categoryTotals[transaction.category] +=
                transaction.amount;
        }
    });

    const labels =
        Object.keys(categoryTotals);

    const values =
        Object.values(categoryTotals);

    const ctx =
        document
            .getElementById("expenseChart")
            .getContext("2d");

    if(chart) {

        chart.destroy();

    }

    chart = new Chart(ctx, {

        type: "doughnut",

        data: {

            labels: labels,

            datasets: [{

                data: values

            }]
        }
    });
}

function updateDateTime() {

    const now = new Date();

    document.getElementById(
        "dateTime"
    ).textContent =

        now.toLocaleString();
}

updateDateTime();

setInterval(
    updateDateTime,
    1000
);

function drawMonthlyChart(
    monthlyIncome,
    monthlyExpenses
) {

    const ctx =
        document.getElementById(
            "monthlyChart"
        );

    if(window.monthlyChartInstance) {

        window.monthlyChartInstance.destroy();
    }

    window.monthlyChartInstance =
        new Chart(ctx, {

            type: "bar",

            data: {

                labels: [
                    "Income",
                    "Expenses"
                ],

                datasets: [{
    label: "Amount",

    data: [
        monthlyIncome,
        monthlyExpenses
    ],

    backgroundColor: [
        "#22c55e",
        "#ef4444"
    ],
    
    barPercentage: 0.6,
categoryPercentage: 0.7,

}]
            },

           options: {

    responsive: true,

    maintainAspectRatio: false,

    plugins: {

    legend: {

        display: false
    },

    tooltip: {

        titleFont: {

            size: 18
        },

        bodyFont: {

            size: 18
        }
    }
},

    scales: {

    y: {

        beginAtZero: true,

        ticks: {

            stepSize: 10000,

            font: {

                size: 25
            }
        }
    },

    x: {

        ticks: {

            font: {

                size: 25
            }
        }
    }
}
}
        });
}

function drawTrendChart(
    labels,
    incomeData,
    expenseData
) {

    const ctx =
        document.getElementById(
            "trendChart"
        );

    if(window.trendChartInstance) {

        window.trendChartInstance.destroy();
    }

    window.trendChartInstance =
        new Chart(ctx, {

            type: "line",

            data: {

                labels,

                datasets: [

                    {
                        label: "Income",

                        data: incomeData,

                        borderColor: "#22c55e",

                        tension: 0.3
                    },

                    {
                        label: "Expenses",

                        data: expenseData,

                        borderColor: "#ef4444",

                        tension: 0.3
                    }
                ]
            },

            options: {

    responsive: true,

    maintainAspectRatio: false,

    interaction: {
        mode: "index",
        intersect: false
    },

    plugins: {

        legend: {

            labels: {

                font: {

                    size: 25
                }
            }
        },

        tooltip: {

            titleFont: {

                size: 25
            },

            bodyFont: {

                size: 25
            }
        }
    },

    scales: {

        y: {

            beginAtZero: true,

            ticks: {

                font: {

                    size: 25
                }
            }
        },

        x: {

            ticks: {

                font: {

                    size: 25
                }
            }
        }
    }
}

        });
}

saveBudgetBtn.addEventListener(
    "click",
    () => {

        const oldBudget =

            localStorage.getItem(
                "monthlyBudget"
            ) || 0;

        undoStack.push({

            action: "budget",

            oldBudget:
                oldBudget
        });

        redoStack = [];

        localStorage.setItem(

            "monthlyBudget",

            budgetInput.value
        );

        renderExpenses();
    }
);

filterCategory.addEventListener(
    "change",
    renderExpenses
);

document.getElementById(
    "filterCategory"
).addEventListener(
    "change",
    renderExpenses
);

document.getElementById(
    "filterType"
).addEventListener(
    "change",
    renderExpenses
);

undoBtn.addEventListener(
    "click",
    async () => {

        const token =
            localStorage.getItem(
                "token"
            );

        await fetch(

            `${API_URL}/transactions/undo`,

            {
                method: "POST",

                headers: {

                    Authorization:
                        `Bearer ${token}`
                }
            }
        );

        await renderExpenses();
    }
);

redoBtn.addEventListener(
    "click",
    async () => {

        const token =
            localStorage.getItem(
                "token"
            );

        await fetch(

            `${API_URL}/transactions/redo`,

            {
                method: "POST",

                headers: {

                    Authorization:
                        `Bearer ${token}`
                }
            }
        );

        await renderExpenses();
    }
);