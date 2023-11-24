import { Locator, Page } from "@playwright/test";
import { BaseComponent } from "./base-component";

export class Header extends BaseComponent {


    private readonly HOME_BAR_BUTTON_LOC = "//div[@class='navigation']//a[contains(string(),'Home')]";
    private readonly BROWSE_SETS_BAR_BUTTON_LOC = "//div[@class='navigation']//a[contains(string(),'Browse Sets')]";
    private readonly SHOP_BAR_BUTTON_LOC = "//div[@class='navigation']//a[contains(string(),'Shop')]";
    private readonly SIGN_IN_BUTTON_LOC = "//div[@class='userinfo']//a[contains(string(),'sign in')]";
    private readonly REGISTER_BUTTON_LOC = "//div[@class='userinfo']//a[contains(string(),'register')]";
    private readonly USERNAME_LOC = "//div[@class='userinfo']//*[@class='username']";


    private homeBtn: Locator;
    private browseSetsBtn: Locator;
    private shopBtn: Locator;
    private signInBtn: Locator;
    private registerBtn: Locator;


    constructor(page: Page) {
        super(page);

        this.homeBtn = page.locator(this.HOME_BAR_BUTTON_LOC);
        this.shopBtn = page.locator(this.SHOP_BAR_BUTTON_LOC);
        this.browseSetsBtn = page.locator(this.BROWSE_SETS_BAR_BUTTON_LOC);
    }

    async pressHome() {
        await this.homeBtn.click();
    }

    async pressBrowseSets() {
        await this.browseSetsBtn.click();
    }

    async pressShop() {
        await this.shopBtn.click();
    }

    async pressSignIn() {
        this.signInBtn = this.page.locator(this.SIGN_IN_BUTTON_LOC);
        await this.signInBtn.click();
    }

    async pressRegister() {
        this.registerBtn = this.page.locator(this.REGISTER_BUTTON_LOC);
        await this.registerBtn.click();
    }

    async getUserName() {
        return await this.page.locator(this.USERNAME_LOC).textContent();
    }
}