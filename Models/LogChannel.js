const { model, Schema, models } = require("mongoose")

// Şema tanımla
const logChannelSchema = new Schema({
  Guild: { type: String, required: true, unique: true },
  ModLogChannel: { type: String, default: null },
  Enabled: { type: Boolean, default: true },
})

// Model zaten varsa onu kullan, yoksa yeni model oluştur
module.exports = models.LogChannel || model("LogChannel", logChannelSchema)

