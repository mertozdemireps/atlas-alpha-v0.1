const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, PermissionsBitField } = require("discord.js")
const sendModLog = require("../../Events/utils/sendModLog")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("untimeout")
    .setDescription("Kullanıcının zaman aşımını kaldırır.")
    .addUserOption((option) =>
      option.setName("hedef").setDescription("Zaman aşımı kaldırılacak üyeyi seçiniz").setRequired(true),
    )
    .addStringOption((option) =>
      option.setName("sebep").setDescription("Zaman aşımını kaldırma sebebi").setRequired(false),
    ),

  async execute(interaction) {
    // Yanıtı ertele
    await interaction.deferReply()

    const { options, guild } = interaction
    const user = options.getUser("hedef")
    const reason = options.getString("sebep") || "Sebep belirtilmedi"
    const targetMember = guild.members.cache.get(user.id)

    // Yetki kontrolü
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      const noPermEmbed = new EmbedBuilder()
        .setTitle("❌ Yetki Hatası")
        .setDescription("🚫 Bu komutu kullanmak için **Üyeleri Yönet** yetkisine sahip olmalısın!")
        .setColor("Red")
        .setTimestamp()

      return interaction.editReply({ embeds: [noPermEmbed] })
    }

    // Botun yetkisi var mı kontrol et
    if (!guild.members.me.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      const botNoPermEmbed = new EmbedBuilder()
        .setTitle("❌ Bot Yetki Hatası")
        .setDescription("🤖 Bu işlemi gerçekleştirmek için yeterli yetkiye sahip değilim!")
        .setColor("Red")
        .setTimestamp()

      return interaction.editReply({ embeds: [botNoPermEmbed] })
    }

    // Kullanıcı kontrolü
    if (!targetMember) {
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("❌ Kullanıcı Bulunamadı")
            .setDescription("🔍 Belirtilen kullanıcı artık sunucuda değil!")
            .setColor("Red")
            .setTimestamp(),
        ],
      })
    }

    // Kullanıcı zaman aşımında mı kontrolü
    if (!targetMember.communicationDisabledUntil) {
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("❌ İşlem Başarısız")
            .setDescription("⏱️ Bu kullanıcı zaten zaman aşımında değil!")
            .setColor("Red")
            .setTimestamp(),
        ],
      })
    }

    try {
      // İlk aşama embed'i
      const checkingEmbed = new EmbedBuilder()
        .setTitle("⏳ Zaman Aşımı Kaldırma İşlemi Başlatıldı")
        .setDescription("🔍 Üye kontrol ediliyor...\n👮‍♂️ Lütfen bekleyin!")
        .setColor("Blue")
        .setTimestamp()

      await interaction.editReply({ embeds: [checkingEmbed] })

      // Biraz bekleyelim ki kullanıcı mesajı görebilsin
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // İkinci aşama embed'i
      const userFoundEmbed = new EmbedBuilder()
        .setTitle("🔍 Zaman Aşımı Kaldırma İşlemi Devam Ediyor")
        .setDescription(`⏳ Üye kontrol ediliyor...\n✅ **Üye bulundu:** ${user.tag}\n🔄 İşlem devam ediyor...`)
        .setColor("Blue")
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .setTimestamp()

      await interaction.editReply({ embeds: [userFoundEmbed] })

      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Zaman aşımı bitiş zamanını kaydet (bilgi amaçlı)
      const timeoutEndTime = targetMember.communicationDisabledUntil
      const remainingTime = timeoutEndTime.getTime() - Date.now()
      const formattedRemainingTime = formatMilliseconds(remainingTime)

      // Üçüncü aşama embed'i
      const removingTimeoutEmbed = new EmbedBuilder()
        .setTitle("⏳ Zaman Aşımı Kaldırılıyor")
        .setDescription(`✅ Üye kontrol edildi ve bulundu.\n⏱️ Üyenin zaman aşımı kaldırılıyor...\n⌛ Lütfen bekleyin!`)
        .addFields(
          { name: "👤 Kullanıcı", value: `${user.tag}`, inline: true },
          { name: "🆔 Kullanıcı ID", value: `${user.id}`, inline: true },
          { name: "⏱️ Kalan Süre", value: formattedRemainingTime, inline: true },
          { name: "📝 Kaldırma Sebebi", value: reason },
        )
        .setColor("Yellow")
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .setTimestamp()

      await interaction.editReply({ embeds: [removingTimeoutEmbed] })

      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Zaman aşımını kaldır
      await targetMember.timeout(null, `${reason} (Kaldıran: ${interaction.user.tag})`)

      // Son aşama embed'i
      const timeoutRemovedEmbed = new EmbedBuilder()
        .setTitle("✅ Zaman Aşımı Kaldırıldı")
        .setDescription(`🎉 Kullanıcının zaman aşımı başarıyla kaldırıldı!`)
        .addFields(
          { name: "👤 Kullanıcı", value: `${user.tag}`, inline: true },
          { name: "🆔 Kullanıcı ID", value: `${user.id}`, inline: true },
          { name: "👮‍♂️ Kaldıran", value: `${interaction.user.tag}`, inline: true },
          { name: "⏱️ Kaldırılan Süre", value: formattedRemainingTime, inline: true },
          { name: "📝 Kaldırma Sebebi", value: reason },
        )
        .setColor("Green")
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .setFooter({
          text: `${interaction.guild.name} • ${new Date().toLocaleString()}`,
          iconURL: interaction.guild.iconURL({ dynamic: true }),
        })
        .setTimestamp()

      // DM Embed'i
      const dmEmbed = new EmbedBuilder()
        .setTitle("🔓 Zaman Aşımı Kaldırıldı")
        .setDescription(
          `**${guild.name}** sunucusundaki zaman aşımınız kaldırıldı. Artık tekrar mesaj gönderebilirsiniz!`,
        )
        .addFields(
          { name: "👮‍♂️ Kaldıran", value: `${interaction.user.tag}`, inline: true },
          { name: "📝 Kaldırma Sebebi", value: reason },
        )
        .setColor("Green")
        .setThumbnail(guild.iconURL({ dynamic: true }))
        .setFooter({
          text: `${guild.name} • ${new Date().toLocaleString()}`,
          iconURL: guild.iconURL({ dynamic: true }),
        })
        .setTimestamp()

      // DM göndermeyi dene
      await targetMember.send({ embeds: [dmEmbed] }).catch((err) => {
        // DM gönderilemezse sessizce devam et
        console.log(`${user.tag} kullanıcısına DM gönderilemedi: ${err.message}`)
      })

      // Son embed'i gönder
      await interaction.editReply({ embeds: [timeoutRemovedEmbed] })

      // Moderasyon log kanalına gönder
      await sendModLog({
        guild: guild,
        moderator: interaction.user,
        user: user,
        action: "untimeout",
        reason: reason,
        duration: formattedRemainingTime,
        color: "Green",
        fields: [{ name: "⏱️ Kaldırılan Süre", value: formattedRemainingTime, inline: true }],
      })
    } catch (error) {
      console.error(error)

      const errorEmbed = new EmbedBuilder()
        .setTitle("❌ Hata")
        .setDescription(`⚠️ Zaman aşımı kaldırılırken bir hata oluştu: ${error.message}`)
        .setColor("Red")
        .setTimestamp()

      await interaction.editReply({ embeds: [errorEmbed] })
    }
  },
}

// Milisaniyeleri formatlayan yardımcı fonksiyon
function formatMilliseconds(ms) {
  if (ms <= 0) return "⏱️ 0 saniye"

  const seconds = Math.floor(ms / 1000)

  if (seconds < 60) return `⏱️ ${seconds} saniye`
  if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60)
    const remainingSec = seconds % 60
    return `⏱️ ${minutes} dakika${remainingSec > 0 ? ` ${remainingSec} saniye` : ""}`
  }
  if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `⏱️ ${hours} saat${minutes > 0 ? ` ${minutes} dakika` : ""}`
  }
  if (seconds < 604800) {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    return `⏱️ ${days} gün${hours > 0 ? ` ${hours} saat` : ""}`
  }
  if (seconds < 2592000) {
    const weeks = Math.floor(seconds / 604800)
    const days = Math.floor((seconds % 604800) / 86400)
    return `⏱️ ${weeks} hafta${days > 0 ? ` ${days} gün` : ""}`
  }

  const months = Math.floor(seconds / 2592000)
  const days = Math.floor((seconds % 2592000) / 86400)
  return `⏱️ ${months} ay${days > 0 ? ` ${days} gün` : ""}`
}

