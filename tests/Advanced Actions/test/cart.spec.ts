import { test, Request, expect, Page, chromium, BrowserContext } from '@playwright/test';
import { HomePage } from '../logic/pages/homePage';


const BASE_URL = 'https://www.rami-levy.co.il';



test.describe('State Stock Table Validation Suite', () => {

    let context: BrowserContext;
    let page: Page;

    test.beforeAll(async () => {
        context = await chromium.launchPersistentContext("userData");
        page = await context.newPage();
    });

    test.beforeEach(async () => {
        await page.goto(BASE_URL);
        await page.setViewportSize({ width: 1920, height: 1080 });

    });
    test.afterEach(async ({ request }) => {

        //clear the cart
        await request.post(`${BASE_URL}/api/v2/cart`, {
            data: {
                "isClub": 0,
                "items": { "164854": "1.00" },
                "meta": null,
                "store": 331,
                "supplyAt": `${new Date().toISOString()}`
            }
        });

    })

    test.afterAll(async () => {
        await context.close();
    });

    test('Adding one pack of cocacola via api -> Validate request and cart price', async ({ request }) => {

        const colaId = "386565";
        const quantity = 1;
        const response = await request.post(`${BASE_URL}/api/v2/cart`, {
            data: {
                "isClub": 0,
                "items": { "386565": quantity },
                "meta": null,
                "store": 331,
                "supplyAt": `${new Date().toISOString()}`
            }
        });
        const bodyRes = await response.json();

        await page.reload();

        const homePage = new HomePage(page);
        const cartPriceBrowser = await homePage.getCartPrice();

        console.log("Cart Price: " + cartPriceBrowser);
        expect.soft(response.ok()).toBeTruthy();
        expect.soft(response.status()).toBe(200);
        expect.soft(bodyRes.items[1].id).toBe(parseInt(colaId));
        expect.soft(bodyRes.items[1].quantity).toBe(quantity);
        expect.soft(bodyRes.price).toBe(cartPriceBrowser);

    });

    test('Adding one pack of cocacola via api -> Adding another pack by UI -> Validate request and cart price', async ({ request }) => {

        const colaId = "386565";
        const quantity = 1;
        const response = await request.post(`${BASE_URL}/api/v2/cart`, {
            data: {
                "isClub": 0,
                "items": { "386565": quantity },
                "meta": null,
                "store": 331,
                "supplyAt": `${new Date().toISOString()}`
            }
        });
        const bodyRes = await response.json();

        await page.reload();

        const homePage = new HomePage(page);
        await homePage.duplicateFirstItemInCart();
        const cartPriceBrowser = await homePage.getCartPrice();

        console.log("Cart Price: " + cartPriceBrowser);
        expect.soft(response.ok()).toBeTruthy();
        expect.soft(response.status()).toBe(200);
        expect.soft(bodyRes.items[1].id).toBe(parseInt(colaId));
        expect.soft(bodyRes.items[1].quantity).toBe(quantity);
        expect.soft(bodyRes.price * 2).toBe(cartPriceBrowser);

    });

    test('Adding one kg of green apple via API -> clear the cart via UI -> Validate request and cart price', async ({ request }) => {

        const colaId = "18";
        const quantity = 1;
        const response = await request.post(`${BASE_URL}/api/v2/cart`, {
            data: {
                "isClub": 0,
                "items": { "18": quantity },
                "meta": null,
                "store": 331,
                "supplyAt": `${new Date().toISOString()}`
            }
        });
        const bodyRes = await response.json();

        await page.reload();

        const homePage = new HomePage(page);
        await homePage.clearTheCart();

        const cartPriceBrowser = await homePage.getCartPrice();

        console.log("Cart Price: " + cartPriceBrowser);
        expect.soft(response.ok()).toBeTruthy();
        expect.soft(response.status()).toBe(200);
        expect.soft(bodyRes.items[0].id).toBe(parseInt(colaId));
        expect.soft(bodyRes.items[0].quantity).toBe(quantity);
        expect.soft(0).toBe(cartPriceBrowser);

    });

});