import { Locator, Page } from '@playwright/test';
import { BasePage } from './basePage';

export class LoginPage extends BasePage {

    private readonly USERNAME_PLACEHOLDER_LOC: string = "Username";
    private readonly PASSWORD_PLACEHOLDER_LOC: string = "Password";
    private readonly LOGIN_BUTTON_LOC: string = "//button[@type='submit']";

    private userName: Locator;
    private password: Locator;
    private loginButton: Locator;

    constructor(page: Page) {
        super(page);
        this.userName = page.getByPlaceholder(this.USERNAME_PLACEHOLDER_LOC);
        this.password = page.getByPlaceholder(this.PASSWORD_PLACEHOLDER_LOC);
        this.loginButton = page.locator(this.LOGIN_BUTTON_LOC);
        this.initPage();
    }

    async initPage() {
        await this.waitForLoad();
    }

    private async fillUserNameInput(username: string) {
        await this.userName.fill(username);
    }

    private async fillPasswordInput(pass: string) {
        await this.password.fill(pass);
    }

    private async clickSubmitButton() {
        await Promise.all([
            this.page.waitForNavigation({ waitUntil: "networkidle" }),
            this.loginButton.click()
        ]);
    }

    async fullProccessLogIn(userName: string, password: string) {
        await this.fillUserNameInput(userName);
        await this.fillPasswordInput(password);
        await this.clickSubmitButton();
    }
}
