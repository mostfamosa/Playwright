import { request } from "@playwright/test";
import { AddItemRequest } from "./request/add-item-request";

const BASE_URL = 'https://www.rami-levy.co.il';

export class CartApi {

    async addItemToCart(addItemData: AddItemRequest) {
        const context = await request.newContext();
        return await context.post(`${BASE_URL}/api/v2/cart`, { data: addItemData })
    }
}