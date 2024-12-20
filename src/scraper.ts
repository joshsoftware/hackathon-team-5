import puppeteer, { Page } from 'puppeteer';

const captureScreenshotAndLogs = async (url: string) => {
  const browser = await puppeteer.launch({ headless: true });
  const page: Page = await browser.newPage();


  page.on('console', (msg) => {
    const msgText = msg.text();
    console.log('Console Log:', msgText);
  });

  try {

    await page.goto(url, { waitUntil: 'domcontentloaded' });


    const screenshotPath = 'screenshot.png';
    await page.screenshot({ path: screenshotPath });
    console.log(`Screenshot saved at ${screenshotPath}`);
  } catch (error) {
    console.error('Error during page processing:', error);
  } finally {
    await browser.close();
  }
};


const targetUrl = 'https://www.thebeardstruggle.com/';
captureScreenshotAndLogs(targetUrl);
