import { Locator, Page } from "@playwright/test";
import { BasePage } from "./base-page";

export class SignInPage extends BasePage {

    private readonly USERNAME_INPUT_LOC = "//input[@name='username']";
    private readonly PASSWORD_INPUT_LOC = "//input[@name='password']";
    private readonly SIGN_IN_BUTTON_LOC = "//button[text()='Sign In']";
    private readonly MESSAGE_LOC = "//div[@class='siteMessage']";

    private userNameInput: Locator;
    private passwordInput: Locator;
    private signInBtn: Locator;

    constructor(page: Page) {
        super(page);
        this.userNameInput = page.locator(this.USERNAME_INPUT_LOC);
        this.passwordInput = page.locator(this.PASSWORD_INPUT_LOC);
        this.signInBtn = page.locator(this.SIGN_IN_BUTTON_LOC);
    }

    async getSiteMessage() {
        return await this.page.locator(this.MESSAGE_LOC).textContent();
    }

    async signInFullProccess(username: string, password: string) {
        await this.fillUserNameInput(username);
        await this.fillPasswordInput(password);
        await this.pressSignIn();
    }

    private async fillUserNameInput(username: string) {
        await this.userNameInput.fill(username);
    }

    private async fillPasswordInput(password: string) {
        await this.passwordInput.fill(password);
    }

    private async pressSignIn() {
        await this.signInBtn.click();
    }
}