const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ChannelType } = require("discord.js")
const Welcome = require("../../models/Welcome")
const Leave = require("../../models/Leave")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("giris-cikis")
    .setDescription("Giriş/Çıkış sistemi ayarlarını yapılandırır.")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("ayarla")
        .setDescription("Giriş/Çıkış kanallarını ayarlar.")
        .addStringOption((option) =>
          option
            .setName("tip")
            .setDescription("Ayarlanacak sistem tipi")
            .setRequired(true)
            .addChoices({ name: "Giriş Sistemi", value: "welcome" }, { name: "Çıkış Sistemi", value: "leave" }),
        )
        .addChannelOption((option) =>
          option
            .setName("kanal")
            .setDescription("Mesajların gönderileceği kanal")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("otorol")
        .setDescription("Yeni üyelere otomatik verilecek rolü ayarlar.")
        .addRoleOption((option) =>
          option.setName("rol").setDescription("Yeni üyelere verilecek rol").setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("mesaj")
        .setDescription("Giriş/Çıkış mesajlarını ayarlar.")
        .addStringOption((option) =>
          option
            .setName("tip")
            .setDescription("Ayarlanacak mesaj tipi")
            .setRequired(true)
            .addChoices({ name: "Giriş Mesajı", value: "welcome" }, { name: "Çıkış Mesajı", value: "leave" }),
        )
        .addStringOption((option) =>
          option
            .setName("mesaj")
            .setDescription(
              "Mesaj içeriği. {user}, {username}, {tag}, {memberCount}, {server} değişkenlerini kullanabilirsiniz.",
            )
            .setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("durum")
        .setDescription("Giriş/Çıkış sistemini açar veya kapatır.")
        .addStringOption((option) =>
          option
            .setName("tip")
            .setDescription("Ayarlanacak sistem tipi")
            .setRequired(true)
            .addChoices({ name: "Giriş Sistemi", value: "welcome" }, { name: "Çıkış Sistemi", value: "leave" }),
        )
        .addBooleanOption((option) =>
          option.setName("durum").setDescription("Sistemin durumu (açık/kapalı)").setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("baslik")
        .setDescription("Giriş/Çıkış mesajlarının başlığını ayarlar.")
        .addStringOption((option) =>
          option
            .setName("tip")
            .setDescription("Ayarlanacak başlık tipi")
            .setRequired(true)
            .addChoices(
              { name: "Giriş Mesajı Başlığı", value: "welcome" },
              { name: "Çıkış Mesajı Başlığı", value: "leave" },
            ),
        )
        .addStringOption((option) =>
          option
            .setName("baslik")
            .setDescription(
              "Başlık metni. {user}, {username}, {tag}, {memberCount}, {server} değişkenlerini kullanabilirsiniz.",
            )
            .setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("renk")
        .setDescription("Giriş/Çıkış mesajlarının rengini ayarlar.")
        .addStringOption((option) =>
          option
            .setName("tip")
            .setDescription("Ayarlanacak renk tipi")
            .setRequired(true)
            .addChoices(
              { name: "Giriş Mesajı Rengi", value: "welcome" },
              { name: "Çıkış Mesajı Rengi", value: "leave" },
            ),
        )
        .addStringOption((option) =>
          option.setName("renk").setDescription("Renk kodu (örn: #FF0000 kırmızı için)").setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("sifirla")
        .setDescription("Giriş/Çıkış ayarlarını sıfırlar.")
        .addStringOption((option) =>
          option
            .setName("tip")
            .setDescription("Sıfırlanacak sistem tipi")
            .setRequired(true)
            .addChoices(
              { name: "Giriş Sistemi", value: "welcome" },
              { name: "Çıkış Sistemi", value: "leave" },
              { name: "Otomatik Rol", value: "autorole" },
              { name: "Tüm Ayarlar", value: "all" },
            ),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("bilgi").setDescription("Mevcut giriş/çıkış ayarlarını gösterir."),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    try {
      await interaction.deferReply()

      const subCommand = interaction.options.getSubcommand()
      const guildId = interaction.guild.id

      if (subCommand === "ayarla") {
        const tip = interaction.options.getString("tip")
        const kanal = interaction.options.getChannel("kanal")

        if (tip === "welcome") {
          // Giriş sistemi ayarları
          let welcomeData = await Welcome.findOne({ Guild: guildId })

          if (!welcomeData) {
            welcomeData = new Welcome({
              Guild: guildId,
              Channel: kanal.id,
              Enabled: true,
            })
          } else {
            welcomeData.Channel = kanal.id
            welcomeData.Enabled = true
          }

          await welcomeData.save()

          const setupEmbed = new EmbedBuilder()
            .setTitle("✅ Giriş Kanalı Ayarlandı")
            .setDescription(`Giriş mesajları artık <#${kanal.id}> kanalına gönderilecek.`)
            .setColor("#36b030")
            .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
            .setTimestamp()

          return interaction.editReply({ embeds: [setupEmbed] })
        } else {
          // Çıkış sistemi ayarları
          let leaveData = await Leave.findOne({ Guild: guildId })

          if (!leaveData) {
            leaveData = new Leave({
              Guild: guildId,
              Channel: kanal.id,
              Enabled: true,
            })
          } else {
            leaveData.Channel = kanal.id
            leaveData.Enabled = true
          }

          await leaveData.save()

          const setupEmbed = new EmbedBuilder()
            .setTitle("✅ Çıkış Kanalı Ayarlandı")
            .setDescription(`Çıkış mesajları artık <#${kanal.id}> kanalına gönderilecek.`)
            .setColor("#36b030")
            .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
            .setTimestamp()

          return interaction.editReply({ embeds: [setupEmbed] })
        }
      }

      // Yeni eklenen otomatik rol komutu
      else if (subCommand === "otorol") {
        const rol = interaction.options.getRole("rol")

        // Botun rolü yönetme yetkisi var mı kontrol et
        if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles)) {
          return interaction.editReply({
            content: '❌ Botun rolleri yönetme yetkisi yok! Lütfen bota "Rolleri Yönet" yetkisi verin.',
          })
        }

        // Botun vereceği rol, botun en yüksek rolünden daha yüksek mi kontrol et
        if (rol.position >= interaction.guild.members.me.roles.highest.position) {
          return interaction.editReply({
            content:
              "❌ Bu rolü veremem çünkü bu rol benim en yüksek rolümden daha yüksek! Lütfen botun rolünü bu rolün üzerine taşıyın.",
          })
        }

        // Giriş ayarlarını al veya oluştur
        let welcomeData = await Welcome.findOne({ Guild: guildId })

        if (!welcomeData) {
          welcomeData = new Welcome({
            Guild: guildId,
            AutoRole: rol.id,
          })
        } else {
          welcomeData.AutoRole = rol.id
        }

        await welcomeData.save()

        const roleEmbed = new EmbedBuilder()
          .setTitle("✅ Otomatik Rol Ayarlandı")
          .setDescription(`Yeni üyelere artık otomatik olarak <@&${rol.id}> rolü verilecek.`)
          .setColor(rol.color || "#36b030")
          .addFields(
            { name: "🎭 Rol", value: `<@&${rol.id}>`, inline: true },
            { name: "🆔 Rol ID", value: rol.id, inline: true },
          )
          .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
          .setTimestamp()

        return interaction.editReply({ embeds: [roleEmbed] })
      } else if (subCommand === "mesaj") {
        const tip = interaction.options.getString("tip")
        const mesaj = interaction.options.getString("mesaj")

        if (tip === "welcome") {
          // Giriş mesajı ayarları
          const welcomeData = await Welcome.findOne({ Guild: guildId })

          if (!welcomeData) {
            return interaction.editReply({
              content: "❌ Önce giriş kanalını ayarlamalısınız! `/giris-cikis ayarla tip:Giriş Sistemi kanal:#kanal`",
            })
          }

          welcomeData.Message = mesaj
          await welcomeData.save()

          const messageEmbed = new EmbedBuilder()
            .setTitle("✅ Giriş Mesajı Ayarlandı")
            .setDescription("Yeni üyeler için giriş mesajı güncellendi.")
            .setColor("#36b030")
            .addFields(
              { name: "📝 Yeni Mesaj", value: mesaj },
              {
                name: "📚 Kullanılabilir Değişkenler",
                value:
                  "`{user}` - Kullanıcı etiketi\n`{username}` - Kullanıcı adı\n`{tag}` - Kullanıcı etiketi (username#0000)\n`{memberCount}` - Sunucu üye sayısı\n`{server}` - Sunucu adı",
              },
            )
            .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
            .setTimestamp()

          return interaction.editReply({ embeds: [messageEmbed] })
        } else {
          // Çıkış mesajı ayarları
          const leaveData = await Leave.findOne({ Guild: guildId })

          if (!leaveData) {
            return interaction.editReply({
              content: "❌ Önce çıkış kanalını ayarlamalısınız! `/giris-cikis ayarla tip:Çıkış Sistemi kanal:#kanal`",
            })
          }

          leaveData.Message = mesaj
          await leaveData.save()

          const messageEmbed = new EmbedBuilder()
            .setTitle("✅ Çıkış Mesajı Ayarlandı")
            .setDescription("Ayrılan üyeler için çıkış mesajı güncellendi.")
            .setColor("#36b030")
            .addFields(
              { name: "📝 Yeni Mesaj", value: mesaj },
              {
                name: "📚 Kullanılabilir Değişkenler",
                value:
                  "`{user}` - Kullanıcı etiketi\n`{username}` - Kullanıcı adı\n`{tag}` - Kullanıcı etiketi (username#0000)\n`{memberCount}` - Sunucu üye sayısı\n`{server}` - Sunucu adı",
              },
            )
            .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
            .setTimestamp()

          return interaction.editReply({ embeds: [messageEmbed] })
        }
      } else if (subCommand === "durum") {
        const tip = interaction.options.getString("tip")
        const durum = interaction.options.getBoolean("durum")

        if (tip === "welcome") {
          // Giriş sistemi durumu
          const welcomeData = await Welcome.findOne({ Guild: guildId })

          if (!welcomeData) {
            return interaction.editReply({
              content: "❌ Önce giriş kanalını ayarlamalısınız! `/giris-cikis ayarla tip:Giriş Sistemi kanal:#kanal`",
            })
          }

          welcomeData.Enabled = durum
          await welcomeData.save()

          const statusEmbed = new EmbedBuilder()
            .setTitle("✅ Durum Güncellendi")
            .setDescription(`Giriş sistemi ${durum ? "açıldı" : "kapatıldı"}.`)
            .setColor(durum ? "#36b030" : "#e01e1e")
            .addFields({ name: "⚙️ Durum", value: durum ? "Açık ✅" : "Kapalı ❌", inline: true })
            .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
            .setTimestamp()

          return interaction.editReply({ embeds: [statusEmbed] })
        } else {
          // Çıkış sistemi durumu
          const leaveData = await Leave.findOne({ Guild: guildId })

          if (!leaveData) {
            return interaction.editReply({
              content: "❌ Önce çıkış kanalını ayarlamalısınız! `/giris-cikis ayarla tip:Çıkış Sistemi kanal:#kanal`",
            })
          }

          leaveData.Enabled = durum
          await leaveData.save()

          const statusEmbed = new EmbedBuilder()
            .setTitle("✅ Durum Güncellendi")
            .setDescription(`Çıkış sistemi ${durum ? "açıldı" : "kapatıldı"}.`)
            .setColor(durum ? "#36b030" : "#e01e1e")
            .addFields({ name: "⚙️ Durum", value: durum ? "Açık ✅" : "Kapalı ❌", inline: true })
            .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
            .setTimestamp()

          return interaction.editReply({ embeds: [statusEmbed] })
        }
      } else if (subCommand === "baslik") {
        const tip = interaction.options.getString("tip")
        const baslik = interaction.options.getString("baslik")

        if (tip === "welcome") {
          // Giriş başlığı ayarları
          const welcomeData = await Welcome.findOne({ Guild: guildId })

          if (!welcomeData) {
            return interaction.editReply({
              content: "❌ Önce giriş kanalını ayarlamalısınız! `/giris-cikis ayarla tip:Giriş Sistemi kanal:#kanal`",
            })
          }

          welcomeData.Title = baslik
          await welcomeData.save()

          const titleEmbed = new EmbedBuilder()
            .setTitle("✅ Başlık Ayarlandı")
            .setDescription("Giriş mesajı başlığı güncellendi.")
            .setColor("#36b030")
            .addFields(
              { name: "📝 Yeni Başlık", value: baslik },
              {
                name: "📚 Kullanılabilir Değişkenler",
                value:
                  "`{user}` - Kullanıcı etiketi\n`{username}` - Kullanıcı adı\n`{tag}` - Kullanıcı etiketi (username#0000)\n`{memberCount}` - Sunucu üye sayısı\n`{server}` - Sunucu adı",
              },
            )
            .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
            .setTimestamp()

          return interaction.editReply({ embeds: [titleEmbed] })
        } else {
          // Çıkış başlığı ayarları
          const leaveData = await Leave.findOne({ Guild: guildId })

          if (!leaveData) {
            return interaction.editReply({
              content: "❌ Önce çıkış kanalını ayarlamalısınız! `/giris-cikis ayarla tip:Çıkış Sistemi kanal:#kanal`",
            })
          }

          leaveData.Title = baslik
          await leaveData.save()

          const titleEmbed = new EmbedBuilder()
            .setTitle("✅ Başlık Ayarlandı")
            .setDescription("Çıkış mesajı başlığı güncellendi.")
            .setColor("#36b030")
            .addFields(
              { name: "📝 Yeni Başlık", value: baslik },
              {
                name: "📚 Kullanılabilir Değişkenler",
                value:
                  "`{user}` - Kullanıcı etiketi\n`{username}` - Kullanıcı adı\n`{tag}` - Kullanıcı etiketi (username#0000)\n`{memberCount}` - Sunucu üye sayısı\n`{server}` - Sunucu adı",
              },
            )
            .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
            .setTimestamp()

          return interaction.editReply({ embeds: [titleEmbed] })
        }
      } else if (subCommand === "renk") {
        const tip = interaction.options.getString("tip")
        const renk = interaction.options.getString("renk")

        // Renk kodu geçerli mi kontrol et
        const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
        if (!hexColorRegex.test(renk)) {
          return interaction.editReply({
            content:
              "❌ Geçersiz renk kodu! Renk kodu # ile başlamalı ve geçerli bir HEX renk kodu olmalıdır (örn: #FF0000).",
          })
        }

        if (tip === "welcome") {
          // Giriş rengi ayarları
          const welcomeData = await Welcome.findOne({ Guild: guildId })

          if (!welcomeData) {
            return interaction.editReply({
              content: "❌ Önce giriş kanalını ayarlamalısınız! `/giris-cikis ayarla tip:Giriş Sistemi kanal:#kanal`",
            })
          }

          welcomeData.Color = renk
          await welcomeData.save()

          const colorEmbed = new EmbedBuilder()
            .setTitle("✅ Renk Ayarlandı")
            .setDescription("Giriş mesajı rengi güncellendi.")
            .setColor(renk)
            .addFields({ name: "🎨 Yeni Renk", value: renk })
            .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
            .setTimestamp()

          return interaction.editReply({ embeds: [colorEmbed] })
        } else {
          // Çıkış rengi ayarları
          const leaveData = await Leave.findOne({ Guild: guildId })

          if (!leaveData) {
            return interaction.editReply({
              content: "❌ Önce çıkış kanalını ayarlamalısınız! `/giris-cikis ayarla tip:Çıkış Sistemi kanal:#kanal`",
            })
          }

          leaveData.Color = renk
          await leaveData.save()

          const colorEmbed = new EmbedBuilder()
            .setTitle("✅ Renk Ayarlandı")
            .setDescription("Çıkış mesajı rengi güncellendi.")
            .setColor(renk)
            .addFields({ name: "🎨 Yeni Renk", value: renk })
            .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
            .setTimestamp()

          return interaction.editReply({ embeds: [colorEmbed] })
        }
      }

      // Sıfırlama komutu güncellendi
      else if (subCommand === "sifirla") {
        const tip = interaction.options.getString("tip")

        if (tip === "welcome" || tip === "all") {
          // Giriş ayarlarını sıfırla
          const welcomeData = await Welcome.findOne({ Guild: guildId })

          if (!welcomeData) {
            if (tip === "welcome") {
              return interaction.editReply({
                content: "❌ Giriş sistemi zaten ayarlanmamış!",
              })
            }
          } else {
            await Welcome.deleteOne({ Guild: guildId })
          }

          if (tip === "welcome") {
            const resetEmbed = new EmbedBuilder()
              .setTitle("🗑️ Giriş Sistemi Sıfırlandı")
              .setDescription("Giriş sistemi ayarları başarıyla silindi.")
              .setColor("#e01e1e")
              .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
              .setTimestamp()

            return interaction.editReply({ embeds: [resetEmbed] })
          }
        }

        if (tip === "leave" || tip === "all") {
          // Çıkış ayarlarını sıfırla
          const leaveData = await Leave.findOne({ Guild: guildId })

          if (!leaveData) {
            if (tip === "leave") {
              return interaction.editReply({
                content: "❌ Çıkış sistemi zaten ayarlanmamış!",
              })
            }
          } else {
            await Leave.deleteOne({ Guild: guildId })
          }

          if (tip === "leave") {
            const resetEmbed = new EmbedBuilder()
              .setTitle("🗑️ Çıkış Sistemi Sıfırlandı")
              .setDescription("Çıkış sistemi ayarları başarıyla silindi.")
              .setColor("#e01e1e")
              .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
              .setTimestamp()

            return interaction.editReply({ embeds: [resetEmbed] })
          }
        }

        if (tip === "autorole") {
          // Sadece otomatik rol ayarını sıfırla
          const welcomeData = await Welcome.findOne({ Guild: guildId })

          if (!welcomeData || !welcomeData.AutoRole) {
            return interaction.editReply({
              content: "❌ Otomatik rol zaten ayarlanmamış!",
            })
          }

          welcomeData.AutoRole = null
          await welcomeData.save()

          const resetEmbed = new EmbedBuilder()
            .setTitle("🗑️ Otomatik Rol Sıfırlandı")
            .setDescription("Otomatik rol ayarı başarıyla silindi. Artık yeni üyelere otomatik rol verilmeyecek.")
            .setColor("#e01e1e")
            .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
            .setTimestamp()

          return interaction.editReply({ embeds: [resetEmbed] })
        }

        if (tip === "all") {
          const resetEmbed = new EmbedBuilder()
            .setTitle("🗑️ Tüm Ayarlar Sıfırlandı")
            .setDescription("Giriş, çıkış ve otomatik rol ayarları başarıyla silindi.")
            .setColor("#e01e1e")
            .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
            .setTimestamp()

          return interaction.editReply({ embeds: [resetEmbed] })
        }
      } else if (subCommand === "bilgi") {
        // Giriş ve çıkış ayarlarını al
        const welcomeData = await Welcome.findOne({ Guild: guildId })
        const leaveData = await Leave.findOne({ Guild: guildId })

        const infoEmbed = new EmbedBuilder()
          .setTitle("ℹ️ Giriş/Çıkış Sistemi Bilgileri")
          .setDescription("Sunucunuzun giriş/çıkış sistemi ayarları aşağıda listelenmiştir.")
          .setColor("#3498db")
          .addFields(
            {
              name: "📥 Giriş Sistemi",
              value: welcomeData ? (welcomeData.Enabled ? "Açık ✅" : "Kapalı ❌") : "Ayarlanmamış ❌",
              inline: true,
            },
            {
              name: "📤 Çıkış Sistemi",
              value: leaveData ? (leaveData.Enabled ? "Açık ✅" : "Kapalı ❌") : "Ayarlanmamış ❌",
              inline: true,
            },
            { name: "\u200B", value: "\u200B", inline: true },
          )

        // Giriş sistemi ayarları
        if (welcomeData) {
          infoEmbed.addFields(
            {
              name: "📥 Giriş Kanalı",
              value: welcomeData.Channel ? `<#${welcomeData.Channel}>` : "Ayarlanmamış",
              inline: true,
            },
            { name: "🎨 Giriş Rengi", value: welcomeData.Color || "#36b030", inline: true },
            {
              name: "🎭 Otomatik Rol",
              value: welcomeData.AutoRole ? `<@&${welcomeData.AutoRole}>` : "Ayarlanmamış",
              inline: true,
            },
            { name: "📝 Giriş Başlığı", value: welcomeData.Title || "👋 Yeni Üye Katıldı!" },
            {
              name: "📝 Giriş Mesajı",
              value: `\`${welcomeData.Message || "{user} sunucuya hoş geldin! Seninle birlikte {memberCount} kişi olduk!"}\``,
            },
          )
        }

        // Çıkış sistemi ayarları
        if (leaveData) {
          infoEmbed.addFields(
            {
              name: "📤 Çıkış Kanalı",
              value: leaveData.Channel ? `<#${leaveData.Channel}>` : "Ayarlanmamış",
              inline: true,
            },
            { name: "🎨 Çıkış Rengi", value: leaveData.Color || "#e01e1e", inline: true },
            { name: "\u200B", value: "\u200B", inline: true },
            { name: "📝 Çıkış Başlığı", value: leaveData.Title || "👋 Bir Üye Ayrıldı" },
            {
              name: "📝 Çıkış Mesajı",
              value: `\`${leaveData.Message || "{user} sunucudan ayrıldı! Artık {memberCount} kişiyiz."}\``,
            },
          )
        }

        // Değişken bilgisi
        infoEmbed.addFields({
          name: "📚 Kullanılabilir Değişkenler",
          value:
            "`{user}` - Kullanıcı etiketi\n`{username}` - Kullanıcı adı\n`{tag}` - Kullanıcı etiketi (username#0000)\n`{memberCount}` - Sunucu üye sayısı\n`{server}` - Sunucu adı",
        })

        infoEmbed
          .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
          .setTimestamp()

        return interaction.editReply({ embeds: [infoEmbed] })
      }
    } catch (error) {
      console.error("Giriş/Çıkış ayarları hatası:", error)
      return interaction.editReply({
        content: "❌ Bir hata oluştu: " + error.message,
      })
    }
  },
}

