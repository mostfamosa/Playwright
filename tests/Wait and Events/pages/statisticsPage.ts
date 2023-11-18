import { Locator, Page } from "@playwright/test";
import { BasePage } from "./basePage";

export class StatisticsPage extends BasePage {

    private readonly DATE_INPUT_LOC: string = "#mat-input-0";
    private readonly CATEGORY_SELECT_LOC: string = "#selectByCutSingle";
    private readonly FILTER_BTN_LOC: string = "//button[@class='sort_table sort_action_buttons btn-block']";
    private readonly TABLE_CONTENT_LOC: string = "//div[@class='col-md-8 col-lg-9']";
    private readonly DOWNLOAD_BTN_LOC: string = "//button[@class='font_icon icon-download']";
    private readonly CSV_OPTION_DOWNLOAD_LOC: string = "//ul[@class='dropdown-menu']//li[1]";
    private readonly NUMBER_OF_RECORDS_LOC: string = "(//span[@class='ng-star-inserted'])";
    private readonly DATE_OF_THE_TABLE_LOC: string = "//span[@class='ng-star-inserted']//b";
    private readonly TABLE_HEADER_LOC: string = "//div[@class='general_popover_inner']//h2";

    private readonly ROW_IN_RECORDS_BY_INDEX_LOC: string = "//tbody//tr";
    private readonly SECURITY_GROUP_BY_INDEX_LOC: string = "//td[1]";
    private readonly CATEGORY_BY_INDEX_LOC: string = "//td[2]";
    private readonly LAST_GATE_BY_INDEX_LOC: string = "//td[3]";
    private readonly DIFFERENCE_BY_INDEX_LOC: string = "//td[4]";
    private readonly CYCLE_BY_INDEX_LOC: string = "//td[5]";
    private readonly INCREASES_BY_INDEX_LOC: string = "//td[6]";
    private readonly DECREASES_BY_INDEX_LOC: string = "//td[7]";
    private readonly UNCHANGED_BY_INDEX_LOC: string = "//td[8]";
    private readonly MARKET_VALUE_BY_INDEX_LOC: string = "//td[9]";


    private dateInput: Locator;
    private categorySelect: Locator;
    private filterBtn: Locator;
    private downloadBtn: Locator;
    private csvOptionDownload: Locator;
    private dateOfTable: Locator;
    private headerOfTable: Locator;

    private recordsNumber: Locator;
    private securityGroup: Locator;
    private category: Locator;
    private lastGate: Locator;
    private difference: Locator;
    private cycle: Locator;
    private increased: Locator;
    private decreased: Locator;
    private unchanged: Locator;
    private marketValue: Locator;

    constructor(page: Page) {
        super(page);
        this.initPage();

        this.dateInput = page.locator(this.DATE_INPUT_LOC);
        this.categorySelect = page.locator(this.CATEGORY_SELECT_LOC);
        this.filterBtn = page.locator(this.FILTER_BTN_LOC);
        this.downloadBtn = page.locator(this.DOWNLOAD_BTN_LOC);
    }
    async initPage() {
        await this.waitForLoad();
    }
    async getDateOfTable() {
        this.dateOfTable = this.page.locator(this.DATE_OF_THE_TABLE_LOC);
        return await this.dateOfTable.textContent();
    }

    async getHeaderOfTable() {
        this.headerOfTable = this.page.locator(this.TABLE_HEADER_LOC);
        return await this.headerOfTable.textContent();
    }

    private async fillDateInput(date: string) {
        await this.dateInput.fill(date);
    }

    private async chooseCategory(category: string) {
        await this.categorySelect.selectOption(category);
    }

    private async pressOnFilter() {
        await this.filterBtn.click();
    }

    async fullFilterProccess(date: string, category: string) {
        await this.fillDateInput(date);
        await this.chooseCategory(category);
        await this.pressOnFilter();
        await this.page.waitForSelector(this.TABLE_CONTENT_LOC);
    }

