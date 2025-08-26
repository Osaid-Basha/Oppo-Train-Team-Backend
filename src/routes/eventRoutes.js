const router = require("express").Router();
const events = require("../controllers/eventsController");
const registrations = require("../controllers/registrationsController");

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

// ==================== Registrations ====================

// Register for Event
router.post("/:eventId/register", registrations.registerForEvent);

// List Event Registrations
router.get("/:eventId/registrations", registrations.listEventRegistrations);

// Acept Registrations
router.post("/:registrationId/accept", registrations.acceptRegistration);

module.exports = router;