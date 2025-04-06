const { EmbedBuilder } = require("discord.js")
const Welcome = require("../../Models/Welcome")

module.exports = {
  name: "guildMemberAdd",
  async execute(member, client) {
    try {
      // MongoDB'den sunucu ayarlarını al
      const welcomeData = await Welcome.findOne({ Guild: member.guild.id })

      // Eğer ayarlar yoksa işlem yapma
      if (!welcomeData) return

      // Otomatik rol verme
      if (welcomeData.AutoRole) {
        try {
          const role = member.guild.roles.cache.get(welcomeData.AutoRole)
          if (role) {
            await member.roles.add(role)
            console.log(`${member.user.tag} kullanıcısına ${role.name} rolü verildi.`)
          }
        } catch (roleError) {
          console.error(`Rol verme hatası: ${roleError.message}`)
        }
      }

      // Eğer hoşgeldin mesajları kapalıysa veya kanal ayarlanmamışsa mesaj gönderme
      if (!welcomeData.Enabled || !welcomeData.Channel) return

      // Hoşgeldin kanalını al
      const welcomeChannel = member.guild.channels.cache.get(welcomeData.Channel)
      if (!welcomeChannel) return

      // Mesajdaki değişkenleri değiştir
      const welcomeMessage = (
        welcomeData.Message || "{user} sunucuya hoş geldin! Seninle birlikte {memberCount} kişi olduk!"
      )
        .replace(/{user}/g, `<@${member.id}>`)
        .replace(/{username}/g, member.user.username)
        .replace(/{tag}/g, member.user.tag)
        .replace(/{memberCount}/g, member.guild.memberCount)
        .replace(/{server}/g, member.guild.name)

      // Başlıktaki değişkenleri değiştir
      const welcomeTitle = (welcomeData.Title || "👋 Yeni Üye Katıldı!")
        .replace(/{user}/g, `<@${member.id}>`)
        .replace(/{username}/g, member.user.username)
        .replace(/{tag}/g, member.user.tag)
        .replace(/{memberCount}/g, member.guild.memberCount)
        .replace(/{server}/g, member.guild.name)

      // Rol bilgisini ekle
      const roleField = { name: "🎭 Otomatik Rol", value: "Rol verilmedi", inline: true }
      if (welcomeData.AutoRole) {
        const role = member.guild.roles.cache.get(welcomeData.AutoRole)
        if (role) {
          roleField.value = `<@&${role.id}>`
        }
      }

      // Hoşgeldin embed'i oluştur
      const welcomeEmbed = new EmbedBuilder()
        .setTitle(welcomeTitle)
        .setDescription(welcomeMessage)
        .setColor(welcomeData.Color || "#36b030")
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
        .addFields(
          { name: "🆔 Kullanıcı ID", value: member.id, inline: true },
          {
            name: "📅 Hesap Oluşturulma Tarihi",
            value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`,
            inline: true,
          },
          { name: "👥 Toplam Üye", value: `${member.guild.memberCount}`, inline: true },
          roleField,
        )
        .setFooter({ text: `${member.guild.name}`, iconURL: member.guild.iconURL({ dynamic: true }) })
        .setTimestamp()

      // Hoşgeldin mesajını gönder
      await welcomeChannel.send({ embeds: [welcomeEmbed] })
    } catch (error) {
      console.error("Giriş olayı hatası:", error)
    }
  },
}

