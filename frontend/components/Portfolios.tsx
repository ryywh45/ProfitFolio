
import React, { useState, useEffect } from 'react';
import { PortfolioListItem, Account } from '../types';
import { fetchPortfolios, createPortfolio, updatePortfolio, deletePortfolio, fetchPortfolio, fetchAccounts } from '../services/api';

interface PortfoliosProps {
    onViewDetails: (id: string) => void;
}

export const Portfolios: React.FC<PortfoliosProps> = ({ onViewDetails }) => {
    const [portfolios, setPortfolios] = useState<PortfolioListItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [availableAccounts, setAvailableAccounts] = useState<Account[]>([]);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        accountIds: [] as string[]
    });

    const loadData = async () => {
        setIsLoading(true);
        try {
            const data = await fetchPortfolios();
            setPortfolios(data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
    };

    const handleOpenCreate = async () => {
        setEditingId(null);
        setFormData({ name: '', description: '', accountIds: [] });
        setIsModalOpen(true);
        // Fetch accounts for the multi-select
        try {
            const accounts = await fetchAccounts();
            setAvailableAccounts(accounts);
        } catch (e) {
            console.error("Failed to fetch accounts", e);
        }
    };

    const handleOpenEdit = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent navigating to details
        
        try {
            // Need to fetch details to get account IDs
            const details = await fetchPortfolio(id);
            setEditingId(id);
            setFormData({
                name: details.name,
                description: details.description || '',
                accountIds: details.accountIds
            });
            setIsModalOpen(true);
            
            const accounts = await fetchAccounts();
            setAvailableAccounts(accounts);
        } catch (error) {
            console.error("Failed to fetch portfolio details", error);
            alert("Could not load portfolio details.");
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this portfolio?')) {
            try {
                await deletePortfolio(id);
                loadData();
            } catch (error) {
                console.error(error);
                alert('Failed to delete portfolio.');
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                await updatePortfolio(editingId, {
                    name: formData.name,
                    description: formData.description,
                    accountIds: formData.accountIds
                });
            } else {
                await createPortfolio({
                    name: formData.name,
                    description: formData.description,
                    accountIds: formData.accountIds
                });
            }
            setIsModalOpen(false);
            loadData();
        } catch (error) {
            console.error(error);
            alert('Operation failed.');
        }
    };

    const toggleAccountSelection = (accountId: string) => {
        setFormData(prev => {
            if (prev.accountIds.includes(accountId)) {
                return { ...prev, accountIds: prev.accountIds.filter(id => id !== accountId) };
            } else {
                return { ...prev, accountIds: [...prev.accountIds, accountId] };
            }
        });
    };

    return (
        <div className="p-6 space-y-6 fade-in relative min-h-full pb-20">
            {/* Grid Layout */}
            {isLoading ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-48 rounded-xl bg-gray-200 dark:bg-white/5 animate-pulse"></div>
                    ))}
                 </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {portfolios.map((portfolio) => {
                        const isPositive = portfolio.dailyChange >= 0;
                        return (
                            <div 
                                key={portfolio.id} 
                                onClick={() => onViewDetails(portfolio.id)}
                                className="group flex flex-col gap-4 rounded-xl p-6 bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark shadow-sm hover:shadow-md hover:border-primary/50 transition-all duration-300 cursor-pointer relative"
                            >
                                <div className="flex justify-between items-start">
                                    <h3 className="text-gray-900 dark:text-white text-lg font-bold leading-tight group-hover:text-primary transition-colors">
                                        {portfolio.name}
                                    </h3>
                                    {/* Actions */}
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={(e) => handleOpenEdit(portfolio.id, e)}
                                            className="p-1.5 text-gray-500 hover:text-gray-900 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-white/10"
                                        >
                                            <span className="material-symbols-outlined text-lg">edit</span>
                                        </button>
                                        <button 
                                            onClick={(e) => handleDelete(portfolio.id, e)}
                                            className="p-1.5 text-gray-500 hover:text-red-500 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                                        >
                                            <span className="material-symbols-outlined text-lg">delete</span>
                                        </button>
                                    </div>
                                </div>
                                
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
                                                {isPositive ? '+' : ''}{formatCurrency(portfolio.dailyChange)} ({portfolio.dailyChangePercent.toFixed(2)}%)
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-auto pt-4 flex justify-end">
                                     <span className="text-xs font-bold text-primary flex items-center gap-1">
                                        View Details <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                     </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Floating Action Button */}
            <button 
                onClick={handleOpenCreate}
                className="fixed bottom-8 right-8 flex items-center justify-center w-14 h-14 rounded-full bg-primary text-background-dark shadow-lg hover:bg-green-400 hover:scale-105 transition-all duration-200 z-30 shadow-green-900/20"
            >
                <span className="material-symbols-outlined text-3xl">add</span>
            </button>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark w-full max-w-lg rounded-xl shadow-2xl p-6 transform transition-all max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                            {editingId ? 'Edit Portfolio' : 'New Portfolio'}
                        </h2>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Portfolio Name</label>
                                <input 
                                    type="text" 
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-black/20 border border-gray-300 dark:border-border-dark rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                                    placeholder="e.g. Retirement Fund"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                                <textarea 
                                    value={formData.description}
                                    onChange={e => setFormData({...formData, description: e.target.value})}
                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-black/20 border border-gray-300 dark:border-border-dark rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none min-h-[80px]"
                                    placeholder="Optional description..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Included Accounts</label>
                                <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 dark:border-border-dark rounded-lg p-3 bg-gray-50 dark:bg-black/20">
                                    {availableAccounts.length === 0 ? (
                                        <p className="text-sm text-gray-500">No accounts available.</p>
                                    ) : (
                                        availableAccounts.map(acc => (
                                            <div key={acc.id} className="flex items-center gap-3">
                                                <input 
                                                    type="checkbox"
                                                    id={`acc-${acc.id}`}
                                                    checked={formData.accountIds.includes(acc.id)}
                                                    onChange={() => toggleAccountSelection(acc.id)}
                                                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary bg-gray-100 dark:bg-gray-800 dark:border-gray-600"
                                                />
                                                <label htmlFor={`acc-${acc.id}`} className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none flex-1">
                                                    {acc.name} <span className="text-gray-500 text-xs">({acc.currency})</span>
                                                </label>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Select accounts to track in this portfolio.</p>
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
                                    {editingId ? 'Save Changes' : 'Create Portfolio'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
