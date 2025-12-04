
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { Portfolios } from './components/Portfolios';
import { PortfolioDetails } from './components/PortfolioDetails';
import { Accounts } from './components/Accounts';
import { Transactions } from './components/Transactions';
import { Assets } from './components/Assets';
import { Currency, MenuItem } from './types';
import { MENU_ITEMS } from './constants';

const App: React.FC = () => {
    const [darkMode, setDarkMode] = useState<boolean>(true);
    const [activeTab, setActiveTab] = useState<string>('dashboard');
    const [currency, setCurrency] = useState<Currency>(Currency.USD);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
    const [selectedPortfolioId, setSelectedPortfolioId] = useState<string | null>(null);

    // Initial Theme Setup
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    const toggleTheme = () => {
        setDarkMode(!darkMode);
    };

    const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    // Reset portfolio selection when changing tabs
    const handleTabChange = (tabId: string) => {
        setActiveTab(tabId);
        setSelectedPortfolioId(null);
    };

    const getTitle = () => {
        const item = MENU_ITEMS.find(i => i.id === activeTab);
        return item ? item.label : 'Dashboard';
    }

    // Basic Router Switch
    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <Dashboard onNavigateToTransactions={() => handleTabChange('transactions')} />;
            case 'portfolios':
                if (selectedPortfolioId) {
                    // Render Detail View without Header since Detail View has its own breadcrumb header
                    return <PortfolioDetails portfolioId={selectedPortfolioId} onBack={() => setSelectedPortfolioId(null)} />;
                }
                return <Portfolios onViewDetails={(id) => setSelectedPortfolioId(id)} />;
            case 'accounts':
                return <Accounts />;
            case 'transactions':
                return <Transactions />;
            case 'assets':
                return <Assets />;
            default:
                return (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                        <span className="material-symbols-outlined text-6xl mb-4 opacity-50">construction</span>
                        <h2 className="text-xl font-bold">Work in Progress</h2>
                        <p className="mt-2">The {activeTab} view is currently under development.</p>
                    </div>
                );
        }
    };

    return (
        <div className="flex h-screen w-full bg-background-light dark:bg-background-dark text-gray-900 dark:text-white font-sans transition-colors duration-300">
            {/* Navigation Drawer */}
            <Sidebar 
                activeTab={activeTab} 
                onTabChange={handleTabChange} 
                isCollapsed={isSidebarCollapsed}
            />

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
                {/* App Bar - Only show if NOT in Portfolio Details view (as it has its own header) */}
                {!(activeTab === 'portfolios' && selectedPortfolioId) && (
                    <Header 
                        toggleTheme={toggleTheme} 
                        isDark={darkMode} 
                        title={getTitle()}
                        currentCurrency={currency}
                        setCurrency={setCurrency}
                        toggleSidebar={toggleSidebar}
                    />
                )}

                {/* Scrollable View */}
                <div className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
};

export default App;
