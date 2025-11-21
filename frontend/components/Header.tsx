
import React from 'react';
import { Currency } from '../types';

interface HeaderProps {
    toggleTheme: () => void;
    isDark: boolean;
    title: string;
    currentCurrency: Currency;
    setCurrency: (c: Currency) => void;
    toggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ toggleTheme, isDark, title, currentCurrency, setCurrency, toggleSidebar }) => {
    return (
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-2 border-b border-gray-200 dark:border-border-dark bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md px-6 transition-colors duration-300">
            <div className="flex items-center gap-2">
                <button 
                    onClick={toggleSidebar}
                    className="p-2 text-gray-600 dark:text-white rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                >
                    <span className="material-symbols-outlined">menu</span>
                </button>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h1>
            </div>

            <div className="flex items-center gap-3 md:gap-4">
                {/* Quick Add Button */}
                <button className="hidden md:flex cursor-pointer items-center justify-center rounded-lg h-9 bg-primary hover:bg-green-400 text-surface-dark gap-2 text-sm font-bold leading-normal tracking-wide px-4 transition-colors shadow-lg shadow-green-900/20">
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    <span>快速記帳</span>
                </button>

                {/* Currency Toggle */}
                <div className="flex items-center gap-0.5 border border-gray-300 dark:border-border-dark rounded-lg p-1 bg-white dark:bg-surface-dark/50">
                    <button 
                        onClick={() => setCurrency(Currency.USD)}
                        className={`px-2 py-0.5 rounded text-xs font-semibold transition-colors ${currentCurrency === Currency.USD ? 'bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                    >
                        USD
                    </button>
                    <button 
                         onClick={() => setCurrency(Currency.TWD)}
                         className={`px-2 py-0.5 rounded text-xs font-semibold transition-colors ${currentCurrency === Currency.TWD ? 'bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                    >
                        TWD
                    </button>
                </div>

                {/* Theme Toggle */}
                <button 
                    onClick={toggleTheme}
                    className="p-2 text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                    aria-label="Toggle Theme"
                >
                    <span className="material-symbols-outlined fill-current">
                        {isDark ? 'light_mode' : 'dark_mode'}
                    </span>
                </button>

                {/* Profile */}
                <button className="p-0 ml-1 overflow-hidden rounded-full border-2 border-transparent hover:border-primary transition-colors">
                    <img 
                        src="https://picsum.photos/100/100" 
                        alt="User" 
                        className="w-9 h-9 object-cover"
                    />
                </button>
            </div>
        </header>
    );
};
