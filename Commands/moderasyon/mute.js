const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, PermissionsBitField } = require("discord.js")
const sendModLog = require("../../Events/utils/sendModLog")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("timeout")
    .setDescription("Kullanıcıya bir zaman aşımı uygular.")
    .addUserOption((option) =>
      option.setName("hedef").setDescription("Zaman aşımı uygulanacak üyeyi seçiniz").setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("sure")
        .setDescription("Zaman aşımı yapacak süreyi seçiniz")
        .setRequired(true)
        .addChoices(
          { name: "60 saniye", value: "60" },
          { name: "2 dakika", value: "120" },
          { name: "5 dakika", value: "300" },
          { name: "10 dakika", value: "600" },
          { name: "15 dakika", value: "900" },
          { name: "20 dakika", value: "1200" },
          { name: "30 dakika", value: "1800" },
          { name: "45 dakika", value: "2700" },
          { name: "1 saat", value: "3600" },
          { name: "2 saat", value: "7200" },
          { name: "3 saat", value: "10800" },
          { name: "5 saat", value: "18000" },
          { name: "10 saat", value: "36000" },
          { name: "1 gün", value: "86400" },
          { name: "2 gün", value: "172800" },
          { name: "3 gün", value: "259200" },
          { name: "5 gün", value: "432000" },
          { name: "1 hafta", value: "604800" },
          { name: "2 hafta", value: "1209600" },
          { name: "1 ay", value: "2592000" },
          { name: "2 ay", value: "5184000" },
          { name: "3 ay", value: "7776000" },
          { name: "4 ay", value: "10368000" },
        ),
    )
    .addStringOption((option) =>
      option.setName("sebep").setDescription("Zaman aşımı yapacak sebep giriniz").setRequired(false),
    ),

  async execute(interaction) {
    // Yanıtı ertele
    await interaction.deferReply()

    const { options, guild } = interaction
    const user = options.getUser("hedef")
    const duration = options.getString("sure")
    const reason = options.getString("sebep") || "Sebep belirtilmedi"
    const timeMember = guild.members.cache.get(user.id)

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
    if (!timeMember) {
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

    // Kullanıcı zaman aşımı uygulanabilir mi kontrolü
    if (!timeMember.moderatable) {
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("❌ İşlem Başarısız")
            .setDescription("🛡️ Bu üyeye zaman aşımı uygulayamam! Kullanıcının rolü benden yüksek olabilir.")
            .setColor("Red")
            .setTimestamp(),
        ],
      })
    }

    // Kendine zaman aşımı uygulama kontrolü
    if (interaction.member.id === timeMember.id) {
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("❌ İşlem Başarısız")
            .setDescription("🤔 Kendine zaman aşımı uygulayamazsın!")
            .setColor("Red")
            .setTimestamp(),
        ],
      })
    }

    // Admin kontrolü
    if (timeMember.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("❌ İşlem Başarısız")
            .setDescription("⚠️ Yönetici yetkisine sahip üyelere zaman aşımı uygulayamazsın!")
            .setColor("Red")
            .setTimestamp(),
        ],
      })
    }

    try {
      // İlk aşama embed'i
      const checkingEmbed = new EmbedBuilder()
        .setTitle("⏳ Zaman Aşımı İşlemi Başlatıldı")
        .setDescription("🔍 Üye kontrol ediliyor...\n👮‍♂️ Lütfen bekleyin!")
        .setColor("Blue")
        .setTimestamp()

      await interaction.editReply({ embeds: [checkingEmbed] })

      // Biraz bekleyelim ki kullanıcı mesajı görebilsin
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // İkinci aşama embed'i
      const userFoundEmbed = new EmbedBuilder()
        .setTitle("🔍 Zaman Aşımı İşlemi Devam Ediyor")
        .setDescription(`⏳ Üye kontrol ediliyor...\n✅ **Üye bulundu:** ${user.tag}\n🔄 İşlem devam ediyor...`)
        .setColor("Blue")
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .setTimestamp()

      await interaction.editReply({ embeds: [userFoundEmbed] })

      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Zaman aşımının bitiş zamanını hesapla
      const timeoutEndTime = Date.now() + Number.parseInt(duration) * 1000
      const timeoutEndTimestamp = Math.floor(timeoutEndTime / 1000)

      // Üçüncü aşama embed'i
      const timeoutingEmbed = new EmbedBuilder()
        .setTitle("⏳ Zaman Aşımı Uygulanıyor")
        .setDescription(`✅ Üye kontrol edildi ve bulundu.\n⏱️ Üyeye zaman aşımı uygulanıyor...\n⌛ Lütfen bekleyin!`)
        .addFields(
          { name: "👤 Kullanıcı", value: `${user.tag}`, inline: true },
          { name: "🆔 Kullanıcı ID", value: `${user.id}`, inline: true },
          { name: "⏱️ Süre", value: formatDuration(duration), inline: true },
          { name: "📝 Sebep", value: reason },
        )
        .setColor("Yellow")
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .setTimestamp()

      await interaction.editReply({ embeds: [timeoutingEmbed] })

      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Zaman aşımı uygula
      await timeMember.timeout(Number.parseInt(duration) * 1000, `${reason} (Uygulayan: ${interaction.user.tag})`)

      // Son aşama embed'i
      const timeoutEmbed = new EmbedBuilder()
        .setTitle("✅ Zaman Aşımı Uygulandı")
        .setDescription(`🎉 Kullanıcıya başarıyla zaman aşımı uygulandı!`)
        .addFields(
          { name: "👤 Kullanıcı", value: `${user.tag}`, inline: true },
          { name: "🆔 Kullanıcı ID", value: `${user.id}`, inline: true },
          { name: "👮‍♂️ Uygulayan", value: `${interaction.user.tag}`, inline: true },
          { name: "⏱️ Süre", value: formatDuration(duration), inline: true },
          { name: "⏰ Bitiş Zamanı", value: `<t:${timeoutEndTimestamp}:R>`, inline: true },
          { name: "📝 Sebep", value: reason },
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
        .setTitle("⚠️ Zaman Aşımı Bildirimi")
        .setDescription(`**${guild.name}** sunucusunda size zaman aşımı uygulandı.`)
        .addFields(
          { name: "⏱️ Süre", value: formatDuration(duration), inline: true },
          { name: "⏰ Bitiş Zamanı", value: `<t:${timeoutEndTimestamp}:R>`, inline: true },
          { name: "👮‍♂️ Uygulayan", value: `${interaction.user.tag}`, inline: true },
          { name: "📝 Sebep", value: reason },
        )
        .setColor("Orange")
        .setThumbnail(guild.iconURL({ dynamic: true }))
        .setFooter({
          text: `${guild.name} • ${new Date().toLocaleString()}`,
          iconURL: guild.iconURL({ dynamic: true }),
        })
        .setTimestamp()

      // DM göndermeyi dene
      await timeMember.send({ embeds: [dmEmbed] }).catch((err) => {
        // DM gönderilemezse sessizce devam et
        console.log(`${user.tag} kullanıcısına DM gönderilemedi: ${err.message}`)
      })

      // Son embed'i gönder
      const sentMessage = await interaction.editReply({ embeds: [timeoutEmbed] })

      // Moderasyon log kanalına gönder
      await sendModLog({
        guild: guild,
        moderator: interaction.user,
        user: user,
        action: "timeout",
        reason: reason,
        duration: formatDuration(duration),
        color: "Orange",
        fields: [{ name: "⏰ Bitiş Zamanı", value: `<t:${timeoutEndTimestamp}:R>`, inline: true }],
      })

      // Zaman aşımı sona erdiğinde bildirim gönder
      // Maksimum setTimeout süresi 2^31-1 ms (yaklaşık 24.8 gün) olduğu için kontrol ekliyoruz
      const timeoutDuration = Number.parseInt(duration) * 1000

      // Zaman aşımı süresi 24 günden az ise setTimeout kullan
      if (timeoutDuration <= 2147483647) {
        setTimeout(async () => {
          try {
            // Sunucuyu ve kullanıcıyı yeniden kontrol et (hala sunucuda mı?)
            const guild = interaction.client.guilds.cache.get(interaction.guild.id)
            if (!guild) return // Sunucu artık yok

            const member = await guild.members.fetch(user.id).catch(() => null)
            const channel = guild.channels.cache.get(interaction.channel.id)

            if (!channel) return // Kanal artık yok

            // Zaman aşımı sona erdi bildirimi - Kanal için
            const timeoutEndedEmbed = new EmbedBuilder()
              .setTitle("🔓 Zaman Aşımı Sona Erdi")
              .setDescription(`${user} kullanıcısının zaman aşımı süresi sona erdi!`)
              .addFields(
                { name: "👤 Kullanıcı", value: `${user.tag}`, inline: true },
                { name: "🆔 Kullanıcı ID", value: `${user.id}`, inline: true },
                { name: "⏱️ Uygulanan Süre", value: formatDuration(duration), inline: true },
                { name: "👮‍♂️ Uygulayan Yetkili", value: `${interaction.user.tag}`, inline: true },
                { name: "📝 Sebep", value: reason },
              )
              .setColor("Green")
              .setThumbnail(user.displayAvatarURL({ dynamic: true }))
              .setFooter({
                text: `${guild.name} • ${new Date().toLocaleString()}`,
                iconURL: guild.iconURL({ dynamic: true }),
              })
              .setTimestamp()

            // Kanala bildirim gönder
            await channel.send({ embeds: [timeoutEndedEmbed] })

            // Kullanıcı hala sunucuda ise DM gönder
            if (member) {
              const dmTimeoutEndedEmbed = new EmbedBuilder()
                .setTitle("🔓 Zaman Aşımı Sona Erdi")
                .setDescription(
                  `**${guild.name}** sunucusundaki zaman aşımı süreniz sona erdi! Artık tekrar mesaj gönderebilirsiniz.`,
                )
                .addFields(
                  { name: "⏱️ Uygulanan Süre", value: formatDuration(duration), inline: true },
                  { name: "📅 Sona Erme Zamanı", value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
                )
                .setColor("Green")
                .setThumbnail(guild.iconURL({ dynamic: true }))
                .setFooter({
                  text: `${guild.name} • ${new Date().toLocaleString()}`,
                  iconURL: guild.iconURL({ dynamic: true }),
                })
                .setTimestamp()

              await member.send({ embeds: [dmTimeoutEndedEmbed] }).catch(() => {
                // DM gönderilemezse sessizce devam et
              })
            }

            // Moderasyon log kanalına zaman aşımı sona erdi bildirimi gönder
            await sendModLog({
              guild: guild,
              moderator: interaction.client.user, // Bot kendisi
              user: user,
              action: "untimeout",
              reason: "Zaman aşımı süresi doldu",
              color: "Green",
              fields: [
                { name: "⏱️ Uygulanan Süre", value: formatDuration(duration), inline: true },
                { name: "👮‍♂️ Uygulayan Yetkili", value: interaction.user.tag, inline: true },
              ],
            })
          } catch (error) {
            console.error("Zaman aşımı sona erme bildirimi gönderilirken hata oluştu:", error)
          }
        }, timeoutDuration)
      } else {
        // 24 günden uzun süreler için bilgi mesajı
        console.log(
          `${user.tag} kullanıcısına uygulanan zaman aşımı süresi çok uzun olduğu için otomatik bildirim gönderilmeyecek.`,
        )
      }
    } catch (error) {
      console.error(error)

      const errorEmbed = new EmbedBuilder()
        .setTitle("❌ Hata")
        .setDescription(`⚠️ Zaman aşımı uygulanırken bir hata oluştu: ${error.message}`)
        .setColor("Red")
        .setTimestamp()

      await interaction.editReply({ embeds: [errorEmbed] })
    }
  },
}

