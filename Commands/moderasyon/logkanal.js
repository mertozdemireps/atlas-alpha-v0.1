const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ChannelType } = require("discord.js")
const LogChannel = require("../../Models/LogChannel")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("logkanal")
    .setDescription("Moderasyon log kanalını ayarlar.")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("ayarla")
        .setDescription("Moderasyon log kanalını ayarlar.")
        .addChannelOption((option) =>
          option
            .setName("kanal")
            .setDescription("Log mesajlarının gönderileceği kanal")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("durum")
        .setDescription("Log sistemini açar veya kapatır.")
        .addBooleanOption((option) =>
          option.setName("durum").setDescription("Sistemin durumu (açık/kapalı)").setRequired(true),
        ),
    )
    .addSubcommand((subcommand) => subcommand.setName("sifirla").setDescription("Log kanalı ayarlarını sıfırlar."))
    .addSubcommand((subcommand) => subcommand.setName("bilgi").setDescription("Mevcut log kanalı ayarlarını gösterir."))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    try {
      await interaction.deferReply()

      const subCommand = interaction.options.getSubcommand()
      const guildId = interaction.guild.id

      if (subCommand === "ayarla") {
        const kanal = interaction.options.getChannel("kanal")

        // Log kanalı ayarları
        let logData = await LogChannel.findOne({ Guild: guildId })

        if (!logData) {
          logData = new LogChannel({
            Guild: guildId,
            ModLogChannel: kanal.id,
            Enabled: true,
          })
        } else {
          logData.ModLogChannel = kanal.id
          logData.Enabled = true
        }

        await logData.save()

        const setupEmbed = new EmbedBuilder()
          .setTitle("✅ Moderasyon Log Kanalı Ayarlandı")
          .setDescription(`Moderasyon log mesajları artık <#${kanal.id}> kanalına gönderilecek.`)
          .setColor("#36b030")
          .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
          .setTimestamp()

        return interaction.editReply({ embeds: [setupEmbed] })
      } else if (subCommand === "durum") {
        const durum = interaction.options.getBoolean("durum")

        // Log sistemi durumu
        const logData = await LogChannel.findOne({ Guild: guildId })

        if (!logData) {
          return interaction.editReply({
            content: "❌ Önce log kanalını ayarlamalısınız! `/logkanal ayarla kanal:#kanal`",
          })
        }

        logData.Enabled = durum
        await logData.save()

        const statusEmbed = new EmbedBuilder()
          .setTitle("✅ Durum Güncellendi")
          .setDescription(`Moderasyon log sistemi ${durum ? "açıldı" : "kapatıldı"}.`)
          .setColor(durum ? "#36b030" : "#e01e1e")
          .addFields({ name: "⚙️ Durum", value: durum ? "Açık ✅" : "Kapalı ❌", inline: true })
          .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
          .setTimestamp()

        return interaction.editReply({ embeds: [statusEmbed] })
      } else if (subCommand === "sifirla") {
        // Log ayarlarını sıfırla
        const logData = await LogChannel.findOne({ Guild: guildId })

        if (!logData) {
          return interaction.editReply({
            content: "❌ Log kanalı zaten ayarlanmamış!",
          })
        }

        await LogChannel.deleteOne({ Guild: guildId })

        const resetEmbed = new EmbedBuilder()
          .setTitle("🗑️ Log Kanalı Sıfırlandı")
          .setDescription("Moderasyon log kanalı ayarları başarıyla silindi.")
          .setColor("#e01e1e")
          .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
          .setTimestamp()

        return interaction.editReply({ embeds: [resetEmbed] })
      } else if (subCommand === "bilgi") {
        // Log ayarlarını göster
        const logData = await LogChannel.findOne({ Guild: guildId })

        if (!logData) {
          return interaction.editReply({
            content: "❌ Henüz log kanalı ayarlanmamış! `/logkanal ayarla kanal:#kanal` komutu ile ayarlayabilirsiniz.",
          })
        }

        const infoEmbed = new EmbedBuilder()
          .setTitle("ℹ️ Log Kanalı Bilgileri")
          .setDescription("Sunucunuzun moderasyon log kanalı ayarları aşağıda listelenmiştir.")
          .setColor("#3498db")
          .addFields(
            {
              name: "📝 Log Kanalı",
              value: logData.ModLogChannel ? `<#${logData.ModLogChannel}>` : "Ayarlanmamış",
              inline: true,
            },
            { name: "⚙️ Durum", value: logData.Enabled ? "Açık ✅" : "Kapalı ❌", inline: true },
          )
          .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
          .setTimestamp()

        return interaction.editReply({ embeds: [infoEmbed] })
      }
    } catch (error) {
      console.error("Log kanalı ayarları hatası:", error)
      return interaction.editReply({
        content: "❌ Bir hata oluştu: " + error.message,
      })
    }
  },
}

