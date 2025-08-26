const router = require("express").Router();
const events = require("../controllers/eventsController");
const registrations = require("../controllers/registrationsController");
const upload = require("../middleware/upload"); // 📂 Multer middleware

// ==================== Events ====================

// Create Event (مع صورة)
router.post("/", upload.single("image"), events.createEvent);

// Get All Events
router.get("/", events.listEvents);

// Get Event
router.get("/:eventId", events.getEvent);

// Update Event (مع صورة جديدة)
router.patch("/:eventId", upload.single("image"), events.updateEvent);

// Delete Event
router.delete("/:eventId", events.deleteEvent);

// ==================== Registrations ====================

// Register for Event
router.post("/:eventId/register", registrations.registerForEvent);

// List Event Registrations
router.get("/:eventId/registrations", registrations.listEventRegistrations);

// Accept Registration
router.post("/:registrationId/accept", registrations.acceptRegistration);

module.exports = router;
