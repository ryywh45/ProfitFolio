
import React from 'react';
import { KPIS, ASSET_ALLOCATION_DATA, RECENT_TRANSACTIONS, ASSETS_DATA } from '../constants';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { TransactionType } from '../types';

export const Dashboard: React.FC = () => {
    
    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Math.abs(val));
    };

    const totalAssets = ASSET_ALLOCATION_DATA.reduce((acc, curr) => acc + curr.value, 0);

    // Helper to render the trend line matching Portfolios style
    const renderTrend = (amount: number, percent: number) => {
        const isPositive = percent >= 0;
        return (
            <div className="flex items-center gap-1 mt-2">
                <span className={`material-symbols-outlined text-lg ${isPositive ? 'text-green-600 dark:text-primary' : 'text-red-500 dark:text-red-400'}`}>
                    {isPositive ? 'arrow_upward' : 'arrow_downward'}
                </span>
                <p className={`text-lg font-semibold ${isPositive ? 'text-green-600 dark:text-primary' : 'text-red-500 dark:text-red-400'}`}>
                    {isPositive ? '+' : '-'}{formatCurrency(amount)} ({Math.abs(percent)}%)
                </p>
            </div>
        );
    };

    // Calculate implied amounts for display purposes
    const netWorthChangeAmount = KPIS.netWorth * (KPIS.netWorthChange / 100);
    // Assuming daily P/L is the same absolute amount as Net Worth change for consistency
    const totalProfitDailyChange = netWorthChangeAmount; 
    
    // Find Top Performer Price for calculation
    const topAsset = ASSETS_DATA.find(a => a.ticker === KPIS.topPerformerName);
    const topPerformerPrice = topAsset ? topAsset.currentPrice : 100;
    const topPerformerChangeAmount = topPerformerPrice * (KPIS.topPerformerChange / 100);

    return (
        <div className="p-4 md:p-6 space-y-6 fade-in pb-20">
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Net Worth */}
                <div className="flex flex-col gap-1 rounded-xl p-6 bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark shadow-sm hover:shadow-md transition-all duration-300">
                    <p className="text-gray-600 dark:text-gray-400 text-sm font-semibold uppercase tracking-wider">Net Worth</p>
                    <p className="text-gray-900 dark:text-white tracking-tight text-3xl font-bold leading-tight">
                        {formatCurrency(KPIS.netWorth)}
                    </p>
                    {renderTrend(netWorthChangeAmount, KPIS.netWorthChange)}
                </div>

                {/* Total Profit/Loss */}
                <div className="flex flex-col gap-1 rounded-xl p-6 bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark shadow-sm hover:shadow-md transition-all duration-300">
                    <p className="text-gray-600 dark:text-gray-400 text-sm font-semibold uppercase tracking-wider">Total Profit/Loss</p>
                    <p className="text-gray-900 dark:text-white tracking-tight text-3xl font-bold leading-tight">
                        +{formatCurrency(KPIS.totalProfit)}
                    </p>
                    {/* Showing Daily Change here to match the style request, although the main number is Total P/L */}
                    {renderTrend(totalProfitDailyChange, KPIS.netWorthChange)}
                </div>

                {/* Top Performer */}
                <div className="flex flex-col gap-1 rounded-xl p-6 bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark shadow-sm hover:shadow-md transition-all duration-300">
                    <p className="text-gray-600 dark:text-gray-400 text-sm font-semibold uppercase tracking-wider">Top Performer</p>
                    <p className="text-gray-900 dark:text-white tracking-tight text-3xl font-bold leading-tight">
                        {KPIS.topPerformerName}
                    </p>
                    {renderTrend(topPerformerChangeAmount, KPIS.topPerformerChange)}
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
                        <div className="relative w-full h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={ASSET_ALLOCATION_DATA as any}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {ASSET_ALLOCATION_DATA.map((entry, index) => (
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
                            {ASSET_ALLOCATION_DATA.map((item) => (
                                <div key={item.type} className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: item.color }}></div>
                                    <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">{item.type}</span>
                                    <span className="ml-auto text-sm font-bold text-gray-900 dark:text-white">
                                        {Math.round((item.value / totalAssets) * 100)}%
                                    </span>
                                </div>
                            ))}
                        </div>
                     </div>
                </div>

                {/* Transactions Table */}
                <div className="lg:col-span-2 flex flex-col rounded-xl bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100 dark:border-border-dark flex justify-between items-center">
                        <h3 className="text-gray-900 dark:text-white text-lg font-bold">Recent Transactions</h3>
                        <button className="text-primary text-sm font-semibold hover:underline">View All</button>
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
                                {RECENT_TRANSACTIONS.map((tx) => (
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
                                            {tx.amount > 0 ? '+' : '-'}{formatCurrency(tx.amount)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
};
