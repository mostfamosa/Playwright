import { Locator, Page } from "@playwright/test";
import { BasePage } from "./basePage";

export class MyInfoPage extends BasePage {

    private readonly FIRST_NAME_INPUT_LOC: string = "input.oxd-input.oxd-input--active.orangehrm-firstname";
    private readonly MIDDLE_NAME_INPUT_LOC: string = "//input[@class='oxd-input oxd-input--active orangehrm-middlename']";
    private readonly LAST_NAME_INPUT_LOC: string = "//input[@class='oxd-input oxd-input--active orangehrm-lastname']";
    private readonly SAVE_BUTTON_LOC: string = "(//button[@type='submit'])[1]";
    private readonly TOAST_MESSAGE_LOC: string = "p.oxd-text.oxd-text--p.oxd-text--toast-title.oxd-toast-content-text";

    private firstNameInput: Locator;
    private lastNameInput: Locator;
    private middleNameInput: Locator;
    private saveBtn: Locator;
    private toastMessage: Locator;


    constructor(page: Page) {
        super(page);
        this.firstNameInput = page.locator(this.FIRST_NAME_INPUT_LOC);
        this.middleNameInput = page.locator(this.LAST_NAME_INPUT_LOC);
        this.lastNameInput = page.locator(this.MIDDLE_NAME_INPUT_LOC);
        async () => { await this.initPage(); }
    }


    initPage = async () => {
        await this.page.waitForLoadState("networkidle");
    }

    private async fillFirstName(firstName: string) {
        await this.firstNameInput.fill(firstName);
    }
    private async fillLastName(lastName: string) {
        await this.lastNameInput.fill(lastName);
    }
    private async fillMiddleName(middleName: string) {
        await this.middleNameInput.fill(middleName);
    }
    private async clickSave() {
        await Promise.all([
            this.saveBtn = this.page.locator(this.SAVE_BUTTON_LOC),
            this.saveBtn.scrollIntoViewIfNeeded(),
            this.saveBtn.click(),
            this.toastMessage = this.page.locator(this.TOAST_MESSAGE_LOC),
        ]);
    }

    async fullProccessEditMyInfo(firstName: string, middleName: string, lastName: string) {
        await this.fillFirstName(firstName);
        await this.fillLastName(lastName);
        await this.fillMiddleName(middleName);
        await this.clickSave();
    }

    async getToastMessage() {
        return await this.toastMessage.textContent();
    }


}