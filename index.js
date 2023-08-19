const { Telegraf, Markup, Scenes, session } = require("telegraf");
const { message } = require("telegraf/filters");
const getWebsiteData = require("./helpers/getWebsiteData");
const getWebsiteInformation = require("./helpers/getWebsiteInformation");
const getWebsitePagination = require("./helpers/getWebsitePagination");

const bot = new Telegraf("6473151736:AAEMyONusbgBzMB6M8aZnU4APGGPqlxOu7c");
const newPage = new Scenes.BaseScene("newPage");

newPage.enter(async (ctx) => {});

const stage = new Scenes.Stage([newPage]);
bot.use(session());
bot.use(stage.middleware());

bot.help((ctx) => ctx.reply("Відправте повідомлення на сайт"));

bot.on(message("text"), async (ctx, value) => {
  try {
    const data = await getWebsiteData(ctx.update.message.text);

    if (!data) {
      return ctx.reply("За заданими параметрами не знайдено жодної моделі");
    }

    const result = data.title.map((item, idx) => {
      const currentLink = data.link[idx];
      return [Markup.button.url(item, currentLink)];
    });

    const text = Markup.inlineKeyboard(result);

    await ctx.replyWithHTML("<b>Товари</b>", text);

    console.log(data.pagination);

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

    console.log(data.pagination.page);

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
