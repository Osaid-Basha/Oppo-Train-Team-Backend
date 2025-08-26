const { db } = require("../config/firebase");
const { FieldValue } = require("firebase-admin/firestore");

// ==================== Event Management ====================

// Create Event
const createEvent = async (req, res) => {
  try {
    const data = req.body || {};

    const eventData = {
      title: data.title,
      description: data.description || "",
      date: data.date ? new Date(data.date) : null,
      location: data.location || "",
      capacity: data.capacity || 0,
      registered_count: 0,
      registration_deadline: data.registration_deadline
        ? new Date(data.registration_deadline)
        : null,
      status: data.status || "draft",
      requirements: data.requirements || "",
      created_by: data.created_by || "",
      created_at: FieldValue.serverTimestamp(),
      updated_at: FieldValue.serverTimestamp()
    };

    const docRef = await db.collection("events").add(eventData);

    res.json({
      success: true,
      data: { id: docRef.id, ...eventData },
      message: "Event created successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: "EVENT_CREATE_FAILED", message: error.message }
    });
  }
};

// List Events
const listEvents = async (_req, res) => {
  try {
    const snapshot = await db.collection("events").get();
    const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, data: events, message: "Events retrieved" });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: "EVENT_LIST_FAILED", message: error.message }
    });
  }
};

// Get Event
const getEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const doc = await db.collection("events").doc(eventId).get();
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: { code: "EVENT_NOT_FOUND", message: "Event not found" }
      });
    }
    res.json({ success: true, data: { id: doc.id, ...doc.data() }, message: "Event retrieved" });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: "EVENT_GET_FAILED", message: error.message }
    });
  }
};

// Update Event
const updateEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const data = { ...req.body, updated_at: FieldValue.serverTimestamp() };
    await db.collection("events").doc(eventId).update(data);
    res.json({ success: true, message: "Event updated successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: "EVENT_UPDATE_FAILED", message: error.message }
    });
  }
};

// Delete Event
const deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    await db.collection("events").doc(eventId).delete();
    res.json({ success: true, message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: "EVENT_DELETE_FAILED", message: error.message }
    });
  }
};

module.exports = { createEvent, listEvents, getEvent, updateEvent, deleteEvent };