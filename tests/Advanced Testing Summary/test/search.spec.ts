import { test, expect, Browser, chromium } from '@playwright/test';
import { HomePage } from "../logic/pages/home-page"

const BASE_URL = 'https://www.pokellector.com/';

test.describe('Search Validations Suite', () => {

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

    // Parameterize test searching for cards
    const cardNames = [
        { name: "Pikachu" },
        { name: "Blastoise" },
        { name: "Venusaur" },
        { name: "Charmander" }
    ]
    for (const card of cardNames) {
        test(`Go to Home Page -> Search for :${card.name} -> Validate results match the card`, async ({ page }) => {
            const homePage = new HomePage(page);
            await homePage.searchForCard(card.name);

            const randomCard = await homePage.getRandomCardNameAfterSearch();
            console.log("Found Card: " + randomCard);
            expect(randomCard).toContain(card.name);
        });
    }
});