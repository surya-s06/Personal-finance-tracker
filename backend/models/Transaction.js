const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    type: String,

    category: String,

    amount: Number,

    description: String,

    date: {
        type: Date,
        default: Date.now
    }

});

module.exports =
    mongoose.model(
        "Transaction",
        transactionSchema
    );