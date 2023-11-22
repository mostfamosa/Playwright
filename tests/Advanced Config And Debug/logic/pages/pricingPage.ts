import { Locator, Page } from "@playwright/test";
import { BasePage } from "./basePage";
import { UserType } from "../../utils/user-type-pricing";

export class PricingPage extends BasePage {

    private readonly BEGINNER_PRICE_LOC = "(//span[@class='Z2j5FoeQ_umI7vX0SmxF VB6LgUAmqv1DrUQhn1Tq pricing-info_price__mKOgR'])[1]";
    private readonly PRO_PRICE_LOC = "(//span[@class='Z2j5FoeQ_umI7vX0SmxF VB6LgUAmqv1DrUQhn1Tq pricing-info_price__mKOgR'])[2]";
    private readonly BUSINESS_PRICE_LOC = "(//span[@class='Z2j5FoeQ_umI7vX0SmxF VB6LgUAmqv1DrUQhn1Tq pricing-info_price__mKOgR'])[3]";
    private readonly YEARLY_BILLING_LOC = "#groupButton-yearly";
    private readonly MONTHLY_BILLING_LOC = "#groupButton-monthly";


    private beginnerPrice: Locator;
    private proPrice: Locator;
    private businessPrice: Locator;

    constructor(page: Page) {
        super(page);

        this.beginnerPrice = page.locator(this.BEGINNER_PRICE_LOC);
        this.proPrice = page.locator(this.PRO_PRICE_LOC);
        this.businessPrice = page.locator(this.BUSINESS_PRICE_LOC);
    }

    async selectYearlyBilling() {
        await this.page.locator(this.YEARLY_BILLING_LOC).first().click();
    }

    async selectMonthlyBilling() {
        await this.page.locator(this.MONTHLY_BILLING_LOC).first().click();
    }

    async getPriceByType(type: UserType) {
        switch (type) {
            case UserType.Beginner:
                return await this.getBeginnerPrice();

            case UserType.Pro:
                return await this.getProPrice();

            case UserType.Business:
                const res = await this.getBusinessPrice();
                return res

            default:
                console.error(`Invalid type: ${type}`);
                return null;
        }
    }

    private async getBeginnerPrice() {
        return this.extractNumber(await this.beginnerPrice.textContent());
    }

    private async getProPrice() {
        return this.extractNumber(await this.proPrice.textContent());
    }

    private async getBusinessPrice() {
        return this.extractNumber(await this.businessPrice.textContent());
    }

    private extractNumber(input: string | null): number {
        if (input) {
            const numericValue = Number(input.replace(/\$/g, ''));

            if (!isNaN(numericValue)) {
                return numericValue;
            } else {
                console.error('Invalid input. Could not extract a numeric value.');
                return -1;
            }
        }
        console.error('Invalid input. Null value!');
        return -1;
    }
}