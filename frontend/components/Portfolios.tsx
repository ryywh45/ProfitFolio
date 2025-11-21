
import React from 'react';
import { PORTFOLIOS_DATA } from '../constants';

export const Portfolios: React.FC = () => {
    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
    };

    return (
        <div className="p-6 space-y-6 fade-in relative min-h-full pb-20">
            {/* Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {PORTFOLIOS_DATA.map((portfolio) => {
                    const isPositive = portfolio.dailyChange >= 0;
                    return (
                        <div 
                            key={portfolio.id} 
                            className="flex flex-col gap-4 rounded-xl p-6 bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark shadow-sm hover:shadow-md transition-all duration-300"
                        >
                            <h3 className="text-gray-900 dark:text-white text-lg font-bold leading-tight">
                                {portfolio.name}
                            </h3>
                            
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">總市值</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                                        {formatCurrency(portfolio.totalValue)}
                                    </p>
                                </div>
                                
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">今日損益</p>
                                    <div className="flex items-center gap-1">
                                        <span className={`material-symbols-outlined text-lg ${isPositive ? 'text-green-600 dark:text-primary' : 'text-red-500 dark:text-red-400'}`}>
                                            {isPositive ? 'arrow_upward' : 'arrow_downward'}
                                        </span>
                                        <p className={`text-lg font-semibold ${isPositive ? 'text-green-600 dark:text-primary' : 'text-red-500 dark:text-red-400'}`}>
                                            {isPositive ? '+' : ''}{formatCurrency(portfolio.dailyChange)} ({portfolio.dailyChangePercent}%)
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <button className="mt-auto w-full flex items-center justify-center rounded-lg h-10 px-4 bg-primary/10 dark:bg-primary/10 text-green-700 dark:text-primary text-sm font-bold hover:bg-primary/20 dark:hover:bg-primary/20 transition-colors">
                                View Details
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Floating Action Button */}
            <button className="fixed bottom-8 right-8 flex items-center justify-center w-14 h-14 rounded-full bg-primary text-background-dark shadow-lg hover:bg-green-400 hover:scale-105 transition-all duration-200 z-30 shadow-green-900/20">
                <span className="material-symbols-outlined text-3xl">add</span>
            </button>
        </div>
    );
};
