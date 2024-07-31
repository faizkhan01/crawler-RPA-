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
    timeout: 100000,
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

    // Wait for the button to appear and click it
    await page.waitForSelector('button.btnLotNum[title="지번 조회"]', {
      timeout: 60000,
    });
    await page.evaluate(() => {
      const button = document.querySelector(
        'button.btnLotNum[title="지번 조회"]'
      );
      if (button) {
        button.click();
      } else {
        console.log("Button not found");
      }
    });

    // Wait for the modal to appear and for the dropdown to be available
    await page.waitForSelector("select.wd19", {
      timeout: 60000,
    });

    // Click the dropdown to activate it (optional step if needed)
    await page.click("select.wd19");

    // Select "경기도" in the dropdown
    await page.select("select.wd19", "경기도");

    // // Perform subsequent actions after selecting the option
    // await page.waitForSelector('select[name="sigunguCd"].wd20', {
    //   timeout: 60000,
    // });
    // await page.select('select[name="sigunguCd"].wd20', "43750");
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
