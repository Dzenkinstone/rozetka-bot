const getWebsitePagination = async (browser, page) => {
  try {
    const url = page.url();
    await page.goto(url);
    await Promise.race([
      page.waitForSelector(".pagination__list"),
      page.waitForSelector(".product-about"),
    ]);

    const foundOneElement = await page.$$eval(".product-about", (div) =>
      div.map((item) => item)
    );

    if (foundOneElement[0]) {
      return null;
    }

    console.log("asd");

    const findPaginationList = await page.$$eval(".pagination__list", (el) =>
      el.map((item) => item.textContent)
    );

    const findLastPage =
      Number(findPaginationList[0][findPaginationList[0].length - 1]) || null;

    const currentPage =
      Number(
        url
          .split("&")
          .filter((item) => item.includes("page"))[0]
          .split("page=")[1]
      ) || null;

    if (findPaginationList[0] && findLastPage === currentPage) {
      return { lastPage: url };
    }

    const findPaginationButton = await page.$$eval(
      ".pagination__direction--forward",
      (div) => div.map((item) => item.href)
    );

    if (findPaginationButton[0]) {
      if (findPaginationButton[0] === "") {
        return null;
      }

      return findPaginationButton[0];
    }

    return null;
  } catch (error) {
    console.log("pagination", error);
  }
};

module.exports = getWebsitePagination;
