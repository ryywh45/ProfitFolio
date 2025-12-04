

import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Transaction, TransactionType, DashboardStats } from '../types';
import { fetchTransactions, fetchDashboardStats } from '../services/api';

interface DashboardProps {
    onNavigateToTransactions: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigateToTransactions }) => {
    const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const [txData, statsData] = await Promise.all([
                    fetchTransactions({ limit: 5 }),
                    fetchDashboardStats()
                ]);
                setRecentTransactions(txData);
                setStats(statsData);
            } catch (error) {
                console.error("Failed to load dashboard data", error);
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, []);
    
    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Math.abs(val));
    };

    // Helper to render the trend line
    const renderTrend = (amount: number, percent: number | null) => {
        const percentage = percent || 0;
        const isPositive = percentage >= 0;
        return (
            <div className="flex items-center gap-1 mt-2">
                <span className={`material-symbols-outlined text-lg ${isPositive ? 'text-green-600 dark:text-primary' : 'text-red-500 dark:text-red-400'}`}>
                    {isPositive ? 'arrow_upward' : 'arrow_downward'}
                </span>
                <p className={`text-lg font-semibold ${isPositive ? 'text-green-600 dark:text-primary' : 'text-red-500 dark:text-red-400'}`}>
                    {isPositive ? '+' : '-'}{formatCurrency(amount)} ({Math.abs(percentage).toFixed(2)}%)
                </p>
            </div>
        );
    };

    // Safe access to stats with default values
    const netWorth = stats?.netWorth || 0;
    const netWorthChange = stats?.netWorthChange || 0;
    const totalProfit = stats?.totalProfit || 0;
    const totalProfitChange = stats?.totalProfitChange || 0;
    const topPerformerName = stats?.topPerformerName || '-';
    const topPerformerChange = stats?.topPerformerChange || 0;
    const allocationData = stats?.allocation || [];

    // Map allocation data for Recharts to avoid strict type issues with interfaces
    const chartData = allocationData.map(item => ({
        name: item.type,
        value: item.value,
        color: item.color
    }));

    // Calculate amounts for trend display based on percentage returned by API
    // Assumption: The API returns percentage change. We estimate absolute change amount for display if not provided.
    const netWorthChangeAmount = netWorth * (netWorthChange / 100);
    // For profit, we can also estimate change amount based on the profit total and percentage
    const totalProfitChangeAmount = totalProfit * (totalProfitChange / 100);
    
    // For Top Performer, we don't have the price here easily without searching assets, 
    // but we can just show the percentage trend or a placeholder amount if needed. 
    // Let's just assume a base of 100 for visual trend if we can't calc real amount, 
    // or better, just hide amount if it doesn't make sense.
    // However, keeping consistent with UI, let's try to infer if we have asset data. 
    // Without full asset list loaded here, we might just show 0 or hide the amount part.
    // Let's show just the percentage for top performer if amount is unknown, but the renderTrend expects amount.
    // We'll pass 0 for amount for now or simple calculation if we assume the change is on a unit price.
    const topPerformerChangeAmount = 0; // Placeholder

    const totalAssets = allocationData.reduce((acc, curr) => acc + curr.value, 0);

    return (
        <div className="p-4 md:p-6 space-y-6 fade-in pb-20">
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Net Worth */}
                <div className="flex flex-col gap-1 rounded-xl p-6 bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark shadow-sm hover:shadow-md transition-all duration-300">
                    <p className="text-gray-600 dark:text-gray-400 text-sm font-semibold uppercase tracking-wider">Net Worth</p>
                    {isLoading ? (
                        <div className="h-8 w-32 bg-gray-200 dark:bg-white/10 rounded animate-pulse mt-1"></div>
                    ) : (
                        <p className="text-gray-900 dark:text-white tracking-tight text-3xl font-bold leading-tight">
                            {formatCurrency(netWorth)}
                        </p>
                    )}
                    {!isLoading && renderTrend(netWorthChangeAmount, netWorthChange)}
                </div>

                {/* Total Profit/Loss */}
                <div className="flex flex-col gap-1 rounded-xl p-6 bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark shadow-sm hover:shadow-md transition-all duration-300">
                    <p className="text-gray-600 dark:text-gray-400 text-sm font-semibold uppercase tracking-wider">Total Profit/Loss</p>
                    {isLoading ? (
                        <div className="h-8 w-32 bg-gray-200 dark:bg-white/10 rounded animate-pulse mt-1"></div>
                    ) : (
                        <p className="text-gray-900 dark:text-white tracking-tight text-3xl font-bold leading-tight">
                            {totalProfit >= 0 ? '+' : ''}{formatCurrency(totalProfit)}
                        </p>
                    )}
                    {!isLoading && renderTrend(totalProfitChangeAmount, totalProfitChange)}
                </div>

                {/* Top Performer */}
                <div className="flex flex-col gap-1 rounded-xl p-6 bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark shadow-sm hover:shadow-md transition-all duration-300">
                    <p className="text-gray-600 dark:text-gray-400 text-sm font-semibold uppercase tracking-wider">Top Performer</p>
                    {isLoading ? (
                        <div className="h-8 w-24 bg-gray-200 dark:bg-white/10 rounded animate-pulse mt-1"></div>
                    ) : (
                        <p className="text-gray-900 dark:text-white tracking-tight text-3xl font-bold leading-tight">
                            {topPerformerName || 'N/A'}
                        </p>
                    )}
                    {!isLoading && topPerformerName && (
                        <div className="flex items-center gap-1 mt-2">
                            <span className={`material-symbols-outlined text-lg ${(topPerformerChange || 0) >= 0 ? 'text-green-600 dark:text-primary' : 'text-red-500 dark:text-red-400'}`}>
                                {(topPerformerChange || 0) >= 0 ? 'arrow_upward' : 'arrow_downward'}
                            </span>
                            <p className={`text-lg font-semibold ${(topPerformerChange || 0) >= 0 ? 'text-green-600 dark:text-primary' : 'text-red-500 dark:text-red-400'}`}>
                                {Math.abs(topPerformerChange || 0).toFixed(2)}%
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Asset Allocation Chart */}
                <div className="lg:col-span-1 flex flex-col rounded-xl bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark shadow-sm overflow-hidden">
                     <div className="p-6 border-b border-gray-100 dark:border-border-dark">
                         <h3 className="text-gray-900 dark:text-white text-lg font-bold">Asset Allocation</h3>
                     </div>
                     
                     <div className="p-6 flex-1 flex flex-col items-center justify-center min-h-[300px]">
                        {isLoading ? (
                            <div className="w-40 h-40 rounded-full border-4 border-gray-200 dark:border-white/10 border-t-primary animate-spin"></div>
                        ) : (
                            <>
                                <div className="relative w-full h-48">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={chartData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                                stroke="none"
                                            >
                                                {chartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip 
                                                formatter={(value: number) => formatCurrency(value)}
                                                contentStyle={{ backgroundColor: '#191B1C', borderColor: '#2E3335', color: '#fff', borderRadius: '8px' }}
                                                itemStyle={{ color: '#fff' }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    {/* Center Text */}
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Total</span>
                                        <span className="text-xl font-bold text-gray-900 dark:text-white">
                                            ${(totalAssets / 1000).toFixed(0)}k
                                        </span>
                                    </div>
                                </div>

                                {/* Custom Legend */}
                                <div className="grid grid-cols-2 gap-x-8 gap-y-4 w-full mt-6">
                                    {chartData.map((item) => (
                                        <div key={item.name} className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: item.color }}></div>
                                            <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">{item.name}</span>
                                            <span className="ml-auto text-sm font-bold text-gray-900 dark:text-white">
                                                {totalAssets > 0 ? ((item.value / totalAssets) * 100).toFixed(2) : '0.00'}%
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                     </div>
                </div>

                {/* Transactions Table */}
                <div className="lg:col-span-2 flex flex-col rounded-xl bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100 dark:border-border-dark flex justify-between items-center">
                        <h3 className="text-gray-900 dark:text-white text-lg font-bold">Recent Transactions</h3>
                        <button 
                            onClick={onNavigateToTransactions} 
                            className="text-primary text-sm font-semibold hover:underline"
                        >
                            View All
                        </button>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-border-dark">
                                    <th className="py-3 px-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                                    <th className="py-3 px-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
                                    <th className="py-3 px-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Asset</th>
                                    <th className="py-3 px-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-border-dark">
                                {isLoading ? (
                                    Array.from({ length: 5 }).map((_, index) => (
                                        <tr key={index} className="animate-pulse">
                                            <td className="py-4 px-6"><div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-24"></div></td>
                                            <td className="py-4 px-6"><div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-16"></div></td>
                                            <td className="py-4 px-6"><div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-20"></div></td>
                                            <td className="py-4 px-6"><div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-24 ml-auto"></div></td>
                                        </tr>
                                    ))
                                ) : (
                                    recentTransactions.map((tx) => (
                                        <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                            <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-300 font-medium">{tx.date}</td>
                                            <td className="py-4 px-6 text-sm font-semibold">
                                                <span className={`
                                                    ${tx.type === TransactionType.BUY ? 'text-green-600 dark:text-primary' : ''}
                                                    ${tx.type === TransactionType.SELL ? 'text-red-500 dark:text-red-400' : ''}
                                                    ${tx.type === TransactionType.DIVIDEND ? 'text-blue-500 dark:text-blue-400' : ''}
                                                    ${tx.type === TransactionType.DEPOSIT ? 'text-blue-500 dark:text-blue-400' : ''}
                                                    ${tx.type === TransactionType.WITHDRAWAL ? 'text-orange-500 dark:text-orange-400' : ''}
                                                `}>
                                                    {tx.type}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-sm text-gray-900 dark:text-white font-bold">{tx.assetSymbol}</td>
                                            <td className={`py-4 px-6 text-sm font-bold text-right text-gray-900 dark:text-white`}>
                                                {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
};
