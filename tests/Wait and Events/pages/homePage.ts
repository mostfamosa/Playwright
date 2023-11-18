import { Locator, Page } from '@playwright/test';
import { BasePage } from './basePage';
import { UpperBar } from '../components/upperBar';

export class HomePage extends BasePage {

    private upperBar: UpperBar;

    constructor(page: Page) {
        super(page);
        this.initPage();
    }

    async initPage() {
        await this.waitForLoad();
    }

    async getUpperBar() {
        if (this.upperBar == null) {
            this.upperBar = new UpperBar(this.page);
            return this.upperBar;
        }
        else
            return this.upperBar;
    }
}
