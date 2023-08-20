const { default: puppeteer } = require("puppeteer");
const getWebsiteInformation = require("./getWebsiteInformation");

const getWebsiteData = async (value, url = "https://rozetka.com.ua/") => {
  try {
    const browser = await puppeteer.launch({
      headless: false,
      args: [
        "--no-sandbox",
        "--disabled-setupid-sandbox",
        "--single-process",
        "--no-zygote",
      ],
      executablePath:
        process.env.NODE_ENV === "production"
          ? process.env.PUPPETEER_EXECUTABLE_PATH
          : puppeteer.executablePath(),
    });
    const page = await browser.newPage();
    await page.goto(url);

    if (url === "https://rozetka.com.ua/") {
      await page.type(
        '.search-form .search-form__inner .search-form__input-wrapper input[type="text"]',
        value
      );

      await Promise.all([
        page.click(".search-form__submit"),
        page.waitForNavigation(),
      ]);

      const responce = await getWebsiteInformation(browser, page);

      await browser.close();

      return responce;
    }

    const getInformation = await getWebsiteInformation(browser, page);

    if (!getInformation.pagination) {
      await browser.close();
      return "Немає результатів";
    }

    return getInformation;
  } catch (error) {
    console.log("getWebsiteData", error.message);
  }
};

module.exports = getWebsiteData;
