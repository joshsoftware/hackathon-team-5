import { linkSchema } from "@/validators/LinkValidator";
import axios from 'axios';
import Ollama from 'ollama';
import puppeteer, { HTTPRequest, HTTPResponse, Page } from 'puppeteer';

interface ErrorDetail {
    message: string;
    timestamp: string;
    stack?: string;
}

interface NetworkErrorDetail {
    statusCode?: number;
    error: string;
    response?: string;
    headers: Record<string, string>;
    url: string;
    timestamp: string;
}

interface LogEntry {
    action_type: string;
    url: string;
    // domain: string;
    console_errors: ErrorDetail[];
    network_errors: NetworkErrorDetail[];
    timestamp: string;
}

interface LogStructure {
    domain: string;
    logs: LogEntry[];
    explanation?: string;
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { url } = linkSchema.parse(body);

        const logStructure: LogStructure = {
            domain: url,
            logs: [],
            explanation: ""
        };

        let currentAction: LogEntry | null = null;




        const createNewAction = (actionType: string, pageUrl: string) => {
            currentAction = {
                // domain: url,
                action_type: actionType,
                url: pageUrl,
                console_errors: [],
                network_errors: [],
                timestamp: new Date().toISOString()
            };
            logStructure.logs.push(currentAction);
            return currentAction;
        };


        const browser = await puppeteer.launch({ headless: false });
        const page: Page = await browser.newPage();

        await page.setCacheEnabled(false);

        // Console error listener
        page.on('console', (msg) => {
            if (msg.type() === 'error' && currentAction) {
                const errorDetail: ErrorDetail = {
                    message: msg.text(),
                    timestamp: new Date().toISOString(),
                    stack: msg.stackTrace().length > 0 ?
                        JSON.stringify(msg.stackTrace()) : undefined
                };
                currentAction.console_errors.push(errorDetail);
            }
        });

        // Network error listener
        page.on('requestfailed', async (request) => {
            if (!currentAction) return;

            const response = request.response();
            const errorDetail: NetworkErrorDetail = {
                statusCode: response?.status(),
                error: request.failure()?.errorText || "Unknown Error",
                response: response ?
                    await response.text().catch(() => "Unable to retrieve response body") :
                    "No response",
                headers: response?.headers() || {},
                url: request.url(),
                timestamp: new Date().toISOString()
            };
            currentAction.network_errors.push(errorDetail);
        });

        // Track page navigation
        page.on('navigation', (event) => {
            // @ts-ignore no-types
            createNewAction('checkout', event.url);
        });

        try {
            // Initial search
            currentAction = createNewAction('checkout', `${url}/search-results?q=beard`);
            await page.goto(`${url}/search-results?q=beard`, {
                waitUntil: 'domcontentloaded',
                timeout: 30000
            });

            // Product selection
            await page.waitForSelector('div.product_card');
            const productCards = await page.$$('div.product_card');
            if (productCards.length > 0) {
                currentAction = createNewAction('checkout', page.url());
                const randomIndex = Math.floor(Math.random() * productCards.length);
                await productCards[randomIndex].click();
                await page.waitForNavigation({ waitUntil: 'domcontentloaded' });
            }

            // Add to cart action
            currentAction = createNewAction('checkout', page.url());
            await page.evaluate(async () => {
                const scrollAndClick = async () => {
                    const addToCartDiv = Array.from(document.querySelectorAll('div'))
                        .find(div => div.textContent?.trim() === 'Add To Cart');
                    if (addToCartDiv) {
                        addToCartDiv.click();
                        return true;
                    }
                    window.scrollBy(0, window.innerHeight);
                    return false;
                };

                let found = false;
                let attempts = 0;
                while (!found && attempts < 10) {
                    found = await scrollAndClick();
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    attempts++;
                }
                if (!found) throw new Error('Add To Cart button not found after scrolling');
            });

            // Checkout process
            currentAction = createNewAction('checkout', page.url());
            await page.waitForFunction(
                () => {
                    const button = Array.from(document.querySelectorAll('button')).find(button =>
                        button.getAttribute('type') === 'submit' &&
                        button.getAttribute('data-tbs-element-id') === 'product-page-atc' &&
                        button.querySelector('div')?.textContent?.trim() === 'Add To Cart'
                    );
                    return button && !button.disabled;
                },
                { timeout: 10000 }
            );

            await page.evaluate(() => {
                const button = Array.from(document.querySelectorAll('button')).find(button =>
                    button.getAttribute('type') === 'submit' &&
                    button.getAttribute('data-tbs-element-id') === 'product-page-atc' &&
                    button.querySelector('div')?.textContent?.trim() === 'Add To Cart'
                );
                if (button) button.click();
                else throw new Error('Add To Cart button not found');
            });

        } catch (error) {
            if (currentAction) {
                currentAction.console_errors.push({
                    // @ts-ignore no-types

                    message: error.toString(),
                    timestamp: new Date().toISOString(),
                    // @ts-ignore no-types

                    stack: error.stack
                });
            }
        } finally {
            await browser.close();
        }

        // Filter out empty error arrays for cleaner output
        logStructure.logs = logStructure.logs.map(log => ({
            ...log,
            console_errors: log.console_errors.length ? log.console_errors : [],
            network_errors: log.network_errors.length ? log.network_errors : []
        }));

        const chatResponse = await Ollama.chat({
            model: 'llama3.2',
            messages: [
                {
                    role: 'system',
                    content: "You are tasked with analyzing the logs of a user who is trying to purchase a beard product from an e-commerce website. The user is experiencing issues with the checkout process. Analyze the logs and provide a detailed report of the errors encountered, return response in json format with keys: error, Explanation, Possible Solutions"
                },
                {
                    role: 'user',
                    content: JSON.stringify(logStructure, null, 2)
                }
            ]
        });


        // return new Response(JSON.stringify(chatResponse.message.content, null, 2), {
        //     headers: { 'Content-Type': 'application/json' }
        // });

        // send to rails api

        // const response = await axios.post(process.env.API_ENDPOINT!, {
        //     domain: logStructure.domain,
        //     logs: logStructure.logs,
        //     explanation: chatResponse.message.content
        // })

        const response = {
            domain: logStructure.domain,
            logs: logStructure.logs,
            explanation: chatResponse.message.content
        }

        // if(response.status === 200){
        return new Response(JSON.stringify(response), {
            status: 200
        })
        // }


    } catch (e) {
        const errorResponse = {
            // @ts-ignore no-types
            error: e.message,
            timestamp: new Date().toISOString(),
            // @ts-ignore no-types
            logs: logStructure.logs
        };
        return new Response(JSON.stringify(errorResponse, null, 2), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}