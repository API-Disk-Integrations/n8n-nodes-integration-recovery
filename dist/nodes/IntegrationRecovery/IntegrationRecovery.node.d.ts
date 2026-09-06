import { handleChecksResponse } from "../../shared/safe-response.js";
export declare class IntegrationRecovery {
    description: {
        displayName: string;
        name: string;
        icon: string;
        group: string[];
        version: number;
        subtitle: string;
        description: string;
        defaults: {
            name: string;
        };
        usableAsTool: boolean;
        inputs: string[];
        outputs: string[];
        credentials: {
            name: string;
            required: boolean;
        }[];
        requestDefaults: {
            baseURL: string;
            headers: {
                Accept: string;
                "Content-Type": string;
            };
        };
        properties: ({
            displayName: string;
            name: string;
            type: string;
            noDataExpression: boolean;
            options: {
                name: string;
                value: string;
                action: string;
                description: string;
                routing: {
                    request: {
                        method: string;
                        url: string;
                        timeout: number;
                        returnFullResponse: boolean;
                        ignoreHttpStatusErrors: boolean;
                    };
                    output: {
                        postReceive: (typeof handleChecksResponse)[];
                    };
                };
            }[];
            default: string;
            required?: undefined;
            description?: undefined;
            displayOptions?: undefined;
            routing?: undefined;
        } | {
            displayName: string;
            name: string;
            type: string;
            noDataExpression: boolean;
            options: {
                name: string;
                value: string;
            }[];
            default: string;
            required?: undefined;
            description?: undefined;
            displayOptions?: undefined;
            routing?: undefined;
        } | {
            displayName: string;
            name: string;
            type: string;
            required: boolean;
            default: string;
            description: string;
            displayOptions: {
                show: {
                    inputMode: string[];
                };
            };
            routing: {
                request: {
                    body: {
                        check: string;
                        checks?: undefined;
                    };
                };
            };
            noDataExpression?: undefined;
            options?: undefined;
        } | {
            displayName: string;
            name: string;
            type: string;
            required: boolean;
            default: string;
            description: string;
            displayOptions: {
                show: {
                    inputMode: string[];
                };
            };
            routing: {
                request: {
                    body: {
                        checks: string;
                        check?: undefined;
                    };
                };
            };
            noDataExpression?: undefined;
            options?: undefined;
        } | {
            displayName: string;
            name: string;
            type: string;
            default: string;
            noDataExpression?: undefined;
            options?: undefined;
            required?: undefined;
            description?: undefined;
            displayOptions?: undefined;
            routing?: undefined;
        })[];
    };
}