// Süreyi formatlayan yardımcı fonksiyon
function formatDuration(seconds) {
  const sec = Number.parseInt(seconds)

  if (sec < 60) return `⏱️ ${sec} saniye`
  if (sec < 3600) {
    const minutes = Math.floor(sec / 60)
    const remainingSec = sec % 60
    return `⏱️ ${minutes} dakika${remainingSec > 0 ? ` ${remainingSec} saniye` : ""}`
  }
  if (sec < 86400) {
    const hours = Math.floor(sec / 3600)
    const minutes = Math.floor((sec % 3600) / 60)
    return `⏱️ ${hours} saat${minutes > 0 ? ` ${minutes} dakika` : ""}`
  }
  if (sec < 604800) {
    const days = Math.floor(sec / 86400)
    const hours = Math.floor((sec % 86400) / 3600)
    return `⏱️ ${days} gün${hours > 0 ? ` ${hours} saat` : ""}`
  }
  if (sec < 2592000) {
    const weeks = Math.floor(sec / 604800)
    const days = Math.floor((sec % 604800) / 86400)
    return `⏱️ ${weeks} hafta${days > 0 ? ` ${days} gün` : ""}`
  }

  const months = Math.floor(sec / 2592000)
  const days = Math.floor((sec % 2592000) / 86400)
  return `⏱️ ${months} ay${days > 0 ? ` ${days} gün` : ""}`
}

