import { test, expect, Page, Browser, chromium } from '@playwright/test';
import { StocksPage } from './pages/StocksPage';

test.describe('Stock Validation Suite', () => {

    let browser: Browser;

    test.beforeAll(async () => {
        browser = await chromium.launch();
    });
    test.beforeEach(async ({ page }) => {
        await page.goto('https://market.tase.co.il/he/market_data/securities/data/stocks');
        await page.setViewportSize({ width: 1920, height: 1080 });

    });
    test.afterEach(async ({ page }) => {
        await page.close();
    });
    test.afterAll(async () => {
        await browser.close();
    });


    test('Filter by "מניות" -> Sort Descending Order by "מס׳ ניע" -> Validate First Item Name', async ({ page }) => {
        const stocksPage = new StocksPage(page);

        await stocksPage.filterBySecurity();
        await stocksPage.sortByStockMarketDescendingOrder();
        
        const actualName = await stocksPage.getTheFirstNameInTable();
        expect(actualName).toBe("דלק רכב")
    });

    test('Filter by "מניות" -> Sort Ascending Order by "מס׳ ניע" -> Validate First Item Name', async ({ page }) => {
        const stocksPage = new StocksPage(page);

        await stocksPage.filterBySecurity();
        await stocksPage.sortByStockMarketAscendingOrder();
        
        const actualName = await stocksPage.getTheFirstNameInTable();
        expect(actualName).toBe("טיב טעם")
    });

    test('Filter by "כתבי אופציה" -> Sort Descending Order by "מס׳ ניע" -> Validate First Item Name', async ({ page }) => {
        const stocksPage = new StocksPage(page);

        await stocksPage.filterByWarrants();
        await stocksPage.sortByStockMarketAscendingOrder();
        
        const actualName = await stocksPage.getTheFirstNameInTable();
        expect(actualName).toBe("אקסל      אפ 10")
    });

    test('Filter by "כתבי אופציה" -> Sort Ascending Order by "מס׳ ניע" -> Validate First Item Name', async ({ page }) => {
        const stocksPage = new StocksPage(page);

        await stocksPage.filterByWarrants();
        await stocksPage.sortByStockMarketAscendingOrder();
        
        const actualName = await stocksPage.getTheFirstNameInTable();
        expect(actualName).toBe("אלומיי     אפ 1")
    });

    // test(' Click a random item and check details on the next page according to the data in the table', async ({ page }) => {
    //     const stocksPage = new StocksPage(page);

    //     const expectedDetails = await stocksPage.pickRandomItem();
    //     const actualDetails = await stocksPage.actualRandomItemDetails();

    //     expect(actualDetails.name).toContain(expectedDetails.name);
    // });
});