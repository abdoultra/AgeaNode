const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const verifyToken = require("../middlewares/verifyToken");
const upload = require("../middlewares/upload");

// Routes Publiques
router.post("/", userController.createUser);
router.post("/login", userController.login);

// Routes avec Authentification
router.get("/", verifyToken, userController.getAllUsers);
router.get("/:id", verifyToken, userController.getUserById);
router.patch("/:id", verifyToken, userController.updateUser);
router.delete("/:id", verifyToken, userController.deleteUser);

// Nouvelle route pour l'upload de photo de profil
router.patch(
  "/profile-picture/:id",
  verifyToken,
  upload.single("profilePic"),
  userController.updateProfilePicture
);

module.exports = router;
