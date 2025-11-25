
import { Asset, Account, AssetType, AssetCreateRequest, AssetUpdateRequest } from '../types';
import { ASSETS_DATA, ACCOUNTS_DATA } from '../constants';

// Configuration
const API_BASE_URL = 'http://localhost:8000';

// API Response Types (Backend snake_case)
interface AssetResponse {
    id: number;
    ticker: string;
    name: string;
    type: 'crypto' | 'stock' | 'etf' | 'fiat';
    current_price: string; // Backend returns string decimal
    last_updated: string;
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
export const createAsset = async (asset: { ticker: string; name: string; type: AssetType }): Promise<Asset> => {
    const payload: AssetCreateRequest = {
        ticker: asset.ticker,
        name: asset.name,
        type: mapFrontendTypeToApi(asset.type)
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
        currentPrice: parseFloat(item.current_price),
        lastUpdated: new Date(item.last_updated).toLocaleString()
    };
};

/**
 * PATCH /api/v1/assets/{id}
 * Update Asset
 */
export const updateAsset = async (id: string, updates: { ticker?: string; name?: string; type?: AssetType; currentPrice?: number }): Promise<Asset> => {
    const payload: AssetUpdateRequest = {};
    if (updates.ticker) payload.ticker = updates.ticker;
    if (updates.name) payload.name = updates.name;
    if (updates.type) payload.type = mapFrontendTypeToApi(updates.type);
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
 * GET /v1/accounts (Kept as mock fallback structure for now or future implementation)
 */
export const fetchAccounts = async (): Promise<Account[]> => {
    try {
        // Attempting to hit the same base URL structure if accounts API existed
        // const response = await fetch(`${API_BASE_URL}/api/v1/accounts/`);
        // For now, force fallback since only assets API is defined in prompt
        throw new Error("Accounts API not implemented yet");
    } catch (error) {
        // console.warn("Using mock data for accounts");
        return new Promise((resolve) => setTimeout(() => resolve(ACCOUNTS_DATA), 600));
    }
};