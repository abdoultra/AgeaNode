const Cotisation = require("../models/Cotisation");
const User = require("../models/User");

// Créer une nouvelle cotisation
exports.createCotisation = async (req, res) => {
  try {
    const { amount, startPeriod, endPeriod, paymentMethod, notes } = req.body;

    // Générer un numéro de reçu unique (année + mois + random)
    const receiptNumber = `COT-${new Date().getFullYear()}${(
      new Date().getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}-${Math.random()
      .toString(36)
      .substr(2, 6)
      .toUpperCase()}`;

    const cotisation = new Cotisation({
      member: req.user._id,
      amount,
      startPeriod: new Date(startPeriod),
      endPeriod: new Date(endPeriod),
      paymentMethod,
      receiptNumber,
      notes,
    });

    const savedCotisation = await cotisation.save();
    const populatedCotisation = await Cotisation.findById(
      savedCotisation._id
    ).populate("member", "name nickname email");

    res.status(201).json({
      success: true,
      data: populatedCotisation,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Récupérer toutes les cotisations (admin uniquement)
exports.getAllCotisations = async (req, res) => {
  try {
    // Vérifier si l'utilisateur est admin
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Accès non autorisé",
      });
    }

    const cotisations = await Cotisation.find()
      .populate("member", "name nickname email")
      .sort({ paymentDate: -1 });

    res.json({
      success: true,
      count: cotisations.length,
      data: cotisations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Récupérer les cotisations d'un membre
exports.getMyCotisations = async (req, res) => {
  try {
    const cotisations = await Cotisation.find({ member: req.user._id })
      .populate("member", "name nickname email")
      .sort({ paymentDate: -1 });

    res.json({
      success: true,
      count: cotisations.length,
      data: cotisations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Récupérer une cotisation par son ID
exports.getCotisationById = async (req, res) => {
  try {
    const cotisation = await Cotisation.findById(req.params.id).populate(
      "member",
      "name nickname email"
    );

    if (!cotisation) {
      return res.status(404).json({
        success: false,
        error: "Cotisation non trouvée",
      });
    }

    // Vérifier si l'utilisateur est admin ou le membre concerné
    if (
      req.user.role !== "admin" &&
      cotisation.member._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        error: "Accès non autorisé",
      });
    }

    res.json({
      success: true,
      data: cotisation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Mettre à jour le statut d'une cotisation (admin uniquement)
exports.updateCotisationStatus = async (req, res) => {
  try {
    // Vérifier si l'utilisateur est admin
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Accès non autorisé",
      });
    }

    const { status } = req.body;

    const cotisation = await Cotisation.findById(req.params.id);
    if (!cotisation) {
      return res.status(404).json({
        success: false,
        error: "Cotisation non trouvée",
      });
    }

    cotisation.status = status;
    await cotisation.save();

    const updatedCotisation = await Cotisation.findById(
      cotisation._id
    ).populate("member", "name nickname email");

    res.json({
      success: true,
      data: updatedCotisation,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Vérifier si un membre est à jour de ses cotisations
exports.checkCotisationStatus = async (req, res) => {
  try {
    const currentDate = new Date();
    const latestCotisation = await Cotisation.findOne({
      member: req.user._id,
      status: "validé",
      endPeriod: { $gte: currentDate },
    }).sort({ endPeriod: -1 });

    res.json({
      success: true,
      isActive: !!latestCotisation,
      lastCotisation: latestCotisation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
