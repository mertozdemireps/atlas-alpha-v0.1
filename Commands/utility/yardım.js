const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ComponentType,
  } = require("discord.js")
  
  module.exports = {
    data: new SlashCommandBuilder()
      .setName("yardım")
      .setDescription("Bot komutları ve özellikleri hakkında bilgi verir."),
  
    async execute(interaction) {
      try {
        // Ana yardım embed'i
        const mainEmbed = new EmbedBuilder()
          .setTitle("🤖 Bot Yardım Menüsü")
          .setDescription("Aşağıdaki butonlara tıklayarak farklı komut kategorileri hakkında bilgi alabilirsiniz.")
          .addFields(
            { name: "🛡️ Moderasyon", value: "Ban, kick, timeout gibi moderasyon komutları", inline: true },
            { name: "🔧 Yardımcı", value: "Site, IP gibi yardımcı komutlar", inline: true },
            { name: "👋 Giriş/Çıkış", value: "Hoşgeldin ve ayrılma mesajları", inline: true },
            { name: "📝 Log Sistemi", value: "Moderasyon işlemlerini kaydetme", inline: true },
            { name: "🔒 Kanal Yönetimi", value: "Kanal kilitleme ve yavaş mod", inline: true },
          )
          .setColor("#5865F2") // Discord mavisi
          .setThumbnail(interaction.client.user.displayAvatarURL({ dynamic: true, size: 256 }))
          .setFooter({
            text: `${interaction.guild.name} • Komut sayısı: ${interaction.client.commands.size}`,
            iconURL: interaction.guild.iconURL({ dynamic: true }),
          })
          .setTimestamp()
  
        // Butonları oluştur
        const buttons = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId("mod").setLabel("Moderasyon").setEmoji("🛡️").setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId("util").setLabel("Yardımcı").setEmoji("🔧").setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId("welcome").setLabel("Giriş/Çıkış").setEmoji("👋").setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId("log").setLabel("Log Sistemi").setEmoji("📝").setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId("channel")
            .setLabel("Kanal Yönetimi")
            .setEmoji("🔒")
            .setStyle(ButtonStyle.Primary),
        )
  
        // Sayfa değiştirme butonları
        const navigationButtons = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("home")
            .setLabel("Ana Sayfa")
            .setEmoji("🏠")
            .setStyle(ButtonStyle.Success)
            .setDisabled(true),
          new ButtonBuilder().setCustomId("delete").setLabel("Kapat").setEmoji("❌").setStyle(ButtonStyle.Danger),
        )
  
        // İlk mesajı gönder
        const message = await interaction.reply({
          embeds: [mainEmbed],
          components: [buttons, navigationButtons],
          fetchReply: true,
        })
  
        // Buton koleksiyonunu oluştur
        const collector = message.createMessageComponentCollector({
          componentType: ComponentType.Button,
          time: 300000, // 5 dakika
        })
  
        // Buton tıklamalarını dinle
        collector.on("collect", async (i) => {
          // Sadece komutu kullanan kişi butonları kullanabilir
          if (i.user.id !== interaction.user.id) {
            return i.reply({
              content: "❌ Bu butonları sadece komutu kullanan kişi kullanabilir!",
              ephemeral: true,
            })
          }
  
          // Tüm butonları aktif et
          const updatedNavButtons = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId("home")
              .setLabel("Ana Sayfa")
              .setEmoji("🏠")
              .setStyle(ButtonStyle.Success)
              .setDisabled(false),
            new ButtonBuilder().setCustomId("delete").setLabel("Kapat").setEmoji("❌").setStyle(ButtonStyle.Danger),
          )
  
          // Buton ID'sine göre işlem yap
          if (i.customId === "home") {
            // Ana sayfaya dön
            updatedNavButtons.components[0].setDisabled(true)
            await i.update({
              embeds: [mainEmbed],
              components: [buttons, updatedNavButtons],
            })
          } else if (i.customId === "delete") {
            // Mesajı sil
            await i.message.delete()
            collector.stop()
          } else if (i.customId === "mod") {
            // Moderasyon komutları
            const modEmbed = new EmbedBuilder()
              .setTitle("🛡️ Moderasyon Komutları")
              .setDescription("Sunucunuzu yönetmek için kullanabileceğiniz moderasyon komutları.")
              .addFields(
                {
                  name: "🔨 `/ban kullanici/id`",
                  value: "Kullanıcıyı sunucudan yasaklar. Alt komutlar: `kullanici` ve `id`",
                },
                {
                  name: "🔓 `/unban kullanici_id`",
                  value: "Yasaklı bir kullanıcının yasağını kaldırır.",
                },
                {
                  name: "👢 `/kick hedef`",
                  value: "Kullanıcıyı sunucudan atar.",
                },
                {
                  name: "⏱️ `/timeout hedef sure`",
                  value: "Kullanıcıya belirli bir süre için zaman aşımı uygular.",
                },
                {
                  name: "🔓 `/untimeout hedef`",
                  value: "Kullanıcının zaman aşımını kaldırır.",
                },
              )
              .setColor("#FF5555")
              .setFooter({
                text: `Sayfa 1/5 • ${interaction.guild.name}`,
                iconURL: interaction.guild.iconURL({ dynamic: true }),
              })
              .setTimestamp()
  
            await i.update({
              embeds: [modEmbed],
              components: [buttons, updatedNavButtons],
            })
          } else if (i.customId === "util") {
            // Yardımcı komutlar
            const utilEmbed = new EmbedBuilder()
              .setTitle("🔧 Yardımcı Komutlar")
              .setDescription("Çeşitli yardımcı komutlar ve özellikler.")
              .addFields(
                {
                  name: "🌐 `/site`",
                  value: "Sunucunun web sitesini gösterir.",
                },
                {
                  name: "🎮 `/ip`",
                  value: "Minecraft sunucusunun IP adresini gösterir.",
                },
                {
                  name: "❓ `/yardim`",
                  value: "Bu yardım menüsünü gösterir.",
                },
              )
              .setColor("#55AAFF")
              .setFooter({
                text: `Sayfa 2/5 • ${interaction.guild.name}`,
                iconURL: interaction.guild.iconURL({ dynamic: true }),
              })
              .setTimestamp()
  
            await i.update({
              embeds: [utilEmbed],
              components: [buttons, updatedNavButtons],
            })
          } else if (i.customId === "welcome") {
            // Giriş/Çıkış sistemi
            const welcomeEmbed = new EmbedBuilder()
              .setTitle("👋 Giriş/Çıkış Sistemi")
              .setDescription("Sunucuya giren ve çıkan üyeleri karşılama sistemi.")
              .addFields(
                {
                  name: "⚙️ `/giris-cikis ayarla`",
                  value: "Giriş veya çıkış kanalını ayarlar.",
                },
                {
                  name: "👑 `/giris-cikis otorol`",
                  value: "Yeni üyelere otomatik verilecek rolü ayarlar.",
                },
                {
                  name: "💬 `/giris-cikis mesaj`",
                  value: "Giriş/çıkış mesajlarını özelleştirir.",
                },
                {
                  name: "🎨 `/giris-cikis renk`",
                  value: "Giriş/çıkış mesajlarının rengini ayarlar.",
                },
                {
                  name: "📋 `/giris-cikis baslik`",
                  value: "Giriş/çıkış mesajlarının başlığını ayarlar.",
                },
                {
                  name: "⚡ `/giris-cikis durum`",
                  value: "Giriş/çıkış sistemini açar veya kapatır.",
                },
                {
                  name: "🗑️ `/giris-cikis sifirla`",
                  value: "Giriş/çıkış ayarlarını sıfırlar.",
                },
                {
                  name: "ℹ️ `/giris-cikis bilgi`",
                  value: "Mevcut giriş/çıkış ayarlarını gösterir.",
                },
              )
              .setColor("#36b030")
              .setFooter({
                text: `Sayfa 3/5 • ${interaction.guild.name}`,
                iconURL: interaction.guild.iconURL({ dynamic: true }),
              })
              .setTimestamp()
  
            await i.update({
              embeds: [welcomeEmbed],
              components: [buttons, updatedNavButtons],
            })
          } else if (i.customId === "log") {
            // Log sistemi
            const logEmbed = new EmbedBuilder()
              .setTitle("📝 Log Sistemi")
              .setDescription("Moderasyon işlemlerini kaydetme ve takip etme sistemi.")
              .addFields(
                {
                  name: "⚙️ `/logkanal ayarla`",
                  value: "Moderasyon log kanalını ayarlar.",
                },
                {
                  name: "⚡ `/logkanal durum`",
                  value: "Log sistemini açar veya kapatır.",
                },
                {
                  name: "🗑️ `/logkanal sifirla`",
                  value: "Log kanalı ayarlarını sıfırlar.",
                },
                {
                  name: "ℹ️ `/logkanal bilgi`",
                  value: "Mevcut log kanalı ayarlarını gösterir.",
                },
              )
              .addFields({
                name: "📋 Kaydedilen İşlemler",
                value:
                  "• Zaman aşımı uygulama ve kaldırma\n• Yasaklama ve yasak kaldırma\n• Sunucudan atma\n• Kanal kilitleme ve kilit açma\n• Yavaş mod ayarlama",
              })
              .setColor("#ff9966")
              .setFooter({
                text: `Sayfa 4/5 • ${interaction.guild.name}`,
                iconURL: interaction.guild.iconURL({ dynamic: true }),
              })
              .setTimestamp()
  
            await i.update({
              embeds: [logEmbed],
              components: [buttons, updatedNavButtons],
            })
          } else if (i.customId === "channel") {
            // Kanal yönetimi
            const channelEmbed = new EmbedBuilder()
              .setTitle("🔒 Kanal Yönetimi Komutları")
              .setDescription("Kanalları yönetmek için kullanabileceğiniz komutlar.")
              .addFields(
                {
                  name: "🔒 `/kilit kilitle`",
                  value: "Belirtilen kanalı kilitler.",
                },
                {
                  name: "🔓 `/kilit aç`",
                  value: "Belirtilen kanalın kilidini açar.",
                },
                {
                  name: "⏱️ `/yavasmod`",
                  value: "Bir kanalın yavaş modunu ayarlar.",
                },
              )
              .setColor("#AA55FF")
              .setFooter({
                text: `Sayfa 5/5 • ${interaction.guild.name}`,
                iconURL: interaction.guild.iconURL({ dynamic: true }),
              })
              .setTimestamp()
  
            await i.update({
              embeds: [channelEmbed],
              components: [buttons, updatedNavButtons],
            })
          }
        })
  
        // Koleksiyon süresi dolduğunda
        collector.on("end", async (collected, reason) => {
          if (reason === "time" && message) {
            // Tüm butonları devre dışı bırak
            const disabledButtons = buttons.components.map((button) => {
              return ButtonBuilder.from(button).setDisabled(true)
            })
  
            const disabledNavButtons = navigationButtons.components.map((button) => {
              return ButtonBuilder.from(button).setDisabled(true)
            })
  
            const disabledButtonRow = new ActionRowBuilder().addComponents(disabledButtons)
            const disabledNavRow = new ActionRowBuilder().addComponents(disabledNavButtons)
  
            try {
              await message.edit({
                content: "⏱️ Bu yardım menüsü zaman aşımına uğradı. Yeni bir menü için `/yardim` komutunu kullanın.",
                components: [disabledButtonRow, disabledNavRow],
              })
            } catch (error) {
              // Mesaj silinmiş olabilir, sessizce devam et
            }
          }
        })
      } catch (error) {
        console.error("Yardım komutu hatası:", error)
  
        const errorEmbed = new EmbedBuilder()
          .setTitle("❌ Hata")
          .setDescription(`⚠️ Komut çalıştırılırken bir hata oluştu: ${error.message}`)
          .setColor("Red")
          .setTimestamp()
  
        if (interaction.replied || interaction.deferred) {
          await interaction.editReply({ embeds: [errorEmbed], components: [] })
        } else {
          await interaction.reply({ embeds: [errorEmbed], ephemeral: true })
        }
      }
    },
  }
  
  