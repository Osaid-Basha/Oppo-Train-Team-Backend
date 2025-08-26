const router = require("express").Router();
const registrations = require("../controllers/registrationsController");

// Accept registration
router.post("/:registrationId/accept", registrations.acceptRegistration);

module.exports = router;
