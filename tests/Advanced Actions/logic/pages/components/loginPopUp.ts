import { Locator, Page } from "@playwright/test";
import { BasePage } from "../basePage";

export class LoginPopUp extends BasePage {

    private readonly EMAIL_INPUT_LOC: string = "#email";
    private readonly PASSWORD_INPUT_LOC: string = "#password";
    private readonly LOGIN_BTN_LOC: string = "//button[@aria-label='כניסה']";

    private emailInput: Locator;
    private passwordInput: Locator;
    private loginBtn: Locator;

    constructor(page: Page) {
        super(page);
        this.initComponent();

        this.emailInput = this.page.locator(this.EMAIL_INPUT_LOC);
        this.passwordInput = this.page.locator(this.PASSWORD_INPUT_LOC);
        this.loginBtn = this.page.locator(this.LOGIN_BTN_LOC);
    }

    async initComponent() {
        this.waitForLoad();
    }

    async fullProccessLogin(email: string, password: string) {
        await this.emailInput.fill(email);
        await this.passwordInput.fill(password);
        await this.loginBtn.click();
    }
}