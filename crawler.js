const { timeout } = require("puppeteer");
const puppeteer = require("puppeteer");

async function initBrowser() {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: [
      "--disable-dev-shm-usage",
      "--no-sandbox",
      "--disable-setuid-sandbox",
    ],
  });

  const page = await browser.newPage();

  await page.goto("https://cloud.eais.go.kr", {
    timeout: 60000,
  });

  // await page.waitForNavigation();

  return { browser, page };
}

async function login(page, username, password) {
  try {
    await page.locator(".btnLogin").click();
    await page.waitForSelector("#membId");
    await page.type("#membId", username, { delay: 100 });
    await page.type("#pwd", password, { delay: 100 });
    await page.evaluate(async () => {
      console.log("logged here");
      await document.querySelectorAll(".btnLogin")[1].click();
    });
    // await page.evaluate(async () => {
    //   console.log("logged here");
    //   const element = [...document.querySelectorAll("a")].find((e) =>
    //     e.textContent.includes("건축물대장 발급")
    //   );
    //   console.log("element>>>", element);
    //   if (element) {
    //     element.click();
    //   }
    // });
    await page.waitForNavigation({ timeout: 60000 });
  } catch (error) {
    console.error("Login failed:", error);
  }
}

async function searchBuilding(page) {
  try {
    await page.on("dialog", async (dialog) => {
      console.log(dialog.message());
      await dialog.accept();
    });

    await page.evaluate(() => {
      console.log("Triggering action...");
      const element = Array.from(document.querySelectorAll("a")).find((el) =>
        el.textContent.includes("건축물대장 발급")
      );
      if (element) {
        element.click();
      } else {
        console.log("Element not found");
      }
    });

    await page.waitForNavigation({ timeout: 60000 });

    const buttonHandle = await page.$('button.btnLotNum[title="지번 조회"]');
    if (buttonHandle) {
      await page.evaluate((el) => el.scrollIntoView(), buttonHandle);
      await buttonHandle.click();
    } else {
      console.log("Button not found");
    }

    await page.select("select.wd19", "1083");

    await page.select("select.wd20", "43750");
  } catch (error) {
    console.error("Search building failed:", error);
  }
}

async function main() {
  const { browser, page } = await initBrowser();
  await login(page, "hhs0609", "ch2730053**");

  await searchBuilding(page);
  // await printAndSavePDF(page);

  // await browser.close();
}

main().catch(console.error);
