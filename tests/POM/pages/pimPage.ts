import { Locator, Page } from "@playwright/test";
import { BasePage } from "./basePage";


export class PimPage extends BasePage {

    private readonly TOAST_MESSAGE_LOC: string = "SuccessSuccessfully Updated×";
    private readonly TABLE_CONTAINER_LOC: string = "div.orangehrm-container";
    private readonly NEW_EMPLOYEE_BTN_LOC: string = "//i[@class='oxd-icon bi-plus oxd-button-icon']";
    private readonly SEARCH_NAME_INPUT_PLACEHOLDER: string = "Type for hints...";
    private readonly SEARCH_ID_INPUT_LOC: string = "(//input[@class='oxd-input oxd-input--active'])[2]";
    private readonly SEARCH_BUTTON_LOC: string = "//button[@type='submit']";
    private readonly FIRST_EMPLOYEE_NAME_LOC: string = "(//div[@class='oxd-table-row oxd-table-row--with-border oxd-table-row--clickable'])[1]//div[3]";
    private readonly FIRST_EMPLOYEE_ID_LOC: string = "(//div[@class='oxd-table-row oxd-table-row--with-border oxd-table-row--clickable'])[1]//div[2]";
    private readonly FIRST_EMPLOYEE_CHECKBOX_LOC: string = "(//div[@class='oxd-table-row oxd-table-row--with-border oxd-table-row--clickable'])[1]//div";
    private readonly DELETED_SELECTED_EMPLOYEE_LOC: string = "//i[@class='oxd-icon bi-trash-fill oxd-button-icon']";
    private readonly CONFIRM_DELETE_POPUP_LOC: string = "//button[@class='oxd-button oxd-button--medium oxd-button--label-danger orangehrm-button-margin']";
    private readonly EMPLOYEES_RECORDS_ROWS_LOC: string = "(//span[@class='oxd-text oxd-text--span'])[1]";


    private addNewEmployeeBtn: Locator;
    private searchNameInput: Locator;
    private searchIdInput: Locator;
    private searchBtn: Locator;
    private firstEmployeeNameInTable: Locator;
    private firstEmployeeIdInTable: Locator;
    private firstEmployeeCheckInTable: Locator;
    private deleteSelectedEmployeeBtn: Locator;
    private confirmDeleteBtn: Locator;
    private toastMessage: Locator;


    constructor(page: Page) {
        super(page);
        this.addNewEmployeeBtn = page.locator(this.NEW_EMPLOYEE_BTN_LOC);

        this.searchIdInput = page.locator(this.SEARCH_ID_INPUT_LOC)
        this.searchBtn = page.locator(this.SEARCH_BUTTON_LOC);
        async () => { await this.initPage(); }
    }


    initPage = async () => {
        await this.page.waitForLoadState()
        await this.page.waitForSelector(this.TABLE_CONTAINER_LOC)
    }

    async clickOnAddNewEmployee() {
        await Promise.all([
            this.page.waitForNavigation({ waitUntil: "networkidle" }),
            await this.addNewEmployeeBtn.click()
        ])
    }

    async searchByName(employeeName: string) {
        this.searchNameInput = this.page.getByPlaceholder(this.SEARCH_NAME_INPUT_PLACEHOLDER).first();
        await this.searchNameInput.fill(employeeName);
        await this.searchBtn.click();
    }

    async searchById(employeeId: string) {
        await this.searchIdInput.fill(employeeId);
        await this.searchBtn.click();
    }

    async getFirstEmployeeNameInTheTable() {
        this.firstEmployeeNameInTable = this.page.locator(this.FIRST_EMPLOYEE_NAME_LOC)
        return await this.firstEmployeeNameInTable.textContent();
    }

    async getFirstEmployeeIdInTheTable() {
        this.firstEmployeeIdInTable = this.page.locator(this.FIRST_EMPLOYEE_ID_LOC)
        return await this.firstEmployeeIdInTable.textContent();
    }

    async selectFirstEmployee() {
        this.firstEmployeeCheckInTable = this.page.locator(this.FIRST_EMPLOYEE_CHECKBOX_LOC).first();
        await this.firstEmployeeCheckInTable.click();
    }

    async deleteSelectedEmployee() {
        this.deleteSelectedEmployeeBtn = this.page.locator(this.DELETED_SELECTED_EMPLOYEE_LOC);
        await this.deleteSelectedEmployeeBtn.click();
        this.confirmDeleteBtn = this.page.locator(this.CONFIRM_DELETE_POPUP_LOC);
        await this.confirmDeleteBtn.click();
    }

    async getToastMessage() {
        this.toastMessage = this.page.getByText(this.TOAST_MESSAGE_LOC);
        return await this.toastMessage.textContent();
    }

    async getRecordsFound() {
        const recordsFoundLocator = await this.page.waitForSelector(this.EMPLOYEES_RECORDS_ROWS_LOC);
        const recordsFoundText = await recordsFoundLocator.innerText();
        return parseInt(recordsFoundText.match(/\((\d+)\) Records Found/)?.[1] || '0', 10);
    }
}