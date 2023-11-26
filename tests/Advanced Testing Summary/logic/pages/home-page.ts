import { Locator, Page } from "@playwright/test";
import { BasePage } from "./base-page";
import { getRandomInt } from "../utils/common-functions";
import { Header } from "./components/header";

export class HomePage extends BasePage {

    private readonly SEARCH_INPUT_LOC = "//input[@name='criteria']";
    private readonly SEARCH_BUTTON_LOC = "//input[@type='image']";
    private readonly CARDS_NAME_LOC = "//div[@class='name']";


    private searchInput: Locator;
    private searchBtn: Locator;
    private cardsName: Locator;

    header: Header;

    constructor(page: Page) {
        super(page);
        this.searchInput = page.locator(this.SEARCH_INPUT_LOC);
        this.searchBtn = page.locator(this.SEARCH_BUTTON_LOC);
        this.header = new Header(page);
    }


    async searchForCard(input: string) {
        await this.page.waitForSelector(this.SEARCH_INPUT_LOC);
        await this.searchInput.fill(input);
        await this.searchBtn.click();
    }

    async getRandomCardNameAfterSearch() {
        const count = await this.page.locator(this.CARDS_NAME_LOC).count();
        this.cardsName = this.page.locator(this.CARDS_NAME_LOC).nth(getRandomInt(count));
        return await this.cardsName.textContent();
    }

    // Header functions
    async pressHomeInHeader() {
        await this.header.pressHome();
    }

    async pressBrowseSetsInHeader() {
        await this.header.pressBrowseSets();
    }

    async pressShopInHeader() {
        await this.header.pressShop();
    }

    async pressSignIn() {
        await this.header.pressSignIn();
    }

    async pressRegister() {
        await this.header.pressRegister();
    }

    async getUserName() {
        return await this.header.getUserName();
    }

}