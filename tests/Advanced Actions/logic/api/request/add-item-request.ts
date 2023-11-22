interface AddItemRequest {
    isClub: number,
    items: ColaItem | AppleItem | clearCart,
    meta: any,
    store: number,
    supplyAt: string

}

interface ColaItem {
    386565: number
}

interface AppleItem {
    18: number
}
interface clearCart {
    164854: 0
}

const setClearCartRequest = (): AddItemRequest => {
    return {
        isClub: 0,
        items: { 164854: 0 },
        meta: null,
        store: 331,
        supplyAt: `${new Date().toISOString()}`
    }
}

const setAddColaItemRequest = (quantity: number): AddItemRequest => {
    return {
        isClub: 0,
        items: { 386565: quantity },
        meta: null,
        store: 331,
        supplyAt: `${new Date().toISOString()}`
    }
}


const setAddApplesInKgRequest = (quantity: number): AddItemRequest => {
    return {
        isClub: 0,
        items: { 386565: quantity },
        meta: null,
        store: 331,
        supplyAt: `${new Date().toISOString()}`
    }
}

export { setAddColaItemRequest, setAddApplesInKgRequest,setClearCartRequest, AddItemRequest, ColaItem }