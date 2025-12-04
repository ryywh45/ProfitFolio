
import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { PortfolioSummary } from '../types';
import { fetchPortfolioSummary } from '../services/api';

interface PortfolioDetailsProps {
    portfolioId: string;
    onBack: () => void;
}

export const PortfolioDetails: React.FC<PortfolioDetailsProps> = ({ portfolioId, onBack }) => {
    const [data, setData] = useState<PortfolioSummary | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadSummary = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const summary = await fetchPortfolioSummary(portfolioId);
                setData(summary);
            } catch (err) {
                console.error(err);
                setError("Failed to load portfolio data.");
            } finally {
                setIsLoading(false);
            }
        };

        if (portfolioId) {
            loadSummary();
        }
    }, [portfolioId]);
    
    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Math.abs(val));
    };

    const renderTrend = (amount: number, percent: number) => {
        const isPositive = percent >= 0;
        return (
            <div className="flex items-baseline gap-2">
                <p className={`text-3xl font-bold tracking-tight ${isPositive ? 'text-green-500 dark:text-[#0bda46]' : 'text-red-500'}`}>
                    {isPositive ? '+' : '-'}{formatCurrency(amount)}
                </p>
                <p className={`text-base font-semibold ${isPositive ? 'text-green-500 dark:text-[#0bda46]' : 'text-red-500'}`}>
                    ({isPositive ? '+' : ''}{percent.toFixed(2)}%)
                </p>
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="p-6 flex flex-col items-center justify-center h-full space-y-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500">Loading portfolio data...</p>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="p-6 flex flex-col items-center justify-center h-full space-y-4">
                <span className="material-symbols-outlined text-4xl text-red-500">error</span>
                <p className="text-gray-500">{error || "Portfolio not found"}</p>
                <button onClick={onBack} className="text-primary hover:underline">Go Back</button>
            </div>
        );
    }

    // Chart Data Preparation
    const chartData = data.holdings.map(h => ({
        name: h.ticker,
        value: h.marketValue,
        color: h.color
    }));

    return (
        <div className="flex flex-col h-full bg-background-light dark:bg-background-dark font-sans fade-in">
            {/* Header Override for Breadcrumbs */}
            <div className="sticky top-0 z-20 flex h-16 items-center justify-between gap-2 border-b border-gray-200 dark:border-border-dark bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md px-6 transition-colors duration-300">
                <div className="flex items-center gap-2">
                   <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <button onClick={onBack} className="hover:underline hover:text-primary transition-colors">Portfolios</button>
                        <span className="material-symbols-outlined mx-1 text-base">chevron_right</span>
                        <span className="font-medium text-gray-800 dark:text-white">{data.name}</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        {/* Placeholder actions */}
                        <button className="flex items-center justify-center gap-2 rounded-lg h-9 px-4 text-sm font-bold bg-gray-200 dark:bg-white/10 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-white/20 transition-colors">
                            <span className="material-symbols-outlined text-[18px]">settings</span>
                            <span>Settings</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-6 pb-20 overflow-y-auto">
                {/* KPIs */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark">
                        <p className="text-sm text-gray-500 dark:text-gray-400">總淨值</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{formatCurrency(data.totalValue)}</p>
                    </div>
                    <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark">
                        <p className="text-sm text-gray-500 dark:text-gray-400">總損益</p>
                        {renderTrend(data.totalProfit, data.totalProfitPercent)}
                    </div>
                    <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark">
                        <p className="text-sm text-gray-500 dark:text-gray-400">今日損益</p>
                        {renderTrend(data.dailyChange, data.dailyChangePercent)}
                    </div>
                </div>

                <div className="flex flex-col xl:flex-row gap-6">
                    {/* Holdings Table */}
                    <div className="xl:w-8/12 w-full">
                        <div className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark rounded-xl overflow-hidden shadow-sm">
                            <div className="p-6 border-b border-gray-100 dark:border-border-dark">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">持倉列表</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-white/5 dark:text-gray-300">
                                        <tr>
                                            <th className="px-6 py-4 font-bold">資產</th>
                                            <th className="px-6 py-4 font-bold text-right">最新單價</th>
                                            <th className="px-6 py-4 font-bold text-right">持倉數量</th>
                                            <th className="px-6 py-4 font-bold text-right">平均成本</th>
                                            <th className="px-6 py-4 font-bold text-right">市值</th>
                                            <th className="px-6 py-4 font-bold text-right">損益</th>
                                            <th className="px-6 py-4 font-bold">佔比</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-border-dark">
                                        {data.holdings.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                                    此投資組合尚未有任何持倉數據。請先在交易紀錄中新增關聯帳戶的交易。
                                                </td>
                                            </tr>
                                        ) : (
                                            data.holdings.map((holding) => (
                                                <tr key={holding.id} className="bg-white dark:bg-surface-dark hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="font-bold text-gray-900 dark:text-white text-base">{holding.ticker}</div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">{holding.name}</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-medium text-gray-900 dark:text-white font-mono">{formatCurrency(holding.currentPrice)}</td>
                                                    <td className="px-6 py-4 text-right font-mono">{holding.quantity}</td>
                                                    <td className="px-6 py-4 text-right font-mono">{formatCurrency(holding.averageCost)}</td>
                                                    <td className="px-6 py-4 text-right font-medium text-gray-900 dark:text-white font-mono">{formatCurrency(holding.marketValue)}</td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className={`font-medium flex flex-col items-end ${holding.profit >= 0 ? 'text-green-500 dark:text-[#0bda46]' : 'text-red-500'}`}>
                                                            <span>{holding.profit >= 0 ? '+' : '-'}{formatCurrency(holding.profit)}</span>
                                                            <span className="text-xs">({holding.profit >= 0 ? '+' : ''}{holding.profitPercent.toFixed(2)}%)</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700 min-w-[60px]">
                                                                <div className="h-1.5 rounded-full" style={{ width: `${holding.allocation}%`, backgroundColor: holding.color }}></div>
                                                            </div>
                                                            <span className="font-medium text-gray-900 dark:text-white text-xs w-12 text-right">{holding.allocation.toFixed(2)}%</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Chart & Accounts */}
                    <div className="xl:w-4/12 w-full flex flex-col gap-6">
                        {/* Allocation Chart */}
                        <div className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark rounded-xl p-6 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">配置</h3>
                            <div className="relative flex items-center justify-center h-48">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={chartData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={2}
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
                                            wrapperStyle={{ zIndex: 1000 }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute flex flex-col items-center pointer-events-none">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">總市值</span>
                                    <span className="text-2xl font-bold text-gray-900 dark:text-white">${(data.totalValue / 1000).toFixed(1)}k</span>
                                </div>
                            </div>
                            <div className="mt-4 space-y-3 text-sm max-h-60 overflow-y-auto">
                                {data.holdings.map(h => (
                                    <div key={h.ticker} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="size-2.5 rounded-full" style={{ backgroundColor: h.color }}></span>
                                            <span className="text-gray-700 dark:text-gray-300 font-medium">{h.ticker}</span>
                                        </div>
                                        <span className="font-medium text-gray-900 dark:text-white">{h.allocation.toFixed(2)}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Connected Accounts */}
                        <div className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark rounded-xl p-6 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">關聯帳戶</h3>
                            {data.accounts.length === 0 ? (
                                <p className="text-gray-500 text-sm">此投資組合尚未連結任何帳戶。</p>
                            ) : (
                                <ul className="space-y-4">
                                    {data.accounts.map(acc => (
                                        <li key={acc.id} className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-white/5 last:border-0 last:pb-0">
                                            <div>
                                                <p className="font-bold text-gray-900 dark:text-white">{acc.name}</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">{acc.type}</p>
                                            </div>
                                            <p className="font-semibold text-gray-900 dark:text-white font-mono">{formatCurrency(acc.balance)}</p>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
