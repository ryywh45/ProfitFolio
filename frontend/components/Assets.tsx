
import React, { useEffect, useState } from 'react';
import { AssetType, Asset } from '../types';
import { fetchAssets } from '../services/api';

export const Assets: React.FC = () => {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            const data = await fetchAssets();
            setAssets(data);
            setIsLoading(false);
        };

        loadData();
    }, []);

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
                                <th className="py-4 px-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ticker</th>
                                <th className="py-4 px-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                                <th className="py-4 px-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                                <th className="py-4 px-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Current Price</th>
                                <th className="py-4 px-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Updated</th>
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
