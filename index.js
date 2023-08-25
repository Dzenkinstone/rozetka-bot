const { Telegraf, Markup } = require("telegraf");
const { message } = require("telegraf/filters");
const getWebsiteData = require("./helpers/getWebsiteData");
require("dotenv").config();

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.help((ctx) => ctx.reply("Відправте повідомлення на сайт"));

bot.on(message("text"), async (ctx, value) => {
  try {
    const userText = ctx.update.message.text;
    ctx.reply(`Шукаємо товар під назвою "${userText}"...`);

    const data = await getWebsiteData(userText);

    if (!data) {
      return ctx.reply("За заданими параметрами не знайдено жодної моделі");
    }

    const result = data.title.map((item, idx) => {
      const currentLink = data.link[idx];
      return [Markup.button.url(item, currentLink)];
    });

    const text = Markup.inlineKeyboard(result);

    await ctx.replyWithHTML("<b>Товари</b>", text);

    if (data.pagination.url && !data.pagination.message) {
      const minimazedLength = decodeURI(data.pagination.url).includes(
        "wrong_phrase"
      )
        ? decodeURI(data.pagination.url)
            .split("&")
            .filter((item) => !item.includes("wrong_phrase"))
            .join("&")
            .split("/")
            .slice(4, data.pagination.url.length - 1)
            .join("/")
        : decodeURI(data.pagination.url)
            .split("/")
            .slice(4, data.pagination.url.length - 1)
            .join("/");

      return await ctx.reply(
        "Подивитися ще",
        Markup.inlineKeyboard([[Markup.button.callback("⬇️", minimazedLength)]])
      );
    }

    ctx.reply(`Інших сторінок не знайдено`);
  } catch (error) {
    console.log("catalogue", error);
  }
});

bot.action(/.+/, async (ctx, next) => {
  try {
    const requestUrl =
      ctx.update.callback_query.data.split("//")[0] === "https:"
        ? ctx.update.callback_query.data
        : `https://rozetka.com.ua/ua/${ctx.update.callback_query.data}`;

    const data = await getWebsiteData(null, requestUrl);

    const result = data.title.map((item, idx) => {
      const currentLink = data.link[idx];
      return [Markup.button.url(item, currentLink)];
    });

    const text = Markup.inlineKeyboard(result);

    await ctx.replyWithHTML("<b>Товари</b>", text);

    if (data.pagination.url && !data.pagination.message) {
      const minimazedLength = decodeURI(data.pagination.url).includes(
        "wrong_phrase"
      )
        ? decodeURI(data.pagination.url)
            .split("&")
            .filter((item) => !item.includes("wrong_phrase"))
            .join("&")
            .split("/")
            .slice(4, data.pagination.url.length - 1)
            .join("/")
        : decodeURI(data.pagination.url)
            .split("/")
            .slice(4, data.pagination.url.length - 1)
            .join("/");

      await ctx.reply(
        "Подивитися ще",
        Markup.inlineKeyboard([[Markup.button.callback("⬇️", minimazedLength)]])
      );
    }
  } catch (error) {
    console.log("action", error);
  }
});

bot.launch();

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
