
import { AssetAllocation, AssetType, MenuItem, Transaction, TransactionType, Currency, Portfolio, Account, Asset } from './types';

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
    { id: '1', ticker: 'BTC', name: 'Bitcoin', type: AssetType.CRYPTO, currentPrice: 65432.10, lastUpdated: '2 mins ago' },
    { id: '2', ticker: 'ETH', name: 'Ethereum', type: AssetType.CRYPTO, currentPrice: 3456.78, lastUpdated: '2 mins ago' },
    { id: '3', ticker: 'AAPL', name: 'Apple Inc.', type: AssetType.STOCK, currentPrice: 195.89, lastUpdated: '15 mins ago' },
    { id: '4', ticker: 'TSLA', name: 'Tesla, Inc.', type: AssetType.STOCK, currentPrice: 182.01, lastUpdated: '15 mins ago' },
    { id: '5', ticker: 'NVDA', name: 'NVIDIA Corporation', type: AssetType.STOCK, currentPrice: 120.90, lastUpdated: '15 mins ago' },
    { id: '6', ticker: 'VTI', name: 'Vanguard Total Stock Market ETF', type: AssetType.ETF, currentPrice: 263.45, lastUpdated: '15 mins ago' },
];