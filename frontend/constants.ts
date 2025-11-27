
import { AssetAllocation, AssetType, MenuItem, Transaction, TransactionType, Currency, Portfolio, Account, Asset, Holding, ConnectedAccount } from './types';

export const MENU_ITEMS: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'portfolios', label: 'Portfolios', icon: 'pie_chart' },
    { id: 'accounts', label: 'Accounts', icon: 'account_balance_wallet' },
    { id: 'transactions', label: 'Transactions', icon: 'receipt_long' },
    { id: 'assets', label: 'Assets', icon: 'show_chart' },
];

export const ASSET_ALLOCATION_DATA: AssetAllocation[] = [
    { type: AssetType.STOCK, value: 60800, color: '#3b82f6' }, // Blue
    { type: AssetType.ETF, value: 45600, color: '#10b981' },   // Green
    { type: AssetType.CRYPTO, value: 30400, color: '#f97316' }, // Orange
    { type: AssetType.CASH, value: 15545.67, color: '#9ca3af' }, // Gray
];

// Used in Dashboard (Subset)
export const RECENT_TRANSACTIONS: Transaction[] = [
    { id: '1', date: '2023-10-26', accountName: 'Firstrade', type: TransactionType.BUY, assetSymbol: 'AAPL', quantity: 10, pricePerUnit: 170.50, amount: 1705.00, fee: 1.00, currency: Currency.USD },
    { id: '2', date: '2023-10-25', accountName: 'Firstrade', type: TransactionType.SELL, assetSymbol: 'GOOGL', quantity: 5, pricePerUnit: 135.20, amount: 676.00, fee: 1.00, currency: Currency.USD },
    { id: '3', date: '2023-10-24', accountName: 'Binance', type: TransactionType.BUY, assetSymbol: 'BTC', quantity: 0.05, pricePerUnit: 34500.00, amount: 1725.00, fee: 2.50, currency: Currency.USD },
    { id: '4', date: '2023-10-23', accountName: 'Cash', type: TransactionType.DEPOSIT, assetSymbol: '-', quantity: null, pricePerUnit: null, amount: 5000.00, fee: 0.00, currency: Currency.USD },
    { id: '5', date: '2023-10-22', accountName: 'Cash', type: TransactionType.WITHDRAWAL, assetSymbol: '-', quantity: null, pricePerUnit: null, amount: -500.00, fee: 0.00, currency: Currency.USD },
];

// Full List for Transactions Page
export const TRANSACTIONS_DATA: Transaction[] = [
    { id: '1', date: '2023-10-26', accountName: 'Firstrade', type: TransactionType.BUY, assetSymbol: 'AAPL', quantity: 10, pricePerUnit: 170.50, amount: 1705.00, fee: 1.00, currency: Currency.USD },
    { id: '2', date: '2023-10-25', accountName: 'Firstrade', type: TransactionType.SELL, assetSymbol: 'GOOGL', quantity: 5, pricePerUnit: 135.20, amount: 676.00, fee: 1.00, currency: Currency.USD },
    { id: '3', date: '2023-10-24', accountName: 'Binance', type: TransactionType.BUY, assetSymbol: 'BTC', quantity: 0.05, pricePerUnit: 34500.00, amount: 1725.00, fee: 2.50, currency: Currency.USD },
    { id: '4', date: '2023-10-23', accountName: 'Cash', type: TransactionType.DEPOSIT, assetSymbol: '-', quantity: null, pricePerUnit: null, amount: 5000.00, fee: 0.00, currency: Currency.USD },
    { id: '5', date: '2023-10-22', accountName: 'Cash', type: TransactionType.WITHDRAWAL, assetSymbol: '-', quantity: null, pricePerUnit: null, amount: -500.00, fee: 0.00, currency: Currency.USD },
];

export const KPIS = {
    netWorth: 152345.67,
    netWorthChange: 1.25,
    totalProfit: 25876.12,
    totalProfitChange: 18.5,
    topPerformerName: 'TSLA',
    topPerformerChange: 8.21
};

export const PORTFOLIOS_DATA: Portfolio[] = [
    { id: '1', name: '退休基金', totalValue: 125430.50, dailyChange: 1280.15, dailyChangePercent: 1.03 },
    { id: '2', name: '加密貨幣波段', totalValue: 48912.88, dailyChange: -2345.60, dailyChangePercent: -4.58 },
    { id: '3', name: '子女教育基金', totalValue: 76820.00, dailyChange: 650.40, dailyChangePercent: 0.85 },
];

