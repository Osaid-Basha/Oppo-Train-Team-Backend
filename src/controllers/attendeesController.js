const { db } = require("../config/firebase");

// إضافة Attendee لحدث
const addAttendee = async (req, res) => {
  try {
    const { eventId } = req.params;
    const data = req.body;

    const docRef = await db
      .collection("events")
      .doc(eventId)
      .collection("attendees")
      .add({
        ...data,
        status: "pending", // الحالة الافتراضية
        createdAt: new Date().toISOString(),
      });

    res.json({ id: docRef.id, message: "Attendee added successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// جلب جميع Attendees لحدث
const listAttendees = async (req, res) => {
  try {
    const { eventId } = req.params;
    const snapshot = await db
      .collection("events")
      .doc(eventId)
      .collection("attendees")
      .get();

    const attendees = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(attendees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Check-in Attendee
const checkInAttendee = async (req, res) => {
  try {
    const { eventId, userId } = req.params;

    await db
      .collection("events")
      .doc(eventId)
      .collection("attendees")
      .doc(userId)
      .update({
        checkedIn: true,
        checkedInAt: new Date().toISOString(),
      });

    res.json({ message: "Attendee checked in successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// تحديث Attendee
const updateAttendee = async (req, res) => {
  try {
    const { eventId, userId } = req.params;
    const data = req.body;

    await db
      .collection("events")
      .doc(eventId)
      .collection("attendees")
      .doc(userId)
      .update(data);

    res.json({ message: "Attendee updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// قبول Attendee
const acceptAttendee = async (req, res) => {
  try {
    const { eventId, userId } = req.params;

    await db
      .collection("events")
      .doc(eventId)
      .collection("attendees")
      .doc(userId)
      .update({
        status: "accepted",
        acceptedAt: new Date().toISOString(),
      });

    res.json({ message: "Attendee accepted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// رفض Attendee
const rejectAttendee = async (req, res) => {
  try {
    const { eventId, userId } = req.params;

    await db
      .collection("events")
      .doc(eventId)
      .collection("attendees")
      .doc(userId)
      .update({
        status: "rejected",
        rejectedAt: new Date().toISOString(),
      });

    res.json({ message: "Attendee rejected successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// حذف Attendee
const removeAttendee = async (req, res) => {
  try {
    const { eventId, userId } = req.params;

    await db
      .collection("events")
      .doc(eventId)
      .collection("attendees")
      .doc(userId)
      .delete();

    res.json({ message: "Attendee removed successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  addAttendee,
  listAttendees,
  checkInAttendee,
  updateAttendee,
  acceptAttendee,
  rejectAttendee,
  removeAttendee,
};
