
import { Asset, Account } from '../types';
import { ASSETS_DATA, ACCOUNTS_DATA } from '../constants';

// 定義 API 預期的回傳格式
// 假設後端回傳的 JSON 結構直接是一個 Asset 陣列
// GET /v1/assets
export type AssetsApiResponse = Asset[];

// GET /v1/accounts
export type AccountsApiResponse = Account[];

/**
 * 從後端取得資產列表
 * 如果 API 失敗，則回傳假資料 (Mock Data)
 */
export const fetchAssets = async (): Promise<Asset[]> => {
    try {
        // 這裡假設 API 路徑是 /v1/assets
        // 在實際環境中，你可能會有環境變數如 process.env.REACT_APP_API_URL
        const response = await fetch('/v1/assets', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data: AssetsApiResponse = await response.json();
        return data;

    } catch (error) {
        console.warn("Failed to fetch assets from API, falling back to mock data.", error);
        
        // 模擬網路延遲，讓體驗更真實 (Optional)
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(ASSETS_DATA);
            }, 500); 
        });
    }
};

/**
 * 從後端取得帳戶列表
 * 如果 API 失敗，則回傳假資料 (Mock Data)
 */
export const fetchAccounts = async (): Promise<Account[]> => {
    try {
        // 這裡假設 API 路徑是 /v1/accounts
        const response = await fetch('/v1/accounts', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data: AccountsApiResponse = await response.json();
        return data;

    } catch (error) {
        console.warn("Failed to fetch accounts from API, falling back to mock data.", error);
        
        // 模擬網路延遲，讓體驗更真實
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(ACCOUNTS_DATA);
            }, 600); 
        });
    }
};
