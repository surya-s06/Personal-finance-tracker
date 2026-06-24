const mongoose = require("mongoose");

const actionHistorySchema =
    new mongoose.Schema({

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },

        action: String,

        transactionData: Object,

        undone: {
    type: Boolean,
    default: false
},

        undone: {
            type: Boolean,
            default: false
        },

        timestamp: {
            type: Date,
            default: Date.now
        }
    });

module.exports =
    mongoose.model(
        "ActionHistory",
        actionHistorySchema
    );