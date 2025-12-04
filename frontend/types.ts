

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
    date: string; // mapped from transaction_time
    accountId: string;
    accountName: string;
    type: TransactionType;
    assetId?: string;
    assetSymbol?: string; // mapped from asset_name/ticker
    quantity: number | null;
    pricePerUnit: number | null;
    amount: number; // Calculated: quantity * pricePerUnit
    fee: number;
    notes?: string;
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

// Used for the List View
export interface PortfolioListItem {
    id: string;
    name: string;
    totalValue: number;
    dailyChange: number;
    dailyChangePercent: number;
}

// Basic Portfolio Data (for editing)
export interface Portfolio {
    id: string;
    name: string;
    description?: string;
    accountIds: string[]; // IDs of accounts linked to this portfolio
    createdAt: string;
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

// Portfolio Details / Summary View Types
export interface Holding {
    id: string;
    ticker: string;
    name: string;
    currentPrice: number;
    quantity: number;
    averageCost: number;
    marketValue: number;
    profit: number;
    profitPercent: number;
    allocation: number; // 0-100
    color?: string; // Optional, frontend can generate this
}

export interface ConnectedAccount {
    id: string;
    name: string;
    type: string;
    balance: number;
}

export interface PortfolioSummary {
    id: string;
    name: string;
    totalValue: number;
    totalProfit: number;
    totalProfitPercent: number;
    dailyChange: number;
    dailyChangePercent: number;
    holdings: Holding[];
    accounts: ConnectedAccount[];
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

export interface PortfolioCreateRequest {
    name: string;
    description?: string;
    account_ids?: number[];
}

export interface PortfolioUpdateRequest {
    name?: string;
    description?: string;
    account_ids?: number[];
}

export interface TransactionCreateRequest {
    account_id: number;
    asset_id?: number | null;
    type: string;
    quantity?: number | null;
    price_per_unit?: number | null;
    fee?: number;
    transaction_time?: string;
    notes?: string;
}

export interface TransactionUpdateRequest {
    account_id?: number;
    asset_id?: number | null;
    type?: string;
    quantity?: number | null;
    price_per_unit?: number | null;
    fee?: number;
    transaction_time?: string;
    notes?: string;
}