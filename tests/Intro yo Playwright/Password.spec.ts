import { test, expect, Browser, Page } from '@playwright/test';
import { chromium } from 'playwright';

test.describe('Password Validation Suite', () => {

    let browser: Browser;
    let page: Page;
    let expectedErrorMessage = "Invalid value.";
    let PASSWORD_INPUT_LOCATOR = "input[type='password']";
    let SUBMIT_BUTTON_LOCATOR = "//input[@type='submit']";
    let ERROR_LABEL_LOCATOR = "//label[@id = 'password-error']";


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


    test(`empty input should show error message: '${expectedErrorMessage}'`, async () => {
        const input = page.locator(PASSWORD_INPUT_LOCATOR);
        await input.fill('');
        await page.locator(SUBMIT_BUTTON_LOCATOR).click();

        const errorMsg = await page.locator(ERROR_LABEL_LOCATOR).textContent();
        expect(errorMsg).toBe(expectedErrorMessage)
    });

    test(`missing lowercase characters password input should show error message: '${expectedErrorMessage}'`, async () => {
        const input = page.locator(PASSWORD_INPUT_LOCATOR);
        await input.fill('123DEF@@@');
        await page.locator(SUBMIT_BUTTON_LOCATOR).click();

        const errorMsg = await page.locator(ERROR_LABEL_LOCATOR).textContent();
        expect(errorMsg).toBe(expectedErrorMessage)
    });

    test(`missing uppercase characters password input should show error message: '${expectedErrorMessage}'`, async () => {
        const input = page.locator(PASSWORD_INPUT_LOCATOR);
        await input.fill('abc123@@@');
        await page.locator(SUBMIT_BUTTON_LOCATOR).click();

        const errorMsg = await page.locator(ERROR_LABEL_LOCATOR).textContent();
        expect(errorMsg).toBe(expectedErrorMessage)
    });

    test(`missing digit characters password input should show error message: '${expectedErrorMessage}'`, async () => {
        const input = page.locator(PASSWORD_INPUT_LOCATOR);
        await input.fill('abcDEF@@@');
        await page.locator(SUBMIT_BUTTON_LOCATOR).click();

        const errorMsg = await page.locator(ERROR_LABEL_LOCATOR).textContent();
        expect(errorMsg).toBe(expectedErrorMessage)
    });

    test(`missing special characters password input should show error message: '${expectedErrorMessage}'`, async () => {
        const input = page.locator(PASSWORD_INPUT_LOCATOR);
        await input.fill('abcDEF123');
        await page.locator(SUBMIT_BUTTON_LOCATOR).click();

        const errorMsg = await page.locator(ERROR_LABEL_LOCATOR).textContent();
        expect(errorMsg).toBe(expectedErrorMessage)
    });

    test(`lower than 9 characters password input should show error message: '${expectedErrorMessage}'`, async () => {
        const input = page.locator(PASSWORD_INPUT_LOCATOR);
        await input.fill('aB@1');
        await page.locator(SUBMIT_BUTTON_LOCATOR).click();

        const errorMsg = await page.locator(ERROR_LABEL_LOCATOR).textContent();
        expect(errorMsg).toBe(expectedErrorMessage)
    });


});