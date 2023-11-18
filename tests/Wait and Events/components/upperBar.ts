import { Page } from '@playwright/test';
import { BasePage } from '../pages/basePage';

export class UpperBar extends BasePage {

    private readonly COMMERCE_AND_DATA_BARELEMENT_LOC: string = "a[data-text='מסחר ונתונים']";
    private readonly STATISTICS_OPEN_TAB_LOC: string = "h5:has-text('סטטיסטיקות מסחר')";

    constructor(page: Page) {
        super(page);
    }

    async clickOnStatistics() {
        const commerceUpperBar = this.page.locator(this.COMMERCE_AND_DATA_BARELEMENT_LOC);
        await commerceUpperBar.hover();

        const statistics = this.page.locator(this.STATISTICS_OPEN_TAB_LOC);
        await statistics.click();
    }
}
