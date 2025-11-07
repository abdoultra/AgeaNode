const Post = require("../models/Post");

// Créer un nouveau post
exports.createPost = async (req, res) => {
  try {
    const { title, content, category } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const post = new Post({
      title,
      content,
      image,
      category,
      author: req.user._id, // L'ID de l'utilisateur connecté
    });

    const savedPost = await post.save();
    const populatedPost = await Post.findById(savedPost._id).populate(
      "author",
      "name nickname profilePic"
    );

    res.status(201).json({
      success: true,
      data: populatedPost,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Récupérer tous les posts
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "name nickname profilePic")
      .sort({ createdAt: -1 }); // Du plus récent au plus ancien

    res.json({
      success: true,
      count: posts.length,
      data: posts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Récupérer un post par son ID
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      "author",
      "name nickname profilePic"
    );

    if (!post) {
      return res.status(404).json({
        success: false,
        error: "Post non trouvé",
      });
    }

    res.json({
      success: true,
      data: post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Mettre à jour un post
exports.updatePost = async (req, res) => {
  try {
    const { title, content, category } = req.body;
    const updateData = { title, content, category };

    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        error: "Post non trouvé",
      });
    }

    // Vérifier si l'utilisateur est l'auteur du post
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: "Vous n'êtes pas autorisé à modifier ce post",
      });
    }

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate("author", "name nickname profilePic");

    res.json({
      success: true,
      data: updatedPost,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Supprimer un post
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        error: "Post non trouvé",
      });
    }

    // Vérifier si l'utilisateur est l'auteur du post ou un admin
    if (
      post.author.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        error: "Vous n'êtes pas autorisé à supprimer ce post",
      });
    }

    await post.remove();

    res.json({
      success: true,
      message: "Post supprimé avec succès",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
