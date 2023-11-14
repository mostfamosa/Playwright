import { Page, Locator } from 'playwright';

export class StocksPage {
    private page: Page;

    // Locators
    private SORT_BY_STOCK_MARKET_HIGH_TO_LOW_BTN: Locator;
    private SORT_BY_STOCK_MARKET_LOW_TO_HIGH_BTN: Locator;
    private FILTER_OPTION_SELECT: Locator;
    private FILTER_BUTTON: Locator;
    private STOCK_MARKET_FIRST_NAME: Locator;
    private STOCK_MARKET_FIRST_TYPE: Locator;
    private STOCK_MARKET_RANDOM_NAME: Locator;
    private STOCK_MARKET_RANDOM_SYMBOL: Locator;




    constructor(page: Page) {
        this.page = page;

        //init locators on page
        this.SORT_BY_STOCK_MARKET_HIGH_TO_LOW_BTN = this.page.locator("(//button[@class = 'glyphicon glyphicon-menu-down sorting_button'])[3]");
        this.SORT_BY_STOCK_MARKET_LOW_TO_HIGH_BTN = this.page.locator("(//button[@class = 'glyphicon glyphicon-menu-up sorting_button'])[3]");
        this.FILTER_OPTION_SELECT = this.page.locator("//select[@id = 'filterOptions' ]").first();
        this.FILTER_BUTTON = this.page.locator("//button[@class='sort_table sort_action_buttons btn-block']");
    }

    async pickRandomItem() {
        this.STOCK_MARKET_RANDOM_NAME = await this.page.locator("//tbody//tr").nth(Math.floor(Math.random() * 15) + 1).locator("//td").first().locator("//a");
        this.STOCK_MARKET_RANDOM_SYMBOL = await this.page.locator("//tbody//tr").nth(Math.floor(Math.random() * 15) + 1).locator("//td").nth(2);
        await this.STOCK_MARKET_RANDOM_NAME.click();
        return { name: this.STOCK_MARKET_RANDOM_NAME.textContent(), symbol: this.STOCK_MARKET_RANDOM_SYMBOL.textContent() };
    }

    async actualRandomItemDetails() {
        return { name: this.page.locator("//h1").textContent(), symbol: this.page.locator("//span[@class = 'simul ng-star-inserted']").textContent() };
    }

    async filterBySecurity() {
        await this.FILTER_OPTION_SELECT.selectOption('מניות');
        await this.FILTER_BUTTON.scrollIntoViewIfNeeded();
        await this.FILTER_BUTTON.click();
    }

    async filterByWarrants() {
        await this.FILTER_OPTION_SELECT.selectOption('כתבי אופציה');
        await this.FILTER_BUTTON.scrollIntoViewIfNeeded();
        await this.FILTER_BUTTON.click();
    }

    // Sort from high to low by stock market
    async sortByStockMarketDescendingOrder() {
        await this.SORT_BY_STOCK_MARKET_HIGH_TO_LOW_BTN.click();
    }

    // Sort from low to high by stock market
    async sortByStockMarketAscendingOrder() {
        await this.SORT_BY_STOCK_MARKET_LOW_TO_HIGH_BTN.click();
    }

    async getTheFirstNameInTable() {

        // Wait for the loading screen to disappear
        await this.page.waitForSelector('//iframe', { state: 'detached' });
        await this.page.waitForTimeout(2000);
        this.STOCK_MARKET_FIRST_NAME = this.page.locator("//tbody//tr").first().locator("//td").first();

        return await this.STOCK_MARKET_FIRST_NAME.textContent();
    }

    async getTheFirstTypeInTable() {
        // Wait for the loading screen to disappear
        await this.page.waitForSelector('//iframe', { state: 'detached' });
        await this.page.waitForTimeout(2000);
        this.STOCK_MARKET_FIRST_TYPE = this.page.locator("//tbody//tr").first().locator("//td").nth(4);

        return await this.STOCK_MARKET_FIRST_TYPE.textContent();
    }
}