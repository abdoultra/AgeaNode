const express = require("express");
const router = express.Router();
const cotisationController = require("../controllers/cotisationController");
const verifyToken = require("../middlewares/verifyToken");

// Routes nécessitant une authentification
router.use(verifyToken);

// Routes pour les membres
router.post("/", cotisationController.createCotisation);
router.get("/my-cotisations", cotisationController.getMyCotisations);
router.get("/check-status", cotisationController.checkCotisationStatus);

// Routes pour les admins
router.get("/", cotisationController.getAllCotisations);
router.get("/:id", cotisationController.getCotisationById);
router.patch("/:id/status", cotisationController.updateCotisationStatus);

module.exports = router;
