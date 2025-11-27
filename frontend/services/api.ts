import { Asset, Account, AssetType, AssetCreateRequest, AssetUpdateRequest, Currency, AccountCreateRequest, AccountUpdateRequest, Transaction, TransactionType, TransactionCreateRequest, TransactionUpdateRequest } from '../types';
import { ASSETS_DATA, ACCOUNTS_DATA, TRANSACTIONS_DATA } from '../constants';

// Configuration
const API_BASE_URL = 'http://localhost:8000';

// API Response Types (Backend snake_case)
interface AssetResponse {
    id: number;
    ticker: string;
    name: string;
    type: 'crypto' | 'stock' | 'etf' | 'fiat';
    currency: string;
    current_price: string; // Backend returns string decimal
    last_updated: string;
}

interface AccountResponse {
    id: number;
    name: string;
    currency: string;
    created_at: string;
}

interface TransactionResponse {
    id: number;
    account_id: number;
    account_name: string;
    asset_id?: number;
    asset_name?: string; // Used as Ticker/Symbol
    type: string;
    quantity?: string;
    price_per_unit?: string;
    fee: string;
    transaction_time: string;
    notes?: string;
}

export type AccountsApiResponse = Account[];

// Helpers for Enum Conversion
const mapApiTypeToFrontend = (apiType: string): AssetType => {
    switch (apiType) {
        case 'crypto': return AssetType.CRYPTO;
        case 'stock': return AssetType.STOCK;
        case 'etf': return AssetType.ETF;
        case 'fiat': return AssetType.FIAT;
        default: return AssetType.STOCK;
    }
};

const mapFrontendTypeToApi = (feType: AssetType): string => {
    switch (feType) {
        case AssetType.CRYPTO: return 'crypto';
        case AssetType.STOCK: return 'stock';
        case AssetType.ETF: return 'etf';
        case AssetType.FIAT: return 'fiat';
        default: return 'stock';
    }
};

const mapCurrencyToFrontend = (curr: string): Currency => {
    if (curr === 'TWD') return Currency.TWD;
    return Currency.USD;
};

const mapTransactionTypeToFrontend = (type: string): TransactionType => {
    switch (type) {
        case 'buy': return TransactionType.BUY;
        case 'sell': return TransactionType.SELL;
        case 'deposit': return TransactionType.DEPOSIT;
        case 'withdraw': return TransactionType.WITHDRAWAL;
        case 'dividend': return TransactionType.DIVIDEND;
        default: return TransactionType.BUY;
    }
};

const mapFrontendTransactionTypeToApi = (type: TransactionType): string => {
    switch (type) {
        case TransactionType.BUY: return 'buy';
        case TransactionType.SELL: return 'sell';
        case TransactionType.DEPOSIT: return 'deposit';
        case TransactionType.WITHDRAWAL: return 'withdraw';
        case TransactionType.DIVIDEND: return 'dividend';
        default: return 'buy';
    }
};

/**
 * GET /api/v1/assets/
 */
export const fetchAssets = async (): Promise<Asset[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/assets/?limit=100`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data: AssetResponse[] = await response.json();
        
        return data.map(item => ({
            id: item.id.toString(),
            ticker: item.ticker,
            name: item.name,
            type: mapApiTypeToFrontend(item.type),
            currency: mapCurrencyToFrontend(item.currency),
            currentPrice: parseFloat(item.current_price),
            lastUpdated: new Date(item.last_updated).toLocaleString()
        }));

    } catch (error) {
        console.warn("Failed to fetch assets from API, falling back to mock data.", error);
        return new Promise((resolve) => setTimeout(() => resolve(ASSETS_DATA), 500));
    }
};

/**
 * POST /api/v1/assets/
 */
export const createAsset = async (asset: { ticker: string; name: string; type: AssetType; currency: Currency }): Promise<Asset> => {
    const payload: AssetCreateRequest = {
        ticker: asset.ticker,
        name: asset.name,
        type: mapFrontendTypeToApi(asset.type),
        currency: asset.currency
    };

    const response = await fetch(`${API_BASE_URL}/api/v1/assets/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail ? JSON.stringify(err.detail) : 'Failed to create asset');
    }

    const item: AssetResponse = await response.json();
    return {
        id: item.id.toString(),
        ticker: item.ticker,
        name: item.name,
        type: mapApiTypeToFrontend(item.type),
        currency: mapCurrencyToFrontend(item.currency),
        currentPrice: parseFloat(item.current_price),
        lastUpdated: new Date(item.last_updated).toLocaleString()
    };
};

/**
 * PATCH /api/v1/assets/{id}
 */
export const updateAsset = async (id: string, updates: { ticker?: string; name?: string; type?: AssetType; currency?: Currency; currentPrice?: number }): Promise<Asset> => {
    const payload: AssetUpdateRequest = {};
    if (updates.ticker) payload.ticker = updates.ticker;
    if (updates.name) payload.name = updates.name;
    if (updates.type) payload.type = mapFrontendTypeToApi(updates.type);
    if (updates.currency) payload.currency = updates.currency;
    if (updates.currentPrice !== undefined) payload.current_price = updates.currentPrice;

    const response = await fetch(`${API_BASE_URL}/api/v1/assets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error('Failed to update asset');

    const item: AssetResponse = await response.json();
    return {
        id: item.id.toString(),
        ticker: item.ticker,
        name: item.name,
        type: mapApiTypeToFrontend(item.type),
        currency: mapCurrencyToFrontend(item.currency),
        currentPrice: parseFloat(item.current_price),
        lastUpdated: new Date(item.last_updated).toLocaleString()
    };
};

/**
 * DELETE /api/v1/assets/{id}
 */
export const deleteAsset = async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/assets/${id}`, {
        method: 'DELETE',
    });

    if (!response.ok) throw new Error('Failed to delete asset');
};

