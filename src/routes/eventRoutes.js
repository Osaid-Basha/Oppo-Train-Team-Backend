const router = require("express").Router();
const events = require("../controllers/eventsController");
const attendees = require("../controllers/attendeesController");

// ==================== Events ====================

//Create Event
router.post("/", events.createEvent);

//Get All Events
router.get("/", events.listEvents);

//Get Event
router.get("/:eventId", events.getEvent);

//Update Event
router.patch("/:eventId", events.updateEvent);

//Delete Event
router.delete("/:eventId", events.deleteEvent);


// ==================== Attendees ====================

//Add Attendee to Event
router.post("/:eventId/attendees", attendees.addAttendee);

//Get All Attendees
router.get("/:eventId/attendees", attendees.listAttendees);

//Check-in Attendee
router.post("/:eventId/attendees/:userId/check-in", attendees.checkInAttendee);

//Remove Attendee from Event    
router.delete("/:eventId/attendees/:userId", attendees.removeAttendee);

module.exports = router;
