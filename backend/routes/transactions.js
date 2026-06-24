const express = require("express");

const router = express.Router();

const Transaction =
    require("../models/Transaction");

    const ActionHistory =
    require("../models/ActionHistory");

const auth =
    require("../middleware/authMiddleware");

router.get("/", auth, async (req,res)=>{

    const transactions =
        await Transaction.find({

            userId:req.user.id

        });

    res.json(transactions);
});

router.post("/", auth, async (req,res)=>{

    const transaction =
        await Transaction.create({

            ...req.body,

            userId:req.user.id
        });

    await ActionHistory.create({

        userId:
            req.user.id,

        action:
            "add",

        transactionData:
            transaction
    });

    res.status(201).json(transaction);
});

router.delete("/:id", auth, async (req, res) => {

    const transaction =

        await Transaction.findById(
            req.params.id
        );

    if(!transaction) {

        return res.status(404).json({
            message:
                "Transaction not found"
        });
    }

    await ActionHistory.create({

        userId:
            req.user.id,

        action:
            "delete",

        transactionData:
            transaction
    });

    await Transaction.findByIdAndDelete(
        req.params.id
    );

    res.json({
        message: "Deleted"
    });
});

router.put("/:id", auth, async (req, res) => {

    const oldTransaction =

        await Transaction.findById(
            req.params.id
        );

    if(!oldTransaction) {

        return res.status(404).json({
            message:
                "Transaction not found"
        });
    }

    await ActionHistory.create({

        userId:
            req.user.id,

        action:
            "edit",

        transactionData:
            oldTransaction
    });

    const updatedTransaction =

        await Transaction.findByIdAndUpdate(

            req.params.id,

            req.body,

            {
                new: true
            }
        );

    res.json(
        updatedTransaction
    );
});

router.post(
    "/undo",
    auth,
    async (req, res) => {

        const lastAction =

    await ActionHistory
        .findOne({

            userId:
                req.user.id,

            undone:
                false
        })

        .sort({
            timestamp: -1
        });

        if(!lastAction) {

            return res.json({
                message:
                    "Nothing to undo"
            });
        }

        const data =
            lastAction.transactionData;

        if(
            lastAction.action ===
            "add"
        ) {

            await Transaction
                .findByIdAndDelete(
                    data._id
                );
        }

        else if(
            lastAction.action ===
            "delete"
        ) {

            await Transaction
                .create({

                    ...data,

                    _id:
                        data._id
                });
        }

        else if(
            lastAction.action ===
            "edit"
        ) {

            await Transaction
                .findByIdAndUpdate(

                    data._id,

                    data
                );
        }

        lastAction.undone =
            true;

        await lastAction.save();

        res.json({
            message:
                "Undo successful"
        });
    }
);

router.post(
    "/redo",
    auth,
    async (req, res) => {

        const lastUndone =

            await ActionHistory
                .findOne({

                    userId:
                        req.user.id,

                    undone:
                        true
                })

                .sort({
                    timestamp: -1
                });

        if(!lastUndone) {

            return res.json({
                message:
                    "Nothing to redo"
            });
        }

        const data =
            lastUndone.transactionData;

        if(
            lastUndone.action ===
            "add"
        ) {

            await Transaction.create({

                ...data,

                _id:
                    data._id
            });
        }

        else if(
            lastUndone.action ===
            "delete"
        ) {

            await Transaction
                .findByIdAndDelete(
                    data._id
                );
        }

        else if(
            lastUndone.action ===
            "edit"
        ) {

            // We'll improve edit redo later
        }

        lastUndone.undone =
            false;

        await lastUndone.save();

        res.json({
            message:
                "Redo successful"
        });
    }
);

module.exports = router;