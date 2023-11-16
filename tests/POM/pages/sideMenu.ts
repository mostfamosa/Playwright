import { Locator, Page } from "@playwright/test";
import { BasePage } from "./basePage";


export class SideMenu extends BasePage {

    private readonly MY_INFO_SIDE_MENU_BTN: string = "//span[text()='My Info']";
    private readonly PIM_SIDE_MENU_BTN: string = "//span[text()='PIM']";

    constructor(page: Page) {
        super(page);
        async () => { await this.initPage(); }
    }


    initPage = async () => {
        await this.page.waitForLoadState()
    }

    async goToPim() {
        await Promise.all([
            this.page.waitForNavigation({ waitUntil: "networkidle" }),
            await this.page.locator(this.PIM_SIDE_MENU_BTN).click()
        ])
    }

    async goToMyInfo() {
        await Promise.all([
            this.page.waitForNavigation({ waitUntil: "networkidle" }),
            await this.page.locator(this.MY_INFO_SIDE_MENU_BTN).click()
        ])
    }


}