export const ACCOUNTS_DATA: Account[] = [
    { id: '1', name: 'Binance', currency: Currency.USD, balance: 15430.25, lastUpdated: '2023-10-26 15:30' },
    { id: '2', name: 'Firstrade', currency: Currency.USD, balance: 120890.11, lastUpdated: '2023-10-26 09:00' },
    { id: '3', name: '玉山銀行', currency: Currency.TWD, balance: 850321, lastUpdated: '2023-10-25 18:45' },
    { id: '4', name: 'Cold Wallet', currency: Currency.USD, balance: 5123.45, lastUpdated: '2023-10-24 11:20' },
    { id: '5', name: '國泰世華', currency: Currency.TWD, balance: 1235680, lastUpdated: '2023-10-26 12:00' },
];

export const ASSETS_DATA: Asset[] = [
    { id: '1', ticker: 'BTC', name: 'Bitcoin', type: AssetType.CRYPTO, currency: Currency.USD, currentPrice: 65432.10, lastUpdated: '2 mins ago' },
    { id: '2', ticker: 'ETH', name: 'Ethereum', type: AssetType.CRYPTO, currency: Currency.USD, currentPrice: 3456.78, lastUpdated: '2 mins ago' },
    { id: '3', ticker: 'AAPL', name: 'Apple Inc.', type: AssetType.STOCK, currency: Currency.USD, currentPrice: 195.89, lastUpdated: '15 mins ago' },
    { id: '4', ticker: 'TSLA', name: 'Tesla, Inc.', type: AssetType.STOCK, currency: Currency.USD, currentPrice: 182.01, lastUpdated: '15 mins ago' },
    { id: '5', ticker: 'NVDA', name: 'NVIDIA Corporation', type: AssetType.STOCK, currency: Currency.USD, currentPrice: 120.90, lastUpdated: '15 mins ago' },
    { id: '6', ticker: 'VTI', name: 'Vanguard Total Stock Market ETF', type: AssetType.ETF, currency: Currency.USD, currentPrice: 263.45, lastUpdated: '15 mins ago' },
];

// Mock Data for "Portfolio Details" view (matches screen.png provided by user)
export const PORTFOLIO_DETAILS_MOCK = {
    id: '1',
    name: '退休基金',
    totalValue: 125430.50,
    totalProfit: 12830.15,
    totalProfitPercent: 11.39,
    dailyChange: -280.15,
    dailyChangePercent: -0.22,
    holdings: [
        { id: 'h1', ticker: 'VT', name: 'Vanguard Total World Stock ETF', currentPrice: 112.50, quantity: 500, averageCost: 98.00, marketValue: 56250.00, profit: 7250.00, profitPercent: 14.80, allocation: 44.84, color: '#3b82f6' }, // Blue
        { id: 'h2', ticker: 'AAPL', name: 'Apple Inc.', currentPrice: 190.45, quantity: 100, averageCost: 150.20, marketValue: 19045.00, profit: 4025.00, profitPercent: 26.80, allocation: 15.18, color: '#ec4899' }, // Pink
        { id: 'h3', ticker: 'NVDA', name: 'NVIDIA Corporation', currentPrice: 120.75, quantity: 150, averageCost: 95.50, marketValue: 18112.50, profit: 3787.50, profitPercent: 26.44, allocation: 14.44, color: '#eab308' }, // Yellow
        { id: 'h4', ticker: 'BND', name: 'Vanguard Total Bond Market ETF', currentPrice: 73.20, quantity: 236, averageCost: 75.00, marketValue: 17282.20, profit: -424.80, profitPercent: -2.40, allocation: 13.78, color: '#14b8a6' }, // Teal
        { id: 'h5', ticker: 'TSLA', name: 'Tesla, Inc.', currentPrice: 183.01, quantity: 80, averageCost: 250.00, marketValue: 14640.80, profit: -5359.20, profitPercent: -26.80, allocation: 11.67, color: '#a855f7' }, // Purple
    ] as Holding[],
    accounts: [
        { id: 'a1', name: 'Firstrade Brokerage', type: 'Brokerage Account', balance: 85320.10 },
        { id: 'a2', name: 'Fidelity 401(k)', type: 'Retirement Account', balance: 40110.40 },
    ] as ConnectedAccount[]
};
