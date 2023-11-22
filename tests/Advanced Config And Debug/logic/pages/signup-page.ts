import { Locator, Page } from "@playwright/test";
import { BasePage } from "./basePage";

export class SignUpPage extends BasePage {

    private readonly EMAIL_INPUT_LOC = "#element-0";
    private readonly ERROR_EMAIL_INPUT_LOC = "//div[@class='a83bd4e0 _266d6623 _8f5b5f2b _2a3b75a1']";
    private readonly PASSWORD_INPUT_LOC = "#element-3";
    private readonly ERROR_PASSWORD_INPUT_LOC = "#element-5";
    private readonly SIGNUP_BUTTON_LOC = "//button[@data-gtm-id='start-email-signup']";

    private emailInput: Locator;
    private passwordInput: Locator;
    private signupBtn: Locator;

    constructor(page: Page) {
        super(page);
        this.initPage();

        this.emailInput = page.locator(this.EMAIL_INPUT_LOC);
        this.passwordInput = page.locator(this.PASSWORD_INPUT_LOC);
        this.signupBtn = page.locator(this.SIGNUP_BUTTON_LOC);
    }

    async initPage() {
        await this.waitForLoad();
    }

    async getEmailErrorMessage() {
        return await this.page.locator(this.ERROR_EMAIL_INPUT_LOC).textContent();
    }

    async getPasswordErrorMessage() {
        return await this.page.locator(this.ERROR_PASSWORD_INPUT_LOC).textContent();
    }

    async fillEmailInput(email: string) {
        await this.emailInput.fill(email);
    }

    async fillPasswordInput(password: string) {
        await this.passwordInput.fill(password);
    }

    async clickSignUp() {
        await this.signupBtn.click()
    }

    async fullSignUpProccess(email: string, password: string) {
        await this.fillEmailInput(email);
        await this.fillPasswordInput(password);
        await this.clickSignUp();
    }
}