const getWebsitePagination = require("./getWebsitePagination");

const getWebsiteInformation = async (browser, page) => {
  try {
    const url = page.url();
    await page.goto(url);

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
      return null;
    }

    const foundOneElement = await page.$$eval(".product__heading h1", (div) =>
      div.map((item) => item.textContent)
    );

    if (foundOneElement[0]) {
      await browser.close();
      return {
        title: foundOneElement,
        link: [page.url()],
        currentLink: page.url(),
      };
    }

    const informationAboutGoods = await page.evaluate(() => {
      const getLink = Array.from(
        document.querySelectorAll(".goods-tile__heading")
      ).map((item) => item.href);

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

      return {
        link: getLink,
        title: getTitle,
      };
    });

    informationAboutGoods.currentLink = page.url();

    const pagination = await getWebsitePagination(browser, page);

    informationAboutGoods.pagination = pagination;

    await browser.close();

    return informationAboutGoods;
  } catch (error) {
    console.log("getWebsiteInformation", error);
  }
};

module.exports = getWebsiteInformation;
