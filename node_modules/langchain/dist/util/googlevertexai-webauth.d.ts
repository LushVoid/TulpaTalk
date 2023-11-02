import { Credentials } from "web-auth-library/google";
import type { GoogleAbstractedClient } from "../types/googlevertexai-types.js";
export type WebGoogleAuthOptions = {
    credentials: string | Credentials;
    scope?: string | string[];
    accessToken?: string;
};
export declare class WebGoogleAuth implements GoogleAbstractedClient {
    options: WebGoogleAuthOptions;
    constructor(options?: WebGoogleAuthOptions);
    getProjectId(): Promise<string>;
    request(opts: {
        url?: string;
        method?: string;
        data?: unknown;
    }): Promise<{
        data: any;
        config: {};
        status: number;
        statusText: string;
        headers: Headers;
        request: {
            responseURL: string;
        };
    }>;
}
