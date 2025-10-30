const Event = require("../models/Event");

// Créer un nouvel événement
exports.createEvent = async (req, res) => {
  try {
    const { title, description, date, time, location, maxParticipants } =
      req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const event = new Event({
      title,
      description,
      date,
      time,
      location,
      image,
      maxParticipants,
      organizer: req.user._id,
      participants: [req.user._id], // L'organisateur est automatiquement participant
    });

    const savedEvent = await event.save();
    const populatedEvent = await Event.findById(savedEvent._id)
      .populate("organizer", "name nickname profilePic")
      .populate("participants", "name nickname profilePic");

    res.status(201).json({
      success: true,
      data: populatedEvent,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Récupérer tous les événements
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate("organizer", "name nickname profilePic")
      .populate("participants", "name nickname profilePic")
      .sort({ date: 1 }); // Trier par date croissante

    res.json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Récupérer un événement par son ID
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("organizer", "name nickname profilePic")
      .populate("participants", "name nickname profilePic");

    if (!event) {
      return res.status(404).json({
        success: false,
        error: "Événement non trouvé",
      });
    }

    res.json({
      success: true,
      data: event,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Mettre à jour un événement
exports.updateEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      date,
      time,
      location,
      maxParticipants,
      status,
    } = req.body;
    const updateData = {
      title,
      description,
      date,
      time,
      location,
      maxParticipants,
      status,
    };

    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        error: "Événement non trouvé",
      });
    }

    // Vérifier si l'utilisateur est l'organisateur
    if (
      event.organizer.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        error: "Vous n'êtes pas autorisé à modifier cet événement",
      });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    )
      .populate("organizer", "name nickname profilePic")
      .populate("participants", "name nickname profilePic");

    res.json({
      success: true,
      data: updatedEvent,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Supprimer un événement
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        error: "Événement non trouvé",
      });
    }

    // Vérifier si l'utilisateur est l'organisateur ou un admin
    if (
      event.organizer.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        error: "Vous n'êtes pas autorisé à supprimer cet événement",
      });
    }

    await event.remove();

    res.json({
      success: true,
      message: "Événement supprimé avec succès",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Rejoindre un événement
exports.joinEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        error: "Événement non trouvé",
      });
    }

    // Vérifier si l'événement n'est pas terminé ou annulé
    if (event.status !== "à venir" && event.status !== "en cours") {
      return res.status(400).json({
        success: false,
        error: "Impossible de rejoindre cet événement",
      });
    }

    // Vérifier si l'utilisateur n'est pas déjà participant
    if (event.participants.includes(req.user._id)) {
      return res.status(400).json({
        success: false,
        error: "Vous participez déjà à cet événement",
      });
    }

    // Vérifier le nombre maximum de participants
    if (
      event.maxParticipants &&
      event.participants.length >= event.maxParticipants
    ) {
      return res.status(400).json({
        success: false,
        error: "L'événement est complet",
      });
    }

    event.participants.push(req.user._id);
    await event.save();

    const updatedEvent = await Event.findById(event._id)
      .populate("organizer", "name nickname profilePic")
      .populate("participants", "name nickname profilePic");

    res.json({
      success: true,
      data: updatedEvent,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Quitter un événement
exports.leaveEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        error: "Événement non trouvé",
      });
    }

    // Vérifier si l'utilisateur est participant
    if (!event.participants.includes(req.user._id)) {
      return res.status(400).json({
        success: false,
        error: "Vous ne participez pas à cet événement",
      });
    }

    // Empêcher l'organisateur de quitter son propre événement
    if (event.organizer.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        error: "L'organisateur ne peut pas quitter son événement",
      });
    }

    event.participants = event.participants.filter(
      (participantId) => participantId.toString() !== req.user._id.toString()
    );
    await event.save();

    const updatedEvent = await Event.findById(event._id)
      .populate("organizer", "name nickname profilePic")
      .populate("participants", "name nickname profilePic");

    res.json({
      success: true,
      data: updatedEvent,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
