import { Page } from "@playwright/test";
import { BasePage } from "../base-page";


export class BaseComponent extends BasePage {
    constructor(page: Page) {
        super(page);
    }
}