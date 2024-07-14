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
    waitUntil: "networkidle2",
  });

  await page.waitForNavigation();

  return { browser, page };
}

async function login(page, username, password) {
  try {
    await page.locator(".btnLogin").click();
    await page.waitForSelector("#membId");
    await page.type("#membId", username, { delay: 100 });
    await page.type("#pwd", password, { delay: 100 });
    await page.evaluate(async () => {
      await document.querySelectorAll(".btnLogin")[1].click();
    });

    // Explicitly redirect to the desired URL after login
    // await page.waitForTimeout(5000); // Adjust based on actual login time
    // await page.goto("https://cloud.eais.go.kr", {
    //   waitUntil: "domcontentloaded",
    //   timeout: 60000,
    // });
  } catch (error) {
    console.error("Login failed:", error);
  }
}

async function searchBuilding(page, address) {
  try {
    await page.on("dialog", async (dialog) => {
      console.log(dialog.message());
      await dialog.accept();
    });

    await Promise.all([
      page.evaluate(() => {
        const element = [...document.querySelectorAll("a")].find((e) =>
          e.textContent.includes("건축물대장 발급")
        );
        if (element) {
          element.click();
        }
      }),
      page.waitForNavigation({ waitUntil: "networkidle0" }),
    ]);

    // Wait for the '도로명주소 조회' button to appear
    await page.waitForSelector('button[title="도로명주소 조회"].btnAddrSrch', {
      timeout: 60000,
    });

    // Click the '도로명주소 조회' button
    await page.click('button[title="도로명주소 조회"].btnAddrSrch');
    await page.waitForSelector('input[title="통합주소검색"]#keyword', {
      timeout: 60000,
    });

    // Type the address into the input field
    await page.type('input[title="통합주소검색"]#keyword', address);
    await page.click(
      'button[title="조회하기"].btnNext.btnSolid.btnNormal.btn_dark'
    );

    await page.waitForTimeout(2000);
  } catch (error) {
    console.error("Search building failed:", error);
  }
}

async function main() {
  const addresses = [
    "경기도 고양시 일산동구 강석로 152 강촌마을아파트 제701동 제2층 제202호 [마두동 796]",
    "서울특별시 강남구 언주로 332 역삼푸르지오 제101동 제1층 제101호 [역삼동 754-1]",
    "서울특별시 강남구 언주로 332 역삼푸르지오 제101동 제1층 제102호 [역삼동 754-1]",
    "경기도 부천시 부일로 440-13 숲속애가 주건축물제1동 [심곡동 396-9 외 1필지]",
    "인천광역시 부평구 부영로 196 대림아파트 제11동 제1층 제102호 [부평동 64-20 외 2필지]",
    "경기도 부천시 부일로 440-13 숲속애가 주건축물제1동 [심곡동 396-9 외 1필지]",
  ];

  const { browser, page } = await initBrowser();
  await login(page, "hhs0609", "ch2730053**");

  for (const address of addresses) {
    await searchBuilding(page, address);
    // await printAndSavePDF(page);
  }

  await browser.close();
}

main().catch(console.error);
