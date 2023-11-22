import { test, expect, Page, chromium, BrowserContext } from '@playwright/test';
import { HomePage } from '../logic/pages/homePage';
import { CartApi } from '../logic/api/cart-api';
import { setAddColaItemRequest, setClearCartRequest, setAddApplesInKgRequest } from '../logic/api/request/add-item-request';


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
        const requestDate = setClearCartRequest();
        const cartApi = new CartApi();
        await cartApi.addItemToCart(requestDate)
    })

    test.afterAll(async () => {
        await context.close();
    });

    test('Adding one pack of cocacola via api -> Validate request and cart price', async ({ request }) => {

        const addItemData = setAddColaItemRequest(1);
        const cartApi = new CartApi();
        const response = await cartApi.addItemToCart(addItemData)

        const bodyRes = await response.json();

        await page.reload();

        const homePage = new HomePage(page);
        const cartPriceBrowser = await homePage.getCartPrice();

        console.log("Cart Price: " + cartPriceBrowser);
        expect.soft(bodyRes.price).toBe(cartPriceBrowser);

    });

    test('Adding one pack of cocacola via api -> Adding another pack by UI -> Validate request and cart price', async ({ request }) => {

        const addItemData = setAddColaItemRequest(1);
        const cartApi = new CartApi();
        const response = await cartApi.addItemToCart(addItemData)

        const bodyRes = await response.json();

        await page.reload();

        const homePage = new HomePage(page);
        await homePage.duplicateFirstItemInCart();
        const cartPriceBrowser = await homePage.getCartPrice();

        expect.soft(bodyRes.price * 2).toBe(cartPriceBrowser);

    });

    test('Adding one kg of green apple via API -> clear the cart via UI -> Validate request and cart price', async ({ request }) => {

        const addItemData = setAddApplesInKgRequest(1);
        const cartApi = new CartApi();
        const response = await cartApi.addItemToCart(addItemData)

        const bodyRes = await response.json();

        await page.reload();

        const homePage = new HomePage(page);
        await homePage.clearTheCart();

        const cartPriceBrowser = await homePage.getCartPrice();

        expect.soft(0).toBe(cartPriceBrowser);

    });

});