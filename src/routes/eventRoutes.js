const router = require("express").Router();
const events = require("../controllers/eventsController");
const attendees = require("../controllers/attendeesController");

// ==================== Events ====================

// Create Event
router.post("/", events.createEvent);

// Get All Events
router.get("/", events.listEvents);

// Get Event
router.get("/:eventId", events.getEvent);

// Update Event
router.patch("/:eventId", events.updateEvent);

// Delete Event
router.delete("/:eventId", events.deleteEvent);

// ==================== Attendees ====================

// Add Attendee to Event
router.post("/:eventId/attendees", attendees.addAttendee);

// Get All Attendees for Event
router.get("/:eventId/attendees", attendees.listAttendees);

// Update Attendee info
router.patch("/:eventId/attendees/:userId", attendees.updateAttendee);

// Check-in Attendee
router.post("/:eventId/attendees/:userId/check-in", attendees.checkInAttendee);

// Accept Attendee
router.post("/:eventId/attendees/:userId/accept", attendees.acceptAttendee);

// Reject Attendee
router.post("/:eventId/attendees/:userId/reject", attendees.rejectAttendee);

// Remove Attendee from Event
router.delete("/:eventId/attendees/:userId", attendees.removeAttendee);

module.exports = router;
