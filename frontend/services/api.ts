

import { Asset, Account, AssetType, AssetCreateRequest, AssetUpdateRequest, Currency, AccountCreateRequest, AccountUpdateRequest, Transaction, TransactionType, TransactionCreateRequest, TransactionUpdateRequest, PortfolioListItem, Portfolio, PortfolioSummary, PortfolioCreateRequest, PortfolioUpdateRequest, Holding, ConnectedAccount, DashboardStats } from '../types';
import { ASSETS_DATA, ACCOUNTS_DATA, TRANSACTIONS_DATA, PORTFOLIOS_DATA, PORTFOLIO_DETAILS_MOCK, KPIS, ASSET_ALLOCATION_DATA } from '../constants';

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
    total_balance?: string;
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

interface PortfolioListItemResponse {
    id: number;
    name: string;
    total_value: string;
    daily_change: string;
    daily_change_percent: string;
}

interface PortfolioResponse {
    id: number;
    name: string;
    description?: string;
    created_at: string;
    accounts: AccountResponse[];
}

interface HoldingItemResponse {
    id: string;
    ticker: string;
    name: string;
    current_price: string;
    quantity: string;
    average_cost: string;
    market_value: string;
    profit: string;
    profit_percent: string;
    allocation: string;
}

interface AccountSummaryItemResponse {
    id: number;
    name: string;
    type: string;
    balance: string;
}

interface PortfolioSummaryResponse {
    id: number;
    name: string;
    total_value: string;
    total_profit: string;
    total_profit_percent: string;
    daily_change: string;
    daily_change_percent: string;
    holdings: HoldingItemResponse[];
    accounts: AccountSummaryItemResponse[];
}

interface DashboardStatsResponse {
    net_worth: string;
    net_worth_change_24h: number;
    total_profit: string;
    total_profit_change_24h: number;
    top_performer_name: string | null;
    top_performer_change: number | null;
    allocation: {
        label: string;
        value: string;
        percentage: number;
    }[];
}

export interface AssetValidateResponse {
    ticker: string;
    name: string;
    currency: string;
    current_price: string;
    valid: boolean;
    type?: 'crypto' | 'stock' | 'etf' | 'fiat' | null;
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

// --- Assets APIs ---

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

export const validateAsset = async (ticker: string): Promise<AssetValidateResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/assets/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker })
    });

    if (!response.ok) {
        throw new Error('Validation failed');
    }

    return await response.json();
};

export const updateAllAssetPrices = async (): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/assets/update_prices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
        throw new Error('Failed to update prices');
    }
};

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

export const deleteAsset = async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/assets/${id}`, {
        method: 'DELETE',
    });

    if (!response.ok) throw new Error('Failed to delete asset');
};

// --- Accounts APIs ---

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
            balance: parseFloat(item.total_balance || '0'), 
            lastUpdated: new Date(item.created_at).toLocaleString()
        }));

    } catch (error) {
        console.warn("Failed to fetch accounts from API, falling back to mock data.", error);
        return new Promise((resolve) => setTimeout(() => resolve(ACCOUNTS_DATA), 600));
    }
};

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
        balance: parseFloat(item.total_balance || '0'),
        lastUpdated: new Date(item.created_at).toLocaleString()
    };
};

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
        balance: parseFloat(item.total_balance || '0'),
        lastUpdated: new Date(item.created_at).toLocaleString()
    };
};

export const deleteAccount = async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/accounts/${id}`, {
        method: 'DELETE',
    });

    if (!response.ok) throw new Error('Failed to delete account');
};

// --- Portfolios APIs ---

export const fetchPortfolios = async (): Promise<PortfolioListItem[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/portfolios/?limit=100`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) throw new Error(`API Error: ${response.status}`);

        const data: PortfolioListItemResponse[] = await response.json();
        return data.map(item => ({
            id: item.id.toString(),
            name: item.name,
            totalValue: parseFloat(item.total_value),
            dailyChange: parseFloat(item.daily_change),
            dailyChangePercent: parseFloat(item.daily_change_percent)
        }));
    } catch (error) {
        console.warn("Using mock portfolios", error);
        return new Promise(resolve => setTimeout(() => resolve(PORTFOLIOS_DATA), 500));
    }
};

export const fetchPortfolio = async (id: string): Promise<Portfolio> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/portfolios/${id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) throw new Error(`API Error: ${response.status}`);

    const data: PortfolioResponse = await response.json();
    return {
        id: data.id.toString(),
        name: data.name,
        description: data.description,
        accountIds: data.accounts.map(a => a.id.toString()),
        createdAt: data.created_at
    };
};

export const fetchPortfolioSummary = async (id: string): Promise<PortfolioSummary> => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/portfolios/${id}/summary`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) throw new Error(`API Error: ${response.status}`);

        const data: PortfolioSummaryResponse = await response.json();

        // Generate color palette for holdings
        const colors = ['#3b82f6', '#ec4899', '#eab308', '#14b8a6', '#a855f7', '#f97316', '#6366f1'];
        
        return {
            id: data.id.toString(),
            name: data.name,
            totalValue: parseFloat(data.total_value),
            totalProfit: parseFloat(data.total_profit),
            totalProfitPercent: parseFloat(data.total_profit_percent),
            dailyChange: parseFloat(data.daily_change),
            dailyChangePercent: parseFloat(data.daily_change_percent),
            holdings: data.holdings.map((h, index) => ({
                id: h.id,
                ticker: h.ticker,
                name: h.name,
                currentPrice: parseFloat(h.current_price),
                quantity: parseFloat(h.quantity),
                averageCost: parseFloat(h.average_cost),
                marketValue: parseFloat(h.market_value),
                profit: parseFloat(h.profit),
                profitPercent: parseFloat(h.profit_percent),
                allocation: parseFloat(h.allocation),
                color: colors[index % colors.length]
            })),
            accounts: data.accounts.map(a => ({
                id: a.id.toString(),
                name: a.name,
                type: a.type,
                balance: parseFloat(a.balance)
            }))
        };
    } catch (error) {
        console.warn("Using mock portfolio details", error);
        if (id === '1') return new Promise(resolve => setTimeout(() => resolve(PORTFOLIO_DETAILS_MOCK), 500));
        throw error;
    }
};

