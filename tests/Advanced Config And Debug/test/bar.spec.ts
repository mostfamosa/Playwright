import { test, expect, Browser, chromium } from '@playwright/test';
import { HomePage } from '../logic/pages/homePage';
import { ResourcesOptions } from '../utils/resources-options';
import { BarOptions } from '../utils/bar-options';

const BASE_URL = 'https://todoist.com';
const pricingLink = "https://todoist.com/pricing";
const forTeamsLink = "https://todoist.com/teams";
const featuresLink = "https://todoist.com/features";


test.describe('Home Page - Bar Validations Links Suite', () => {

    let browser: Browser;

    test.beforeAll(async () => {
        browser = await chromium.launch();
    });
    test.beforeEach(async ({ page }) => {
        await page.goto(BASE_URL);
        await page.setViewportSize({ width: 1920, height: 1080 });
    });
    test.afterEach(async ({ page }) => {
        await page.close();
    });
    test.afterAll(async () => {
        await browser.close();
    });

    // Parameterize test for Resources Menu Options
    const ResourcesMenu = [
        { resOption: ResourcesOptions.INTEGRATIONS, link: 'https://todoist.com/integrations' },
        { resOption: ResourcesOptions.GETTING_STARTED_GUID, link: 'https://todoist.com/help/articles/get-started-with-todoist-OgNNJR' },
        { resOption: ResourcesOptions.HELP_CENTER, link: 'https://todoist.com/help' },
        { resOption: ResourcesOptions.PRODUCTIVITY_METHODS, link: 'https://todoist.com/productivity-methods' },
        { resOption: ResourcesOptions.INSPIRATION_HUB, link: 'https://todoist.com/inspiration' },

    ];
    for (const resourcseOption of ResourcesMenu) {
        test(`Go to Home Page -> Select resources option: ${resourcseOption.resOption} -> Validate that the navigation link is:${resourcseOption.link}`, async ({ page }) => {
            const homePage = new HomePage(page);
            await homePage.goToResourcesByOption(resourcseOption.resOption);
            expect(await homePage.getCurrentUrl()).toBe(resourcseOption.link);
        });
    }


    // Parameterize test for Bar Options
    const optionsOfBar = [
        { barOption: BarOptions.PRICING, actualLink: pricingLink },
        { barOption: BarOptions.FOR_TEAMS, actualLink: forTeamsLink },
        { barOption: BarOptions.FEATURES, actualLink: featuresLink }
    ]
    for (const option of optionsOfBar) {
        test(`Go to Home Page -> Go to ${option.barOption} -> Validate that the navigation link is ${option.actualLink}`, async ({ page }) => {
            const homePage = new HomePage(page);
            switch (option.barOption) {
                case BarOptions.PRICING:
                    await homePage.goToPricing();
                    break;
                case BarOptions.FOR_TEAMS:
                    await homePage.goToForTeams();
                    break;
                case BarOptions.FEATURES:
                    await homePage.goToFeatures();
                    break;
                default:
                    console.log(`Bar Option ${option.barOption} is Invalid!`);
                    break;
            }
            expect(await homePage.getCurrentUrl()).toBe(option.actualLink);
        });
    }



});