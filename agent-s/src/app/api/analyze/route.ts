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
        const userActivity: string[] = [];

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

        // Record user activity
        page.on('click', (event) => {
            userActivity.push(`Clicked on ${event.target}`);
        });

        page.on('navigation', (event) => {
            userActivity.push(`Navigated to ${event.url}`);
        });

        page.on('formsubmit', (event) => {
            userActivity.push(`Form submitted with data: ${JSON.stringify(event.data)}`);
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

            await page.goto(`${url}/search-results?q=beard`, { waitUntil: 'domcontentloaded' });


                default: {
                    console.error("Invalid action type provided: ", action_type);
                    break;
                }

            }

          
            // Pick all divs with product_card classname and click on one at random
            const productCards = await page.$$('div.product_card');
            if (productCards.length > 0) {
                const randomIndex = Math.floor(Math.random() * productCards.length);
                await productCards[randomIndex].click();
                userActivity.push(`Clicked on product card at index ${randomIndex}`);
            }

            // Scroll and look for the "Add To Cart" text, and click on it when available
            await page.evaluate(async () => {
                const scrollAndClick = async () => {
                    const addToCartDiv = Array.from(document.querySelectorAll('div')).find(div => div.textContent?.trim() === 'Add To Cart');
                    if (addToCartDiv) {
                        addToCartDiv.click();
                        return true;
                    }
                    window.scrollBy(0, window.innerHeight);
                    return false;
                };

                let found = false;
                while (!found) {
                    found = await scrollAndClick();
                    await new Promise(resolve => setTimeout(resolve, 1000)); // wait for 1 second before checking again
                }
            });

            // Log all button elements with their inner children
            const buttonElements = await page.evaluate(() => {
                const buttons = Array.from(document.querySelectorAll('button'));
                return buttons.map(button => button.outerHTML);
            });

            console.log('Button Elements:', buttonElements);

            // Wait until the specific button is clickable and then click it
            await page.waitForFunction(() => {
                const button = Array.from(document.querySelectorAll('button')).find(button =>
                    button.getAttribute('type') === 'submit' &&
                    button.getAttribute('data-tbs-element-id') === 'product-page-atc' &&
                    button.querySelector('div')?.textContent?.trim() === 'Add To Cart'
                );
                return button && !button.disabled;
            });

            await page.evaluate(() => {
                const button = Array.from(document.querySelectorAll('button')).find(button =>
                    button.getAttribute('type') === 'submit' &&
                    button.getAttribute('data-tbs-element-id') === 'product-page-atc' &&
                    button.querySelector('div')?.textContent?.trim() === 'Add To Cart'
                );
                if (button) {
                    button.click();
                }
            });

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
        console.log('User Activity:', userActivity);

    } catch (e) {
        console.log(e);
    }
}