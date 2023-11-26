import { test, expect, Browser, chromium } from '@playwright/test';
import { HomePage } from "../logic/pages/home-page"
import { RegisterPage } from "../logic/pages/register"

const BASE_URL = 'https://www.pokellector.com/';

test.describe('Register Page Validations Suite', () => {
    test.use({ storageState: 'playwright/.auth/empty.json' });
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

    // Parameterize test for Register bad users info
    const users = [
        { username: "b", password: "1234", confirmPassword: "1234", email: "", message: "Usernames must be between 3 and 12 characters in length" },
        { username: "bad", password: "1234", confirmPassword: "1234", email: "", message: "The username 'bad' is already taken!" },
        { username: "newnewnew", password: "4321", confirmPassword: "1234", email: "", message: "Your password entries do not match" },
        { username: "newnewnew", password: "12", confirmPassword: "12", email: "", message: "Please enter a valid password that is at least 4 characters in length" },
        { username: "newnewnew", password: "1234", confirmPassword: "1234", email: "", message: "Please enter a valid email address" },
        { username: "newnewnew", password: "1234", confirmPassword: "1234", email: "asd@gmail.com", message: "The email address you've entered is already in use by another user" },
    ]
    for (const user of users) {
        test(`Go to Register -> Fill user info {username:${user.username}, password:${user.password}, email:${user.email}} -> Validate site message: ${user.message}`, async ({ page }) => {
            const homePage = new HomePage(page);
            await homePage.header.pressRegister();

            const registerPage = new RegisterPage(page);
            await registerPage.waitForLoad();
            await registerPage.registerFullProccess(user.username, user.password, user.confirmPassword, user.email);

            let message = await registerPage.getSiteMessage();
            expect(message).toBe(user.message);
        });
    }


});