/**
 * GET /api/v1/accounts/
 */
export const fetchAccounts = async (): Promise<Account[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/accounts/?limit=100`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data: AccountResponse[] = await response.json();

        return data.map(item => ({
            id: item.id.toString(),
            name: item.name,
            currency: mapCurrencyToFrontend(item.currency),
            balance: 0, 
            lastUpdated: new Date(item.created_at).toLocaleString()
        }));

    } catch (error) {
        console.warn("Failed to fetch accounts from API, falling back to mock data.", error);
        return new Promise((resolve) => setTimeout(() => resolve(ACCOUNTS_DATA), 600));
    }
};

/**
 * POST /api/v1/accounts/
 */
export const createAccount = async (account: { name: string; currency: Currency }): Promise<Account> => {
    const payload: AccountCreateRequest = {
        name: account.name,
        currency: account.currency
    };

    const response = await fetch(`${API_BASE_URL}/api/v1/accounts/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail ? JSON.stringify(err.detail) : 'Failed to create account');
    }

    const item: AccountResponse = await response.json();
    return {
        id: item.id.toString(),
        name: item.name,
        currency: mapCurrencyToFrontend(item.currency),
        balance: 0,
        lastUpdated: new Date(item.created_at).toLocaleString()
    };
};

/**
 * PATCH /api/v1/accounts/{id}
 */
export const updateAccount = async (id: string, updates: { name?: string; currency?: Currency }): Promise<Account> => {
    const payload: AccountUpdateRequest = {};
    if (updates.name) payload.name = updates.name;
    if (updates.currency) payload.currency = updates.currency;

    const response = await fetch(`${API_BASE_URL}/api/v1/accounts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error('Failed to update account');

    const item: AccountResponse = await response.json();
    return {
        id: item.id.toString(),
        name: item.name,
        currency: mapCurrencyToFrontend(item.currency),
        balance: 0,
        lastUpdated: new Date(item.created_at).toLocaleString()
    };
};

/**
 * DELETE /api/v1/accounts/{id}
 */
export const deleteAccount = async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/accounts/${id}`, {
        method: 'DELETE',
    });

    if (!response.ok) throw new Error('Failed to delete account');
};

/**
 * GET /api/v1/transactions/
 * Read Transactions
 */
export const fetchTransactions = async (): Promise<Transaction[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/transactions/?limit=100`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data: TransactionResponse[] = await response.json();

        return data.map(item => {
            const quantity = item.quantity ? parseFloat(item.quantity) : 0;
            const price = item.price_per_unit ? parseFloat(item.price_per_unit) : 0;
            // Requirement: Total Amount = Quantity * Unit Price
            const amount = quantity * price;

            return {
                id: item.id.toString(),
                date: new Date(item.transaction_time).toISOString().split('T')[0], // Extract YYYY-MM-DD
                accountId: item.account_id.toString(),
                accountName: item.account_name,
                type: mapTransactionTypeToFrontend(item.type),
                assetId: item.asset_id ? item.asset_id.toString() : undefined,
                assetSymbol: item.asset_name || '-',
                quantity: item.quantity ? quantity : null,
                pricePerUnit: item.price_per_unit ? price : null,
                amount: amount,
                fee: parseFloat(item.fee),
                currency: Currency.USD, // Backend doesn't return currency yet, default to USD
                notes: item.notes
            };
        });

    } catch (error) {
        console.warn("Failed to fetch transactions from API, falling back to mock data.", error);
        return new Promise((resolve) => setTimeout(() => resolve(TRANSACTIONS_DATA), 600));
    }
};

/**
 * POST /api/v1/transactions/
 * Create Transaction
 */
export const createTransaction = async (tx: Partial<Transaction> & { accountId: string; type: TransactionType }): Promise<void> => {
    const payload: TransactionCreateRequest = {
        account_id: parseInt(tx.accountId),
        asset_id: tx.assetId ? parseInt(tx.assetId) : null,
        type: mapFrontendTransactionTypeToApi(tx.type),
        quantity: tx.quantity,
        price_per_unit: tx.pricePerUnit,
        fee: tx.fee,
        transaction_time: tx.date ? new Date(tx.date).toISOString() : new Date().toISOString(),
        notes: tx.notes
    };

    const response = await fetch(`${API_BASE_URL}/api/v1/transactions/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail ? JSON.stringify(err.detail) : 'Failed to create transaction');
    }
};

/**
 * PATCH /api/v1/transactions/{id}
 * Update Transaction
 */
export const updateTransaction = async (id: string, tx: Partial<Transaction>): Promise<void> => {
    const payload: TransactionUpdateRequest = {};
    if (tx.accountId) payload.account_id = parseInt(tx.accountId);
    if (tx.assetId) payload.asset_id = parseInt(tx.assetId);
    if (tx.type) payload.type = mapFrontendTransactionTypeToApi(tx.type);
    if (tx.quantity !== undefined) payload.quantity = tx.quantity;
    if (tx.pricePerUnit !== undefined) payload.price_per_unit = tx.pricePerUnit;
    if (tx.fee !== undefined) payload.fee = tx.fee;
    if (tx.date) payload.transaction_time = new Date(tx.date).toISOString();
    if (tx.notes !== undefined) payload.notes = tx.notes;

    const response = await fetch(`${API_BASE_URL}/api/v1/transactions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error('Failed to update transaction');
};

/**
 * DELETE /api/v1/transactions/{id}
 * Delete Transaction
 */
export const deleteTransaction = async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/transactions/${id}`, {
        method: 'DELETE',
    });

    if (!response.ok) throw new Error('Failed to delete transaction');
};