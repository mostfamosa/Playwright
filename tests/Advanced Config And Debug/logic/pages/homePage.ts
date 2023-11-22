import { Locator, Page } from "@playwright/test";
import { BasePage } from "./basePage";
import { ResourcesOptions } from "../../utils/resources-options";



export class HomePage extends BasePage {

    private readonly START_FOR_FREE_BAR_LOC: string = "(//a[contains(string(),'Start for free')])[1]";
    private readonly PRICING_BAR_LOC: string = "(//a[contains(string(),'Pricing')])[1]";
    private readonly FOR_TEAMS_BAR_LOC: string = "(//a[contains(string(),'For Teams')])[1]";
    private readonly FEATURES_BAR_LOC: string = "(//a[contains(string(),'Features')])[1]";
    private readonly RESOURCES_BAR_LOC: string = "(//button[contains(string(),'Resources')])[1]";

    // For Resources Menu
    private readonly INTEGRATIONS_RESOURCES_MENU: string = "//a[@aria-label='Integrations']";
    private readonly GETTING_STARTED_GUID_RESOURCES_MENU: string = "//a[@aria-label='Getting Started Guide']";
    private readonly HELP_CENTER_RESOURCES_MENU: string = "//a[@aria-label='Help Center']";
    private readonly PRODUCTIVITY_METHODS_RESOURCES_MENU: string = "//a[@aria-label='Productivity Methods + Quiz']";
    private readonly INSPIRATION_HUB_RESOURCES_MENU: string = "//a[@aria-label='Inspiration Hub']";

    private startForFreeBarBtn: Locator;
    private pricingBarBtn: Locator;
    private forTeamBarBtn: Locator;
    private featuresBarBtn: Locator;
    private resourcesBarBtn: Locator;

    constructor(page: Page) {
        super(page);
        this.initPage();

        this.startForFreeBarBtn = page.locator(this.START_FOR_FREE_BAR_LOC);
        this.pricingBarBtn = page.locator(this.PRICING_BAR_LOC);
        this.forTeamBarBtn = page.locator(this.FOR_TEAMS_BAR_LOC);
        this.featuresBarBtn = page.locator(this.FEATURES_BAR_LOC);
        this.resourcesBarBtn = page.locator(this.RESOURCES_BAR_LOC);
    }

    async initPage() {
        await this.waitForLoad();
    }

    async goToSignUp() {
        await this.startForFreeBarBtn.click();
    }

    async goToPricing() {
        await this.pricingBarBtn.click();
    }

    async goToForTeams() {
        await this.forTeamBarBtn.click();
    }

    async goToFeatures() {
        await this.featuresBarBtn.click();
    }

    private async clickOnResources() {
        await this.resourcesBarBtn.click();
    }

    async goToResourcesByOption(option: ResourcesOptions) {
        switch (option) {
            case ResourcesOptions.INTEGRATIONS:
                await this.clickOnResources();
                await this.page.locator(this.INTEGRATIONS_RESOURCES_MENU).click();
                break;
            case ResourcesOptions.GETTING_STARTED_GUID:
                await this.clickOnResources();
                await this.page.locator(this.GETTING_STARTED_GUID_RESOURCES_MENU).click();
                break;
            case ResourcesOptions.HELP_CENTER:
                await this.clickOnResources();
                await this.page.locator(this.HELP_CENTER_RESOURCES_MENU).click();
                break;
            case ResourcesOptions.PRODUCTIVITY_METHODS:
                await this.clickOnResources();
                await this.page.locator(this.PRODUCTIVITY_METHODS_RESOURCES_MENU).click();
                break;
            case ResourcesOptions.INSPIRATION_HUB:
                await this.clickOnResources();
                await this.page.locator(this.INSPIRATION_HUB_RESOURCES_MENU).click();
                break;
            default:
                console.error('Unknown resources option!');
                break;
        }
    }

}