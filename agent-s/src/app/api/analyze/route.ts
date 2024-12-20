import { linkSchema } from "@/validators/LinkValidator";
import { error } from "console";
import puppeteer, { Page } from 'puppeteer';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { url , action_type } = linkSchema.parse(body);

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

            switch(action_type) {
                case 'listing': {
                    const searchInputs = await page.$$('input[type="search"]');
                    for (const input of searchInputs) {
                        await input.click();
                        await input.type('beard');
                        await page.keyboard.press('Enter');
                    }
                    await page.waitForSelector('div.product.card');
                    break;
                }

                case 'add_to_cart': {
                    const addToCartButtons = await page.$$('button.add_to_cart');
                    if(addToCartButtons.length>0 ) {
                        const randomIndex = Math.floor(Math.random() * addToCartButtons.length);
                        await addToCartButtons[randomIndex].click();
                    }
                    break;
                }
                case 'check_out': {
                    const checkoutButton = await page.$('button.checkout');
                    if (checkoutButton) {
                        await checkoutButton.click();
                    }
                    break;
                }

                case 'support': {
                    const supportLink = await page.$('a.support');
                    if (supportLink) {
                        await supportLink.click();
                    }
                    break;
                }

                default: {
                    console.error("Invalid action type provided: ", action_type);
                    break;
                }

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