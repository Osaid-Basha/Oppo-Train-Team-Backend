const { db } = require("../config/firebase");
const { FieldValue } = require("firebase-admin/firestore");
const emailService = require("../services/emailServices");

// Register user for an event
const registerForEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { user_id, email, notes } = req.body;

    await db.runTransaction(async (t) => {
      const eventRef = db.collection("events").doc(eventId);
      const eventDoc = await t.get(eventRef);
      if (!eventDoc.exists) {
        throw { status: 404, message: "Event not found" };
      }
      const event = eventDoc.data();

      if (event.registration_deadline && event.registration_deadline.toDate && event.registration_deadline.toDate() < new Date()) {
        throw { status: 400, message: "Registration deadline passed" };
      }

      const existing = await db
        .collection("event_registrations")
        .where("event_id", "==", eventId)
        .where("user_id", "==", user_id)
        .get();
      if (!existing.empty) {
        throw { status: 400, message: "User already registered" };
      }

      const status = event.registered_count >= event.capacity ? "waitlist" : "pending";

      const regRef = db.collection("event_registrations").doc();
      t.set(regRef, {
        event_id: eventId,
        user_id,
        email,
        status,
        notes: notes || "",
        registered_at: FieldValue.serverTimestamp(),
        notification_sent: false
      });
    });

    res.json({ success: true, message: "Registration submitted" });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({
      success: false,
      error: { code: "REGISTRATION_FAILED", message: error.message || "Failed to register" }
    });
  }
};

// List registrations for an event
const listEventRegistrations = async (req, res) => {
  try {
    const { eventId } = req.params;
    const snapshot = await db
      .collection("event_registrations")
      .where("event_id", "==", eventId)
      .get();
    const registrations = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, data: registrations, message: "Registrations retrieved" });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: "REGISTRATION_LIST_FAILED", message: error.message } });
  }
};

// Accept registration and send email
const acceptRegistration = async (req, res) => {
  try {
    const { registrationId } = req.params;

    let regData;
    let eventData;

    await db.runTransaction(async (t) => {
      const regRef = db.collection("event_registrations").doc(registrationId);
      const regDoc = await t.get(regRef);
      if (!regDoc.exists) {
        throw { status: 404, message: "Registration not found" };
      }
      regData = regDoc.data();

      const eventRef = db.collection("events").doc(regData.event_id);
      const eventDoc = await t.get(eventRef);
      if (!eventDoc.exists) {
        throw { status: 404, message: "Event not found" };
      }
      eventData = eventDoc.data();

      if (eventData.registered_count >= eventData.capacity) {
        throw { status: 400, message: "Event is full" };
      }

      t.update(regRef, { status: "accepted" });
      t.update(eventRef, {
        registered_count: (eventData.registered_count || 0) + 1,
        status: (eventData.registered_count + 1) >= eventData.capacity ? "full" : eventData.status
      });
    });

    // Send acceptance email
    if (regData.email) {
      try {
        await emailService.sendNotificationEmail(regData.email, {
          subject: `Registration Accepted: ${eventData.title}`,
          message: `Your registration for ${eventData.title} has been accepted.`
        });
        await db.collection("event_registrations").doc(registrationId).update({ notification_sent: true });
      } catch (err) {
        // ignore email errors
      }
    }

    res.json({ success: true, message: "Registration accepted" });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ success: false, error: { code: "REGISTRATION_ACCEPT_FAILED", message: error.message || "Failed to accept" } });
  }
};

<<<<<<< HEAD
module.exports = { registerForEvent, listEventRegistrations, acceptRegistration };
=======
module.exports = { registerForEvent, listEventRegistrations, acceptRegistration };
>>>>>>> 85365dd (adding the endpoints for events and registerations)
