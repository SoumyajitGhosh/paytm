const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class User {
    static async createUser(req, res) {
        const { userName, password, firstName, lastName } = req;
        return await prisma.user.create({
            data: {
                userName,
                password,
                firstName,
                lastName,
            },
        });
    }

    static async getAllUsers(req, res) {
        return await prisma.user.findMany();
    }

    static async getUserByName(req, res) {
        const { filter } = req;
        return await prisma.user.findMany({
            where: {
                OR: [
                    { firstName: { contains: filter, mode: 'insensitive' } },
                    { lastName: { contains: filter, mode: 'insensitive' } },
                ],
            },
        });
    }

    static async getUserByMail(req, res) {
        return await prisma.user.findUnique({
            where: {
                ...req
            }
        })
    }

    static async updateUser(req, res) {
        const { id, ...rest } = req;
        await prisma.user.update({
            where: {
                id: req.id
            },
            data: rest,
        });
    }
}

class Account {
    static async createAccount(req, res) {
        const { userId, balance } = req;
        return await prisma.account.create({
            data: {
                userId,
                balance,
            }
        });
    }

    static async getBalance(req, res) {
        return await prisma.account.findFirst({
            where: {
                userId: req.userId,
            },
        });
    }

    // create a function that uses transactions to transfer money from one account to another
    static async transferMoney(req, res) {
        const { to, amount } = req;
        try {
            const result = await prisma.$transaction(async (prisma) => {
                // Fetch the account of the user initiating the transfer
                const account = await prisma.account.findFirst({
                    where: {
                        userId: req.userId,
                    },
                });

                if (!account || account.balance < amount) {
                    throw new Error("Insufficient balance");
                }

                // Fetch the recipient's account
                const toAccount = await prisma.account.findFirst({
                    where: {
                        userId: to,
                    },
                });

                if (!toAccount) {
                    throw new Error("Invalid account");
                }

                // Update the sender's balance
                await prisma.account.update({
                    where: {
                        id: account.id,
                    },
                    data: {
                        balance: {
                            decrement: amount,
                        },
                    },
                });

                // Update the recipient's balance
                await prisma.account.update({
                    where: {
                        id: toAccount.id,
                    },
                    data: {
                        balance: {
                            increment: amount,
                        },
                    },
                });

                return { message: "Transaction successful" };
            });

            res.json(result);


        } catch (error) {
            res.status(400).json({
                message: error.message,
            });
        }
    }
}

module.exports = { User, Account };