    async downloadCurrentData() {
        await this.downloadBtn.click();
        this.csvOptionDownload = this.page.locator(this.CSV_OPTION_DOWNLOAD_LOC);
        await this.csvOptionDownload.click();
        const downloadPromise = this.page.waitForEvent('download');
        const download = await downloadPromise;
        return download;
    }

    async getNumberOfRecords() {
        this.recordsNumber = this.page.locator(this.NUMBER_OF_RECORDS_LOC).nth(2);
        const text = await this.recordsNumber.textContent();
        if (text) {
            const match = text.match(/\d+/);
            const numberValue = match ? parseInt(match[0], 10) : null;
            return numberValue;
        }
        else {
            console.error("No Records Found!");
        }
    }

    async getSecurityGroupByRowIndex(index: number) {
        this.securityGroup = this.page.locator(this.ROW_IN_RECORDS_BY_INDEX_LOC).nth(index).locator(this.SECURITY_GROUP_BY_INDEX_LOC);
        return await this.modifyStringToMatchFile(await this.securityGroup.textContent());
    }

    async getCategoryByRowIndex(index: number) {
        this.category = this.page.locator(this.ROW_IN_RECORDS_BY_INDEX_LOC).nth(index).locator(this.CATEGORY_BY_INDEX_LOC);
        return await this.modifyStringToMatchFile(await this.category.textContent());
    }

    async getLastGateByRowIndex(index: number) {
        this.lastGate = this.page.locator(this.ROW_IN_RECORDS_BY_INDEX_LOC).nth(index).locator(this.LAST_GATE_BY_INDEX_LOC);
        return await this.modifyNumberToMatchFile(await this.lastGate.textContent());
    }

    async getDifferenceByRowIndex(index: number) {
        this.difference = this.page.locator(this.ROW_IN_RECORDS_BY_INDEX_LOC).nth(index).locator(this.DIFFERENCE_BY_INDEX_LOC);
        const percentageString = await this.difference.textContent();
        return await this.modifyNumberToMatchFile(percentageString);
    }

    async getCycleValueByRowIndex(index: number) {
        this.cycle = this.page.locator(this.ROW_IN_RECORDS_BY_INDEX_LOC).nth(index).locator(this.CYCLE_BY_INDEX_LOC);
        return await this.cycle.textContent();
    }

    async getIncreasedValueByRowIndex(index: number) {
        this.increased = this.page.locator(this.ROW_IN_RECORDS_BY_INDEX_LOC).nth(index).locator(this.INCREASES_BY_INDEX_LOC);
        return await this.increased.textContent();
    }

    async getDecreasedValueByRowIndex(index: number) {
        this.decreased = this.page.locator(this.ROW_IN_RECORDS_BY_INDEX_LOC).nth(index).locator(this.DECREASES_BY_INDEX_LOC);
        return await this.decreased.textContent();
    }

    async getUnchangedByRowIndex(index: number) {
        this.unchanged = this.page.locator(this.ROW_IN_RECORDS_BY_INDEX_LOC).nth(index).locator(this.UNCHANGED_BY_INDEX_LOC);
        return await this.unchanged.textContent();
    }

    async getMarketValueByRowIndex(index: number) {
        this.marketValue = this.page.locator(this.ROW_IN_RECORDS_BY_INDEX_LOC).nth(index).locator(this.MARKET_VALUE_BY_INDEX_LOC);
        return await this.modifyMarketValueToMatchFile(await this.marketValue.textContent());
    }

    private async modifyStringToMatchFile(originalString: string | null) {
        if (originalString)
            return originalString.replace(/"/g, "''");
        console.error("Cant Parse This String: ", originalString);
    }

    private async modifyNumberToMatchFile(originalString: string | null) {
        if (originalString) {
            originalString = originalString.trim().replace(/,/g, '');
            return parseFloat(originalString.trim()).toFixed(2);
        }
        console.error("Cant Parse This Number: ", originalString);
    }

    private async modifyMarketValueToMatchFile(originalString: string | null) {
        if (originalString)
            return originalString.trim().replace(/,/g, '');
        console.error("Cant Parse This Market Value: ", originalString);
    }
}