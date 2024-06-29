const express = require("express");
const { Account } = require("../model");
const { authMiddleware } = require("../middleware");
const { default: mongoose } = require("mongoose");
const router = express.Router();

router.get("/balance", authMiddleware, async (req, res) => {
    const account = await Account.getBalance({
        userId: req.userId
    })

    res.json({
        balance: account.balance
    })
})

router.post("/transfer", authMiddleware, async (req, res) => {
    const { to, amount } = req.body;
    await Account.transferMoney({
        to: to,
        amount: amount
    }, res)

})

module.exports = router;