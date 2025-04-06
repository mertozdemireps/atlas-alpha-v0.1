const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Belirtilen kullanıcıyı sunucudan yasaklar.")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("kullanici")
        .setDescription("Kullanıcıyı seçerek yasakla")
        .addUserOption((option) => option.setName("hedef").setDescription("Yasaklanacak kullanıcı").setRequired(true))
        .addStringOption((option) => option.setName("sebep").setDescription("Yasaklama sebebi").setRequired(false))
        .addIntegerOption((option) =>
          option
            .setName("gun")
            .setDescription("Silinecek mesaj geçmişi (gün olarak, 0-7)")
            .setMinValue(0)
            .setMaxValue(7)
            .setRequired(false),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("id")
        .setDescription("ID kullanarak yasakla")
        .addStringOption((option) =>
          option.setName("kullanici_id").setDescription("Yasaklanacak kullanıcının ID'si").setRequired(true),
        )
        .addStringOption((option) => option.setName("sebep").setDescription("Yasaklama sebebi").setRequired(false))
        .addIntegerOption((option) =>
          option
            .setName("gun")
            .setDescription("Silinecek mesaj geçmişi (gün olarak, 0-7)")
            .setMinValue(0)
            .setMaxValue(7)
            .setRequired(false),
        ),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction) {
    // Önce yanıtı erteleyelim çünkü ban listesini çekmek zaman alabilir
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

    const subCommand = interaction.options.getSubcommand()
    const sebep = interaction.options.getString("sebep") || "Sebep belirtilmedi"
    const gun = interaction.options.getInteger("gun") || 0

    try {
      // İlk aşama embed'i
      const checkingEmbed = new EmbedBuilder()
        .setTitle("🔍 Ban İşlemi Başlatıldı")
        .setDescription("⏳ Üye kontrol ediliyor...\n👮‍♂️ Lütfen bekleyin!")
        .setColor("Blue")
        .setTimestamp()

      await interaction.editReply({ embeds: [checkingEmbed] })

      // Biraz bekleyelim ki kullanıcı mesajı görebilsin
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Sunucunun ban listesini al
      const banListesi = await interaction.guild.bans.fetch()

      if (subCommand === "kullanici") {
        const hedefKullanici = interaction.options.getUser("hedef")

        // İkinci aşama embed'i
        const userFoundEmbed = new EmbedBuilder()
          .setTitle("🔍 Ban İşlemi Devam Ediyor")
          .setDescription(
            `⏳ Üye kontrol ediliyor...\n✅ **Üye bulundu:** ${hedefKullanici.tag}\n🔄 İşlem devam ediyor...`,
          )
          .setColor("Blue")
          .setThumbnail(hedefKullanici.displayAvatarURL({ dynamic: true }))
          .setTimestamp()

        await interaction.editReply({ embeds: [userFoundEmbed] })

        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Kullanıcı zaten banlı mı kontrol et
        const banInfo = banListesi.find((ban) => ban.user.id === hedefKullanici.id)

        if (banInfo) {
          const alreadyBannedEmbed = new EmbedBuilder()
            .setTitle("❌ Ban İşlemi Başarısız")
            .setDescription(`🚫 Bu kullanıcı zaten sunucudan yasaklanmış durumda!`)
            .addFields(
              { name: "👤 Kullanıcı", value: `${hedefKullanici.tag}`, inline: true },
              { name: "🆔 Kullanıcı ID", value: `${hedefKullanici.id}`, inline: true },
              { name: "📝 Yasaklanma Sebebi", value: `${banInfo.reason || "Sebep belirtilmemiş"}` },
            )
            .setColor("Red")
            .setThumbnail(hedefKullanici.displayAvatarURL({ dynamic: true }))
            .setTimestamp()

          return interaction.editReply({ embeds: [alreadyBannedEmbed] })
        }

        // Üçüncü aşama embed'i
        const banningEmbed = new EmbedBuilder()
          .setTitle("⏳ Ban İşlemi Devam Ediyor")
          .setDescription(`✅ Üye kontrol edildi ve bulundu.\n🔨 Üye sunucudan yasaklanıyor...\n⏱️ Lütfen bekleyin!`)
          .addFields(
            { name: "👤 Kullanıcı", value: `${hedefKullanici.tag}`, inline: true },
            { name: "🆔 Kullanıcı ID", value: `${hedefKullanici.id}`, inline: true },
            { name: "📝 Sebep", value: sebep },
          )
          .setColor("Yellow")
          .setThumbnail(hedefKullanici.displayAvatarURL({ dynamic: true }))
          .setTimestamp()

        await interaction.editReply({ embeds: [banningEmbed] })

        await new Promise((resolve) => setTimeout(resolve, 1500))

        // Kullanıcıyı sunucudan yasakla
        await interaction.guild.members.ban(hedefKullanici, {
          deleteMessageSeconds: gun * 86400, // Gün * saniye (1 gün = 86400 saniye)
          reason: `${sebep} (Yasaklayan: ${interaction.user.tag})`,
        })

        // Son aşama embed'i
        const bannedEmbed = new EmbedBuilder()
          .setTitle("✅ Ban İşlemi Tamamlandı")
          .setDescription(`🎉 Kullanıcı başarıyla sunucudan yasaklandı!`)
          .addFields(
            { name: "👤 Kullanıcı", value: `${hedefKullanici.tag}`, inline: true },
            { name: "🆔 Kullanıcı ID", value: `${hedefKullanici.id}`, inline: true },
            { name: "👮‍♂️ Yasaklayan", value: `${interaction.user.tag}`, inline: true },
            { name: "📝 Sebep", value: sebep },
            { name: "🗑️ Silinen Mesaj Geçmişi", value: `${gun} gün` },
          )
          .setColor("Green")
          .setThumbnail(hedefKullanici.displayAvatarURL({ dynamic: true }))
          .setFooter({
            text: `${interaction.guild.name} • ${new Date().toLocaleString()}`,
            iconURL: interaction.guild.iconURL({ dynamic: true }),
          })
          .setTimestamp()

        await interaction.editReply({ embeds: [bannedEmbed] })
      } else if (subCommand === "id") {
        const kullaniciId = interaction.options.getString("kullanici_id")

        // ID geçerli mi kontrol et
        if (!/^\d+$/.test(kullaniciId)) {
          const invalidIdEmbed = new EmbedBuilder()
            .setTitle("❌ Geçersiz ID")
            .setDescription("🚫 Geçersiz kullanıcı ID'si! Lütfen sayısal bir ID girin.")
            .setColor("Red")
            .setTimestamp()

          return interaction.editReply({ embeds: [invalidIdEmbed] })
        }

        // İkinci aşama embed'i
        const idFoundEmbed = new EmbedBuilder()
          .setTitle("🔍 Ban İşlemi Devam Ediyor")
          .setDescription(
            `⏳ Üye kontrol ediliyor...\n✅ **Üye bulundu:** ID: ${kullaniciId}\n🔄 İşlem devam ediyor...`,
          )
          .setColor("Blue")
          .setTimestamp()

        await interaction.editReply({ embeds: [idFoundEmbed] })

        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Kullanıcı zaten banlı mı kontrol et
        const banInfo = banListesi.find((ban) => ban.user.id === kullaniciId)

        if (banInfo) {
          const alreadyBannedEmbed = new EmbedBuilder()
            .setTitle("❌ Ban İşlemi Başarısız")
            .setDescription(`🚫 Bu kullanıcı zaten sunucudan yasaklanmış durumda!`)
            .addFields(
              { name: "🆔 Kullanıcı ID", value: kullaniciId },
              { name: "📝 Yasaklanma Sebebi", value: `${banInfo.reason || "Sebep belirtilmemiş"}` },
            )
            .setColor("Red")
            .setTimestamp()

          return interaction.editReply({ embeds: [alreadyBannedEmbed] })
        }

        // Üçüncü aşama embed'i
        const banningEmbed = new EmbedBuilder()
          .setTitle("⏳ Ban İşlemi Devam Ediyor")
          .setDescription(`✅ Üye kontrol edildi ve bulundu.\n🔨 Üye sunucudan yasaklanıyor...\n⏱️ Lütfen bekleyin!`)
          .addFields({ name: "🆔 Kullanıcı ID", value: kullaniciId }, { name: "📝 Sebep", value: sebep })
          .setColor("Yellow")
          .setTimestamp()

        await interaction.editReply({ embeds: [banningEmbed] })

        await new Promise((resolve) => setTimeout(resolve, 1500))

        // ID ile kullanıcıyı yasakla
        await interaction.guild.members.ban(kullaniciId, {
          deleteMessageSeconds: gun * 86400, // Gün * saniye (1 gün = 86400 saniye)
          reason: `${sebep} (Yasaklayan: ${interaction.user.tag})`,
        })

        // Son aşama embed'i
        const bannedEmbed = new EmbedBuilder()
          .setTitle("✅ Ban İşlemi Tamamlandı")
          .setDescription(`🎉 Kullanıcı başarıyla sunucudan yasaklandı!`)
          .addFields(
            { name: "🆔 Kullanıcı ID", value: kullaniciId },
            { name: "👮‍♂️ Yasaklayan", value: `${interaction.user.tag}` },
            { name: "📝 Sebep", value: sebep },
            { name: "🗑️ Silinen Mesaj Geçmişi", value: `${gun} gün` },
          )
          .setColor("Green")
          .setFooter({
            text: `${interaction.guild.name} • ${new Date().toLocaleString()}`,
            iconURL: interaction.guild.iconURL({ dynamic: true }),
          })
          .setTimestamp()

        await interaction.editReply({ embeds: [bannedEmbed] })
      }
    } catch (error) {
      console.error(error)

      const errorEmbed = new EmbedBuilder()
        .setTitle("❌ Hata")
        .setDescription(`⚠️ Kullanıcı yasaklanırken bir hata oluştu: ${error.message}`)
        .setColor("Red")
        .setTimestamp()

      await interaction.editReply({ embeds: [errorEmbed] })
    }
  },
}

