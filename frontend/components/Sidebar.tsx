
import React from 'react';
import { MENU_ITEMS } from '../constants';

interface SidebarProps {
    activeTab: string;
    onTabChange: (tabId: string) => void;
    isCollapsed: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, isCollapsed }) => {
    return (
        <aside 
            className={`hidden md:flex h-screen flex-col bg-white dark:bg-surface-dark border-r border-gray-200 dark:border-border-dark flex-shrink-0 sticky top-0 transition-all duration-300 ${
                isCollapsed ? 'w-20' : 'w-64'
            }`}
        >
            <div className="flex flex-col gap-4 flex-grow p-4">
                {/* Logo Area */}
                <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-2'} py-2 mb-2 overflow-hidden whitespace-nowrap`}>
                    <div className="rounded-full h-10 w-10 min-w-[2.5rem] bg-gradient-to-br from-primary to-green-800 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-green-900/20">
                        <img 
                           src="https://picsum.photos/40/40" 
                           alt="Logo" 
                           className="rounded-full w-10 h-10 object-cover opacity-80"
                        />
                    </div>
                    <div className={`flex flex-col transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                        <h1 className="text-gray-900 dark:text-white text-base font-bold leading-normal tracking-wide">ProfitFolio</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-xs font-normal leading-normal">Investment Tracker</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex flex-col gap-2">
                    {MENU_ITEMS.map((item) => {
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => onTabChange(item.id)}
                                title={isCollapsed ? item.label : ''}
                                className={`flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-3'} py-2 rounded-lg transition-all duration-200 h-10 ${
                                    isActive
                                        ? 'bg-primary/10 dark:bg-primary/10 text-green-700 dark:text-primary'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
                                }`}
                            >
                                <span className="material-symbols-outlined text-2xl">{item.icon}</span>
                                <p className={`text-sm whitespace-nowrap overflow-hidden transition-all duration-300 ${
                                    isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
                                } ${isActive ? 'font-bold' : 'font-medium'} leading-normal`}>
                                    {item.label}
                                </p>
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Bottom Section */}
            <div className="p-4 border-t border-gray-200 dark:border-border-dark flex flex-col gap-2">
                <button 
                    title={isCollapsed ? 'Settings' : ''}
                    className={`flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-3'} py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors h-10`}
                >
                    <span className="material-symbols-outlined text-2xl">settings</span>
                    <p className={`text-sm font-medium leading-normal whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                        Settings
                    </p>
                </button>
            </div>
        </aside>
    );
};
