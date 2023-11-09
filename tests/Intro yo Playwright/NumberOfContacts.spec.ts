import { test, expect, Browser, Page } from '@playwright/test';
import { chromium } from 'playwright';

test.describe('Number Of Contacts Validation Suite', () => {

    let browser: Browser;
    let page: Page;
    let expectedErrorMessage = "Invalid value.";
    let termsAndConditionsErrorMessage = "Please confirm the terms of use.";
    let receivingEmailsAndPromotionsErrorMessage = "This field is required.";

    let CONTACTS_SELECT_LOCATOR = "#your-contacts-count";
    let SUBMIT_BUTTON_LOCATOR = "//input[@type='submit']";
    let ERROR_LABEL_LOCATOR = "//label[@id = 'your-contacts-count-error']";
    let ERROR_TERMS_OF_USER = "//label[@id ='checkbox-tos-error']";
    let ERROR_PROMOTIONS = "//label[@id = 'checkbox-arem-error']";


    test.beforeAll(async () => {
        browser = await chromium.launch();
    });
    test.beforeEach(async () => {
        page = await browser.newPage();
        await page.goto('https://www.activetrail.com/free-trial/');
        await page.setViewportSize({ width: 1920, height: 1080 });

    });
    test.afterEach(async () => {
        await page.close();
    });
    test.afterAll(async () => {
        await browser.close();
    });


    test(`default select should show error message: '${expectedErrorMessage}'`, async () => {
        const select = page.locator(CONTACTS_SELECT_LOCATOR);
        await select.selectOption('')
        await page.locator(SUBMIT_BUTTON_LOCATOR).click();

        const errorMsg = await page.locator(ERROR_LABEL_LOCATOR).textContent();
        expect(errorMsg).toBe(expectedErrorMessage)
    });

    test(`not checking to accept terms and conditions should show error message: '${expectedErrorMessage}'`, async () => {
        await page.locator(SUBMIT_BUTTON_LOCATOR).click();

        const errorMsg = await page.locator(ERROR_TERMS_OF_USER).textContent();
        expect(errorMsg).toBe(termsAndConditionsErrorMessage)
    });

    test(`not checking to accept receiving emails and promotions should show error message: '${expectedErrorMessage}'`, async () => {
        await page.locator(SUBMIT_BUTTON_LOCATOR).click();

        const errorMsg = await page.locator(ERROR_PROMOTIONS).textContent();
        expect(errorMsg).toBe(receivingEmailsAndPromotionsErrorMessage)
    });



});