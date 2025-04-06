const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js")
const { website } = require("../../config.json")

module.exports = {
  data: new SlashCommandBuilder().setName("site").setDescription("Sunucumuzun web sitesini gösterir."),

  async execute(interaction) {
    try {
      // Site bilgilerini config dosyasından al
      const siteURL = website.url || "https://example.com"
      const siteName = website.name || "Sunucu Web Sitesi"
      const siteDescription = website.description || "Sunucumuzun resmi web sitesi"
      const siteColor = website.color || "#5865F2" // Discord mavisi

      // Embed mesajı oluştur
      const siteEmbed = new EmbedBuilder()
        .setTitle(`🌐 ${siteName}`)
        .setDescription(siteDescription)
        .addFields(
          { name: "📌 Web Sitesi Adresi", value: `[${siteName}](${siteURL})` },
          {
            name: "📝 Bilgi",
            value:
              "Sitemizi ziyaret ederek sunucumuz hakkında daha fazla bilgi edinebilir ve güncel duyurulara ulaşabilirsiniz.",
          },
        )
        .setColor(siteColor)
        .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
        .setFooter({
          text: `${interaction.guild.name} • ${new Date().toLocaleString()}`,
          iconURL: interaction.guild.iconURL({ dynamic: true }),
        })
        .setTimestamp()

      // Butonları oluştur
      const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setLabel("Siteyi Ziyaret Et").setURL(siteURL).setStyle(ButtonStyle.Link).setEmoji("🔗"),

        new ButtonBuilder().setLabel("Paylaş").setCustomId("share_site").setStyle(ButtonStyle.Primary).setEmoji("📤"),
      )

      // Embed ve butonları gönder
      const message = await interaction.reply({
        embeds: [siteEmbed],
        components: [buttons],
        fetchReply: true,
      })

      // Buton tıklama olaylarını dinle
      const collector = message.createMessageComponentCollector({ time: 60000 }) // 1 dakika süreyle dinle

      collector.on("collect", async (i) => {
        if (i.user.id !== interaction.user.id) {
          return i.reply({ content: "❌ Bu butonu sadece komutu kullanan kişi kullanabilir!", ephemeral: true })
        }

        if (i.customId === "share_site") {
          await i.reply({
            content: `📤 **${siteName}** web sitesini arkadaşlarınla paylaşabilirsin:\n${siteURL}`,
            ephemeral: true,
          })
        }
      })

      collector.on("end", () => {
        // Süre dolduğunda paylaş butonunu devre dışı bırak, link butonu hala çalışır kalır
        const expiredButtons = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setLabel("Siteyi Ziyaret Et").setURL(siteURL).setStyle(ButtonStyle.Link).setEmoji("🔗"),

          new ButtonBuilder()
            .setLabel("Paylaş")
            .setCustomId("share_site")
            .setStyle(ButtonStyle.Primary)
            .setEmoji("📤")
            .setDisabled(true),
        )

        interaction.editReply({ components: [expiredButtons] }).catch(() => {})
      })
    } catch (error) {
      console.error(error)

      const errorEmbed = new EmbedBuilder()
        .setTitle("❌ Hata")
        .setDescription(`⚠️ Komut çalıştırılırken bir hata oluştu: ${error.message}`)
        .setColor("Red")
        .setTimestamp()

      await interaction.reply({ embeds: [errorEmbed], ephemeral: true })
    }
  },
}

