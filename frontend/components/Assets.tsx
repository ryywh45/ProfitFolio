
import React, { useEffect, useState } from 'react';
import { AssetType, Asset } from '../types';
import { fetchAssets, createAsset, updateAsset, deleteAsset } from '../services/api';

export const Assets: React.FC = () => {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
    const [formData, setFormData] = useState({
        ticker: '',
        name: '',
        type: AssetType.STOCK,
        currentPrice: '' // Only for edit display/update if needed
    });

    const loadData = async () => {
        setIsLoading(true);
        const data = await fetchAssets();
        setAssets(data);
        setIsLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleOpenCreate = () => {
        setEditingAsset(null);
        setFormData({ ticker: '', name: '', type: AssetType.STOCK, currentPrice: '' });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (asset: Asset) => {
        setEditingAsset(asset);
        setFormData({
            ticker: asset.ticker,
            name: asset.name,
            type: asset.type,
            currentPrice: asset.currentPrice.toString()
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this asset?')) {
            try {
                await deleteAsset(id);
                loadData();
            } catch (error) {
                console.error(error);
                alert('Failed to delete asset (Backend might not be running)');
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingAsset) {
                // Update
                await updateAsset(editingAsset.id, {
                    ticker: formData.ticker,
                    name: formData.name,
                    type: formData.type,
                    // If user edited price, send it, otherwise undefined
                    currentPrice: formData.currentPrice ? parseFloat(formData.currentPrice) : undefined
                });
            } else {
                // Create
                await createAsset({
                    ticker: formData.ticker,
                    name: formData.name,
                    type: formData.type
                });
            }
            setIsModalOpen(false);
            loadData();
        } catch (error) {
            console.error(error);
            alert('Operation failed. Check if backend is running at localhost:8000');
        }
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
    };

    const getBadgeStyles = (type: AssetType) => {
        switch (type) {
            case AssetType.CRYPTO:
                return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
            case AssetType.STOCK:
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case AssetType.ETF:
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case AssetType.FIAT:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    };

    return (
        <div className="p-6 space-y-6 fade-in pb-20">
            
            {/* Asset List Container */}
            <div className="rounded-xl bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark overflow-hidden shadow-sm">
                
                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-border-dark">
                                <th className="py-4 px-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">代號</th>
                                <th className="py-4 px-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">名稱</th>
                                <th className="py-4 px-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">類型</th>
                                <th className="py-4 px-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">當前價格</th>
                                <th className="py-4 px-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">更新時間</th>
                                <th className="py-4 px-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-border-dark">
                            {isLoading ? (
                                // Loading Skeleton
                                Array.from({ length: 5 }).map((_, index) => (
                                    <tr key={index} className="animate-pulse">
                                        <td className="py-4 px-6"><div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-12"></div></td>
                                        <td className="py-4 px-6"><div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-32"></div></td>
                                        <td className="py-4 px-6"><div className="h-5 bg-gray-200 dark:bg-white/10 rounded-full w-16"></div></td>
                                        <td className="py-4 px-6 text-right"><div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-20 ml-auto"></div></td>
                                        <td className="py-4 px-6"><div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-24"></div></td>
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
                                assets.map((asset) => (
                                    <tr key={asset.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                        <td className="py-4 px-6 text-sm font-bold text-gray-900 dark:text-white font-mono">{asset.ticker}</td>
                                        <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-300 font-medium">{asset.name}</td>
                                        <td className="py-4 px-6">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${getBadgeStyles(asset.type)}`}>
                                                {asset.type}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-sm font-bold text-gray-900 dark:text-white text-right font-mono">
                                            {formatCurrency(asset.currentPrice)}
                                        </td>
                                        <td className="py-4 px-6 text-sm text-gray-500 dark:text-gray-400">
                                            {asset.lastUpdated}
                                        </td>
                                        <td className="py-4 px-6 text-sm text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => handleOpenEdit(asset)}
                                                    className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-lg">edit</span>
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(asset.id)}
                                                    className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-full transition-colors"
                                                >
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
            <button 
                onClick={handleOpenCreate}
                className="fixed bottom-8 right-8 flex items-center justify-center w-14 h-14 rounded-full bg-primary text-background-dark shadow-lg hover:bg-green-400 hover:scale-105 transition-all duration-200 z-30 shadow-green-900/20"
            >
                <span className="material-symbols-outlined text-3xl">add</span>
            </button>

            {/* Modal Overlay */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark w-full max-w-md rounded-xl shadow-2xl p-6 transform transition-all">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                            {editingAsset ? 'Edit Asset' : 'New Asset'}
                        </h2>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ticker</label>
                                <input 
                                    type="text" 
                                    required
                                    value={formData.ticker}
                                    onChange={e => setFormData({...formData, ticker: e.target.value.toUpperCase()})}
                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-black/20 border border-gray-300 dark:border-border-dark rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                                    placeholder="e.g. BTC"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                                <input 
                                    type="text" 
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-black/20 border border-gray-300 dark:border-border-dark rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                                    placeholder="e.g. Bitcoin"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                                <select 
                                    value={formData.type}
                                    onChange={e => setFormData({...formData, type: e.target.value as AssetType})}
                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-black/20 border border-gray-300 dark:border-border-dark rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                                >
                                    {Object.values(AssetType).map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Only show price editing if updating, creating usually fetches price automatically */}
                            {editingAsset && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price (Optional Override)</label>
                                    <input 
                                        type="number" 
                                        step="0.01"
                                        value={formData.currentPrice}
                                        onChange={e => setFormData({...formData, currentPrice: e.target.value})}
                                        className="w-full px-3 py-2 bg-gray-50 dark:bg-black/20 border border-gray-300 dark:border-border-dark rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                                        placeholder="Leave empty to keep current"
                                    />
                                </div>
                            )}

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
                                    {editingAsset ? 'Save Changes' : 'Create Asset'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};