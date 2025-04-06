const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js")
const { minecraftServer } = require("../../config.json")

module.exports = {
  data: new SlashCommandBuilder().setName("ip").setDescription("Minecraft sunucusunun IP adresini gösterir."),

  async execute(interaction) {
    try {
      // Minecraft sunucu bilgilerini config dosyasından al
      const serverIP = minecraftServer.ip || "Ayarlanmamış"
      const serverPort = minecraftServer.port || "25565"
      const serverVersion = minecraftServer.version || "Belirtilmemiş"
      const serverName = minecraftServer.name || "Minecraft Sunucusu"
      const serverDescription = minecraftServer.description || "Sunucu açıklaması bulunmuyor."

      // Embed mesajı oluştur
      const ipEmbed = new EmbedBuilder()
        .setTitle(`🎮 ${serverName}`)
        .setDescription(`${serverDescription}`)
        .addFields(
          { name: "🌐 Sunucu IP", value: `\`${serverIP}\``, inline: true },
          { name: "🔌 Port", value: `\`${serverPort}\``, inline: true },
          { name: "📋 Versiyon", value: `\`${serverVersion}\``, inline: true },
          {
            name: "📝 Nasıl Bağlanılır?",
            value:
              "Minecraft oyununu açın, Çok Oyunculu'ya tıklayın ve 'Sunucu Ekle' seçeneğini seçin. Sunucu adresine yukarıdaki IP'yi girin ve bağlanın!",
          },
        )
        .setColor("#36b030")
        .setThumbnail("https://cdn.icon-icons.com/icons2/2699/PNG/512/minecraft_logo_icon_168974.png")
        .setFooter({
          text: `${interaction.guild.name} • ${new Date().toLocaleString()}`,
          iconURL: interaction.guild.iconURL({ dynamic: true }),
        })
        .setTimestamp()

      // Butonları oluştur - Sunucu durumu butonu kaldırıldı
      const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setLabel("Kopyala").setCustomId("copy_ip").setEmoji("📋").setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setLabel("Sunucuya Katıl")
          .setCustomId("join_server")
          .setEmoji("➡️")
          .setStyle(ButtonStyle.Success),
      )

      // Embed ve butonları gönder
      const message = await interaction.reply({
        embeds: [ipEmbed],
        components: [buttons],
        fetchReply: true,
      })

      // Buton tıklama olaylarını dinle
      const collector = message.createMessageComponentCollector({ time: 60000 }) // 1 dakika süreyle dinle

      collector.on("collect", async (i) => {
        if (i.user.id !== interaction.user.id) {
          return i.reply({ content: "❌ Bu butonu sadece komutu kullanan kişi kullanabilir!", ephemeral: true })
        }

        if (i.customId === "copy_ip") {
          await i.reply({
            content: `📋 **Sunucu IP:** \`${serverIP}${serverPort !== "25565" ? `:${serverPort}` : ""}\``,
            ephemeral: true,
          })
        } else if (i.customId === "join_server") {
          await i.reply({
            content: `➡️ **Minecraft'ı açın ve şu adresi girin:**\n\`${serverIP}${serverPort !== "25565" ? `:${serverPort}` : ""}\`\n\nİyi oyunlar! 🎮`,
            ephemeral: true,
          })
        }
      })

      collector.on("end", () => {
        // Süre dolduğunda butonları devre dışı bırak
        const expiredButtons = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setLabel("Kopyala")
            .setCustomId("copy_ip")
            .setEmoji("📋")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true),
          new ButtonBuilder()
            .setLabel("Sunucuya Katıl")
            .setCustomId("join_server")
            .setEmoji("➡️")
            .setStyle(ButtonStyle.Success)
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

