
export enum Currency {
    USD = 'USD',
    TWD = 'TWD'
}

export enum AssetType {
    STOCK = 'Stock',
    ETF = 'ETF',
    CRYPTO = 'Crypto',
    CASH = 'Cash',
    FIAT = 'Fiat' // Added based on OpenAPI schema
}

export enum TransactionType {
    BUY = 'Buy',
    SELL = 'Sell',
    DIVIDEND = 'Dividend',
    DEPOSIT = 'Deposit',
    WITHDRAWAL = 'Withdrawal'
}

export interface Transaction {
    id: string;
    date: string;
    accountName: string;
    type: TransactionType;
    assetSymbol: string;
    quantity: number | null;
    pricePerUnit: number | null;
    amount: number; // Total value
    fee: number;
    currency: Currency;
}

export interface AssetAllocation {
    type: AssetType;
    value: number;
    color: string;
}

export interface MenuItem {
    icon: string;
    label: string;
    id: string;
}

export interface Portfolio {
    id: string;
    name: string;
    totalValue: number;
    dailyChange: number;
    dailyChangePercent: number;
}

export interface Account {
    id: string;
    name: string;
    currency: Currency;
    balance: number;
    lastUpdated: string;
}

export interface Asset {
    id: string;
    ticker: string;
    name: string;
    type: AssetType;
    currency: Currency;
    currentPrice: number;
    lastUpdated: string;
}

// DTOs for API Requests based on OpenAPI
export interface AssetCreateRequest {
    ticker: string;
    name: string;
    type: string; // Lowercase for API: 'crypto', 'stock', etc.
    currency?: string;
}

export interface AssetUpdateRequest {
    ticker?: string;
    name?: string;
    type?: string;
    currency?: string;
    current_price?: number; // Snake case for API
}

export interface AccountCreateRequest {
    name: string;
    currency?: string;
}

export interface AccountUpdateRequest {
    name?: string;
    currency?: string;
}