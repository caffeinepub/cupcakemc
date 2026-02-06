import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface PurchaseRecord {
    status: PurchaseStatus;
    minecraftUsername: string;
    totalAmount: bigint;
    timestamp: bigint;
    discordUsername: string;
    items: Array<CartItem>;
}
export interface UPIConfig {
    merchantName: string;
    upiId: string;
}
export interface OrderDetails {
    status: PurchaseStatus;
    identityName: string;
    minecraftUsername: string;
    totalAmount: bigint;
    timestamp: bigint;
    purchaser: Principal;
    discordUsername: string;
    items: Array<CartItem>;
}
export interface CartItem {
    shopItem: ShopItem;
    quantity: bigint;
}
export interface WebsiteConfig {
    homeTagline: string;
    serverMemberCount: bigint;
    discordInviteLink: string;
    serverOnlineStatus: boolean;
    votePageUrls: Array<string>;
    serverIp: string;
}
export interface UserProfile {
    name: string;
    minecraftUsername: string;
}
export interface ShopItem {
    id: bigint;
    name: string;
    description: string;
    available: boolean;
    category: string;
    price: bigint;
}
export enum PurchaseStatus {
    unapproved = "unapproved",
    approved = "approved"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addShopItem(name: string, description: string, price: bigint, category: string, available: boolean): Promise<bigint>;
    addToCart(itemId: bigint, quantity: bigint): Promise<void>;
    approveOrder(user: Principal, orderId: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    clearCart(): Promise<void>;
    completePurchaseWithUPI(minecraftUsername: string, discordUsername: string): Promise<void>;
    deleteShopItem(id: bigint): Promise<void>;
    editShopItem(id: bigint, name: string, description: string, price: bigint, category: string, available: boolean): Promise<void>;
    getAllOrders(): Promise<Array<OrderDetails>>;
    getAllShopItems(): Promise<Array<ShopItem>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCart(): Promise<Array<CartItem>>;
    getPurchaseHistory(): Promise<Array<PurchaseRecord>>;
    getShopItemsByCategory(category: string): Promise<Array<ShopItem>>;
    getUPIConfig(): Promise<UPIConfig>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getWebsiteConfig(): Promise<WebsiteConfig>;
    isCallerAdmin(): Promise<boolean>;
    registerWithMinecraftUsername(name: string, minecraftUsername: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateUPIConfig(upiId: string, merchantName: string): Promise<void>;
    updateUserMinecraftUsername(user: Principal, newMinecraftUsername: string): Promise<void>;
    updateWebsiteConfig(discordInviteLink: string, votePageUrls: Array<string>, serverIp: string, homeTagline: string, serverOnlineStatus: boolean, serverMemberCount: bigint): Promise<void>;
}
