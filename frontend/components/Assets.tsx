import React, { useEffect, useState } from 'react';
import { AssetType, Asset, Currency } from '../types';
import { fetchAssets, createAsset, updateAsset, deleteAsset, validateAsset, updateAllAssetPrices } from '../services/api';

export const Assets: React.FC = () => {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
    
    // Validation State for Create Mode
    const [isValidating, setIsValidating] = useState(false);
    const [hasValidated, setHasValidated] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        ticker: '',
        name: '',
        type: AssetType.STOCK,
        currency: Currency.USD,
        currentPrice: ''
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

    const handleRefreshPrices = async () => {
        setIsRefreshing(true);
        try {
            await updateAllAssetPrices();
            // Wait a moment for DB propagation if needed, then reload
            await loadData();
        } catch (error) {
            console.error(error);
            alert('Failed to update prices. Check backend connection.');
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleOpenCreate = () => {
        setEditingAsset(null);
        setHasValidated(false);
        setValidationError(null);
        setFormData({ ticker: '', name: '', type: AssetType.STOCK, currency: Currency.USD, currentPrice: '' });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (asset: Asset) => {
        setEditingAsset(asset);
        // Edit mode skips validation step UI
        setHasValidated(true); 
        setValidationError(null);
        setFormData({
            ticker: asset.ticker,
            name: asset.name,
            type: asset.type,
            currency: asset.currency,
            currentPrice: asset.currentPrice.toString()
        });
        setIsModalOpen(true);
    };

    const validateTicker = async () => {
        if (!formData.ticker) return;
        
        setIsValidating(true);
        setValidationError(null);
        
        try {
            const result = await validateAsset(formData.ticker);
            if (result.valid) {
                // Auto-fill form
                let mappedType = AssetType.STOCK;
                if (result.type) {
                     // Simple mapping from API string to Enum
                     const t = result.type.toLowerCase();
                     if (t === 'crypto') mappedType = AssetType.CRYPTO;
                     else if (t === 'etf') mappedType = AssetType.ETF;
                     else if (t === 'fiat') mappedType = AssetType.FIAT;
                }

                setFormData({
                    ...formData,
                    name: result.name,
                    currency: result.currency === 'TWD' ? Currency.TWD : Currency.USD,
                    currentPrice: result.current_price,
                    type: mappedType
                });
                setHasValidated(true);
            } else {
                setValidationError('Invalid ticker. Please check and try again.');
                setHasValidated(false);
            }
        } catch (error) {
            console.error(error);
            setValidationError('Validation failed. Service may be unavailable.');
            setHasValidated(false);
        } finally {
            setIsValidating(false);
        }
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
                    currency: formData.currency,
                    currentPrice: formData.currentPrice ? parseFloat(formData.currentPrice) : undefined
                });
            } else {
                // Create
                await createAsset({
                    ticker: formData.ticker,
                    name: formData.name,
                    type: formData.type,
                    currency: formData.currency
                });
            }
            setIsModalOpen(false);
            loadData();
        } catch (error) {
            console.error(error);
            alert('Operation failed. Check if backend is running at localhost:8000');
        }
    };

    const formatCurrency = (val: number, curr: Currency) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: curr }).format(val);
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
            
            {/* Header / Actions */}
            <div className="flex justify-between items-center">
                 <h2 className="text-xl font-bold text-gray-900 dark:text-white hidden md:block">All Assets</h2>
                 <div className="flex gap-3 ml-auto">
                    {/* Refresh Prices Button */}
                    <button 
                        onClick={handleRefreshPrices}
                        disabled={isRefreshing}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-all shadow-sm disabled:opacity-50"
                    >
                        <span className={`material-symbols-outlined ${isRefreshing ? 'animate-spin' : ''}`}>
                            {isRefreshing ? 'sync' : 'sync'}
                        </span>
                        <span className="font-medium text-sm hidden sm:inline">Refresh Prices</span>
                    </button>
                    
                    {/* New Asset Button (Desktop) */}
                    <button 
                        onClick={handleOpenCreate}
                        className="hidden md:flex items-center gap-2 px-4 py-2 bg-primary text-background-dark font-bold rounded-lg hover:bg-green-400 transition-colors shadow-lg shadow-green-900/20"
                    >
                        <span className="material-symbols-outlined">add</span>
                        New Asset
                    </button>
                 </div>
            </div>

            {/* Asset List Container */}
            <div className="rounded-xl bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark overflow-hidden shadow-sm">
                
                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-border-dark">
                                <th className="py-4 px-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ticker</th>
                                <th className="py-4 px-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                                <th className="py-4 px-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                                <th className="py-4 px-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">幣別</th>
                                <th className="py-4 px-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Current Price</th>
                                <th className="py-4 px-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Updated</th>
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
                                        <td className="py-4 px-6"><div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-10"></div></td>
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
                                        <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-300 font-medium">{asset.currency}</td>
                                        <td className="py-4 px-6 text-sm font-bold text-gray-900 dark:text-white text-right font-mono">
                                            {formatCurrency(asset.currentPrice, asset.currency)}
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

            {/* Mobile Floating Action Button */}
            <button 
                onClick={handleOpenCreate}
                className="md:hidden fixed bottom-8 right-8 flex items-center justify-center w-14 h-14 rounded-full bg-primary text-background-dark shadow-lg hover:bg-green-400 hover:scale-105 transition-all duration-200 z-30 shadow-green-900/20"
            >
                <span className="material-symbols-outlined text-3xl">add</span>
            </button>

            {/* Modal Overlay */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark w-full max-w-md rounded-xl shadow-2xl p-6 transform transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {editingAsset ? 'Edit Asset' : 'New Asset'}
                            </h2>
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-200"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Step 1: Ticker Input with Validation */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ticker Symbol</label>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        required
                                        autoFocus={!editingAsset}
                                        value={formData.ticker}
                                        onChange={e => {
                                            setFormData({...formData, ticker: e.target.value.toUpperCase()});
                                            if (!editingAsset) setHasValidated(false); // Reset validation if changed in create mode
                                        }}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter' && !editingAsset) {
                                                e.preventDefault();
                                                validateTicker();
                                            }
                                        }}
                                        className="flex-1 px-3 py-2 bg-gray-50 dark:bg-black/20 border border-gray-300 dark:border-border-dark rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none font-mono uppercase"
                                        placeholder="e.g. BTC"
                                    />
                                    {!editingAsset && (
                                        <button 
                                            type="button"
                                            onClick={validateTicker}
                                            disabled={isValidating || !formData.ticker}
                                            className="px-3 py-2 bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-white/20 transition-colors flex items-center gap-1 disabled:opacity-50"
                                        >
                                            {isValidating ? (
                                                <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                                            ) : (
                                                <span className="material-symbols-outlined text-sm">check</span>
                                            )}
                                            <span className="text-sm font-bold">Check</span>
                                        </button>
                                    )}
                                </div>
                                {validationError && (
                                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm">error</span>
                                        {validationError}
                                    </p>
                                )}
                            </div>

                            {/* Step 2: Auto-filled / Editable Details */}
                            {/* Only show these fields if asset is being edited OR if ticker is validated */}
                            {(hasValidated || editingAsset) && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Asset Name</label>
                                        <input 
                                            type="text" 
                                            required
                                            value={formData.name}
                                            onChange={e => setFormData({...formData, name: e.target.value})}
                                            className="w-full px-3 py-2 bg-gray-50 dark:bg-black/20 border border-gray-300 dark:border-border-dark rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                                            <select 
                                                value={formData.type}
                                                onChange={e => setFormData({...formData, type: e.target.value as AssetType})}
                                                className="w-full px-3 py-2 bg-gray-50 dark:bg-black/20 border border-gray-300 dark:border-border-dark rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                                            >
                                                {Object.values(AssetType).map(t => (
                                                    <option key={t} value={t}>{t}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Currency</label>
                                            <select 
                                                value={formData.currency}
                                                onChange={e => setFormData({...formData, currency: e.target.value as Currency})}
                                                className="w-full px-3 py-2 bg-gray-50 dark:bg-black/20 border border-gray-300 dark:border-border-dark rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                                            >
                                                <option value={Currency.USD}>USD</option>
                                                <option value={Currency.TWD}>TWD</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end gap-3 mt-6 pt-2 border-t border-gray-100 dark:border-border-dark">
                                <button 
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    disabled={!hasValidated && !editingAsset}
                                    className="px-4 py-2 text-sm font-bold text-background-dark bg-primary hover:bg-green-400 rounded-lg transition-colors shadow-lg shadow-green-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
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