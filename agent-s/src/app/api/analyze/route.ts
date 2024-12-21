    import { linkSchema } from "@/validators/LinkValidator";
    import puppeteer, { HTTPRequest, HTTPResponse, Page } from 'puppeteer';

    export async function POST(req: Request) {
        try {
            const body = await req.json();
            const { url } = linkSchema.parse(body);
            
            const browser = await puppeteer.launch({ headless: false });
            const page: Page = await browser.newPage();

            const networkLogs: string[] = [];
            const consoleLogs: string[] = [];
            const networkErrors: { 
                statusCode?: number; 
                error: string; 
                response?: string; 
                headers: Record<string, string>; 
            }[] = [];
            const consoleErrors: string[] = [];
            const consoleWarnings: string[] = [];
            const userActivity: string[] = [];

            await page.setCacheEnabled(false);

            page.on('console', (msg) => {
                const msgText = msg.text();
                if (msg.type() === 'error') {
                    consoleErrors.push(msgText);
                } else if (msg.type() === 'warn') {
                    consoleWarnings.push(msgText);
                } else {
                    consoleLogs.push(msgText);
                }
            });

            page.on('requestfailed', async (request) => {
                const response = request.response();
                const errorDetails = {
                    statusCode: response?.status(),
                    error: request.failure()?.errorText || "Unknown Error",
                    response: response ? await response.text().catch(() => "Unable to retrieve response body") : "No response",
                    headers: response?.headers() || {},
                };
                networkErrors.push(errorDetails);
                console.error('Network Error:', errorDetails);
            });
            
                // page.on('request', (request) => console.log('Request:', request.url()));
                // page.on('response', (response) => console.log('Response:', response.url(), response.status()));
                // page.on('requestfailed', (request) => console.log('Request failed:', request.url(), request.failure()?.errorText));

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
                await page.goto(`${url}/search-results?q=beard`, { waitUntil: 'domcontentloaded' });

                await page.waitForSelector('div.product_card');

                const productCards = await page.$$('div.product_card');
                if (productCards.length > 0) {
                    const randomIndex = Math.floor(Math.random() * productCards.length);
                    await productCards[randomIndex].click();
                    userActivity.push(`Clicked on product card at index ${randomIndex}`);
                }

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
                        await new Promise(resolve => setTimeout(resolve, 1000)); 
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
            console.error('Unexpected error:', e);
        }
    }

