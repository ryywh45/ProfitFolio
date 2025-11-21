
export enum Currency {
    USD = 'USD',
    TWD = 'TWD'
}

export enum AssetType {
    STOCK = 'Stock',
    ETF = 'ETF',
    CRYPTO = 'Crypto',
    CASH = 'Cash'
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
    currentPrice: number;
    lastUpdated: string;
}