import { test, expect, Browser, chromium } from '@playwright/test';
import { HomePage } from "../logic/pages/home-page"

const BASE_URL = 'https://www.pokellector.com/';

test.describe('SignIn Page Validations Suite', () => {
    test.use({ storageState: 'playwright/.auth/user.json' });
    let browser: Browser;

    test.beforeAll(async () => {
        browser = await chromium.launch();
    });
    test.beforeEach(async ({ page }) => {
        await page.goto(BASE_URL);
        await page.setViewportSize({ width: 1920, height: 1080 });
    });
    test.afterEach(async ({ page }) => {
        await page.close();
    });
    test.afterAll(async () => {
        await browser.close();
    });

    test(`Go to Main Page -> Click at Home -> Validate the page navigation `, async ({ page }) => {
        const expectedUrl = "https://www.pokellector.com/";

        const homePage = new HomePage(page);
        await homePage.header.pressHome();
        await homePage.waitForLoad();

        let currentUrl = await homePage.getCurrentUrl();
        expect(currentUrl).toBe(expectedUrl);
    });

    test(`Go to Main Page -> Click at Browse Sets -> Validate the page navigation `, async ({ page }) => {
        const expectedUrl = "https://www.pokellector.com/sets";

        const homePage = new HomePage(page);
        await homePage.header.pressBrowseSets();
        await homePage.waitForLoad();

        let currentUrl = await homePage.getCurrentUrl();
        expect(currentUrl).toBe(expectedUrl);
    });

    test(`Go to Main Page -> Click at Shop -> Validate the page navigation `, async ({ page, context }) => {
        const expectedUrl = "https://pkmn.store/?utm_source=pokellector&utm_medium=topnav&utm_campaign=static";

        const homePage = new HomePage(page);
        const newPage = await Promise.all([
            context.waitForEvent('page'),
            homePage.header.pressShop()
          ])

        let currentUrl = newPage[0].url();
        expect(currentUrl).toBe(expectedUrl);
    });
});