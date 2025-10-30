const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
const verifyToken = require("../middlewares/verifyToken");
const upload = require("../middlewares/upload");

// Routes publiques
router.get("/", postController.getAllPosts);
router.get("/:id", postController.getPostById);

// Routes protégées (nécessitent une authentification)
router.post(
  "/",
  verifyToken,
  upload.single("image"),
  postController.createPost
);

router.patch(
  "/:id",
  verifyToken,
  upload.single("image"),
  postController.updatePost
);

router.delete("/:id", verifyToken, postController.deletePost);

module.exports = router;
