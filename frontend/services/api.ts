
import { Asset, Account, AssetType, AssetCreateRequest, AssetUpdateRequest, Currency, AccountCreateRequest, AccountUpdateRequest } from '../types';
import { ASSETS_DATA, ACCOUNTS_DATA } from '../constants';

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

/**
 * GET /api/v1/assets/
 * Read Assets
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
        
        // Map backend (snake_case, lowercase enums) to frontend (camelCase, TitleCase enums)
        return data.map(item => ({
            id: item.id.toString(), // Convert number ID to string for frontend consistency
            ticker: item.ticker,
            name: item.name,
            type: mapApiTypeToFrontend(item.type),
            currency: mapCurrencyToFrontend(item.currency),
            currentPrice: parseFloat(item.current_price),
            lastUpdated: new Date(item.last_updated).toLocaleString() // Simple format
        }));

    } catch (error) {
        console.warn("Failed to fetch assets from API, falling back to mock data.", error);
        return new Promise((resolve) => setTimeout(() => resolve(ASSETS_DATA), 500));
    }
};

/**
 * POST /api/v1/assets/
 * Create Asset
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
 * Update Asset
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
 * Delete Asset
 */
export const deleteAsset = async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/assets/${id}`, {
        method: 'DELETE',
    });

    if (!response.ok) throw new Error('Failed to delete asset');
};

/**
 * GET /api/v1/accounts/
 * Read Accounts
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
            // Note: API spec for AccountRead does NOT return balance. Defaulting to 0.
            balance: 0, 
            lastUpdated: new Date(item.created_at).toLocaleString() // Mapping created_at to lastUpdated for now
        }));

    } catch (error) {
        console.warn("Failed to fetch accounts from API, falling back to mock data.", error);
        return new Promise((resolve) => setTimeout(() => resolve(ACCOUNTS_DATA), 600));
    }
};

/**
 * POST /api/v1/accounts/
 * Create Account
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
 * Update Account
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
 * Delete Account
 */
export const deleteAccount = async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/accounts/${id}`, {
        method: 'DELETE',
    });

    if (!response.ok) throw new Error('Failed to delete account');
};