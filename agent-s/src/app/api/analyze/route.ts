import { linkSchema } from "@/validators/LinkValidator";
import puppeteer, { Page } from 'puppeteer';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { url } = linkSchema.parse(body);

        const browser = await puppeteer.launch({ headless: false });
        const page: Page = await browser.newPage();

        const networkLogs: string[] = [];
        const consoleLogs: string[] = [];
        const networkErrors: string[] = [];
        const consoleErrors: string[] = [];
        const consoleWarnings: string[] = [];

        page.on('console', (msg) => {
            const msgText = msg.text();
            if (msg.type() === 'error') {
                consoleErrors.push(msgText);
                console.error('Console Error:', msgText);
            } else if (msg.type() === 'warn') {
                consoleWarnings.push(msgText);
                console.warn('Console Warning:', msgText);
            } else {
                consoleLogs.push(msgText);
                console.log('Console Log:', msgText);
            }
        });

        page.on('requestfailed', (request) => {
            networkErrors.push(request.url());
            console.error('Network Error:', request.url());
        });

        try {
            await page.goto(url, { waitUntil: 'domcontentloaded' });

            // Search for input tags with type 'search' and click on them
            const searchInputs = await page.$$('input[type="search"]');
            for (const input of searchInputs) {
                await input.click();
                await input.type('beard');
                await page.keyboard.press('Enter');
            }

            // Wait for search results to load
            await page.waitForSelector('div.product_card');

            // Pick all divs with product_card classname and click on one at random
            const productCards = await page.$$('div.product_card');
            if (productCards.length > 0) {
                const randomIndex = Math.floor(Math.random() * productCards.length);
                await productCards[randomIndex].click();
            }

        } catch (error) {
            console.error('Error during page processing:', error);
        } finally {
            // await browser.close();
        }

        console.log('Network Logs:', networkLogs);
        console.log('Console Logs:', consoleLogs);
        console.log('Network Errors:', networkErrors);
        console.log('Console Errors:', consoleErrors);
        console.log('Console Warnings:', consoleWarnings);

    } catch (e) {
        console.log(e);
    }
}