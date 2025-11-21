
import React from 'react';
import { TRANSACTIONS_DATA } from '../constants';
import { TransactionType } from '../types';

export const Transactions: React.FC = () => {
    
    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Math.abs(val));
    };

    const getBadgeStyles = (type: TransactionType) => {
        switch (type) {
            case TransactionType.BUY:
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case TransactionType.SELL:
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
            case TransactionType.DEPOSIT:
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            case TransactionType.WITHDRAWAL:
                return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
            case TransactionType.DIVIDEND:
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    };

    const getActionLabel = (type: TransactionType) => {
        switch (type) {
            case TransactionType.BUY: return '買入';
            case TransactionType.SELL: return '賣出';
            case TransactionType.DEPOSIT: return '存款';
            case TransactionType.WITHDRAWAL: return '提款';
            case TransactionType.DIVIDEND: return '股息';
            default: return type;
        }
    };

    return (
        <div className="p-6 space-y-6 fade-in pb-20">
            
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-4">
                {/* Search */}
                <div className="relative flex-grow min-w-[200px]">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">search</span>
                    <input 
                        type="text" 
                        placeholder="按資產名稱搜尋..." 
                        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    />
                </div>

                {/* Filters */}
                <select className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark rounded-lg px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none cursor-pointer">
                    <option>所有類型</option>
                    <option>買入</option>
                    <option>賣出</option>
                    <option>存款</option>
                    <option>提款</option>
                </select>
                
                <select className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark rounded-lg px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none cursor-pointer">
                    <option>所有帳戶</option>
                    <option>Firstrade</option>
                    <option>Binance</option>
                    <option>Cash</option>
                </select>

                {/* Date Picker Mock */}
                <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">calendar_today</span>
                    <input 
                        type="text" 
                        placeholder="選擇日期範圍" 
                        className="pl-10 pr-4 py-2.5 bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none w-[180px] cursor-pointer"
                    />
                </div>
            </div>

            {/* Data Table */}
            <div className="rounded-xl bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-border-dark">
                                <th className="py-4 px-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">日期</th>
                                <th className="py-4 px-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">帳戶</th>
                                <th className="py-4 px-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">類型</th>
                                <th className="py-4 px-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">資產</th>
                                <th className="py-4 px-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">數量</th>
                                <th className="py-4 px-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">單價</th>
                                <th className="py-4 px-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">總金額</th>
                                <th className="py-4 px-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">手續費</th>
                                <th className="py-4 px-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-border-dark">
                            {TRANSACTIONS_DATA.map((tx) => (
                                <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                    <td className="py-4 px-6 text-sm text-gray-900 dark:text-white whitespace-nowrap font-medium">{tx.date}</td>
                                    <td className="py-4 px-6 text-sm text-gray-900 dark:text-white">{tx.accountName}</td>
                                    <td className="py-4 px-6">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${getBadgeStyles(tx.type)}`}>
                                            {getActionLabel(tx.type)}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-sm font-bold text-gray-900 dark:text-white">{tx.assetSymbol}</td>
                                    <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-300 text-right font-mono">
                                        {tx.quantity !== null ? tx.quantity : '-'}
                                    </td>
                                    <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-300 text-right font-mono">
                                        {tx.pricePerUnit !== null ? formatCurrency(tx.pricePerUnit) : '-'}
                                    </td>
                                    <td className="py-4 px-6 text-sm text-right font-mono font-medium text-gray-900 dark:text-white">
                                        {tx.amount < 0 ? '-' : ''}{formatCurrency(tx.amount)}
                                    </td>
                                    <td className="py-4 px-6 text-sm text-gray-500 dark:text-gray-400 text-right font-mono">
                                        {formatCurrency(tx.fee)}
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        <div className="flex justify-center items-center gap-2">
                                            <button className="p-1.5 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                                                <span className="material-symbols-outlined text-[20px]">edit</span>
                                            </button>
                                            <button className="p-1.5 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors">
                                                <span className="material-symbols-outlined text-[20px]">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
