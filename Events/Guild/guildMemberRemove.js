const { EmbedBuilder } = require("discord.js")
const leave = require("../../Models/Leave")

module.exports = {
  name: "guildMemberRemove",
  async execute(member, client) {
    try {
      // MongoDB'den sunucu ayarlarını al
      const leaveData = await leave.findOne({ Guild: member.guild.id })

      // Eğer ayarlar yoksa veya ayrılma mesajları kapalıysa işlem yapma
      if (!leaveData || !leaveData.Enabled || !leaveData.Channel) return

      // Ayrılma kanalını al
      const leaveChannel = member.guild.channels.cache.get(leaveData.Channel)
      if (!leaveChannel) return

      // Mesajdaki değişkenleri değiştir
      const leaveMessage = (leaveData.Message || "{user} sunucudan ayrıldı! Artık {memberCount} kişiyiz.")
        .replace(/{user}/g, `${member.user.tag}`)
        .replace(/{username}/g, member.user.username)
        .replace(/{tag}/g, member.user.tag)
        .replace(/{memberCount}/g, member.guild.memberCount)
        .replace(/{server}/g, member.guild.name)

      // Başlıktaki değişkenleri değiştir
      const leaveTitle = (leaveData.Title || "👋 Bir Üye Ayrıldı")
        .replace(/{user}/g, `${member.user.tag}`)
        .replace(/{username}/g, member.user.username)
        .replace(/{tag}/g, member.user.tag)
        .replace(/{memberCount}/g, member.guild.memberCount)
        .replace(/{server}/g, member.guild.name)

      // Ayrılma embed'i oluştur
      const leaveEmbed = new EmbedBuilder()
        .setTitle(leaveTitle)
        .setDescription(leaveMessage)
        .setColor(leaveData.Color || "#e01e1e")
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
        .addFields(
          { name: "🆔 Kullanıcı ID", value: member.id, inline: true },
          {
            name: "📅 Katılma Tarihi",
            value: member.joinedAt ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>` : "Bilinmiyor",
            inline: true,
          },
          { name: "👥 Kalan Üye", value: `${member.guild.memberCount}`, inline: true },
        )
        .setFooter({ text: `${member.guild.name}`, iconURL: member.guild.iconURL({ dynamic: true }) })
        .setTimestamp()

      // Ayrılma mesajını gönder
      await leaveChannel.send({ embeds: [leaveEmbed] })
    } catch (error) {
      console.error("Çıkış olayı hatası:", error)
    }
  },
}

