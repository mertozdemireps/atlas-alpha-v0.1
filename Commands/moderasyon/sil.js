const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sil')
        .setDescription('Belirtilen sayıda mesajı siler veya konsolu temizler.')
        .addIntegerOption(option => 
            option.setName('amount')
                .setDescription('Silinecek mesaj sayısı (1-100)')
                .setMinValue(1)
                .setMaxValue(100)
                .setRequired(true)
        ),
    
    async execute(interaction) {
        const amount = interaction.options.getInteger('amount');

        if (amount) {
            // Mesajları temizleme
            const channel = interaction.channel;
            await channel.bulkDelete(amount, true);
            await interaction.reply({ content: `${amount} mesaj temizlendi!`, ephemeral: true });
        } else {
            // Konsolu temizleme
            console.clear();
            await interaction.reply({ content: 'Konsol temizlendi!', ephemeral: true });
        }
    }
};