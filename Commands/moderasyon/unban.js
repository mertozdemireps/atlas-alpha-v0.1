const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unban")
    .setDescription("Belirtilen kullanıcının yasağını kaldırır.")
    .addStringOption((option) =>
      option.setName("kullanici_id").setDescription("Yasağı kaldırılacak kullanıcının ID'si").setRequired(true),
    )
    .addStringOption((option) => option.setName("sebep").setDescription("Yasağı kaldırma sebebi").setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction) {
    // Önce yanıtı erteleyelim
    await interaction.deferReply()

    // Komutu kullanan kişinin yetkisi var mı kontrol et
    if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      const noPermEmbed = new EmbedBuilder()
        .setTitle("❌ Yetki Hatası")
        .setDescription("🚫 Bu komutu kullanmak için **Üyeleri Yasakla** yetkisine sahip olmalısın!")
        .setColor("Red")
        .setTimestamp()

      return interaction.editReply({ embeds: [noPermEmbed] })
    }

    // Botun yetkisi var mı kontrol et
    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) {
      const botNoPermEmbed = new EmbedBuilder()
        .setTitle("❌ Bot Yetki Hatası")
        .setDescription("🤖 Bu işlemi gerçekleştirmek için yeterli yetkiye sahip değilim!")
        .setColor("Red")
        .setTimestamp()

      return interaction.editReply({ embeds: [botNoPermEmbed] })
    }

    const kullaniciId = interaction.options.getString("kullanici_id")
    const sebep = interaction.options.getString("sebep") || "Sebep belirtilmedi"

    try {
      // ID geçerli mi kontrol et
      if (!/^\d+$/.test(kullaniciId)) {
        const invalidIdEmbed = new EmbedBuilder()
          .setTitle("❌ Geçersiz ID")
          .setDescription("🚫 Geçersiz kullanıcı ID'si! Lütfen sayısal bir ID girin.")
          .setColor("Red")
          .setTimestamp()

        return interaction.editReply({ embeds: [invalidIdEmbed] })
      }

      // İlk aşama embed'i
      const checkingEmbed = new EmbedBuilder()
        .setTitle("🔍 Yasak Kaldırma İşlemi Başlatıldı")
        .setDescription("⏳ Yasaklı kullanıcı kontrol ediliyor...\n👮‍♂️ Lütfen bekleyin!")
        .addFields({ name: "🆔 Kullanıcı ID", value: kullaniciId })
        .setColor("Blue")
        .setTimestamp()

      await interaction.editReply({ embeds: [checkingEmbed] })

      // Biraz bekleyelim ki kullanıcı mesajı görebilsin
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Sunucunun yasaklı kullanıcılarını getir
      const banListesi = await interaction.guild.bans.fetch()

      // Kullanıcı yasaklı mı kontrol et
      const banInfo = banListesi.find((ban) => ban.user.id === kullaniciId)

      if (!banInfo) {
        const notBannedEmbed = new EmbedBuilder()
          .setTitle("❌ Yasak Kaldırma İşlemi Başarısız")
          .setDescription("🚫 Bu kullanıcı sunucudan yasaklı değil!")
          .addFields({ name: "🆔 Kullanıcı ID", value: kullaniciId })
          .setColor("Red")
          .setTimestamp()

        return interaction.editReply({ embeds: [notBannedEmbed] })
      }

      // İkinci aşama embed'i - Kullanıcı bulundu
      const userFoundEmbed = new EmbedBuilder()
        .setTitle("🔍 Yasak Kaldırma İşlemi Devam Ediyor")
        .setDescription(
          `⏳ Yasaklı kullanıcı kontrol ediliyor...\n✅ **Yasaklı kullanıcı bulundu:** ${banInfo.user.tag}\n🔄 İşlem devam ediyor...`,
        )
        .addFields(
          { name: "👤 Kullanıcı", value: banInfo.user.tag, inline: true },
          { name: "🆔 Kullanıcı ID", value: kullaniciId, inline: true },
          { name: "📝 Yasaklanma Sebebi", value: banInfo.reason || "Sebep belirtilmemiş" },
        )
        .setColor("Blue")
        .setThumbnail(banInfo.user.displayAvatarURL({ dynamic: true }))
        .setTimestamp()

      await interaction.editReply({ embeds: [userFoundEmbed] })

      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Üçüncü aşama embed'i - Yasak kaldırılıyor
      const unbanningEmbed = new EmbedBuilder()
        .setTitle("⏳ Yasak Kaldırma İşlemi Devam Ediyor")
        .setDescription(`✅ Yasaklı kullanıcı bulundu.\n🔓 Kullanıcının yasağı kaldırılıyor...\n⏱️ Lütfen bekleyin!`)
        .addFields(
          { name: "👤 Kullanıcı", value: banInfo.user.tag, inline: true },
          { name: "🆔 Kullanıcı ID", value: kullaniciId, inline: true },
          { name: "📝 Yasak Kaldırma Sebebi", value: sebep },
        )
        .setColor("Yellow")
        .setThumbnail(banInfo.user.displayAvatarURL({ dynamic: true }))
        .setTimestamp()

      await interaction.editReply({ embeds: [unbanningEmbed] })

      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Kullanıcının yasağını kaldır
      await interaction.guild.members.unban(kullaniciId, `${sebep} (Yasağı Kaldıran: ${interaction.user.tag})`)

      // Son aşama embed'i - Yasak kaldırıldı
      const unbannedEmbed = new EmbedBuilder()
        .setTitle("✅ Yasak Kaldırma İşlemi Tamamlandı")
        .setDescription(`🎉 Kullanıcının yasağı başarıyla kaldırıldı!`)
        .addFields(
          { name: "👤 Kullanıcı", value: banInfo.user.tag, inline: true },
          { name: "🆔 Kullanıcı ID", value: kullaniciId, inline: true },
          { name: "👮‍♂️ Yasağı Kaldıran", value: interaction.user.tag, inline: true },
          { name: "📝 Yasak Kaldırma Sebebi", value: sebep },
          { name: "📜 Önceki Yasaklanma Sebebi", value: banInfo.reason || "Sebep belirtilmemiş" },
        )
        .setColor("Green")
        .setThumbnail(banInfo.user.displayAvatarURL({ dynamic: true }))
        .setFooter({
          text: `${interaction.guild.name} • ${new Date().toLocaleString()}`,
          iconURL: interaction.guild.iconURL({ dynamic: true }),
        })
        .setTimestamp()

      await interaction.editReply({ embeds: [unbannedEmbed] })
    } catch (error) {
      console.error(error)

      const errorEmbed = new EmbedBuilder()
        .setTitle("❌ Hata")
        .setDescription(`⚠️ Kullanıcının yasağı kaldırılırken bir hata oluştu: ${error.message}`)
        .setColor("Red")
        .setTimestamp()

      await interaction.editReply({ embeds: [errorEmbed] })
    }
  },
}

