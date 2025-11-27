import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType, Account, Asset } from '../types';
import { fetchTransactions, fetchAccounts, fetchAssets, createTransaction, updateTransaction, deleteTransaction } from '../services/api';

export const Transactions: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [assets, setAssets] = useState<Asset[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTx, setEditingTx] = useState<Transaction | null>(null);
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        accountId: '',
        type: TransactionType.BUY,
        assetId: '',
        quantity: '',
        pricePerUnit: '',
        fee: '',
        notes: ''
    });

    const loadData = async () => {
        setIsLoading(true);
        const [txData, accData, assetData] = await Promise.all([
            fetchTransactions(),
            fetchAccounts(),
            fetchAssets()
        ]);
        setTransactions(txData);
        setAccounts(accData);
        setAssets(assetData);
        setIsLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

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

    const handleOpenCreate = () => {
        setEditingTx(null);
        setFormData({
            date: new Date().toISOString().split('T')[0],
            accountId: accounts.length > 0 ? accounts[0].id : '',
            type: TransactionType.BUY,
            assetId: '',
            quantity: '',
            pricePerUnit: '',
            fee: '',
            notes: ''
        });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (tx: Transaction) => {
        setEditingTx(tx);
        setFormData({
            date: tx.date,
            accountId: tx.accountId,
            type: tx.type,
            assetId: tx.assetId || '',
            quantity: tx.quantity ? tx.quantity.toString() : '',
            pricePerUnit: tx.pricePerUnit ? tx.pricePerUnit.toString() : '',
            fee: tx.fee.toString(),
            notes: tx.notes || ''
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this transaction?')) {
            try {
                await deleteTransaction(id);
                loadData();
            } catch (error) {
                console.error(error);
                alert('Failed to delete transaction (Backend might not be running)');
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                date: formData.date,
                accountId: formData.accountId,
                type: formData.type,
                assetId: formData.assetId || null,
                quantity: formData.quantity ? parseFloat(formData.quantity) : null,
                pricePerUnit: formData.pricePerUnit ? parseFloat(formData.pricePerUnit) : null,
                fee: formData.fee ? parseFloat(formData.fee) : 0,
                notes: formData.notes
            };

            if (editingTx) {
                await updateTransaction(editingTx.id, payload);
            } else {
                if (!payload.accountId) {
                    alert('Please select an account');
                    return;
                }
                await createTransaction(payload as any);
            }
            setIsModalOpen(false);
            loadData();
        } catch (error) {
            console.error(error);
            alert('Operation failed. Check backend.');
        }
    };

    return (
        <div className="p-6 space-y-6 fade-in pb-20 relative min-h-full">
            
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
                    {accounts.map(acc => (
                        <option key={acc.id} value={acc.id}>{acc.name}</option>
                    ))}
                </select>

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
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="py-4 px-6"><div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-24"></div></td>
                                        <td className="py-4 px-6"><div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-24"></div></td>
                                        <td className="py-4 px-6"><div className="h-5 bg-gray-200 dark:bg-white/10 rounded-full w-16"></div></td>
                                        <td className="py-4 px-6"><div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-16"></div></td>
                                        <td className="py-4 px-6"><div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-16 ml-auto"></div></td>
                                        <td className="py-4 px-6"><div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-16 ml-auto"></div></td>
                                        <td className="py-4 px-6"><div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-20 ml-auto"></div></td>
                                        <td className="py-4 px-6"><div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-12 ml-auto"></div></td>
                                        <td className="py-4 px-6"><div className="h-8 w-16 bg-gray-200 dark:bg-white/10 rounded mx-auto"></div></td>
                                    </tr>
                                ))
                            ) : (
                                transactions.map((tx) => (
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
                                        {/* Total Amount = Quantity * Price Per Unit, regardless of transaction type sign for display */}
                                        <td className="py-4 px-6 text-sm text-right font-mono font-medium text-gray-900 dark:text-white">
                                            {formatCurrency(tx.amount)}
                                        </td>
                                        <td className="py-4 px-6 text-sm text-gray-500 dark:text-gray-400 text-right font-mono">
                                            {formatCurrency(tx.fee)}
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <div className="flex justify-center items-center gap-2">
                                                <button 
                                                    onClick={() => handleOpenEdit(tx)}
                                                    className="p-1.5 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">edit</span>
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(tx.id)}
                                                    className="p-1.5 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">delete</span>
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
            <button 
                onClick={handleOpenCreate}
                className="fixed bottom-8 right-8 flex items-center justify-center w-14 h-14 rounded-full bg-primary text-background-dark shadow-lg hover:bg-green-400 hover:scale-105 transition-all duration-200 z-30 shadow-green-900/20"
            >
                <span className="material-symbols-outlined text-3xl">add</span>
            </button>

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark w-full max-w-lg rounded-xl shadow-2xl p-6 transform transition-all overflow-y-auto max-h-[90vh]">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                            {editingTx ? 'Edit Transaction' : 'New Transaction'}
                        </h2>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                                    <input 
                                        type="date" 
                                        required
                                        value={formData.date}
                                        onChange={e => setFormData({...formData, date: e.target.value})}
                                        className="w-full px-3 py-2 bg-gray-50 dark:bg-black/20 border border-gray-300 dark:border-border-dark rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                                    <select 
                                        value={formData.type}
                                        onChange={e => setFormData({...formData, type: e.target.value as TransactionType})}
                                        className="w-full px-3 py-2 bg-gray-50 dark:bg-black/20 border border-gray-300 dark:border-border-dark rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                                    >
                                        {Object.values(TransactionType).map(t => (
                                            <option key={t} value={t}>{getActionLabel(t)}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account</label>
                                <select 
                                    required
                                    value={formData.accountId}
                                    onChange={e => setFormData({...formData, accountId: e.target.value})}
                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-black/20 border border-gray-300 dark:border-border-dark rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                                >
                                    <option value="">Select Account</option>
                                    {accounts.map(acc => (
                                        <option key={acc.id} value={acc.id}>{acc.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Asset (Optional)</label>
                                <select 
                                    value={formData.assetId}
                                    onChange={e => setFormData({...formData, assetId: e.target.value})}
                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-black/20 border border-gray-300 dark:border-border-dark rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                                >
                                    <option value="">Select Asset</option>
                                    {assets.map(asset => (
                                        <option key={asset.id} value={asset.id}>{asset.ticker} - {asset.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantity</label>
                                    <input 
                                        type="number" 
                                        step="any"
                                        value={formData.quantity}
                                        onChange={e => setFormData({...formData, quantity: e.target.value})}
                                        className="w-full px-3 py-2 bg-gray-50 dark:bg-black/20 border border-gray-300 dark:border-border-dark rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price Per Unit</label>
                                    <input 
                                        type="number" 
                                        step="any"
                                        value={formData.pricePerUnit}
                                        onChange={e => setFormData({...formData, pricePerUnit: e.target.value})}
                                        className="w-full px-3 py-2 bg-gray-50 dark:bg-black/20 border border-gray-300 dark:border-border-dark rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                             <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fee</label>
                                <input 
                                    type="number" 
                                    step="any"
                                    value={formData.fee}
                                    onChange={e => setFormData({...formData, fee: e.target.value})}
                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-black/20 border border-gray-300 dark:border-border-dark rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                                    placeholder="0.00"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                                <textarea 
                                    value={formData.notes}
                                    onChange={e => setFormData({...formData, notes: e.target.value})}
                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-black/20 border border-gray-300 dark:border-border-dark rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none min-h-[80px]"
                                    placeholder="Optional notes..."
                                />
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button 
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="px-4 py-2 text-sm font-bold text-background-dark bg-primary hover:bg-green-400 rounded-lg transition-colors shadow-lg shadow-green-900/20"
                                >
                                    {editingTx ? 'Save Changes' : 'Create Transaction'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};