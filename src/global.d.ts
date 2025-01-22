export {};

declare global {
    interface Window {
        ethereum?: any; 
    }
}

declare module "@mysten/sui.js" {
    export class JsonRpcProvider {
        constructor(endpoint?: string);
        request(method: string, params?: any[]): Promise<any>;
    }
}

