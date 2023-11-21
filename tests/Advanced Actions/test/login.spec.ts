import { test, expect, Page, chromium, BrowserContext } from '@playwright/test';
import { HomePage } from '../logic/pages/homePage';


const BASE_URL = 'https://www.rami-levy.co.il';
const EMAIL = "mostfa.g.m@gmail.com";
const PASSWORD = "**********";
const USERNAME = "Mostafa"



test.describe('State Stock Table Validation Suite', () => {

    let context: BrowserContext;
    let page: Page;

    test.beforeAll(async () => {
        context = await chromium.launchPersistentContext("userData");
        page = await context.newPage();
    });

    test.beforeEach(async () => {
        await page.goto(BASE_URL);
        await page.setViewportSize({ width: 1920, height: 1080 });

    });

    test.afterAll(async () => {
        await context.close();
    });


    // test('Login', async () => {
    //     const homePage = new HomePage(page);
    //     await homePage.pressLogin();

    //     const loginPopUp = await homePage.getLogInPopUp();
    //     await loginPopUp.fullProccessLogin(EMAIL, PASSWORD);

    //     await page.waitForTimeout(5000);
    // });




});