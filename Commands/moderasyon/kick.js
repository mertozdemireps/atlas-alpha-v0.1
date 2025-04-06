const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Belirtilen kullanıcıyı sunucudan atar.")
    .addUserOption((option) => option.setName("hedef").setDescription("Atılacak kullanıcı").setRequired(true))
    .addStringOption((option) => option.setName("sebep").setDescription("Atılma sebebi").setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  async execute(interaction) {
    // Önce yanıtı erteleyelim
    await interaction.deferReply()

    // Komutu kullanan kişinin yetkisi var mı kontrol et
    if (!interaction.member.permissions.has(PermissionFlagsBits.KickMembers)) {
      const noPermEmbed = new EmbedBuilder()
        .setTitle("❌ Yetki Hatası")
        .setDescription("🚫 Bu komutu kullanmak için **Üyeleri At** yetkisine sahip olmalısın!")
        .setColor("Red")
        .setTimestamp()

      return interaction.editReply({ embeds: [noPermEmbed] })
    }

    // Botun yetkisi var mı kontrol et
    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.KickMembers)) {
      const botNoPermEmbed = new EmbedBuilder()
        .setTitle("❌ Bot Yetki Hatası")
        .setDescription("🤖 Bu işlemi gerçekleştirmek için yeterli yetkiye sahip değilim!")
        .setColor("Red")
        .setTimestamp()

      return interaction.editReply({ embeds: [botNoPermEmbed] })
    }

    const hedefKullanici = interaction.options.getUser("hedef")
    const sebep = interaction.options.getString("sebep") || "Sebep belirtilmedi"

    try {
      // İlk aşama embed'i
      const checkingEmbed = new EmbedBuilder()
        .setTitle("🔍 Kick İşlemi Başlatıldı")
        .setDescription("⏳ Üye kontrol ediliyor...\n👮‍♂️ Lütfen bekleyin!")
        .setColor("Blue")
        .setTimestamp()

      await interaction.editReply({ embeds: [checkingEmbed] })

      // Biraz bekleyelim ki kullanıcı mesajı görebilsin
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Hedef kullanıcıyı sunucudan al
      const hedefUye = await interaction.guild.members.fetch(hedefKullanici.id).catch(() => null)

      // Kullanıcı sunucuda mı kontrol et
      if (!hedefUye) {
        const notFoundEmbed = new EmbedBuilder()
          .setTitle("❌ Kick İşlemi Başarısız")
          .setDescription(`🚫 **${hedefKullanici.tag}** kullanıcısı sunucuda bulunamadı!`)
          .setColor("Red")
          .setTimestamp()

        return interaction.editReply({ embeds: [notFoundEmbed] })
      }

      // İkinci aşama embed'i
      const userFoundEmbed = new EmbedBuilder()
        .setTitle("🔍 Kick İşlemi Devam Ediyor")
        .setDescription(
          `⏳ Üye kontrol ediliyor...\n✅ **Üye bulundu:** ${hedefKullanici.tag}\n🔄 İşlem devam ediyor...`,
        )
        .setColor("Blue")
        .setThumbnail(hedefKullanici.displayAvatarURL({ dynamic: true }))
        .setTimestamp()

      await interaction.editReply({ embeds: [userFoundEmbed] })

      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Kullanıcı atılabilir mi kontrol et
      if (!hedefUye.kickable) {
        const notKickableEmbed = new EmbedBuilder()
          .setTitle("❌ Kick İşlemi Başarısız")
          .setDescription(
            `🚫 **${hedefKullanici.tag}** kullanıcısını atamıyorum! Bu kullanıcı benden daha yüksek bir role sahip olabilir.`,
          )
          .setColor("Red")
          .setThumbnail(hedefKullanici.displayAvatarURL({ dynamic: true }))
          .setTimestamp()

        return interaction.editReply({ embeds: [notKickableEmbed] })
      }

      // Komutu kullanan kişinin rolü, hedef kullanıcının rolünden düşük mü kontrol et
      if (interaction.member.roles.highest.position <= hedefUye.roles.highest.position) {
        const higherRoleEmbed = new EmbedBuilder()
          .setTitle("❌ Kick İşlemi Başarısız")
          .setDescription(
            `🚫 **${hedefKullanici.tag}** kullanıcısını atamazsınız! Bu kullanıcı sizinle aynı veya daha yüksek bir role sahip.`,
          )
          .setColor("Red")
          .setThumbnail(hedefKullanici.displayAvatarURL({ dynamic: true }))
          .setTimestamp()

        return interaction.editReply({ embeds: [higherRoleEmbed] })
      }

      // Üçüncü aşama embed'i
      const kickingEmbed = new EmbedBuilder()
        .setTitle("⏳ Kick İşlemi Devam Ediyor")
        .setDescription(`✅ Üye kontrol edildi ve bulundu.\n👢 Üye sunucudan atılıyor...\n⏱️ Lütfen bekleyin!`)
        .addFields(
          { name: "👤 Kullanıcı", value: `${hedefKullanici.tag}`, inline: true },
          { name: "🆔 Kullanıcı ID", value: `${hedefKullanici.id}`, inline: true },
          { name: "📝 Sebep", value: sebep },
        )
        .setColor("Yellow")
        .setThumbnail(hedefKullanici.displayAvatarURL({ dynamic: true }))
        .setTimestamp()

      await interaction.editReply({ embeds: [kickingEmbed] })

      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Kullanıcıyı sunucudan at
      await hedefUye.kick(`${sebep} (Atan: ${interaction.user.tag})`)

      // Son aşama embed'i
      const kickedEmbed = new EmbedBuilder()
        .setTitle("✅ Kick İşlemi Tamamlandı")
        .setDescription(`🎉 Kullanıcı başarıyla sunucudan atıldı!`)
        .addFields(
          { name: "👤 Kullanıcı", value: `${hedefKullanici.tag}`, inline: true },
          { name: "🆔 Kullanıcı ID", value: `${hedefKullanici.id}`, inline: true },
          { name: "👮‍♂️ Atan Yetkili", value: `${interaction.user.tag}`, inline: true },
          { name: "📝 Sebep", value: sebep },
        )
        .setColor("Green")
        .setThumbnail(hedefKullanici.displayAvatarURL({ dynamic: true }))
        .setFooter({
          text: `${interaction.guild.name} • ${new Date().toLocaleString()}`,
          iconURL: interaction.guild.iconURL({ dynamic: true }),
        })
        .setTimestamp()

      await interaction.editReply({ embeds: [kickedEmbed] })
    } catch (error) {
      console.error(error)

      const errorEmbed = new EmbedBuilder()
        .setTitle("❌ Hata")
        .setDescription(`⚠️ Kullanıcı atılırken bir hata oluştu: ${error.message}`)
        .setColor("Red")
        .setTimestamp()

      await interaction.editReply({ embeds: [errorEmbed] })
    }
  },
}

