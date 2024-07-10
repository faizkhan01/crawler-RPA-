const { timeout } = require("puppeteer");
const puppeteer = require("puppeteer");

async function initBrowser() {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: false,
  });

  const page = await browser.newPage();
  await page.goto("https://cloud.eais.go.kr/", {
    waitUntil: "networkidle2",
    timeout: 60000,
  });

  await page.waitForNavigation();

  // Click the close button on the popup
  await page.click(".btnClose");

  return { browser, page };
}

async function login(page, username, password) {
  try {
    await page.click(".btnLogin");

    // Interacting with the element
    await page.waitForSelector("#membId");
    await page.type("#membId", username);
    await page.type("#pwd", password);
    await page.click("button.btnLogin");
  } catch (error) {
    console.error("Login failed:", error);
  }
}

async function searchBuilding(page, address) {
  try {
    await page.click('text="Issuance of building ledger"'); // Adjust the selector as necessary
    await page.waitForSelector("#address_input_id", { timeout: 60000 }); // Replace with actual ID

    await page.type("#address_input_id", address); // Replace with actual ID
    await page.keyboard.press("Enter");
    await page.waitForTimeout(2000); // Adjust the wait time based on actual load time
  } catch (error) {
    console.error("Search building failed:", error);
  }
}

// async function printAndSavePDF(page) {
//   try {
//     await page.click("#print_button_id"); // Replace with actual ID
//     await page.waitForTimeout(2000); // Adjust the wait time based on actual load time

//     // Handle the print dialog and save the PDF locally
//     // Puppeteer can directly save the PDF using its PDF generation capability
//     await page.pdf({ path: `output_${Date.now()}.pdf`, format: "A4" });
//   } catch (error) {
//     console.error("Print and save PDF failed:", error);
//   }
// }

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
  await login(page, "ohk5004", "MufinNumber1");

  for (const address of addresses) {
    await searchBuilding(page, address);
    //   await printAndSavePDF(page);
  }

  //   await browser.close();
}

main().catch(console.error);
