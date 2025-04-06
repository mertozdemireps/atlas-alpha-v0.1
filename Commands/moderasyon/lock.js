const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ChannelType } = require("discord.js")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("kilit")
    .setDescription("Bir kanalı kilitler veya kilidini açar.")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("kilitle")
        .setDescription("Belirtilen kanalı kilitler.")
        .addChannelOption((option) =>
          option
            .setName("kanal")
            .setDescription("Kilitlenecek kanal (boş bırakılırsa mevcut kanal)")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(false),
        )
        .addStringOption((option) => option.setName("sebep").setDescription("Kilitleme sebebi").setRequired(false)),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("aç")
        .setDescription("Belirtilen kanalın kilidini açar.")
        .addChannelOption((option) =>
          option
            .setName("kanal")
            .setDescription("Kilidi açılacak kanal (boş bırakılırsa mevcut kanal)")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(false),
        )
        .addStringOption((option) => option.setName("sebep").setDescription("Kilit açma sebebi").setRequired(false)),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    // Yanıtı ertele
    await interaction.deferReply()

    // Komutu kullanan kişinin yetkisi var mı kontrol et
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      const noPermEmbed = new EmbedBuilder()
        .setTitle("❌ Yetki Hatası")
        .setDescription("🚫 Bu komutu kullanmak için **Kanalları Yönet** yetkisine sahip olmalısın!")
        .setColor("Red")
        .setTimestamp()

      return interaction.editReply({ embeds: [noPermEmbed] })
    }

    // Botun yetkisi var mı kontrol et
    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageChannels)) {
      const botNoPermEmbed = new EmbedBuilder()
        .setTitle("❌ Bot Yetki Hatası")
        .setDescription("🤖 Bu işlemi gerçekleştirmek için yeterli yetkiye sahip değilim!")
        .setColor("Red")
        .setTimestamp()

      return interaction.editReply({ embeds: [botNoPermEmbed] })
    }

    const subCommand = interaction.options.getSubcommand()
    const targetChannel = interaction.options.getChannel("kanal") || interaction.channel
    const reason = interaction.options.getString("sebep") || "Sebep belirtilmedi"
    const fullReason = `${reason} (İşlemi yapan: ${interaction.user.tag})`

    try {
      if (subCommand === "kilitle") {
        // İlk aşama embed'i
        const lockingEmbed = new EmbedBuilder()
          .setTitle("🔒 Kanal Kilitleme İşlemi")
          .setDescription(`⏳ <#${targetChannel.id}> kanalı kilitleniyor...
👮‍♂️ Lütfen bekleyin!`)
          .setColor("Blue")
          .setTimestamp()

        await interaction.editReply({ embeds: [lockingEmbed] })

        // Biraz bekleyelim ki kullanıcı mesajı görebilsin
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Kanalı kilitle - @everyone rolünün mesaj gönderme iznini kapat
        await targetChannel.permissionOverwrites.edit(
          interaction.guild.roles.everyone,
          {
            SendMessages: false,
          },
          { reason: fullReason },
        )

        // Son aşama embed'i
        const lockedEmbed = new EmbedBuilder()
          .setTitle("🔒 Kanal Kilitlendi")
          .setDescription(`✅ <#${targetChannel.id}> kanalı başarıyla kilitlendi!`)
          .addFields(
            { name: "🔐 Kanal", value: `<#${targetChannel.id}>`, inline: true },
            { name: "👮‍♂️ Kilitleyen", value: `<@${interaction.user.id}>`, inline: true },
            { name: "📝 Sebep", value: reason },
          )
          .setColor("Red")
          .setFooter({
            text: `${interaction.guild.name} • ${new Date().toLocaleString()}`,
            iconURL: interaction.guild.iconURL({ dynamic: true }),
          })
          .setTimestamp()

        // Kanal kilitlendi mesajını gönder
        await interaction.editReply({ embeds: [lockedEmbed] })

        // Kilitlendiğine dair kanalda bilgilendirme mesajı
        const channelNotificationEmbed = new EmbedBuilder()
          .setTitle("🔒 Bu Kanal Kilitlendi")
          .setDescription(`Bu kanal <@${interaction.user.id}> tarafından kilitlendi.`)
          .addFields(
            { name: "📝 Sebep", value: reason },
            { name: "⏱️ Süre", value: "Belirsiz (Yetkili kilit açana kadar)" },
          )
          .setColor("Red")
          .setFooter({ text: `${interaction.guild.name}`, iconURL: interaction.guild.iconURL({ dynamic: true }) })
          .setTimestamp()

        // Eğer komut mevcut kanalda çalıştırılmadıysa, hedef kanala bildirim gönder
        if (targetChannel.id !== interaction.channel.id) {
          await targetChannel.send({ embeds: [channelNotificationEmbed] })
        }
      } else if (subCommand === "aç") {
        // İlk aşama embed'i
        const unlockingEmbed = new EmbedBuilder()
          .setTitle("🔓 Kanal Kilidi Açılıyor")
          .setDescription(`⏳ <#${targetChannel.id}> kanalının kilidi açılıyor...
👮‍♂️ Lütfen bekleyin!`)
          .setColor("Blue")
          .setTimestamp()

        await interaction.editReply({ embeds: [unlockingEmbed] })

        // Biraz bekleyelim ki kullanıcı mesajı görebilsin
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Kanalın kilidini aç - @everyone rolünün mesaj gönderme iznini aç
        await targetChannel.permissionOverwrites.edit(
          interaction.guild.roles.everyone,
          {
            SendMessages: null, // null, varsayılan izinlere döndürür
          },
          { reason: fullReason },
        )

        // Son aşama embed'i
        const unlockedEmbed = new EmbedBuilder()
          .setTitle("🔓 Kanal Kilidi Açıldı")
          .setDescription(`✅ <#${targetChannel.id}> kanalının kilidi başarıyla açıldı!`)
          .addFields(
            { name: "🔐 Kanal", value: `<#${targetChannel.id}>`, inline: true },
            { name: "👮‍♂️ Kilidi Açan", value: `<@${interaction.user.id}>`, inline: true },
            { name: "📝 Sebep", value: reason },
          )
          .setColor("Green")
          .setFooter({
            text: `${interaction.guild.name} • ${new Date().toLocaleString()}`,
            iconURL: interaction.guild.iconURL({ dynamic: true }),
          })
          .setTimestamp()

        // Kanal kilidi açıldı mesajını gönder
        await interaction.editReply({ embeds: [unlockedEmbed] })

        // Kilit açıldığına dair kanalda bilgilendirme mesajı
        const channelNotificationEmbed = new EmbedBuilder()
          .setTitle("🔓 Bu Kanalın Kilidi Açıldı")
          .setDescription(`Bu kanalın kilidi <@${interaction.user.id}> tarafından açıldı.`)
          .addFields({ name: "📝 Sebep", value: reason })
          .setColor("Green")
          .setFooter({ text: `${interaction.guild.name}`, iconURL: interaction.guild.iconURL({ dynamic: true }) })
          .setTimestamp()

        // Eğer komut mevcut kanalda çalıştırılmadıysa, hedef kanala bildirim gönder
        if (targetChannel.id !== interaction.channel.id) {
          await targetChannel.send({ embeds: [channelNotificationEmbed] })
        }
      }
    } catch (error) {
      console.error(error)

      const errorEmbed = new EmbedBuilder()
        .setTitle("❌ Hata")
        .setDescription(
          `⚠️ Kanal ${subCommand === "kilitle" ? "kilitlenirken" : "kilidi açılırken"} bir hata oluştu: ${error.message}`,
        )
        .setColor("Red")
        .setTimestamp()

      await interaction.editReply({ embeds: [errorEmbed] })
    }
  },
}

