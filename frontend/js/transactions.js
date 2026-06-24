async function loadTransactions() {

    const token =
        localStorage.getItem("token");

    const response =
        await fetch(
            `${API_URL}/transactions`,
            {
                headers: {
                    Authorization:
                        `Bearer ${token}`
                }
            }
        );

    const transactions =
        await response.json();

    return transactions;
}

async function createTransaction(
    name,
    amount,
    category,
    type
) {

    const token =
        localStorage.getItem("token");

    const response =
        await fetch(
            `${API_URL}/transactions`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json",

                    Authorization:
                        `Bearer ${token}`
                },

                body: JSON.stringify({
                    type,
                    category,
                    amount,
                    description: name
                })
            }
        );

    return await response.json();
}

async function updateTransaction(
    id,
    name,
    amount,
    category,
    type
) {

    const token =
        localStorage.getItem("token");

    const response =
        await fetch(
            `${API_URL}/transactions/${id}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type":
                        "application/json",

                    Authorization:
                        `Bearer ${token}`
                },

                body: JSON.stringify({
                    description: name,
                    amount,
                    category,
                    type
                })
            }
        );

    return await response.json();
}