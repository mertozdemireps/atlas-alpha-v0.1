const { EmbedBuilder } = require("discord.js")
const LogChannel = require("../../Models/LogChannel")

/**
 * Moderasyon log mesajı gönderir
 * @param {Object} options - Log mesajı seçenekleri
 * @param {Object} options.guild - Discord sunucusu
 * @param {Object} options.moderator - İşlemi yapan moderatör
 * @param {Object} options.user - İşlemin yapıldığı kullanıcı
 * @param {String} options.action - Yapılan işlem (timeout, untimeout, ban, unban, kick, vb.)
 * @param {String} options.reason - İşlem sebebi
 * @param {String} options.duration - İşlem süresi (varsa)
 * @param {String} options.color - Embed rengi
 * @param {Object} options.fields - Ekstra alanlar (varsa)
 */
async function sendModLog(options) {
  try {
    const { guild, moderator, user, action, reason, duration, color, fields } = options

    // Log kanalını kontrol et
    const logData = await LogChannel.findOne({ Guild: guild.id })

    // Log kanalı ayarlanmamış veya kapalıysa işlem yapma
    if (!logData || !logData.Enabled || !logData.ModLogChannel) return

    // Log kanalını al
    const logChannel = guild.channels.cache.get(logData.ModLogChannel)
    if (!logChannel) return

    // Emoji ve başlık belirle
    let emoji, title
    switch (action.toLowerCase()) {
      case "timeout":
        emoji = "⏱️"
        title = "Zaman Aşımı Uygulandı"
        break
      case "untimeout":
        emoji = "🔓"
        title = "Zaman Aşımı Kaldırıldı"
        break
      case "ban":
        emoji = "🔨"
        title = "Kullanıcı Yasaklandı"
        break
      case "unban":
        emoji = "🔓"
        title = "Kullanıcı Yasağı Kaldırıldı"
        break
      case "kick":
        emoji = "👢"
        title = "Kullanıcı Atıldı"
        break
      case "mute":
        emoji = "🔇"
        title = "Kullanıcı Susturuldu"
        break
      case "unmute":
        emoji = "🔊"
        title = "Kullanıcı Susturması Kaldırıldı"
        break
      case "warn":
        emoji = "⚠️"
        title = "Kullanıcı Uyarıldı"
        break
      case "lock":
        emoji = "🔒"
        title = "Kanal Kilitlendi"
        break
      case "unlock":
        emoji = "🔓"
        title = "Kanal Kilidi Açıldı"
        break
      default:
        emoji = "🛡️"
        title = "Moderasyon İşlemi"
    }

    // Log embed'i oluştur
    const logEmbed = new EmbedBuilder()
      .setTitle(`${emoji} ${title}`)
      .setColor(color || "#ff9966")
      .setDescription(`**Kullanıcı:** ${user.tag} (${user.id})\n**Moderatör:** ${moderator.tag} (${moderator.id})`)
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .setTimestamp()

    // Temel alanları ekle
    if (reason) logEmbed.addFields({ name: "📝 Sebep", value: reason })
    if (duration) logEmbed.addFields({ name: "⏱️ Süre", value: duration })

    // Ekstra alanları ekle
    if (fields && Array.isArray(fields)) {
      fields.forEach((field) => {
        logEmbed.addFields(field)
      })
    }

    // Footer ekle
    logEmbed.setFooter({
      text: `${guild.name} • Moderasyon Logu`,
      iconURL: guild.iconURL({ dynamic: true }),
    })

    // Log mesajını gönder
    await logChannel.send({ embeds: [logEmbed] })
  } catch (error) {
    console.error("Moderasyon log gönderme hatası:", error)
  }
}

module.exports = sendModLog

