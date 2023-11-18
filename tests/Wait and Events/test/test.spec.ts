import { test, expect, Page, Browser, chromium, BrowserContext } from '@playwright/test';
import { HomePage } from '../pages/homePage';
import { StatisticsPage } from '../pages/statisticsPage';
import path from 'path';
import { readAndParseCSV } from '../utils/cvsFileParser'

const BASE_URL = 'https://tase.co.il';
const COMMON_ROWS_IN_TABLE_BROWSER = 4;
const COMMON_ROWS_IN_TABLE_FILE = 3;
const FILE_NAME = "downloadedFile.csv";
const DATE = "01/10/2023";
const CATEGORY_VALUE = "12";

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

    test('Hover on מסחר ניתונים -> Click סטטיסטקות -> Choose 01/10/2023 date -> Select מדדי אג"ח סוף יום -> Filter The Table -> Validate the first security group in table', async () => {
        const homePage = new HomePage(page);

        const upperBar = await homePage.getUpperBar();
        await upperBar.clickOnStatistics();

        const statPage = new StatisticsPage(page);
        await statPage.fullFilterProccess(DATE, CATEGORY_VALUE);

        expect(await statPage.getSecurityGroupByRowIndex(0)).toBe("אג''ח כללי - קונצרני");
    });

    test('Hover on מסחר ניתונים -> Click סטטיסטקות -> Choose 01/10/2023 date -> Select מדדי אג"ח סוף יום -> Filter The Table -> Validate the date of the table', async () => {
        const homePage = new HomePage(page);

        const upperBar = await homePage.getUpperBar();
        await upperBar.clickOnStatistics();

        const statPage = new StatisticsPage(page);
        await statPage.fullFilterProccess(DATE, CATEGORY_VALUE);

        expect(await statPage.getDateOfTable()).toBe(DATE);
    });

    test('Hover on מסחר ניתונים -> Click סטטיסטקות -> Choose 01/10/2023 date -> Select מדדי אג"ח סוף יום -> Filter The Table -> Validate table header', async () => {
        const homePage = new HomePage(page);

        const upperBar = await homePage.getUpperBar();
        await upperBar.clickOnStatistics();

        const statPage = new StatisticsPage(page);
        await statPage.fullFilterProccess(DATE, CATEGORY_VALUE);

        expect(await statPage.getHeaderOfTable()).toContain('מדדי אג"ח סוף יום');
    });


    // Parameterized Tests
    const dateAndCategoryData = [
        { date: "01/10/2023", categoryValue: "12", categoryName: 'מדדי אג"ח סוף יום', rowToValidate: 0 },
        { date: "05/11/2023", categoryValue: "02", categoryName: 'מדדי שווי שוק', rowToValidate: 0 },
        { date: "01/11/2023", categoryValue: "04", categoryName: 'מדדים מיוחדים', rowToValidate: 0 },
        { date: "01/10/2023", categoryValue: "15", categoryName: 'מדדי תל בונד', rowToValidate: 0 }
    ];
    for (const data of dateAndCategoryData) {

        test(`Hover on מסחר ניתונים -> Click סטטיסטקות -> Filter The Table (Date = ${data.date}, Category = ${data.categoryName}) -> Download file as CSV -> Validate all the data in row = ${data.rowToValidate}`, async () => {
            const homePage = new HomePage(page);
            const upperBar = await homePage.getUpperBar();
            await upperBar.clickOnStatistics();

            const statPage = new StatisticsPage(page);
            await statPage.fullFilterProccess(data.date, data.categoryName);
            const download = await statPage.downloadCurrentData();

            // Save the file in the project folder
            const relativePath = path.join(__dirname, FILE_NAME);
            await download.saveAs(relativePath);

            // Parse the folder for validation
            const parsedData = await readAndParseCSV(relativePath);

            // Row index to validate (The first one)
            let i = data.rowToValidate;

            // Validate all of the data in the file and browser
            expect.soft(await statPage.getNumberOfRecords(), "should be equal").toBe(parsedData.length - COMMON_ROWS_IN_TABLE_BROWSER);
            expect.soft(await statPage.getSecurityGroupByRowIndex(i), "should be equal").toBe(parsedData[i + COMMON_ROWS_IN_TABLE_FILE].Column1);
            expect.soft(await statPage.getCategoryByRowIndex(i), "should be equal").toBe(parsedData[i + COMMON_ROWS_IN_TABLE_FILE].Column2);
            expect.soft(await statPage.getLastGateByRowIndex(i), "should be equal").toBe(parsedData[i + COMMON_ROWS_IN_TABLE_FILE].Column4);
            expect.soft(await statPage.getDifferenceByRowIndex(i), "should be equal").toBe(parsedData[i + COMMON_ROWS_IN_TABLE_FILE].Column5);
            expect.soft(await statPage.getCycleValueByRowIndex(i), "should be equal").toBe(parsedData[i + COMMON_ROWS_IN_TABLE_FILE].Column6);
            expect.soft(await statPage.getIncreasedValueByRowIndex(i), "should be equal").toBe(parsedData[i + COMMON_ROWS_IN_TABLE_FILE].Column7);
            expect.soft(await statPage.getDecreasedValueByRowIndex(i), "should be equal").toBe(parsedData[i + COMMON_ROWS_IN_TABLE_FILE].Column8);
            expect.soft(await statPage.getUnchangedByRowIndex(i), "should be equal").toBe(parsedData[i + COMMON_ROWS_IN_TABLE_FILE].Column9);
            expect.soft(await statPage.getMarketValueByRowIndex(i), "should be equal").toBe(parsedData[i + COMMON_ROWS_IN_TABLE_FILE].Column10.trim());

        });

    }


});