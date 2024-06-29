const express = require("express");
const jwt = require("jsonwebtoken");
const zod = require("zod");
const { User, Account } = require("../model");
const { JWT_SECRET } = require("../config");
const { authMiddleware } = require("../middleware");

const signupBody = zod.object({
    userName: zod.string().email(),
    firstName: zod.string(),
    lastName: zod.string(),
    password: zod.string()
})
const signinBody = zod.object({
    userName: zod.string().email(),
    password: zod.string()
})
const updateBody = zod.object({
    firstName: zod.string().optional(),
    lastName: zod.string().optional(),
    password: zod.string().optional()
})

const router = express.Router();

router.post("/signup", async (req, res) => {
    const { success } = signupBody.safeParse(req.body);
    console.log("Success flag:", success, req.body)
    if (!success) {
        return res.status(411).json({
            message: "Email already taken/Incorrect inputs",
        })
    }

    const existingUser = await User.getUserByMail({
        userName: req.body.userName
    })

    if (existingUser) {
        return res.status(411).json({
            message: "Email already taken/Incorrect inputs"
        })
    }

    const user = await User.createUser({
        userName: req.body.userName,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        password: req.body.password
    })

    const userId = user.id;

    await Account.createAccount({
        userId,
        balance: 1 + Math.random() * 1000
    })

    const token = jwt.sign({
        userId
    }, JWT_SECRET)

    res.status(200).json({
        message: "User created successfully",
        token: token
    })
})

router.post("/signin", async (req, res) => {
    const { success } = signinBody.safeParse(req.body);
    if (!success) {
        return res.status(411).json({
            message: "Incorrect inputs"
        })
    }
    const user = await User.getUserByMail({
        userName: req.body.userName,
        password: req.body.password
    })
    if (user) {
        const token = jwt.sign({
            userId: user.id
        }, JWT_SECRET);
        return res.status(200).json({
            token: token
        })
    }

    res.status(411).json({
        message: "Error while logging"
    })
})

router.put("/update", authMiddleware, async (req, res) => {
    const { success } = updateBody.safeParse(req.body);
    if (!success) {
        return res.status(411).json({
            nessage: "Error while updating information"
        })
    }
    await User.updateUser({
        id: req.userId,
        ...req.body
    })

    return res.status(200).json({
        message: "Updated Successfully"
    })
})

router.get("/bulk", async (req, res) => {
    const filter = req.query.filter || "";

    const users = await User.getUserByName({ filter })

    res.json({
        user: users.map(user => ({
            userName: user.userName,
            firstName: user.firstName,
            lastName: user.lastName,
            _id: user.id
        }))
    })
})

module.exports = router