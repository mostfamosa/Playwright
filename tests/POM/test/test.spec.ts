import { test, expect, Page, Browser, chromium } from '@playwright/test';
import { LoginPage } from '../pages/loginPage';
import { SideMenu } from '../pages/sideMenu';
import { MyInfoPage } from '../pages/myInfoPage';
import { PimPage } from '../pages/pimPage';
import { NewEmployee } from '../pages/addEmployeePage';

const BASE_URL = 'https://opensource-demo.orangehrmlive.com/web/index.php/auth/login';
const USERNAME = "Admin";
const PASSWORD = "admin123";
const POSITIVE_TOAST = "Success";

test.describe('OrangeHRM Validation Suite', () => {

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


    test('Login -> Go to My info -> Update my information -> Validate “Success” message was show', async ({ page }) => {
        const firstName = "Moose";
        const middleName = "G";
        const lastName = "Boss";


        const loginPage = new LoginPage(page);
        await loginPage.fullProccessLogIn(USERNAME, PASSWORD);

        const sideMenu = new SideMenu(page)
        await sideMenu.goToMyInfo();

        const myInfoPage = new MyInfoPage(page);

        await myInfoPage.fullProccessEditMyInfo(firstName, middleName, lastName)

        const toastMsg = await myInfoPage.getToastMessage();
        console.log(toastMsg);
        expect(toastMsg).toContain(POSITIVE_TOAST)
    });

    test('Login -> Go to PIM -> Remove 1 record -> Validate record number is decreased by 1', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.fullProccessLogIn(USERNAME, PASSWORD);

        const sideMenu = new SideMenu(page);
        await sideMenu.goToPim();

        const pimPage = new PimPage(page);

        const beforeDeletingEmployee = await pimPage.getRecordsFound();

        await pimPage.selectFirstEmployee();
        await pimPage.deleteSelectedEmployee();

        const afterDeletingEmployee = await pimPage.getRecordsFound();

        console.log("BEFORE Deleting Employee: " + beforeDeletingEmployee);
        console.log("AFTER Deleting Employee: " + afterDeletingEmployee);
        expect(afterDeletingEmployee).toBe(beforeDeletingEmployee - 1);
    });

    test('Login -> Go to PIM -> Add new employee -> Validate “Success” message was show', async ({ page }) => {
        const newEmployeeFirstName = "aaa";
        const newEmployeeMiddleName = "bbb";
        const newEmployeeLastName = "ccc";

        const loginPage = new LoginPage(page);
        await loginPage.fullProccessLogIn(USERNAME, PASSWORD);

        const sideMenu = new SideMenu(page);
        await sideMenu.goToPim();

        const pimPage = new PimPage(page);
        await pimPage.clickOnAddNewEmployee();

        const employeePage = new NewEmployee(page);
        await employeePage.fullProccessAddNewEmployee(newEmployeeFirstName, newEmployeeMiddleName, newEmployeeLastName);

        const toastMsg = await employeePage.getToastMessage();
        console.log(toastMsg);
        expect(toastMsg).toContain(POSITIVE_TOAST)

    });

    test('Login -> Go to PIM -> Add new employee -> Go back to PIM -> Validate record number is increased by 1', async ({ page }) => {
        const newEmployeeFirstName = "aaa";
        const newEmployeeMiddleName = "bbb";
        const newEmployeeLastName = "ccc";

        const loginPage = new LoginPage(page);
        await loginPage.fullProccessLogIn(USERNAME, PASSWORD);

        const sideMenu = new SideMenu(page);
        await sideMenu.goToPim();

        const pimPage = new PimPage(page);
        const beforeAddingEmployee = await pimPage.getRecordsFound();
        await pimPage.clickOnAddNewEmployee();

        const employeePage = new NewEmployee(page);
        await employeePage.fullProccessAddNewEmployee(newEmployeeFirstName, newEmployeeMiddleName, newEmployeeLastName);

        const toastMsg = await employeePage.getToastMessage();
        console.log(toastMsg);
        expect(toastMsg).toContain(POSITIVE_TOAST);

        await sideMenu.goToPim();
        const afterAddingEmployee = await pimPage.getRecordsFound();

        console.log("BEFORE Adding Employee: " + beforeAddingEmployee);
        console.log("AFTER Adding Employee: " + afterAddingEmployee);
        expect(afterAddingEmployee).toBe(beforeAddingEmployee + 1);


    });

    test('Login -> Go to PIM -> Add new employee -> Go back to PIM -> Search by employee name -> Validate it appears in the table', async ({ page }) => {
        const newEmployeeFirstName = "aaa";
        const newEmployeeMiddleName = "bbb";
        const newEmployeeLastName = "ccc";

        const loginPage = new LoginPage(page);
        await loginPage.fullProccessLogIn(USERNAME, PASSWORD);

        const sideMenu = new SideMenu(page);
        await sideMenu.goToPim();

        const pimPage = new PimPage(page);
        await pimPage.clickOnAddNewEmployee();

        const employeePage = new NewEmployee(page);
        await employeePage.fullProccessAddNewEmployee(newEmployeeFirstName, newEmployeeMiddleName, newEmployeeLastName);

        await sideMenu.goToPim();

        await pimPage.searchByName(newEmployeeFirstName);

        const firstElementInTheTable = await pimPage.getFirstEmployeeNameInTheTable();

        console.log("firstElementInTheTable: " + firstElementInTheTable);
        expect(firstElementInTheTable).toContain(newEmployeeFirstName);
    });

});