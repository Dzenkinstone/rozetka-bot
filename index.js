const { Telegraf, Markup } = require("telegraf");
const { message } = require("telegraf/filters");
const puppeteer = require("puppeteer");

const bot = new Telegraf("6473151736:AAEMyONusbgBzMB6M8aZnU4APGGPqlxOu7c");

async function start(value) {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto("https://rozetka.com.ua/");

  await page.type(
    '.search-form .search-form__inner .search-form__input-wrapper input[type="text"]',
    value,
    { delay: 100 }
  );

  await Promise.all([
    page.click(".search-form__submit"),
    page.waitForNavigation(),
  ]);

  await Promise.race([
    page.waitForSelector(".catalog-empty"),
    page.waitForSelector(".product-about"),
    page.waitForSelector(".goods-tile"),
  ]);

  const notFound = await page.$$eval(".catalog-empty span", (div) =>
    div.map((item) => item.textContent)
  );

  if (notFound[0]) {
    await browser.close();
    return false;
  }

  const foundOneElement = await page.$$eval(".product__heading h1", (div) =>
    div.map((item) => item.textContent)
  );

  if (foundOneElement[0]) {
    await browser.close();
    return foundOneElement[0];
  }

  const informationAboutGoods = await page.evaluate(() => {
    const getLink = Array.from(
      document.querySelectorAll(".goods-tile__heading")
    ).map((item) => item.href);

    const getPrice = Array.from(
      document.querySelectorAll(".goods-tile__price-value")
    ).map((item) => item.textContent.trim());

    const getTitle = Array.from(
      document.querySelectorAll(".goods-tile__title")
    ).map((item) => {
      const splitTitle = item.textContent.trim().split(" ");

      if (splitTitle.length < 7) {
        return splitTitle.join(" ");
      }

      const setToMonimumLength = splitTitle.slice(0, 7).join(" ");
      return setToMonimumLength;
    });

    return { link: getLink, price: getPrice, title: getTitle };
  });

  await browser.close();

  return informationAboutGoods;
}

const pagination = async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto("https://rozetka.com.ua/");
};

bot.start((ctx) => ctx.reply("Welcome"));
bot.help((ctx) => ctx.reply("Відправте повідомлення на сайт"));
bot.on(message("text"), async (ctx) => {
  try {
    const data = await start(ctx.update.message.text);

    if (!data) {
      return ctx.reply("За заданими параметрами не знайдено жодної моделі");
    }

    const result = data.title.map((item, idx) => {
      const currentLink = data.link[idx];
      return [Markup.button.url(item, currentLink)];
    });

    const text = Markup.inlineKeyboard(result);

    await ctx.replyWithHTML("<b>Товари</b>", text);

    await ctx.reply(
      "Подивитися ще",
      Markup.inlineKeyboard([[Markup.button.callback("⬇️", "button_1")]])
    );
  } catch (error) {
    console.log(error.message);
  }
});

bot.hears("photo", (ctx) => ctx.reply());
bot.launch();

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
