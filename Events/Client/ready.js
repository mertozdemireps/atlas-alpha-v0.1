const mongoose = require("mongoose");
const config = require("../../config.json");

module.exports = {

    name: "ready",
    once: true,
    async execute(client) {

        console.log(`${client.guilds.cache.size} sunucuda hizmet veriliyor!`)

    // Emojilerle süslenmiş durum mesajları dizisi
    const activities = [
      { name: "❓ /yardım", type: 3 }, // İzliyor
      { name: `🌐 ${client.guilds.cache.size} sunucu`, type: 3 }, // İzliyor
      { name: "🛡️ moderasyon işlemlerini", type: 3 }, // İzliyor
      { name: "🔨 /ban ve /kick", type: 2 }, // Dinliyor
      { name: "⏱️ /timeout", type: 0 }, // Oynuyor
      { name: "👋 giriş-çıkış sistemi", type: 0 }, // Oynuyor
      { name: "📝 log sistemi", type: 0 }, // Oynuyor
      { name: "🌐 /site", type: 0 }, // Oynuyor
      { name: "🎮 /ip", type: 0 }, // Oynuyor
      { name: "🔒 kanal yönetimi", type: 0 }, // Oynuyor
      { name: "✨ sizin için hazır!", type: 0 }, // Oynuyor
      { name: "🤖 komutlarınızı", type: 2 }, // Dinliyor
      { name: "🔧 yardımcı komutlar", type: 0 }, // Oynuyor
      { name: "💬 mesajlarınızı", type: 3 }, // İzliyor
      { name: "🚀 hızlı ve güvenli", type: 0 }, // Oynuyor
    ]

    let i = 0

    // İlk durumu ayarla
    client.user.setActivity(activities[0].name, { type: activities[0].type })

    // Her 10 saniyede bir durum değiştir
    setInterval(() => {
      if (i >= activities.length) i = 0
      client.user.setActivity(activities[i].name, { type: activities[i].type })
      i++
    }, 10000)

        mongoose.set("strictQuery", false);
        await mongoose.connect(config.mongodb || "", {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        if(mongoose.connect){
            console.log("MongoDB Bağlantısı başarılı!")
        }
    }
}

  
  