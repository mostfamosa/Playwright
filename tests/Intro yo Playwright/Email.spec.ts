import { test, expect, Browser, Page } from '@playwright/test';
import { chromium } from 'playwright';

test.describe('Email Validation Suite', () => {

  let browser: Browser;
  let page: Page;
  let expectedErrorMessage = "Invalid value.";
  let EMAIL_INPUT_LOCATOR = "input[type='email']";
  let SUBMIT_BUTTON_LOCATOR = "//input[@type='submit']";
  let ERROR_LABEL_LOCATOR = "//label[@id = 'your-email-error']";


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
    const input = page.locator(EMAIL_INPUT_LOCATOR);
    await input.fill('');
    await page.locator(SUBMIT_BUTTON_LOCATOR).click();

    const errorMsg = await page.locator(ERROR_LABEL_LOCATOR).textContent();
    expect(errorMsg).toBe(expectedErrorMessage)
  });

  test(`wrong syntax email input should show error message: '${expectedErrorMessage}'`, async () => {
    const input = page.locator(EMAIL_INPUT_LOCATOR);
    await input.fill('Assaf@');
    await page.locator(SUBMIT_BUTTON_LOCATOR).click();

    const errorMsg = await page.locator(ERROR_LABEL_LOCATOR).textContent();
    expect(errorMsg).toBe(expectedErrorMessage)
  });


});