export const createPortfolio = async (data: { name: string; description?: string; accountIds: string[] }): Promise<void> => {
    const payload: PortfolioCreateRequest = {
        name: data.name,
        description: data.description,
        account_ids: data.accountIds.map(id => parseInt(id))
    };

    const response = await fetch(`${API_BASE_URL}/api/v1/portfolios/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error('Failed to create portfolio');
};

export const updatePortfolio = async (id: string, data: { name?: string; description?: string; accountIds?: string[] }): Promise<void> => {
    const payload: PortfolioUpdateRequest = {};
    if (data.name) payload.name = data.name;
    if (data.description !== undefined) payload.description = data.description;
    if (data.accountIds) payload.account_ids = data.accountIds.map(aid => parseInt(aid));

    const response = await fetch(`${API_BASE_URL}/api/v1/portfolios/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error('Failed to update portfolio');
};

export const deletePortfolio = async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/portfolios/${id}`, {
        method: 'DELETE',
    });

    if (!response.ok) throw new Error('Failed to delete portfolio');
};


// --- Transactions APIs ---

export const fetchTransactions = async (params?: { limit?: number; offset?: number; accountId?: string }): Promise<Transaction[]> => {
    try {
        const queryParams = new URLSearchParams();
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        else queryParams.append('limit', '100');
        
        if (params?.offset) queryParams.append('offset', params.offset.toString());
        if (params?.accountId) queryParams.append('account_id', params.accountId);

        const response = await fetch(`${API_BASE_URL}/api/v1/transactions/?${queryParams.toString()}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data: TransactionResponse[] = await response.json();

        return data.map(item => {
            const quantity = item.quantity ? parseFloat(item.quantity) : 0;
            let price = item.price_per_unit ? parseFloat(item.price_per_unit) : 0;
            
            // For deposits/withdrawals, if price is missing, treat quantity as face value (price=1)
            // This assumes non-asset transactions implies currency value in quantity.
            if (price === 0 && !item.asset_id && quantity !== 0) {
                 price = 1; 
            }
            const amount = quantity * price;

            return {
                id: item.id.toString(),
                date: new Date(item.transaction_time).toISOString().split('T')[0],
                accountId: item.account_id.toString(),
                accountName: item.account_name,
                type: mapTransactionTypeToFrontend(item.type),
                assetId: item.asset_id ? item.asset_id.toString() : undefined,
                assetSymbol: item.asset_name || '-',
                quantity: item.quantity ? quantity : null,
                pricePerUnit: item.price_per_unit ? price : null,
                amount: amount,
                fee: parseFloat(item.fee),
                currency: Currency.USD, 
                notes: item.notes
            };
        });

    } catch (error) {
        console.warn("Failed to fetch transactions from API, falling back to mock data.", error);
        return new Promise((resolve) => setTimeout(() => resolve(TRANSACTIONS_DATA), 600));
    }
};

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

export const deleteTransaction = async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/transactions/${id}`, {
        method: 'DELETE',
    });

    if (!response.ok) throw new Error('Failed to delete transaction');
};

// --- Dashboard APIs ---

export const fetchDashboardStats = async (): Promise<DashboardStats> => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/dashboard/`, {
             method: 'GET',
             headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        
        const data: DashboardStatsResponse = await response.json();
        
        // Colors for allocation
        const colors: Record<string, string> = {
            'stock': '#3b82f6',
            'etf': '#10b981',
            'crypto': '#f97316',
            'cash': '#9ca3af',
            'fiat': '#6b7280'
        };
        const defaultColors = ['#3b82f6', '#10b981', '#f97316', '#9ca3af', '#eab308', '#ec4899'];

        const allocation = data.allocation.map((item, index) => {
             // Basic mapping from label to AssetType if possible, otherwise map blindly
             let type = AssetType.STOCK; 
             const lowerLabel = item.label.toLowerCase();
             if (lowerLabel === 'crypto') type = AssetType.CRYPTO;
             else if (lowerLabel === 'etf') type = AssetType.ETF;
             else if (lowerLabel === 'cash') type = AssetType.CASH;
             else if (lowerLabel === 'fiat') type = AssetType.FIAT;
             
             return {
                 type: type, // Keeping type for type safety, but UI might want label
                 value: parseFloat(item.value),
                 color: colors[lowerLabel] || defaultColors[index % defaultColors.length]
             };
        });

        return {
            netWorth: parseFloat(data.net_worth),
            netWorthChange: data.net_worth_change_24h,
            totalProfit: parseFloat(data.total_profit),
            totalProfitChange: data.total_profit_change_24h,
            topPerformerName: data.top_performer_name,
            topPerformerChange: data.top_performer_change,
            allocation: allocation
        };

    } catch (e) {
        console.warn("Using mock dashboard stats", e);
        // Map Mock Data from constants to correct structure
        return {
            netWorth: KPIS.netWorth,
            netWorthChange: KPIS.netWorthChange,
            totalProfit: KPIS.totalProfit,
            totalProfitChange: KPIS.totalProfitChange,
            topPerformerName: KPIS.topPerformerName,
            topPerformerChange: KPIS.topPerformerChange,
            allocation: ASSET_ALLOCATION_DATA
        };
    }
};