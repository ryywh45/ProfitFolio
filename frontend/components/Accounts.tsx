
import React, { useState, useEffect } from 'react';
import { Account, Currency } from '../types';
import { fetchAccounts } from '../services/api';

export const Accounts: React.FC = () => {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            const data = await fetchAccounts();
            setAccounts(data);
            setIsLoading(false);
        };

        loadData();
    }, []);
    
    const formatBalance = (amount: number, currency: Currency) => {
        if (currency === Currency.TWD) {
            return `NT$ ${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(amount)}`;
        }
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };

    return (
        <div className="p-6 space-y-6 fade-in pb-20 relative min-h-full">
            
            {/* Accounts Table */}
            <div className="rounded-xl bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-border-dark">
                                <th className="py-4 px-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">帳戶名稱</th>
                                <th className="py-4 px-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">幣別</th>
                                <th className="py-4 px-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">目前餘額</th>
                                <th className="py-4 px-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">最後更新</th>
                                <th className="py-4 px-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-border-dark">
                            {isLoading ? (
                                // Loading Skeleton
                                Array.from({ length: 5 }).map((_, index) => (
                                    <tr key={index} className="animate-pulse">
                                        <td className="py-4 px-6"><div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-32"></div></td>
                                        <td className="py-4 px-6"><div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-12"></div></td>
                                        <td className="py-4 px-6"><div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-24"></div></td>
                                        <td className="py-4 px-6"><div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-40"></div></td>
                                        <td className="py-4 px-6">
                                            <div className="flex justify-end gap-2">
                                                <div className="h-8 w-8 bg-gray-200 dark:bg-white/10 rounded-full"></div>
                                                <div className="h-8 w-8 bg-gray-200 dark:bg-white/10 rounded-full"></div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                // Actual Data
                                accounts.map((account) => (
                                    <tr key={account.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                        <td className="py-4 px-6 text-sm font-bold text-gray-900 dark:text-white">
                                            {account.name}
                                        </td>
                                        <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-300 font-medium">
                                            {account.currency}
                                        </td>
                                        <td className="py-4 px-6 text-sm text-gray-900 dark:text-white font-mono font-medium tracking-wide">
                                            {formatBalance(account.balance, account.currency)}
                                        </td>
                                        <td className="py-4 px-6 text-sm text-gray-500 dark:text-gray-400">
                                            {account.lastUpdated}
                                        </td>
                                        <td className="py-4 px-6 text-sm text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors">
                                                    <span className="material-symbols-outlined text-lg">edit</span>
                                                </button>
                                                <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-full transition-colors">
                                                    <span className="material-symbols-outlined text-lg">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Floating Action Button */}
            <button className="fixed bottom-8 right-8 flex items-center justify-center w-14 h-14 rounded-full bg-primary text-background-dark shadow-lg hover:bg-green-400 hover:scale-105 transition-all duration-200 z-30 shadow-green-900/20">
                <span className="material-symbols-outlined text-3xl">add</span>
            </button>
        </div>
    );
};
