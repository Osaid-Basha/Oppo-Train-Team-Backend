const { db } = require("../config/firebase");

// إنشاء حدث جديد
const createEvent = async (req, res) => {
  try {
    const data = req.body;
    const docRef = await db.collection("events").add({
      ...data,
      createdAtServer: new Date().toISOString()
    });
    res.json({ id: docRef.id, message: "Event created successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// جلب كل الأحداث
const listEvents = async (req, res) => {
  try {
    const snapshot = await db.collection("events").get();
    const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// جلب حدث محدد
const getEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const doc = await db.collection("events").doc(eventId).get();
    if (!doc.exists) return res.status(404).json({ error: "Event not found" });
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// تحديث حدث
const updateEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    await db.collection("events").doc(eventId).update(req.body);
    res.json({ message: "Event updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// حذف حدث
const deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    await db.collection("events").doc(eventId).delete();
    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createEvent, listEvents, getEvent, updateEvent, deleteEvent };
