const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");
const verifyToken = require("../middlewares/verifyToken");
const upload = require("../middlewares/upload");

// Routes publiques
router.get("/", eventController.getAllEvents);
router.get("/:id", eventController.getEventById);

// Routes protégées (nécessitent une authentification)
router.post(
  "/",
  verifyToken,
  upload.single("image"),
  eventController.createEvent
);

router.patch(
  "/:id",
  verifyToken,
  upload.single("image"),
  eventController.updateEvent
);

router.delete("/:id", verifyToken, eventController.deleteEvent);

// Routes pour la gestion des participants
router.post("/:id/join", verifyToken, eventController.joinEvent);

router.post("/:id/leave", verifyToken, eventController.leaveEvent);

module.exports = router;
