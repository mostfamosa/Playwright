import { Locator, Page } from "@playwright/test";
import { BasePage } from "./basePage";


export class NewEmployee extends BasePage {


    private readonly TOAST_MESSAGE_LOC: string = "p.oxd-text.oxd-text--p.oxd-text--toast-title.oxd-toast-content-text";
    private readonly FIRST_NAME_PLACEHOLDER: string = "First Name";
    private readonly LAST_NAME_PLACEHOLDER: string = "Last Name";
    private readonly MIDDLE_NAME_PLACEHOLDER: string = "Middle Name";
    private readonly SAVE_BTN_LOC: string = "//button[@type='submit']";
    

    private firstNameInput: Locator;
    private lastNameInput: Locator;
    private middleNameInput: Locator;
    private saveBtn: Locator;
    private toastMessage: Locator;

    constructor(page: Page) {
        super(page);

        this.firstNameInput = page.getByPlaceholder(this.FIRST_NAME_PLACEHOLDER);
        this.lastNameInput = page.getByPlaceholder(this.LAST_NAME_PLACEHOLDER);
        this.middleNameInput = page.getByPlaceholder(this.MIDDLE_NAME_PLACEHOLDER);
        this.saveBtn = page.locator(this.SAVE_BTN_LOC);

        async () => { await this.initPage(); }
    }


    initPage = async () => {
        await this.page.waitForLoadState()
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
        Promise.all([
            await this.saveBtn.click(),
            this.toastMessage = this.page.locator(this.TOAST_MESSAGE_LOC)
        ])
    }

    async fullProccessAddNewEmployee(firstName: string, middleName: string, lastName: string) {
        await this.fillFirstName(firstName);
        await this.fillLastName(lastName);
        await this.fillMiddleName(middleName);
        await this.clickSave();
    }

    async getToastMessage() {
        return await this.toastMessage.textContent();
    }


}