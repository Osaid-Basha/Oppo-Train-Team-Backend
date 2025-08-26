const { db } = require("../config/firebase");

// جلب جميع المستخدمين
const getUsers = async (req, res) => {
  try {
    const snapshot = await db.collection("user").get();
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// إضافة مستخدم جديد
const addUser = async (req, res) => {
  try {
    const { fullName, email, status, userID } = req.body;

    // نبني الـ object ونشيل undefined values
    const userData = { fullName, email, status, userID };
    Object.keys(userData).forEach(
      key => userData[key] === undefined && delete userData[key]
    );

    const docRef = await db.collection("user").add(userData);
    res.json({ id: docRef.id, message: "User added successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// تحديث مستخدم
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, email, status, userID } = req.body;

    const updateData = { fullName, email, status, userID };
    Object.keys(updateData).forEach(
      key => updateData[key] === undefined && delete updateData[key]
    );

    await db.collection("user").doc(id).update(updateData);
    res.json({ message: "User updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// حذف مستخدم
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("user").doc(id).delete();
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getUsers, addUser, updateUser, deleteUser };
