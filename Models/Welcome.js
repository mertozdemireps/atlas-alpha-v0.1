const { model, Schema, models } = require("mongoose")

// Şema tanımla
const welcomeSchema = new Schema({
  Guild: String,
  Channel: String,
  Message: { type: String, default: "{user} sunucuya hoş geldin! Seninle birlikte {memberCount} kişi olduk!" },
  Title: { type: String, default: "👋 Yeni Üye Katıldı!" },
  Color: { type: String, default: "#36b030" },
  Enabled: { type: Boolean, default: true },
  AutoRole: { type: String, default: null }, // Otomatik rol ID'si için yeni alan
})

// Model zaten varsa onu kullan, yoksa yeni model oluştur
module.exports = models.Welcome || model("Welcome", welcomeSchema)

