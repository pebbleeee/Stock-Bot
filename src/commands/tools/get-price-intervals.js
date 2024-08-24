const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("get-price-intervals")
    .setDescription("Gets Stock Prices Over Intervals!")
    .addStringOption((option) =>
      option
        .setRequired(true)
        .setName("stock-name")
        .setMaxLength(20)
        .setDescription("Get the live stock price of any stock")
    )
    .addStringOption((option) =>
      option
        .setRequired(true)
        .setName("interval-time")
        .setAutocomplete(true)
        .setDescription(
          "What intervals lengths should the data be retrieved from?"
        )
    )
    .addIntegerOption((option) =>
      option
        .setRequired(true)
        .setName("amount")
        .setDescription(
          "How many values in those intervals of time do you want?"
        )
        .setMaxValue(50)
        .setMinValue(1)
    ),

  async autocomplete(interaction, client) {
    const focusedValue = interaction.options.getFocused();
    const choices = [
      "1min",
      "5min",
      "15min",
      "30min",
      "60min",
      "daily",
      "weekly",
      "monthly",
    ];

    const filtered = choices.filter((choice) =>
      choice.startsWith(focusedValue)
    );
    await interaction.respond(
      filtered.map((choice) => ({ name: choice, value: choice }))
    );
  }, // autocomplete's the interval option

  async execute(interaction, client) {
    const user_stock_name = interaction.options.getString("stock-name");
    const user_interval_time = interaction.options.getString("interval-time");
    const user_amount = interaction.options.getInteger("amount");

    const { stocks } = client;
    try {
      const results = await stocks.timeSeries({
        symbol: user_stock_name,
        interval: user_interval_time,
        amount: user_amount,
      });

      let parseString = `Information on **${user_stock_name}** for **${user_amount}** **${user_interval_time} intervals**:\n`;
      results.forEach((object) => {
        const { open, close, date } = object;
        parseString += `On ${date}, the stock opened at $${open.toFixed(
          2
        )} and closed at $${close.toFixed(2)}.`;
        parseString += "\n";
      });

      await interaction.reply({
        content: parseString,
      });
    } catch (err) {
      await interaction.reply({
        content: "Something went wrong...",
      });
      console.log(err);
    }
  },
};
