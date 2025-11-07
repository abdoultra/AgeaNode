const mongoose = require("mongoose");

const cotisationSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    startPeriod: {
      type: Date,
      required: true,
    },
    endPeriod: {
      type: Date,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["espèces", "chèque", "virement", "carte"],
      required: true,
    },
    status: {
      type: String,
      enum: ["en attente", "validé", "refusé"],
      default: "en attente",
    },
    receiptNumber: {
      type: String,
      unique: true,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index pour améliorer les performances des recherches
cotisationSchema.index({ member: 1, startPeriod: 1, endPeriod: 1 });

module.exports = mongoose.model("Cotisation", cotisationSchema);
