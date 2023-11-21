import { Locator, Page } from "@playwright/test";
import { BasePage } from "./basePage";
import { LoginPopUp } from "./components/loginPopUp";
import { extractNumberFromString } from "../utils/extractNumber";
////span[@class='badge d-flex align-items-center justify-content-center']


export class HomePage extends BasePage {

    private loginPopUp: LoginPopUp;

    private readonly LOGIN_BTN_LOC: string = "#login-user";
    private readonly CART_PRICE_LOC: string = "//span[@class='position-relative currency-wrap overflow-ellipsis blue l-text']";
    private readonly LOADING_SVG_LOC: string = "(//*[local-name()='svg' and @id='L5'])[1]";
    private readonly CLEAR_CART_BTN: string = "#remove-cart";
    private readonly CONFIRM_CLEAR_CART_BTN: string = "#delete-cart-btn";
    private readonly EMPTY_CART_SIGN: string = "//div[contains(string(),'השקית שלך ריקה...')]";
    private readonly FIRST_ITEM_IN_CART_LOC: string = "//div[@class='p-1 bg-white rl-boxshadow border-radius-10 my-2 position-relative d-flex align-items-center justify-content-between el']";
    private readonly PLUS_SIGN_FIRST_ITEM_IN_CART_LOC: string = "//button[@class='focus-item btn-acc plus no-select']";

    private loginBtn: Locator;
    private cartPrice: Locator;
    private clearCart: Locator;
    private confirmClearCart: Locator;

    constructor(page: Page) {
        super(page);
        this.initPage();

        this.loginBtn = this.page.locator(this.LOGIN_BTN_LOC);
    }

    async initPage() {
        await this.waitForLoad();
    }

    async pressLogin() {
        await this.loginBtn.click();
    }

    async getLogInPopUp() {
        if (this.loginPopUp) {
            return this.loginPopUp
        }
        else {
            this.loginPopUp = new LoginPopUp(this.page);
            return this.loginPopUp;
        }
    }

    async getCartPrice() {
        const loading = this.page.locator(this.LOADING_SVG_LOC);
        await loading.waitFor({ state: 'hidden' });

        this.cartPrice = this.page.locator(this.CART_PRICE_LOC);
        const originalString = await this.cartPrice.textContent();

        return extractNumberFromString(originalString);
    }

    async clearTheCart() {
        this.clearCart = this.page.locator(this.CLEAR_CART_BTN);
        await this.clearCart.click();
        this.confirmClearCart = this.page.locator(this.CONFIRM_CLEAR_CART_BTN);
        await this.confirmClearCart.click();
        const emptyCart = this.page.locator(this.EMPTY_CART_SIGN).last();
        await emptyCart.waitFor({ state: 'visible' });
    }

    async duplicateFirstItemInCart() {
        await this.page.locator(this.FIRST_ITEM_IN_CART_LOC).hover();
        await this.page.locator(this.PLUS_SIGN_FIRST_ITEM_IN_CART_LOC).click();
    }
}