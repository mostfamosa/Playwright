import { test, expect, Browser, chromium } from '@playwright/test';
import { SignUpPage } from '../logic/pages/signup-page';
import { HomePage } from '../logic/pages/homePage';

const BASE_URL = 'https://todoist.com';

test.describe('Sing Up New User Validations Suite', () => {

    let browser: Browser;
    let signUpPage: SignUpPage;

    test.beforeAll(async () => {
        browser = await chromium.launch();
    });
    test.beforeEach(async ({ page }) => {
        await page.goto(BASE_URL);
        await page.setViewportSize({ width: 1920, height: 1080 });

        const homePage = new HomePage(page);
        await homePage.goToSignUp();

        signUpPage = new SignUpPage(page);

    });
    test.afterEach(async ({ page }) => {
        await page.close();
    });
    test.afterAll(async () => {
        await browser.close();
    });


    test('@bug Fill the email input without ".com" -> Validate error message', async () => {
        let data = { email: "mostfa.g.m@ggg", password: "", error: "Please enter a valid email address." }

        await signUpPage.fullSignUpProccess(data.email, data.password);
        const err = await signUpPage.getEmailErrorMessage();
        console.log(err);
        expect(err).toContain(data.error);
    });

    test('@bug Fill the email -> Dont fill the password -> Validate error message', async () => {
        let data = { email: "mostfa.g.m@ggg.com", password: "", error: "Passwords must be at least 8 characters long." }

        await signUpPage.fullSignUpProccess(data.email, data.password);
        const err = await signUpPage.getPasswordErrorMessage();
        console.log(err);
        expect(err).toContain(data.error);
    });

    test('@bug Fill the email -> Fill the password with "Aa123456" -> Validate error message', async () => {
        let data = { email: "mostfa.g.m@ggg.com", password: "Aa123456", error: "This password is too easy to guess. Try using something stronger." }

        await signUpPage.fullSignUpProccess(data.email, data.password);
        const err = await signUpPage.getPasswordErrorMessage();
        console.log(err);
        expect(err).toContain(data.error);
    });
});