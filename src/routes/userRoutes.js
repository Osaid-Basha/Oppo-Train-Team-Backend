//example of user routes
const express = require("express");
const { getUsers, addUser, updateUser, deleteUser } = require("../controllers/userController");

const router = express.Router();

// GET all users
router.get("/", getUsers);

// POST new user
router.post("/", addUser);

// PUT update user
router.put("/:id", updateUser);

// DELETE user
router.delete("/:id", deleteUser);

module.exports = router;
