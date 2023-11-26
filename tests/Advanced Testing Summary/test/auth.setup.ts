import { expect, test as setup } from '@playwright/test';
import { SignInPage } from "../logic/pages/signin-page"
import { HomePage } from '../logic/pages/home-page';
import { existsSync } from 'fs';

const authFile = 'playwright/.auth/user.json';
const userName = "Moose123";
const password = "1234";
const url = "https://www.pokellector.com/signin";

setup('authenticate', async ({ page }) => {
    if (existsSync(authFile)) {
        return
    }
    await page.goto(url);
    const signinPage = new SignInPage(page);
    await signinPage.signInFullProccess(userName, password);

    const homePage = new HomePage(page);
    expect(await homePage.getUserName()).toBe(userName);

    await page.context().storageState({ path: authFile });
});