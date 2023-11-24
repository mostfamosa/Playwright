import { Locator, Page } from "@playwright/test";
import { BasePage } from "./base-page";

export class RegisterPage extends BasePage {

    private readonly USERNAME_INPUT_LOC = "//input[@name='username']";
    private readonly PASSWORD_INPUT_LOC = "//input[@name='pass1']";
    private readonly PASSWORD_CONFIRM_INPUT_LOC = "//input[@name='pass2']";
    private readonly EMAIL_INPUT_LOC = "//input[@name='email']";
    private readonly REGISTER_BUTTON_LOC = "//button[text()='Register']";
    private readonly MESSAGE_LOC = "//div[@class='siteMessage']";

    private userNameInput: Locator;
    private passwordInput: Locator;
    private confirmPasswordInput: Locator;
    private emailInput: Locator;
    private registerBtn: Locator;

    constructor(page: Page) {
        super(page);
        this.userNameInput = page.locator(this.USERNAME_INPUT_LOC);
        this.passwordInput = page.locator(this.PASSWORD_INPUT_LOC);
        this.confirmPasswordInput = page.locator(this.PASSWORD_CONFIRM_INPUT_LOC);
        this.emailInput = page.locator(this.EMAIL_INPUT_LOC);
        this.registerBtn = page.locator(this.REGISTER_BUTTON_LOC);
    }

    async getSiteMessage() {
        return await this.page.locator(this.MESSAGE_LOC).textContent();
    }

    async registerFullProccess(username: string, password: string, confirmPassword: string, email: string) {
        await this.fillUserNameInput(username);
        await this.fillPasswordInput(password);
        await this.fillConfirmPasswordInput(confirmPassword);
        await this.fillEmailInput(email);
        await this.pressSignIn();
    }

    private async fillUserNameInput(username: string) {
        await this.userNameInput.fill(username);
    }

    private async fillPasswordInput(password: string) {
        await this.passwordInput.fill(password);
    }

    private async fillConfirmPasswordInput(confirmPassword: string) {
        await this.confirmPasswordInput.fill(confirmPassword);
    }

    private async fillEmailInput(email: string) {
        await this.emailInput.fill(email);
    }

    private async pressSignIn() {
        await this.registerBtn.click();
    }
}