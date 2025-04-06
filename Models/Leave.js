const { model, Schema, models } = require("mongoose")

// Şema tanımla
const leaveSchema = new Schema({
  Guild: String,
  Channel: String,
  Message: { type: String, default: "{user} sunucudan ayrıldı! Artık {memberCount} kişiyiz." },
  Title: { type: String, default: "👋 Bir Üye Ayrıldı" },
  Color: { type: String, default: "#e01e1e" },
  Enabled: { type: Boolean, default: true },
})

// Model zaten varsa onu kullan, yoksa yeni model oluştur
module.exports = models.Leave || model("Leave", leaveSchema)

